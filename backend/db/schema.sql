-- ==============================================================================
-- NovaHub: Supabase PostgreSQL Schema
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PROFILES (Extends Auth Users)
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. CATEGORIES
-- ==========================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. ITEMS (Core Content)
-- ==========================================
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- e.g., 'movie', 'book', 'game', 'tool', 'video'
    name TEXT NOT NULL,
    short_desc TEXT,
    content TEXT,
    image TEXT,
    
    -- Specific fields based on type
    genre TEXT,
    author TEXT,
    director TEXT,
    developer TEXT,
    platforms TEXT,
    pricing TEXT,
    year INTEGER,
    rating NUMERIC(3, 1),
    
    -- Affiliate & External links
    affiliate_link TEXT,
    external_url TEXT,
    
    -- Status & Ranking
    approved BOOLEAN DEFAULT FALSE,
    trending BOOLEAN DEFAULT FALSE,
    daily_pick BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    
    -- Counters
    view_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching
CREATE INDEX IF NOT EXISTS idx_items_slug ON items(slug);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(approved, trending, daily_pick, featured);

-- ==========================================
-- 4. ANON SESSIONS (For non-registered users)
-- ==========================================
CREATE TABLE IF NOT EXISTS anon_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fingerprint TEXT,
    favorites_count INTEGER DEFAULT 0,
    comments_today INTEGER DEFAULT 0,
    last_comment_date DATE,
    expires_at TIMESTAMPTZ NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anon_fingerprint ON anon_sessions(fingerprint);

-- ==========================================
-- 5. FAVORITES (Bookmarks)
-- ==========================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    anon_id UUID REFERENCES anon_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure a user/anon can only favorite an item once
    CONSTRAINT fav_user_unique UNIQUE (item_id, user_id),
    CONSTRAINT fav_anon_unique UNIQUE (item_id, anon_id),
    -- Ensure exactly one of user_id or anon_id is present
    CONSTRAINT fav_owner_check CHECK (
        (user_id IS NOT NULL AND anon_id IS NULL) OR 
        (user_id IS NULL AND anon_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_anon ON favorites(anon_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_id);

-- ==========================================
-- 6. COMMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    anon_id UUID REFERENCES anon_sessions(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT comment_owner_check CHECK (
        (user_id IS NOT NULL AND anon_id IS NULL) OR 
        (user_id IS NULL AND anon_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_comments_item ON comments(item_id);

-- ==========================================
-- 7. COMMENT LIKES
-- ==========================================
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    anon_id UUID REFERENCES anon_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT clike_user_unique UNIQUE (comment_id, user_id),
    CONSTRAINT clike_anon_unique UNIQUE (comment_id, anon_id),
    CONSTRAINT clike_owner_check CHECK (
        (user_id IS NOT NULL AND anon_id IS NULL) OR 
        (user_id IS NULL AND anon_id IS NOT NULL)
    )
);

-- ==========================================
-- RLS (Row Level Security) Policies
-- ==========================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE anon_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Categories & Items: Public Read
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read items" ON items FOR SELECT USING (true);

-- Profiles: Public Read, Owner Update
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Owner update profiles" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Anon Sessions: Public Insert/Update (Managed via JS/Client)
CREATE POLICY "Anon sessions general access" ON anon_sessions FOR ALL USING (true);

-- Favorites: Read/Insert/Delete based on owner
CREATE POLICY "Read own favorites" ON favorites FOR SELECT 
    USING (auth.uid() = user_id OR anon_id IS NOT NULL);
CREATE POLICY "Insert own favorites" ON favorites FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR anon_id IS NOT NULL);
CREATE POLICY "Delete own favorites" ON favorites FOR DELETE 
    USING (auth.uid() = user_id OR anon_id IS NOT NULL);

-- Comments: Public Read, Insert for users/anons
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Insert comments" ON comments FOR INSERT WITH CHECK (true);

-- Comment Likes: Public Read, Insert/Delete for owner
CREATE POLICY "Public read comment likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Insert own comment likes" ON comment_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Delete own comment likes" ON comment_likes FOR DELETE USING (true);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger to create a profile automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to increment save_count on items when favorite added/removed
CREATE OR REPLACE FUNCTION handle_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.items SET save_count = save_count + 1 WHERE id = NEW.item_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.items SET save_count = GREATEST(save_count - 1, 0) WHERE id = OLD.item_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_favorite_change
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE PROCEDURE handle_favorite_count();

-- Trigger to sync comment likes count
CREATE OR REPLACE FUNCTION handle_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.comments SET likes = likes + 1 WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.comments SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_comment_likes_change
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE PROCEDURE handle_comment_likes_count();
