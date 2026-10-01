import React, { useState, useEffect, useMemo } from 'react';
import { fetchChatLogs, deleteChatLog, clearAllChatLogs } from '../data/knowledgeBase';

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

  /* Header Section */
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
  toolBtn: (variant = 'secondary') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all .15s ease',
    fontFamily: "'Sarabun', sans-serif",
    border: variant === 'danger' ? '1px solid #E2A096' : '1px solid #C9BBA0',
    background: variant === 'danger' ? '#F9ECE8' : variant === 'primary' ? '#7A1F2B' : '#F7F3E9',
    color: variant === 'danger' ? '#7A1F2B' : variant === 'primary' ? '#fff' : '#4d4233',
    boxShadow: variant === 'primary' ? '0 2px 8px rgba(122,31,43,0.2)' : 'none'
  }),

  /* KPI Grid */
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
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
    flex: '1 1 240px',
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

  /* Main Log Table */
  tablePanel: {
    background: '#FBF8F0',
    border: '1px solid #C9BBA0',
    borderRadius: 8,
    padding: 20,
    boxShadow: '0 4px 16px rgba(34,26,20,0.06)'
  },
  logTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
    fontFamily: "'Sarabun', sans-serif"
  },
  th: {
    background: '#F5EFE1',
    color: '#591622',
    textAlign: 'left',
    padding: '12px 14px',
    borderBottom: '2px solid #C9BBA0',
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 13.5,
    fontWeight: 700,
    whiteSpace: 'nowrap'
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #E6DAC8',
    verticalAlign: 'top',
    color: '#3d3326'
  },
  intentBadge: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    background: '#F4E7CE',
    color: '#7A1F2B',
    padding: '3px 8px',
    borderRadius: 4,
    display: 'inline-block',
    fontWeight: 600
  },
  modelBadge: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10.5,
    background: '#2E5544',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: 4,
    display: 'inline-block',
    fontWeight: 500
  },

  /* Modal Overlay for Detail View */
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(34, 26, 20, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11000,
    padding: 20
  },
  modalContent: {
    background: '#FBF8F0',
    border: '2px solid #7A1F2B',
    borderRadius: 12,
    maxWidth: 680,
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto',
    padding: 24,
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #C9BBA0',
    paddingBottom: 12
  },
  modalTitle: {
    fontFamily: "'Noto Serif Thai', serif",
    fontSize: 18,
    color: '#591622',
    margin: 0,
    fontWeight: 700
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 22,
    cursor: 'pointer',
    color: '#8a7a60'
  },
  sectionBox: {
    background: '#fff',
    border: '1px solid #E4D2A4',
    borderRadius: 8,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#7A1F2B',
    textTransform: 'uppercase',
    letterSpacing: '.05em',
    fontFamily: "'IBM Plex Mono', monospace"
  },
  sectionText: {
    fontSize: 14,
    color: '#2c251c',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap'
  },
  reasoningStep: {
    fontSize: 12.5,
    color: '#524536',
    background: '#F7F3E9',
    padding: '6px 10px',
    borderRadius: 4,
    borderLeft: '3px solid #B98A3D',
    marginBottom: 4,
    fontFamily: "'Sarabun', sans-serif"
  }
};

