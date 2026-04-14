import { supabase } from './supabase';

// ── Categories ────────────────────────────────────────
export async function getCategories() {
  if (!supabase) return [];
  try {
    const { data } = await supabase.from('categories').select('*').order('name');
    return data || [];
  } catch { return []; }
}

// ── Items by category ─────────────────────────────────
export async function getByCategory(catId, opts) {
  if (!supabase) return [];
  const { limit = 24, offset = 0, sortBy = 'trending', freeOnly = false } = opts || {};
  try {
    let q = supabase.from('items').select('*').eq('category_id', catId).eq('approved', true);
    if (freeOnly) q = q.ilike('pricing', '%free%');
    if (sortBy === 'rating') q = q.order('rating', { ascending: false });
    else if (sortBy === 'newest') q = q.order('year', { ascending: false });
    else if (sortBy === 'name') q = q.order('name', { ascending: true });
    else q = q.order('trending', { ascending: false }).order('save_count', { ascending: false });
    q = q.range(offset, offset + limit - 1);
    const { data } = await q;
    return data || [];
  } catch { return []; }
}

// ── Trending ──────────────────────────────────────
export async function getTrending(limit = 12) {
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from('items').select('*')
      .eq('approved', true).eq('trending', true)
      .order('save_count', { ascending: false })
      .limit(limit);
    return data || [];
  } catch { return []; }
}

// ── Featured ──────────────────────────────────────
export async function getFeatured(limit = 5) {
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from('items').select('*')
      .eq('approved', true).eq('featured', true)
      .not('image', 'is', null).limit(limit);
    return data || [];
  } catch { return []; }
}

// ── Single item by slug ───────────────────────────
export async function getBySlug(slug) {
  if (!supabase || !slug) return null;
  try {
    const { data } = await supabase
      .from('items').select('*')
      .eq('slug', slug).eq('approved', true).single();
    if (data) {
      supabase.from('items')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id).then(() => {}).catch(() => {});
    }
    return data || null;
  } catch { return null; }
}

// ── Search ────────────────────────────────────────
export async function search(query, opts) {
  if (!supabase) return [];
  const { categoryId = null, limit = 24 } = opts || {};
  if (!query || query.trim().length < 2) return getTrending(limit);
  const q = query.trim().toLowerCase();
  try {
    let dbQ = supabase.from('items').select('*').eq('approved', true)
      .or(`name.ilike.%${q}%,short_desc.ilike.%${q}%,genre.ilike.%${q}%,author.ilike.%${q}%`);
    if (categoryId) dbQ = dbQ.eq('category_id', categoryId);
    dbQ = dbQ.order('trending', { ascending: false })
             .order('save_count', { ascending: false })
             .limit(limit);
    const { data } = await dbQ;
    return data || [];
  } catch { return []; }
}

// ── Related items ─────────────────────────────────
export async function getRelated(item, limit = 4) {
  if (!supabase || !item) return [];
  try {
    const { data } = await supabase
      .from('items').select('*')
      .eq('category_id', item.category_id)
      .eq('approved', true).neq('id', item.id)
      .order('save_count', { ascending: false })
      .limit(limit);
    return data || [];
  } catch { return []; }
}

// ── Recommendations ────────────────────────────────
export async function getRecommendations(limit = 6) {
  if (!supabase) return [];
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getTrending(limit);
    const { data: favs } = await supabase
      .from('favorites').select('item_id, items(category_id)')
      .eq('user_id', user.id).limit(20);
    if (!favs || !favs.length) return getTrending(limit);
    const counts = {};
    favs.forEach(f => { const cat = f.items?.category_id; if (cat) counts[cat] = (counts[cat] || 0) + 1; });
    const topCat = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, Object.keys(counts)[0]);
    const excludeIds = favs.map(f => f.item_id).filter(Boolean);
    const { data } = await supabase.from('items').select('*')
      .eq('approved', true).eq('category_id', topCat)
      .order('save_count', { ascending: false }).limit(limit);
    const result = (data || []).filter(i => !excludeIds.includes(i.id));
    return result.length ? result : getTrending(limit);
  } catch { return getTrending(limit); }
}

// ── Newest ────────────────────────────────────────
export async function getNewest(limit = 12) {
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from('items').select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  } catch { return []; }
}
