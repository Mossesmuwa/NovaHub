import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getCurrentUser } from '../../lib/supabase';
import * as Favorites from '../../lib/favorites';

export default function FavoritesPage() {
  const router = useRouter();
  const [allFavs, setAllFavs] = useState([]);
  const [sort, setSort] = useState('recent');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) { router.replace('/account/login?return=/account/favorites'); return; }
      const items = await Favorites.getAllFavorites();
      setAllFavs(items);
      setLoading(false);
    })();
  }, []);

  function getSorted() {
    let items = allFavs;
    if (typeFilter !== 'all') items = items.filter(i => i.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => (i.name || '').toLowerCase().includes(q) || (i.short_desc || '').toLowerCase().includes(q));
    }
    if (sort === 'name') return [...items].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (sort === 'type') return [...items].sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    return items;
  }

  async function removeItem(itemId) {
    await Favorites.removeFavorite(itemId);
    setAllFavs(prev => prev.filter(i => i.id !== itemId));
  }

  const types = {};
  allFavs.forEach(i => { if (i.type) types[i.type] = (types[i.type] || 0) + 1; });
  const sorted = getSorted();

  function renderCard(item) {
    const href = `/item/${encodeURIComponent(item.slug || item.id)}`;
    if (['movie','book','game'].includes(item.type)) {
      return (
        <div style={{ position: 'relative' }} key={item.id}>
          <Link href={href} className="card-poster">
            <div className="bg-zoom" style={{ backgroundImage: `url('${item.image || ''}')` }}></div>
            <div className="card-poster-content"><div className="card-poster-title">{item.name}</div>{item.rating && <div className="card-poster-rating">★ {item.rating}</div>}</div>
          </Link>
          <button className="remove-btn" onClick={() => removeItem(item.id)} title="Remove">✕</button>
        </div>
      );
    }
    const isFree = (item.pricing || '').toLowerCase().includes('free');
    return (
      <div className="card" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => router.push(href)} key={item.id}>
        <button className="remove-btn" onClick={e => { e.stopPropagation(); removeItem(item.id); }} title="Remove">✕</button>
        <div className="card-icon">{(item.name || '?').charAt(0)}</div>
        <div className="card-title">{item.name}</div>
        {item.pricing && <span className={isFree ? 'tag-free' : 'tag-paid'} style={{ display: 'inline-block', marginBottom: '8px' }}>{item.pricing}</span>}
        <p className="card-desc">{item.short_desc || ''}</p>
      </div>
    );
  }

  if (loading) return <Layout><SEO title="Saved Items — NovaHub" /><div style={{ textAlign: 'center', padding: '120px', color: 'var(--t3)' }}><div style={{ width: '28px', height: '28px', border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }}></div>Loading…</div></Layout>;

  return (
    <Layout>
      <SEO title="Saved Items — NovaHub" />
      <div className="fav-hero"><div className="fav-hero-bg"></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>Your Collection</div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, letterSpacing: '-.04em', marginBottom: '6px' }}>Saved Items</h1>
          <p style={{ fontSize: '15px', color: 'var(--t2)' }}>Everything you&apos;ve saved across all categories.</p>
        </div>
      </div>
      <div className="container" style={{ paddingBottom: '80px' }}>
        <div className="fav-toolbar">
          <input type="text" className="fav-search" placeholder="Filter saved items…" value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['recent','name','type'].map(s => (
              <button key={s} className={`sort-pill${sort === s ? ' active' : ''}`} onClick={() => setSort(s)}>
                {s === 'recent' ? 'Recent' : s === 'name' ? 'A–Z' : 'By Type'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--t3)', whiteSpace: 'nowrap', marginLeft: 'auto' }}><span style={{ color: 'var(--gold)', fontWeight: 700 }}>{sorted.length}</span> saved</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <button className={`sort-pill${typeFilter === 'all' ? ' active' : ''}`} onClick={() => setTypeFilter('all')}>All ({allFavs.length})</button>
          {Object.keys(types).map(t => (
            <button key={t} className={`sort-pill${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>{t} ({types[t]})</button>
          ))}
        </div>
        {sorted.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">{search.trim() || typeFilter !== 'all' ? '🔍' : '♡'}</span>
            <h3>{search.trim() || typeFilter !== 'all' ? 'No matches' : 'Nothing saved yet'}</h3>
            <p>{search.trim() || typeFilter !== 'all' ? 'Try a different filter.' : 'Browse NovaHub and save things you love.'}</p>
            {!(search.trim() || typeFilter !== 'all') && <Link href="/" className="btn-primary" style={{ marginTop: '12px' }}>Discover Now</Link>}
          </div>
        ) : (
          <div className={sorted.some(i => ['movie','book','game'].includes(i.type)) ? 'grid-4' : 'grid-3'}>
            {sorted.map(renderCard)}
          </div>
        )}
      </div>
    </Layout>
  );
}