export default function AdminChatHistoryView({ isAdmin, onOpenLoginModal }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedLog, setSelectedLog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadLogs();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await fetchChatLogs();
      setLogs(data || []);
    } catch (err) {
      console.error('Error loading chat logs:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter & Sort Logic
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          (log.userMessage && log.userMessage.toLowerCase().includes(q)) ||
          (log.botResponse && log.botResponse.toLowerCase().includes(q)) ||
          (log.detectedIntent && log.detectedIntent.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'computer') {
        result = result.filter((log) => log.detectedIntent && log.detectedIntent.includes('มาตรา'));
      } else if (selectedCategory === 'pdpa') {
        result = result.filter((log) => log.detectedIntent && log.detectedIntent.toUpperCase().includes('PDPA'));
      } else if (selectedCategory === 'general') {
        result = result.filter((log) => !log.detectedIntent || log.detectedIntent.includes('ทั่วไป'));
      }
    }

    // Model filter
    if (selectedModel !== 'all') {
      result = result.filter((log) => log.modelUsed && log.modelUsed.includes(selectedModel));
    }

    // Sort order
    result.sort((a, b) => {
      if (sortOrder === 'newest') return (b.id || 0) - (a.id || 0);
      return (a.id || 0) - (b.id || 0);
    });

    return result;
  }, [logs, searchQuery, selectedCategory, selectedModel, sortOrder]);

  // Statistics calculation
  const totalLogsCount = logs.length;
  const uniqueIntentsCount = useMemo(() => {
    const set = new Set(logs.map((l) => l.detectedIntent).filter(Boolean));
    return set.size;
  }, [logs]);

  const reasoningCount = useMemo(() => {
    return logs.filter((l) => l.modelUsed && l.modelUsed.includes('Reasoning')).length;
  }, [logs]);

  async function handleDeleteSingle(id) {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายการประวัติการแชท ID #${id}?`)) return;
    setDeletingId(id);
    const success = await deleteChatLog(id);
    if (success) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
      if (selectedLog && selectedLog.id === id) {
        setSelectedLog(null);
      }
    } else {
      alert('ไม่สามารถลบรายการได้ กรุณาลองใหม่อีกครั้ง');
    }
    setDeletingId(null);
  }

  async function handleClearAll() {
    if (!window.confirm('คำเตือน: คุณต้องการล้างประวัติการสนทนาทั้งหมดในระบบหรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้')) return;
    setLoading(true);
    const success = await clearAllChatLogs();
    if (success) {
      setLogs([]);
      setSelectedLog(null);
      alert('ล้างประวัติการสนทนาทั้งหมดเรียบร้อยแล้ว');
    } else {
      alert('เกิดข้อผิดพลาดในการล้างประวัติ กรุณาลองใหม่อีกครั้ง');
    }
    setLoading(false);
  }

  // Export CSV
  function handleExportCSV() {
    if (filteredLogs.length === 0) {
      alert('ไม่มีข้อมูลประวัติสำหรับการส่งออก');
      return;
    }
    const headers = ['ID', 'Timestamp', 'User Message', 'Detected Intent', 'AI Model', 'Bot Response'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${(l.timestamp || '').replace(/"/g, '""')}"`,
      `"${(l.userMessage || '').replace(/"/g, '""')}"`,
      `"${(l.detectedIntent || '').replace(/"/g, '""')}"`,
      `"${(l.modelUsed || '').replace(/"/g, '""')}"`,
      `"${(l.botResponse || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_chat_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export JSON
  function handleExportJSON() {
    if (filteredLogs.length === 0) {
      alert('ไม่มีข้อมูลประวัติสำหรับการส่งออก');
      return;
    }
    const jsonContent = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_chat_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Render Access Lock Screen if not Admin
  if (!isAdmin) {
    return (
      <div style={s.container}>
        <div style={s.lockCard}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <h2 style={s.lockTitle}>เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น</h2>
          <p style={s.lockSubtitle}>
            หน้านี้ใช้สำหรับเรียกดู บันทึก และจัดการประวัติการสนทนาของระบบนิติบอททั้งหมด<br />
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
            <span>ประวัติการสนทนาของระบบ (Admin Chat History)</span>
          </h2>
          <div style={s.subtitle}>
            บันทึกประวัติการสอบถามกฎหมายคอมพิวเตอร์ &amp; PDPA จากผู้ใช้งานผ่านระบบ AI
          </div>
        </div>

        <div style={s.actionToolbar}>
          <button style={s.toolBtn('secondary')} onClick={loadLogs} title="โหลดข้อมูลล่าสุด">
            โหลดใหม่
          </button>
          <button style={s.toolBtn('secondary')} onClick={handleExportCSV} title="ส่งออกเป็นไฟล์ CSV">
            Export CSV
          </button>
          <button style={s.toolBtn('secondary')} onClick={handleExportJSON} title="ส่งออกเป็นไฟล์ JSON">
            Export JSON
          </button>
          <button style={s.toolBtn('danger')} onClick={handleClearAll} title="ล้างประวัติการสนทนาทั้งหมด">
            ล้างประวัติทั้งหมด
          </button>
        </div>
      </div>

      {/* ── 2. KPI Summary Cards ── */}
      <div style={s.kpiGrid}>
        <div style={s.kpiCard}>
          <div style={s.kpiVal}>{totalLogsCount}</div>
          <div style={s.kpiLbl}>ประวัติการสนทนาทั้งหมด</div>
          <div style={s.kpiSub}>Total Log Records</div>
        </div>

        <div style={s.kpiCard}>
          <div style={s.kpiVal}>{uniqueIntentsCount}</div>
          <div style={s.kpiLbl}>หมวดหมู่ Intent ที่ตรวจพบ</div>
          <div style={s.kpiSub}>Distinct Legal Intent</div>
        </div>

        <div style={s.kpiCard}>
          <div style={s.kpiVal}>{reasoningCount}</div>
          <div style={s.kpiLbl}>การประมวลผล OpenThaiGPT R1</div>
          <div style={s.kpiSub}>Chain-of-Thought Reasoning</div>
        </div>

        <div style={s.kpiCard}>
          <div style={s.kpiVal}>{filteredLogs.length}</div>
          <div style={s.kpiLbl}>รายการที่ตรงตามเงื่อนไข</div>
          <div style={s.kpiSub}>Filtered Results</div>
        </div>
      </div>

      {/* ── 3. Search & Filter Bar ── */}
      <div style={s.filterPanel}>
        <input
          style={s.searchInput}
          type="text"
          placeholder="ค้นหาคำถาม, คำตอบ หรือชื่อมาตรา..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          style={s.selectFilter}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">หมวดหมู่กฎหมายทั้งหมด</option>
          <option value="computer">พ.ร.บ. คอมพิวเตอร์</option>
          <option value="pdpa">PDPA พ.ศ. 2562</option>
          <option value="general">ทั่วไป / ไม่ตรงมาตรา</option>
        </select>

        <select
          style={s.selectFilter}
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="all">โมเดล AI ทั้งหมด</option>
          <option value="R1">OpenThaiGPT R1 (32B Reasoning)</option>
          <option value="1.6">OpenThaiGPT 1.6 (72B)</option>
        </select>

        <select
          style={s.selectFilter}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">ล่าสุดขึ้นก่อน (Newest)</option>
          <option value="oldest">เก่าสุดขึ้นก่อน (Oldest)</option>
        </select>

        {searchQuery && (
          <button
            style={{ ...s.toolBtn('secondary'), padding: '6px 10px', fontSize: 12 }}
            onClick={() => setSearchQuery('')}
          >
            ✕ ล้างการค้นหา
          </button>
        )}
      </div>

      {/* ── 4. Main Chat Log Table ── */}
      <div style={s.tablePanel}>
        <div style={{ overflowX: 'auto' }}>
          <table style={s.logTable}>
            <thead>
              <tr>
                <th style={s.th}>#ID / เวลาที่ถาม</th>
                <th style={s.th}>คำถามของผู้ใช้ (User Query)</th>
                <th style={s.th}>Intent ที่ตรวจจับได้ (RAG Match)</th>
                <th style={s.th}>โมเดล AI ที่ตอบ</th>
                <th style={s.th}>คำตอบระบบ / สรุปความ</th>
                <th style={{ ...s.th, textAlign: 'center' }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#8a7a60', padding: 30 }}>
                    กำลังดึงข้อมูลประวัติการแชทจากระบบ...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} style={{ background: '#fff' }}>
                    <td style={{ ...s.td, whiteSpace: 'nowrap', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                      <strong>#{log.id}</strong>
                      <br />
                      <span style={{ color: '#8a7a60', fontSize: 10.5 }}>{log.timestamp}</span>
                    </td>
                    <td style={{ ...s.td, fontWeight: 600, maxWidth: 220, wordBreak: 'break-word' }}>
                      {log.userMessage}
                    </td>
                    <td style={s.td}>
                      <span style={s.intentBadge}>{log.detectedIntent || 'ทั่วไป'}</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.modelBadge}>{log.modelUsed || 'OpenThaiGPT'}</span>
                    </td>
                    <td style={{ ...s.td, maxWidth: 300, fontSize: 12.5, color: '#4a3f30', lineHeight: 1.45 }}>
                      {log.botResponse && log.botResponse.length > 120
                        ? `${log.botResponse.slice(0, 120)}...`
                        : log.botResponse}
                    </td>
                    <td style={{ ...s.td, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          style={{
                            background: '#F4E7CE',
                            border: '1px solid #C9BBA0',
                            color: '#591622',
                            borderRadius: 4,
                            padding: '4px 8px',
                            fontSize: 12,
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                          title="ดูรายละเอียดการสนทนาฉบับเต็ม"
                        >
                          รายละเอียด
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(log.id)}
                          disabled={deletingId === log.id}
                          style={{
                            background: '#F9ECE8',
                            border: '1px solid #E2A096',
                            color: '#7A1F2B',
                            borderRadius: 4,
                            padding: '4px 8px',
                            fontSize: 12,
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                          title="ลบประวัตินี้"
                        >
                          {deletingId === log.id ? '...' : ''}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#8a7a60', padding: 30 }}>
                    ไม่พบข้อมูลประวัติการสนทนาตามเงื่อนไขที่ระบุ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Detail View Modal ── */}
      {selectedLog && (
        <div style={s.modalOverlay} onClick={() => setSelectedLog(null)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>
                รายละเอียดประวัติการแชท (Log ID #{selectedLog.id})
              </div>
              <button style={s.closeBtn} onClick={() => setSelectedLog(null)}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={s.intentBadge}>Intent: {selectedLog.detectedIntent}</span>
              <span style={s.modelBadge}>Model: {selectedLog.modelUsed}</span>
              <span style={{ fontSize: 11, color: '#8a7a60', fontFamily: "'IBM Plex Mono', monospace" }}>
                เวลา {selectedLog.timestamp}
              </span>
            </div>

            {/* User Message */}
            <div style={s.sectionBox}>
              <div style={s.sectionTitle}>คำถามของผู้ใช้ (User Query)</div>
              <div style={s.sectionText}>{selectedLog.userMessage}</div>
            </div>

            {/* Bot Response */}
            <div style={s.sectionBox}>
              <div style={s.sectionTitle}>คำตอบของระบบ AI นิติบอท</div>
              <div style={{ ...s.sectionText, color: '#591622', fontWeight: 500 }}>
                {selectedLog.botResponse}
              </div>
            </div>

            {/* RAG Reasoning Steps */}
            <div style={s.sectionBox}>
              <div style={s.sectionTitle}>ขั้นตอนการวิเคราะห์ตรรกะ AI (Reasoning Steps)</div>
              <div style={s.reasoningStep}>1. รับประโยคคำถามและสกัด Keywords สอดคล้องกับคลังข้อมูลกฎหมาย</div>
              <div style={s.reasoningStep}>
                2. ค้นหา RAG Matching Vector &amp; Keyword Matcher: <strong>{selectedLog.detectedIntent}</strong>
              </div>
              <div style={s.reasoningStep}>3. วิเคราะห์บทลงโทษและตรรกะความผิดทางกฎหมายดิจิทัล (OpenThaiGPT Engine)</div>
              <div style={s.reasoningStep}>4. สรุปคำแนะนำภาษาง่ายพร้อมคำเตือนข้อควรระวังทางกฎหมาย</div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <button
                onClick={() => handleDeleteSingle(selectedLog.id)}
                style={s.toolBtn('danger')}
              >
                ลบประวัตินี้
              </button>
              <button
                onClick={() => setSelectedLog(null)}
                style={s.toolBtn('primary')}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
