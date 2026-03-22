// js/comments.js — NovaHub Comments System
// Real comments stored in Supabase
// Anonymous users limited to 5 comments per day

const NovaComments = (() => {

  const BLOCKED_WORDS = [
    'spam', 'buy now', 'click here', 'free money',
    'porn', 'xxx', 'hack', 'scam', 'phishing', 'casino'
  ]

  // ── MODERATION ─────────────────────────────────────────
  function moderate(text) {
    if (!text || text.trim().length < 3)
      return { ok: false, reason: 'Comment is too short.' }

    if (text.trim().length > 1200)
      return { ok: false, reason: 'Comment is too long (max 1200 characters).' }

    const lower = text.toLowerCase()
    for (const word of BLOCKED_WORDS) {
      if (lower.includes(word))
        return { ok: false, reason: 'Comment contains inappropriate content.' }
    }

    const urlCount = (text.match(/https?:\/\//g) || []).length
    if (urlCount > 2)
      return { ok: false, reason: 'Too many links in comment.' }

    return { ok: true }
  }

  // ── ESCAPE HTML ────────────────────────────────────────
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>')
  }

  // ── FORMAT TIME ────────────────────────────────────────
  function timeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (m < 1)  return 'just now'
    if (m < 60) return m + 'm ago'
    if (h < 24) return h + 'h ago'
    if (d < 30) return d + 'd ago'
    return new Date(timestamp).toLocaleDateString()
  }

  // ── RANDOM ANON NAME ───────────────────────────────────
  function randomName() {
    const adj  = ['Quick','Bold','Curious','Bright','Sharp','Clever','Wild','Calm','Brave','Witty']
    const noun = ['Fox','Owl','Panda','Lion','Eagle','Parrot','Wolf','Bear','Lynx','Hawk']
    const num  = Math.floor(Math.random() * 99) + 1
    return adj[Math.floor(Math.random() * adj.length)] +
           noun[Math.floor(Math.random() * noun.length)] + num
  }

  // ── POST COMMENT ───────────────────────────────────────
  async function post(itemId, text) {
    const check = moderate(text)
    if (!check.ok) return { success: false, error: check.reason }

    const user = await NovaDB.getCurrentUser()

    if (!user) {
      // Check anonymous comment limit
      const limitCheck = await NovaAuth.checkAnonLimit('comments')
      if (!limitCheck.allowed) return { success: false, error: limitCheck.reason, showUpgrade: true }

      const anonSession = await NovaAuth.getOrCreateAnonSession()
      if (!anonSession) return { success: false, error: 'Could not create session.' }

      const authorName = randomName()

      const { data, error } = await NovaDB.client
        .from('comments')
        .insert({
          item_id:     itemId,
          anon_id:     anonSession.id,
          author_name: authorName,
          content:     text.trim()
        })
        .select()
        .single()

      if (error) return { success: false, error: error.message }

      // Update anon comment count
      const today = new Date().toISOString().split('T')[0]
      const isToday = anonSession.last_comment_date === today
      await NovaDB.client
        .from('anon_sessions')
        .update({
          comments_today: isToday ? anonSession.comments_today + 1 : 1,
          last_comment_date: today
        })
        .eq('id', anonSession.id)

      return { success: true, comment: data }
    }

    // Registered user
    const profile = await NovaDB.getUserProfile(user.id)
    const authorName = profile?.display_name || user.email.split('@')[0]

    const { data, error } = await NovaDB.client
      .from('comments')
      .insert({
        item_id:     itemId,
        user_id:     user.id,
        author_name: authorName,
        content:     text.trim()
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, comment: data }
  }

  // ── GET COMMENTS ───────────────────────────────────────
  async function get(itemId) {
    const { data, error } = await NovaDB.client
      .from('comments')
      .select('*')
      .eq('item_id', itemId)
      .eq('is_flagged', false)
      .order('created_at', { ascending: false })

    if (error) return []
    return data
  }

  // ── LIKE COMMENT ───────────────────────────────────────
  async function like(commentId) {
    const user = await NovaDB.getCurrentUser()
    const anonId = localStorage.getItem('nova_anon_id')

    if (!user && !anonId) {
      const session = await NovaAuth.getOrCreateAnonSession()
      if (!session) return false
    }

    const record = user
      ? { comment_id: commentId, user_id: user.id }
      : { comment_id: commentId, anon_id: anonId }

    const { error } = await NovaDB.client
      .from('comment_likes')
      .insert(record)

    if (error && error.code === '23505') {
      // Already liked — unlike it
      const query = user
        ? NovaDB.client.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id)
        : NovaDB.client.from('comment_likes').delete().eq('comment_id', commentId).eq('anon_id', anonId)

      await query
      return 'unliked'
    }

    return 'liked'
  }

  // ── FLAG COMMENT ───────────────────────────────────────
  async function flag(commentId) {
    await NovaDB.client
      .from('comments')
      .update({ is_flagged: true })
      .eq('id', commentId)
  }

  // ── RENDER SINGLE COMMENT ──────────────────────────────
  function renderComment(c) {
    const initial = (c.author_name || 'A').charAt(0).toUpperCase()
    return `
      <div class="comment-item" id="comment-${c.id}">
        <div class="comment-author-row">
          <div class="comment-avatar">${initial}</div>
          <div>
            <div class="comment-name">${escapeHtml(c.author_name)}</div>
            <div class="comment-date">${timeAgo(c.created_at)}</div>
          </div>
          <button class="comment-like" onclick="NovaComments.handleLike('${c.id}', this)">
            ♡ ${c.likes || 0}
          </button>
        </div>
        <div class="comment-text">${escapeHtml(c.content)}</div>
      </div>`
  }

  // ── HANDLE LIKE CLICK ──────────────────────────────────
  async function handleLike(commentId, buttonEl) {
    const result = await like(commentId)
    if (!result) return

    const currentText = buttonEl.textContent.trim()
    const currentCount = parseInt(currentText.replace(/[^0-9]/g, '')) || 0

    if (result === 'liked') {
      buttonEl.textContent = '♥ ' + (currentCount + 1)
      buttonEl.style.color = 'var(--gold)'
    } else {
      buttonEl.textContent = '♡ ' + Math.max(0, currentCount - 1)
      buttonEl.style.color = ''
    }
  }

  // ── RENDER FULL COMMENTS SECTION ──────────────────────
  async function render(itemId, containerId) {
    const container = document.getElementById(containerId)
    if (!container) return

    container.innerHTML = `
      <div class="comments-section">
        <div class="comments-header">💬 Discussion</div>

        <div class="comment-form">
          <textarea
            id="nova-comment-input-${itemId}"
            class="comment-textarea"
            placeholder="Share your thoughts anonymously…"
            maxlength="1200"
            rows="3"></textarea>
          <div class="comment-form-actions">
            <span class="comment-anon-note">🔒 Anonymous · No account needed</span>
            <button class="btn-gold"
              style="font-size:13px;padding:10px 22px"
              onclick="NovaComments.handleSubmit('${itemId}')">
              Post Comment
            </button>
          </div>
          <div class="comment-error hidden" id="nova-comment-error-${itemId}"></div>
        </div>

        <div class="comments-list" id="nova-comments-list-${itemId}">
          <div style="text-align:center;padding:32px;color:var(--t3)">
            Loading comments…
          </div>
        </div>
      </div>`

    // Load comments
    const comments = await get(itemId)
    const listEl = document.getElementById(`nova-comments-list-${itemId}`)

    if (!listEl) return

    if (comments.length === 0) {
      listEl.innerHTML = `
        <div class="comments-empty">
          Be the first to comment!
        </div>`
    } else {
      // Update header count
      const header = container.querySelector('.comments-header')
      if (header) header.innerHTML = `💬 Discussion (${comments.length})`

      listEl.innerHTML = comments.map(renderComment).join('')
    }
  }

  // ── HANDLE SUBMIT ──────────────────────────────────────
  async function handleSubmit(itemId) {
    const input  = document.getElementById(`nova-comment-input-${itemId}`)
    const errEl  = document.getElementById(`nova-comment-error-${itemId}`)
    const listEl = document.getElementById(`nova-comments-list-${itemId}`)

    if (!input) return

    const text = input.value.trim()
    if (!text) return

    // Show loading
    const btn = input.closest('.comment-form')?.querySelector('button')
    if (btn) { btn.disabled = true; btn.textContent = 'Posting…' }

    const result = await post(itemId, text)

    if (btn) { btn.disabled = false; btn.textContent = 'Post Comment' }

    if (!result.success) {
      if (errEl) {
        errEl.textContent = result.error
        errEl.classList.remove('hidden')
      }
      if (result.showUpgrade) {
        NovaFavorites.showUpgradePrompt
          ? NovaFavorites.showUpgradePrompt(result.error)
          : NovaUI.toast(result.error, 'warning')
      }
      return
    }

    if (errEl) errEl.classList.add('hidden')
    input.value = ''

    // Add comment to top of list
    if (listEl) {
      const emptyEl = listEl.querySelector('.comments-empty')
      if (emptyEl) emptyEl.remove()

      const div = document.createElement('div')
      div.innerHTML = renderComment(result.comment)
      listEl.prepend(div.firstChild)

      // Update count
      const header = listEl.closest('.comments-section')?.querySelector('.comments-header')
      if (header) {
        const current = parseInt(header.textContent.match(/\d+/)?.[0] || '0')
        header.innerHTML = `💬 Discussion (${current + 1})`
      }
    }
  }

  return {
    post,
    get,
    like,
    flag,
    render,
    handleSubmit,
    handleLike,
  }

})()

window.NovaComments = NovaComments
