import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import Card, { PosterCard, ToolCard } from '../../components/Card';
import useScrollReveal from '../../hooks/useScrollReveal';
import Link from 'next/link';
import * as Items from '../../lib/items';
import * as Favorites from '../../lib/favorites';
import * as Comments from '../../lib/comments';
import { getCategoryInfo } from '../../lib/helpers';

export default function ItemPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useScrollReveal();

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const data = await Items.getBySlug(slug);
      if (!data) { setNotFound(true); setLoading(false); return; }
      setItem(data);
      setLoading(false);
      const [rel, saved, cmts] = await Promise.all([
        Items.getRelated(data, 4),
        Favorites.isFavorited(data.id),
        Comments.getComments(data.id),
      ]);
      setRelated(rel);
      setIsSaved(saved);
      setComments(cmts);
    })();
  }, [slug]);

  async function toggleSave() {
    if (!item) return;
    if (isSaved) {
      await Favorites.removeFavorite(item.id);
      setIsSaved(false);
    } else {
      const result = await Favorites.addFavorite(item.id);
      if (result.success) setIsSaved(true);
    }
  }

  async function handlePostComment(e) {
    e.preventDefault();
    if (!item || !commentText.trim()) return;
    setPosting(true);
    const result = await Comments.postComment(item.id, commentText);
    setPosting(false);
    if (result.success) {
      setCommentText('');
      const updated = await Comments.getComments(item.id);
      setComments(updated);
    }
  }

  // Progress bar
  useEffect(() => {
    const onScroll = () => {
      const pb = document.getElementById('progress-bar');
      if (!pb) return;
      const doc = document.documentElement;
      const pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
      pb.style.width = Math.min(100, pct) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <Layout>
        <SEO title="Loading — NovaHub" />
        <div className="progress-bar" id="progress-bar"></div>
        <div style={{ textAlign: 'center', padding: '120px 24px', color: 'var(--t3)' }}>
          <div style={{ width: '36px', height: '36px', border: '2px solid var(--border2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          Loading…
        </div>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <SEO title="Item Not Found — NovaHub" />
        <div style={{ textAlign: 'center', padding: 'calc(var(--nav) + 80px) 24px 80px' }}>
          <div style={{ fontSize: '64px', opacity: .3, marginBottom: '20px' }}>🔍</div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-.04em' }}>Item Not Found</h1>
          <p style={{ color: 'var(--t2)', marginBottom: '28px', fontSize: '16px' }}>We couldn&apos;t find what you&apos;re looking for.</p>
          <Link href="/" className="btn-gold">← Back to NovaHub</Link>
        </div>
      </Layout>
    );
  }

  const cat = getCategoryInfo(item.category_id);
  const sub = item.director || item.author || item.developer || item.genre || '';
  const isFree = (item.pricing || '').toLowerCase().includes('free');

  let ctaBtn = null;
  if (item.type === 'movie' && item.watch_link) ctaBtn = <a href={item.watch_link} target="_blank" rel="noopener" className="btn-primary" style={{ fontSize: '15px', padding: '14px 28px' }}>▶ Watch Now</a>;
  else if (item.type === 'book' && item.buy_link) ctaBtn = <a href={item.buy_link} target="_blank" rel="noopener" className="btn-primary" style={{ fontSize: '15px', padding: '14px 28px' }}>🛒 Buy Now</a>;
  else if (item.type === 'game' && item.play_link) ctaBtn = <a href={item.play_link} target="_blank" rel="noopener" className="btn-primary" style={{ fontSize: '15px', padding: '14px 28px' }}>🎮 Play Now</a>;
  else if (item.affiliate_link) ctaBtn = <a href={item.affiliate_link} target="_blank" rel="noopener" className="btn-primary" style={{ fontSize: '15px', padding: '14px 28px' }}>Get →</a>;

  return (
    <Layout>
      <SEO title={`${item.name} — NovaHub`} description={item.short_desc || `${item.name} on NovaHub`} />
      <div className="progress-bar" id="progress-bar"></div>

      {/* HERO */}
      <div className="item-hero">
        <div className="item-hero-bg"></div>
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link><span className="breadcrumb-sep">›</span>
            <Link href={`/category?cat=${item.category_id}`}>{cat.icon} {cat.name}</Link><span className="breadcrumb-sep">›</span>
            <span>{item.name}</span>
          </div>
          <div className="item-layout">
            {item.image ? (
              <div className="item-cover"><img src={item.image} alt={item.name} loading="eager" /></div>
            ) : (
              <div className="item-cover-placeholder">{(item.name || '?').charAt(0)}</div>
            )}
            <div>
              <div className="item-type-label">{(item.type || '').toUpperCase()}</div>
              <h1 className="item-name">{item.name}</h1>
              <div className="item-meta">
                {item.rating && <><span className="item-rating">★ {item.rating}</span><span className="item-meta-sep">·</span></>}
                {item.year && <span>{item.year}</span>}
                {sub && <><span className="item-meta-sep">·</span><span>{sub}</span></>}
                {item.pricing && <><span className="item-meta-sep">·</span><span className={isFree ? 'tag-free' : 'tag-paid'}>{item.pricing}</span></>}
              </div>
              <p className="item-desc">{item.short_desc || ''}</p>
              <div className="item-actions">
                {ctaBtn}
                <button className={`save-hero-btn${isSaved ? ' saved' : ''}`} onClick={toggleSave}>{isSaved ? '♥ Saved' : '♡ Save'}</button>
                <Link href={`/category?cat=${item.category_id}`} className="btn-secondary">Browse {cat.name}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRAILER */}
      {item.trailer_url && (
        <div className="container">
          <div className="trailer-wrap reveal">
            <div className="trailer-label">🎬 Trailer / Preview</div>
            <iframe src={item.trailer_url} allowFullScreen allow="autoplay;encrypted-media;picture-in-picture"></iframe>
          </div>
        </div>
      )}

      {/* PROS / CONS */}
      {item.pros && item.pros.length > 0 && (
        <div className="container">
          <div className="pc-grid reveal">
            <div className="pc-card"><div className="pc-title">✅ Pros</div><ul className="pc-list">{item.pros.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
            <div className="pc-card"><div className="pc-title">❌ Cons</div><ul className="pc-list">{(item.cons || ['None noted']).map((c, i) => <li key={i}>{c}</li>)}</ul></div>
            <div className="pc-card"><div className="pc-title">🎯 Best For</div><p style={{ fontSize: '13.5px', color: 'var(--t2)', lineHeight: 1.65 }}>{item.best_for || `Everyone interested in ${cat.name}`}</p></div>
          </div>
        </div>
      )}

      {/* RELATED */}
      {related.length > 0 && (
        <div className="container">
          <div className="section" style={{ paddingTop: 0 }}>
            <div className="section-header"><div><div className="section-label">More Like This</div><h2 className="section-title">You Might Also Like</h2></div><Link href={`/category?cat=${item.category_id}`} className="section-more">See all →</Link></div>
            <div className="grid-4 stagger">
              {related.map(r => <div className="reveal-scale" key={r.id}><Card item={r} /></div>)}
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS */}
      <div className="container">
        <div className="comments-section">
          <div className="comments-title">💬 Comments ({comments.length})</div>
          <form onSubmit={handlePostComment} style={{ marginBottom: '24px' }}>
            <textarea className="comment-input" placeholder="Add a comment…" value={commentText} onChange={e => setCommentText(e.target.value)} rows={3} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '14px', fontSize: '14px', fontFamily: 'var(--font)', color: 'var(--t1)', resize: 'vertical', outline: 'none' }} />
            <button type="submit" className="btn-primary" disabled={posting} style={{ marginTop: '10px', fontSize: '13px', padding: '10px 20px' }}>{posting ? 'Posting…' : 'Post Comment'}</button>
          </form>
          {comments.length === 0 && <p style={{ color: 'var(--t3)', fontSize: '14px' }}>No comments yet. Be the first!</p>}
          {comments.map(c => (
            <div key={c.id} className="comment-card" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: 'var(--gold)' }}>{(c.author_name || '?').charAt(0).toUpperCase()}</div>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>{c.author_name}</span>
                <span style={{ fontSize: '12px', color: 'var(--t3)' }}>{Comments.timeAgo(c.created_at)}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--t2)', lineHeight: 1.6, margin: 0 }}>{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
