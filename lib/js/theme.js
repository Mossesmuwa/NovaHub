// js/theme.js — NovaHub Theme
// Runs immediately — prevents white flash on dark mode
;(function () {
  const SUN  = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
  const MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
  const html = document.documentElement

  function setIcon(theme) {
    const el = document.getElementById('theme-icon')
    if (el) el.innerHTML = theme === 'dark' ? SUN : MOON
  }

  function apply(theme) {
    html.setAttribute('data-theme', theme)
    try { localStorage.setItem('nh-theme', theme) } catch {}
    setIcon(theme)
  }

  // Apply immediately (before paint)
  const saved = (() => { try { return localStorage.getItem('nh-theme') } catch { return null } })()
  const pref  = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  apply(saved || pref)

  // Wire up button after DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    setIcon(html.getAttribute('data-theme'))

    var btn = document.getElementById('theme-btn')
    if (btn) btn.addEventListener('click', function () {
      apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')
    })

    // Follow system if user hasn't manually set
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!saved) apply(e.matches ? 'dark' : 'light')
      })
    }
  })

  window.NovaTheme = {
    get: function () { return html.getAttribute('data-theme') },
    set: apply,
    toggle: function () { apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark') }
  }
})()
