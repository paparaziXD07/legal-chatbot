import React, { useState, useEffect } from 'react';
import { fetchLawsFromSupabase } from '../data/knowledgeBase';
import { formatSection, getLawBadgeInfo } from '../utils/lawUtils';

const FILTERS = [
  { id: 'all',      label: 'ทั้งหมด' },
  { id: 'computer', label: 'พ.ร.บ.คอมพิวเตอร์' },
  { id: 'pdpa',     label: 'PDPA' },
];

const s = {
  adminNotice: {
    background: '#FBF8F0',
    border: '1px solid #C9BBA0',
    borderLeft: '4px solid #7A1F2B',
    borderRadius: 8,
    padding: '12px 18px',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12
  },
  headerRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    margin: '16px 0', flexWrap: 'wrap', gap: 14
  },
  toolbar: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  filterBtn: (active) => ({
    fontFamily: "'Sarabun', sans-serif",
    border: active ? 'none' : '1px solid #C9BBA0',
    background: active ? '#7A1F2B' : '#fff',
    color: active ? '#fff' : '#5a4d3b',
    padding: '8px 18px', borderRadius: 20, cursor: 'pointer', fontSize: 13.5,
    fontWeight: active ? 600 : 400, transition: 'all .15s ease'
  }),
  searchInput: {
    padding: '9px 14px', border: '1px solid #C9BBA0', borderRadius: 20,
    fontSize: 13.5, fontFamily: "'Sarabun', sans-serif", outline: 'none',
    minWidth: 240, background: '#fff'
  },
  manageBtn: {
    background: '#7A1F2B', color: '#fff', border: 'none',
    padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12.5,
    fontFamily: "'Noto Serif Thai', serif", fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', gap: 6,
    boxShadow: '0 2px 6px rgba(122,31,43,0.2)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#FBF8F0', border: '1px solid #C9BBA0',
    borderRadius: 8, padding: 22,
    boxShadow: '0 4px 16px rgba(34,26,20,0.08)',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    position: 'relative',
    minHeight: 320
  },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  sectionBadge: (isPdpa) => ({
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
  cardTitle: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 16.5, margin: '6px 0 10px', color: '#591622', fontWeight: 700
  },
  cardText: {
    fontSize: 13.5,
    lineHeight: 1.65,
    color: '#3d3326',
    margin: '0 0 14px',
    maxHeight: '130px',
    overflowY: 'auto',
    paddingRight: '6px',
    wordBreak: 'break-word'
  },
  penalty: {
    fontSize: 12, color: '#7a1f2b', background: '#F9ECE8',
    borderLeft: '3px solid #7A1F2B', padding: '8px 12px', borderRadius: 4, marginBottom: 8,
    maxHeight: '85px',
    overflowY: 'auto',
    paddingRight: '6px',
    wordBreak: 'break-word'
  },
  simple: {
    fontSize: 12.5, color: '#2E5544', background: '#EBF4EF',
    borderLeft: '3px solid #2E5544', padding: '8px 12px',
    borderRadius: 4,
    maxHeight: '95px',
    overflowY: 'auto',
    paddingRight: '6px',
    wordBreak: 'break-word'
  },
  emptyBox: {
    padding: '32px 20px',
    background: '#FBF8F0',
    border: '1px dashed #C9BBA0',
    borderRadius: 8,
    textAlign: 'center',
    color: '#6b5d4a',
    gridColumn: '1 / -1'
  }
};

export default function LawView({ isAdmin, onNavigateToLawManagement }) {
  const [laws, setLaws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLaws();
  }, []);

  async function fetchLaws() {
    setLoading(true);
    const data = await fetchLawsFromSupabase();
    if (data) {
      setLaws(data);
    }
    setLoading(false);
  }

  const filtered = laws.filter((l) => {
    const matchesCat = filter === 'all' || l.cat === filter;
    const q = searchQuery.toLowerCase().trim();
    const secRaw = (l.section ? String(l.section) : '').toLowerCase();
    const secFormatted = formatSection(l.section).toLowerCase();
    const lawInfo = getLawBadgeInfo(l.cat);
    const matchesQuery = !q ||
      secRaw.includes(q) ||
      secFormatted.includes(q) ||
      lawInfo.label.toLowerCase().includes(q) ||
      lawInfo.shortName.toLowerCase().includes(q) ||
      lawInfo.fullName.toLowerCase().includes(q) ||
      (l.title && l.title.toLowerCase().includes(q)) ||
      (l.text && l.text.toLowerCase().includes(q)) ||
      (l.keywords && Array.isArray(l.keywords) && l.keywords.some((k) => typeof k === 'string' && k.toLowerCase().includes(q)));
    return matchesCat && matchesQuery;
  });

  return (
    <>
      {/* ── Admin Navigation Notice ── */}
      {isAdmin && onNavigateToLawManagement && (
        <div style={s.adminNotice}>
          <div style={{ fontSize: 13, color: '#591622', fontWeight: 600 }}>
            👤 ท่านอยู่ในสิทธิ์ผู้ดูแลระบบ (Admin) — หากต้องการเพิ่ม แก้ไข หรือลบมาตรากฎหมาย สามารถจัดการได้ที่หน้าจัดการกฎหมาย
          </div>
          <button style={s.manageBtn} onClick={onNavigateToLawManagement}>
            ⚙️ ไปยังหน้าจัดการกฎหมาย (Admin Law Management)
          </button>
        </div>
      )}

      <div style={s.headerRow}>
        <div style={s.toolbar}>
          {FILTERS.map((f) => (
            <button key={f.id} style={s.filterBtn(filter === f.id)} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
          <input
            style={s.searchInput}
            placeholder="🔍 ค้นตามเลขมาตรา หรือคำสำคัญ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={s.grid}>
        {loading ? (
          <div style={s.emptyBox}>⚡ กำลังโหลดข้อมูลกฎหมายจาก Supabase...</div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyBox}>
            ℹ️ ไม่พบข้อมูลกฎหมายตามเงื่อนไขการค้นหา
          </div>
        ) : (
          filtered.map((l) => {
            const lawInfo = getLawBadgeInfo(l.cat);
            return (
              <div key={l.section || l.id} style={s.card}>
                <div>
                  <div style={s.cardHead}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={s.sectionBadge(lawInfo.isPdpa)}>
                        {formatSection(l.section)}
                      </span>
                      <span
                        className="law-cat-tag"
                        style={s.lawBadge(lawInfo)}
                        title={`${lawInfo.fullName} (คลิกเพื่อกรองเฉพาะกฎหมายนี้)`}
                        onClick={() => setFilter(lawInfo.id)}
                      >
                        {lawInfo.label}
                      </span>
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
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

