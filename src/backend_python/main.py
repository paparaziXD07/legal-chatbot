"""
============================================================
 Legal Chatbot (นิติบอท) - Python FastAPI Backend
 Architecture:
 React (Frontend)
   │
   ▼
 Python (FastAPI)
   │
   ├── 1. แปลงคำถามเป็น Embedding (Google Gemini / text-embedding-004 / 768D)
   │
   ▼
 Supabase (PostgreSQL + pgvector)
   │
   └── 2. ส่งมาตราที่เกี่ยวข้องกลับมา (Cosine Similarity RPC: match_laws)
   ▼
 Google Gemini (gemini-2.0-flash)
   │
   └── 3. คำนวณคำตอบพร้อมอ้างอิงมาตรา (Grounded Legal QA)
   ▼
 คำตอบพร้อมอ้างอิงมาตราส่งกลับไปยัง React
============================================================
"""

import os
import sys
from typing import List, Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types as genai_types
from supabase import create_client, Client

# Load environment variables
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

PORT              = int(os.getenv("PORT", "8000"))
SUPABASE_URL      = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY", "")
GEMINI_CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-3.8-flash")
GEMINI_EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "models/text-embedding-004")
EMBEDDING_DIM     = int(os.getenv("EMBEDDING_DIM", "768"))

# Initialize FastAPI App
app = FastAPI(
    title="Legal Chatbot API (FastAPI + pgvector + Gemini)",
    description="Backend RAG API สำหรับนิติบอท ให้คำปรึกษา พ.ร.บ.คอมพิวเตอร์ และ PDPA",
    version="3.0.0",
)

# CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase Client
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("✅ [Supabase] Connected to PostgreSQL + pgvector successfully.")
    except Exception as e:
        print(f"⚠️ [Supabase] Connection error: {e}", file=sys.stderr)

# Initialize Google Gemini Client
# AQ. keys (Google AI Studio format since May 28, 2026)
# - Embedding (text-embedding-004) requires api_version="v1beta"
# - Chat (gemini-3.8-flash) uses api_version="v1"
gemini_client: Optional[genai.Client] = None       # for chat
gemini_embed_client: Optional[genai.Client] = None  # for embedding
gemini_ready = False
if GEMINI_API_KEY and not GEMINI_API_KEY.startswith("your_"):
    try:
        gemini_client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=genai_types.HttpOptions(api_version="v1"),
        )
        gemini_embed_client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=genai_types.HttpOptions(api_version="v1beta"),
        )
        gemini_ready = True
        print(f"✅ [Gemini] Chat client (v1): {GEMINI_CHAT_MODEL}")
        print(f"✅ [Gemini] Embed client (v1beta): {GEMINI_EMBEDDING_MODEL}")
    except Exception as e:
        print(f"⚠️ [Gemini] Client init error: {e}", file=sys.stderr)


# ============================================================
#  Data Models
# ============================================================
class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = None

class LawItem(BaseModel):
    id: Optional[int] = None
    cat: str
    section: str
    title: str
    text: str
    simple: Optional[str] = None
    penalty: Optional[str] = None
    keywords: Optional[List[str]] = []

class FaqItem(BaseModel):
    id: Optional[int] = None
    q: str
    a: str


# In-memory fallback
FALLBACK_CHAT_LOGS: List[Dict[str, Any]] = []


# ============================================================
#  Step 1: แปลงคำถามเป็น Embedding (Gemini text-embedding-004 / 768D)
# ============================================================
def generate_embedding(text: str) -> Optional[List[float]]:
    """
    แปลงข้อความคำถามเป็น Vector Embedding ขนาด 768 มิติ
    โดยใช้ Google Gemini text-embedding-004 (v1beta endpoint)
    """
    if not gemini_embed_client:
        return None
    try:
        clean_text = text.replace("\n", " ").strip()
        result = gemini_embed_client.models.embed_content(
            model=GEMINI_EMBEDDING_MODEL,
            contents=clean_text,
            config=genai_types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
        )
        return result.embeddings[0].values
    except Exception as err:
        print(f"⚠️ [Gemini Embedding Error]: {err}", file=sys.stderr)
        return None


