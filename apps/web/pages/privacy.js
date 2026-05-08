// pages/privacy.js
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Link from 'next/link';

const SECTIONS = [
  {
    title: 'Information we collect',
    icon: '◈',
    content: [
      { strong: 'Account info', text: '— Name, email, and profile picture when you register.' },
      { strong: 'Usage data', text: '— Browser type, IP address, and pages visited (anonymised).' },
      { strong: 'Taste preferences', text: '— Your onboarding quiz results, stored locally until you sign up.' },
    ],
  },
  {
    title: 'How we use your data',
    icon: '◎',
    content: [
      { text: 'Personalise the content you see on NovaHub based on your taste profile.' },
      { text: 'Provide, maintain, and improve our services.' },
      { text: 'Understand how people use NovaHub so we can build better features.' },
      { text: 'Send the Weekly Digest (only if you subscribe).' },
    ],
  },
  {
    title: 'Authentication and security',
    icon: '◉',
    body: 'Authentication is powered by Supabase with industry-standard encryption and JWT tokens. We never store your password — it\'s hashed and managed by Supabase Auth. All data is encrypted in transit via HTTPS.',
  },
  {
    title: 'Cookies and local storage',
    icon: '◫',
    body: 'We use localStorage to persist your theme preference and taste profile only. Authentication sessions are managed entirely by Supabase using secure cookies. You can clear these at any time in your browser settings.',
  },
  {
    title: 'Changes to this policy',
    icon: '◐',
    body: "We may update this policy as the platform grows. We'll post the updated policy here and revise the date below. Major changes will be communicated via the Weekly Digest.",
  },
];

export default function PrivacyPage() {
  return (
    <Layout>
      <SEO title="Privacy Policy — NovaHub" />
      <StaticPage
        badge="Privacy"
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your data."
        sections={SECTIONS}
        date="April 2026"
        other={{ label: 'Terms of Service', href: '/terms' }}
      />
    </Layout>
  );
}

// Shared static page layout — used by both privacy.js and terms.js
export function StaticPage({ badge, title, subtitle, sections, date, other }) {
  return (
    <>
      {/* Hero */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: 'calc(var(--nav) + 48px) 0 40px', background: 'var(--bg2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 100% 0%,rgba(201,168,76,.06) 0%,transparent 60%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)', borderRadius: 99, padding: '5px 14px', fontSize: 11, fontWeight: 800, color: 'var(--gold)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 20 }}>
            ◈ {badge}
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, letterSpacing: '-.04em', marginBottom: 10 }}>{title}</h1>
          <p style={{ fontSize: 16, color: 'var(--t2)', maxWidth: 480 }}>{subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {sections.map((s, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 32, marginBottom: 32, display: 'flex', gap: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gold-glow)', border: '1px solid var(--gold-glow2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--gold)', flexShrink: 0, marginTop: 2 }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14, letterSpacing: '-.02em' }}>{i + 1}. {s.title}</h2>
                  {s.body && <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.75, margin: 0 }}>{s.body}</p>}
                  {s.content && (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {s.content.map((c, j) => (
                        <li key={j} style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.65, display: 'flex', gap: 8 }}>
                          <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }}>·</span>
                          <span>
                            {c.strong && <strong style={{ color: 'var(--t1)', fontWeight: 700 }}>{c.strong}</strong>}
                            {c.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 700 }}>Last updated: {date}</span>
            {other && (
              <Link href={other.href} style={{ fontSize: 13, color: 'var(--t3)', textDecoration: 'none', transition: 'color var(--ease)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
              >
                {other.label} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
