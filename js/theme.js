// js/theme.js — NovaHub Theme Manager
// Dark / light mode with localStorage + system preference

(function () {

  const SUN  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
  const MOON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`

  const html = document.documentElement

  function getIcon() {
    return document.getElementById('theme-icon')
  }

  function apply(theme) {
    html.setAttribute('data-theme', theme)
    localStorage.setItem('nh-theme', theme)

    const icon = getIcon()
    if (icon) {
      icon.style.transition = 'opacity .15s ease, transform .15s ease'
      icon.style.opacity = '0'
      icon.style.transform = 'scale(.7) rotate(20deg)'

      setTimeout(() => {
        icon.innerHTML = theme === 'dark' ? SUN : MOON
        icon.style.opacity = '1'
        icon.style.transform = 'none'
      }, 80)
    }
  }

  function toggle() {
    apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')
  }

  // Apply immediately to prevent flash
  const saved    = localStorage.getItem('nh-theme')
  const prefDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  apply(saved || (prefDark ? 'dark' : 'light'))

  // Bind button after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-btn')
    if (btn) btn.addEventListener('click', toggle)

    // Re-render icon with correct state
    const icon = getIcon()
    if (icon) {
      icon.innerHTML = html.getAttribute('data-theme') === 'dark' ? SUN : MOON
    }

    // Follow system preference if user hasn't set one
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('nh-theme')) {
        apply(e.matches ? 'dark' : 'light')
      }
    })
  })

  window.NovaTheme = { apply, toggle, get: () => html.getAttribute('data-theme') }

})()
