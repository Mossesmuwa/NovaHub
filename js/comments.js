// js/comments.js — NovaHub Comments
// Real comments in Supabase. Anon users limited to 5/day.

const NovaComments = (function () {

  function _db() { return window.NovaDB && window.NovaDB.client }

  var BLOCKED = ['spam','casino','porn','xxx','scam','phishing','free money','click here']

  // ── Moderate text ─────────────────────────────────────
  function _moderate(text) {
    if (!text || text.trim().length < 3) return { ok: false, reason: 'Comment is too short.' }
    if (text.trim().length > 1200)       return { ok: false, reason: 'Comment is too long (max 1200 chars).' }
    var lower = text.toLowerCase()
    for (var i = 0; i < BLOCKED.length; i++) {
      if (lower.indexOf(BLOCKED[i]) !== -1)
        return { ok: false, reason: 'Comment contains inappropriate content.' }
    }
    return { ok: true }
  }

  // ── Random anon name ──────────────────────────────────
  function _randomName() {
    var adj  = ['Quick','Bold','Bright','Sharp','Clever','Calm','Brave','Witty','Swift','Keen']
    var noun = ['Fox','Owl','Panda','Eagle','Wolf','Bear','Lynx','Hawk','Deer','Raven']
    return adj[Math.floor(Math.random() * adj.length)] +
           noun[Math.floor(Math.random() * noun.length)] +
           (Math.floor(Math.random() * 99) + 1)
  }

  // ── Time ago ──────────────────────────────────────────
  function _timeAgo(ts) {
    var diff = Date.now() - new Date(ts).getTime()
    var m = Math.floor(diff / 60000)
    var h = Math.floor(diff / 3600000)
    var d = Math.floor(diff / 86400000)
    if (m < 1)  return 'just now'
    if (m < 60) return m + 'm ago'
    if (h < 24) return h + 'h ago'
    if (d < 30) return d + 'd ago'
    return new Date(ts).toLocaleDateString()
  }

  // ── Escape HTML ───────────────────────────────────────
  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>')
  }

  // ── Post comment ──────────────────────────────────────
  async function post(itemId, text) {
    if (!_db()) return { success: false, error: 'Not ready.' }

    var check = _moderate(text)
    if (!check.ok) return { success: false, error: check.reason }

    var user = await NovaDB.getCurrentUser()

    if (!user) {
      var limitCheck = await NovaAuth.checkAnonLimit('comments')
      if (!limitCheck.allowed) return { success: false, error: limitCheck.reason, showUpgrade: true }

      var session = await NovaAuth.getOrCreateAnonSession()
      if (!session) return { success: false, error: 'Could not create session.' }

      try {
        var { data, error } = await _db().from('comments').insert({
          item_id: itemId, anon_id: session.id,
          author_name: _randomName(), content: text.trim()
        }).select().single()

        if (error) return { success: false, error: error.message }

        // Update daily count
        var today  = new Date().toISOString().split('T')[0]
        var isToday = session.last_comment_date === today
        _db().from('anon_sessions').update({
          comments_today: isToday ? (session.comments_today || 0) + 1 : 1,
          last_comment_date: today
        }).eq('id', session.id).then(function(){}).catch(function(){})

        return { success: true, comment: data }
      } catch (e) { return { success: false, error: e.message } }
    }

    // Registered user
    try {
      var profile    = await NovaDB.getUserProfile(user.id)
      var authorName = (profile && profile.display_name) || user.email.split('@')[0]
      var { data: cdata, error: cerr } = await _db().from('comments').insert({
        item_id: itemId, user_id: user.id,
        author_name: authorName, content: text.trim()
      }).select().single()
      if (cerr) return { success: false, error: cerr.message }
      return { success: true, comment: cdata }
    } catch (e) { return { success: false, error: e.message } }
  }

  // ── Get comments ──────────────────────────────────────
  async function get(itemId) {
    if (!_db() || !itemId) return []
    try {
      var { data } = await _db().from('comments').select('*')
        .eq('item_id', itemId).eq('is_flagged', false)
        .order('created_at', { ascending: false })
      return data || []
    } catch { return [] }
  }

  // ── Render single comment ─────────────────────────────
  function _renderComment(c) {
    var initial = (c.author_name || 'A').charAt(0).toUpperCase()
    return '<div class="comment-item" id="c-' + c.id + '">' +
      '<div class="comment-author-row">' +
        '<div class="comment-avatar">' + initial + '</div>' +
        '<div>' +
          '<div class="comment-name">' + _esc(c.author_name) + '</div>' +
          '<div class="comment-date">' + _timeAgo(c.created_at) + '</div>' +
        '</div>' +
        '<button class="comment-like-btn" onclick="NovaComments.handleLike(\'' + c.id + '\',this)">' +
          '♡ ' + (c.likes || 0) +
        '</button>' +
      '</div>' +
      '<div class="comment-text">' + _esc(c.content) + '</div>' +
    '</div>'
  }

  // ── Handle like click ─────────────────────────────────
  async function handleLike(commentId, btn) {
    if (!_db()) return
    var user   = await NovaDB.getCurrentUser()
    var anonId = null
    try { anonId = localStorage.getItem('nova_anon_id') } catch {}

    if (!user && !anonId) {
      var s = await NovaAuth.getOrCreateAnonSession()
      if (s) { try { anonId = s.id; localStorage.setItem('nova_anon_id', s.id) } catch {} }
    }

    var record = user
      ? { comment_id: commentId, user_id: user.id }
      : { comment_id: commentId, anon_id: anonId }

    try {
      var { error } = await _db().from('comment_likes').insert(record)
      var n = parseInt((btn.textContent || '0').replace(/\D/g, '')) || 0

      if (error && error.code === '23505') {
        // Already liked — unlike
        if (user) await _db().from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id)
        else if (anonId) await _db().from('comment_likes').delete().eq('comment_id', commentId).eq('anon_id', anonId)
        btn.textContent = '♡ ' + Math.max(0, n - 1)
        btn.style.color = ''
      } else {
        btn.textContent = '♥ ' + (n + 1)
        btn.style.color = 'var(--gold)'
      }
    } catch {}
  }

  // ── Render full section ───────────────────────────────
  async function render(itemId, containerId) {
    var container = document.getElementById(containerId)
    if (!container) return

    container.innerHTML =
      '<div class="comments-wrap">' +
        '<div class="comments-title" id="ctitle-' + itemId + '">💬 Comments</div>' +
        '<div class="comment-form">' +
          '<textarea class="comment-textarea" id="cinput-' + itemId + '" ' +
            'placeholder="Share your thoughts (anonymous — no account needed)…" maxlength="1200" rows="3"></textarea>' +
          '<div class="comment-form-foot">' +
            '<span class="comment-anon-note">🔒 Anonymous · No account needed</span>' +
            '<button class="btn-gold" style="font-size:13px;padding:10px 22px" ' +
              'onclick="NovaComments.handleSubmit(\'' + itemId + '\')">Post</button>' +
          '</div>' +
          '<div class="comment-error hidden" id="cerr-' + itemId + '"></div>' +
        '</div>' +
        '<div class="comments-list" id="clist-' + itemId + '">' +
          '<div style="text-align:center;padding:32px;color:var(--t3);font-size:14px">Loading…</div>' +
        '</div>' +
      '</div>'

    var comments = await get(itemId)
    var listEl   = document.getElementById('clist-' + itemId)
    var titleEl  = document.getElementById('ctitle-' + itemId)
    if (!listEl) return

    if (comments.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--t3);font-size:14px">Be the first to comment!</div>'
    } else {
      if (titleEl) titleEl.textContent = '💬 Comments (' + comments.length + ')'
      listEl.innerHTML = comments.map(_renderComment).join('')
    }
  }

  // ── Handle submit ─────────────────────────────────────
  async function handleSubmit(itemId) {
    var input   = document.getElementById('cinput-' + itemId)
    var errEl   = document.getElementById('cerr-' + itemId)
    var listEl  = document.getElementById('clist-' + itemId)
    var titleEl = document.getElementById('ctitle-' + itemId)

    if (!input) return
    var text = input.value.trim()
    if (!text) return

    var form = input.closest('.comment-form')
    var btn  = form && form.querySelector('.btn-gold')
    if (btn) { btn.disabled = true; btn.textContent = '…' }

    var result = await post(itemId, text)

    if (btn) { btn.disabled = false; btn.textContent = 'Post' }

    if (!result.success) {
      if (errEl) {
        errEl.textContent = result.error
        errEl.classList.remove('hidden')
      }
      if (result.showUpgrade && window.NovaFavorites) {
        NovaFavorites.showUpgradePrompt(result.error)
      }
      return
    }

    if (errEl) errEl.classList.add('hidden')
    input.value = ''

    if (listEl) {
      var empty = listEl.querySelector('[style*="Be the first"]')
      if (empty) empty.remove()
      var div = document.createElement('div')
      div.innerHTML = _renderComment(result.comment)
      listEl.prepend(div.firstChild)
      if (titleEl) {
        var n = parseInt((titleEl.textContent || '0').match(/\d+/) || ['0']) || 0
        titleEl.textContent = '💬 Comments (' + (n + 1) + ')'
      }
    }
  }

  return { post, get, render, handleSubmit, handleLike }

})()

window.NovaComments = NovaComments