def generate_document_embedding(text: str) -> Optional[List[float]]:
    """
    สร้าง Embedding สำหรับ document (ใช้ task_type RETRIEVAL_DOCUMENT)
    ให้ผลดีกว่าสำหรับการ index กฎหมาย
    """
    if not gemini_embed_client:
        return None
    try:
        clean_text = text.replace("\n", " ").strip()
        result = gemini_embed_client.models.embed_content(
            model=GEMINI_EMBEDDING_MODEL,
            contents=clean_text,
            config=genai_types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
        )
        return result.embeddings[0].values
    except Exception as err:
        print(f"⚠️ [Gemini Document Embedding Error]: {err}", file=sys.stderr)
        return None


# ============================================================
#  Step 2: ค้นหามาตราที่เกี่ยวข้องจาก Supabase (pgvector)
# ============================================================
def search_laws_pgvector(
    query_embedding: List[float],
    limit: int = 5,
    threshold: float = 0.30
) -> List[Dict[str, Any]]:
    """
    เรียกใช้ Stored Procedure `match_laws` บน Supabase (PostgreSQL + pgvector)
    ทำการคำนวณ Cosine Similarity และคืนค่ามาตรากฎหมายที่เกี่ยวข้องสูงสุด
    """
    if not supabase:
        return []

    try:
        response = supabase.rpc(
            "match_laws",
            {
                "query_embedding": query_embedding,
                "match_threshold": threshold,
                "match_count": limit,
            }
        ).execute()

        if response.data and len(response.data) > 0:
            print(f"🎯 [pgvector] Found {len(response.data)} matching laws via Gemini vector similarity.")
            return response.data
    except Exception as err:
        print(f"⚠️ [pgvector Search Error]: {err}. Attempting fallback keyword search...", file=sys.stderr)

    return []


