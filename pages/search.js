// pages/search.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { PosterCard, ToolCard } from '../components/Card';
import useScrollReveal from '../hooks/useScrollReveal';
import Link from 'next/link';
import * as Items from '../lib/items';

const QUICK_TAGS = ['AI tools', 'Hacking', 'Free tools', 'RPG Games', 'Sci-Fi', 'Books 2025', 'Productivity'];

const TYPE_ICONS = { movie: '🍿', tv: '📺', book: '📚', game: '🎮', tool: '✨', course: '🧠', podcast: '🎙', security: '🔐' };

// Keyboard shortcut hint
function useKbdSearch(inputRef) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}

export default function SearchPage() {
  const router        = useRouter();
  const inputRef      = useRef(null);
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState([]);
  const [tab,       setTab]       = useState('all');
  const [trending,  setTrending]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [searched,  setSearched]  = useState(false);
  const [aiSuggs,   setAiSuggs]   = useState([]);
  const debounceRef = useRef(null);
  useScrollReveal();
  useKbdSearch(inputRef);

  useEffect(() => {
    Items.getTrending(12).then(setTrending).catch(() => {});
  }, []);

  useEffect(() => {
    const q = router.query.q || '';
    if (q) { setQuery(q); doSearch(q); }
  }, [router.query.q]);

  async function doSearch(q) {
    const searchQ = (q || query).trim();
    if (!searchQ) return;
    setLoading(true); setSearched(true); setTab('all');
    try {
      const items = await Items.search(searchQ, { limit: 40 });
      setResults(items);
    } catch { setResults([]); }
    setLoading(false);
  }

  function quickSearch(q) {
    setQuery(q);
    router.replace(`/search?q=${encodeURIComponent(q)}`, undefined, { shallow: true });
    doSearch(q);
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      router.replace(`/search?q=${encodeURIComponent(query)}`, undefined, { shallow: true });
      doSearch(query);
    }
  }

  const types    = [...new Set(results.map(i => i.type || 'other'))];
  const filtered = tab === 'all' ? results : results.filter(i => i.type === tab);
  const posters  = filtered.filter(i => ['movie', 'book', 'game', 'tv'].includes(i.type));
  const cards    = filtered.filter(i => !['movie', 'book', 'game', 'tv'].includes(i.type));

  return (
    <Layout activePage="search">
      <SEO title={searched ? `"${query}" — NovaHub` : 'Search — NovaHub'} description="Search everything on NovaHub." />

      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>

      {/* ── HERO ── */}
      <div className="search-hero">
        <div className="search-hero-bg" />
        <div className="search-hero-grid" />
        <div className="search-hero-inner">
          <h1 className="search-hero-title">
            {searched
              ? <><span style={{ color: 'var(--t3)', fontWeight: 400, fontSize: '0.65em' }}>Results for </span>&ldquo;{query}&rdquo;</>
              : 'Explore Everything'
            }
          </h1>

          {/* Big search box */}
          <div className="search-big" style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ flexShrink: 0, color: 'var(--t3)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search movies, books, AI tools, games…"
              autoComplete="off"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
            />
            {query && (
              <button onClick={() => { setQuery(''); setSearched(false); setResults([]); }}
                style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '0 4px', fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
                ✕
              </button>
            )}
            <button className="btn-gold" onClick={() => quickSearch(query)} style={{ flexShrink: 0 }}>
              {loading ? <span style={{ width: 14, height: 14, border: '2px solid rgba(9,9,12,.3)', borderTopColor: '#09090C', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'block' }} /> : 'Search'}
            </button>
          </div>

          {/* Keyboard hint */}
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 8, marginBottom: 16 }}>
            Press <kbd style={{ background: 'var(--surf)', border: '1px solid var(--border2)', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>⌘K</kbd> to focus search from anywhere
          </div>

          {/* Quick tags */}
          <div className="trend-chips">
            <span className="trend-label">Try:</span>
            {QUICK_TAGS.map(t => (
              <button key={t} className="trend-chip" onClick={() => quickSearch(t)}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80, minHeight: 400 }}>

        {/* ── RESULTS STATE ── */}
        {searched && (
          <>
            {/* Result bar + tabs */}
            <div className="result-bar">
              <div className="result-info">
                {loading
                  ? 'Searching…'
                  : <><strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;</>
                }
              </div>
              <div className="type-tabs">
                <button className={`type-tab${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>
                  All <span className="cnt">({results.length})</span>
                </button>
                {types.map(t => {
                  const count = results.filter(i => i.type === t).length;
                  return (
                    <button key={t} className={`type-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                      {TYPE_ICONS[t] || ''} {t.charAt(0).toUpperCase() + t.slice(1)} <span className="cnt">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, marginTop: 24 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ height: 120, background: 'var(--bg2)', borderRadius: 'var(--r)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">🔍</span>
                <h3>No results for &ldquo;{query}&rdquo;</h3>
                <p>Try different keywords or <Link href="/category" style={{ color: 'var(--gold)' }}>browse categories</Link>.</p>
                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {QUICK_TAGS.slice(0, 4).map(t => (
                    <button key={t} className="cat-chip" onClick={() => quickSearch(t)}>{t}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ animation: 'fadeIn .3s ease' }}>
                {posters.length > 0 && (
                  <div className="grid-4 stagger" style={{ marginBottom: 28 }}>
                    {posters.map(item => (
                      <div className="reveal-scale" key={item.id}><PosterCard item={item} /></div>
                    ))}
                  </div>
                )}
                {cards.length > 0 && (
                  <div className="grid-3 stagger">
                    {cards.map(item => (
                      <div className="reveal-scale" key={item.id}><ToolCard item={item} /></div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── DEFAULT: TRENDING ── */}
        {!searched && (
          <>
            <div className="section-header reveal">
              <div>
                <div className="section-label">Popular Now</div>
                <h2 className="section-title">🔥 Trending Across NovaHub</h2>
              </div>
              <Link href="/trending" style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700, textDecoration: 'none' }}>
                See all →
              </Link>
            </div>
            {trending.length > 0 && (
              <div className={`${trending.some(i => ['movie','book','game','tv'].includes(i.type)) ? 'grid-4' : 'grid-3'} stagger`}>
                {trending.map(item => {
                  const isPoster = ['movie','book','game','tv'].includes(item.type);
                  return (
                    <div className="reveal-scale" key={item.id}>
                      {isPoster ? <PosterCard item={item} /> : <ToolCard item={item} />}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
