// pages/trending.js
import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Link from 'next/link';
import useScrollReveal from '../hooks/useScrollReveal';
import * as Items from '../lib/items';

const CATS = [
  { id: 'all',         label: 'All',       icon: '✦' },
  { id: 'movies',      label: 'Movies',     icon: '🍿' },
  { id: 'ai-tools',    label: 'AI Tools',   icon: '✨' },
  { id: 'games',       label: 'Games',      icon: '🎮' },
  { id: 'books',       label: 'Books',      icon: '📚' },
  { id: 'security',    label: 'Security',   icon: '🔐' },
  { id: 'productivity',label: 'Productivity',icon: '⚡' },
];

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_GLOW = ['rgba(255,215,0,.15)', 'rgba(192,192,192,.12)', 'rgba(205,127,50,.1)'];

// Animated rank number on scroll
function RankNumber({ n }) {
  const [shown, setShown] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setShown(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ fontSize: 15, fontWeight: 900, color: 'var(--t3)', minWidth: 28, textAlign: 'center', transition: 'color .3s', ...(shown ? { color: 'var(--t2)' } : {}) }}>
      {n}
    </div>
  );
}

// Top-3 podium card
function PodiumCard({ item, rank }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/item/${encodeURIComponent(item.slug)}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: hovered ? 'var(--bg3)' : 'var(--bg2)',
        border: `1px solid ${rank === 0 ? 'rgba(255,215,0,.25)' : 'var(--border)'}`,
        borderRadius: 'var(--rlg)', padding: '18px 20px',
        textDecoration: 'none', color: 'inherit',
        transition: 'all var(--spring)',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,.3)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
        background: hovered ? 'var(--bg3)' : `linear-gradient(135deg, ${MEDAL_GLOW[rank]} 0%, var(--bg2) 40%)`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontSize: 32, flexShrink: 0, width: 44, textAlign: 'center', lineHeight: 1 }}>{MEDALS[rank]}</div>

      {item.image ? (
        <img src={item.image} alt={item.name}
          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, flexShrink: 0, background: 'var(--bg3)' }} />
      ) : (
        <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: 'var(--gold)', flexShrink: 0 }}>
          {(item.name || '?').charAt(0)}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>{item.category_id || item.type}</span>
          {item.rating && <span style={{ fontSize: 11, color: 'var(--t2)' }}>★ {item.rating}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 800, color: 'var(--gold)', whiteSpace: 'nowrap' }}>
          🔥 {item.trending_score ? `${(item.trending_score).toFixed(0)} pts` : 'Hot'}
        </span>
      </div>
    </Link>
  );
}

// Grid rank card (4–N)
function GridCard({ item, rank }) {
  return (
    <Link
      href={`/item/${encodeURIComponent(item.slug)}`}
      className="reveal-scale"
      style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '12px 14px', color: 'inherit', textDecoration: 'none', transition: 'all var(--ease)' }}
    >
      <RankNumber n={rank} />
      {item.image ? (
        <img src={item.image} alt={item.name}
          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0, background: 'var(--bg3)' }} />
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--surf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: 'var(--t2)', flexShrink: 0 }}>
          {(item.name || '?').charAt(0)}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{item.category_id || item.type}</div>
      </div>
    </Link>
  );
}

export default function TrendingPage() {
  const [items,   setItems]   = useState([]);
  const [cat,     setCat]     = useState('all');
  const [loading, setLoading] = useState(true);
  const [now,     setNow]     = useState('');
  useScrollReveal();

  useEffect(() => {
    setNow(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    Items.getTrending(40).then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = cat === 'all' ? items : items.filter(i => (i.category_id || i.category) === cat);
  const top3 = filtered.slice(0, 3);
  const rest  = filtered.slice(3);

  return (
    <Layout activePage="trending">
      <SEO title="Trending — NovaHub" description="What's trending on NovaHub right now." />

      <style>{`
        @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:.5} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ textAlign: 'center', padding: 'calc(var(--nav)+48px) 20px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(201,168,76,.09) 0%,transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)', borderRadius: 99, padding: '5px 16px', fontSize: 11, fontWeight: 800, color: 'var(--gold)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', animation: 'pulseDot 2s ease-in-out infinite', display: 'inline-block' }} />
            Live · Updated nightly
            {now && <span style={{ opacity: .6, fontWeight: 500 }}>· as of {now}</span>}
          </div>
          <h1 style={{ fontSize: 'clamp(32px,7vw,60px)', fontWeight: 900, letterSpacing: '-.05em', marginBottom: 10 }}>
            🔥 Trending Now
          </h1>
          <p style={{ fontSize: 16, color: 'var(--t2)', maxWidth: 460, margin: '0 auto' }}>
            Ranked by saves, clicks, and recency — updated every night by Nova Pulse.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>

        {/* ── CATEGORY FILTER ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
          {CATS.map(c => (
            <button
              key={c.id}
              className={`sort-pill${cat === c.id ? ' active' : ''}`}
              onClick={() => setCat(c.id)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {c.icon} {c.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--t3)', flexShrink: 0 }}>
            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{filtered.length}</span>&nbsp;trending
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--t3)' }}>
            <div style={{ width: 28, height: 28, border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            Calculating pulse…
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <h3>Nothing trending here yet</h3>
            <p>Content populates as the platform grows. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {top3.map((item, i) => <PodiumCard key={item.id} item={item} rank={i} />)}
              </div>
            )}

            {/* Rest as grid */}
            {rest.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12, paddingLeft: 4 }}>
                  Rising
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }} className="stagger">
                  {rest.map((item, i) => <GridCard key={item.id} item={item} rank={i + 4} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
