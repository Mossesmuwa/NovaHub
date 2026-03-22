// js/items.js — NovaHub Content Layer
// All functions for fetching items, categories, trending from Supabase

const NovaItems = (() => {

  // ── GET ALL CATEGORIES ─────────────────────────────────
  async function getCategories() {
    const { data, error } = await NovaDB.client
      .from('categories')
      .select('*')
      .order('name')

    if (error) { console.error('getCategories:', error); return [] }
    return data
  }

  // ── GET ITEMS BY CATEGORY ──────────────────────────────
  async function getByCategory(categoryId, options = {}) {
    const {
      limit    = 24,
      offset   = 0,
      sortBy   = 'trending',
      freeOnly = false,
    } = options

    let query = NovaDB.client
      .from('items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('approved', true)

    if (freeOnly) {
      query = query.ilike('pricing', '%free%')
    }

    if (sortBy === 'rating') {
      query = query.order('rating', { ascending: false })
    } else if (sortBy === 'newest') {
      query = query.order('year', { ascending: false })
    } else if (sortBy === 'name') {
      query = query.order('name', { ascending: true })
    } else {
      // Default: trending first, then by save_count
      query = query
        .order('trending', { ascending: false })
        .order('save_count', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error) { console.error('getByCategory:', error); return [] }
    return data
  }

  // ── GET TRENDING ITEMS ─────────────────────────────────
  async function getTrending(limit = 12) {
    const { data, error } = await NovaDB.client
      .from('items')
      .select(`
        *,
        trending_scores (score, views_24h)
      `)
      .eq('approved', true)
      .eq('trending', true)
      .order('save_count', { ascending: false })
      .limit(limit)

    if (error) { console.error('getTrending:', error); return [] }
    return data
  }

  // ── GET DAILY PICKS ────────────────────────────────────
  async function getDailyPicks(limit = 6) {
    const { data, error } = await NovaDB.client
      .from('items')
      .select('*')
      .eq('approved', true)
      .eq('daily_pick', true)
      .limit(limit)

    if (error) { console.error('getDailyPicks:', error); return [] }
    return data
  }

  // ── GET FEATURED ITEMS ─────────────────────────────────
  async function getFeatured(limit = 5) {
    const { data, error } = await NovaDB.client
      .from('items')
      .select('*')
      .eq('approved', true)
      .eq('featured', true)
      .not('image', 'is', null)
      .limit(limit)

    if (error) { console.error('getFeatured:', error); return [] }
    return data
  }

  // ── GET SINGLE ITEM BY SLUG ────────────────────────────
  async function getBySlug(slug) {
    const { data, error } = await NovaDB.client
      .from('items')
      .select('*')
      .eq('slug', slug)
      .eq('approved', true)
      .single()

    if (error) return null

    // Increment view count
    await NovaDB.client.rpc('increment_view_count', { item_id: data.id })
      .catch(() => {
        // Fallback if RPC doesn't exist yet
        NovaDB.client
          .from('items')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id)
      })

    return data
  }

  // ── GET SINGLE ITEM BY ID ──────────────────────────────
  async function getById(id) {
    const { data, error } = await NovaDB.client
      .from('items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  // ── SEARCH ITEMS ───────────────────────────────────────
  async function search(query, options = {}) {
    const { categoryId = null, limit = 24 } = options

    if (!query || query.trim().length < 2) {
      return getTrending(limit)
    }

    const q = query.trim().toLowerCase()

    let dbQuery = NovaDB.client
      .from('items')
      .select('*')
      .eq('approved', true)
      .or(`name.ilike.%${q}%,short_desc.ilike.%${q}%,genre.ilike.%${q}%,author.ilike.%${q}%,developer.ilike.%${q}%`)

    if (categoryId) {
      dbQuery = dbQuery.eq('category_id', categoryId)
    }

    dbQuery = dbQuery
      .order('trending', { ascending: false })
      .order('save_count', { ascending: false })
      .limit(limit)

    const { data, error } = await dbQuery
    if (error) { console.error('search:', error); return [] }
    return data
  }

  // ── GET RELATED ITEMS ──────────────────────────────────
  async function getRelated(item, limit = 4) {
    const { data, error } = await NovaDB.client
      .from('items')
      .select('*')
      .eq('category_id', item.category_id)
      .eq('approved', true)
      .neq('id', item.id)
      .order('save_count', { ascending: false })
      .limit(limit)

    if (error) return []
    return data
  }

  // ── GET ITEMS BY TYPE ──────────────────────────────────
  async function getByType(type, limit = 8) {
    const { data, error } = await NovaDB.client
      .from('items')
      .select('*')
      .eq('type', type)
      .eq('approved', true)
      .order('trending', { ascending: false })
      .limit(limit)

    if (error) return []
    return data
  }

  // ── GET NEW ITEMS ──────────────────────────────────────
  async function getNewest(limit = 12) {
    const { data, error } = await NovaDB.client
      .from('items')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return []
    return data
  }

  // ── RECORD VIEW HISTORY ────────────────────────────────
  async function recordView(itemId) {
    const user = await NovaDB.getCurrentUser()
    const anonId = localStorage.getItem('nova_anon_id')

    if (!user && !anonId) return

    await NovaDB.client
      .from('view_history')
      .insert({
        item_id: itemId,
        user_id: user?.id || null,
        anon_id: !user ? anonId : null,
      })
  }

  // ── AI RECOMMENDATIONS ─────────────────────────────────
  // Simple recommendation based on user history + similar items
  async function getRecommendations(limit = 6) {
    const user = await NovaDB.getCurrentUser()

    if (!user) {
      // For anonymous users return trending
      return getTrending(limit)
    }

    // Get user's favorite categories
    const { data: favs } = await NovaDB.client
      .from('favorites')
      .select('item_id, items(category_id, type)')
      .eq('user_id', user.id)
      .limit(20)

    if (!favs || favs.length === 0) {
      return getTrending(limit)
    }

    // Find most common category
    const categoryCounts = {}
    favs.forEach(f => {
      const cat = f.items?.category_id
      if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })

    const topCategory = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0]

    const favoriteIds = favs.map(f => f.item_id)

    // Get items from top category that user hasn't favorited
    const { data, error } = await NovaDB.client
      .from('items')
      .select('*')
      .eq('approved', true)
      .eq('category_id', topCategory)
      .not('id', 'in', `(${favoriteIds.join(',')})`)
      .order('save_count', { ascending: false })
      .limit(limit)

    if (error || !data?.length) return getTrending(limit)
    return data
  }

  return {
    getCategories,
    getByCategory,
    getTrending,
    getDailyPicks,
    getFeatured,
    getBySlug,
    getById,
    search,
    getRelated,
    getByType,
    getNewest,
    recordView,
    getRecommendations,
  }

})()

window.NovaItems = NovaItems
