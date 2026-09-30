import React, { useState, useRef, useEffect } from 'react';
import { retrieve, QUICK_TOPICS, fetchLawsFromSupabase, saveChatLogToSupabase } from '../data/knowledgeBase';
import LegalSeal from './LegalSeal';
import { formatSection } from '../utils/lawUtils';


const EXPRESS_BASE = 'http://localhost:5000/api';
const API_BASE = EXPRESS_BASE;

/* ─── Inline styles for Pop Chat & Main Hero ─────────────────────────────── */
const s = {
  /* Hero / Main Page View when Chat Tab is selected */
  heroWrap: {
    padding: '30px 24px',
    background: '#FBF8F0',
    border: '1px solid #C9BBA0',
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(34,26,20,0.08)',
    marginTop: 20,
    animation: 'fade .25s ease'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 600,
    color: '#7A1F2B',
    background: '#F4E7CE',
    padding: '4px 12px',
    borderRadius: 20,
    fontFamily: "'IBM Plex Mono', monospace"
  },
  heroTitle: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 26,
    color: '#591622',
    margin: '12px 0 8px',
    fontWeight: 700
  },
  heroSubtitle: {
    fontSize: 14.5,
    color: '#4d4233',
    lineHeight: 1.6,
    maxWidth: 720,
    margin: '0 0 20px'
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
    marginBottom: 20
  },
  heroCard: {
    background: '#fff',
    border: '1px solid #E4D2A4',
    borderRadius: 8,
    padding: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
  },
  heroCardTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: '#7A1F2B',
    margin: '0 0 4px',
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  heroCardText: {
    fontSize: 12.5,
    color: '#665744',
    margin: 0,
    lineHeight: 1.45
  },
  openPopBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'linear-gradient(135deg, #7A1F2B 0%, #591622 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 30,
    padding: '10px 22px',
    fontSize: 14.5,
    fontWeight: 600,
    fontFamily: "'Noto Serif Thai', serif",
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(122,31,43,0.3)',
    transition: 'all .15s ease'
  },

  /* ─── Floating Pop Chat Styles ─── */
  launcherBtn: (isOpen) => ({
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: isOpen ? '12px 18px' : '14px 22px',
    background: 'linear-gradient(135deg, #7A1F2B 0%, #4A0E18 100%)',
    color: '#fff',
    border: '2px solid #E4D2A4',
    borderRadius: 36,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(122,31,43,0.35), 0 2px 8px rgba(0,0,0,0.2)',
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 15,
    fontWeight: 700,
    transition: 'all .25s cubic-bezier(0.16, 1, 0.3, 1)',
    animation: isOpen ? 'none' : 'pulseGlow 2.5s infinite'
  }),
  launcherIcon: {
    fontSize: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  popContainer: {
    position: 'fixed',
    bottom: 88,
    right: 24,
    width: 410,
    maxWidth: 'calc(100vw - 32px)',
    height: 600,
    maxHeight: 'calc(100vh - 110px)',
    zIndex: 9999,
    background: '#FBF8F0',
    border: '1px solid #C9BBA0',
    borderRadius: 16,
    boxShadow: '0 16px 48px rgba(34,26,20,0.25), 0 4px 16px rgba(122,31,43,0.12)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'popSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  popHead: {
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #591622 0%, #7A1F2B 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  popHeadTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  popTitle: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 16,
    margin: 0,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#fff'
  },
  popControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  iconBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: '#fff',
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 14,
    transition: 'background .15s ease'
  },
  singleModelBadge: {
    background: 'rgba(0,0,0,0.25)',
    padding: '4px 10px',
    borderRadius: 6,
    color: '#F4E7CE',
    fontSize: 11.5,
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  statusDot: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 10.5,
    color: '#D2F0DD',
    fontFamily: "'IBM Plex Mono', monospace"
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#4CAF50',
    display: 'inline-block',
    boxShadow: '0 0 0 2px rgba(76,175,80,.3)'
  },
  log: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    background: '#FBF8F0'
  },
  msgUser: {
    maxWidth: '85%',
    alignSelf: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4
  },
  msgBot: {
    maxWidth: '90%',
    alignSelf: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6
  },
  bubbleUser: {
    padding: '10px 14px',
    borderRadius: '14px 14px 2px 14px',
    fontSize: 13.8,
    lineHeight: 1.55,
    background: '#7A1F2B',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(122,31,43,0.15)'
  },
  bubbleBot: {
    padding: '12px 14px',
    borderRadius: '14px 14px 14px 2px',
    fontSize: 13.8,
    lineHeight: 1.6,
    background: '#fff',
    border: '1px solid #C9BBA0',
    color: '#221A14',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
  },
  modelTag: {
    fontSize: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    color: '#8a7a60',
    marginBottom: 4,
    display: 'inline-block',
    background: '#F0E6D2',
    padding: '2px 6px',
    borderRadius: 4
  },
  cotBox: {
    background: '#F7F3E9',
    border: '1px solid #D8CBB5',
    borderRadius: 6,
    padding: '6px 10px',
    marginTop: 6,
    fontSize: 11.5,
    color: '#4d4233',
    fontFamily: "'Sarabun', sans-serif"
  },
  cotSummary: {
    fontSize: 11,
    fontWeight: 600,
    color: '#8a7a60',
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  cotHeader: {
    fontSize: 10.5,
    fontWeight: 700,
    color: '#B98A3D',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    marginBottom: 3,
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  cotList: { margin: '3px 0 0', paddingLeft: 14, lineHeight: 1.45 },
  citeBox: {
    marginTop: 8,
    paddingTop: 6,
    borderTop: '1px dashed #D8CBB5',
    display: 'flex',
    flexDirection: 'column',
    gap: 5
  },
  sectionBadge: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    fontWeight: 600,
    color: '#7A1F2B',
    background: '#F4E7CE',
    padding: '3px 8px',
    borderRadius: 4,
    display: 'inline-block',
    alignSelf: 'flex-start'
  },
  simpleBox: {
    fontSize: 12.5,
    color: '#2E5544',
    background: '#EAF3ED',
    padding: '7px 10px',
    borderRadius: 5,
    borderLeft: '3px solid #2E5544'
  },
  penaltyBox: {
    fontSize: 11.8,
    color: '#8C1D2F',
    background: '#FBF0EE',
    padding: '6px 9px',
    borderRadius: 4,
    borderLeft: '3px solid #8C1D2F'
  },
  disclaimer: {
    fontSize: 10.5,
    color: '#8a7a60',
    fontStyle: 'italic',
    marginTop: 5
  },
  typing: { display: 'flex', gap: 5, padding: '6px 4px' },

  /* Quick Chat inside Chat Window */
  quickContainer: {
    background: '#F5EFE1',
    borderTop: '1px solid #D8CBB5',
    padding: '8px 12px 6px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  quickHeader: {
    fontSize: 11,
    fontWeight: 700,
    color: '#7A1F2B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: "'IBM Plex Mono', monospace"
  },
  quickScrollRow: {
    display: 'flex',
    gap: 6,
    overflowX: 'auto',
    paddingBottom: 4,
    scrollbarWidth: 'thin'
  },
  quickChip: {
    background: '#fff',
    border: '1px solid #C9BBA0',
    borderRadius: 16,
    padding: '4px 10px',
    fontSize: 11.5,
    whiteSpace: 'nowrap',
    color: '#3d3326',
    cursor: 'pointer',
    fontFamily: "'Sarabun', sans-serif",
    transition: 'all .15s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4
  },

  inputRow: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px',
    borderTop: '1px solid #C9BBA0',
    background: '#F5EFE1'
  },
  input: {
    flex: 1,
    border: '1px solid #C9BBA0',
    borderRadius: 20,
    padding: '9px 14px',
    fontFamily: "'Sarabun', sans-serif",
    fontSize: 13.5,
    background: '#fff',
    outline: 'none'
  },
  sendBtn: {
    background: '#7A1F2B',
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    padding: '0 16px',
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 13.5,
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background .15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

/* ─── Typing indicator ───────────────────────────────────────────────────── */
function TypingBubble({ modelName }) {
  return (
    <div style={s.msgBot}>
      <div style={s.bubbleBot}>
        <div style={s.modelTag}>⚡ {modelName} กำลังประมวลผลด้วย RAG...</div>
        <div style={s.typing}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#7A1F2B',
                opacity: 0.6,
                animation: `blink 1.2s infinite ${delay}s`,
                display: 'inline-block'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatHero({ onOpenPop }) {
  return (
    <div style={s.heroWrap}>
      <div style={s.heroBadge}>⚡ RAG + OpenThaiGPT Free API</div>
      <h2 style={s.heroTitle}>นิติบอท Pop Chat — ระบบปรึกษากฎหมายดิจิทัล</h2>
      <p style={s.heroSubtitle}>
        แชทบอทตอบคำถาม พ.ร.บ.คอมพิวเตอร์ และ PDPA ถูกเปลี่ยนเป็น <strong>Pop Chat มุมขวาล่างของหน้าจอ</strong>{' '}
        เพื่อให้คุณสามารถสืบค้นและปรึกษากฎหมายได้ตลอดเวลา แม้กำลังดูฐานข้อมูลกฎหมายหรือ FAQ อยู่
      </p>

      <div style={s.heroGrid}>
        <div style={s.heroCard}>
          <div style={s.heroCardTitle}>
            <LegalSeal size={18} color="#7A1F2B" secondaryColor="#B98A3D" showRing={false} /> Pop Chat ขวาล่าง
          </div>
          <p style={s.heroCardText}>
            กดที่ปุ่มแชทลอยด้านขวาล่างเพื่อเปิด/ปิดหน้าต่างสนทนาได้ทุกเมื่อ
          </p>
        </div>
        <div style={s.heroCard}>
          <div style={s.heroCardTitle}>⚡ Quick Chat ในแชท</div>
          <p style={s.heroCardText}>
            คำถามด่วนยึดติดอยู่ภายในหน้าต่าง Pop Chat สามารถคลิกถามได้ทันที
          </p>
        </div>
        <div style={s.heroCard}>
          <div style={s.heroCardTitle}>🧠 AI Engine ประมวลผลเหตุผลขั้นสูง</div>
          <p style={s.heroCardText}>
            ขับเคลื่อนด้วย OpenThaiGPT R1 (Reasoning CoT) แม่นยำและเก่งที่สุดในการวิเคราะห์กฎหมาย
          </p>
        </div>
      </div>

      <button
        style={s.openPopBtn}
        onClick={onOpenPop}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
      >
        <LegalSeal size={20} color="#fff" secondaryColor="#E4D2A4" showRing={false} />
        <span>เปิด Pop Chat นิติบอท</span>
      </button>
    </div>
  );
}

function getClientGeneralResponse(query) {
  const q = query.trim().toLowerCase();
  if (/^(สวัสดี|หวัดดี|ดีครับ|ดีค่ะ|ฮัลโหล|hello|hi|hey|สบายดีไหม|เป็นไง)/i.test(q)) {
    return {
      text: 'สวัสดีครับ มีข้อสงสัยด้าน พ.ร.บ.คอมพิวเตอร์ หรือ PDPA สอบถามได้เลยครับ',
      intent: 'ทักทาย (Greeting)'
    };
  }
  if (/(คุณคือใคร|เธอคือใคร|ชื่ออะไร|แนะนำตัว|ใครสร้าง|ผู้พัฒนา)/i.test(q)) {
    return {
      text: 'ฉันคือ "นิติบอท (Legal Bot)" ผู้ช่วย AI ให้คำปรึกษาด้าน พ.ร.บ.คอมพิวเตอร์ และ PDPA ครับ',
      intent: 'แนะนำตัว (System Profile)'
    };
  }
  if (/(ทำอะไรได้บ้าง|ช่วยอะไรได้|ฟังก์ชัน|วิธีใช้|help)/i.test(q)) {
    return {
      text: `นิติบอทตอบข้อกฎหมายดิจิทัลได้ทันที:
• พ.ร.บ.คอมพิวเตอร์ (แฮก, ข้อมูลเท็จ, สแปม, ตัดต่อภาพ, แอบดูข้อมูล)
• PDPA (สิทธิเจ้าของข้อมูล, ความยินยอม, ข้อมูลรั่วไหล, บทลงโทษ)`,
      intent: 'ช่วยเหลือ (Help & Capabilities)'
    };
  }
  if (/(โดนหลอก|แจ้งความ|ตำรวจไซเบอร์|1441|aoc|มิจฉาชีพ)/i.test(q)) {
    return {
      text: `🚨 คำแนะนำเมื่อตกเป็นเหยื่อมิจฉาชีพออนไลน์:
1. โทรสายด่วน AOC 1441 ทันทีตลอด 24 ชม. เพื่ออายัดบัญชี
2. แจ้งความออนไลน์ที่ www.thaipoliceonline.go.th
3. เตรียมหลักฐานสลิปโอนเงินและประวัติแชทเพื่อดำเนินคดี`,
      intent: 'แจ้งความออนไลน์ / ศูนย์ AOC'
    };
  }
  if (/(รหัสผ่าน|password|2fa|สองชั้น|ความปลอดภัย)/i.test(q)) {
    return {
      text: '🔐 แนะนำตั้งรหัสผ่าน 12+ ตัวอักษร ผสมตัวพิมพ์ใหญ่ เล็ก ตัวเลข สัญลักษณ์ และเปิด 2FA เสมอเพื่อความปลอดภัยครับ',
      intent: 'คำแนะนำความปลอดภัยรหัสผ่าน'
    };
  }
  if (/(ขอบคุณ|ขอบใจ|thank|thanks)/i.test(q)) {
    return {
      text: 'ยินดีครับ มีข้อสงสัยด้านกฎหมายสอบถามเพิ่มเติมได้เสมอครับ',
      intent: 'ขอบคุณ (Gratitude)'
    };
  }
  if (/(บาย|ลาก่อน|goodbye|bye)/i.test(q)) {
    return {
      text: 'ลาก่อนครับ ยินดีให้บริการเสมอครับ 👋',
      intent: 'กล่าวลา (Farewell)'
    };
  }
  return {
    text: `สวัสดีครับ จากเรื่องที่คุณสอบถามเข้ามา ขอให้คำแนะนำเบื้องต้นดังนี้ครับ:

หากคุณหรือคนใกล้ชิดกำลังประสบปัญหาทางไซเบอร์ เช่น การถูกหลอกลวง ข่มขู่ หรือการถูกละเมิดสิทธิข้อมูลส่วนบุคคล สิ่งที่ควรดำเนินการทันทีคือ:
1. 📸 รวบรวมหลักฐานทันที: แคปภาพหน้าจอข้อความแชท, โปรไฟล์ผู้กระทำผิด, สลิปโอนเงิน หรือบันทึกลิงก์ URL ไว้ให้ชัดเจน
2. 🚨 กรณีถูกหลอกลวง/โอนเงิน: ติดต่อสายด่วน AOC 1441 ได้ตลอด 24 ชั่วโมง เพื่อทำการอายัดบัญชีคนร้าย และแจ้งความออนไลน์ได้ที่ www.thaipoliceonline.go.th
3. ⚖️ การวินิจฉัยข้อกฎหมาย: หากมีรายละเอียดของเหตุการณ์เพิ่มเติม (เช่น ใครทำอะไร โพสต์ที่ไหน เกิดความเสียหายอย่างไร) สามารถพิมพ์เล่าเพิ่มเติมให้ผมช่วยวิเคราะห์มาตราที่เกี่ยวข้องได้เลยนะครับ ยินดีช่วยเหลือครับ 😊`,
    intent: 'คำถามทั่วไป (General Inquiry)'
  };
}

export default function ChatView({ activeTab, renderHeroOnly = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel] = useState('gpt-4o-mini');
  const [laws, setLaws] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'สวัสดีค่ะ ดิฉันคือนิติบอท (Legal Bot) ผู้ช่วย AI ให้ความรู้ด้านกฎหมาย พ.ร.บ.คอมพิวเตอร์ และ PDPA สามารถตอบคำถามทั่วไปและให้คำปรึกษาข้อกฎหมายได้ตลอด 24 ชม. สามารถพิมพ์คำถาม หรือกดเลือกคำถามด่วนด้านล่างได้เลยนะคะ 😊',
      modelUsed: 'GPT API & นิติบอท AI Service'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    fetchLawsFromSupabase().then((data) => {
      if (data) setLaws(data);
    });
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, isTyping, isOpen]);

  async function sendMessage(text) {
    const q = text.trim();
    if (!q || isTyping) return;
    setInputVal('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setIsTyping(true);

    try {
      // Fetch from Express API Gateway
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, model: selectedModel })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply;
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: reply.text,
            section: reply.section,
            simple: reply.simple,
            penalty: reply.penalty,
            reasoningSteps: reply.reasoningSteps,
            modelUsed: reply.modelUsed
          }
        ]);

        // Save log to Supabase directly as well
        saveChatLogToSupabase({
          userMessage: q,
          botResponse: reply.simple || reply.text,
          detectedIntent: reply.section ? `${reply.section} — ${reply.title || ''}` : 'ทั่วไป',
          modelUsed: reply.modelUsed
        });
        return;
      }
    } catch (err) {
      console.warn('Backend API connection failed, fallbacking to client RAG engine:', err);
    }

    // Fallback RAG search on client
    setTimeout(async () => {
      setIsTyping(false);
      const hit = retrieve(q, laws);
      const isCoT = selectedModel === 'openthaigpt-r1';

      let cotSteps = isCoT
        ? [
          `1. คำถาม: "${q}"`,
          `2. ค้นพบ: ${formatSection(hit?.section)} (${hit?.title || ''})`,
          `3. สรุปสาระสำคัญและบทกำหนดโทษ`
        ]
        : null;

      let botText = '';
      let detectedIntent = 'ทั่วไป / ไม่ตรงมาตรา';
      const modelName = isCoT ? 'OpenThaiGPT R1 (32B Reasoning)' : 'OpenThaiGPT 1.6 (72B)';

      if (hit) {
        const secLabel = formatSection(hit.section);
        const catLabel = hit.cat === 'pdpa' ? 'PDPA' : 'พ.ร.บ.คอมพิวเตอร์';
        botText = `📌 ${hit.title} (${secLabel} ${catLabel})\n• สาระสำคัญ: ${hit.simple || hit.text}\n• บทกำหนดโทษ: ${hit.penalty || 'ไม่มีระบุโทษอาญาโดยตรง'}`;
        detectedIntent = `${secLabel} — ${hit.title}`;
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: botText,
            section: hit.section,
            title: hit.title,
            simple: hit.simple,
            penalty: hit.penalty,
            reasoningSteps: cotSteps,
            modelUsed: modelName
          }
        ]);
      } else {
        const gen = getClientGeneralResponse(q);
        botText = gen.text;
        detectedIntent = gen.intent;
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: botText,
            reasoningSteps: [
              `1. คำถาม: "${q}"`,
              `2. หมวดหมู่: ${gen.intent}`
            ],
            modelUsed: 'นิติบอท AI'
          }
        ]);
      }

      // Save log to Supabase
      await saveChatLogToSupabase({
        userMessage: q,
        botResponse: hit ? (hit.simple || botText) : botText,
        detectedIntent,
        modelUsed: modelName
      });
    }, 600);
  }

  if (renderHeroOnly) {
    return <ChatHero onOpenPop={() => setIsOpen(true)} />;
  }

  return (
    <>
      {/* ── Main Hero Page View (when Chat Tab is active) ── */}
      {activeTab === 'chat' && <ChatHero onOpenPop={() => setIsOpen(true)} />}

      {/* ── Floating Pop Chat Trigger Launcher (Bottom Right) ── */}
      <button
        style={s.launcherBtn(isOpen)}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'ย่อหน้าต่าง Pop Chat' : 'เปิด Pop Chat นิติบอท'}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
      >
        <span style={s.launcherIcon}>
          {isOpen ? '✕' : <LegalSeal size={24} color="#E4D2A4" secondaryColor="#FFF" showRing={false} />}
        </span>
        <span>{isOpen ? 'ปิด Pop Chat' : 'ปรึกษานิติบอท'}</span>
      </button>

      {/* ── Floating Pop Chat Window (Fixed Bottom Right) ── */}
      {isOpen && (
        <div style={s.popContainer}>
          {/* Header */}
          <div style={s.popHead}>
            <div style={s.popHeadTop}>
              <h3 style={s.popTitle}>
                <LegalSeal size={22} color="#E4D2A4" secondaryColor="#FFF" showRing={false} />
                <span>นิติบอท (Legal Bot)</span>
              </h3>
              <div style={s.popControls}>
                <div style={s.statusDot}>
                  <span style={s.dot} /> API
                </div>
                <button
                  style={s.iconBtn}
                  onClick={() => setIsOpen(false)}
                  title="ปิด Pop Chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Single Top AI Model Badge */}
            <div style={s.singleModelBadge}>
              <span>🧠 AI Engine: GPT API + RAG Legal Knowledge Base</span>
            </div>
          </div>

          {/* Message Log */}
          <div ref={logRef} style={s.log}>
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} style={s.msgUser}>
                  <div style={s.bubbleUser}>{m.text}</div>
                </div>
              ) : (
                <div key={i} style={s.msgBot}>
                  <div style={s.bubbleBot}>
                    {m.modelUsed && <div style={s.modelTag}>🤖 {m.modelUsed}</div>}

                    <div style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>{m.text}</div>

                    {/* Chain-of-Thought Reasoning Steps (Collapsible) */}
                    {m.reasoningSteps && m.reasoningSteps.length > 0 && (
                      <details style={s.cotBox}>
                        <summary style={s.cotSummary}>
                          <span>🧠</span> ขั้นตอนการประมวลผล AI (คลิกเพื่อดู)
                        </summary>
                        <ol style={s.cotList}>
                          {m.reasoningSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </details>
                    )}

                    {/* RAG Context & Citations (Only shown when not already part of text) */}
                    {m.section && !m.text.includes(formatSection(m.section)) && (
                      <div style={s.citeBox}>
                        <div style={s.sectionBadge}>
                          อ้างอิง: {formatSection(m.section)} {m.title ? `(${m.title})` : ''}
                        </div>
                        {m.penalty && !m.text.includes(m.penalty) && (
                          <div style={s.penaltyBox}>
                            <strong>⚠️ บทกำหนดโทษ:</strong> {m.penalty}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={s.disclaimer}>
                      ข้อมูลเบื้องต้นจาก RAG + OpenThaiGPT Free API ไม่ใช่คำวินิจฉัยทางกฎหมาย
                    </div>
                  </div>
                </div>
              )
            )}
            {isTyping && (
              <TypingBubble modelName="OpenThaiGPT R1 (Reasoning)" />
            )}
          </div>

          {/* Quick Chat Topics INSIDE Chat Window */}
          <div style={s.quickContainer}>
            <div style={s.quickHeader}>
              <span>⚡ QUICK CHAT (คำถามด่วน)</span>
            </div>
            <div style={s.quickScrollRow}>
              {QUICK_TOPICS.map((t) => (
                <button
                  key={t.label}
                  style={s.quickChip}
                  onClick={() => sendMessage(t.q)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#7A1F2B';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#3d3326';
                  }}
                >
                  📌 {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Row */}
          <div style={s.inputRow}>
            <input
              style={s.input}
              value={inputVal}
              placeholder="พิมพ์คำถามกฎหมาย..."
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage(inputVal);
              }}
            />
            <button style={s.sendBtn} onClick={() => sendMessage(inputVal)}>
              ส่ง
            </button>
          </div>
        </div>
      )}
    </>
  );
}
