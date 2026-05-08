// pages/blog.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import useScrollReveal from '../hooks/useScrollReveal';
import Link from 'next/link';

const POSTS = [
  { id:'1', slug:'best-ai-tools-2026', title:'The 10 Best AI Tools You Actually Need in 2026', category:'AI', author:'NovaHub', date:'Apr 14, 2026', readTime:6, excerpt:'AI is moving faster than ever. A no-fluff breakdown of the tools genuinely worth your time this year — from writing to coding to image generation.', image:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=480&fit=crop&q=80', featured:true },
  { id:'2', slug:'getting-started-cybersecurity-2026', title:'Getting Started in Cyber Security: A 2026 Roadmap', category:'Security', author:'NovaHub', date:'Apr 7, 2026', readTime:9, excerpt:'The honest, no-hype roadmap from beginner to first job — including every free resource you need to get there.', image:'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=480&fit=crop&q=80' },
  { id:'3', slug:'films-you-missed-2024', title:'12 Films From 2024 That Deserve More Attention', category:'Movies', author:'NovaHub', date:'Mar 28, 2026', readTime:5, excerpt:"Beyond the blockbusters, 2024 had a remarkable set of films that flew under the radar. Here's twelve that are absolutely worth your time.", image:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=480&fit=crop&q=80' },
  { id:'4', slug:'why-baldurs-gate-3-matters', title:"Why Baldur's Gate 3 Changed Gaming Forever", category:'Games', author:'NovaHub', date:'Mar 21, 2026', readTime:7, excerpt:"It isn't just a great RPG. Larian's masterpiece fundamentally shifted what players expect from storytelling, choice, and production quality.", image:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=480&fit=crop&q=80' },
  { id:'5', slug:'books-every-developer-should-read', title:'7 Books Every Developer Should Read Before 2027', category:'Books', author:'NovaHub', date:'Mar 14, 2026', readTime:4, excerpt:'Beyond the technical manuals — these seven books will change how you think about software, teams, and your career.', image:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=480&fit=crop&q=80' },
  { id:'6', slug:'kali-linux-beginners-guide', title:'Kali Linux for Beginners: What to Actually Install First', category:'Security', author:'NovaHub', date:'Mar 7, 2026', readTime:8, excerpt:"Kali ships with 600+ tools. You don't need most of them. Here's the focused starter kit for beginners.", image:'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=480&fit=crop&q=80' },
];

const CAT_COLORS = {
  'AI': '#C9A84C', 'Security': '#1D9E75', 'Movies': '#E8593C',
  'Games': '#7F77DD', 'Books': '#3B8BD4',
};

export default function BlogPage() {
  const [currentCat, setCurrentCat] = useState('all');
  const [email,      setEmail]      = useState('');
  const [subDone,    setSubDone]    = useState(false);
  const [readPct,    setReadPct]    = useState(0);
  useScrollReveal();

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setReadPct(Math.min(100, pct));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const allCats   = ['all', ...new Set(POSTS.map(p => p.category))];
  const filtered  = currentCat === 'all' ? POSTS : POSTS.filter(p => p.category === currentCat);
  const featured  = POSTS.find(p => p.featured);
  const gridPosts = currentCat === 'all' ? filtered.filter(p => !p.featured) : filtered;

  async function subscribe(e) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubDone(true);
  }

  return (
    <Layout activePage="blog">
      <SEO title="Blog — NovaHub" description="Insights on AI, cyber security, movies, games, and the best of the internet." />

      {/* Reading progress bar */}
      <div style={{ position: 'fixed', top: 'var(--nav)', left: 0, right: 0, height: 2, zIndex: 999, background: 'var(--border)' }}>
        <div style={{ height: '100%', width: `${readPct}%`, background: 'var(--gold-grad)', transition: 'width .1s linear', borderRadius: '0 1px 1px 0' }} />
      </div>

      {/* ── HERO ── */}
      <div className="blog-hero">
        <div className="blog-hero-bg" />
        <div className="blog-hero-grid" />
        <div className="container blog-hero-inner">
          <div className="blog-label">Editorial · {POSTS.length} posts</div>
          <h1 className="blog-title">NovaHub Blog</h1>
          <p className="blog-sub">Insights on AI, cyber security, movies, games, and the best of the internet — curated by our team.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>

        {/* Featured */}
        {featured && currentCat === 'all' && (
          <div className="reveal" style={{ marginBottom: 32 }}>
            <Link href={`/blog/${featured.slug}`} className="blog-featured">
              <div className="blog-featured-img">
                <img src={featured.image} alt={featured.title} loading="eager" />
              </div>
              <div className="blog-featured-body">
                <div className="blog-featured-tag">
                  <span style={{ background: CAT_COLORS[featured.category] + '20', color: CAT_COLORS[featured.category], padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 800, marginRight: 8 }}>
                    {featured.category}
                  </span>
                  Featured
                </div>
                <div className="blog-featured-title">{featured.title}</div>
                <div className="blog-featured-exc">{featured.excerpt}</div>
                <div className="blog-featured-meta">
                  {featured.date} · {featured.readTime} min read
                </div>
                <span className="btn-ghost" style={{ alignSelf: 'flex-start', marginTop: 4 }}>Read Article →</span>
              </div>
            </Link>
          </div>
        )}

        {/* Category filter */}
        <div className="cat-filter">
          {allCats.map(c => (
            <button
              key={c}
              className={`cat-filter-btn${currentCat === c ? ' active' : ''}`}
              onClick={() => setCurrentCat(c)}
            >
              {c === 'all' ? 'All Posts' : c}
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.6 }}>
                ({c === 'all' ? POSTS.length : POSTS.filter(p => p.category === c).length})
              </span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="blog-grid stagger">
          {gridPosts.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: 'var(--t3)' }}>
              No posts in this category yet.
            </div>
          ) : gridPosts.map(p => {
            const catColor = CAT_COLORS[p.category];
            return (
              <Link href={`/blog/${p.slug}`} className="blog-card reveal-scale" key={p.id}>
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img className="blog-card-img" src={p.image} alt={p.title} loading="lazy" />
                  {catColor && (
                    <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', borderRadius: 99, background: catColor + 'cc', fontSize: 10, fontWeight: 800, color: '#fff' }}>
                      {p.category}
                    </div>
                  )}
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-title">{p.title}</div>
                  <div className="blog-card-exc">{p.excerpt}</div>
                  <div className="blog-card-foot">
                    <div className="blog-author-row">
                      <div className="blog-avatar">N</div>
                      {p.author}
                    </div>
                    <span>{p.date} · {p.readTime}m</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Newsletter */}
        <div className="nl-section reveal" style={{ marginTop: 48 }}>
          <div className="nl-section-bg" />
          <h2 className="nl-title" style={{ position: 'relative' }}>📬 Stay in the Loop</h2>
          <p className="nl-sub" style={{ position: 'relative' }}>Get the best of NovaHub delivered weekly — free, no spam.</p>
          {subDone ? (
            <div style={{ position: 'relative', padding: '14px 24px', background: 'rgba(48,209,88,.1)', border: '1px solid rgba(48,209,88,.25)', borderRadius: 'var(--rsm)', fontSize: 15, color: '#30D158', fontWeight: 700 }}>
              ✦ You&apos;re subscribed! See you Sunday.
            </div>
          ) : (
            <form className="nl-form" onSubmit={subscribe}>
              <input className="nl-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" className="btn-gold" style={{ whiteSpace: 'nowrap', padding: '13px 24px' }}>Subscribe →</button>
            </form>
          )}
          <p className="nl-note">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </Layout>
  );
}
