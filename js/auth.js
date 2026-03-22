// js/auth.js — NovaHub Auth System
// Depends on: supabase.js

const NovaAuth = (function () {

  const ANON_LIMITS = { maxFavorites: 10, maxCommentsPerDay: 5 }

  // ── Helpers ───────────────────────────────────────────
  function _client() { return window.NovaDB && window.NovaDB.client }

  function _anonId() {
    try { return localStorage.getItem('nova_anon_id') } catch { return null }
  }

  function _setAnonId(id) {
    try { localStorage.setItem('nova_anon_id', id) } catch {}
  }

  function _clearAnonId() {
    try { localStorage.removeItem('nova_anon_id') } catch {}
  }

  // ── Fingerprint (browser signals — not perfect but reduces abuse) ─
  function _fingerprint() {
    try {
      return btoa([
        navigator.userAgent || '',
        navigator.language || '',
        (screen.width || 0) + 'x' + (screen.height || 0),
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 0,
      ].join('|')).slice(0, 64)
    } catch { return 'anon-' + Math.random().toString(36).slice(2) }
  }

  // ── Register ──────────────────────────────────────────
  async function register(email, password, displayName) {
    if (!_client()) return { success: false, error: 'Database not ready.' }
    const { data, error } = await _client().auth.signUp({
      email, password,
      options: { data: { full_name: displayName } }
    })
    if (error) return { success: false, error: error.message }
    return { success: true, user: data.user }
  }

  // ── Login ─────────────────────────────────────────────
  async function login(email, password) {
    if (!_client()) return { success: false, error: 'Database not ready.' }
    const { data, error } = await _client().auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    // Quietly merge anon data — don't block login if it fails
    mergeAnonData(data.user.id).catch(() => {})
    return { success: true, user: data.user }
  }

  // ── Google OAuth ──────────────────────────────────────
  async function loginWithGoogle() {
    if (!_client()) return { success: false, error: 'Database not ready.' }
    const { error } = await _client().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/account/dashboard.html' }
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  // ── GitHub OAuth ──────────────────────────────────────
  async function loginWithGithub() {
    if (!_client()) return { success: false, error: 'Database not ready.' }
    const { error } = await _client().auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin + '/account/dashboard.html' }
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  // ── Logout ────────────────────────────────────────────
  async function logout() {
    if (!_client()) { window.location.href = '/index.html'; return }
    await _client().auth.signOut().catch(() => {})
    _clearAnonId()
    window.location.href = '/index.html'
  }

  // ── Reset password ────────────────────────────────────
  async function resetPassword(email) {
    if (!_client()) return { success: false, error: 'Database not ready.' }
    const { error } = await _client().auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/account/reset-password.html'
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  // ── Anonymous session ─────────────────────────────────
  async function getOrCreateAnonSession() {
    if (!_client()) return null
    const existingId = _anonId()

    if (existingId) {
      try {
        const { data } = await _client()
          .from('anon_sessions')
          .select('*')
          .eq('id', existingId)
          .gt('expires_at', new Date().toISOString())
          .single()

        if (data) {
          _client().from('anon_sessions')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', existingId)
            .then(() => {}).catch(() => {})
          return data
        }
      } catch {}
    }

    // Create new session
    try {
      const { data, error } = await _client()
        .from('anon_sessions')
        .insert({
          fingerprint: _fingerprint(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (!error && data) {
        _setAnonId(data.id)
        return data
      }
    } catch {}
    return null
  }

  // ── Check anon limits ─────────────────────────────────
  async function checkAnonLimit(type) {
    if (!_client()) return { allowed: true }
    const id = _anonId()
    if (!id) return { allowed: true }

    try {
      const { data } = await _client()
        .from('anon_sessions')
        .select('favorites_count, comments_today, last_comment_date')
        .eq('id', id)
        .single()

      if (!data) return { allowed: true }

      if (type === 'favorites' && data.favorites_count >= ANON_LIMITS.maxFavorites) {
        return {
          allowed: false,
          showUpgrade: true,
          reason: 'You\'ve reached the ' + ANON_LIMITS.maxFavorites + ' item limit for anonymous users. Create a free account to save unlimited items.'
        }
      }

      if (type === 'comments') {
        const today    = new Date().toISOString().split('T')[0]
        const isToday  = data.last_comment_date === today
        const todayCount = isToday ? (data.comments_today || 0) : 0
        if (todayCount >= ANON_LIMITS.maxCommentsPerDay) {
          return {
            allowed: false,
            showUpgrade: true,
            reason: 'You\'ve reached ' + ANON_LIMITS.maxCommentsPerDay + ' comments today. Sign up for unlimited comments.'
          }
        }
      }
    } catch {}

    return { allowed: true }
  }

  // ── Merge anon data on signup ─────────────────────────
  async function mergeAnonData(userId) {
    if (!_client()) return
    const id = _anonId()
    if (!id) return
    try {
      const { data: favs } = await _client()
        .from('favorites').select('item_id').eq('anon_id', id)

      if (favs && favs.length) {
        await _client().from('favorites')
          .upsert(
            favs.map(f => ({ item_id: f.item_id, user_id: userId })),
            { onConflict: 'item_id,user_id', ignoreDuplicates: true }
          )
        await _client().from('favorites').delete().eq('anon_id', id)
      }
    } catch {}
    _clearAnonId()
  }

  // ── Update nav UI based on auth state ────────────────
  async function updateNavUI() {
    const el = document.getElementById('nav-auth-actions')
    if (!el) return

    try {
      const user = await NovaDB.getCurrentUser()
      if (user) {
        const profile = await NovaDB.getUserProfile(user.id)
        const name    = (profile && profile.display_name) || user.email.split('@')[0]
        const initial = name.charAt(0).toUpperCase()
        el.innerHTML =
          '<a href="/account/dashboard.html" class="nav-user-btn" title="Dashboard">' +
            '<div class="nav-avatar">' + initial + '</div>' +
            '<span class="nav-username">' + _esc(name) + '</span>' +
          '</a>' +
          '<button class="icon-btn" onclick="NovaAuth.logout()" title="Sign out">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>' +
              '<polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>' +
            '</svg>' +
          '</button>'
      } else {
        el.innerHTML =
          '<a href="/account/login.html" class="btn-ghost" style="font-size:13px;padding:8px 18px">Sign in</a>' +
          '<a href="/account/register.html" class="btn-primary" style="font-size:13px;padding:8px 18px">Sign up</a>'
      }
    } catch {
      el.innerHTML =
        '<a href="/account/login.html" class="btn-ghost" style="font-size:13px;padding:8px 18px">Sign in</a>' +
        '<a href="/account/register.html" class="btn-primary" style="font-size:13px;padding:8px 18px">Sign up</a>'
    }
  }

  // ── Require auth (redirect if not logged in) ──────────
  async function requireAuth() {
    const user = await NovaDB.getCurrentUser()
    if (!user) {
      window.location.href = '/account/login.html?return=' + encodeURIComponent(window.location.pathname)
      return null
    }
    return user
  }

  function _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  return {
    register, login, loginWithGoogle, loginWithGithub,
    logout, resetPassword,
    getOrCreateAnonSession, checkAnonLimit, mergeAnonData,
    updateNavUI, requireAuth,
    ANON_LIMITS,
  }

})()

window.NovaAuth = NovaAuth
