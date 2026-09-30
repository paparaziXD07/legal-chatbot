-- ============================================================
-- Supabase PostgreSQL + pgvector Schema Extension
-- สำหรับระบบ RAG Legal Chatbot (นิติบอท)
-- คัดลอกคำสั่ง SQL นี้ไปรันใน Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. เปิดใช้งาน Extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. เพิ่มคอลัมน์ embedding ขนาด 1536 มิติ (สำหรับ text-embedding-3-small / ada-002)
ALTER TABLE laws 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. สร้าง Index แบบ HNSW สำหรับค้นหาความคล้ายคลึงของเวกเตอร์ (Cosine Similarity) อย่างรวดเร็ว
CREATE INDEX IF NOT EXISTS laws_embedding_hnsw_idx 
ON laws 
USING hnsw (embedding vector_cosine_ops);

-- 4. ฟังก์ชันค้นหามาตรากฎหมายที่เกี่ยวข้องด้วย Cosine Similarity (match_laws RPC)
CREATE OR REPLACE FUNCTION match_laws (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.25,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id bigint,
  cat varchar,
  section varchar,
  title text,
  text text,
  simple text,
  penalty text,
  keywords text[],
  similarity float
)
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT
    laws.id,
    laws.cat,
    laws.section,
    laws.title,
    laws.text,
    laws.simple,
    laws.penalty,
    laws.keywords,
    1 - (laws.embedding <=> query_embedding) AS similarity
  FROM laws
  WHERE laws.embedding IS NOT NULL
    AND 1 - (laws.embedding <=> query_embedding) >= match_threshold
  ORDER BY laws.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 5. อนุญาตสิทธิ์การเรียกใช้งานฟังก์ชัน (Permissions)
GRANT EXECUTE ON FUNCTION match_laws TO anon, authenticated, service_role;

COMMENT ON FUNCTION match_laws IS 'ค้นหามาตรากฎหมายที่สอดคล้องกับคำถามของผู้ใช้โดยใช้ pgvector Cosine Similarity';
