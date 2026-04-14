import { useState } from 'react';
import SEO from '../components/SEO';
import * as Items from '../lib/items';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function DiscoverPage() {
  const [vibe, setVibe] = useState(50);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const vibeLabels = ['Chill & Casual', 'Classic & Timeless', 'Fresh & Modern', 'Bold & Experimental', 'Mind-Blowing'];
  const vibeLabel = vibeLabels[Math.min(Math.floor(vibe / 20), 4)];

  async function discover() {
    setLoading(true);
    try {
      const r = await Items.getTrending(12);
      setResults(r);
    } catch { setResults([]); }
    setLoading(false);
  }

  return (
    <Layout activePage="discover">
      <SEO title="Discover — NovaHub" description="Let our AI recommend something based on your vibe." />
      <div style={{ textAlign: 'center', padding: 'calc(var(--nav)+60px) 20px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(201,168,76,.12) 0%,transparent 60%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)', borderRadius: '99px', padding: '5px 14px', fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '16px' }}>✦ AI-Powered</div>
          <h1 style={{ fontSize: 'clamp(32px,7vw,56px)', fontWeight: 900, letterSpacing: '-.05em', marginBottom: '10px' }}>Set Your Vibe</h1>
          <p style={{ fontSize: '16px', color: 'var(--t2)', maxWidth: '460px', margin: '0 auto 32px' }}>Drag the slider to tell us your mood, and we&apos;ll find something perfect.</p>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gold)', marginBottom: '16px' }}>{vibeLabel}</div>
            <input type="range" min="0" max="100" value={vibe} onChange={e => setVibe(+e.target.value)} style={{ width: '100%', accentColor: 'var(--gold)', marginBottom: '24px' }} />
            <button className="btn-gold" onClick={discover} disabled={loading} style={{ fontSize: '16px', padding: '16px 36px' }}>
              {loading ? 'Discovering…' : 'Discover ✦'}
            </button>
          </div>
        </div>
      </div>
      {results.length > 0 && (
        <div className="container" style={{ paddingBottom: '80px' }}>
          <div className="section-header reveal"><div><div className="section-label">Your Vibe</div><h2 className="section-title">Results</h2></div></div>
          <div className={`${results.some(i => ['movie','book','game'].includes(i.type)) ? 'grid-4' : 'grid-3'} stagger`}>
            {results.map(item => (
              <div className="reveal-scale" key={item.id}>
                <Link href={`/item/${encodeURIComponent(item.slug)}`} className="card-poster" style={{ display: 'block' }}>
                  <div className="bg-zoom" style={{ backgroundImage: `url('${item.image || ''}')` }}></div>
                  <div className="card-poster-content">
                    <div className="card-poster-title">{item.name}</div>
                    {item.rating && <div className="card-poster-rating">★ {item.rating}</div>}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
