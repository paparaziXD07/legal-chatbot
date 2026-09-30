-- ============================================================
-- Migrate pgvector: 1536D (OpenAI) → 768D (Google Gemini text-embedding-004)
-- รันใน Supabase Dashboard → SQL Editor
-- ⚠️  คำสั่งนี้จะลบ embedding เดิมทั้งหมด (ต้อง re-generate ใหม่)
-- ============================================================

-- 1. ลบ Index เดิม (ต้องลบก่อน ALTER COLUMN)
DROP INDEX IF EXISTS laws_embedding_hnsw_idx;

-- 2. ลบคอลัมน์ embedding เดิม (1536D) แล้วสร้างใหม่ (768D)
ALTER TABLE laws DROP COLUMN IF EXISTS embedding;
ALTER TABLE laws ADD COLUMN embedding vector(768);

-- 3. ลบ function เดิม แล้วสร้างใหม่สำหรับ 768D
DROP FUNCTION IF EXISTS match_laws(vector(1536), float, int);

CREATE OR REPLACE FUNCTION match_laws (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.30,
  match_count int DEFAULT 5
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

-- 4. สร้าง HNSW Index ใหม่สำหรับ 768D
CREATE INDEX IF NOT EXISTS laws_embedding_hnsw_idx
ON laws
USING hnsw (embedding vector_cosine_ops);

-- 5. อนุญาตสิทธิ์การเรียกใช้งานฟังก์ชัน
GRANT EXECUTE ON FUNCTION match_laws TO anon, authenticated, service_role;

COMMENT ON FUNCTION match_laws IS 'ค้นหามาตรากฎหมายด้วย Gemini text-embedding-004 (768D) + pgvector Cosine Similarity';

-- ============================================================
-- ✅ เสร็จแล้ว! จากนั้น re-generate embeddings ผ่าน API:
--    POST http://localhost:8000/api/generate-embeddings
--    Header: x-admin-token: admin-secret-token-6611425008
-- ============================================================
