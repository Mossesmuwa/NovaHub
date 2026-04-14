import { useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import useScrollReveal from '../hooks/useScrollReveal';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const POSTS = [
  { id:'1', slug:'best-ai-tools-2026', title:'The 10 Best AI Tools You Actually Need in 2026', category:'AI', author:'NovaHub Team', date:'Mar 28, 2026', readTime:6, excerpt:'AI is moving faster than ever. Here is a no-fluff breakdown of the tools genuinely worth your time this year — from writing to coding to image generation.', image:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=480&fit=crop&q=80', featured:true },
  { id:'2', slug:'getting-started-cybersecurity-2026', title:'Getting Started in Cyber Security: A Realistic 2026 Roadmap', category:'Security', author:'NovaHub Team', date:'Mar 22, 2026', readTime:9, excerpt:'You want a career in cyber security but don\'t know where to start. This is the honest, no-hype roadmap from beginner to first job — including free resources.', image:'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=480&fit=crop&q=80' },
  { id:'3', slug:'films-you-missed-2024', title:'12 Films From 2024 That Deserve More Attention', category:'Movies', author:'NovaHub Team', date:'Mar 18, 2026', readTime:5, excerpt:'Beyond Dune and Oppenheimer, 2024 had a remarkable set of films that flew under the radar. Here are twelve that are absolutely worth your time.', image:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=480&fit=crop&q=80' },
  { id:'4', slug:'why-baldurs-gate-3-matters', title:"Why Baldur's Gate 3 Changed Gaming Forever", category:'Gaming', author:'NovaHub Team', date:'Mar 14, 2026', readTime:7, excerpt:"It isn't just a great RPG. Larian's masterpiece fundamentally shifted what players expect from storytelling, choice, and production quality in games.", image:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=480&fit=crop&q=80' },
  { id:'5', slug:'books-every-developer-should-read', title:'7 Books Every Developer Should Read Before 2027', category:'Books', author:'NovaHub Team', date:'Mar 10, 2026', readTime:4, excerpt:'Beyond the technical manuals, these seven books will change how you think about software, teams, and your career. Timeless reads for every level.', image:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=480&fit=crop&q=80' },
  { id:'6', slug:'kali-linux-beginners-guide', title:'Kali Linux for Beginners: What to Actually Install First', category:'Security', author:'NovaHub Team', date:'Mar 6, 2026', readTime:8, excerpt:'Kali ships with 600+ tools. You do not need most of them. Here is the focused starter kit for penetration testing beginners — and what to learn first.', image:'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=480&fit=crop&q=80' },
];

export default function BlogPage() {
  const [currentCat, setCurrentCat] = useState('all');
  const [nlEmail, setNlEmail] = useState('');
  useScrollReveal();

  const allCats = ['all', ...new Set(POSTS.map(p => p.category))];
  const posts = currentCat === 'all' ? POSTS : POSTS.filter(p => p.category === currentCat);
  const featured = POSTS.find(p => p.featured);
  const gridPosts = currentCat === 'all' ? posts.filter(p => !p.featured) : posts;

  async function subscribe(e) {
    e.preventDefault();
    if (!nlEmail || !nlEmail.includes('@')) return;
    if (supabase) { try { await supabase.from('subscribers').insert({ email: nlEmail }); } catch {} }
    alert('✦ You\'re subscribed! Welcome to NovaHub.');
    setNlEmail('');
  }

  return (
    <Layout activePage="blog">
      <SEO title="Blog — NovaHub" description="The NovaHub Blog — insights on AI, cyber security, tech, movies and more." />
      <div className="blog-hero"><div className="blog-hero-bg"></div><div className="blog-hero-grid"></div>
        <div className="container blog-hero-inner">
          <div className="blog-label">Editorial</div>
          <h1 className="blog-title">NovaHub Blog</h1>
          <p className="blog-sub">Insights on AI, cyber security, movies, games, and the best of the internet — curated by our team.</p>
        </div>
      </div>
      <div className="container" style={{ paddingBottom: 0 }}>
        {featured && (
          <div className="reveal">
            <Link href={`/blog/${featured.slug}`} className="blog-featured">
              <div className="blog-featured-img"><img src={featured.image} alt={featured.title} loading="eager" /></div>
              <div className="blog-featured-body">
                <div className="blog-featured-tag">Featured · {featured.category}</div>
                <div className="blog-featured-title">{featured.title}</div>
                <div className="blog-featured-exc">{featured.excerpt}</div>
                <div className="blog-featured-meta">By {featured.author} · {featured.date} · {featured.readTime} min read</div>
                <span className="btn-ghost" style={{ alignSelf: 'flex-start' }}>Read Article →</span>
              </div>
            </Link>
          </div>
        )}
        <div className="cat-filter">
          {allCats.map(c => (
            <button key={c} className={`cat-filter-btn${currentCat === c ? ' active' : ''}`} onClick={() => setCurrentCat(c)}>
              {c === 'all' ? 'All Posts' : c} ({c === 'all' ? POSTS.length : POSTS.filter(p => p.category === c).length})
            </button>
          ))}
        </div>
        <div className="blog-grid stagger">
          {gridPosts.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 24px', color: 'var(--t3)' }}><p style={{ fontSize: '14px' }}>No posts in this category yet.</p></div>
          ) : gridPosts.map(p => {
            const init = (p.author || 'N').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            return (
              <Link href={`/blog/${p.slug}`} className="blog-card reveal-scale" key={p.id}>
                <img className="blog-card-img" src={p.image} alt={p.title} loading="lazy" />
                <div className="blog-card-body">
                  <div className="blog-card-cat">{p.category}</div>
                  <div className="blog-card-title">{p.title}</div>
                  <div className="blog-card-exc">{p.excerpt}</div>
                  <div className="blog-card-foot">
                    <div className="blog-author-row"><div className="blog-avatar">{init}</div>{p.author}</div>
                    <span>{p.date} · {p.readTime}m</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="nl-section reveal">
          <div className="nl-section-bg"></div>
          <h2 className="nl-title" style={{ position: 'relative' }}>📬 Stay in the Loop</h2>
          <p className="nl-sub" style={{ position: 'relative' }}>Get the best of NovaHub delivered weekly — free, no spam.</p>
          <form className="nl-form" onSubmit={subscribe}>
            <input className="nl-input" type="email" placeholder="your@email.com" autoComplete="email" value={nlEmail} onChange={e => setNlEmail(e.target.value)} />
            <button type="submit" className="btn-gold" style={{ whiteSpace: 'nowrap', padding: '13px 24px' }}>Subscribe →</button>
          </form>
          <p className="nl-note">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </Layout>
  );
}
