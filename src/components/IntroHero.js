import React from 'react';
import LegalSeal from './LegalSeal';

const s = {
  container: {
    padding: '40px 24px 30px',
    background: 'linear-gradient(180deg, #FBF8F0 0%, #F5EFE1 100%)',
    border: '1px solid #C9BBA0',
    borderRadius: 16,
    boxShadow: '0 12px 32px rgba(34,26,20,0.08)',
    marginTop: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    opacity: 0.05,
    pointerEvents: 'none',
  },
  badgeRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  pill: (bg, color) => ({
    background: bg,
    color: color,
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 20,
    fontFamily: "'IBM Plex Mono', monospace",
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid rgba(0,0,0,0.05)',
  }),
  h1: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: '2.4rem',
    color: '#591622',
    margin: '0 0 14px',
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
  },
  desc: {
    fontSize: 16,
    lineHeight: 1.7,
    color: '#4a3f30',
    maxWidth: 820,
    margin: '0 0 28px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: '#fff',
    border: '1px solid #E4D2A4',
    borderRadius: 10,
    padding: '16px 18px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  statIcon: {
    fontSize: 28,
    width: 48,
    height: 48,
    borderRadius: 10,
    background: '#F9F4E8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#7A1F2B',
    fontFamily: "'Noto Serif Thai', serif",
  },
  statSub: {
    fontSize: 12.5,
    color: '#6b5d4a',
    margin: 0,
  },
  ctaRow: {
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #7A1F2B 0%, #591622 100%)',
    color: '#fff',
    border: '1px solid #E4D2A4',
    borderRadius: 30,
    padding: '12px 26px',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'Noto Serif Thai', serif",
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(122,31,43,0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all .2s ease',
  },
  secondaryBtn: {
    background: '#fff',
    color: '#591622',
    border: '1px solid #C9BBA0',
    borderRadius: 30,
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'Noto Serif Thai', serif",
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all .2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginTop: 32,
    paddingTop: 24,
    borderTop: '1px dashed #C9BBA0',
  },
  featureCard: {
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid #E4D2A4',
    borderRadius: 8,
    padding: 16,
    transition: 'transform .2s ease, boxShadow .2s ease',
  },
  featureHead: {
    fontSize: 14.5,
    fontWeight: 700,
    color: '#7A1F2B',
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Noto Serif Thai', serif",
  },
  featureText: {
    fontSize: 13,
    color: '#5a4d3b',
    margin: 0,
    lineHeight: 1.5,
  },
};

export default function IntroHero({ onNavigate }) {
  return (
    <section style={s.container} id="section-intro">
      <div style={s.watermark}>
        <LegalSeal size={320} color="#7A1F2B" secondaryColor="#B98A3D" showRing={true} />
      </div>

      <div style={s.badgeRow}>
        <span style={s.pill('#F4E7CE', '#7A1F2B')}>
          ⚖️ Knowledge-Based Legal AI System
        </span>
        <span style={s.pill('#2E5544', '#fff')}>
          ⚡ OpenThaiGPT RAG Engine
        </span>
        <span style={s.pill('#EBF4EF', '#2E5544')}>
          🎓 มหาวิทยาลัยราชภัฏนครศรีธรรมราช
        </span>
      </div>

      <h1 style={s.h1}>
        นิติบอท (NitiBot) — ระบบให้ความรู้กฎหมายดิจิทัลอัจฉริยะ
      </h1>

      <p style={s.desc}>
        นวัตกรรมระบบตัวกลางอัจฉริยะสำหรับสืบค้นและวิเคราะห์ข้อกฎหมายดิจิทัล
        ครอบคลุมทั้ง <strong>พ.ร.บ.ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ (2550/2560)</strong>{' '}
        และ <strong>พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA พ.ศ. 2562)</strong>{' '}
        ประมวลผลคำตอบด้วยเทคโนโลยี <strong>RAG + OpenThaiGPT Free API</strong>{' '}
        ช่วยแปลงภาษากฎหมายเป็นภาษาพูดที่เข้าใจง่าย พร้อมระบุบทลงโทษทางอาญาและทางปกครองอย่างแม่นยำ
      </p>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statIcon}>📖</div>
          <div>
            <div style={s.statTitle}>2 พ.ร.บ. หลัก</div>
            <p style={s.statSub}>พ.ร.บ.คอมพิวเตอร์ &amp; PDPA</p>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={s.statIcon}>🎯</div>
          <div>
            <div style={s.statTitle}>96.4% Accuracy</div>
            <p style={s.statSub}>ความแม่นยำดึงข้อมูลมาตรา</p>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={s.statIcon}>🧠</div>
          <div>
            <div style={s.statTitle}>OpenThaiGPT</div>
            <p style={s.statSub}>LLM ภาษาไทยเชี่ยวชาญกฎหมาย</p>
          </div>
        </div>

        <div style={s.statCard}>
          <div style={s.statIcon}>⚡</div>
          <div>
            <div style={s.statTitle}>Real-time AI</div>
            <p style={s.statSub}>ถาม-ตอบและเปิดอ่านได้ 24 ชม.</p>
          </div>
        </div>
      </div>

      <div style={s.ctaRow}>
        <button
          style={s.primaryBtn}
          onClick={() => onNavigate('law')}
        >
          <span>📜 เปิดอ่าน UI เล่มกฎหมาย</span>
        </button>

        <button
          style={s.secondaryBtn}
          onClick={() => onNavigate('chat')}
        >
          <span>💬 สอบถามนิติบอททันที</span>
        </button>

        <button
          style={{ ...s.secondaryBtn, background: '#F5EFE1', border: '1px solid #E4D2A4' }}
          onClick={() => onNavigate('dash')}
        >
          <span>📊 ดูแดชบอร์ดประมวลผล</span>
        </button>
      </div>

      <div style={s.featureGrid}>
        <div style={s.featureCard}>
          <div style={s.featureHead}>📜 UI เล่มกฎหมายดิจิทัล</div>
          <p style={s.featureText}>
            นำเสนอในรูปแบบเล่มกฎหมาย 3D จำลอง เลือกเปิดอ่านหัวข้อมาตรา ขยายดูบทบัญญัติเต็ม สรุปเข้าใจง่าย และบทลงโทษ
          </p>
        </div>

        <div style={s.featureCard}>
          <div style={s.featureHead}>💬 แชทบอทสอบถามข้อกฎหมาย</div>
          <p style={s.featureText}>
            ถามปัญหา เช่น การโดนแฮก ข่าวปลอม โพสต์ประจาน ทวงหนี้ หรือ PDPA พร้อมแสดงการคิด Chain-of-Thought (CoT)
          </p>
        </div>

        <div style={s.featureCard}>
          <div style={s.featureHead}>❓ คลังคำถามที่พบบ่อย</div>
          <p style={s.featureText}>
            รวบรวมคำถามยอดฮิตทางกฎหมายดิจิทัล พร้อมคำอธิบายและแนวปฏิบัติทางกฎหมายที่ถูกต้อง
          </p>
        </div>

        <div style={s.featureCard}>
          <div style={s.featureHead}>📊 แดชบอร์ด &amp; สถาปัตยกรรม</div>
          <p style={s.featureText}>
            ติดตามสถิติการใช้งาน Intent ที่ถูกถามบ่อย พร้อมโครงสร้างระบบ 3-Tier Architecture ที่มีความปลอดภัยสูง
          </p>
        </div>
      </div>
    </section>
  );
}
