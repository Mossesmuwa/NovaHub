// js/comments.js — NovaHub Anonymous Comment System

const Comments = (() => {
  // Word list for basic spam/abuse moderation
  const BLOCKED_WORDS = ['spam','buy now','click here','free money','porn','xxx','hack','scam','phishing','casino','drugs','nigger','fuck','shit','bitch','asshole','bastard','cunt','dick','whore','slut'];

  const STORAGE_KEY = 'novahub_comments';

  // Load all comments from localStorage (merge with seed data)
  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  // Save all comments to localStorage
  function saveAll(comments) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(comments)); } catch {}
  }

  // Get comments for a specific target (item or post id)
  function get(targetId) {
    const all = loadAll();
    // Merge with any pre-seeded data from NOVAHUB_DATA
    const seed = (typeof NOVAHUB_DATA !== 'undefined' && NOVAHUB_DATA.comments && NOVAHUB_DATA.comments[targetId]) || [];
    const stored = all[targetId] || [];
    // Combine seed + stored, deduplicate by id
    const map = {};
    [...seed, ...stored].forEach(c => { map[c.id] = c; });
    return Object.values(map).sort((a, b) => b.timestamp - a.timestamp);
  }

  // Moderate text
  function moderate(text) {
    if (!text || text.trim().length < 3) return { ok: false, reason: 'Comment is too short.' };
    if (text.trim().length > 1200) return { ok: false, reason: 'Comment is too long (max 1200 chars).' };
    const lower = text.toLowerCase();
    for (const word of BLOCKED_WORDS) {
      if (lower.includes(word)) return { ok: false, reason: 'Comment contains inappropriate content.' };
    }
    // Basic URL spam detection
    const urlCount = (text.match(/https?:\/\//g) || []).length;
    if (urlCount > 2) return { ok: false, reason: 'Too many links in comment.' };
    return { ok: true };
  }

  // Generate a random anonymous name
  function randomName() {
    const adj = ['Quick','Bold','Curious','Bright','Sharp','Clever','Wild','Calm','Brave','Witty'];
    const noun = ['Fox','Owl','Panda','Lion','Eagle','Parrot','Wolf','Bear','Lynx','Hawk'];
    const num = Math.floor(Math.random() * 99) + 1;
    return adj[Math.floor(Math.random() * adj.length)] + noun[Math.floor(Math.random() * noun.length)] + num;
  }

  // Post a new comment
  function post(targetId, text) {
    const check = moderate(text);
    if (!check.ok) return { success: false, error: check.reason };
    const all = loadAll();
    if (!all[targetId]) all[targetId] = [];
    const comment = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      author: randomName(),
      text: text.trim(),
      timestamp: Date.now(),
      likes: 0,
      likedBy: []
    };
    all[targetId].unshift(comment);
    saveAll(all);
    return { success: true, comment };
  }

  // Like a comment
  function like(targetId, commentId) {
    const fingerprint = 'fp_' + (navigator.userAgent + screen.width).length; // simple fingerprint
    const all = loadAll();
    const comments = all[targetId] || [];
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return false;
    if (!comment.likedBy) comment.likedBy = [];
    if (comment.likedBy.includes(fingerprint)) {
      comment.likes = Math.max(0, (comment.likes || 0) - 1);
      comment.likedBy = comment.likedBy.filter(f => f !== fingerprint);
    } else {
      comment.likes = (comment.likes || 0) + 1;
      comment.likedBy.push(fingerprint);
    }
    all[targetId] = comments;
    saveAll(all);
    return true;
  }

  // Format relative time
  function timeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'just now';
    if (m < 60) return m + 'm ago';
    if (h < 24) return h + 'h ago';
    if (d < 30) return d + 'd ago';
    return new Date(timestamp).toLocaleDateString();
  }

  // Render comment form + list into a container element
  function render(targetId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const items = get(targetId);

    container.innerHTML =
      '<div class="comments-section">' +
        '<h3 class="comments-title">' +
          '<span>💬</span> ' + (items.length > 0 ? items.length + ' Comments' : 'Comments') +
        '</h3>' +
        '<div class="comment-form" id="cform_' + targetId + '">' +
          '<textarea class="comment-input" id="cinput_' + targetId + '" placeholder="Share your thoughts anonymously..." maxlength="1200" rows="3"></textarea>' +
          '<div class="comment-form-footer">' +
            '<span class="comment-anon-note">🔒 Anonymous · No account needed</span>' +
            '<button class="btn-primary comment-submit" onclick="Comments.submitUI(\'' + targetId + '\')" style="padding:8px 20px;font-size:14px;">Post Comment</button>' +
          '</div>' +
          '<div class="comment-error hidden" id="cerr_' + targetId + '"></div>' +
        '</div>' +
        '<div class="comments-list" id="clist_' + targetId + '">' +
          (items.length === 0
            ? '<div class="comments-empty">Be the first to comment!</div>'
            : items.map(c => renderComment(c, targetId)).join('')
          ) +
        '</div>' +
      '</div>';
  }

  function renderComment(c, targetId) {
    return '<div class="comment-card" id="cc_' + c.id + '">' +
      '<div class="comment-header">' +
        '<div class="comment-avatar">' + c.author.charAt(0) + '</div>' +
        '<div class="comment-meta">' +
          '<span class="comment-author">' + escapeHtml(c.author) + '</span>' +
          '<span class="comment-time">' + timeAgo(c.timestamp) + '</span>' +
        '</div>' +
        '<button class="comment-like" onclick="Comments.likeUI(\'' + targetId + "','" + c.id + '\')">' +
          '♡ ' + (c.likes || 0) +
        '</button>' +
      '</div>' +
      '<div class="comment-body">' + escapeHtml(c.text) + '</div>' +
    '</div>';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  }

  // UI helpers
  function submitUI(targetId) {
    const input = document.getElementById('cinput_' + targetId);
    const errEl = document.getElementById('cerr_' + targetId);
    if (!input) return;
    const result = post(targetId, input.value);
    if (!result.success) {
      errEl.textContent = result.error;
      errEl.classList.remove('hidden');
      return;
    }
    errEl.classList.add('hidden');
    input.value = '';
    // Prepend the new comment to the list
    const list = document.getElementById('clist_' + targetId);
    if (list) {
      const emptyEl = list.querySelector('.comments-empty');
      if (emptyEl) emptyEl.remove();
      const div = document.createElement('div');
      div.innerHTML = renderComment(result.comment, targetId);
      list.prepend(div.firstChild);
      // Update count
      const title = document.querySelector('.comments-title');
      if (title) {
        const all = get(targetId);
        title.innerHTML = '<span>💬</span> ' + all.length + ' Comments';
      }
    }
  }

  function likeUI(targetId, commentId) {
    like(targetId, commentId);
    // Re-fetch and re-render just that comment's like count
    const all = loadAll();
    const comments = all[targetId] || [];
    const c  = comments.find(x => x.id === commentId);
    if (c) {
      const likeBtn = document.querySelector('#cc_' + commentId + ' .comment-like');
      if (likeBtn) likeBtn.textContent = '♡ ' + (c.likes || 0);
    }
  }

  return { render, post, like, submitUI, likeUI, get };
})();
