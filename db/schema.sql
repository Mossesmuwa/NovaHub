-- NovaHub Schema — run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT DEFAULT '📦',
  description TEXT, sort_order INT DEFAULT 0
);
INSERT INTO categories (id,name,icon,sort_order) VALUES
  ('movies','Movies & TV','🍿',1),('books','Books','📚',2),
  ('ai-tools','AI Tools','✨',3),('games','Games','🎮',4),
  ('security','Cyber Security','🔐',5),('productivity','Productivity','⚡',6),
  ('music','Music','🎵',7),('courses','Courses','🧠',8),
  ('videos','Videos','🎬',9),('design','Design','🎨',10),
  ('science','Science','🔬',11),('finance','Finance','📈',12),
  ('news','News','📰',13)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT, bio TEXT, website TEXT, avatar_url TEXT,
  taste_cats TEXT[], taste_mood TEXT, taste_loved TEXT[],
  is_pro BOOLEAN DEFAULT FALSE, pro_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN INSERT INTO profiles (id,display_name) VALUES (NEW.id,NEW.raw_user_meta_data->>'full_name') ON CONFLICT (id) DO NOTHING; RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, short_desc TEXT, long_desc TEXT,
  category_id TEXT REFERENCES categories(id), type TEXT,
  image TEXT, year INT, rating NUMERIC(3,1), rating_count INT DEFAULT 0,
  author TEXT, director TEXT, developer TEXT, company TEXT, genre TEXT,
  tags TEXT[], vibe_tags TEXT[], platforms TEXT, pricing TEXT,
  affiliate_link TEXT, source_url TEXT, source_id TEXT, source_name TEXT,
  trending BOOLEAN DEFAULT FALSE, featured BOOLEAN DEFAULT FALSE,
  daily_pick BOOLEAN DEFAULT FALSE, approved BOOLEAN DEFAULT TRUE,
  save_count INT DEFAULT 0, view_count INT DEFAULT 0, click_count INT DEFAULT 0,
  trending_score FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_items_cat      ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_trending ON items(trending,save_count DESC);
CREATE INDEX IF NOT EXISTS idx_items_approved ON items(approved);
CREATE INDEX IF NOT EXISTS idx_items_slug     ON items(slug);

CREATE TABLE IF NOT EXISTS anon_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), fingerprint TEXT,
  favorites_count INT DEFAULT 0, comments_today INT DEFAULT 0, last_comment_date TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  anon_id UUID REFERENCES anon_sessions(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id,item_id), UNIQUE(anon_id,item_id),
  CHECK(user_id IS NOT NULL OR anon_id IS NOT NULL)
);

CREATE OR REPLACE FUNCTION update_save_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP='INSERT' THEN UPDATE items SET save_count=save_count+1 WHERE id=NEW.item_id;
  ELSIF TG_OP='DELETE' THEN UPDATE items SET save_count=GREATEST(0,save_count-1) WHERE id=OLD.item_id;
  END IF; RETURN NULL; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trig_save_count ON favorites;
CREATE TRIGGER trig_save_count AFTER INSERT OR DELETE ON favorites FOR EACH ROW EXECUTE FUNCTION update_save_count();

CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, description TEXT, is_public BOOLEAN DEFAULT TRUE,
  item_count INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  position INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(list_id,item_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  anon_id UUID REFERENCES anon_sessions(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL, content TEXT NOT NULL, likes INT DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK(user_id IS NOT NULL OR anon_id IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  anon_id UUID REFERENCES anon_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id,user_id), UNIQUE(comment_id,anon_id)
);

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INT NOT NULL CHECK(score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(item_id,user_id)
);
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  url TEXT, ip_hash TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS digest_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_num INT UNIQUE NOT NULL, title TEXT, content JSONB,
  published BOOLEAN DEFAULT FALSE, sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS featured_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT, contact_email TEXT,
  plan TEXT DEFAULT 'basic', starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid()=id);
CREATE POLICY "items_select"    ON items    FOR SELECT USING (approved=TRUE);
CREATE POLICY "favs_select"     ON favorites FOR SELECT USING (auth.uid()=user_id OR anon_id IS NOT NULL);
CREATE POLICY "favs_insert"     ON favorites FOR INSERT WITH CHECK (auth.uid()=user_id OR user_id IS NULL);
CREATE POLICY "favs_delete"     ON favorites FOR DELETE USING (auth.uid()=user_id);
CREATE POLICY "comments_select" ON comments  FOR SELECT USING (is_flagged=FALSE);
CREATE POLICY "comments_insert" ON comments  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "lists_select"    ON lists     FOR SELECT USING (is_public=TRUE OR auth.uid()=user_id);
CREATE POLICY "lists_insert"    ON lists     FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "lists_update"    ON lists     FOR UPDATE USING (auth.uid()=user_id);
CREATE POLICY "lists_delete"    ON lists     FOR DELETE USING (auth.uid()=user_id);
CREATE POLICY "history_select"  ON history   FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "history_insert"  ON history   FOR INSERT WITH CHECK (auth.uid()=user_id);
