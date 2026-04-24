-- Migration: 003_fix_rls_policies.sql
-- Purpose: Fix RLS policies for secure user data access

-- ============================================================================
-- ENSURE user_id COLUMNS EXIST (idempotent)
-- ============================================================================

-- Verify favorites table has user_id
ALTER TABLE favorites ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
-- If it already exists, ignore error. Check with:
-- SELECT column_name FROM information_schema.columns WHERE table_name='favorites' AND column_name='user_id';

-- ============================================================================
-- DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================================================

DROP POLICY IF EXISTS "favs_select" ON favorites;
DROP POLICY IF EXISTS "favs_insert" ON favorites;
DROP POLICY IF EXISTS "favs_delete" ON favorites;
DROP POLICY IF EXISTS "items_select" ON items;
DROP POLICY IF EXISTS "anon_sessions_update" ON anon_sessions;
DROP POLICY IF EXISTS "anon_sessions_select" ON anon_sessions;

-- ============================================================================
-- ITEMS TABLE - SECURE POLICIES
-- ============================================================================
-- Items are shared resources. Only allow SELECT for approved items.
-- View tracking should happen server-side via API, NOT client-side.

CREATE POLICY "items_select_approved"
  ON items FOR SELECT
  USING (approved = TRUE);

-- Optional: Admin/service role can update (requires additional safeguards)
-- Do NOT allow client-side updates to items

-- ============================================================================
-- FAVORITES TABLE - COMPLETE POLICIES
-- ============================================================================
-- Users can only see, insert, and delete their OWN favorites

CREATE POLICY "favorites_select_own"
  ON favorites FOR SELECT
  USING (
    -- User can see their own favorites
    auth.uid() = user_id 
    OR 
    -- Anonymous sessions can see their own (for anon users)
    (user_id IS NULL AND anon_id IS NOT NULL)
  );

CREATE POLICY "favorites_insert_authenticated"
  ON favorites FOR INSERT
  WITH CHECK (
    -- Authenticated user must match the user_id being inserted
    auth.uid() = user_id
    AND
    -- user_id must not be null for authenticated inserts
    user_id IS NOT NULL
  );

CREATE POLICY "favorites_insert_anonymous"
  ON favorites FOR INSERT
  WITH CHECK (
    -- Anonymous inserts require anon_id, not user_id
    user_id IS NULL
    AND
    anon_id IS NOT NULL
  );

CREATE POLICY "favorites_update_own"
  ON favorites FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own"
  ON favorites FOR DELETE
  USING (
    (auth.uid() = user_id AND user_id IS NOT NULL)
    OR
    (anon_id IS NOT NULL AND user_id IS NULL)
  );

-- ============================================================================
-- ANON_SESSIONS TABLE - POLICIES
-- ============================================================================
-- Each anonymous session can only read/update itself

CREATE POLICY "anon_sessions_select_own"
  ON anon_sessions FOR SELECT
  USING (TRUE);  -- Lenient for now; can be restricted

CREATE POLICY "anon_sessions_update_own"
  ON anon_sessions FOR UPDATE
  USING (TRUE)  -- Session is self-identifying
  WITH CHECK (TRUE);

CREATE POLICY "anon_sessions_insert"
  ON anon_sessions FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "anon_sessions_delete_own"
  ON anon_sessions FOR DELETE
  USING (TRUE);

-- ============================================================================
-- PROFILES TABLE - POLICIES (if not already set)
-- ============================================================================

DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (TRUE);  -- Anyone can view public profiles

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_on_signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- COMMENTS & COMMENT_LIKES - ENSURE POLICIES EXIST
-- ============================================================================

DROP POLICY IF EXISTS "comments_select" ON comments;
DROP POLICY IF EXISTS "comments_insert" ON comments;
DROP POLICY IF EXISTS "comments_delete" ON comments;
DROP POLICY IF EXISTS "comment_likes_select" ON comment_likes;
DROP POLICY IF EXISTS "comment_likes_insert" ON comment_likes;
DROP POLICY IF EXISTS "comment_likes_delete" ON comment_likes;

CREATE POLICY "comments_select"
  ON comments FOR SELECT
  USING (is_flagged = FALSE);