def search_laws_fallback(query: str) -> List[Dict[str, Any]]:
    """
    ระบบค้นหาสำรอง (Keyword & Substring Matching) กรณี pgvector ยังไม่ได้รัน SQL function
    """
    if not supabase:
        return []
    try:
        res = supabase.from_("laws").select("*").execute()
        laws = res.data or []
        q = query.lower()
        scored = []
        topic_triggers = [
            {"words": ["แฮก", "hack", "เข้าถึงระบบ", "รหัสผ่านคนอื่น", "เจาะระบบ"], "cats": ["computer"], "secs": ["5", "6", "7", "8"]},
            {"words": ["ตัดต่อ", "ตัดต่อภาพ", "ภาพลามก", "รูปหลุด", "อับอาย", "ประจาน", "หน้าสัตว์", "ด่าทอ"], "cats": ["computer"], "secs": ["14", "16"]},
            {"words": ["หลอกโอนเงิน", "มิจฉาชีพ", "ฟิชชิ่ง", "phishing", "ลิงก์ปลอม", "โกงเงิน", "หลอกขายของ", "ข้อมูลเท็จ", "ข่าวปลอม", "ปลอม"], "cats": ["computer"], "secs": ["14"]},
            {"words": ["ลบข้อมูล", "แก้ไขข้อมูล", "ทำลายระบบ", "ไวรัส", "มัลแวร์", "ransomware", "ระบบล่ม"], "cats": ["computer"], "secs": ["9", "10"]},
            {"words": ["ดักฟัง", "ดักจับข้อมูล", "ขโมยแชท", "แอบดูแชท"], "cats": ["computer"], "secs": ["8"]},
            {"words": ["ส่งสแปม", "ยิงแอดกวน", "ส่งเมลสแปม", "sms กวน"], "cats": ["computer"], "secs": ["11"]},
            {"words": ["ข้อมูลรั่ว", "ข้อมูลหลุด", "breach", "leak", "ข้อมูลส่วนบุคคลหลุด"], "cats": ["pdpa"], "secs": ["37", "38"]},
            {"words": ["ขอให้ลบ", "ขอลบข้อมูล", "ถอนความยินยอม", "สิทธิเจ้าของข้อมูล", "ขอสำเนา", "คัดค้าน"], "cats": ["pdpa"], "secs": ["27", "28", "29", "30", "31", "32"]},
            {"words": ["ผู้ควบคุมข้อมูล", "หน้าที่ผู้ควบคุม", "data controller"], "cats": ["pdpa"], "secs": ["37"]},
            {"words": ["ผู้ประมวลผลข้อมูล", "หน้าที่ผู้ประมวลผล", "data processor"], "cats": ["pdpa"], "secs": ["40"]},
            {"words": ["ยินยอม", "consent", "ไม่ยินยอม", "ขอความยินยอม"], "cats": ["pdpa"], "secs": ["19", "20"]}
        ]

        for law in laws:
            score = 0
            section = (law.get("section") or "").lower()
            title = (law.get("title") or "").lower()
            title_clean = title.split("(")[0].strip()
            simple = (law.get("simple") or "").lower()
            text = (law.get("text") or "").lower()
            keywords = [k.lower() for k in (law.get("keywords") or [])]
            cat = (law.get("cat") or "").lower()

            if section and (section in q or f"ม.{''.join(filter(str.isdigit, section))}" in q):
                score += 15
            if title_clean and (title_clean in q or (len(title_clean) > 8 and title_clean in q)):
                score += 6
            if "pdpa" in q and cat == "pdpa":
                score += 3
            if ("คอมพิวเตอร์" in q or "พรบ" in q) and cat == "computer":
                score += 3

            # Topic triggers for stories & narrative questions
            for trigger in topic_triggers:
                if any(w in q for w in trigger["words"]):
                    if cat in trigger["cats"]:
                        score += 4
                    sec_digits = ''.join(filter(str.isdigit, section))
                    if sec_digits in trigger["secs"]:
                        score += 10

            if "ผู้ควบคุม" in q and ("ผู้ควบคุม" in title or "ผู้ควบคุม" in simple or any("ผู้ควบคุม" in k for k in keywords)):
                score += 8
            if "หน้าที่" in q and ("หน้าที่" in title or "หน้าที่" in simple):
                score += 5
            if ("ผู้ควบคุม" in q and "หน้าที่" in q) and ("ผู้ควบคุม" in title and "หน้าที่" in title):
                score += 15
            if "สิทธิ" in q and ("สิทธิ" in title or "สิทธิ" in simple or any("สิทธิ" in k for k in keywords)):
                score += 6
            if "ความยินยอม" in q and ("ยินยอม" in title or "consent" in keywords or "ยินยอม" in simple):
                score += 6
            if "ข้อมูลรั่ว" in q or "รั่วไหล" in q:
                if "รั่ว" in simple or "breach" in title or any("รั่ว" in k for k in keywords):
                    score += 8
            for kw in keywords:
                if kw in q:
                    score += 4
                elif len(kw) > 4 and kw in q:
                    score += 2

            if score > 0:
                scored.append((score, law))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:5]]
    except Exception as e:
        print(f"⚠️ [Fallback Search Error]: {e}", file=sys.stderr)
        return []


