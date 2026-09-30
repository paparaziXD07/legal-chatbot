import React, { useState, useEffect } from 'react';
import { fetchFaqsFromSupabase } from '../data/knowledgeBase';
import supabaseRest from '../supabaseClient';

const API_BASE = 'http://localhost:5000/api';

const s = {
  headerRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 20, marginBottom: 16, flexWrap: 'wrap', gap: 12
  },
  searchInput: {
    padding: '9px 14px', border: '1px solid #C9BBA0', borderRadius: 20,
    fontSize: 13.5, fontFamily: "'Sarabun', sans-serif", outline: 'none',
    width: 280, background: '#fff'
  },
  addBtn: {
    background: '#2E5544', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13.5,
    fontFamily: "'Noto Serif Thai', serif", fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 6
  },
  container: { maxWidth: 840 },
  item: {
    background: '#FBF8F0', border: '1px solid #C9BBA0', borderRadius: 8,
    padding: '16px 20px', marginBottom: 12,
    boxShadow: '0 2px 8px rgba(34,26,20,0.06)', cursor: 'pointer',
    transition: 'all .15s ease'
  },
  question: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 16, color: '#591622', fontWeight: 600,
    userSelect: 'none', gap: 12
  },
  rightSide: { display: 'flex', alignItems: 'center', gap: 10 },
  delBtn: {
    background: '#F9ECE8', border: '1px solid #E2A096', color: '#7A1F2B',
    borderRadius: 4, padding: '2px 8px', fontSize: 12, cursor: 'pointer'
  },
  plus: (open) => ({
    fontSize: 20, color: '#B98A3D',
    transform: open ? 'rotate(45deg)' : 'none',
    transition: 'transform .2s',
    flexShrink: 0,
  }),
  answer: {
    fontSize: 14, lineHeight: 1.7, color: '#3d3326',
    marginTop: 12, paddingTop: 10, borderTop: '1px dashed #C9BBA0',
  },
  newFaqForm: {
    background: '#F5EFE1', border: '1px solid #C9BBA0', borderRadius: 8,
    padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10
  },
  input: {
    padding: '9px 12px', border: '1px solid #C9BBA0', borderRadius: 5,
    fontSize: 14, fontFamily: "'Sarabun', sans-serif"
  },
  textarea: {
    padding: '9px 12px', border: '1px solid #C9BBA0', borderRadius: 5,
    fontSize: 14, fontFamily: "'Sarabun', sans-serif", minHeight: 60
  },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: 8 },
  emptyBox: {
    padding: '32px 20px',
    background: '#FBF8F0',
    border: '1px dashed #C9BBA0',
    borderRadius: 8,
    textAlign: 'center',
    color: '#6b5d4a',
    margin: '20px 0'
  }
};

export default function FaqView({ isAdmin }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    setLoading(true);
    const data = await fetchFaqsFromSupabase();
    if (data) {
      setFaqs(data);
    }
    setLoading(false);
  }

  async function handleAddFaq(e) {
    e.preventDefault();
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่มีสิทธิ์เพิ่มข้อมูล');
      return;
    }
    if (!newQ || !newA) return;

    const item = { q: newQ, a: newA };
    let savedInDB = false;
    const adminToken = localStorage.getItem('adminToken') || '';

    try {
      const res = await fetch(`${API_BASE}/faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(item)
      });
      if (res.ok) savedInDB = true;
    } catch (err) {
      console.warn('Create FAQ via Backend API offline, trying direct Supabase...');
    }

    if (!savedInDB && supabaseRest) {
      await supabaseRest.insert('faqs', item);
    }
    setFaqs(prev => [...prev, item]);
    setNewQ('');
    setNewA('');
    setShowAddForm(false);
  }

  async function handleDeleteFaq(index, e) {
    e.stopPropagation();
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่มีสิทธิ์ลบข้อมูล');
      return;
    }

    if (!window.confirm('ต้องการลบคำถามนี้หรือไม่?')) return;
    const item = faqs[index];
    let deletedInDB = false;
    const adminToken = localStorage.getItem('adminToken') || '';

    try {
      const res = await fetch(`${API_BASE}/faqs/${index}${item && item.id ? `?id=${item.id}` : ''}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': adminToken
        }
      });
      if (res.ok) deletedInDB = true;
    } catch (err) {
      console.warn('Delete FAQ via Backend API offline, trying direct Supabase...');
    }

    if (!deletedInDB && supabaseRest && item && item.id) {
      await supabaseRest.delete('faqs', 'id', item.id);
    } else if (!deletedInDB && supabaseRest && item && item.q) {
      await supabaseRest.delete('faqs', 'q', item.q);
    }
    setFaqs(prev => prev.filter((_, i) => i !== index));
  }


  const filtered = faqs.filter(f =>
    !searchQuery ||
    (f.q && f.q.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (f.a && f.a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={s.container}>
      <div style={s.headerRow}>
        <input
          style={s.searchInput}
          placeholder="🔍 ค้นหาคำถาม หรือ คำตอบ..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {isAdmin && (
          <button style={s.addBtn} onClick={() => setShowAddForm(!showAddForm)}>
            <span>{showAddForm ? '✕ ยกเลิก' : '➕ เพิ่มคำถาม FAQ (Admin)'}</span>
          </button>
        )}
      </div>

      {isAdmin && showAddForm && (
        <form onSubmit={handleAddFaq} style={s.newFaqForm}>
          <strong>➕ เพิ่มคำถาม FAQ ใหม่</strong>
          <input
            style={s.input}
            placeholder="คำถาม เช่น โพสต์ทวงหนี้ผ่านเฟซบุ๊กทำได้ไหม..."
            value={newQ}
            onChange={e => setNewQ(e.target.value)}
            required
          />
          <textarea
            style={s.textarea}
            placeholder="คำตอบอธิบายข้อกฎหมาย..."
            value={newA}
            onChange={e => setNewA(e.target.value)}
            required
          />
          <div style={s.formActions}>
            <button type="submit" style={{ ...s.addBtn, borderRadius: 5 }}>
              บันทึก FAQ
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={s.emptyBox}>⚡ กำลังโหลดคำถาม FAQ จาก Supabase...</div>
      ) : filtered.length === 0 ? (
        <div style={s.emptyBox}>
          ℹ️ ไม่พบข้อมูล FAQ ใน Supabase (หรือยังไม่มีรายการตามคำค้นหา)<br />
          {isAdmin && <small>สามารถกดปุ่ม "เพิ่มคำถาม FAQ (Admin)" เพื่อเพิ่มรายการใหม่ได้</small>}
        </div>
      ) : (
        filtered.map((f, i) => {
          const open = openIdx === i;
          return (
            <div key={f.id || i} style={s.item} onClick={() => setOpenIdx(open ? null : i)}>
              <div style={s.question}>
                <span>{f.q}</span>
                <div style={s.rightSide}>
                  {isAdmin && (
                    <button
                      style={s.delBtn}
                      onClick={(e) => handleDeleteFaq(i, e)}
                      title="ลบคำถาม"
                    >
                      🗑️ ลบ
                    </button>
                  )}
                  <span style={s.plus(open)}>+</span>
                </div>
              </div>
              {open && <div style={s.answer}>{f.a}</div>}
            </div>
          );
        })
      )}
    </div>
  );
}

