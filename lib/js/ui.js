// js/ui.js — NovaHub UI Utilities
// Toast notifications, modals, loading states, shared helpers

const NovaUI = (() => {

  // ── TOAST NOTIFICATIONS ────────────────────────────────
  let toastContainer = null

  function getToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div')
      toastContainer.id = 'nova-toasts'
      toastContainer.style.cssText = `
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `
      document.body.appendChild(toastContainer)
    }
    return toastContainer
  }

  function toast(message, type = 'info', duration = 3000) {
    const container = getToastContainer()

    const el = document.createElement('div')
    el.style.cssText = `
      background: var(--bg2);
      border: 1px solid var(--border2);
      border-radius: 12px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      color: var(--t1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: all;
      animation: toastIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards;
      max-width: 320px;
      word-break: break-word;
    `

    const icons = {
      success: '✦',
      error:   '✕',
      warning: '⚠',
      info:    '◆',
    }

    const colors = {
      success: 'var(--gold)',
      error:   '#FF453A',
      warning: '#FF9F0A',
      info:    'var(--t2)',
    }

    el.innerHTML = `
      <span style="color:${colors[type]};font-size:16px;flex-shrink:0">${icons[type]}</span>
      <span>${message}</span>`

    container.appendChild(el)

    setTimeout(() => {
      el.style.animation = 'toastOut 0.3s ease forwards'
      setTimeout(() => el.remove(), 300)
    }, duration)
  }

  // ── LOADING SPINNER ────────────────────────────────────
  function showLoading(containerId, message = 'Loading…') {
    const el = document.getElementById(containerId)
    if (!el) return
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;
        justify-content:center;padding:80px 24px;gap:16px;color:var(--t3)">
        <div style="width:36px;height:36px;border:2px solid var(--border2);
          border-top-color:var(--gold);border-radius:50%;animation:spin 1s linear infinite"></div>
        <span style="font-size:14px;font-weight:500">${message}</span>
      </div>`
  }

  // ── EMPTY STATE ────────────────────────────────────────
  function showEmpty(containerId, icon = '🔍', title = 'Nothing here yet', subtitle = '') {
    const el = document.getElementById(containerId)
    if (!el) return
    el.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">${icon}</span>
        <h3 style="font-size:20px;font-weight:800;margin-bottom:8px">${title}</h3>
        ${subtitle ? `<p style="font-size:14px;color:var(--t2)">${subtitle}</p>` : ''}
      </div>`
  }

  // ── ERROR STATE ────────────────────────────────────────
  function showError(containerId, message = 'Something went wrong. Please try again.') {
    const el = document.getElementById(containerId)
    if (!el) return
    el.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">⚠</span>
        <h3 style="font-size:18px;font-weight:700;margin-bottom:8px">Error</h3>
        <p style="font-size:14px;color:var(--t2)">${message}</p>
        <button class="btn-secondary" style="margin-top:16px" onclick="location.reload()">
          Try Again
        </button>
      </div>`
  }

  // ── CARD RENDERERS ─────────────────────────────────────
  function renderPosterCard(item) {
    const href  = `/item.html?slug=${encodeURIComponent(item.slug)}`
    const sub   = item.director || item.author || item.developer || item.genre || ''
    const badge = item.trending
      ? `<span class="badge badge-trending">🔥 Hot</span>`
      : item.daily_pick
        ? `<span class="badge badge-pick">⭐ Pick</span>`
        : ''

    return `
      <a href="${href}" class="card-poster">
        <div class="bg-zoom" style="background-image:url('${item.image || ''}')"></div>
        ${badge}
        <button class="fav-btn-overlay"
          data-favorite-btn
          data-item-id="${item.id}"
          onclick="event.preventDefault();NovaFavorites.toggle('${item.id}',this)"
          title="Save to favorites">
          ♡ Save
        </button>
        <div class="card-poster-content">
          <div class="card-poster-title">${item.name}</div>
          ${sub ? `<div class="card-poster-sub">${sub}</div>` : ''}
          ${item.rating ? `<div class="card-poster-rating">★ ${item.rating}</div>` : ''}
        </div>
      </a>`
  }

  function renderToolCard(item) {
    const href     = `/item.html?slug=${encodeURIComponent(item.slug)}`
    const isFree   = (item.pricing || '').toLowerCase().includes('free')
    const priceTag = item.pricing
      ? `<span class="${isFree ? 'tag-free' : 'tag-paid'}">${item.pricing}</span>`
      : ''

    return `
      <div class="card" onclick="location.href='${href}'">
        <div class="card-icon">${(item.name || '?').charAt(0)}</div>
        <div class="card-title">${item.name}</div>
        ${priceTag ? `<div style="margin-bottom:10px">${priceTag}</div>` : ''}
        <p class="card-desc">${item.short_desc || ''}</p>
        <div class="card-actions">
          <a href="${href}"
            class="btn-secondary"
            style="font-size:12px;padding:7px 14px"
            onclick="event.stopPropagation()">Details</a>
          <a href="${item.affiliate_link || href}"
            target="_blank"
            rel="noopener"
            class="btn-primary"
            style="font-size:12px;padding:7px 14px"
            onclick="event.stopPropagation()">Get →</a>
        </div>
      </div>`
  }

  function renderVideoCard(item) {
    const href = `/item.html?slug=${encodeURIComponent(item.slug)}`
    return `
      <a href="${href}" class="card-video">
        <div class="card-video-thumb"
          style="background-image:url('${item.image || ''}')">
          <div class="card-video-overlay">
            <div class="play-btn">▶</div>
          </div>
        </div>
        <div class="card-video-body">
          <div class="card-video-title">${item.name}</div>
          <div class="card-video-meta">${item.platforms || ''}</div>
        </div>
      </a>`
  }

  function renderCard(item) {
    if (!item) return ''
    if (['movie', 'book', 'game'].includes(item.type)) return renderPosterCard(item)
    if (item.type === 'video') return renderVideoCard(item)
    return renderToolCard(item)
  }

  // ── RENDER GRID ────────────────────────────────────────
  function renderGrid(items, containerId, gridClass = 'grid-4') {
    const el = document.getElementById(containerId)
    if (!el) return

    if (!items || items.length === 0) {
      showEmpty(containerId)
      return
    }

    el.innerHTML = `
      <div class="${gridClass} stagger">
        ${items.map(item => `<div class="reveal-scale">${renderCard(item)}</div>`).join('')}
      </div>`

    // Init favorite buttons
    setTimeout(() => NovaFavorites.initAll(), 100)
  }

  // ── RENDER CAROUSEL ────────────────────────────────────
  function renderCarousel(items, containerId, width = '160px') {
    const el = document.getElementById(containerId)
    if (!el) return

    if (!items || items.length === 0) return

    el.innerHTML = items.map(item =>
      `<div class="carousel-item" style="width:${width}">
        ${renderCard(item)}
      </div>`
    ).join('')

    setTimeout(() => NovaFavorites.initAll(), 100)
  }

  // ── INIT SCROLL REVEAL ─────────────────────────────────
  function initReveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        e.target.classList.add('visible')
        if (e.target.classList.contains('stagger')) {
          ;[...e.target.children].forEach((c, i) => {
            c.style.transitionDelay = (i * 0.065) + 's'
            c.classList.add('visible')
          })
        }
        io.unobserve(e.target)
      })
    }, { threshold: 0.06, rootMargin: '0px 0px -36px 0px' })

    document.querySelectorAll('.reveal,.reveal-scale,.stagger').forEach(el => io.observe(el))
  }

  // ── INIT CARD MOUSE GLOW ───────────────────────────────
  function initCardGlow() {
    document.addEventListener('mousemove', e => {
      const card = e.target.closest('.card')
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px')
      card.style.setProperty('--my', (e.clientY - r.top) + 'px')
    })
  }

  // ── INIT RIPPLE ────────────────────────────────────────
  function initRipple() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-primary,.btn-gold')
      if (!btn) return
      const r = document.createElement('span')
      r.className = 'ripple'
      const br = btn.getBoundingClientRect()
      const s  = Math.max(br.width, br.height) * 2
      r.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - br.left - s / 2}px;top:${e.clientY - br.top - s / 2}px`
      btn.appendChild(r)
      setTimeout(() => r.remove(), 700)
    })
  }

  // ── INIT EVERYTHING ────────────────────────────────────
  function init() {
    initReveal()
    initCardGlow()
    initRipple()

    // Add toast keyframes if not already added
    if (!document.getElementById('nova-toast-styles')) {
      const style = document.createElement('style')
      style.id = 'nova-toast-styles'
      style.textContent = `
        @keyframes toastIn  { from { opacity:0; transform:translateY(16px) scale(.94); } to { opacity:1; transform:none; } }
        @keyframes toastOut { from { opacity:1; transform:none; } to { opacity:0; transform:translateY(8px); } }
        .fav-btn-overlay {
          position:absolute;top:10px;right:10px;z-index:10;
          background:rgba(0,0,0,.6);backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,.15);border-radius:99px;
          padding:5px 12px;font-size:11px;font-weight:700;color:#fff;
          cursor:pointer;transition:all .2s ease;opacity:0;
        }
        .card-poster:hover .fav-btn-overlay { opacity:1; }
        .fav-btn-overlay.favorited { background:var(--gold);color:#09090C;border-color:var(--gold); }
        .nova-modal-overlay {
          position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);
          z-index:9998;display:flex;align-items:center;justify-content:center;padding:24px;
        }
        .nova-modal {
          background:var(--bg2);border:1px solid var(--border2);border-radius:24px;
          padding:40px;max-width:440px;width:100%;text-align:center;
          animation:toastIn .3s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .nova-modal-icon { font-size:48px;margin-bottom:16px; }
        .nova-modal h3 { font-size:22px;font-weight:900;margin-bottom:12px;letter-spacing:-.025em; }
        .nova-modal p { font-size:15px;color:var(--t2);line-height:1.6;margin-bottom:28px; }
        .nova-modal-actions { display:flex;gap:12px;justify-content:center;flex-wrap:wrap; }
      `
      document.head.appendChild(style)
    }
  }

  return {
    toast,
    showLoading,
    showEmpty,
    showError,
    renderCard,
    renderPosterCard,
    renderToolCard,
    renderVideoCard,
    renderGrid,
    renderCarousel,
    initReveal,
    initCardGlow,
    initRipple,
    init,
  }

})()

window.NovaUI = NovaUI

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => NovaUI.init())
