import React, { useState, useEffect } from 'react';
import { fetchLawsFromSupabase } from '../data/knowledgeBase';
import { formatSection, getLawBadgeInfo, normalizeThaiDigits } from '../utils/lawUtils';

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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '16px 0',
    flexWrap: 'wrap',
    gap: 14
  },
  toolbar: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%'
  },
  filterGroup: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  filterBtn: (active) => ({
    fontFamily: "'Sarabun', sans-serif",
    border: active ? 'none' : '1px solid #C9BBA0',
    background: active ? '#7A1F2B' : '#fff',
    color: active ? '#fff' : '#5a4d3b',
    padding: '8px 18px',
    borderRadius: 20,
    cursor: 'pointer',
    fontSize: 13.5,
    fontWeight: active ? 600 : 400,
    transition: 'all .15s ease',
    boxShadow: active ? '0 2px 8px rgba(122,31,43,0.25)' : 'none'
  }),
  searchForm: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  searchBoxContainer: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    border: '1.5px solid #C9BBA0',
    borderRadius: 24,
    padding: '3px 6px 3px 14px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    transition: 'border-color .15s ease'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: 13.5,
    fontFamily: "'Sarabun', sans-serif",
    minWidth: 230,
    background: 'transparent',
    color: '#3d3326',
    padding: '6px 4px'
  },
  clearInputBtn: {
    background: 'transparent',
    border: 'none',
    color: '#a39281',
    cursor: 'pointer',
    fontSize: 16,
    padding: '2px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1
  },
  searchSubmitBtn: {
    background: '#7A1F2B',
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    padding: '8px 18px',
    fontSize: 13.5,
    fontFamily: "'Noto Serif Thai', serif",
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all .15s ease',
    boxShadow: '0 2px 8px rgba(122,31,43,0.25)'
  },
  resetSearchBtn: {
    background: '#F9ECE8',
    color: '#7A1F2B',
    border: '1px solid #E2A096',
    borderRadius: 20,
    padding: '7px 14px',
    fontSize: 12.5,
    cursor: 'pointer',
    fontFamily: "'Sarabun', sans-serif",
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    transition: 'all .15s ease'
  },
  searchStatusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    color: '#5a4d3b',
    background: '#F5EFE1',
    border: '1px solid #D5C7B0',
    padding: '6px 14px',
    borderRadius: 16,
    margin: '4px 0 14px'
  },
  manageBtn: {
    background: '#7A1F2B',
    color: '#fff',
    border: 'none',
    padding: '7px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12.5,
    fontFamily: "'Noto Serif Thai', serif",
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0 2px 6px rgba(122,31,43,0.2)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#FBF8F0',
    border: '1px solid #C9BBA0',
    borderRadius: 8,
    padding: 22,
    boxShadow: '0 4px 16px rgba(34,26,20,0.08)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    minHeight: 320
  },
  cardHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
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
    fontSize: 16.5,
    margin: '6px 0 10px',
    color: '#591622',
    fontWeight: 700
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

