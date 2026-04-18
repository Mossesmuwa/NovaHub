// pages/404.js
import { useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Link from 'next/link';

// ─── Constellation canvas ─────────────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, stars = [], mouse = { x: -999, y: -999 }, raf;

    const resize = () => {
      width  = canvas.width  = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      stars = Array.from({ length: 80 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.7 + 0.3,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw stars
      for (const s of stars) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${s.alpha * 0.6})`;
        ctx.fill();
      }

      // Draw connections near mouse
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(201,168,76,${0.08 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Mouse attraction
        const mdx = mouse.x - stars[i].x;
        const mdy = mouse.y - stars[i].y;
        const md  = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 150) {
          const strength = (150 - md) / 150 * 0.003;
          stars[i].vx += mdx * strength;
          stars[i].vy += mdy * strength;
          // Draw line to mouse
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(201,168,76,${0.15 * (1 - md / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Speed limit
        const speed = Math.sqrt(stars[i].vx ** 2 + stars[i].vy ** 2);
        if (speed > 1.5) { stars[i].vx /= speed; stars[i].vy /= speed; }
      }

      raf = requestAnimationFrame(draw);
    };

    const onMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouse = { x: -999, y: -999 }; };

    resize();
    init();
    draw();

    window.addEventListener('resize', () => { resize(); init(); });
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'crosshair' }} />
  );
}

const QUICK_LINKS = [
  { href: '/',         label: 'Home',     icon: '◈' },
  { href: '/category', label: 'Browse',   icon: '◫' },
  { href: '/discover', label: 'Discover', icon: '✦' },
  { href: '/trending', label: 'Trending', icon: '🔥' },
  { href: '/search',   label: 'Search',   icon: '◎' },
];

export default function Custom404() {
  return (
    <Layout>
      <SEO title="404 — Lost in Space · NovaHub" />

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes glitch {
          0%,100%{clip-path:inset(0);transform:none}
          20%{clip-path:inset(8% 0 82% 0);transform:translate(-4px)}
          40%{clip-path:inset(43% 0 50% 0);transform:translate(4px)}
          60%{clip-path:inset(75% 0 15% 0);transform:translate(-2px)}
          80%{clip-path:inset(25% 0 72% 0);transform:translate(3px)}
        }
      `}</style>

      <div className="not-found-wrapper" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StarField />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px', maxWidth: 560, width: '100%' }}>
          {/* Glitch 404 */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <div style={{ fontSize: 'clamp(80px,20vw,140px)', fontWeight: 900, letterSpacing: '-.06em', lineHeight: 1, color: 'transparent', WebkitTextStroke: '1px rgba(201,168,76,.4)', userSelect: 'none' }}>
              404
            </div>
            <div style={{
              position: 'absolute', inset: 0, fontSize: 'clamp(80px,20vw,140px)', fontWeight: 900,
              letterSpacing: '-.06em', lineHeight: 1, color: 'var(--gold)', opacity: 0.15,
              animation: 'glitch 4s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              404
            </div>
          </div>

          {/* Floating icon */}
          <div style={{ fontSize: 48, marginBottom: 20, animation: 'float 4s ease-in-out infinite' }}>🌌</div>

          <h1 className="not-found-title" style={{ marginBottom: 12 }}>Lost in Space</h1>
          <p className="not-found-desc" style={{ marginBottom: 32 }}>
            This page drifted off into the void. Move your mouse around — you&apos;re not alone out here.
          </p>

          {/* Quick links grid */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            {QUICK_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 99,
                background: 'var(--bg2)', border: '1px solid var(--border)',
                fontSize: 13, fontWeight: 600, color: 'var(--t2)',
                textDecoration: 'none', transition: 'all var(--ease)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-glow2)'; e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.background = 'var(--gold-glow)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--t2)'; e.currentTarget.style.background = 'var(--bg2)'; }}
              >
                <span style={{ fontSize: 12 }}>{l.icon}</span>
                {l.label}
              </Link>
            ))}
          </div>

          <Link href="/" className="btn-primary">Return to NovaHub ✦</Link>
        </div>
      </div>
    </Layout>
  );
}
