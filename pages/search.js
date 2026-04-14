import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Card, { PosterCard, ToolCard } from '../components/Card';
import useScrollReveal from '../hooks/useScrollReveal';
import Link from 'next/link';
import * as Items from '../lib/items';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [tab, setTab] = useState('all');
  const [trending, setTrending] = useState([]);
  const [searched, setSearched] = useState(false);

  useScrollReveal();

  useEffect(() => {
    Items.getTrending(12).then(setTrending).catch(() => {});
  }, []);

  useEffect(() => {
    const q = router.query.q || '';
    if (q) { setQuery(q); doSearch(q); }
  }, [router.query.q]);

  async function doSearch(q) {
    const searchQ = q || query;
    if (!searchQ.trim()) return;
    setSearched(true);
    try {
      const items = await Items.search(searchQ, { limit: 40 });
      setResults(items);
      setTab('all');
    } catch { setResults([]); }
  }

  function quickSearch(q) { setQuery(q); doSearch(q); router.replace(`/search?q=${encodeURIComponent(q)}`, undefined, { shallow: true }); }

  const types = [...new Set(results.map(i => i.type || 'other'))];
  const filtered = tab === 'all' ? results : results.filter(i => i.type === tab);
  const posters = filtered.filter(i => ['movie','book','game'].includes(i.type));
  const cards = filtered.filter(i => !['movie','book','game'].includes(i.type));

  return (
    <Layout activePage="search">
      <SEO title="Search — NovaHub" description="Search NovaHub — find movies, books, AI tools, games, security resources and more." />

      {/* HERO */}
      <div className="search-hero">
        <div className="search-hero-bg"></div>
        <div className="search-hero-grid"></div>
        <div className="search-hero-inner">
          <h1 className="search-hero-title">{searched ? `Results for "${query}"` : 'Explore Everything'}</h1>
          <div className="search-big">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--t3)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search movies, books, AI tools, games, security…" autoComplete="off" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} />
            <button className="btn-gold" onClick={() => doSearch()}>Search</button>
          </div>
          <div className="trend-chips">
            <span className="trend-label">Try:</span>
            {['AI tools','Hacking','Free','RPG Games','Sci-Fi','Books'].map(t => (
              <button key={t} className="trend-chip" onClick={() => quickSearch(t)}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px', minHeight: '400px' }}>
        {/* RESULTS BAR */}
        {searched && (
          <div className="result-bar">
            <div className="result-info"><strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''}{query ? ` for "${query}"` : ''}</div>
            <div className="type-tabs">
              <button className={`type-tab${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>All <span className="cnt">({results.length})</span></button>
              {types.map(t => {
                const count = results.filter(i => i.type === t).length;
                return <button key={t} className={`type-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)} <span className="cnt">({count})</span></button>;
              })}
            </div>
          </div>
        )}

        {/* RESULTS or TRENDING */}
        {searched ? (
          filtered.length === 0 ? (
            <div className="empty-state"><span className="empty-state-icon">🔍</span><h3>No results found</h3><p>Try different keywords or <Link href="/category" style={{ color: 'var(--gold)' }}>browse categories</Link>.</p></div>
          ) : (
            <>
              {posters.length > 0 && (
                <div className="grid-4 stagger" style={{ marginBottom: '28px' }}>
                  {posters.map(item => <div className="reveal-scale" key={item.id}><PosterCard item={item} /></div>)}
                </div>
              )}
              {cards.length > 0 && (
                <div className="grid-3 stagger">
                  {cards.map(item => <div className="reveal-scale" key={item.id}><ToolCard item={item} /></div>)}
                </div>
              )}
            </>
          )
        ) : (
          <>
            <div className="section-header reveal"><div><div className="section-label">Popular Now</div><h2 className="section-title">🔥 Trending Across NovaHub</h2></div></div>
            {trending.length > 0 && (
              <div className={`${trending.some(i => ['movie','book','game'].includes(i.type)) ? 'grid-4' : 'grid-3'} stagger`}>
                {trending.map(item => <div className="reveal-scale" key={item.id}><Card item={item} /></div>)}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
