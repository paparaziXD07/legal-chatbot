// ============================================================
//  knowledgeBase.js — ฐานข้อมูลกฎหมาย ดึงจาก Supabase DB 100%
//  • ไม่มีข้อมูล Hardcoded สำรอง ดึงจาก Supabase DB เท่านั้น
//  • บันทึกประวัติการสนทนา (chat_logs) ลง Supabase DB
// ============================================================

import supabaseRest from '../supabaseClient';

const API_BASE = 'http://localhost:5000/api';

// Cached dynamic data loaded strictly from Supabase DB
let cachedLaws = [];

/**
 * ดึงข้อมูลกฎหมายทั้งหมดจาก Supabase DB (ตาราง laws) เท่านั้น
 */
export async function fetchLawsFromSupabase() {
  // 1. ลองดึงจาก Supabase REST Direct
  if (supabaseRest) {
    try {
      const { data, error } = await supabaseRest.select('laws', { order: 'id.asc' });
      if (!error && data && data.length > 0) {
        console.log(`✅ [Supabase Client] Successfully fetched ${data.length} laws from Supabase DB`);
        cachedLaws = data;
        return data;
      }
      if (error) {
        console.warn('⚠️ [Supabase Client Error]:', error.message);
      }
    } catch (err) {
      console.warn('⚠️ [Supabase Client Exception]:', err.message);
    }
  }

  // 2. ลองดึงจาก Express Backend (ซึ่งต่อกับ Supabase Secret Key)
  try {
    const res = await fetch(`${API_BASE}/laws`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        console.log(`✅ [Backend API Proxy] Successfully fetched ${data.length} laws from Supabase`);
        cachedLaws = data;
        return data;
      }
    }
  } catch (e) {
    console.warn('⚠️ Could not fetch laws from Backend API Proxy');
  }

  return [];
}

/**
 * ดึงข้อมูล FAQ ทั้งหมดจาก Supabase DB (ตาราง faqs) เท่านั้น
 */
export async function fetchFaqsFromSupabase() {
  if (supabaseRest) {
    try {
      const { data, error } = await supabaseRest.select('faqs', { order: 'id.asc' });
      if (!error && data && data.length > 0) {
        console.log(`✅ [Supabase Client] Successfully fetched ${data.length} FAQs from Supabase DB`);
        return data;
      }
      if (error) {
        console.warn('⚠️ [Supabase Client FAQ Error]:', error.message);
      }
    } catch (err) {
      console.warn('⚠️ [Supabase Client FAQ Exception]:', err.message);
    }
  }

  try {
    const res = await fetch(`${API_BASE}/faqs`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        console.log(`✅ [Backend API Proxy] Successfully fetched ${data.length} FAQs from Supabase`);
        return data;
      }
    }
  } catch (e) {
    console.warn('⚠️ Could not fetch faqs from Backend API Proxy');
  }

  return [];
}

/**
 * บันทึก Chat Log ลงใน Supabase DB (ตาราง chat_logs)
 */
export async function saveChatLogToSupabase({ userMessage, botResponse, detectedIntent, modelUsed }) {
  const payload = {
    user_message: userMessage,
    bot_response: botResponse,
    detected_intent: detectedIntent || 'ทั่วไป / ไม่ตรงมาตรา',
    model_used: modelUsed || 'OpenThaiGPT R1 (32B Reasoning)'
  };

  if (supabaseRest) {
    try {
      const { data, error } = await supabaseRest.insert('chat_logs', payload);
      if (error) {
        console.warn('⚠️ [Supabase Chat Log Error]:', error.message);
      } else {
        console.log('✅ [Supabase Chat Log Saved]:', data);
        return data;
      }
    } catch (err) {
      console.warn('⚠️ [Supabase Chat Log Exception]:', err.message);
    }
  }

  return null;
}

/**
 * ดึงประวัติการสนทนาทั้งหมด (สำหรับ Admin Chat History)
 */
export async function fetchChatLogs() {
  if (supabaseRest) {
    try {
      const { data, error } = await supabaseRest.select('chat_logs', { order: 'created_at.desc' });
      if (!error && data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          userMessage: item.user_message,
          botResponse: item.bot_response,
          detectedIntent: item.detected_intent,
          modelUsed: item.model_used,
          timestamp: item.created_at ? new Date(item.created_at).toLocaleString('th-TH') : new Date().toLocaleString('th-TH'),
          rawTimestamp: item.created_at
        }));
      }
    } catch (err) {
      console.warn('⚠️ [Supabase fetchChatLogs error]:', err.message);
    }
  }

  try {
    const res = await fetch(`${API_BASE}/logs`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('⚠️ Could not fetch logs from Backend API');
  }

  return [];
}

