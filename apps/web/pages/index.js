import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import {
  Search,
  TrendingUp,
  Sparkles,
  Zap,
  Target,
  Flame,
  ShieldCheck,
  Mail,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { colors } from "shared/lib/design";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const [emailInput, setEmailInput] = useState("");
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleEmailSignup = (e) => {
    e.preventDefault();
    setEmailSubscribed(true);
    setEmailInput("");
    setTimeout(() => setEmailSubscribed(false), 3000);
  };

  return (
    <>
      <Head>
        <title>Intelligence Platform | Decision Intelligence</title>
      </Head>

      <Navbar />

      <div
        style={{ background: colors.bg, minHeight: "100vh", color: colors.t1 }}
      >
        {/* Hero Section */}
        <section
          style={{
            padding: "120px 24px 80px",
            background: `radial-gradient(circle at top right, ${colors.gold}08, transparent), ${colors.bg}`,
            borderBottom: `1px solid ${colors.bg3}`,
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: `${colors.gold}10`,
                borderRadius: 100,
                color: colors.gold,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 24,
                border: `1px solid ${colors.gold}20`,
              }}
            >
              <Sparkles size={14} /> Intelligence for what matters
            </div>

            <h1
              style={{
                fontSize: "clamp(40px, 8vw, 80px)",
                fontWeight: 900,
                lineHeight: 1.1,
                margin: "0 0 24px 0",
                letterSpacing: "-0.04em",
              }}
            >
              Decide with <span style={{ color: colors.gold }}>Precision</span>
            </h1>

            <p
              style={{
                fontSize: "clamp(18px, 3vw, 22px)",
                color: colors.t2,
                maxWidth: 600,
                margin: "0 auto 40px",
                lineHeight: 1.6,
              }}
            >
              Ranked, explainable intelligence for tech leaders. Discover the
              tools and trends shaping the future.
            </p>

            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link href="/discover" passHref>
                <a
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 32px",
                    background: colors.gold,
                    color: "#000",
                    borderRadius: 12,
                    fontWeight: 800,
                    textDecoration: "none",
                    boxShadow: `0 8px 24px ${colors.gold}30`,
                  }}
                >
                  <Search size={18} strokeWidth={2.5} /> Explore Platform
                </a>
              </Link>
              <Link href="/trending" passHref>
                <a
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 32px",
                    background: colors.bg2,
                    color: colors.t1,
                    borderRadius: 12,
                    fontWeight: 800,
                    textDecoration: "none",
                    border: `1px solid ${colors.bg3}`,
                  }}
                >
                  View Trending <ArrowRight size={18} />
                </a>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section
          style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 40,
            }}
          >
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>
                Featured Insights
              </h2>
              <p style={{ color: colors.t3, margin: "8px 0 0" }}>
                The tools and tech analyzed by our engine
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {[
              { name: "Predictive Analysis", icon: Zap, score: 98 },
              { name: "Market Sentiment", icon: Target, score: 94 },
              { name: "Risk Assessment", icon: ShieldCheck, score: 91 },
              { name: "Velocity Track", icon: Flame, score: 89 },
            ].map((item, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredItem(`feat-${i}`)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  padding: 32,
                  background: colors.bg2,
                  borderRadius: 24,
                  border: `1px solid ${hoveredItem === `feat-${i}` ? colors.gold : colors.bg3}`,
                  transition: "all 0.3s ease",
                  transform:
                    hoveredItem === `feat-${i}` ? "translateY(-8px)" : "none",
                }}
              >
                <item.icon
                  size={32}
                  strokeWidth={1.5}
                  color={colors.gold}
                  style={{
                    marginBottom: 20,
                    filter: `drop-shadow(0 0 8px ${colors.gold}40)`,
                  }}
                />
                <h3 style={{ fontSize: 20, margin: "0 0 8px 0" }}>
                  {item.name}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: colors.t3,
                    lineHeight: 1.5,
                    marginBottom: 24,
                  }}
                >
                  Deep-dive intelligence report on current tech performance.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: colors.gold,
                  }}
                >
                  <BarChart3 size={14} /> Score: {item.score}/100
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section
          style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}
        >
          <div
            style={{
              padding: "64px",
              background: `linear-gradient(135deg, ${colors.bg3}, ${colors.bg})`,
              borderRadius: 32,
              border: `1px solid ${colors.bg3}`,
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Mail
              size={48}
              strokeWidth={1}
              color={colors.gold}
              style={{ opacity: 0.2, marginBottom: 24 }}
            />
            <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>
              Stay Ahead of the Curve
            </h2>
            <p
              style={{ color: colors.t2, maxWidth: 480, margin: "0 auto 32px" }}
            >
              Weekly intelligence briefs delivered to your inbox. No fluff, just
              data.
            </p>
            <form
              onSubmit={handleEmailSignup}
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="email"
                placeholder="Enter your work email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{
                  padding: "16px 24px",
                  borderRadius: 12,
                  background: colors.bg,
                  border: `1px solid ${colors.bg3}`,
                  color: colors.t1,
                  width: "100%",
                  maxWidth: 320,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "16px 32px",
                  background: colors.gold,
                  borderRadius: 12,
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Join 10k+ Decision Makers
              </button>
            </form>
            {emailSubscribed && (
              <p style={{ color: colors.gold, marginTop: 16, fontWeight: 700 }}>
                Welcome to the platform.
              </p>
            )}
          </div>
        </section>
      </div>

      <style jsx global>{`
        body {
          background: #000;
          margin: 0;
          font-family:
            "Inter",
            -apple-system,
            sans-serif;
        }
      `}</style>
    </>
  );
}

