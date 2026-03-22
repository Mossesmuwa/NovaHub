// js/favorites.js — NovaHub Favorites
// Works for both anonymous and registered users

const NovaFavorites = (function () {

  function _db() { return window.NovaDB && window.NovaDB.client }

  // ── Add ───────────────────────────────────────────────
  async function add(itemId) {
    if (!_db()) return { success: false, error: 'Not ready.' }
    const user = await NovaDB.getCurrentUser()

    if (user) {
      try {
        const { error } = await _db().from('favorites')
          .insert({ item_id: itemId, user_id: user.id })
        if (error) {
          if (error.code === '23505') return { success: false, error: 'Already saved.' }
          return { success: false, error: error.message }
        }
        return { success: true }
      } catch (e) { return { success: false, error: e.message } }
    }

    // Anonymous
    const limitCheck = await NovaAuth.checkAnonLimit('favorites')
    if (!limitCheck.allowed) return limitCheck

    const session = await NovaAuth.getOrCreateAnonSession()
    if (!session) return { success: false, error: 'Could not create session.' }

    try {
      const { error } = await _db().from('favorites')
        .insert({ item_id: itemId, anon_id: session.id })
      if (error) {
        if (error.code === '23505') return { success: false, error: 'Already saved.' }
        return { success: false, error: error.message }
      }
      // Update count
      _db().from('anon_sessions')
        .update({ favorites_count: (session.favorites_count || 0) + 1 })
        .eq('id', session.id)
        .then(() => {}).catch(() => {})
      return { success: true }
    } catch (e) { return { success: false, error: e.message } }
  }

  // ── Remove ────────────────────────────────────────────
  async function remove(itemId) {
    if (!_db()) return { success: false, error: 'Not ready.' }
    const user = await NovaDB.getCurrentUser()

    try {
      if (user) {
        await _db().from('favorites').delete()
          .eq('item_id', itemId).eq('user_id', user.id)
        return { success: true }
      }
      const anonId = _anonId()
      if (!anonId) return { success: false, error: 'No session.' }
      await _db().from('favorites').delete()
        .eq('item_id', itemId).eq('anon_id', anonId)
      return { success: true }
    } catch (e) { return { success: false, error: e.message } }
  }

  // ── Toggle ────────────────────────────────────────────
  async function toggle(itemId, btn) {
    if (btn) { btn.disabled = true; btn.style.opacity = '0.5' }

    const saved = await isFavorited(itemId)
    const result = saved ? await remove(itemId) : await add(itemId)

    if (btn) { btn.disabled = false; btn.style.opacity = '1' }

    if (!result.success) {
      if (result.showUpgrade) showUpgradePrompt(result.reason)
      else _toast(result.error || 'Something went wrong.', 'error')
      return saved // unchanged
    }

    const newState = !saved
    _updateBtn(btn, newState)
    _toast(newState ? '♥ Saved to favorites' : 'Removed from favorites', newState ? 'success' : 'info')
    return newState
  }

  // ── Is favorited ──────────────────────────────────────
  async function isFavorited(itemId) {
    if (!_db() || !itemId) return false
    const user = await NovaDB.getCurrentUser()
    try {
      if (user) {
        const { data } = await _db().from('favorites').select('id')
          .eq('item_id', itemId).eq('user_id', user.id).single()
        return !!data
      }
      const id = _anonId()
      if (!id) return false
      const { data } = await _db().from('favorites').select('id')
        .eq('item_id', itemId).eq('anon_id', id).single()
      return !!data
    } catch { return false }
  }

  // ── Get all ───────────────────────────────────────────
  async function getAll() {
    if (!_db()) return []
    const user = await NovaDB.getCurrentUser()
    try {
      if (user) {
        const { data } = await _db().from('favorites')
          .select('*, items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        return (data || []).map(function (f) { return f.items }).filter(Boolean)
      }
      const id = _anonId()
      if (!id) return []
      const { data } = await _db().from('favorites')
        .select('*, items(*)')
        .eq('anon_id', id)
        .order('created_at', { ascending: false })
      return (data || []).map(function (f) { return f.items }).filter(Boolean)
    } catch { return [] }
  }

  // ── Init all buttons on page ──────────────────────────
  async function initAll() {
    var buttons = document.querySelectorAll('[data-fav-btn]')
    for (var i = 0; i < buttons.length; i++) {
      var btn   = buttons[i]
      var id    = btn.getAttribute('data-item-id')
      if (!id) continue
      var saved = await isFavorited(id)
      _updateBtn(btn, saved)
      ;(function (btn, id) {
        btn.addEventListener('click', function (e) {
          e.preventDefault()
          e.stopPropagation()
          toggle(id, btn)
        })
      })(btn, id)
    }
  }

  // ── Upgrade modal ─────────────────────────────────────
  function showUpgradePrompt(msg) {
    var old = document.getElementById('nova-upgrade-modal')
    if (old) old.remove()

    var overlay = document.createElement('div')
    overlay.id  = 'nova-upgrade-modal'
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px'
    overlay.innerHTML =
      '<div style="background:var(--bg2);border:1px solid var(--border2);border-radius:24px;padding:40px;max-width:420px;width:100%;text-align:center;animation:novaFadeUp .3s ease">' +
        '<div style="font-size:48px;margin-bottom:16px">⭐</div>' +
        '<h3 style="font-size:22px;font-weight:900;margin-bottom:12px;letter-spacing:-.025em">Save more items</h3>' +
        '<p style="font-size:15px;color:var(--t2);line-height:1.6;margin-bottom:28px">' + _esc(msg || 'Create a free account to save unlimited items.') + '</p>' +
        '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
          '<a href="/account/register.html" class="btn-primary" style="font-size:14px">Create Free Account</a>' +
          '<button onclick="document.getElementById(\'nova-upgrade-modal\').remove()" style="background:var(--surf);border:1px solid var(--border2);border-radius:99px;padding:12px 22px;font-size:14px;font-weight:600;color:var(--t2);cursor:pointer">Maybe Later</button>' +
        '</div>' +
      '</div>'

    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove() })
    document.body.appendChild(overlay)
  }

  // ── Private helpers ───────────────────────────────────
  function _anonId() {
    try { return localStorage.getItem('nova_anon_id') } catch { return null }
  }

  function _updateBtn(btn, saved) {
    if (!btn) return
    if (saved) {
      btn.textContent = '♥ Saved'
      btn.setAttribute('data-saved', 'true')
      btn.style.background = 'var(--gold-grad)'
      btn.style.color = '#09090C'
    } else {
      btn.textContent = '♡ Save'
      btn.removeAttribute('data-saved')
      btn.style.background = ''
      btn.style.color = ''
    }
  }

  function _toast(msg, type) {
    if (window.NovaUI && window.NovaUI.toast) {
      window.NovaUI.toast(msg, type)
    }
  }

  function _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  return { add, remove, toggle, isFavorited, getAll, initAll, showUpgradePrompt }

})()

window.NovaFavorites = NovaFavorites
