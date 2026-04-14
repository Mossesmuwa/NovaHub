-- ============================================================================
-- NovaHub DB Migration — v3
-- ----------------------------------------------------------------------------
-- WHY THIS FILE EXISTS:
-- This migration fixes issues from v2 and adds core backend features:
--
-- 1. Fixes "profiles.is_admin does not exist" error
-- 2. Adds AI response caching (reduce API costs + speed)
-- 3. Enables full-text search on items (fast search without Algolia)
-- 4. Adds submissions system (user-generated content workflow)
-- 5. Introduces admin system via profiles.is_admin
--
-- This file is SAFE to run multiple times (idempotent where possible)
-- ============================================================================


-- ════════════════════════════════════════════════════════════════════
-- 0. EXTENSIONS
-- WHY: Needed for UUID generation (gen_random_uuid)
-- ════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ════════════════════════════════════════════════════════════════════
-- 1. PROFILES ADMIN COLUMN (CRITICAL FIX)
-- WHY:
-- v2 failed because policies referenced profiles.is_admin
-- before the column existed → caused error 42703
--
-- FIX:
-- Ensure column exists BEFORE any policy uses it
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;


-- ════════════════════════════════════════════════════════════════════
-- 2. AI RESPONSE CACHE
-- WHY:
-- Avoid repeated expensive AI API calls (Claude/OpenAI)
-- Improves performance + reduces cost
--
-- Stores responses keyed by a hash of request parameters
-- TTL handled at app level
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_cache (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key    TEXT UNIQUE NOT NULL,
  mode         TEXT NOT NULL,
  params_hash  TEXT NOT NULL,
  response     JSONB NOT NULL,
  hit_count    INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_key     
  ON ai_cache (cache_key);

CREATE INDEX IF NOT EXISTS idx_ai_cache_expires 
  ON ai_cache (expires_at);

-- WHY RLS:
-- Cache is internal only → prevent client-side access
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════════════
-- 3. FULL-TEXT SEARCH (Postgres Native)
-- WHY:
-- Enables fast, ranked search without external services
-- Covers multiple text fields (name, description, tags, etc.)
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE items 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate existing rows
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

-- GIN index = fast search queries
CREATE INDEX IF NOT EXISTS idx_items_search_vector
  ON items USING gin(search_vector);

-- Auto-update search vector on insert/update
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
-- 4. SUBMISSIONS SYSTEM
-- WHY:
-- Allows users to submit content for review (moderation workflow)
-- Supports admin approval/rejection system
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  url          TEXT NOT NULL,
  type         TEXT,
  category     TEXT,
  description  TEXT,
  notes        TEXT,
  status       TEXT DEFAULT 'pending',
  reviewed_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_status 
  ON submissions (status);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY POLICIES
-- WHY:
-- Control who can insert/view/manage submissions
-- Uses profiles.is_admin for admin privileges
-- ════════════════════════════════════════════════════════════════════

-- Users can submit
DROP POLICY IF EXISTS "Logged-in users can submit" ON submissions;
CREATE POLICY "Logged-in users can submit"
  ON submissions FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());

-- Users can view their own submissions
DROP POLICY IF EXISTS "Users see own submissions" ON submissions;
CREATE POLICY "Users see own submissions"
  ON submissions FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());

-- Admins can do everything
DROP POLICY IF EXISTS "Admin sees all submissions" ON submissions;
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
-- 6. SEARCH FUNCTION (API HELPER)
-- WHY:
-- Used by frontend/backend to perform ranked search queries
-- Replaces need for external search APIs
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION search_items(
  query_text      TEXT,
  category_filter TEXT DEFAULT NULL,
  type_filter     TEXT DEFAULT NULL,
  result_limit    INT DEFAULT 20,
  result_offset   INT DEFAULT 0
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


-- ============================================================================
-- ✅ POST-RUN STEP (MANUAL)
-- ----------------------------------------------------------------------------
-- Make yourself admin:
--
-- UPDATE profiles
-- SET is_admin = TRUE
-- WHERE id = 'YOUR-USER-UUID';
--
-- ============================================================================