// js/auth.js — NovaHub Authentication System
// Handles: email login, Google OAuth, register, anonymous sessions
// Depends on: supabase.js loaded first

const NovaAuth = (() => {

  // ── ANONYMOUS SESSION LIMITS ───────────────────────────
  const ANON_LIMITS = {
    maxFavorites: 10,
    maxCommentsPerDay: 5,
    maxLists: 3,
  }

  // ── REGISTER WITH EMAIL ────────────────────────────────
  async function register(email, password, displayName) {
    const { data, error } = await NovaDB.client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName }
      }
    })

    if (error) return { success: false, error: error.message }

    return {
      success: true,
      user: data.user,
      message: 'Check your email to verify your account.'
    }
  }

  // ── LOGIN WITH EMAIL ───────────────────────────────────
  async function login(email, password) {
    const { data, error } = await NovaDB.client.auth.signInWithPassword({
      email,
      password
    })

    if (error) return { success: false, error: error.message }

    // Merge anonymous favorites into real account
    await mergeAnonData(data.user.id)

    return { success: true, user: data.user }
  }

  // ── LOGIN WITH GOOGLE ──────────────────────────────────
  async function loginWithGoogle() {
    const { error } = await NovaDB.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/account/dashboard.html'
      }
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  // ── LOGIN WITH GITHUB ──────────────────────────────────
  async function loginWithGithub() {
    const { error } = await NovaDB.client.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/account/dashboard.html'
      }
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  // ── LOGOUT ─────────────────────────────────────────────
  async function logout() {
    const { error } = await NovaDB.client.auth.signOut()
    if (error) return { success: false, error: error.message }

    // Clear anonymous session
    localStorage.removeItem('nova_anon_id')

    window.location.href = '/index.html'
    return { success: true }
  }

  // ── RESET PASSWORD ─────────────────────────────────────
  async function resetPassword(email) {
    const { error } = await NovaDB.client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/account/reset-password.html'
    })

    if (error) return { success: false, error: error.message }
    return { success: true, message: 'Password reset email sent.' }
  }

  // ── ANONYMOUS SESSION ──────────────────────────────────
  // Creates or retrieves an anonymous session
  // Stored in localStorage, expires after 30 days
  async function getOrCreateAnonSession() {
    // Check if we already have an anon session
    const existingId = localStorage.getItem('nova_anon_id')

    if (existingId) {
      // Verify it still exists in database
      const { data } = await NovaDB.client
        .from('anon_sessions')
        .select('*')
        .eq('id', existingId)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (data) {
        // Update last seen
        await NovaDB.client
          .from('anon_sessions')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', existingId)

        return data
      }
    }

    // Create new anonymous session
    const fingerprint = generateFingerprint()

    const { data, error } = await NovaDB.client
      .from('anon_sessions')
      .insert({
        fingerprint,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (error || !data) return null

    localStorage.setItem('nova_anon_id', data.id)
    return data
  }

  // ── FINGERPRINT ────────────────────────────────────────
  // Simple device fingerprint — not perfect but reduces abuse
  function generateFingerprint() {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
    ]
    return btoa(components.join('|')).substring(0, 64)
  }

  // ── ANON LIMITS CHECK ──────────────────────────────────
  async function checkAnonLimit(limitType) {
    const anonId = localStorage.getItem('nova_anon_id')
    if (!anonId) return { allowed: false, reason: 'No session' }

    const { data } = await NovaDB.client
      .from('anon_sessions')
      .select('favorites_count, comments_today, last_comment_date')
      .eq('id', anonId)
      .single()

    if (!data) return { allowed: false, reason: 'Session expired' }

    if (limitType === 'favorites') {
      if (data.favorites_count >= ANON_LIMITS.maxFavorites) {
        return {
          allowed: false,
          reason: `Anonymous users can save up to ${ANON_LIMITS.maxFavorites} items. Sign up to save unlimited items.`,
          showUpgrade: true
        }
      }
    }

    if (limitType === 'comments') {
      const today = new Date().toISOString().split('T')[0]
      const isToday = data.last_comment_date === today
      const count = isToday ? data.comments_today : 0

      if (count >= ANON_LIMITS.maxCommentsPerDay) {
        return {
          allowed: false,
          reason: `Anonymous users can post ${ANON_LIMITS.maxCommentsPerDay} comments per day. Sign up for unlimited comments.`,
          showUpgrade: true
        }
      }
    }

    return { allowed: true }
  }

  // ── MERGE ANON DATA ON SIGNUP ──────────────────────────
  // When anon user creates an account, move their favorites
  async function mergeAnonData(userId) {
    const anonId = localStorage.getItem('nova_anon_id')
    if (!anonId) return

    // Move anonymous favorites to real account
    const { data: anonFavs } = await NovaDB.client
      .from('favorites')
      .select('item_id')
      .eq('anon_id', anonId)

    if (anonFavs && anonFavs.length > 0) {
      const newFavs = anonFavs.map(f => ({
        item_id: f.item_id,
        user_id: userId,
        anon_id: null
      }))

      await NovaDB.client
        .from('favorites')
        .upsert(newFavs, { onConflict: 'item_id,user_id', ignoreDuplicates: true })

      // Delete old anon favorites
      await NovaDB.client
        .from('favorites')
        .delete()
        .eq('anon_id', anonId)
    }

    // Clear anon session
    localStorage.removeItem('nova_anon_id')
  }

  // ── UPDATE NAV UI ──────────────────────────────────────
  // Call this on every page to update the nav based on auth state
  async function updateNavUI() {
    const user = await NovaDB.getCurrentUser()
    const navActions = document.getElementById('nav-auth-actions')
    const navAvatar = document.getElementById('nav-avatar')

    if (!navActions && !navAvatar) return

    if (user) {
      const profile = await NovaDB.getUserProfile(user.id)
      const displayName = profile?.display_name || user.email.split('@')[0]
      const initial = displayName.charAt(0).toUpperCase()

      if (navActions) {
        navActions.innerHTML = `
          <a href="/account/dashboard.html" class="nav-user-btn" title="${displayName}">
            <div class="nav-avatar">${initial}</div>
            <span class="nav-username">${displayName}</span>
          </a>
          <button class="icon-btn" onclick="NovaAuth.logout()" title="Sign out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>`
      }
    } else {
      if (navActions) {
        navActions.innerHTML = `
          <a href="/account/login.html" class="btn-ghost" style="font-size:13px;padding:8px 18px">Sign in</a>
          <a href="/account/register.html" class="btn-primary" style="font-size:13px;padding:8px 18px">Sign up</a>`
      }
    }
  }

  // ── PROTECT PAGE ───────────────────────────────────────
  // Redirect to login if not authenticated
  async function requireAuth(redirectBack = true) {
    const user = await NovaDB.getCurrentUser()
    if (!user) {
      const returnUrl = redirectBack
        ? '?return=' + encodeURIComponent(window.location.pathname)
        : ''
      window.location.href = '/account/login.html' + returnUrl
      return null
    }
    return user
  }

  return {
    register,
    login,
    loginWithGoogle,
    loginWithGithub,
    logout,
    resetPassword,
    getOrCreateAnonSession,
    checkAnonLimit,
    mergeAnonData,
    updateNavUI,
    requireAuth,
    ANON_LIMITS,
  }

})()

window.NovaAuth = NovaAuth
