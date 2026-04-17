-- NovaHub — Migration: Add vibe_scores (JSONB) and embedding (vector) to items
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
--
-- Prerequisites:
--   pgvector extension must be enabled (Supabase has it built-in)

-- 1. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add vibe_scores JSONB column
-- Stores AI-generated vibe dimensions: { minimalism: 85, cyberpunk: 20, ... }
ALTER TABLE items ADD COLUMN IF NOT EXISTS vibe_scores JSONB DEFAULT '{}';

-- 3. Add embedding vector column (768 dimensions for Gemini text-embedding-004)
ALTER TABLE items ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 4. Create an index on vibe_scores for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_items_vibe_scores ON items USING gin(vibe_scores);

-- 5. Create an IVFFlat index on embedding for fast similarity search
-- NOTE: IVFFlat requires at least some rows to build lists.
-- For <1000 rows, use exact (sequential) search first, then create this index later.
-- For 1M+ rows, use lists=1000 or higher.
-- CREATE INDEX IF NOT EXISTS idx_items_embedding ON items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 6. Create a function for semantic search (cosine similarity)
CREATE OR REPLACE FUNCTION match_items(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  short_desc text,
  image text,
  category_id text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    items.id,
    items.slug,
    items.name,
    items.short_desc,
    items.image,
    items.category_id,
    1 - (items.embedding <=> query_embedding) AS similarity
  FROM items
  WHERE items.approved = true
    AND items.embedding IS NOT NULL
    AND 1 - (items.embedding <=> query_embedding) > match_threshold
  ORDER BY items.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. Add a GIN index on tags for fast array containment queries at scale
CREATE INDEX IF NOT EXISTS idx_items_tags ON items USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_items_vibe_tags ON items USING gin(vibe_tags);

-- Done! Your items table now supports:
--   • JSONB vibe_scores for rich filtering
--   • 768-dim vector embeddings for semantic search
--   • match_items() RPC function for similarity queries
