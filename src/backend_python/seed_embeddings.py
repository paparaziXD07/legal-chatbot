"""
============================================================
 Script: Seed / Compute Vector Embeddings for Supabase laws
 Reads all 47+ laws from Supabase DB, computes OpenAI 1536-dim
 embeddings, and updates the `embedding` column in Supabase.
============================================================
"""

import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import openai
from supabase import create_client, Client

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SECRET_KEY")
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env")
    sys.exit(1)

if not OPENAI_KEY or OPENAI_KEY.startswith("your_"):
    print("❌ Error: OPENAI_API_KEY is not configured in .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = openai.OpenAI(api_key=OPENAI_KEY)

def seed_embeddings():
    print("=" * 60)
    print("⚡ Starting Vector Embedding Generation for Legal Knowledge Base")
    print(f"📦 Model: {EMBEDDING_MODEL} (1536 dimensions)")
    print(f"🗄️ Database: Supabase pgvector ({SUPABASE_URL})")
    print("=" * 60)

    # 1. Fetch all laws
    response = supabase.from_("laws").select("id, cat, section, title, text, simple, keywords, penalty").order("id").execute()
    laws = response.data or []
    total = len(laws)

    if total == 0:
        print("⚠️ No law records found in table 'laws'. Please make sure the table has seed data.")
        return

    print(f"📚 Found {total} law records in Supabase. Processing embeddings...\n")

    success_count = 0
    fail_count = 0

    for idx, law in enumerate(laws, start=1):
        law_id = law["id"]
        section = law.get("section", f"ID {law_id}")
        title = law.get("title", "")
        simple = law.get("simple", "")
        text = law.get("text", "")
        keywords = ", ".join(law.get("keywords") or [])
        penalty = law.get("penalty", "")

        # Format descriptive text for embedding representation
        content_to_embed = (
            f"หมวดหมู่: {'PDPA พ.ศ. 2562' if law.get('cat') == 'pdpa' else 'พ.ร.บ.คอมพิวเตอร์'} | "
            f"มาตรา: {section} | "
            f"ชื่อมาตรา: {title} | "
            f"สาระสำคัญ: {simple} | "
            f"ตัวบท: {text} | "
            f"บทกำหนดโทษ: {penalty} | "
            f"คำสำคัญ: {keywords}"
        )

        try:
            emb_resp = openai_client.embeddings.create(
                input=[content_to_embed],
                model=EMBEDDING_MODEL
            )
            vector = emb_resp.data[0].embedding

            # Update Supabase law row
            update_resp = supabase.from_("laws").update({"embedding": vector}).eq("id", law_id).execute()
            
            print(f"[{idx}/{total}] ✅ {section} — {title[:35]} (Dimensions: {len(vector)})")
            success_count += 1
            time.sleep(0.05)  # gentle rate limit
        except Exception as err:
            print(f"[{idx}/{total}] ❌ Failed for {section}: {err}")
            fail_count += 1

    print("\n" + "=" * 60)
    print(f"🎉 Embedding generation finished!")
    print(f"✅ Successful: {success_count} / {total}")
    if fail_count > 0:
        print(f"⚠️ Failed: {fail_count}")
    print("=" * 60)

if __name__ == "__main__":
    seed_embeddings()
