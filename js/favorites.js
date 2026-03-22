// js/favorites.js — NovaHub Favorites System
// Works for both anonymous and registered users
// Anonymous users limited to 10 favorites

const NovaFavorites = (() => {

  // ── ADD FAVORITE ───────────────────────────────────────
  async function add(itemId) {
    const user = await NovaDB.getCurrentUser()

    if (user) {
      // Registered user
      const { error } = await NovaDB.client
        .from('favorites')
        .insert({ item_id: itemId, user_id: user.id })

      if (error) {
        if (error.code === '23505') return { success: false, error: 'Already saved.' }
        return { success: false, error: error.message }
      }
      return { success: true }
    }

    // Anonymous user — check limits first
    const limitCheck = await NovaAuth.checkAnonLimit('favorites')
    if (!limitCheck.allowed) return limitCheck

    const anonSession = await NovaAuth.getOrCreateAnonSession()
    if (!anonSession) return { success: false, error: 'Could not create session.' }

    const { error } = await NovaDB.client
      .from('favorites')
      .insert({ item_id: itemId, anon_id: anonSession.id })

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Already saved.' }
      return { success: false, error: error.message }
    }

    // Update anon favorites count
    await NovaDB.client
      .from('anon_sessions')
      .update({ favorites_count: anonSession.favorites_count + 1 })
      .eq('id', anonSession.id)

    return { success: true }
  }

  // ── REMOVE FAVORITE ────────────────────────────────────
  async function remove(itemId) {
    const user = await NovaDB.getCurrentUser()

    if (user) {
      const { error } = await NovaDB.client
        .from('favorites')
        .delete()
        .eq('item_id', itemId)
        .eq('user_id', user.id)

      if (error) return { success: false, error: error.message }
      return { success: true }
    }

    const anonId = localStorage.getItem('nova_anon_id')
    if (!anonId) return { success: false, error: 'No session found.' }

    const { error } = await NovaDB.client
      .from('favorites')
      .delete()
      .eq('item_id', itemId)
      .eq('anon_id', anonId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  // ── TOGGLE FAVORITE ────────────────────────────────────
  async function toggle(itemId, buttonEl) {
    const isSaved = await isFavorited(itemId)

    if (buttonEl) {
      buttonEl.disabled = true
      buttonEl.style.opacity = '0.6'
    }

    let result
    if (isSaved) {
      result = await remove(itemId)
    } else {
      result = await add(itemId)
    }

    if (buttonEl) {
      buttonEl.disabled = false
      buttonEl.style.opacity = '1'
    }

    if (!result.success) {
      if (result.showUpgrade) {
        showUpgradePrompt(result.reason)
      } else {
        NovaUI.toast(result.error || 'Something went wrong.', 'error')
      }
      return false
    }

    const newState = !isSaved
    updateButton(buttonEl, newState)
    NovaUI.toast(newState ? '✦ Saved to favorites' : 'Removed from favorites', newState ? 'success' : 'info')
    return newState
  }

  // ── IS ITEM FAVORITED ──────────────────────────────────
  async function isFavorited(itemId) {
    const user = await NovaDB.getCurrentUser()

    if (user) {
      const { data } = await NovaDB.client
        .from('favorites')
        .select('id')
        .eq('item_id', itemId)
        .eq('user_id', user.id)
        .single()

      return !!data
    }

    const anonId = localStorage.getItem('nova_anon_id')
    if (!anonId) return false

    const { data } = await NovaDB.client
      .from('favorites')
      .select('id')
      .eq('item_id', itemId)
      .eq('anon_id', anonId)
      .single()

    return !!data
  }

  // ── GET ALL FAVORITES ──────────────────────────────────
  async function getAll() {
    const user = await NovaDB.getCurrentUser()

    if (user) {
      const { data, error } = await NovaDB.client
        .from('favorites')
        .select('*, items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) return []
      return data.map(f => f.items).filter(Boolean)
    }

    const anonId = localStorage.getItem('nova_anon_id')
    if (!anonId) return []

    const { data, error } = await NovaDB.client
      .from('favorites')
      .select('*, items(*)')
      .eq('anon_id', anonId)
      .order('created_at', { ascending: false })

    if (error) return []
    return data.map(f => f.items).filter(Boolean)
  }

  // ── GET FAVORITES COUNT ────────────────────────────────
  async function getCount() {
    const user = await NovaDB.getCurrentUser()

    if (user) {
      const { count } = await NovaDB.client
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      return count || 0
    }

    const anonId = localStorage.getItem('nova_anon_id')
    if (!anonId) return 0

    const { data } = await NovaDB.client
      .from('anon_sessions')
      .select('favorites_count')
      .eq('id', anonId)
      .single()

    return data?.favorites_count || 0
  }

  // ── INIT FAVORITE BUTTON ───────────────────────────────
  // Call on any button with data-item-id attribute
  async function initButton(buttonEl) {
    if (!buttonEl) return

    const itemId = buttonEl.dataset.itemId
    if (!itemId) return

    const saved = await isFavorited(itemId)
    updateButton(buttonEl, saved)

    buttonEl.addEventListener('click', async (e) => {
      e.preventDefault()
      e.stopPropagation()
      await toggle(itemId, buttonEl)
    })
  }

  // ── INIT ALL FAVORITE BUTTONS ON PAGE ─────────────────
  async function initAll() {
    const buttons = document.querySelectorAll('[data-favorite-btn]')
    for (const btn of buttons) {
      await initButton(btn)
    }
  }

  // ── UPDATE BUTTON VISUAL STATE ─────────────────────────
  function updateButton(buttonEl, isSaved) {
    if (!buttonEl) return

    if (isSaved) {
      buttonEl.innerHTML = '♥ Saved'
      buttonEl.classList.add('favorited')
      buttonEl.style.background = 'var(--gold-grad)'
      buttonEl.style.color = '#09090C'
    } else {
      buttonEl.innerHTML = '♡ Save'
      buttonEl.classList.remove('favorited')
      buttonEl.style.background = ''
      buttonEl.style.color = ''
    }
  }

  // ── SHOW UPGRADE PROMPT ────────────────────────────────
  function showUpgradePrompt(message) {
    const modal = document.createElement('div')
    modal.className = 'nova-modal-overlay'
    modal.innerHTML = `
      <div class="nova-modal">
        <div class="nova-modal-icon">⭐</div>
        <h3>Upgrade to save more</h3>
        <p>${message}</p>
        <div class="nova-modal-actions">
          <a href="/account/register.html" class="btn-primary">Create Free Account</a>
          <button class="btn-secondary" onclick="this.closest('.nova-modal-overlay').remove()">Maybe Later</button>
        </div>
      </div>`

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove()
    })

    document.body.appendChild(modal)
  }

  return {
    add,
    remove,
    toggle,
    isFavorited,
    getAll,
    getCount,
    initButton,
    initAll,
  }

})()

window.NovaFavorites = NovaFavorites
