import Layout from '../components/Layout';
import SEO from '../components/SEO';

export default function WeeklyPage() {
  return (
    <Layout activePage="weekly">
      <SEO title="The Weekly Digest — NovaHub" description="AI-curated weekly digest of the best tools, movies, books, and games." />
      <div className="container" style={{ paddingTop: 'calc(var(--nav) + 40px)' }}>
        <div className="hero-weekly">
          <div className="weekly-badge">✦ AI Curated</div>
          <h1 className="weekly-title">The Weekly Digest</h1>
          <p className="weekly-sub">The absolute best tools, reads, and entertainment from the past 7 days, summarized by our AI.</p>
        </div>
        <div className="weekly-grid">
          <div className="weekly-main-card">
            <div className="digest-date">Issue #42 — This Week in Review</div>
            <h2 className="digest-header">Top Breakthroughs &amp; Finds</h2>
            {[
              { icon: '🤖', title: 'ChatGPT 5 Sneak Peek', desc: 'A leak dropped highlighting insane multimodality improvements. We broke down the 3 ways it will change dev workflows.', cta: 'Read AI Breakdown →' },
              { icon: '🍿', title: 'Dune: Part Two — The Visual Masterpiece', desc: "It's finally here and it does not disappoint. The cinematography alone makes it a must-watch in IMAX. Currently trending at #1.", cta: 'View Item →' },
              { icon: '⚡', title: 'Supabase Vector reaches GA', desc: 'Store your AI embeddings natively in Postgres with high performance. We tested it against Pinecone and the results are surprising.', cta: 'View Tool →' },
              { icon: '📚', title: '"Read Write Own" by Chris Dixon', desc: 'A compelling new philosophical take on the future of the internet. A highly recommended weekend read for founders.', cta: 'View Book →' },
            ].map((d, i) => (
              <div className="digest-item" key={i}>
                <div className="digest-icon">{d.icon}</div>
                <div className="digest-body"><h3>{d.title}</h3><p>{d.desc}</p><a href="#" className="digest-meta">{d.cta}</a></div>
              </div>
            ))}
          </div>
          <div className="sidebar">
            <div className="subscribe-card">
              <h3>Never Miss a Beat</h3>
              <p>Get this AI-curated digest delivered to your inbox every Sunday morning. No spam.</p>
              <form onSubmit={e => { e.preventDefault(); alert('Subscribed!'); }}>
                <input type="email" placeholder="Enter your email" className="sub-input" required />
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Subscribe ✦</button>
              </form>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Previous Issues</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#" style={{ fontSize: '14px', color: 'var(--t2)', display: 'flex', justifyContent: 'space-between' }}>Issue #41 <span>Mar 24</span></a>
                <a href="#" style={{ fontSize: '14px', color: 'var(--t2)', display: 'flex', justifyContent: 'space-between' }}>Issue #40 <span>Mar 17</span></a>
                <a href="#" style={{ fontSize: '14px', color: 'var(--t2)', display: 'flex', justifyContent: 'space-between' }}>Issue #39 <span>Mar 10</span></a>
                <a href="#" style={{ fontSize: '14px', color: 'var(--gold)', fontWeight: 600, marginTop: '8px' }}>Archive →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
