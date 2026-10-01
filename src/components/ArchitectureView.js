import React, { useState, useEffect } from 'react';

const s = {
  container: { marginTop: 20 },
  card: {
    background: '#FBF8F0',
    border: '1px solid #C9BBA0',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    boxShadow: '0 4px 20px rgba(34,26,20,0.06)'
  },
  title: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 20,
    color: '#591622',
    margin: '0 0 10px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  subtitle: {
    fontSize: 13.5,
    color: '#665744',
    margin: '0 0 20px',
    lineHeight: 1.6
  },
  flowWrap: {
    background: '#fff',
    border: '2px solid #E4D2A4',
    borderRadius: 10,
    padding: 20,
    marginBottom: 24
  },
  flowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12,
    position: 'relative'
  },
  flowNode: (active) => ({
    background: active ? '#FFF8E7' : '#FAF6ED',
    border: `2px solid ${active ? '#B98A3D' : '#DBCBB0'}`,
    borderRadius: 10,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    transition: 'all .2s ease',
    boxShadow: active ? '0 6px 18px rgba(185,138,61,0.2)' : 'none',
    position: 'relative'
  }),
  flowStep: {
    fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 700,
    color: '#7A1F2B',
    background: '#F4E7CE',
    padding: '2px 8px',
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  flowTitle: {
    fontSize: 14.5,
    fontWeight: 700,
    color: '#591622',
    margin: '2px 0 0',
    fontFamily: "'Noto Serif Thai', serif"
  },
  flowDesc: {
    fontSize: 12.5,
    color: '#5a4d3c',
    margin: 0,
    lineHeight: 1.45
  },
  arrow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#B98A3D',
    fontSize: 20,
    fontWeight: 'bold'
  },
  statusBadge: (online) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 16,
    fontSize: 12,
    fontWeight: 600,
    background: online ? '#E6F4EA' : '#FCE8E6',
    color: online ? '#137333' : '#C5221F',
    border: `1px solid ${online ? '#CEEAD6' : '#FAD2CF'}`
  }),
  dot: (online) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: online ? '#34A853' : '#EA4335'
  }),
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16
  },
  tierCard: (borderColor) => ({
    background: '#fff',
    border: `2px solid ${borderColor}`,
    borderRadius: 10,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  }),
  tierTitle: (color) => ({
    fontSize: 16,
    fontWeight: 700,
    color,
    fontFamily: "'Noto Serif Thai', serif",
    margin: 0,
    borderBottom: '1px solid #eee',
    paddingBottom: 6
  }),
  codeBlock: {
    background: '#2B2621',
    color: '#E6D7B8',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    overflowX: 'auto',
    lineHeight: 1.5,
    margin: '10px 0 0'
  }
};

