import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Card from '../components/Card';
import useScrollReveal from '../hooks/useScrollReveal';
import Link from 'next/link';
import * as Items from '../lib/items';

export default function TrendingPage() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState('all');
  const [loading, setLoading] = useState(true);
  useScrollReveal();

  useEffect(() => {
    Items.getTrending(32).then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = cat === 'all' ? items : items.filter(i => i.category_id === cat);

  return (
    <Layout activePage="trending">
      <SEO title="Trending — NovaHub" description="What's trending on NovaHub right now." />
      <div style={{ textAlign: 'center', padding: 'calc(var(--nav)+48px) 20px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(201,168,76,.09) 0%,transparent 60%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)', borderRadius: '99px', padding: '5px 14px', fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', animation: 'pulseDot 2.4s ease-in-out infinite', flexShrink: 0 }}></span> Live · Updated Hourly
          </div>
          <h1 style={{ fontSize: 'clamp(32px,7vw,60px)', fontWeight: 900, letterSpacing: '-.05em', marginBottom: '10px' }}>🔥 Trending Now</h1>
          <p style={{ fontSize: '16px', color: 'var(--t2)', maxWidth: '460px', margin: '0 auto' }}>What NovaHub users are saving, clicking, and talking about right now.</p>
        </div>
      </div>
      <div className="container" style={{ paddingBottom: '80px' }}>
        <div className="filter-bar" style={{ marginTop: '8px' }}>
          <span className="filter-label">Category</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all','movies','ai-tools','books','games','security'].map(c => (
              <button key={c} className={`sort-pill${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>
                {c === 'all' ? 'All' : c === 'movies' ? '🍿 Movies' : c === 'ai-tools' ? '✨ AI Tools' : c === 'books' ? '📚 Books' : c === 'games' ? '🎮 Games' : '🔐 Security'}
              </button>
            ))}
          </div>
          <div className="filter-right"><span className="item-count"><strong>{filtered.length}</strong> trending</span></div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--t3)' }}>
            <div style={{ width: '28px', height: '28px', border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }}></div>Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><span className="empty-state-icon">📭</span><h3>Nothing trending here yet</h3></div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '32px' }}>
              {filtered.slice(0, 3).map((item, i) => {
                const rank = ['🥇','🥈','🥉'][i];
                return (
                  <Link href={`/item/${encodeURIComponent(item.slug)}`} key={item.id} style={{ background: 'var(--bg2)', border: `1px solid var(--border${i === 0 ? '2' : ''})`, borderRadius: 'var(--rlg)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', color: 'inherit', textDecoration: 'none' }}>
                    <div style={{ fontSize: '28px', flexShrink: 0, width: '44px', textAlign: 'center' }}>{rank}</div>
                    {item.image ? <img src={item.image} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} loading="lazy" alt={item.name} /> : <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{(item.name || '?').charAt(0)}</div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--t3)' }}>{item.category_id || ''}{item.rating ? ` · ★ ${item.rating}` : ''}</div>
                    </div>
                    <div style={{ background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, color: 'var(--gold)', whiteSpace: 'nowrap' }}>🔥 Hot</div>
                  </Link>
                );
              })}
            </div>
            {filtered.length > 3 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }} className="stagger">
                {filtered.slice(3).map((item, i) => (
                  <Link href={`/item/${encodeURIComponent(item.slug)}`} key={item.id} className="reveal-scale" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'inherit', textDecoration: 'none' }}>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--t3)', minWidth: '24px', textAlign: 'center' }}>{i + 4}</div>
                    {item.image ? <img src={item.image} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} loading="lazy" alt={item.name} /> : <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'var(--surf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{(item.name || '?').charAt(0)}</div>}
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div><div style={{ fontSize: '11px', color: 'var(--t3)' }}>{item.category_id || ''}</div></div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
