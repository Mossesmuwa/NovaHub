// pages/index.js — NovaHub Homepage
// Design: Dark luxury intelligence. Gold accent. Syne + DM Mono. SVG icons only.

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import * as Items from '../lib/items';

// ── SVG Icon set ──────────────────────────────────────────────────────────────
const Icon = {
  film:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>,
  cpu:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2"/></svg>,
  gamepad:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="17" cy="10" r="1" fill="currentColor"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.585-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>,
  book:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  music:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  shield:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  zap:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  flask:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6M9 3v7.5L4 21h16L15 10.5V3M9 3H6M15 3h3"/></svg>,
  brain:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.14Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.14Z"/></svg>,
  pen:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
  search:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  heart:    (filled) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  trending: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  star:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  external: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  menu:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  x:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  diamond:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3L8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>,
  arrowR:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  fire:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
};

// ── Design tokens ─────────────────────────────────────────────────────────────
const G = {
  bg: '#09090C', bg2: '#0F0F14', bg3: '#16161E', bg4: '#1C1C26',
  gold: '#C9A84C', goldL: '#E8C97A', goldD: '#9B7520',
  glow: 'rgba(201,168,76,0.08)', glowH: 'rgba(201,168,76,0.18)',
  border: 'rgba(255,255,255,0.06)', borderG: 'rgba(201,168,76,0.20)',
  t1: '#F2F2F7', t2: '#AEAEB2', t3: '#636366', t4: '#3A3A3E',
  green: '#30D158', red: '#FF453A', blue: '#0A84FF', orange: '#FF9F0A',
};

