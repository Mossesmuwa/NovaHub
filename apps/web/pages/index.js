// pages/index.js
// Premium homepage with hero, featured items, trending carousel
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { colors } from '../lib/design';
import Navbar from '../components/Navbar';

export default function HomePage({ featuredItems = [], trendingItems = [] }) {
  const [emailInput, setEmailInput] = useState('');
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    // TODO: Subscribe to newsletter
    setEmailSubscribed(true);
    setEmailInput('');
    setTimeout(() => setEmailSubscribed(false), 3000);
  };

  return (
    <>
      <Head>
        <title>Intelligence Platform | Decision Intelligence for Tech</title>
        <meta name="description" content="Ranked, explainable intelligence for decision-makers. Discover what's best, what's trending, and why it matters." />
        <meta property="og:title" content="Intelligence Platform" />
        <meta property="og:description" content="Decision intelligence for fast-moving tech markets" />
      </Head>

      <Navbar />

      <div style={{ background: colors.bg, minHeight: '100vh' }}>
        {/* Hero Section */}
        <section style={{
          padding: '80px 24px',
          background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg2} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${colors.bg3}`,
        }}>
          {/* Background elements */}
          <div
            style={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              background: `radial-gradient(circle, ${colors.gold}08, transparent)`,
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -50,
              left: -50,
              width: 300,
              height: 300,
              background: `radial-gradient(circle, ${colors.gold}08, transparent)`,
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Hero content */}
            <div style={{
              textAlign: 'center',
              marginBottom: 60,
            }}>
              <h1 style={{
                fontSize: 'clamp(32px, 8vw, 64px)',
                fontWeight: 900,
                margin: 0,
                marginBottom: 16,
                letterSpacing: '-0.02em',
                color: colors.t1,
                lineHeight: 1.1,
              }}>
                Intelligence for<br />
                <span style={{ color: colors.gold }}>What Matters</span>
              </h1>

              <p style={{
                fontSize: 'clamp(16px, 3vw, 20px)',
                color: colors.t2,
                margin: 0,
                marginBottom: 32,
                maxWidth: 600,
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.6,
              }}>
                Ranked, explainable decisions for fast-moving tech markets. Discover what's best, what's trending, and why it actually matters.
              </p>

              {/* CTA Buttons */}
              <div style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: 40,
              }}>
                <Link href="/discover">
                  <a style={{
                    padding: '14px 32px',
                    background: colors.gold,
                    color: '#000',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 15,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 12px 32px ${colors.gold}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    🔍 Explore Now
                  </a>
                </Link>

                <Link href="/trending">
                  <a style={{
                    padding: '14px 32px',
                    background: colors.bg3,
                    color: colors.t1,
                    border: `1px solid ${colors.bg4}`,
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 15,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.gold;
                      e.currentTarget.style.color = colors.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.bg4;
                      e.currentTarget.style.color = colors.t1;
                    }}
                  >
                    📈 What's Trending
                  </a>
                </Link>
              </div>

              {/* Social proof */}
              <div style={{
                fontSize: 13,
                color: colors.t3,
                display: 'flex',
                justifyContent: 'center',
                gap: 24,
                alignItems: 'center',
              }}>
                <span>⭐ Trusted by 10K+ makers</span>
                <span>•</span>
                <span>📊 1,000+ items ranked</span>
                <span>•</span>
                <span>✓ Daily updates</span>
              </div>
            </div>

            {/* Featured comparison card */}
            <div style={{
              padding: 24,
              background: colors.bg2,
              borderRadius: 16,
              border: `1px solid ${colors.bg3}`,
              maxWidth: 700,
              margin: '0 auto',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 28, marginBottom: 12, display: 'block' }}>⚔️</span>
              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, marginBottom: 8, color: colors.t1 }}>
                Compare Anything
              </h3>
              <p style={{ fontSize: 14, color: colors.t3, margin: 0, marginBottom: 16 }}>
                See how tools stack up side-by-side with complete data transparency
              </p>
              <Link href="/compare">
                <a style={{
                  color: colors.gold,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'inline-block',
                }}>
                  Try Comparisons →
                </a>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured items section */}
        <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{
              fontSize: 32,
              fontWeight: 900,
              margin: 0,
              marginBottom: 8,
              color: colors.t1,
            }}>
              🌟 Featured Today
            </h2>
            <p style={{ fontSize: 14, color: colors.t3, margin: 0 }}>
              Hand-picked tools making waves
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                onMouseEnter={() => setHoveredItem(`featured-${i}`)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  padding: 24,
                  background: hoveredItem === `featured-${i}` ? colors.bg3 : colors.bg2,
                  borderRadius: 16,
                  border: `1px solid ${hoveredItem === `featured-${i}` ? colors.gold + '40' : colors.bg3}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: hoveredItem === `featured-${i}` ? 'translateY(-8px)' : 'translateY(0)',
                }}
              >
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  background: colors.gold + '15',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {['🚀', '⚡', '🎯', '🔥'][i - 1]}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0, marginBottom: 8, color: colors.t1 }}>
                  Tool Name {i}
                </h3>
                <p style={{ fontSize: 13, color: colors.t3, margin: 0, marginBottom: 12 }}>
                  Short description of this amazing tool
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTop: `1px solid ${colors.bg3}`,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.gold }}>
                    ⭐ {88 + i}/100
                  </span>
                  <span style={{ fontSize: 12, color: colors.t3 }}>
                    {2 + i}K saves
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending section */}
        <section style={{
          padding: '80px 24px',
          background: colors.bg2,
          borderTop: `1px solid ${colors.bg3}`,
          borderBottom: `1px solid ${colors.bg3}`,
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{
                fontSize: 32,
                fontWeight: 900,
                margin: 0,
                marginBottom: 8,
                color: colors.t1,
              }}>
                📈 Trending This Week
              </h2>
              <p style={{ fontSize: 14, color: colors.t3, margin: 0 }}>
                What's gaining momentum
              </p>
            </div>

            {/* Trending carousel */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredItem(`trending-${i}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    padding: 16,
                    background: colors.bg,
                    borderRadius: 12,
                    border: `1px solid ${colors.bg3}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                  }}
                >
                  {/* Trending badge */}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    padding: '4px 8px',
                    background: colors.red,
                    color: '#fff',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 800,
                    animation: hoveredItem === `trending-${i}` ? 'bounce 0.6s ease' : 'none',
                  }}>
                    {500 + i * 10}% ↑
                  </div>

                  <div style={{ fontSize: 28, marginBottom: 8 }}>
                    {['🤖', '⚙️', '📱', '🔐', '🌍'][i - 1]}
                  </div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, margin: 0, marginBottom: 4, color: colors.t1 }}>
                    Trending Tool {i}
                  </h4>
                  <p style={{ fontSize: 11, color: colors.t3, margin: 0 }}>
                    +{2 + i}K stars this week
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter section */}
        <section style({ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            padding: 48,
            background: `linear-gradient(135deg, ${colors.gold}10, ${colors.gold}05)`,
            borderRadius: 20,
            border: `2px solid ${colors.gold}20`,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Background accent */}
            <div
              style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                background: `radial-gradient(circle, ${colors.gold}15, transparent)`,
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{
                fontSize: 32,
                fontWeight: 900,
                margin: 0,
                marginBottom: 12,
                color: colors.t1,
              }}>
                📬 Weekly Intelligence
              </h2>
              <p style={{
                fontSize: 16,
                color: colors.t2,
                margin: 0,
                marginBottom: 32,
                maxWidth: 600,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                Get hand-curated insights on what's trending, why it matters, and what to watch next
              </p>

              {/* Newsletter form */}
              <form onSubmit={handleEmailSignup} style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: 16,
              }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `1px solid ${colors.gold}40`,
                    background: colors.bg,
                    color: colors.t1,
                    fontSize: 14,
                    minWidth: 280,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.gold;
                    e.currentTarget.style.boxShadow = `0 0 12px ${colors.gold}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.gold + '40';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: colors.gold,
                    color: '#000',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 16px ${colors.gold}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Subscribe
                </button>
              </form>

              {emailSubscribed && (
                <div style={{
                  color: colors.green,
                  fontSize: 14,
                  fontWeight: 700,
                  animation: 'slideUp 0.3s ease',
                }}>
                  ✓ Thanks for subscribing!
                </div>
              )}

              <p style={{
                fontSize: 11,
                color: colors.t3,
                margin: 0,
              }}>
                🔒 No spam, unsubscribe anytime
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export async function getStaticProps() {
  // TODO: Fetch featured and trending items from database
  return {
    props: {
      featuredItems: [],
      trendingItems: [],
    },
    revalidate: 3600,
  };
}