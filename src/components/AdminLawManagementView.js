import React, { useState, useEffect, useMemo } from 'react';
import { fetchLawsFromSupabase } from '../data/knowledgeBase';
import supabaseRest from '../supabaseClient';
import LawModal from './LawModal';
import { formatSection, getLawBadgeInfo } from '../utils/lawUtils';

const API_BASE = 'http://localhost:5000/api';

const s = {
  container: {
    animation: 'fade .25s ease',
    marginTop: 20,
    fontFamily: "'Sarabun', sans-serif"
  },

  /* Lock Screen for Non-Admin */
  lockCard: {
    background: '#FBF8F0',
    border: '2px solid #7A1F2B',
    borderRadius: 12,
    padding: '48px 24px',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(122,31,43,0.12)',
    maxWidth: 580,
    margin: '40px auto'
  },
  lockTitle: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 22,
    color: '#591622',
    marginBottom: 12,
    fontWeight: 700
  },
  lockSubtitle: {
    fontSize: 14.5,
    color: '#6b5d4a',
    lineHeight: 1.6,
    marginBottom: 24
  },
  loginBtn: {
    background: '#7A1F2B',
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    padding: '12px 28px',
    fontSize: 15,
    fontFamily: "'Noto Serif Thai', serif",
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(122,31,43,0.25)',
    transition: 'all .15s ease'
  },

  /* Header Panel */
  headerPanel: {
    background: '#FBF8F0',
    border: '1px solid #C9BBA0',
    borderRadius: 10,
    padding: '20px 24px',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    boxShadow: '0 4px 16px rgba(34,26,20,0.06)'
  },
  titleGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  h2: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 22,
    color: '#591622',
    margin: 0,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  subtitle: {
    fontSize: 13,
    color: '#6b5d4a',
    fontFamily: "'IBM Plex Mono', monospace"
  },
  actionToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap'
  },
  primaryBtn: {
    background: '#2E5544',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '10px 18px',
    fontSize: 13.5,
    fontFamily: "'Noto Serif Thai', serif",
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0 2px 8px rgba(46,85,68,0.2)',
    transition: 'all .15s ease'
  },
  secondaryBtn: {
    background: '#F7F3E9',
    color: '#591622',
    border: '1px solid #C9BBA0',
    borderRadius: 6,
    padding: '9px 14px',
    fontSize: 13,
    fontFamily: "'Sarabun', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all .15s ease'
  },

  /* KPI Grid */
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 20
  },
  kpiCard: {
    background: '#FBF8F0',
    border: '1px solid #C9BBA0',
    borderRadius: 8,
    padding: '16px 18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  kpiVal: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 26,
    color: '#7A1F2B',
    fontWeight: 700
  },
  kpiLbl: {
    fontSize: 12.5,
    color: '#3d3326',
    fontWeight: 600,
    marginTop: 4
  },
  kpiSub: {
    fontSize: 11,
    color: '#8a7a60',
    fontFamily: "'IBM Plex Mono', monospace",
    marginTop: 2
  },

  /* Search & Filter Bar */
  filterPanel: {
    background: '#FBF8F0',
    border: '1px solid #C9BBA0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: '1 1 260px',
    padding: '9px 14px',
    border: '1px solid #C9BBA0',
    borderRadius: 6,
    fontSize: 13.5,
    fontFamily: "'Sarabun', sans-serif",
    outline: 'none',
    background: '#fff'
  },
  selectFilter: {
    padding: '9px 12px',
    border: '1px solid #C9BBA0',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "'Sarabun', sans-serif",
    background: '#fff',
    outline: 'none',
    color: '#3d3326',
    cursor: 'pointer'
  },

  /* Grid Layout for Laws */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 20
  },
  card: {
    background: '#FBF8F0',
    border: '1px solid #C9BBA0',
    borderRadius: 8,
    padding: 20,
    boxShadow: '0 4px 16px rgba(34,26,20,0.06)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    minHeight: 340
  },
  cardHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  tag: (isPdpa) => ({
    fontFamily: "'Noto Serif Thai', 'IBM Plex Mono', monospace, serif",
    fontSize: 12,
    letterSpacing: '.03em',
    fontWeight: 700,
    color: '#fff',
    background: isPdpa ? '#2E5544' : '#7A1F2B',
    padding: '4px 10px',
    borderRadius: 4,
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
  }),
  lawBadge: (lawInfo) => ({
    fontFamily: "'Sarabun', sans-serif",
    fontSize: 11.5,
    fontWeight: 600,
    color: lawInfo.color,
    background: lawInfo.bg,
    border: `1px solid ${lawInfo.border}`,
    padding: '3px 9px',
    borderRadius: 4,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    userSelect: 'none'
  }),
  cardActions: {
    display: 'flex',
    gap: 6
  },
  editBtn: {
    background: '#F4E7CE',
    border: '1px solid #C9BBA0',
    color: '#591622',
    borderRadius: 4,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4
  },
  deleteBtn: {
    background: '#F9ECE8',
    border: '1px solid #E2A096',
    color: '#7A1F2B',
    borderRadius: 4,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4
  },
  cardTitle: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 16.5,
    margin: '4px 0 10px',
    color: '#591622',
    fontWeight: 700
  },
  cardText: {
    fontSize: 13.5,
    lineHeight: 1.6,
    color: '#3d3326',
    margin: '0 0 14px',
    maxHeight: '130px',
    overflowY: 'auto',
    paddingRight: '6px',
    wordBreak: 'break-word'
  },
  penalty: {
    fontSize: 12,
    color: '#7a1f2b',
    background: '#F9ECE8',
    borderLeft: '3px solid #7A1F2B',
    padding: '8px 12px',
    borderRadius: 4,
    marginBottom: 8,
    maxHeight: '85px',
    overflowY: 'auto',
    paddingRight: '6px',
    wordBreak: 'break-word'
  },
  simple: {
    fontSize: 12.5,
    color: '#2E5544',
    background: '#EBF4EF',
    borderLeft: '3px solid #2E5544',
    padding: '8px 12px',
    borderRadius: 4,
    maxHeight: '95px',
    overflowY: 'auto',
    paddingRight: '6px',
    wordBreak: 'break-word'
  },
  keywordsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 10
  },
  keywordBadge: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10.5,
    background: '#EAE1CE',
    color: '#591622',
    padding: '2px 6px',
    borderRadius: 3
  },
  emptyBox: {
    padding: '36px 20px',
    background: '#FBF8F0',
    border: '1px dashed #C9BBA0',
    borderRadius: 8,
    textAlign: 'center',
    color: '#6b5d4a',
    gridColumn: '1 / -1'
  }
};