const CAT = {
  movies:       { icon: Icon.film,    color: '#E8593C', label: 'Movies & TV' },
  'ai-tools':   { icon: Icon.cpu,     color: '#C9A84C', label: 'AI Tools' },
  games:        { icon: Icon.gamepad, color: '#7F77DD', label: 'Games' },
  books:        { icon: Icon.book,    color: '#3B8BD4', label: 'Books' },
  music:        { icon: Icon.music,   color: '#D4537E', label: 'Music' },
  security:     { icon: Icon.shield,  color: '#1D9E75', label: 'Security' },
  productivity: { icon: Icon.zap,     color: '#FF9F0A', label: 'Productivity' },
  science:      { icon: Icon.flask,   color: '#30D158', label: 'Science' },
  courses:      { icon: Icon.brain,   color: '#0A84FF', label: 'Courses' },
  design:       { icon: Icon.pen,     color: '#FF6B6B', label: 'Design' },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Sk = ({ h, w = '100%', r = 8, style = {} }) => (
  <div style={{ height: h, width: w, borderRadius: r, background: `linear-gradient(90deg,${G.bg3} 25%,#1a1a24 50%,${G.bg3} 75%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.6s infinite', ...style }} />
);

// ── Category badge ────────────────────────────────────────────────────────────
function CatBadge({ cat, size = 'sm' }) {
  const m = CAT[cat] || { icon: Icon.diamond, color: G.gold, label: cat || 'Other' };
  const I = m.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: size === 'lg' ? '4px 12px' : '3px 8px', borderRadius: 99, fontSize: size === 'lg' ? 11 : 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', background: m.color + '15', color: m.color, border: `1px solid ${m.color}25` }}>
      <I />{m.label}
    </span>
  );
}

// ── Ratings row ───────────────────────────────────────────────────────────────
function Ratings({ item }) {
  const bits = [];
  if (item.imdb_rating)      bits.push({ label: 'IMDb', val: item.imdb_rating, color: '#F5C518' });
  if (item.rt_score)         bits.push({ label: 'RT', val: `${item.rt_score}%`, color: '#FA320A' });
  if (item.metacritic_score) bits.push({ label: 'MC', val: item.metacritic_score, color: '#FFCC33' });
  if (!bits.length && item.rating) bits.push({ label: null, val: item.rating, color: G.gold });
  if (!bits.length) return null;
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {bits.map(b => (
        <div key={b.label || 'r'} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {b.label && <span style={{ fontSize: 9, fontWeight: 800, color: b.color, opacity: 0.8, fontFamily: 'DM Mono, monospace' }}>{b.label}</span>}
          <span style={{ fontSize: 12, fontWeight: 900, color: b.color, fontFamily: 'DM Mono, monospace' }}>{b.val}</span>
        </div>
      ))}
    </div>
  );
}

// ── Nova score ────────────────────────────────────────────────────────────────
function NScore({ score }) {
  if (!score) return null;
  const v = Math.min(99, Math.round(score * 8));
  if (v < 1) return null;
  const c = v >= 70 ? G.green : v >= 40 ? G.gold : G.t3;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 6, background: c + '12', border: `1px solid ${c}25`, fontSize: 11, fontWeight: 900, color: c, fontFamily: 'DM Mono, monospace' }}>
      <Icon.diamond />
      <span>{v}</span>
    </div>
  );
}

// ── Save button ───────────────────────────────────────────────────────────────
function Heart({ item }) {
  const [on, setOn] = useState(false);
  const [pop, setPop] = useState(false);
  function click(e) {
    e.preventDefault(); e.stopPropagation();
    if (on) { setOn(false); return; }
    setOn(true); setPop(true);
    setTimeout(() => setPop(false), 500);
  }
  return (
    <button onClick={click} style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${on ? G.red + '50' : G.border}`, background: on ? G.red + '12' : 'rgba(9,9,12,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: on ? G.red : G.t3, transition: 'all 0.2s', backdropFilter: 'blur(8px)', transform: pop ? 'scale(1.35)' : 'scale(1)', flexShrink: 0 }}>
      <Icon.heart(on) />
    </button>
  );
}

// ── Poster card ───────────────────────────────────────────────────────────────
function Poster({ item, rank }) {
  const [hov, setH] = useState(false);
  const m = CAT[item.category_id] || { color: G.gold };
  return (
    <Link href={`/item/${item.slug}`} style={{ textDecoration: 'none', display: 'block' }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${hov ? m.color + '35' : G.border}`, transition: 'all 0.25s cubic-bezier(.34,1.56,.64,1)', transform: hov ? 'translateY(-5px)' : 'none', boxShadow: hov ? `0 24px 48px rgba(0,0,0,.6), 0 0 0 1px ${m.color}25` : 'none' }}>
        <div style={{ aspectRatio: '2/3', background: G.bg3, position: 'relative', overflow: 'hidden' }}>
          {item.image
            ? <img src={item.image} alt={item.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hov ? 'scale(1.07)' : 'scale(1)' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, opacity: 0.3 }}><Icon.film /></div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,9,12,.95) 0%, rgba(9,9,12,.2) 55%, transparent 100%)' }} />
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {rank && <div style={{ minWidth: 28, height: 28, borderRadius: 8, background: rank <= 3 ? G.gold : 'rgba(0,0,0,.7)', color: rank <= 3 ? '#09090C' : G.t2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, fontFamily: 'DM Mono, monospace', padding: '0 8px', backdropFilter: 'blur(4px)' }}>{rank}</div>}
            <div style={{ marginLeft: 'auto' }}><Heart item={item} /></div>
          </div>
          <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}><Ratings item={item} /></div>
        </div>
        <div style={{ padding: '12px 12px 14px', background: G.bg2 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: G.t1, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: G.t3 }}>{item.year || ''}</span>
            <NScore score={item.trending_score} />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Tool / article card ───────────────────────────────────────────────────────
function ToolCard({ item }) {
  const [hov, setH] = useState(false);
  const m = CAT[item.category_id] || { icon: Icon.diamond, color: G.gold };
  const I = m.icon;
  return (
    <Link href={`/item/${item.slug}`} style={{ textDecoration: 'none' }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      <div style={{ borderRadius: 14, padding: '16px', background: hov ? G.bg3 : G.bg2, border: `1px solid ${hov ? G.borderG : G.border}`, transition: 'all 0.2s', transform: hov ? 'translateY(-2px)' : 'none', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 50, height: 50, borderRadius: 12, flexShrink: 0, background: item.image ? 'transparent' : m.color + '12', border: `1px solid ${m.color}20`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color }}>
          {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <I />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: G.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.name}</span>
            <Heart item={item} />
          </div>
          <div style={{ fontSize: 12, color: G.t2, lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.short_desc || ''}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CatBadge cat={item.category_id} />
            {item.pricing === 'Free' && <span style={{ fontSize: 10, fontWeight: 700, color: G.green }}>Free</span>}
            {item.rating_count > 0 && <span style={{ fontSize: 10, color: G.t3, marginLeft: 'auto', fontFamily: 'DM Mono, monospace' }}>↑{item.rating_count > 999 ? (item.rating_count/1000).toFixed(1)+'k' : item.rating_count}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Hero section ──────────────────────────────────────────────────────────────
function Hero({ item, loading }) {
  const [hov, setH] = useState(false);
  if (loading) return (
    <div style={{ margin: '0 24px 24px', borderRadius: 20, overflow: 'hidden' }}>
      <Sk h={340} r={20} />
    </div>
  );
  if (!item) return null;
  const m = CAT[item.category_id] || { color: G.gold };
  return (
    <div style={{ margin: '0 24px 32px', borderRadius: 20, overflow: 'hidden', position: 'relative', border: `1px solid ${hov ? m.color + '35' : G.border}`, transition: 'all 0.3s', boxShadow: hov ? '0 40px 100px rgba(0,0,0,.7)' : '0 20px 60px rgba(0,0,0,.4)', cursor: 'pointer' }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      <Link href={`/item/${item.slug}`} style={{ textDecoration: 'none', display: 'block', aspectRatio: '21/8', minHeight: 240, position: 'relative' }}>
        {item.image && <img src={item.image} alt={item.name} loading="eager" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', transform: hov ? 'scale(1.03)' : 'scale(1)' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(9,9,12,.97) 0%, rgba(9,9,12,.65) 45%, rgba(9,9,12,.15) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, padding: '28px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 99, background: G.gold + '15', border: `1px solid ${G.gold}25`, fontSize: 11, fontWeight: 800, color: G.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <Icon.trending /><span>Trending #1</span>
            </div>
            <CatBadge cat={item.category_id} />
          </div>
          <h2 style={{ fontSize: 'clamp(20px,3.5vw,38px)', fontWeight: 900, letterSpacing: '-0.04em', color: G.t1, marginBottom: 10, lineHeight: 1.1, maxWidth: 560 }}>{item.name}</h2>
          <div style={{ fontSize: 14, color: G.t2, maxWidth: 460, lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.short_desc || item.long_desc || ''}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Ratings item={item} />
          </div>
        </div>
      </Link>
      <div style={{ position: 'absolute', top: 16, right: 16 }}><Heart item={item} /></div>
    </div>
  );
}

// ── Horizontal scroll row ─────────────────────────────────────────────────────
function Row({ title, subtitle, items, type = 'poster', href, loading }) {
  const isPoster = type === 'poster';
  const W = isPoster ? 165 : 310;
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, padding: '0 24px' }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 900, letterSpacing: '-0.03em', color: G.t1, marginBottom: 2 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 12, color: G.t3 }}>{subtitle}</p>}
        </div>
        {href && <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: G.gold, fontWeight: 700, textDecoration: 'none' }}>See all <Icon.arrowR /></Link>}
      </div>
      <div style={{ overflowX: 'auto', paddingLeft: 24, paddingRight: 24, scrollbarWidth: 'none', display: 'flex', gap: 12, paddingBottom: 4 }}>
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{ flexShrink: 0, width: W, animation: `fadeIn 0.3s ${i * 0.05}s both` }}>
                {isPoster ? <><Sk h={248} r={14} /><Sk h={14} r={4} style={{ marginTop: 10 }} /><Sk w="55%" h={11} r={4} style={{ marginTop: 6 }} /></> : <Sk h={98} r={14} />}
              </div>
            ))
          : items.map((item, i) => (
              <div key={item.id || i} style={{ flexShrink: 0, width: W, animation: `fadeIn 0.3s ${i * 0.04}s both` }}>
                {isPoster ? <Poster item={item} rank={i + 1} /> : <ToolCard item={item} />}
              </div>
            ))
        }
      </div>
    </section>
  );
}

// ── Live score ticker ─────────────────────────────────────────────────────────
function Ticker({ items }) {
  if (!items.length) return null;
  const list = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}`, padding: '9px 0', background: G.bg2 }}>
      <div style={{ display: 'flex', alignItems: 'center', animation: 'ticker 35s linear infinite', width: 'max-content' }}>
        {list.map((item, i) => {
          const m = CAT[item.category_id] || { color: G.gold };
          return (
            <Link key={i} href={`/item/${item.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 24px', textDecoration: 'none', borderRight: `1px solid ${G.border}`, flexShrink: 0 }}>
              <span style={{ color: m.color, display: 'flex' }}><Icon.fire /></span>
              <span style={{ fontSize: 12, fontWeight: 700, color: G.t2, whiteSpace: 'nowrap' }}>{item.name}</span>
              {item.imdb_rating && <span style={{ fontSize: 10, fontWeight: 700, color: '#F5C518', fontFamily: 'DM Mono, monospace' }}>IMDb {item.imdb_rating}</span>}
              {item.metacritic_score && <span style={{ fontSize: 10, fontWeight: 700, color: '#FFCC33', fontFamily: 'DM Mono, monospace' }}>MC {item.metacritic_score}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Category filter tabs ──────────────────────────────────────────────────────
const TABS = [
  { id: 'all',          label: 'All',         icon: Icon.diamond },
  { id: 'movies',       label: 'Movies & TV',  icon: Icon.film },
  { id: 'ai-tools',     label: 'AI Tools',     icon: Icon.cpu },
  { id: 'games',        label: 'Games',        icon: Icon.gamepad },
  { id: 'books',        label: 'Books',        icon: Icon.book },
  { id: 'security',     label: 'Security',     icon: Icon.shield },
  { id: 'science',      label: 'Science',      icon: Icon.flask },
  { id: 'productivity', label: 'Productivity', icon: Icon.zap },
];

// ── Feed grid ─────────────────────────────────────────────────────────────────
function Feed({ items, loading, cat }) {
  const isPoster = ['movies', 'games', 'books'].includes(cat);
  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: isPoster ? 'repeat(auto-fill,minmax(150px,1fr))' : 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
      {Array.from({ length: 12 }).map((_, i) => <Sk key={i} h={isPoster ? 260 : 100} r={14} style={{ animationDelay: `${i * 0.04}s` }} />)}
    </div>
  );
  if (!items.length) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: G.t3 }}>
      <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3, display: 'flex', justifyContent: 'center' }}><Icon.search /></div>
      <div style={{ fontSize: 16, fontWeight: 700, color: G.t2, marginBottom: 8 }}>Nothing here yet</div>
      <div style={{ fontSize: 14 }}>Content is being populated. Check back soon.</div>
    </div>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isPoster ? 'repeat(auto-fill,minmax(150px,1fr))' : 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
      {items.map((item, i) => (
        <div key={item.id || i} style={{ animation: `fadeIn 0.25s ${i * 0.03}s both` }}>
          {isPoster ? <Poster item={item} rank={i + 1} /> : <ToolCard item={item} />}
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [trending,  setTrending]  = useState([]);
  const [movies,    setMovies]    = useState([]);
  const [tools,     setTools]     = useState([]);
  const [games,     setGames]     = useState([]);
  const [books,     setBooks]     = useState([]);
  const [tab,       setTab]       = useState('all');
  const [feedItems, setFeedItems] = useState([]);
  const [loadHero,  setLoadHero]  = useState(true);
  const [loadRows,  setLoadRows]  = useState(true);
  const [loadFeed,  setLoadFeed]  = useState(true);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    Items.getTrending(20).then(d => { setTrending(d); setLoadHero(false); }).catch(() => setLoadHero(false));
    Promise.all([
      Items.getByCategory('movies',   { limit: 14, sortBy: 'trending' }),
      Items.getByCategory('ai-tools', { limit: 10, sortBy: 'trending' }),
      Items.getByCategory('games',    { limit: 14, sortBy: 'trending' }),
      Items.getByCategory('books',    { limit: 14, sortBy: 'trending' }),
    ]).then(([m, t, g, b]) => { setMovies(m); setTools(t); setGames(g); setBooks(b); setLoadRows(false); });
  }, []);

  useEffect(() => {
    setLoadFeed(true);
    const p = tab === 'all' ? Items.getTrending(24) : Items.getByCategory(tab, { limit: 24, sortBy: 'trending' });
    p.then(d => { setFeedItems(d); setLoadFeed(false); }).catch(() => setLoadFeed(false));
  }, [tab]);

  const hero   = trending[0];
  const ticker = trending.filter(i => i.imdb_rating || i.metacritic_score);

  return (
    <>
      <Head>
        <title>NovaHub — Discover What Matters</title>
        <meta name="description" content="Cross-domain intelligence. Movies, AI tools, games, books — ranked, compared, scored in one unified feed." />
        <meta property="og:title" content="NovaHub — Discover What Matters" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${G.bg}; color: ${G.t1}; font-family: 'Syne', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        a { color: inherit; text-decoration: none; }
        button { font-family: inherit; cursor: pointer; }
        ::-webkit-scrollbar { display: none; }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes ticker  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideD  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ minHeight: '100vh', background: G.bg }}>

        {/* ── NAVBAR ── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 200, height: 60, borderBottom: `1px solid ${G.border}`, background: `${G.bg}E8`, backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 0 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 40, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${G.goldL}, ${G.goldD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#09090C' }}>
              <Icon.diamond />
            </div>
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.03em', background: `linear-gradient(135deg, ${G.goldL}, ${G.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              NOVA<span style={{ fontWeight: 400, opacity: 0.7 }}>HUB</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {[
              { href: '/trending', label: 'Trending', icon: Icon.trending },
              { href: '/category', label: 'Browse',   icon: Icon.diamond },
              { href: '/discover', label: 'Discover', icon: Icon.search },
              { href: '/weekly',   label: 'Digest',   icon: Icon.book },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: G.t2, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = G.bg3; e.currentTarget.style.color = G.t1; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = G.t2; }}>
                <l.icon />{l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <Link href="/search" style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${G.border}`, background: G.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: G.t2, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G.borderG; e.currentTarget.style.color = G.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.t2; }}>
              <Icon.search />
            </Link>
            <Link href="/account/login" style={{ padding: '8px 18px', borderRadius: 10, border: `1px solid ${G.border}`, background: 'transparent', fontSize: 13, fontWeight: 700, color: G.t2, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G.borderG; e.currentTarget.style.color = G.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.t2; }}>
              Sign in
            </Link>
            <Link href="/pro" style={{ padding: '8px 18px', borderRadius: 10, background: `linear-gradient(135deg, ${G.goldL}, ${G.gold}, ${G.goldD})`, fontSize: 13, fontWeight: 800, color: '#09090C', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Pro
            </Link>
          </div>
        </nav>

        {/* ── LIVE SCORE TICKER ── */}
        <Ticker items={ticker} />

        {/* ── HERO ── */}
        <div style={{ paddingTop: 28 }}>
          <Hero item={hero} loading={loadHero} />
        </div>

        {/* ── CATEGORY FILTER TABS ── */}
        <div style={{ padding: '0 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
            {TABS.map(t => {
              const active = tab === t.id;
              const I = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 99, border: `1px solid ${active ? G.gold + '50' : G.border}`, background: active ? G.gold + '12' : 'transparent', color: active ? G.gold : G.t2, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0 }}>
                  <I />{t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── UNIFIED FEED ── */}
        <div style={{ padding: '0 24px', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, letterSpacing: '-0.03em' }}>
                {tab === 'all' ? 'Trending Now' : TABS.find(t => t.id === tab)?.label}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 99, background: G.gold + '10', border: `1px solid ${G.gold}20`, fontSize: 10, fontWeight: 800, color: G.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: G.gold, animation: 'pulse 2s infinite' }} />
                Live
              </div>
            </div>
            <Link href="/trending" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: G.gold, fontWeight: 700 }}>
              See all <Icon.arrowR />
            </Link>
          </div>
          <Feed items={feedItems} loading={loadFeed} cat={tab} />
        </div>

        {/* ── SECTION ROWS ── */}
        <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 48 }}>
          <Row title="Top Movies & TV" subtitle="Ranked by Nova Pulse · IMDB ratings included" items={movies} type="poster" href="/category?cat=movies" loading={loadRows} />
          <Row title="Trending AI Tools" subtitle="What the tech world is adopting this week" items={tools} type="tool" href="/category?cat=ai-tools" loading={loadRows} />
          <Row title="Games Worth Playing" subtitle="Highest rated · Cross-platform" items={games} type="poster" href="/category?cat=games" loading={loadRows} />
          <Row title="Books to Read" subtitle="Bestsellers + community picks" items={books} type="poster" href="/category?cat=books" loading={loadRows} />
        </div>

        {/* ── PRO CTA ── */}
        <div style={{ margin: '0 24px 64px', borderRadius: 20, padding: '40px', background: G.bg2, border: `1px solid ${G.borderG}`, position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 80% at 50% 0%, ${G.gold}08 0%, transparent 60%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 99, background: G.gold + '12', border: `1px solid ${G.gold}25`, fontSize: 11, fontWeight: 800, color: G.gold, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
              <Icon.star />Nova Pro
            </div>
            <h2 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 12 }}>Intelligence without limits</h2>
            <p style={{ fontSize: 15, color: G.t2, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Unlimited saves. Personalised Nova Score on every item. AI-powered discovery. Early trending access.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pro" style={{ padding: '13px 32px', borderRadius: 12, background: `linear-gradient(135deg, ${G.goldL}, ${G.gold}, ${G.goldD})`, color: '#09090C', fontSize: 15, fontWeight: 900 }}>
                Get Nova Pro — $9.99/mo
              </Link>
              <Link href="/discover" style={{ padding: '13px 32px', borderRadius: 12, border: `1px solid ${G.border}`, color: G.t2, fontSize: 15, fontWeight: 700 }}>
                Explore free
              </Link>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: `1px solid ${G.border}`, padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: `linear-gradient(135deg, ${G.goldL}, ${G.goldD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#09090C' }}>
              <Icon.diamond />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: G.t3 }}>NOVAHUB</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact'], ['Blog', '/blog']].map(([l, h]) => (
              <Link key={h} href={h} style={{ fontSize: 12, color: G.t3, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = G.t1}
                onMouseLeave={e => e.currentTarget.style.color = G.t3}>{l}</Link>
            ))}
          </div>
          <span style={{ fontSize: 12, color: G.t4, fontFamily: 'DM Mono, monospace' }}>© 2026 NovaHub</span>
        </footer>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </>
  );
}