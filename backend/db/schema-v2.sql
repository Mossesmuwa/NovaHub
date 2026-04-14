-- backend/db/schema-v2.sql
-- NovaHub — Schema additions (run AFTER schema.sql)
-- Adds: AI response cache, full-text search, vector search, submissions

-- ════════════════════════════════════════════════════════════════════
-- 1. AI RESPONSE CACHE
--    Stores Claude responses keyed by a hash of (mode + params).
--    Avoids hitting the Anthropic API for identical/recent requests.
--    TTL enforced at application level (10 min default).
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_cache (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key    TEXT UNIQUE NOT NULL,        -- SHA-256 of mode+params JSON
  mode         TEXT NOT NULL,               -- query | vibe | related | taste
  params_hash  TEXT NOT NULL,               -- for debugging / analytics
  response     JSONB NOT NULL,              -- full recommendations array
  hit_count    INT DEFAULT 0,              -- how many times this was served
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL        -- set to NOW() + interval at insert
);

-- Auto-delete expired cache rows (run as pg_cron job if available,
-- otherwise the app skips expired rows and they clean up on next write)
CREATE INDEX IF NOT EXISTS idx_ai_cache_key     ON ai_cache (cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_cache (expires_at);

-- RLS: cache is internal only — no direct client access
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
-- No SELECT policy = no public access. Server uses service_role key.


-- ════════════════════════════════════════════════════════════════════
-- 2. FULL-TEXT SEARCH (Postgres native — no extra service needed)
--    Adds a tsvector column to items for fast, ranked text search.
--    Covers: name, short_desc, tags, category, author/director/company.
-- ════════════════════════════════════════════════════════════════════

-- Add the tsvector column
ALTER TABLE items ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate it for all existing rows
UPDATE items SET search_vector =
  to_tsvector('english',
    coalesce(name, '')       || ' ' ||
    coalesce(short_desc, '') || ' ' ||
    coalesce(long_desc, '')  || ' ' ||
    coalesce(author, '')     || ' ' ||
    coalesce(director, '')   || ' ' ||
    coalesce(company, '')    || ' ' ||
    coalesce(genre, '')      || ' ' ||
    coalesce(array_to_string(tags, ' '), '')
  );

-- GIN index for fast full-text queries
CREATE INDEX IF NOT EXISTS idx_items_search_vector
  ON items USING gin(search_vector);

-- Trigger to keep search_vector current on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_item_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.name, '')       || ' ' ||
    coalesce(NEW.short_desc, '') || ' ' ||
    coalesce(NEW.long_desc, '')  || ' ' ||
    coalesce(NEW.author, '')     || ' ' ||
    coalesce(NEW.director, '')   || ' ' ||
    coalesce(NEW.company, '')    || ' ' ||
    coalesce(NEW.genre, '')      || ' ' ||
    coalesce(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_item_search_vector ON items;
CREATE TRIGGER trig_item_search_vector
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_item_search_vector();


-- ════════════════════════════════════════════════════════════════════
-- 3. VECTOR / SEMANTIC SEARCH (pgvector — upgrade path)
--    Enable this when you're ready to generate embeddings.
--    Requires: Supabase Pro OR manual pgvector extension install.
--
--    To enable:
--      1. In Supabase dashboard → Database → Extensions → enable vector
--      2. Uncomment the block below
--      3. Run an embedding generation script for all items
--      4. Switch lib/search.js to use matchItems() RPC instead of FTS
-- ════════════════════════════════════════════════════════════════════

/*
-- Uncomment when ready:

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE items ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_items_embedding
  ON items USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- RPC function: semantic similarity search
-- Called from lib/search.js as supabase.rpc('match_items', { ... })
CREATE OR REPLACE FUNCTION match_items(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count     INT   DEFAULT 10,
  category_filter TEXT  DEFAULT NULL
)
RETURNS TABLE (
  id         UUID,
  slug       TEXT,
  name       TEXT,
  type       TEXT,
  category   TEXT,
  short_desc TEXT,
  image      TEXT,
  rating     NUMERIC,
  pricing    TEXT,
  tags       TEXT[],
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id, i.slug, i.name, i.type, i.category,
    i.short_desc, i.image, i.rating, i.pricing, i.tags,
    1 - (i.embedding <=> query_embedding) AS similarity
  FROM items i
  WHERE
    i.approved = TRUE
    AND i.embedding IS NOT NULL
    AND 1 - (i.embedding <=> query_embedding) > match_threshold
    AND (category_filter IS NULL OR i.category = category_filter)
  ORDER BY i.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
*/


-- ════════════════════════════════════════════════════════════════════
-- 4. SUBMISSIONS TABLE
--    Community-submitted items waiting for curator approval.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  url          TEXT NOT NULL,
  type         TEXT,                        -- movie | book | tool | etc
  category     TEXT,
  description  TEXT,
  notes        TEXT,                        -- submitter's note to curator
  status       TEXT DEFAULT 'pending',      -- pending | approved | rejected
  reviewed_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (status);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can submit
CREATE POLICY "Logged-in users can submit"
  ON submissions FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());

-- Users can see their own submissions
CREATE POLICY "Users see own submissions"
  ON submissions FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());

-- Admins see everything (set is_admin on profiles table or use a hardcoded UID check)
-- Replace 'YOUR-ADMIN-UUID' with your actual Supabase user UUID
CREATE POLICY "Admin sees all submissions"
  ON submissions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );


-- ════════════════════════════════════════════════════════════════════
-- 5. ADD is_admin TO PROFILES (for admin panel access)
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set yourself as admin (replace with your actual auth.users UUID):
-- UPDATE profiles SET is_admin = TRUE WHERE id = 'YOUR-UUID-HERE';


-- ════════════════════════════════════════════════════════════════════
-- 6. HELPER FUNCTION: Full-text search on items
--    Called from lib/search.js as supabase.rpc('search_items', { ... })
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION search_items(
  query_text      TEXT,
  category_filter TEXT  DEFAULT NULL,
  type_filter     TEXT  DEFAULT NULL,
  result_limit    INT   DEFAULT 20,
  result_offset   INT   DEFAULT 0
)
RETURNS TABLE (
  id         UUID,
  slug       TEXT,
  name       TEXT,
  type       TEXT,
  category   TEXT,
  short_desc TEXT,
  image      TEXT,
  rating     NUMERIC,
  pricing    TEXT,
  tags       TEXT[],
  rank       FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id, i.slug, i.name, i.type, i.category,
    i.short_desc, i.image, i.rating, i.pricing, i.tags,
    ts_rank(i.search_vector, query) AS rank
  FROM
    items i,
    plainto_tsquery('english', query_text) query
  WHERE
    i.approved = TRUE
    AND i.search_vector @@ query
    AND (category_filter IS NULL OR i.category = category_filter)
    AND (type_filter     IS NULL OR i.type     = type_filter)
  ORDER BY rank DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql;
