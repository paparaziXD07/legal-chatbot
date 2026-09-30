import React, { useState, useEffect } from 'react';

const s = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(34, 26, 20, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20
  },
  modal: {
    background: '#FBF8F0', border: '2px solid #7A1F2B',
    borderRadius: 10, width: '100%', maxWidth: 560,
    padding: 24, boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
    display: 'flex', flexDirection: 'column', gap: 14
  },
  title: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 18, color: '#591622', margin: 0, borderBottom: '1px solid #C9BBA0',
    paddingBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  closeBtn: {
    background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8a7a60'
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#4a3f30' },
  input: {
    padding: '9px 12px', border: '1px solid #C9BBA0', borderRadius: 5,
    fontSize: 14, fontFamily: "'Sarabun', sans-serif", outline: 'none'
  },
  textarea: {
    padding: '9px 12px', border: '1px solid #C9BBA0', borderRadius: 5,
    fontSize: 14, fontFamily: "'Sarabun', sans-serif", outline: 'none',
    minHeight: 70, resize: 'vertical'
  },
  select: {
    padding: '9px 12px', border: '1px solid #C9BBA0', borderRadius: 5,
    fontSize: 14, fontFamily: "'Sarabun', sans-serif", outline: 'none', background: '#fff'
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  saveBtn: {
    background: '#7A1F2B', color: '#fff', border: 'none', padding: '9px 20px',
    borderRadius: 5, fontSize: 14, fontFamily: "'Noto Serif Thai', serif", cursor: 'pointer', fontWeight: 600
  },
  cancelBtn: {
    background: '#EAE1CE', color: '#591622', border: 'none', padding: '9px 18px',
    borderRadius: 5, fontSize: 14, fontFamily: "'Noto Serif Thai', serif", cursor: 'pointer'
  }
};

export default function LawModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    cat: 'computer',
    section: '',
    title: '',
    text: '',
    simple: '',
    penalty: '',
    keywords: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        cat: initialData.cat || 'computer',
        section: initialData.section || '',
        title: initialData.title || '',
        text: initialData.text || '',
        simple: initialData.simple || '',
        penalty: initialData.penalty || '',
        keywords: Array.isArray(initialData.keywords) ? initialData.keywords.join(', ') : (initialData.keywords || '')
      });
    } else {
      setFormData({
        cat: 'computer',
        section: '',
        title: '',
        text: '',
        simple: '',
        penalty: '',
        keywords: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...formData,
      keywords: typeof formData.keywords === 'string'
        ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean)
        : formData.keywords
    };
    onSave(payload);
    onClose();
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.title}>
          <span>{initialData ? '✏️ แก้ไขข้อมูลมาตรากฎหมาย' : '➕ เพิ่มมาตรากฎหมายใหม่'}</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={s.fieldGroup}>
            <label style={s.label}>หมวดหมู่กฎหมาย</label>
            <select
              style={s.select}
              value={formData.cat}
              onChange={e => setFormData({ ...formData, cat: e.target.value })}
            >
              <option value="computer">พ.ร.บ.ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์</option>
              <option value="pdpa">พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={s.fieldGroup}>
              <label style={s.label}>เลขมาตรา / หัวข้ออ้างอิง</label>
              <input
                style={s.input}
                placeholder="เช่น มาตรา 14 หรือ PDPA มาตรา 20"
                value={formData.section}
                onChange={e => setFormData({ ...formData, section: e.target.value })}
                required
              />
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>ชื่อเรื่อง / ชื่อมาตรา</label>
              <input
                style={s.input}
                placeholder="เช่น การนำเข้าข้อมูลเท็จ"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>ตัวบทกฎหมายเต็ม (Legal Text)</label>
            <textarea
              style={s.textarea}
              placeholder="ระบุตัวบทกฎหมายจริง..."
              value={formData.text}
              onChange={e => setFormData({ ...formData, text: e.target.value })}
              required
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>บทสรุปสำหรับประชาชน (Simplified Summary)</label>
            <textarea
              style={s.textarea}
              placeholder="อธิบายสาระสำคัญเพื่อให้ประชาชนเข้าใจทันที..."
              value={formData.simple}
              onChange={e => setFormData({ ...formData, simple: e.target.value })}
              required
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>บทกำหนดโทษ (Penalties)</label>
            <input
              style={s.input}
              placeholder="เช่น จำคุกไม่เกิน 5 ปี ปรับไม่เกิน 100,000 บาท"
              value={formData.penalty}
              onChange={e => setFormData({ ...formData, penalty: e.target.value })}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>คำสำคัญสำหรับการสืบค้น RAG (Keywords แยกด้วยจุลภาค)</label>
            <input
              style={s.input}
              placeholder="เช่น ข้อมูลเท็จ, ทวงหนี้, หมิ่นประมาท, fake news"
              value={formData.keywords}
              onChange={e => setFormData({ ...formData, keywords: e.target.value })}
            />
          </div>

          <div style={s.actions}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" style={s.saveBtn}>
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