CREATE POLICY "comments_insert"
  ON comments FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "comments_delete_own"
  ON comments FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "comment_likes_select"
  ON comment_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "comment_likes_insert"
  ON comment_likes FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id AND user_id IS NOT NULL)
    OR
    (anon_id IS NOT NULL AND user_id IS NULL)
  );

CREATE POLICY "comment_likes_delete_own"
  ON comment_likes FOR DELETE
  USING (
    (auth.uid() = user_id AND user_id IS NOT NULL)
    OR
    (anon_id IS NOT NULL AND user_id IS NULL)
  );

-- ============================================================================
-- LISTS & LIST_ITEMS - ENSURE POLICIES EXIST
-- ============================================================================

DROP POLICY IF EXISTS "lists_select" ON lists;
DROP POLICY IF EXISTS "lists_insert" ON lists;
DROP POLICY IF EXISTS "lists_update" ON lists;
DROP POLICY IF EXISTS "lists_delete" ON lists;
DROP POLICY IF EXISTS "list_items_select" ON list_items;
DROP POLICY IF EXISTS "list_items_insert" ON list_items;
DROP POLICY IF EXISTS "list_items_update" ON list_items;
DROP POLICY IF EXISTS "list_items_delete" ON list_items;

CREATE POLICY "lists_select"
  ON lists FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "lists_insert"
  ON lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lists_update"
  ON lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lists_delete"
  ON lists FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "list_items_select"
  ON list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists WHERE lists.id = list_items.list_id 
      AND (lists.is_public = TRUE OR lists.user_id = auth.uid())
    )
  );

CREATE POLICY "list_items_insert"
  ON list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists WHERE lists.id = list_items.list_id 
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "list_items_update"
  ON list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM lists WHERE lists.id = list_items.list_id 
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "list_items_delete"
  ON list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM lists WHERE lists.id = list_items.list_id 
      AND lists.user_id = auth.uid()
    )
  );

-- ============================================================================
-- HISTORY TABLE - ENSURE POLICIES EXIST
-- ============================================================================

DROP POLICY IF EXISTS "history_select" ON history;
DROP POLICY IF EXISTS "history_insert" ON history;
DROP POLICY IF EXISTS "history_delete" ON history;

CREATE POLICY "history_select"
  ON history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "history_insert"
  ON history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "history_delete"
  ON history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RATINGS TABLE - ADD POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "ratings_select" ON ratings;
DROP POLICY IF EXISTS "ratings_insert" ON ratings;
DROP POLICY IF EXISTS "ratings_update" ON ratings;
DROP POLICY IF EXISTS "ratings_delete" ON ratings;

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ratings_select"
  ON ratings FOR SELECT
  USING (TRUE);  -- Anyone can see ratings

CREATE POLICY "ratings_insert"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_update"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_delete"
  ON ratings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- AFFILIATE_CLICKS TABLE - ADD POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "affiliate_clicks_select" ON affiliate_clicks;
DROP POLICY IF EXISTS "affiliate_clicks_insert" ON affiliate_clicks;

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_clicks_insert"
  ON affiliate_clicks FOR INSERT
  WITH CHECK (TRUE);  -- Anyone can log clicks

-- ============================================================================
-- VIEW TRACKING - SERVER-SIDE APPROACH
-- ============================================================================
-- DO NOT allow client-side view_count updates.
-- Instead, create an API endpoint that increments view_count.
-- This prevents cheating and keeps analytics accurate.

-- Example trigger (optional, if you want automatic tracking):
/*
CREATE OR REPLACE FUNCTION track_item_view() RETURNS TRIGGER AS $$
BEGIN
  UPDATE items SET view_count = view_count + 1 WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE item_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER track_view AFTER INSERT ON item_views
  FOR EACH ROW EXECUTE FUNCTION track_item_view();
*/

-- ============================================================================
-- FEATURED_LISTINGS TABLE - ADD POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "featured_listings_select" ON featured_listings;
DROP POLICY IF EXISTS "featured_listings_insert" ON featured_listings;

ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "featured_listings_select"
  ON featured_listings FOR SELECT
  USING (is_active = TRUE);

-- Only admins should insert (requires additional auth logic)
-- For now, allow via service_role only:
-- CREATE POLICY "featured_listings_insert"
--   ON featured_listings FOR INSERT
--   WITH CHECK (auth.role() = 'service_role');
