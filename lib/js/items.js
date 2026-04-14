// js/items.js — NovaHub Content Layer
// All database queries for items, categories, trending

const NovaItems = (function () {

  function _db() { return window.NovaDB && window.NovaDB.client }

  // ── Categories ────────────────────────────────────────
  async function getCategories() {
    if (!_db()) return []
    try {
      const { data } = await _db().from('categories').select('*').order('name')
      return data || []
    } catch { return [] }
  }

  // ── Items by category ─────────────────────────────────
  async function getByCategory(catId, opts) {
    if (!_db()) return []
    const { limit = 24, offset = 0, sortBy = 'trending', freeOnly = false } = opts || {}
    try {
      let q = _db().from('items').select('*').eq('category_id', catId).eq('approved', true)
      if (freeOnly) q = q.ilike('pricing', '%free%')
      if (sortBy === 'rating')  q = q.order('rating',     { ascending: false })
      else if (sortBy === 'newest') q = q.order('year',   { ascending: false })
      else if (sortBy === 'name')   q = q.order('name',   { ascending: true  })
      else q = q.order('trending', { ascending: false }).order('save_count', { ascending: false })
      q = q.range(offset, offset + limit - 1)
      const { data } = await q
      return data || []
    } catch { return [] }
  }

  // ── Trending ──────────────────────────────────────────
  async function getTrending(limit) {
    if (!_db()) return []
    limit = limit || 12
    try {
      const { data } = await _db()
        .from('items')
        .select('*')
        .eq('approved', true)
        .eq('trending', true)
        .order('save_count', { ascending: false })
        .limit(limit)
      return data || []
    } catch { return [] }
  }

  // ── Daily picks ───────────────────────────────────────
  async function getDailyPicks(limit) {
    if (!_db()) return []
    limit = limit || 6
    try {
      const { data } = await _db()
        .from('items').select('*')
        .eq('approved', true).eq('daily_pick', true).limit(limit)
      return data || []
    } catch { return [] }
  }

  // ── Featured (has image) ──────────────────────────────
  async function getFeatured(limit) {
    if (!_db()) return []
    limit = limit || 5
    try {
      const { data } = await _db()
        .from('items').select('*')
        .eq('approved', true).eq('featured', true)
        .not('image', 'is', null).limit(limit)
      return data || []
    } catch { return [] }
  }

  // ── Single item by slug ───────────────────────────────
  async function getBySlug(slug) {
    if (!_db() || !slug) return null
    try {
      const { data } = await _db()
        .from('items').select('*')
        .eq('slug', slug).eq('approved', true).single()

      if (data) {
        // Increment view count silently
        _db().from('items')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id)
          .then(() => {}).catch(() => {})
      }
      return data || null
    } catch { return null }
  }

  // ── Single item by ID ─────────────────────────────────
  async function getById(id) {
    if (!_db() || !id) return null
    try {
      const { data } = await _db()
        .from('items').select('*').eq('id', id).single()
      return data || null
    } catch { return null }
  }

  // ── Search ────────────────────────────────────────────
  async function search(query, opts) {
    if (!_db()) return []
    const { categoryId = null, limit = 24 } = opts || {}

    if (!query || query.trim().length < 2) return getTrending(limit)

    const q = query.trim().toLowerCase()
    try {
      let dbQ = _db().from('items').select('*').eq('approved', true)
        .or('name.ilike.%' + q + '%,short_desc.ilike.%' + q + '%,genre.ilike.%' + q + '%,author.ilike.%' + q + '%')

      if (categoryId) dbQ = dbQ.eq('category_id', categoryId)
      dbQ = dbQ.order('trending', { ascending: false })
               .order('save_count', { ascending: false })
               .limit(limit)

      const { data } = await dbQ
      return data || []
    } catch { return [] }
  }

  // ── Related items ─────────────────────────────────────
  async function getRelated(item, limit) {
    if (!_db() || !item) return []
    limit = limit || 4
    try {
      const { data } = await _db()
        .from('items').select('*')
        .eq('category_id', item.category_id)
        .eq('approved', true)
        .neq('id', item.id)
        .order('save_count', { ascending: false })
        .limit(limit)
      return data || []
    } catch { return [] }
  }

  // ── Newest ────────────────────────────────────────────
  async function getNewest(limit) {
    if (!_db()) return []
    limit = limit || 12
    try {
      const { data } = await _db()
        .from('items').select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(limit)
      return data || []
    } catch { return [] }
  }

  // ── AI Recommendations ────────────────────────────────
  async function getRecommendations(limit) {
    if (!_db()) return []
    limit = limit || 6
    try {
      const user = await NovaDB.getCurrentUser()
      if (!user) return getTrending(limit)

      const { data: favs } = await _db()
        .from('favorites')
        .select('item_id, items(category_id)')
        .eq('user_id', user.id)
        .limit(20)

      if (!favs || !favs.length) return getTrending(limit)

      // Find top category from user's favorites
      const counts = {}
      favs.forEach(function (f) {
        var cat = f.items && f.items.category_id
        if (cat) counts[cat] = (counts[cat] || 0) + 1
      })

      var topCat = Object.keys(counts).reduce(function (a, b) {
        return counts[a] > counts[b] ? a : b
      }, Object.keys(counts)[0])

      var excludeIds = favs.map(function (f) { return f.item_id }).filter(Boolean)

      var q = _db().from('items').select('*')
        .eq('approved', true).eq('category_id', topCat)
        .order('save_count', { ascending: false })
        .limit(limit)

      const { data } = await q
      var result = (data || []).filter(function (i) { return excludeIds.indexOf(i.id) === -1 })
      return result.length ? result : getTrending(limit)
    } catch { return getTrending(limit) }
  }

  return {
    getCategories, getByCategory, getTrending, getDailyPicks,
    getFeatured, getBySlug, getById, search, getRelated,
    getNewest, getRecommendations,
  }

})()

window.NovaItems = NovaItems
