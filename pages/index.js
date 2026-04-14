import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Card, { Carousel, CarouselNav, CardGrid } from '../components/Card';
import useScrollReveal from '../hooks/useScrollReveal';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import * as Items from '../lib/items';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [aiTools, setAiTools] = useState([]);
  const [movies, setMovies] = useState([]);
  const [games, setGames] = useState([]);
  const [security, setSecurity] = useState([]);
  const [books, setBooks] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState(null);

  useScrollReveal();

  useEffect(() => {
    (async () => {
      try {
        const [f, t, at, m, g, s, b, r] = await Promise.all([
          Items.getFeatured(5), Items.getTrending(14),
          Items.getByCategory('ai-tools', { limit: 8 }), Items.getByCategory('movies', { limit: 10 }),
          Items.getByCategory('games', { limit: 10 }), Items.getByCategory('security', { limit: 6 }),
          Items.getByCategory('books', { limit: 10 }), Items.getRecommendations(6),
        ]);
        setFeatured(f); setTrending(t); setAiTools(at); setMovies(m);
        setGames(g); setSecurity(s); setBooks(b); setRecs(r);
      } catch (err) { console.error('[NovaHub] Init error:', err); }
      setLoading(false);
    })();
  }, []);

  function heroSearch() {
    const q = document.getElementById('hero-input')?.value?.trim();
    if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
  }

  async function aiSearch() {
    if (!aiQuery.trim()) return;
    setAiResult('searching');
    try {
      const items = await Items.search(aiQuery, { limit: 6 });
      setAiResult(items);
    } catch { setAiResult([]); }
  }

  const reasons = ['Trending now', "Community pick", "Editor's choice", 'Highly rated', 'New & noteworthy', 'Perfect for today'];

  return (
    <Layout activePage="home">
      <SEO />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-orb"></div>
        <div className="hero-content">
          <div className="hero-badge"><div className="hero-badge-dot"></div>AI Discovery · Updated Daily</div>
          <h1 className="hero-title">Discover Everything<br/>Worth Your Time</h1>
          <p className="hero-sub">Movies, books, AI tools, games, niche companies — curated by humans, powered by intelligence. One place for all of it.</p>
          <div className="hero-search">
            <input type="text" id="hero-input" placeholder='Try "best AI coding tools" or "dark sci-fi movies"…' autoComplete="off" onKeyDown={e => e.key === 'Enter' && heroSearch()} />
            <button className="btn-gold" onClick={heroSearch}>Search →</button>
          </div>
          <div className="hero-cat-chips" style={{ display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'8px',marginTop:'20px' }}>
            <Link href="/search?q=trending" className="cat-chip" style={{fontSize:'12px',padding:'6px 14px'}}>🔥 Trending</Link>
            <Link href="/category?cat=ai-tools" className="cat-chip" style={{fontSize:'12px',padding:'6px 14px'}}>✨ AI Tools</Link>
            <Link href="/category?cat=games" className="cat-chip" style={{fontSize:'12px',padding:'6px 14px'}}>🎮 Games</Link>
            <Link href="/category?cat=movies" className="cat-chip" style={{fontSize:'12px',padding:'6px 14px'}}>🍿 Movies</Link>
            <Link href="/category?cat=books" className="cat-chip" style={{fontSize:'12px',padding:'6px 14px'}}>📚 Books</Link>
            <Link href="/category?cat=security" className="cat-chip" style={{fontSize:'12px',padding:'6px 14px'}}>🔐 Security</Link>
          </div>
        </div>
        <div className="hero-scroll-hint"><div className="scroll-line"></div><span>Scroll</span></div>
      </section>

      {/* FEATURED */}
      <section className="section" style={{ paddingTop: '36px' }}>
        <div className="container">
          <div className="section-header reveal">
            <div><div className="section-label">Featured</div><h2 className="section-title">Editor&apos;s Picks</h2></div>
            <Link href="/category" className="section-more">All →</Link>
          </div>
          <div className="featured-grid reveal" id="featured-grid">
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--t3)' }}>
                <div style={{ width: '28px', height: '28px', border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }}></div>
                Loading picks…
              </div>
            ) : featured.length >= 2 ? (
              <>
                <Link href={`/item/${encodeURIComponent(featured[0].slug)}`} className="featured-hero-card">
                  <img src={featured[0].image || ''} alt={featured[0].name} loading="lazy" />
                  <div className="feat-overlay"></div>
                  <div className="feat-info">
                    <div className="feat-type">{(featured[0].type || '').toUpperCase()}</div>
                    <div className="feat-title">{featured[0].name}</div>
                    {featured[0].rating && <div className="feat-rating">★ {featured[0].rating}</div>}
                  </div>
                </Link>
                {featured.slice(1, 5).map(i => (
                  <Link href={`/item/${encodeURIComponent(i.slug)}`} className="featured-card" key={i.id}>
                    <img src={i.image || ''} alt={i.name} loading="lazy" />
                    <div className="feat-overlay"></div>
                    <div className="feat-info">
                      <div className="feat-type">{(i.type || '').toUpperCase()}</div>
                      <div className="feat-title" style={{ fontSize: '13px' }}>{i.name}</div>
                    </div>
                  </Link>
                ))}
              </>
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'var(--t3)', fontSize: '14px' }}>
                Set featured=true on items in Supabase to see them here.
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* TRENDING */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div><div className="section-label">Hot Now</div><h2 className="section-title">🔥 Trending</h2></div>
            <Link href="/trending" className="section-more">See all →</Link>
          </div>
          <Carousel items={trending} id="trending-carousel" width="150px" />
          <CarouselNav id="trending-carousel" />
        </div>
      </section>

      <div className="divider"></div>

      {/* AI RECOMMENDATIONS */}
      <section className="section">
        <div className="container">
          <div className="ai-section reveal">
            <div className="ai-section-bg"></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="ai-badge">✦ AI-Powered</div>
              <div className="section-header" style={{ marginBottom: '8px' }}>
                <div>
                  <div className="section-label">Personalised</div>
                  <h2 className="section-title">Tell us what you&apos;re in the mood for</h2>
                </div>
                <Link href="/search" className="section-more">Full Search →</Link>
              </div>
              <p style={{ color: 'var(--t2)', fontSize: '14px', maxWidth: '520px' }}>Type anything — &quot;dark thriller with twists&quot; or &quot;free tool to speed up my workflow&quot;.</p>
              <div className="ai-input-row">
                <input type="text" id="ai-input" placeholder='e.g. "mind-bending sci-fi" or "free AI coding tool"…' autoComplete="off" value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && aiSearch()} />
                <button className="btn-gold" onClick={aiSearch}>Ask ✦</button>
              </div>
              {aiResult === 'searching' && <div className="ai-result"><span style={{ color: 'var(--t3)' }}>✦ Searching…</span></div>}
              {Array.isArray(aiResult) && aiResult.length === 0 && <div className="ai-result">No results — <Link href={`/search?q=${encodeURIComponent(aiQuery)}`} style={{ color: 'var(--gold)' }}>Try full search →</Link></div>}
              {Array.isArray(aiResult) && aiResult.length > 0 && (
                <div className="ai-result">
                  <strong>{aiResult.length} result{aiResult.length !== 1 ? 's' : ''}</strong> for &quot;{aiQuery}&quot;:
                  <br /><br />
                  {aiResult.map(i => (
                    <Link href={`/item/${encodeURIComponent(i.slug)}`} key={i.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 13px', margin: '3px', background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: '99px', fontWeight: 700, fontSize: '13px', color: 'var(--gold)' }}>→ {i.name}</Link>
                  ))}
                </div>
              )}
              {recs.length > 0 && (
                <div className="ai-recs-grid stagger">
                  {recs.map((item, i) => (
                    <Link href={`/item/${encodeURIComponent(item.slug)}`} className="ai-rec-card" key={item.id}>
                      {item.image ? <img src={item.image} className="ai-rec-img" alt={item.name} loading="lazy" /> : <div style={{ fontSize: '28px', marginBottom: '10px' }}>{(item.name || '?').charAt(0)}</div>}
                      <div className="ai-rec-name">{item.name}</div>
                      <div className="ai-rec-why">{reasons[i % reasons.length]}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* AI TOOLS */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div><div className="section-label">Productivity</div><h2 className="section-title">✨ AI Tools</h2></div>
            <Link href="/category?cat=ai-tools" className="section-more">All →</Link>
          </div>
          <Carousel items={aiTools} id="tools-carousel" width="260px" />
          <CarouselNav id="tools-carousel" />
        </div>
      </section>

      <div className="divider"></div>

      {/* CATEGORY GRID */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div><div className="section-label">Browse</div><h2 className="section-title">All Categories</h2></div>
            <Link href="/category" className="section-more">More →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }} className="stagger">
            {[
              { cat: 'movies', icon: '🍿', name: 'Movies & TV', count: '120+ items' },
              { cat: 'books', icon: '📚', name: 'Books', count: '85+ items' },
              { cat: 'ai-tools', icon: '✨', name: 'AI Tools', count: '90+ items' },
              { cat: 'games', icon: '🎮', name: 'Games', count: '64+ items' },
              { cat: 'security', icon: '🔐', name: 'Security', count: '40+ items' },
              { cat: 'music', icon: '🎵', name: 'Music', count: '55+ items' },
              { cat: 'courses', icon: '🧠', name: 'Courses', count: '38+ items' },
              { cat: 'news', icon: '📰', name: 'News', count: 'Daily' },
              { cat: 'design', icon: '🎨', name: 'Design', count: '45+ items' },
              { cat: 'science', icon: '🔬', name: 'Science', count: '30+ items' },
              { cat: 'finance', icon: '📈', name: 'Finance', count: '28+ items' },
              { cat: 'productivity', icon: '⚡', name: 'Productivity', count: '60+ items' },
            ].map(c => (
              <Link href={`/category?cat=${c.cat}`} className="cat-tile reveal-scale" key={c.cat}>
                <div className="cat-tile-icon">{c.icon}</div>
                <div className="cat-tile-name">{c.name}</div>
                <div className="cat-tile-count">{c.count}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* MOVIES */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div><div className="section-label">Watch</div><h2 className="section-title">🍿 Movies &amp; TV</h2></div>
            <Link href="/category?cat=movies" className="section-more">All →</Link>
          </div>
          <Carousel items={movies} id="movies-carousel" width="150px" />
          <CarouselNav id="movies-carousel" />
        </div>
      </section>

      <div className="divider"></div>

      {/* GAMES */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div><div className="section-label">Play</div><h2 className="section-title">🎮 Games</h2></div>
            <Link href="/category?cat=games" className="section-more">All →</Link>
          </div>
          <Carousel items={games} id="games-carousel" width="150px" />
          <CarouselNav id="games-carousel" />
        </div>
      </section>

      <div className="divider"></div>

      {/* SECURITY */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div><div className="section-label">Featured</div><h2 className="section-title">🔐 Cyber Security</h2></div>
            <Link href="/category?cat=security" className="section-more">All →</Link>
          </div>
          <CardGrid items={security} gridClass="grid-3 stagger" />
        </div>
      </section>

      <div className="divider"></div>

      {/* BOOKS */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div><div className="section-label">Read</div><h2 className="section-title">📚 Books</h2></div>
            <Link href="/category?cat=books" className="section-more">All →</Link>
          </div>
          <Carousel items={books} id="books-carousel" width="150px" />
          <CarouselNav id="books-carousel" />
        </div>
      </section>

      <div className="divider"></div>

      {/* NEWSLETTER */}
      <section className="section">
        <div className="container">
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--rxl)', padding: '48px 32px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }} className="reveal">
            <div className="ai-badge" style={{ marginBottom: '16px' }}>✦ Weekly Digest</div>
            <h2 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, letterSpacing: '-.04em', marginBottom: '12px' }}>Never Miss What&apos;s Next</h2>
            <p style={{ fontSize: '15px', color: 'var(--t2)', maxWidth: '380px', margin: '0 auto 28px', lineHeight: 1.6 }}>AI-curated weekly picks straight to your inbox. Every Sunday. No spam.</p>
            <form onSubmit={e => { e.preventDefault(); alert('✦ You\'re on the list!'); }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto 12px' }}>
                <input type="email" placeholder="your@email.com" autoComplete="email" required style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '99px', padding: '13px 20px', fontSize: '15px', fontFamily: 'var(--font)', color: 'var(--t1)', outline: 'none' }} />
                <button type="submit" className="btn-gold" style={{ padding: '13px 24px', justifyContent: 'center' }}>Subscribe →</button>
              </div>
            </form>
            <p style={{ fontSize: '12px', color: 'var(--t3)' }}>Join the list. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