export default function LawView({ isAdmin, onNavigateToLawManagement, initialSearch = '' }) {
  const [laws, setLaws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [appliedQuery, setAppliedQuery] = useState(initialSearch || '');

  useEffect(() => {
    fetchLaws();
  }, []);

  useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== null) {
      setSearchQuery(initialSearch || '');
      setAppliedQuery(initialSearch || '');
      if (initialSearch) {
        setFilter('all');
      }
    }
  }, [initialSearch]);

  async function fetchLaws() {
    setLoading(true);
    const data = await fetchLawsFromSupabase();
    if (data) {
      setLaws(data);
    }
    setLoading(false);
  }

  // ทำการค้นหาเมื่อผู้ใช้กดปุ่ม "ค้นหา" หรือกด Enter
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedQuery(searchQuery.trim());
  };

  // ล้างคำค้นหาทั้งหมด
  const handleResetSearch = () => {
    setSearchQuery('');
    setAppliedQuery('');
  };

  const filtered = laws.filter((l) => {
    const matchesCat = filter === 'all' || l.cat === filter;
    const q = appliedQuery.toLowerCase().trim();
    if (!q) return matchesCat;

    const qNorm = normalizeThaiDigits(q);
    // กรณีผู้ใช้ค้นเป็นเลขมาตรา เช่น "มาตรา 50", "ม.50", "50", "๕๐"
    const strippedSec = qNorm.replace(/^(มาตรา|ม\.|section|sec)\s*/i, '').trim();
    const isSectionNumberQuery = /^\d+(\/\d+)?$/.test(strippedSec);

    const secRaw = String(l.section || '').trim();
    const secNorm = normalizeThaiDigits(secRaw).replace(/^(มาตรา|ม\.)\s*/i, '').trim();

    // 1. ถ้าผู้ใช้ระบุเป็นเลขมาตราโดยตรง (เช่น 50, 70, มาตรา 14) ให้ค้นเฉพาะเลขมาตรานั้นๆ เท่านั้น
    if (isSectionNumberQuery) {
      const matchesSection = (secNorm === strippedSec || secNorm.startsWith(strippedSec + '/'));
      return matchesCat && matchesSection;
    }

    // 2. ถ้าเป็นคำค้นหาทั่วไป (เช่น ข้อความ, หัวข้อ, คำสำคัญ) ให้ค้นหาเฉพาะเนื้อหาของมาตรานั้นๆ
    // หมายเหตุ: ไม่นำไปเทียบกับชื่อเต็มของ พ.ร.บ. หรือปี พ.ศ. (เช่น 2550) เพื่อไม่ให้ดึงมาตราทั้งหมดขึ้นมา
    const qLower = qNorm.toLowerCase();
    const secFormatted = formatSection(l.section).toLowerCase();
    const titleNorm = normalizeThaiDigits(l.title || '').toLowerCase();
    const textNorm = normalizeThaiDigits(l.text || '').toLowerCase();
    const simpleNorm = normalizeThaiDigits(l.simple || '').toLowerCase();
    const penaltyNorm = normalizeThaiDigits(l.penalty || '').toLowerCase();
    const keywordsNorm = Array.isArray(l.keywords)
      ? l.keywords.map((k) => normalizeThaiDigits(String(k)).toLowerCase())
      : [];

    const matchesQuery =
      secNorm === strippedSec ||
      secFormatted.includes(qLower) ||
      titleNorm.includes(qLower) ||
      textNorm.includes(qLower) ||
      simpleNorm.includes(qLower) ||
      penaltyNorm.includes(qLower) ||
      keywordsNorm.some((k) => k.includes(qLower));

    return matchesCat && matchesQuery;
  });

  return (
    <>
      {/* ── Admin Navigation Notice ── */}
      {isAdmin && onNavigateToLawManagement && (
        <div style={s.adminNotice}>
          <div style={{ fontSize: 13, color: '#591622', fontWeight: 600 }}>
            ท่านอยู่ในสิทธิ์ผู้ดูแลระบบ (Admin) — หากต้องการเพิ่ม แก้ไข หรือลบมาตรากฎหมาย สามารถจัดการได้ที่หน้าจัดการกฎหมาย
          </div>
          <button style={s.manageBtn} onClick={onNavigateToLawManagement}>
            ไปยังหน้าจัดการกฎหมาย (Admin Law Management)
          </button>
        </div>
      )}

      {/* ── Header Filter & Search Toolbar ── */}
      <div style={s.headerRow}>
        <div style={s.toolbar}>
          <div style={s.filterGroup}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                style={s.filterBtn(filter === f.id)}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* ฟอร์มและปุ่มกดค้นหา */}
          <form style={s.searchForm} onSubmit={handleSearchSubmit}>
            <div style={s.searchBoxContainer}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A1F2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.75, marginRight: 6 }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                style={s.searchInput}
                placeholder="ค้นหาเลขมาตรา เช่น 70 หรือคำสำคัญ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  style={s.clearInputBtn}
                  onClick={() => setSearchQuery('')}
                  title="ลบข้อความ"
                >
                  ✕
                </button>
              )}
            </div>

            <button type="submit" style={s.searchSubmitBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              ค้นหา
            </button>

            {(appliedQuery || searchQuery) && (
              <button
                type="button"
                style={s.resetSearchBtn}
                onClick={handleResetSearch}
              >
                ล้างคำค้น
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ── แถบแสดงสถานะผลการค้นหาเมื่อมีการค้นหา ── */}
      {appliedQuery && (
        <div style={s.searchStatusBadge}>
          <span>
            ผลการค้นหาสำหรับ <strong>"{appliedQuery}"</strong>
            {filter !== 'all' ? ` ในหมวดหมู่ ${FILTERS.find(f => f.id === filter)?.label}` : ''}
            {' '}• พบ <strong>{filtered.length}</strong> มาตรา
          </span>
          <button
            type="button"
            onClick={handleResetSearch}
            style={{
              background: 'none',
              border: 'none',
              color: '#7A1F2B',
              cursor: 'pointer',
              fontSize: 12.5,
              textDecoration: 'underline',
              padding: 0,
              fontFamily: "'Sarabun', sans-serif"
            }}
          >
            แสดงทั้งหมด
          </button>
        </div>
      )}

      {/* ── Cards Grid ── */}
      <div style={s.grid}>
        {loading ? (
          <div style={s.emptyBox}>กำลังโหลดข้อมูลกฎหมายจาก Supabase...</div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyBox}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#7A1F2B', marginBottom: 8 }}>
              ไม่พบข้อมูลกฎหมายที่ตรงกับเงื่อนไข
            </div>
            <div style={{ fontSize: 13.5, color: '#6b5d4a', marginBottom: 14 }}>
              {appliedQuery
                ? `ไม่พบมาตราที่ตรงกับ "${appliedQuery}" ลองตรวจสอบตัวสะกดหรือค้นหาด้วยคำอื่น`
                : 'ไม่มีข้อมูลกฎหมายในหมวดหมู่นี้'}
            </div>
            {(appliedQuery || filter !== 'all') && (
              <button
                style={s.searchSubmitBtn}
                onClick={() => {
                  setFilter('all');
                  handleResetSearch();
                }}
              >
                แสดงกฎหมายทั้งหมด
              </button>
            )}
          </div>
        ) : (
          filtered.map((l) => {
            const lawInfo = getLawBadgeInfo(l.cat);
            const secClean = normalizeThaiDigits(String(l.section || '')).replace(/^(มาตรา|ม\.)\s*/i, '').trim();
            const targetClean = normalizeThaiDigits(appliedQuery || '').replace(/^(มาตรา|ม\.)\s*/i, '').trim();
            const isTargetHighlight = Boolean(targetClean && secClean === targetClean);

            return (
              <div
                key={l.section || l.id}
                style={{
                  ...s.card,
                  ...(isTargetHighlight ? {
                    border: '2px solid #7A1F2B',
                    boxShadow: '0 8px 24px rgba(122,31,43,0.22)',
                    background: '#FFFDF9'
                  } : {})
                }}
              >
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
                      {isTargetHighlight && (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#7A1F2B',
                          background: '#FDF1EC',
                          border: '1px solid #E2A096',
                          borderRadius: 4,
                          padding: '2px 8px',
                          fontFamily: "'Sarabun', sans-serif"
                        }}>
                          🎯 มาตราที่แนะนำจากแชท
                        </span>
                      )}
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