export default function ArchitectureView() {
  const [fastApiOnline, setFastApiOnline] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Check FastAPI health
    fetch('http://localhost:8000/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setFastApiOnline(true);
      })
      .catch(() => setFastApiOnline(false));

    // Check Supabase status
    fetch('http://localhost:8000/api/supabase-status')
      .then(res => res.json())
      .then(data => {
        if (data.connected) setSupabaseReady(true);
      })
      .catch(() => {
        // Fallback to Express backend status
        fetch('http://localhost:5000/api/supabase-status')
          .then(res => res.json())
          .then(data => {
            if (data.connected) setSupabaseReady(true);
          })
          .catch(() => setSupabaseReady(false));
      });
  }, []);

  const pipelineSteps = [
    {
      step: 'Step 1',
      title: 'ผู้ใช้ (React SPA)',
      sub: 'Frontend Web Application',
      tech: 'React 19 + Pop Chat Component',
      desc: 'รับข้อความคำถามภาษาไทย เช่น "แอบดูแชทเฟซบุ๊กคนอื่นผิดกฎหมายไหม" ส่งไปยัง FastAPI ผ่าน REST API POST /api/chat'
    },
    {
      step: 'Step 2',
      title: 'Python (FastAPI)',
      sub: 'High-Performance API Gateway',
      tech: 'FastAPI + Uvicorn + Pydantic',
      desc: 'ควบคุม Orchestration ของ RAG Pipeline รับ-ส่งคำถาม ตรวจสอบความปลอดภัย จัดการ Rate Limit และประมวลผล Context'
    },
    {
      step: 'Step 3',
      title: 'แปลงคำถามเป็น Embedding',
      sub: 'Vector Representation',
      tech: 'OpenAI text-embedding-3-small',
      desc: 'แปลงประโยคคำถามภาษาไทยเป็น Vector ขนาด 1536 มิติ เชิงความหมาย (Semantic Dimensions)'
    },
    {
      step: 'Step 4',
      title: 'Supabase (pgvector)',
      sub: 'PostgreSQL Vector Search',
      tech: 'pgvector Cosine Similarity (match_laws)',
      desc: 'ค้นหาเวกเตอร์ที่ใกล้เคียงที่สุดในคลังกฎหมาย คืนค่ามาตราที่เกี่ยวข้องสูงสุด (Top-K) เช่น พ.ร.บ.คอมพิวเตอร์ มาตรา 7'
    },
    {
      step: 'Step 5',
      title: 'Thai Open GPT',
      sub: 'Large Language Model',
      tech: 'OpenThaiGPT R1 / OpenAI GPT-4o-mini',
      desc: 'ป้อน Context มาตราที่ค้นพบเข้าสู่ Prompt เพื่อให้ AI วิเคราะห์ตรรกะแบบ Chain-of-Thought และสร้างคำตอบที่อิงกฎหมายจริง'
    },
    {
      step: 'Step 6',
      title: 'คำตอบพร้อมอ้างอิงมาตรา',
      sub: 'Grounded Legal Response',
      tech: 'Structured Citation JSON -> React UI',
      desc: 'ส่งกลับคำตอบที่ระบุเลขมาตรา สาระสำคัญ บทกำหนดโทษ คำเตือน และบันทึกลงตาราง chat_logs บน Supabase'
    }
  ];

  return (
    <div style={s.container}>
      {/* 1. Header Banner & Live Status */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={s.title}>สถาปัตยกรรม RAG Pipeline (React + FastAPI + pgvector + Thai Open GPT)</h3>
            <p style={s.subtitle}>
              ผังการทำงานระบบค้นคืนความรู้และสร้างคำตอบทางกฎหมายดิจิทัล (Grounded Retrieval-Augmented Generation)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={s.statusBadge(fastApiOnline)}>
              <span style={s.dot(fastApiOnline)} />
              FastAPI {fastApiOnline ? 'Online (Port 8000)' : 'Standby / Port 8000'}
            </span>
            <span style={s.statusBadge(supabaseReady)}>
              <span style={s.dot(supabaseReady)} />
              Supabase pgvector {supabaseReady ? 'Connected' : 'Connecting'}
            </span>
          </div>
        </div>

        {/* 2. Visual Interactive Flowchart */}
        <div style={s.flowWrap}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7A1F2B', fontFamily: "'Noto Serif Thai', serif" }}>
                            ลำดับขั้นตอนการทำงาน (คลิกที่การ์ดเพื่อดูรายละเอียด):
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {pipelineSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{
                    border: 'none',
                    borderRadius: 4,
                    padding: '3px 8px',
                    fontSize: 11,
                    cursor: 'pointer',
                    background: activeStep === i ? '#7A1F2B' : '#F4E7CE',
                    color: activeStep === i ? '#fff' : '#7A1F2B',
                    fontWeight: 600
                  }}
                >
                  #{i + 1}
                </button>
              ))}
            </div>
          </div>

          <div style={s.flowGrid}>
            {pipelineSteps.map((node, i) => (
              <div
                key={i}
                style={s.flowNode(activeStep === i)}
                onClick={() => setActiveStep(i)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={s.flowStep}>{node.step}</span>
                  {activeStep === i && <span style={{ fontSize: 11, color: '#B98A3D', fontWeight: 'bold' }}>● เลือกอยู่</span>}
                </div>
                <h4 style={s.flowTitle}>{node.title}</h4>
                <div style={{ fontSize: 11, color: '#8C7456', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {node.tech}
                </div>
                <p style={s.flowDesc}>{node.desc}</p>
              </div>
            ))}
          </div>

          {/* Detailed View of Active Step */}
          <div style={{ marginTop: 18, background: '#FAF6ED', border: '1px solid #E4D2A4', borderRadius: 8, padding: 16 }}>
            <h5 style={{ margin: '0 0 6px', color: '#591622', fontFamily: "'Noto Serif Thai', serif", fontSize: 15 }}>
                            ข้อมูลเชิงลึก: {pipelineSteps[activeStep].title} ({pipelineSteps[activeStep].tech})
            </h5>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#3d3326', lineHeight: 1.6 }}>
              {pipelineSteps[activeStep].desc}
            </p>
            {activeStep === 2 && (
              <div style={s.codeBlock}>
                {`# การแปลงคำถามเป็น Embedding ผ่าน FastAPI\nresponse = openai_client.embeddings.create(\n    input=["แอบดูแชทเฟซบุ๊กคนอื่นผิดกฎหมายไหม"],\n    model="text-embedding-3-small"  # 1536 Dimensions\n)\nvector = response.data[0].embedding`}
              </div>
            )}
            {activeStep === 3 && (
              <div style={s.codeBlock}>
                {`-- Supabase PostgreSQL pgvector Cosine Search\nSELECT id, section, title, 1 - (embedding <=> query_embedding) AS similarity\nFROM laws\nWHERE 1 - (embedding <=> query_embedding) >= 0.25\nORDER BY embedding <=> query_embedding\nLIMIT 3;`}
              </div>
            )}
            {activeStep === 4 && (
              <div style={s.codeBlock}>
                {`# Prompt Grounding เข้าสู่ Thai Open GPT\nsystem_prompt = """คุณคือ 'นิติบอท' AI ที่ปรึกษากฎหมายดิจิทัล...\nข้อมูลมาตราอ้างอิงจาก pgvector:\n- มาตรา 7 พ.ร.บ.คอมพิวเตอร์: การเข้าถึงข้อมูลคอมพิวเตอร์โดยมิชอบ โทษจำคุกไม่เกิน 2 ปี"""`}
              </div>
            )}
          </div>
        </div>

        {/* 3-Tier Architecture Description */}
        <h4 style={{ ...s.title, fontSize: 17, marginTop: 24 }}>
          🏗️ สถาปัตยกรรมระบบ 3 ชั้น (3-Tier Enterprise Architecture)
        </h4>
        <div style={s.grid3}>
          <div style={s.tierCard('#7A1F2B')}>
            <h4 style={s.tierTitle('#7A1F2B')}>1. Presentation Tier</h4>
            <span style={{ fontSize: 11, background: '#F4E7CE', color: '#7A1F2B', padding: '2px 8px', borderRadius: 4, width: 'fit-content' }}>
              React Single Page App
            </span>
            <p style={{ fontSize: 12.5, color: '#3d3326', lineHeight: 1.5, margin: 0 }}>
              • <strong>UI Components:</strong> Pop Chat ลอยมุมขวา, หน้าแสดงฐานข้อมูลกฎหมาย, FAQ และหน้าสถาปัตยกรรม<br />
              • <strong>Protocol:</strong> RESTful HTTPS API รองรับทั้ง FastAPI (Port 8000) และ Express (Port 5000)
            </p>
          </div>

          <div style={s.tierCard('#B98A3D')}>
            <h4 style={s.tierTitle('#B98A3D')}>2. Application Tier</h4>
            <span style={{ fontSize: 11, background: '#FFF3D6', color: '#8F6619', padding: '2px 8px', borderRadius: 4, width: 'fit-content' }}>
              Python (FastAPI) RAG Service
            </span>
            <p style={{ fontSize: 12.5, color: '#3d3326', lineHeight: 1.5, margin: 0 }}>
              • <strong>Embedding:</strong> text-embedding-3-small (1536 มิติ)<br />
              • <strong>LLM:</strong> Thai Open GPT / OpenThaiGPT R1 Reasoning (32B)<br />
              • <strong>Verification:</strong> ตรวจสอบเลขมาตรา อ้างอิงบทกำหนดโทษ และ Safety Guardrail
            </p>
          </div>

          <div style={s.tierCard('#2E5544')}>
            <h4 style={s.tierTitle('#2E5544')}>3. Data Tier</h4>
            <span style={{ fontSize: 11, background: '#E6F4EA', color: '#137333', padding: '2px 8px', borderRadius: 4, width: 'fit-content' }}>
              PostgreSQL + pgvector
            </span>
            <p style={{ fontSize: 12.5, color: '#3d3326', lineHeight: 1.5, margin: 0 }}>
              • <strong>Database:</strong> Supabase Cloud PostgreSQL<br />
              • <strong>Tables:</strong> laws (พร้อมคอลัมน์ embedding vector(1536)), faqs, chat_logs<br />
              • <strong>Index:</strong> HNSW Vector Cosine Index
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
