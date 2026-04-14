import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Card, { PosterCard, ToolCard, CardGrid } from '../components/Card';
import useScrollReveal from '../hooks/useScrollReveal';
import Link from 'next/link';
import * as Items from '../lib/items';
import { CATEGORIES, getCategoryInfo } from '../lib/helpers';

export default function CategoryPage() {
  const router = useRouter();
  const [cat, setCat] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('trending');
  const [freeOnly, setFreeOnly] = useState(false);

  useScrollReveal();

  useEffect(() => {
    const c = router.query.cat || '';
    setCat(c);
  }, [router.query.cat]);

  useEffect(() => {
    if (!cat) { setLoading(false); return; }
    setLoading(true);
    Items.getByCategory(cat, { limit: 60, sortBy, freeOnly }).then(data => {
      setItems(data);
      setLoading(false);
    }).catch(() => { setItems([]); setLoading(false); });
  }, [cat, sortBy, freeOnly]);

  const info = getCategoryInfo(cat);
  const isPoster = ['movies', 'books', 'games'].includes(cat);

  // No category selected — show all categories
  if (!cat) {
    return (
      <Layout activePage="browse">
        <SEO title="Browse — NovaHub" description="Browse all categories on NovaHub." />
        <div style={{ textAlign: 'center', padding: 'calc(var(--nav) + 48px) 20px 36px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(201,168,76,.09) 0%,transparent 60%)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: 'clamp(32px,7vw,56px)', fontWeight: 900, letterSpacing: '-.05em', marginBottom: '10px' }}>Browse Categories</h1>
            <p style={{ fontSize: '16px', color: 'var(--t2)', maxWidth: '460px', margin: '0 auto' }}>Explore everything NovaHub has to offer.</p>
          </div>
        </div>
        <div className="container" style={{ paddingBottom: '80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px' }} className="stagger">
            {CATEGORIES.map(c => (
              <Link href={`/category?cat=${c.id}`} className="cat-tile reveal-scale" key={c.id} style={{ padding: '24px 20px' }}>
                <div className="cat-tile-icon" style={{ fontSize: '32px' }}>{c.icon}</div>
                <div className="cat-tile-name" style={{ fontSize: '16px' }}>{c.name}</div>
                <div className="cat-tile-count">{c.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage="browse">
      <SEO title={`${info.name} — NovaHub`} description={`Browse the best ${info.name.toLowerCase()} on NovaHub.`} />

      {/* HERO */}
      <div className="cat-hero" style={{ textAlign: 'center', padding: 'calc(var(--nav) + 48px) 20px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(201,168,76,.09) 0%,transparent 60%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="breadcrumb" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span><span>{info.icon} {info.name}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px,8vw,64px)', fontWeight: 900, letterSpacing: '-.05em', marginBottom: '10px' }}>{info.icon} {info.name}</h1>
          <p style={{ fontSize: '16px', color: 'var(--t2)', maxWidth: '460px', margin: '0 auto' }}>{info.desc}</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {/* FILTER BAR */}
        <div className="filter-bar">
          <span className="filter-label">Sort:</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['trending','rating','newest','name'].map(s => (
              <button key={s} className={`sort-pill${sortBy === s ? ' active' : ''}`} onClick={() => setSortBy(s)}>
                {s === 'trending' ? '🔥 Trending' : s === 'rating' ? '⭐ Top Rated' : s === 'newest' ? '🆕 Newest' : '🔤 A–Z'}
              </button>
            ))}
            <button className={`sort-pill${freeOnly ? ' active' : ''}`} onClick={() => setFreeOnly(!freeOnly)}>
              💰 Free Only
            </button>
          </div>
          <div className="filter-right">
            <span className="item-count"><strong>{items.length}</strong> items</span>
          </div>
        </div>

        {/* ITEMS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--t3)' }}>
            <div style={{ width: '28px', height: '28px', border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }}></div>
            Loading…
          </div>
        ) : items.length ? (
          <CardGrid items={items} gridClass={isPoster ? 'grid-4 stagger' : 'grid-3 stagger'} />
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <h3>No items found</h3>
            <p>Try a different filter or <Link href="/category" style={{ color: 'var(--gold)' }}>browse other categories</Link>.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