export default function AdminLawManagementView({ isAdmin, onOpenLoginModal }) {
  const [laws, setLaws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLaw, setEditingLaw] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadLaws();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  async function loadLaws() {
    setLoading(true);
    try {
      const data = await fetchLawsFromSupabase();
      if (data) setLaws(data);
    } catch (err) {
      console.error('Error fetching laws:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter Laws
  const filteredLaws = useMemo(() => {
    return laws.filter((l) => {
      const matchesCat = selectedCat === 'all' || l.cat === selectedCat;
      const q = searchQuery.toLowerCase().trim();
      const secRaw = (l.section ? String(l.section) : '').toLowerCase();
      const secFormatted = formatSection(l.section).toLowerCase();
      const lawInfo = getLawBadgeInfo(l.cat);
      const matchesQuery =
        !q ||
        secRaw.includes(q) ||
        secFormatted.includes(q) ||
        lawInfo.label.toLowerCase().includes(q) ||
        lawInfo.shortName.toLowerCase().includes(q) ||
        lawInfo.fullName.toLowerCase().includes(q) ||
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.text && l.text.toLowerCase().includes(q)) ||
        (l.keywords &&
          Array.isArray(l.keywords) &&
          l.keywords.some((k) => typeof k === 'string' && k.toLowerCase().includes(q)));
      return matchesCat && matchesQuery;
    });
  }, [laws, selectedCat, searchQuery]);

  // Statistics
  const totalCount = laws.length;
  const computerCount = useMemo(() => laws.filter((l) => l.cat === 'computer').length, [laws]);
  const pdpaCount = useMemo(() => laws.filter((l) => l.cat === 'pdpa').length, [laws]);
  const totalKeywords = useMemo(() => {
    return laws.reduce((acc, l) => acc + (Array.isArray(l.keywords) ? l.keywords.length : 0), 0);
  }, [laws]);

  async function handleSaveLaw(lawData) {
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่มีสิทธิ์เพิ่มหรือแก้ไขข้อมูล');
      return;
    }

    let savedInDB = false;
    const adminToken = localStorage.getItem('adminToken') || 'admin-secret-token-6611425008';

    if (editingLaw) {
      try {
        const res = await fetch(`${API_BASE}/laws/${encodeURIComponent(editingLaw.section)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': adminToken
          },
          body: JSON.stringify(lawData)
        });
        if (res.ok) savedInDB = true;
      } catch (err) {
        console.warn('Update via Backend API offline, using Supabase direct fallback');
      }

      if (!savedInDB && supabaseRest) {
        const { id, created_at, ...cleanPayload } = lawData;
        const { error } = await supabaseRest.update('laws', cleanPayload, 'section', editingLaw.section);
        if (!error) savedInDB = true;
      }

      setLaws((prev) => prev.map((l) => (l.section === editingLaw.section ? lawData : l)));
    } else {
      try {
        const res = await fetch(`${API_BASE}/laws`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': adminToken
          },
          body: JSON.stringify(lawData)
        });
        if (res.ok) savedInDB = true;
      } catch (err) {
        console.warn('Create via Backend API offline, using Supabase direct fallback');
      }

      if (!savedInDB && supabaseRest) {
        const { id, created_at, ...cleanPayload } = lawData;
        const { error } = await supabaseRest.insert('laws', cleanPayload);
        if (!error) savedInDB = true;
      }

      setLaws((prev) => [...prev, lawData]);
    }
    setEditingLaw(null);
  }

  async function handleDeleteLaw(section) {
    if (!isAdmin) {
      alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่มีสิทธิ์ลบข้อมูล');
      return;
    }

    if (!window.confirm(`คุณต้องการลบมาตรา "${section}" ออกจากฐานข้อมูลหรือไม่?`)) return;
    let deletedInDB = false;
    const adminToken = localStorage.getItem('adminToken') || 'admin-secret-token-6611425008';

    try {
      const res = await fetch(`${API_BASE}/laws/${encodeURIComponent(section)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      if (res.ok) deletedInDB = true;
    } catch (err) {
      console.warn('Delete via Backend API offline, using Supabase direct fallback');
    }

    if (!deletedInDB && supabaseRest) {
      await supabaseRest.delete('laws', 'section', section);
    }
    setLaws((prev) => prev.filter((l) => l.section !== section));
  }

  // Render Access Lock Screen if not Admin
  if (!isAdmin) {
    return (
      <div style={s.container}>
        <div style={s.lockCard}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <h2 style={s.lockTitle}>เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น</h2>
          <p style={s.lockSubtitle}>
            หน้านี้ใช้สำหรับเพิ่ม แก้ไข และจัดการฐานข้อมูลกฎหมายคอมพิวเตอร์ &amp; PDPA ของระบบนิติบอท<br />
            กรุณาเข้าสู่ระบบด้วยบัญชีแอดมินเพื่อสิทธิ์การเข้าถึงข้อมูล
          </p>
          <button style={s.loginBtn} onClick={onOpenLoginModal}>
            เข้าสู่ระบบ Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      {/* ── 1. Top Header & Toolbar ── */}
      <div style={s.headerPanel}>
        <div style={s.titleGroup}>
          <h2 style={s.h2}>
            <span>จัดการฐานข้อมูลกฎหมาย (Admin Law Management)</span>
          </h2>
          <div style={s.subtitle}>
            เพิ่ม แก้ไข และอัปเดตบทบัญญัติ สาระสำคัญ บทลงโทษ และ Keywords สำหรับ RAG Search
          </div>
        </div>

        <div style={s.actionToolbar}>
          <button style={s.secondaryBtn} onClick={loadLaws} title="รีเฟรชข้อมูลล่าสุดจาก Supabase">
            โหลดใหม่
          </button>
          <button
            style={s.primaryBtn}
            onClick={() => {
              setEditingLaw(null);
              setIsModalOpen(true);
            }}
          >
            เพิ่มมาตราใหม่
          </button>
        </div>
      </div>

      {/* ── 2. KPI Summary Cards ── */}
      <div style={s.kpiGrid}>
        <div style={s.kpiCard}>
          <div style={s.kpiVal}>{totalCount}</div>
          <div style={s.kpiLbl}>จำนวนมาตรากฎหมายทั้งหมด</div>
          <div style={s.kpiSub}>Total Law Entries</div>
        </div>

        <div style={s.kpiCard}>
          <div style={s.kpiVal}>{computerCount}</div>
          <div style={s.kpiLbl}>พ.ร.บ. คอมพิวเตอร์</div>
          <div style={s.kpiSub}>Computer Crime Act</div>
        </div>

        <div style={s.kpiCard}>
          <div style={s.kpiVal}>{pdpaCount}</div>
          <div style={s.kpiLbl}>PDPA พ.ศ. 2562</div>
          <div style={s.kpiSub}>Data Protection Act</div>
        </div>

        <div style={s.kpiCard}>
          <div style={s.kpiVal}>{totalKeywords}</div>
          <div style={s.kpiLbl}>Keywords ดรรชนีค้นหา</div>
          <div style={s.kpiSub}>Indexed Search Terms</div>
        </div>
      </div>

      {/* ── 3. Search & Filter Bar ── */}
      <div style={s.filterPanel}>
        <input
          style={s.searchInput}
          type="text"
          placeholder="ค้นหาด้วยเลขมาตรา, คำอธิบาย หรือ Keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          style={s.selectFilter}
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
        >
          <option value="all">หมวดหมู่กฎหมายทั้งหมด</option>
          <option value="computer">พ.ร.บ. คอมพิวเตอร์</option>
          <option value="pdpa">PDPA พ.ศ. 2562</option>
        </select>

        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: '#8a7a60', fontFamily: "'IBM Plex Mono', monospace" }}>
          แสดง {filteredLaws.length} จาก {totalCount} รายการ
        </span>
      </div>

      {/* ── 4. Law Cards Grid for Management ── */}
      <div style={s.grid}>
        {loading ? (
          <div style={s.emptyBox}>⚡ กำลังดึงข้อมูลมาตรากฎหมายจาก Supabase...</div>
        ) : filteredLaws.length === 0 ? (
          <div style={s.emptyBox}>
            ไม่พบมาตรากฎหมายตรงตามเงื่อนไขที่ระบุ<br />
            <button
              style={{ ...s.primaryBtn, marginTop: 12 }}
              onClick={() => {
                setEditingLaw(null);
                setIsModalOpen(true);
              }}
            >
              เพิ่มมาตรากฎหมายใหม่
            </button>
          </div>
        ) : (
          filteredLaws.map((l) => {
            const lawInfo = getLawBadgeInfo(l.cat);
            return (
              <div key={l.section || l.id} style={s.card}>
                <div>
                  <div style={s.cardHead}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={s.tag(lawInfo.isPdpa)}>{formatSection(l.section)}</span>
                      <span
                        className="law-cat-tag"
                        style={s.lawBadge(lawInfo)}
                        title={`${lawInfo.fullName} (คลิกเพื่อกรอง)`}
                        onClick={() => setSelectedCat(lawInfo.id)}
                      >
                        {lawInfo.label}
                      </span>
                    </div>
                    <div style={s.cardActions}>
                    <button
                      style={s.editBtn}
                      title="แก้ไขมาตรา"
                      onClick={() => {
                        setEditingLaw(l);
                        setIsModalOpen(true);
                      }}
                    >
                      แก้ไข
                    </button>
                    <button
                      style={s.deleteBtn}
                      title="ลบมาตรา"
                      onClick={() => handleDeleteLaw(l.section)}
                    >
                      ลบ
                    </button>
                  </div>
                </div>

                <h4 style={s.cardTitle}>{l.title}</h4>
                <p style={s.cardText} className="law-scroll-text">{l.text}</p>
              </div>

              <div>
                {l.penalty && (
                  <div style={s.penalty} className="law-scroll-text">
                    <strong>บทกำหนดโทษ:</strong> {l.penalty}
                  </div>
                )}
                {l.simple && (
                  <div style={s.simple} className="law-scroll-text">
                    <strong>สรุปสาระสำคัญ:</strong> {l.simple}
                  </div>
                )}
                {Array.isArray(l.keywords) && l.keywords.length > 0 && (
                  <div style={s.keywordsWrap}>
                    {l.keywords.map((kw, i) => (
                      <span key={i} style={s.keywordBadge}>
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* ── 5. Add / Edit Law Modal ── */}
      <LawModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLaw(null);
        }}
        onSave={handleSaveLaw}
        initialData={editingLaw}
      />
    </div>
  );
}
