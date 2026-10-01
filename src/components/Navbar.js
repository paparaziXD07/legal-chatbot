import React, { useState, useEffect } from 'react';
import LegalSeal from './LegalSeal';

const TABS = [
  { id: 'chat', label: 'สอบถามผ่านแชทบอท' },
  { id: 'law',  label: 'ฐานข้อมูลกฎหมาย' },
  { id: 'faq',  label: 'คำถามที่พบบ่อย (FAQ)' },
  { id: 'dash', label: 'แดชบอร์ดผู้ดูแลระบบ' },
  { id: 'admin-laws', label: 'จัดการกฎหมาย (Admin)' },
  { id: 'history', label: 'ประวัติการแชท (Admin)' },
];

const styles = {
  header: {
    borderBottom: '3px double #7A1F2B',
    padding: '24px 0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '16px' },
  seal: {
    width: 56, height: 56, borderRadius: '50%',
    border: '2px solid #7A1F2B',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#FBF8F0',
    boxShadow: '0 4px 12px rgba(122,31,43,0.15), inset 0 0 0 1px #E4D2A4',
    flexShrink: 0
  },
  eyebrow: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#B98A3D',
    display: 'flex', alignItems: 'center', gap: 8
  },
  apiBadge: {
    background: '#2E5544', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 12,
    fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600
  },
  h1: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 26, margin: '2px 0 0', fontWeight: 700, color: '#591622', letterSpacing: '.01em',
  },
  metaStrip: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11.5, color: '#6b5d4a', textAlign: 'right', lineHeight: 1.6,
    background: '#F7F3E9', padding: '8px 14px', borderRadius: 6, border: '1px solid #E4D2A4'
  },
  navWrapper: (scrolled) => ({
    position: 'sticky',
    top: 0,
    zIndex: 900,
    background: 'rgba(242, 238, 227, 0.96)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    margin: '0 -24px',
    padding: scrolled ? '8px 24px 6px' : '14px 24px 0',
    borderBottom: '2px solid #7A1F2B',
    boxShadow: scrolled ? '0 6px 18px rgba(34, 26, 20, 0.12)' : '0 1px 0 #C9BBA0',
    transition: 'padding .2s ease, box-shadow .2s ease',
  }),
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tabsContainer: {
    display: 'flex',
    gap: 4,
    overflowX: 'auto',
    flex: 1,
    paddingBottom: 2,
  },
  tabBtn: (active) => ({
    fontFamily: "'Noto Serif Thai', serif",
    background: active ? '#7A1F2B' : 'transparent',
    border: 'none', cursor: 'pointer',
    padding: '9px 16px', fontSize: 14,
    color: active ? '#fff' : '#591622',
    borderRadius: '6px 6px 0 0',
    fontWeight: active ? 700 : 500,
    whiteSpace: 'nowrap', transition: 'all .15s ease',
    boxShadow: active ? '0 -2px 8px rgba(122,31,43,0.2)' : 'none'
  }),
};

export default function Navbar({ activeTab, onTabChange, isAdmin, onOpenLoginModal, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.seal} title="ตราช่างกฎหมาย">
            <LegalSeal size={38} color="#7A1F2B" secondaryColor="#B98A3D" showRing={false} />
          </div>
          <div>
            <div style={styles.eyebrow}>
              Knowledge-Based Legal Chatbot
              <span style={styles.apiBadge}>Supabase + OpenThaiGPT</span>
            </div>
            <h1 style={styles.h1}>นิติบอท — พ.ร.บ.คอมพิวเตอร์ &amp; PDPA</h1>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={styles.metaStrip}>
            ระบบตัวกลางอัจฉริยะให้ความรู้กฎหมายดิจิทัล<br />
            ประมวลผลด้วย <strong style={{ color: '#7A1F2B' }}>RAG + Supabase DB + OpenThaiGPT</strong><br />
            <span style={{ fontSize: 10.5, color: '#8a7a60' }}>มหาวิทยาลัยราชภัฏนครศรีธรรมราช</span>
          </div>

          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: '#7A1F2B', color: '#fff', fontSize: 12, padding: '4px 10px',
                borderRadius: 20, fontWeight: 600, fontFamily: "'Sarabun', sans-serif"
              }}>
                ผู้ดูแลระบบ (Admin)
              </span>
              <button
                onClick={onLogout}
                style={{
                  background: '#F9ECE8', border: '1px solid #E2A096', color: '#7A1F2B',
                  borderRadius: 20, padding: '4px 12px', fontSize: 12, cursor: 'pointer',
                  fontFamily: "'Sarabun', sans-serif", fontWeight: 600
                }}
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              style={{
                background: '#2E5544', color: '#fff', border: 'none',
                borderRadius: 20, padding: '5px 14px', fontSize: 12.5, cursor: 'pointer',
                fontFamily: "'Noto Serif Thai', serif", fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 2px 6px rgba(46,85,68,0.2)'
              }}
            >
              เข้าสู่ระบบ Admin
            </button>
          )}
        </div>
      </header>

      {/* Sticky Navigation Bar */}
      <div style={styles.navWrapper(isScrolled)}>
        <nav style={styles.navRow}>
          {/* Scrolled Mini Brand */}
          {isScrolled && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingRight: 10,
                flexShrink: 0,
                cursor: 'pointer',
                animation: 'fade .2s ease'
              }}
              onClick={() => onTabChange('chat')}
              title="กลับสู่หน้าหลัก"
            >
              <LegalSeal size={28} color="#7A1F2B" secondaryColor="#B98A3D" showRing={false} />
              <span style={{
                fontFamily: "'Noto Serif Thai', serif",
                fontWeight: 700,
                fontSize: 15,
                color: '#591622',
                whiteSpace: 'nowrap'
              }}>
                นิติบอท
              </span>
            </div>
          )}

          {/* Tab Navigation Buttons */}
          <div style={styles.tabsContainer}>
            {TABS.filter(t => (t.id !== 'history' && t.id !== 'admin-laws') || isAdmin).map((t) => (
              <button
                key={t.id}
                style={styles.tabBtn(activeTab === t.id)}
                onClick={() => onTabChange(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Scrolled Admin Button */}
          {isScrolled && (
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, paddingLeft: 8, animation: 'fade .2s ease' }}>
              {isAdmin ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    background: '#7A1F2B', color: '#fff', fontSize: 11, padding: '3px 8px',
                    borderRadius: 12, fontWeight: 600, fontFamily: "'Sarabun', sans-serif"
                  }}>
                    Admin
                  </span>
                  <button
                    onClick={onLogout}
                    style={{
                      background: '#F9ECE8', border: '1px solid #E2A096', color: '#7A1F2B',
                      borderRadius: 12, padding: '3px 8px', fontSize: 11, cursor: 'pointer',
                      fontFamily: "'Sarabun', sans-serif", fontWeight: 600
                    }}
                    title="ออกจากระบบแอดมิน"
                  >
                    ออก
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLoginModal}
                  style={{
                    background: '#2E5544', color: '#fff', border: 'none',
                    borderRadius: 16, padding: '4px 10px', fontSize: 11.5, cursor: 'pointer',
                    fontFamily: "'Noto Serif Thai', serif", fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 4px rgba(46,85,68,0.2)'
                  }}
                  title="เข้าสู่ระบบผู้ดูแลระบบ"
                >
                  Admin
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </>
  );
}