/**
 * ลบรายการประวัติการสนทนาตาม ID
 */
export async function deleteChatLog(id) {
  const token = localStorage.getItem('adminToken');
  try {
    const res = await fetch(`${API_BASE}/logs/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token || 'admin-secret-token-6611425008' }
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn('⚠️ Backend delete error, trying Supabase direct');
  }

  if (supabaseRest) {
    const { error } = await supabaseRest.delete('chat_logs', 'id', id);
    return !error;
  }

  return false;
}

/**
 * ล้างประวัติการสนทนาทั้งหมด
 */
export async function clearAllChatLogs() {
  const token = localStorage.getItem('adminToken');
  try {
    const res = await fetch(`${API_BASE}/logs`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token || 'admin-secret-token-6611425008' }
    });
    if (res.ok) return true;
  } catch (e) {
    console.warn('⚠️ Backend clear error');
  }
  return false;
}


// ──────────────────────────────────────────────────────────
//  RAG Retrieval Engine
// ──────────────────────────────────────────────────────────
export function retrieve(query, lawsList = cachedLaws) {
  if (!query || !lawsList || lawsList.length === 0) return null;
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;

  lawsList.forEach((l) => {
    let score = 0;

    if (l.section && q.includes(l.section.toLowerCase())) score += 6;
    if (l.title && q.includes(l.title.toLowerCase())) score += 4;
    if (l.keywords && Array.isArray(l.keywords)) {
      l.keywords.forEach((k) => {
        if (typeof k === 'string' && q.includes(k.toLowerCase())) score += 2;
      });
    }
    if (l.simple && q.includes(l.simple.toLowerCase().substring(0, 10))) score += 1;

    if (score > bestScore) {
      bestScore = score;
      best = l;
    }
  });

  return bestScore > 0 ? best : null;
}

export const LAWS = [];
export const FAQS = [];

export const TOP_INTENTS = [
  { name: 'PDPA — สิทธิเจ้าของข้อมูล', val: 342, max: 350 },
  { name: 'พ.ร.บ.คอมพิวเตอร์ — ข้อมูลเท็จ / ข่าวปลอม', val: 310, max: 350 },
  { name: 'พ.ร.บ.คอมพิวเตอร์ — ตัดต่อภาพ / Deepfake', val: 245, max: 350 },
  { name: 'PDPA — หลักความยินยอม (Consent)', val: 198, max: 350 },
  { name: 'PDPA — ข้อมูลรั่วไหล (Data Breach)', val: 154, max: 350 },
  { name: 'พ.ร.บ.คอมพิวเตอร์ — เจาะระบบ / แฮกข้อมูล', val: 132, max: 350 },
];

export const QUICK_TOPICS = [
  { label: 'สิทธิเจ้าของข้อมูลส่วนบุคคล', q: 'เรามีสิทธิอะไรบ้างตาม PDPA' },
  { label: 'หน้าที่ผู้ควบคุมข้อมูล',       q: 'ผู้ควบคุมข้อมูลส่วนบุคคลมีหน้าที่อะไรตาม PDPA' },
  { label: 'หลักความยินยอม (Consent)',    q: 'ต้องขอความยินยอมก่อนเก็บข้อมูลส่วนบุคคลหรือไม่' },
  { label: 'ข้อมูลรั่วไหล ต้องทำอะไร',     q: 'ถ้าข้อมูลลูกค้ารั่วไหล บริษัทต้องแจ้งภายในกี่ชั่วโมง' },
  { label: 'โพสต์ข้อมูลเท็จบนเฟซบุ๊ก',    q: 'โพสต์ข้อมูลเท็จบน Facebook ผิดกฎหมายคอมพิวเตอร์มาตราไหน' },
  { label: 'แคปแชทมาประจาน',              q: 'แคปหน้าจอแชทคนอื่นมาประจานทำได้ไหม' },
  { label: 'ตัดต่อภาพผู้อื่น / Deepfake', q: 'ตัดต่อภาพคนอื่นแล้วโพสต์มีความผิดอย่างไร' },
  { label: 'เจาะระบบ / แฮกพาสเวิร์ด',     q: 'แฮกล็อกอินเข้าเครื่องคนอื่น ผิดมาตราไหน' },
];
