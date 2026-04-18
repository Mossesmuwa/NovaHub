// pages/weekly.js
import { useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Link from 'next/link';
import useScrollReveal from '../hooks/useScrollReveal';

const DIGEST = {
  issue: 42,
  date: 'April 18, 2026',
  items: [
    { icon: '🤖', category: 'AI', title: 'The model that broke every benchmark', desc: "A new multimodal AI dropped this week and we ran it through our full test suite. The results on code generation alone are worth your attention.", tag: 'Big deal' },
    { icon: '🍿', category: 'Movies', title: 'The quiet masterpiece nobody saw coming', desc: 'A small-budget sci-fi film earned a 97% on Rotten Tomatoes this week with essentially no marketing. Stream it before it disappears.', tag: 'Watch this' },
    { icon: '⚡', category: 'Tools', title: 'The Notion killer is actually real this time', desc: "Three weeks of daily use later — this new productivity tool genuinely does things Notion can't. We added it to NovaHub's top productivity picks.", tag: 'New on NovaHub' },
    { icon: '📚', category: 'Books', title: 'The book founders are quietly passing around', desc: 'Not published. Not on Amazon. A 90-page PDF circulating in startup circles about decision-making under uncertainty. We found a copy.', tag: 'Under the radar' },
    { icon: '🔐', category: 'Security', title: 'Critical vulnerability you should know about', desc: 'A zero-day affecting millions of users was disclosed. Here is what it means, who is affected, and what to do before the patch arrives.', tag: 'Important' },
  ],
};

const PREV_ISSUES = [
  { num: 41, date: 'Apr 11', title: 'The week AI learned to reason' },
  { num: 40, date: 'Apr 4',  title: 'Best game drops of Q1 2026' },
  { num: 39, date: 'Mar 28', title: 'Tools that actually saved us time' },
  { num: 38, date: 'Mar 21', title: 'The cybersec tools you missed' },
];

const TAG_COLORS = {
  'Big deal':       '#7F77DD',
  'Watch this':     '#E8593C',
  'New on NovaHub': '#1D9E75',
  'Under the radar':'#BA7517',
  'Important':      '#FF453A',
};

export default function WeeklyPage() {
  const [email,     setEmail]     = useState('');
  const [subState,  setSubState]  = useState('idle'); // idle | loading | done | error
  useScrollReveal();

  async function subscribe(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubState('loading');
    try {
      // Replace with your Beehiiv embed URL or API call
      await new Promise(r => setTimeout(r, 800)); // placeholder
      setSubState('done');
    } catch {
      setSubState('error');
    }
  }

  return (
    <Layout activePage="weekly">
      <SEO title="The Weekly Digest — NovaHub" description="AI-curated weekly digest of the best tools, movies, books, and games." />

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        .digest-item-card { background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); padding:20px; transition:all var(--ease); }
        .digest-item-card:hover { border-color:var(--border2); transform:translateY(-2px); box-shadow:0 12px 40px rgba(0,0,0,.2); }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)', padding: 'calc(var(--nav) + 48px) 0 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 0% 50%,rgba(201,168,76,.07) 0%,transparent 60%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)', borderRadius: 99, padding: '5px 14px', fontSize: 11, fontWeight: 800, color: 'var(--gold)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 20 }}>
            ✦ AI Curated · Issue #{DIGEST.issue}
          </div>
          <h1 style={{ fontSize: 'clamp(28px,6vw,52px)', fontWeight: 900, letterSpacing: '-.04em', marginBottom: 10 }}>
            The Weekly Digest
          </h1>
          <p style={{ fontSize: 16, color: 'var(--t2)', maxWidth: 520, lineHeight: 1.6 }}>
            5 things worth your attention this week — picked by our AI, reviewed by humans, delivered every Sunday.
          </p>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 14 }}>{DIGEST.date}</div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80, paddingTop: 40 }}>
        <div className="weekly-grid">

          {/* ── MAIN DIGEST ── */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {DIGEST.items.map((item, i) => {
                const tagColor = TAG_COLORS[item.tag] || 'var(--gold)';
                return (
                  <div
                    className="digest-item-card reveal"
                    key={i}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: '1px solid var(--border)' }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                            {item.category}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: tagColor + '18', color: tagColor }}>
                            {item.tag}
                          </span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 8, lineHeight: 1.3 }}>
                          {item.title}
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.65, margin: 0 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 32, padding: '20px', background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)', borderRadius: 'var(--r)', fontSize: 14, color: 'var(--t2)', lineHeight: 1.7 }}>
              <span style={{ fontWeight: 700, color: 'var(--gold)' }}>That&apos;s this week&apos;s digest.</span> Subscribe below to get it in your inbox every Sunday morning — free, no spam, unsubscribe anytime.
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="sidebar">

            {/* Subscribe card */}
            <div className="subscribe-card">
              <h3>Never miss a digest</h3>
              <p>Get 5 curated picks delivered every Sunday. No spam, no filler.</p>
              {subState === 'done' ? (
                <div style={{ padding: '12px 16px', background: 'rgba(48,209,88,.1)', border: '1px solid rgba(48,209,88,.2)', borderRadius: 'var(--rsm)', fontSize: 14, color: '#30D158', fontWeight: 600 }}>
                  ✦ You&apos;re in! See you Sunday.
                </div>
              ) : (
                <form onSubmit={subscribe}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="sub-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={subState === 'loading'}>
                    {subState === 'loading' ? 'Subscribing…' : 'Subscribe ✦'}
                  </button>
                  {subState === 'error' && <div style={{ fontSize: 12, color: '#FF453A', marginTop: 8 }}>Something went wrong. Try again.</div>}
                </form>
              )}
            </div>

            {/* Previous issues */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '20px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Previous issues</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {PREV_ISSUES.map(p => (
                  <div key={p.num} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>#{p.num} — {p.title}</div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--t3)', flexShrink: 0, marginLeft: 12 }}>{p.date}</span>
                  </div>
                ))}
                <div style={{ paddingTop: 12 }}>
                  <a href="#" style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>View archive →</a>
                </div>
              </div>
            </div>

            {/* Browse CTA */}
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>✦</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Find everything mentioned</div>
              <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 16 }}>Every tool, book, and movie from this digest is on NovaHub.</div>
              <Link href="/search" className="btn-secondary" style={{ fontSize: 13, width: '100%', justifyContent: 'center' }}>Search NovaHub</Link>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
