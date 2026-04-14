import '../styles/variables.css';
import '../styles/style.css';
import '../styles/components.css';
import '../styles/ai-interface.css';
import { useEffect } from 'react';
import { ToastProvider } from '../components/Toast';

export default function App({ Component, pageProps }) {
  // Theme initialization — runs before paint equivalent
  useEffect(() => {
    const SUN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    const MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    const html = document.documentElement;

    function setIcon(theme) {
      const el = document.getElementById('theme-icon');
      if (el) el.innerHTML = theme === 'dark' ? SUN : MOON;
    }

    function apply(theme) {
      html.setAttribute('data-theme', theme);
      try { localStorage.setItem('nh-theme', theme); } catch {}
      setIcon(theme);
    }

    const saved = (() => { try { return localStorage.getItem('nh-theme'); } catch { return null; } })();
    const pref = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    apply(saved || pref);

    const btn = document.getElementById('theme-btn');
    const handler = () => apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    if (btn) btn.addEventListener('click', handler);

    // Card glow effect
    if (window.matchMedia('(hover:hover)').matches) {
      document.addEventListener('mousemove', (e) => {
        const card = e.target?.closest?.('.card');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    }

    // Ripple effect
    document.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('.btn-primary,.btn-gold');
      if (!btn) return;
      const r = document.createElement('span');
      const br = btn.getBoundingClientRect();
      const s = Math.max(br.width, br.height) * 2;
      r.className = 'ripple';
      r.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - br.left - s / 2}px;top:${e.clientY - br.top - s / 2}px`;
      btn.appendChild(r);
      setTimeout(() => r.remove(), 700);
    });

    return () => {
      if (btn) btn.removeEventListener('click', handler);
    };
  }, []);

  return (
    <ToastProvider>
      <Component {...pageProps} />
    </ToastProvider>
  );
}
