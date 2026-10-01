/**
 * lawUtils.js — ยูทิลิตี้สำหรับจัดรูปแบบการแสดงผลกฎหมายในฝั่ง Frontend (Web UI)
 * 
 * ข้อตกลงสำคัญ:
 * - ฟังก์ชันเหล่านี้มีไว้สำหรับแปลงการแสดงผลบนหน้าจอเท่านั้น
 * - ไม่มีการแก้ไขหรือเปลี่ยนแปลงข้อมูลในฐานข้อมูล (Database) แต่อย่างใด
 */

/**
 * จัดรูปแบบเลขมาตราสำหรับแสดงผลบนเว็บ
 * เช่น "1" -> "มาตรา 1", "12/1" -> "มาตรา 12/1"
 * หากมีคำว่า "มาตรา" หรือ "ม." อยู่แล้ว จะคงไว้ตามเดิม ไม่ใส่คำซ้ำ
 * 
 * @param {string|number} sec 
 * @returns {string}
 */
export function formatSection(sec) {
  if (sec === undefined || sec === null) return '';
  const str = String(sec).trim();
  if (!str) return '';
  if (/^(มาตรา|ม\.)/i.test(str)) {
    return str;
  }
  return `มาตรา ${str}`;
}

/**
 * คืนค่าข้อมูลแท็กกำกับกฎหมาย (ป้ายกำกับ, สี, ไอคอน, ชื่องานเต็ม)
 * ตามหมวดหมู่ (cat) ของมาตรานั้นๆ
 * 
 * @param {string} cat 
 * @returns {object}
 */
export function getLawBadgeInfo(cat) {
  const c = String(cat || '').toLowerCase().trim();
  if (c === 'pdpa' || c.includes('pdpa') || c.includes('คุ้มครองข้อมูลส่วนบุคคล')) {
    return {
      id: 'pdpa',
      label: '🛡️ PDPA',
      shortName: 'PDPA',
      fullName: 'พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)',
      isPdpa: true,
      color: '#1E4332',
      bg: '#EBF4EF',
      border: '#B7D9C4',
      badgeBg: '#2E5544'
    };
  }

  // ค่าเริ่มต้น: พ.ร.บ.คอมพิวเตอร์
  return {
    id: 'computer',
    label: '💻 พ.ร.บ.คอมพิวเตอร์',
    shortName: 'พ.ร.บ.คอมพิวเตอร์',
    fullName: 'พระราชบัญญัติว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ พ.ศ. 2550 และที่แก้ไขเพิ่มเติม',
    isPdpa: false,
    color: '#6A1521',
    bg: '#F9ECE8',
    border: '#E2B8B3',
    badgeBg: '#7A1F2B'
  };
}
 
/**
 * แปลงเลขไทยเป็นเลขอารบิกสำหรับค้นหา เช่น "๗๐" -> "70"
 * @param {string} text 
 * @returns {string}
 */
export function normalizeThaiDigits(text) {
  if (!text) return '';
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return String(text).replace(/[๐-๙]/g, (ch) => {
    const idx = thaiDigits.indexOf(ch);
    return idx !== -1 ? String(idx) : ch;
  });
}