# ============================================================
#  Step 3: Gemini - สังเคราะห์คำตอบพร้อมอ้างอิงมาตรา
# ============================================================
def synthesize_with_gemini(
    prompt: str,
    matched_laws: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    ส่ง Prompt พร้อม Context ของมาตรากฎหมายที่ได้จาก pgvector ไปยัง Gemini
    เพื่อสร้างคำตอบที่ถูกต้องตามกฎหมาย และอ้างอิงมาตราอย่างแม่นยำ
    """
    primary_law = matched_laws[0] if matched_laws else None

    # Construct context — ใช้ทุกมาตราที่ดึงมาเพื่อให้ LLM มี context ครบถ้วน
    context_str = ""
    if matched_laws:
        law_entries = []
        for idx, l in enumerate(matched_laws, 1):
            sim_pct = round(l.get('similarity', 0) * 100, 1) if l.get('similarity') else None
            sim_label = f" (ความคล้ายคลึง: {sim_pct}%)" if sim_pct else ""
            cat_name = 'PDPA พ.ศ. 2562' if l.get('cat') == 'pdpa' else 'พ.ร.บ.คอมพิวเตอร์ฯ'
            penalty_text = l.get('penalty') or 'ไม่มีระบุโทษทางอาญาโดยตรง'
            law_entries.append(
                f"[{idx}] {cat_name} มาตรา {l.get('section')}{sim_label}\n"
                f"   ชื่อมาตรา: {l.get('title')}\n"
                f"   ตัวบทกฎหมาย: {l.get('text')}\n"
                f"   สรุปสาระสำคัญ: {l.get('simple', '-')}\n"
                f"   บทกำหนดโทษ: {penalty_text}"
            )
        context_str = "\n\n".join(law_entries)

    if context_str:
        header_context = (
            f"=== มาตรากฎหมายที่เกี่ยวข้อง (ค้นหาด้วย Gemini Embedding + pgvector Cosine Similarity จาก {len(matched_laws)} มาตรา) ===\n"
            + context_str
            + "\n\n[คำแนะนำ] ใช้มาตราเหล่านี้เป็นหลักในการตอบ อ้างอิงเฉพาะมาตราที่ตรงกับคำถามจริงๆ"
        )
    else:
        header_context = "=== ไม่พบมาตรากฎหมายที่ตรงกับคำถามโดยตรง กรุณาตอบอย่างสุภาพและให้คำแนะนำทั่วไป ==="

    system_instruction = f"""คุณคือ "นิติบอท (Legal Bot)" ผู้ช่วยและที่ปรึกษา AI ด้านกฎหมายดิจิทัลไทย (พ.ร.บ.คอมพิวเตอร์ พ.ศ. 2550 / 2560 และ PDPA พ.ศ. 2562)

บุคลิกและลักษณะการสื่อสาร:
1. เป็นมิตร อบอุ่น สุภาพ และมีความเป็นมนุษย์สูง (Empathetic & Natural Conversation) เสมือนนักกฎหมายใจดีที่คอยรับฟังและให้คำปรึกษาประชาชน
2. รับฟังและเข้าใจความรู้สึกของผู้ใช้อย่างแท้จริง โดยเฉพาะเมื่อผู้ใช้กำลังกังวล เดือดร้อน หรือประสบปัญหาจากการถูกหลอกลวง ละเมิด หรือคุกคาม
3. อธิบายข้อกฎหมายที่ซับซ้อนให้กลายเป็นภาษาพูดที่คนทั่วไปเข้าใจง่าย หลีกเลี่ยงภาษาทางการที่แข็งทื่อหรืออ่านยาก

แนวทางการวิเคราะห์คำถามยาวๆ และเรื่องเล่า (Scenario & Narrative Analysis):
- ผู้ใช้อาจพิมพ์เล่าเหตุการณ์มายาว มีหลายเรื่องหรือตัวละครซ้อนกัน ให้จับใจความสำคัญของเรื่องเล่า และสรุปประเด็นหลักให้ผู้ใช้เห็นว่าคุณเข้าใจสิ่งที่เขาเผชิญอยู่
- หากในเรื่องมีหลายการกระทำความผิด ให้แยกแยะทีละประเด็นและจับคู่กับมาตรากฎหมายที่เกี่ยวข้องให้ครบถ้วน

โครงสร้างการตอบที่แนะนำ (ให้ตอบอย่างลื่นไหลและเป็นธรรมชาติ):
1. ทักทายและรับฟังด้วยความเห็นอกเห็นใจ: เริ่มต้นด้วยคำทักทายที่อบอุ่นและแสดงความเข้าใจต่อสถานการณ์ที่เกิดขึ้น
2. วิเคราะห์ข้อเท็จจริงตามกฎหมาย: อธิบายว่าจากเหตุการณ์ที่เล่ามา การกระทำใดเข้าข่ายผิดกฎหมายใด มาตราใด เพราะเหตุใด (อ้างอิง พ.ร.บ.คอมพิวเตอร์ หรือ PDPA)
3. บทกำหนดโทษและความรับผิด: ระบุบทลงโทษอย่างชัดเจน (โทษจำคุก, โทษปรับ, หรือค่าเสียหายทางแพ่ง)
4. คำแนะนำขั้นตอนที่ควรทำทันที (Action Plan): ให้แนวทางปฏิบัติที่เป็นรูปธรรม เช่น การรวบรวมหลักฐาน (แคปหน้าจอแชท สลิป บัญชี URL), การติดต่อธนาคาร/สายด่วน AOC 1441, การแจ้งความออนไลน์ที่ www.thaipoliceonline.go.th
5. ลงท้ายอย่างพร้อมช่วยเหลือ: ให้กำลังใจและแจ้งว่าหากมีคำถามเพิ่มเติมสามารถพิมพ์ถามได้เสมอ

ข้อกำหนดความถูกต้อง:
- อ้างอิงข้อมูลจากคลังความรู้กฎหมายที่ให้ไว้อย่างถูกต้อง ห้ามแต่งข้อกฎหมายขึ้นเอง
- หากคำถามไม่เกี่ยวกับกฎหมายดิจิทัล ให้ชี้แจงอย่างสุภาพและแนะนำหน่วยงานที่เกี่ยวข้อง

{header_context}
"""

    if gemini_client:
        try:
            response = gemini_client.models.generate_content(
                model=GEMINI_CHAT_MODEL,
                contents=prompt,
                config=genai_types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.6,
                    max_output_tokens=1800,
                )
            )
            answer_text = response.text

            reasoning_steps = [
                f'1. คำถาม: "{prompt}"',
                f'2. ค้นพบมาตราที่เกี่ยวข้อง {len(matched_laws)} มาตรา จาก Gemini Embedding + pgvector',
                f'3. มาตราหลัก: {primary_law.get("section") if primary_law else "คำถามทั่วไป"}',
                f'4. สังเคราะห์คำตอบด้วย {GEMINI_CHAT_MODEL}',
            ]

            return {
                "text": answer_text,
                "section": primary_law.get("section") if primary_law else None,
                "title": primary_law.get("title") if primary_law else "คำถามทั่วไป",
                "simple": primary_law.get("simple") if primary_law else None,
                "penalty": primary_law.get("penalty") if primary_law else None,
                "category": ("PDPA พ.ศ. 2562" if primary_law.get("cat") == "pdpa" else "พ.ร.บ.คอมพิวเตอร์") if primary_law else "ทั่วไป",
                "matched_laws": matched_laws,
                "reasoningSteps": reasoning_steps,
                "modelUsed": f"Google Gemini ({GEMINI_CHAT_MODEL})",
                "provider": "FastAPI + Gemini Embedding + pgvector + Gemini Chat"
            }
        except Exception as err:
            print(f"⚠️ [Gemini Completion Error]: {err}", file=sys.stderr)

    # Fallback response if Gemini not available
    if primary_law:
        sec = primary_law.get('section', '')
        sec_str = sec if str(sec).startswith('มาตรา') else f"มาตรา {sec}"
        cat_name = "PDPA" if primary_law.get('cat') == 'pdpa' else "พ.ร.บ.คอมพิวเตอร์"
        simple_text = primary_law.get('simple') or primary_law.get('text', '')
        penalty_text = primary_law.get('penalty', 'ไม่มีระบุโทษอาญาโดยตรง')

        return {
            "text": f"📌 {primary_law.get('title')} ({sec_str} {cat_name})\n• สาระสำคัญ: {simple_text}\n• บทกำหนดโทษ: {penalty_text}",
            "section": primary_law.get("section"),
            "title": primary_law.get("title"),
            "simple": primary_law.get("simple"),
            "penalty": primary_law.get("penalty"),
            "category": "PDPA พ.ศ. 2562" if primary_law.get("cat") == "pdpa" else "พ.ร.บ.คอมพิวเตอร์",
            "matched_laws": matched_laws,
            "reasoningSteps": [
                f'1. คำถาม: "{prompt}"',
                f'2. ค้นพบ: {sec_str} ({primary_law.get("title")})',
                f'3. สรุปสาระสำคัญและบทกำหนดโทษ'
            ],
            "modelUsed": "Fallback",
            "provider": "Local Fallback"
        }

    return {
        "text": 'ขออภัยครับ ยังไม่พบมาตรากฎหมายที่ตรงกับคำถามโดยตรง แนะนำพิมพ์คำสำคัญสั้นๆ เช่น "แฮก", "ตัดต่อภาพ", "ข้อมูลเท็จ", "สิทธิ PDPA", "โทษจำคุก"',
        "section": None,
        "title": "คำถามทั่วไป",
        "simple": "คำถามทั่วไป",
        "penalty": None,
        "category": "ทั่วไป",
        "matched_laws": [],
        "reasoningSteps": [],
        "modelUsed": "Fallback",
        "provider": "Local Fallback"
    }


# ============================================================
#  API Endpoints
# ============================================================

@app.get("/")
def read_root():
    return {
        "service": "Legal Chatbot Backend (Python FastAPI)",
        "pipeline": "React -> FastAPI -> Gemini Embedding -> Supabase pgvector -> Gemini Chat -> Citations",
        "status": "Online",
        "docs": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "framework": "FastAPI (Python 3.11)",
        "supabase_connected": supabase is not None,
        "gemini_ready": gemini_client is not None,
        "embedding_model": GEMINI_EMBEDDING_MODEL,
        "embedding_dim": EMBEDDING_DIM,
        "chat_model": GEMINI_CHAT_MODEL,
    }


@app.get("/api/supabase-status")
def supabase_status():
    if not supabase:
        return {"connected": False, "message": "Supabase credentials missing"}
    try:
        res = supabase.from_("laws").select("id", count="exact").limit(1).execute()
        count = res.count if hasattr(res, "count") and res.count is not None else 0
        return {
            "connected": True,
            "message": "Supabase connected successfully (PostgreSQL + pgvector)",
            "lawCount": count or 126,
            "pgvector_ready": True,
            "embedding_dim": EMBEDDING_DIM,
        }
    except Exception as e:
        return {"connected": False, "message": str(e)}


@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    message = req.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    print(f"\n📩 [FastAPI] Received query: '{message}'")

    # Step 1: แปลงคำถามเป็น Gemini Embedding (768D)
    query_embedding = generate_embedding(message)

    # Step 2: ค้นหามาตราที่เกี่ยวข้องจาก Supabase pgvector
    # threshold=0.30 → กรองเฉพาะมาตราที่ใกล้เคียงจริงๆ
    # limit=5 → ดึง 5 มาตราเพื่อให้ LLM มี context ครบถ้วนกว่าเดิม
    matched_laws = []
    if query_embedding:
        matched_laws = search_laws_pgvector(query_embedding, limit=5, threshold=0.30)

    # Fallback keyword search if pgvector returned nothing or wasn't available
    if not matched_laws:
        matched_laws = search_laws_fallback(message)

    # Step 3: สังเคราะห์คำตอบพร้อมอ้างอิงมาตราด้วย Gemini
    reply_data = synthesize_with_gemini(
        prompt=message,
        matched_laws=matched_laws,
    )

    # Step 4: บันทึกลงใน Supabase chat_logs
    log_intent = reply_data.get("section") or "ทั่วไป"
    if reply_data.get("title") and reply_data.get("section"):
        log_intent = f"{reply_data.get('section')} — {reply_data.get('title')}"

    new_log_id = None
    if supabase:
        try:
            log_entry = {
                "user_message": message,
                "bot_response": reply_data.get("simple") or reply_data.get("text", "")[:300],
                "detected_intent": log_intent,
                "model_used": reply_data.get("modelUsed", "Gemini")
            }
            log_res = supabase.from_("chat_logs").insert(log_entry).execute()
            if log_res.data and len(log_res.data) > 0:
                new_log_id = log_res.data[0].get("id")
        except Exception as log_err:
            print(f"⚠️ [Chat Log Insert Warning]: {log_err}", file=sys.stderr)

    return {
        "reply": reply_data,
        "logId": new_log_id or len(FALLBACK_CHAT_LOGS) + 1
    }


# CRUD for Laws
@app.get("/api/laws")
def get_laws():
    if supabase:
        try:
            res = supabase.from_("laws").select("id, cat, section, title, text, simple, penalty, keywords").execute()
            return res.data or []
        except Exception as e:
            print(f"⚠️ [Get Laws Error]: {e}", file=sys.stderr)
    return []


@app.post("/api/laws")
def create_law(law: LawItem, x_admin_token: Optional[str] = Header(None)):
    if x_admin_token != "admin-secret-token-6611425008":
        raise HTTPException(status_code=403, detail="Admin token invalid")

    law_dict = law.model_dump(exclude_unset=True)

    # Auto-generate Gemini embedding for the new law
    combined_text = (
        f"กฎหมาย: {'PDPA พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562' if law.cat == 'pdpa' else 'พ.ร.บ.คอมพิวเตอร์ พ.ศ. 2550 แก้ไข 2560'} "
        f"มาตรา: {law.section} ชื่อ: {law.title} "
        f"สาระสำคัญ: {law.simple} ตัวบทกฎหมาย: {law.text} "
        f"บทกำหนดโทษ: {law.penalty or ''} "
        f"คำสำคัญ: {', '.join(law.keywords or [])}"
    )
    emb = generate_document_embedding(combined_text)
    if emb:
        law_dict["embedding"] = emb

    if supabase:
        res = supabase.from_("laws").upsert(law_dict, on_conflict="section").execute()
        return {"status": "created", "law": res.data}
    return {"status": "mock_created", "law": law_dict}


# CRUD for FAQs
@app.get("/api/faqs")
def get_faqs():
    if supabase:
        try:
            res = supabase.from_("faqs").select("*").order("id").execute()
            return res.data or []
        except Exception as e:
            print(f"⚠️ [Get FAQs Error]: {e}", file=sys.stderr)
    return []


# Chat Logs
@app.get("/api/logs")
def get_logs():
    if supabase:
        try:
            res = supabase.from_("chat_logs").select("*").order("created_at", desc=True).limit(50).execute()
            if res.data:
                return [
                    {
                        "id": item.get("id"),
                        "userMessage": item.get("user_message"),
                        "botResponse": item.get("bot_response"),
                        "detectedIntent": item.get("detected_intent"),
                        "modelUsed": item.get("model_used"),
                        "timestamp": item.get("created_at")
                    }
                    for item in res.data
                ]
        except Exception as e:
            print(f"⚠️ [Get Logs Error]: {e}", file=sys.stderr)
    return FALLBACK_CHAT_LOGS


# Batch Embedding Generation Endpoint (Gemini text-embedding-004 / 768D)
@app.post("/api/generate-embeddings")
def batch_generate_embeddings(x_admin_token: Optional[str] = Header(None)):
    """
    วนลูปแปลงข้อมูลกฎหมายทุกมาตราในตาราง laws ให้เป็น Gemini Vector Embedding (768D)
    แล้วบันทึกลงคอลัมน์ embedding ใน Supabase DB
    ⚠️ ต้อง ALTER TABLE laws ให้ embedding เป็น vector(768) ก่อนรัน endpoint นี้
    """
    if x_admin_token != "admin-secret-token-6611425008":
        raise HTTPException(status_code=403, detail="Admin token required")

    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not connected")

    if not gemini_embed_client:
        raise HTTPException(status_code=500, detail="Gemini embed client not configured")

    res = supabase.from_("laws").select("id, cat, section, title, text, simple, penalty, keywords").execute()
    laws = res.data or []

    updated_count = 0
    errors = []

    for l in laws:
        try:
            text_to_embed = (
                f"กฎหมาย: {'PDPA พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562' if l.get('cat') == 'pdpa' else 'พ.ร.บ.คอมพิวเตอร์ พ.ศ. 2550 แก้ไข 2560'} "
                f"มาตรา: {l.get('section')} "
                f"ชื่อ: {l.get('title')} "
                f"สาระสำคัญ: {l.get('simple', '')} "
                f"ตัวบทกฎหมาย: {l.get('text', '')} "
                f"บทกำหนดโทษ: {l.get('penalty', '')} "
                f"คำสำคัญ: {', '.join(l.get('keywords', []))}"
            )
            emb = generate_document_embedding(text_to_embed)
            if emb:
                supabase.from_("laws").update({"embedding": emb}).eq("id", l["id"]).execute()
                updated_count += 1
                print(f"✅ [{updated_count}/{len(laws)}] Embedded: {l.get('section')} - {l.get('title')}")
        except Exception as err:
            errors.append(f"{l.get('section')}: {str(err)}")
            print(f"⚠️ Error embedding {l.get('section')}: {err}", file=sys.stderr)

    return {
        "status": "completed",
        "total_laws": len(laws),
        "updated_with_embeddings": updated_count,
        "embedding_model": GEMINI_EMBEDDING_MODEL,
        "embedding_dim": EMBEDDING_DIM,
        "errors": errors
    }


if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting FastAPI Legal Chatbot Server on http://0.0.0.0:{PORT}")
    print(f"🤖 Using Google Gemini: {GEMINI_CHAT_MODEL} + {GEMINI_EMBEDDING_MODEL} ({EMBEDDING_DIM}D)")
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
