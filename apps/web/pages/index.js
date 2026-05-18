// pages/index.js - Nova Intelligence Layer Homepage
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Link from "next/link";
import * as Items from "shared/lib/items";
import { useSupabase } from "shared/lib/SupabaseContext";

const G = {
  bg: "#09090C",
  bg2: "#0F0F14",
  bg3: "#16161E",
  bg4: "#1C1C26",
  gold: "#C9A84C",
  goldL: "#E8C97A",
  border: "rgba(255,255,255,0.06)",
  borderG: "rgba(201,168,76,0.20)",
  t1: "#F2F2F7",
  t2: "#AEAEB2",
  t3: "#636366",
  green: "#30D158",
  red: "#FF453A",
  orange: "#FF9F0A",
  blue: "#0A84FF",
};

// SVG Icons (NO EMOJIS)
const Icon = {
  trending: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  compare: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  sparkle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  ),
  chart: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  shield: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  arrow: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

// Stat Counter Component
function StatCounter({ value, label, suffix = "", delay = 0 }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1200;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [visible, value]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    const element = document.getElementById(`stat-${label}`);
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, [delay, label]);

  return (
    <div id={`stat-${label}`} style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: 48,
          fontWeight: 900,
          color: G.gold,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.04em",
          marginBottom: 8,
        }}
      >
        {count.toLocaleString()}
        {suffix}
      </div>
      <div
        style={{
          fontSize: 12,
          color: G.t3,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// Nova Score Badge
function NovaScoreBadge({ score, breakdown, size = "default" }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const sz =
    size === "large" ? { badge: 80, text: 32 } : { badge: 48, text: 18 };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        onClick={() => setShowBreakdown(!showBreakdown)}
        style={{
          width: sz.badge,
          height: sz.badge,
          borderRadius: "50%",
          background: `conic-gradient(${G.gold} ${score * 3.6}deg, ${G.bg3} 0deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: breakdown ? "pointer" : "default",
          position: "relative",
        }}
      >
        <div
          style={{
            width: sz.badge - 8,
            height: sz.badge - 8,
            borderRadius: "50%",
            background: G.bg2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: sz.text,
            fontWeight: 900,
            color: G.gold,
          }}
        >
          {score}
        </div>
      </div>

      {showBreakdown && breakdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: 12,
            padding: 12,
            background: G.bg2,
            border: `1px solid ${G.border}`,
            borderRadius: 8,
            minWidth: 200,
            zIndex: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: G.t3,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Score Breakdown
          </div>
          {Object.entries(breakdown).map(([key, val]) => (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              <span style={{ color: G.t2 }}>{key}:</span>
              <span style={{ color: G.gold, fontWeight: 700 }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Trending Item Card
function TrendingCard({ item, rank }) {
  const trendingPercent = item.trending_score || 0;
  const isRising = trendingPercent > 0;

  return (
    <Link
      href={`/item/${item.slug}`}
      style={{
        display: "block",
        padding: 16,
        background: G.bg2,
        border: `1px solid ${rank <= 3 ? G.borderG : G.border}`,
        borderRadius: 12,
        textDecoration: "none",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = G.gold;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = rank <= 3 ? G.borderG : G.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Rank Badge */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: rank <= 3 ? G.gold : G.bg3,
          color: rank <= 3 ? "#000" : G.t2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 900,
          zIndex: 2,
        }}
      >
        {rank}
      </div>

      <div style={{ display: "flex", gap: 16, marginLeft: 48 }}>
        {/* Image */}
        {item.image && (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              backgroundImage: `url(${item.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              flexShrink: 0,
            }}
          />
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: G.t1,
              marginBottom: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.name}
          </div>
          <div
            style={{
              fontSize: 13,
              color: G.t2,
              marginBottom: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {item.short_desc || "No description available"}
          </div>

          {/* Metrics */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <NovaScoreBadge score={item.rating || 85} size="small" />

            {isRising && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  background: G.green + "15",
                  borderRadius: 6,
                  fontSize: 11,
                  color: G.green,
                  fontWeight: 700,
                }}
              >
                <Icon.trending />+{trendingPercent}%
              </div>
            )}

            {item.save_count > 0 && (
              <div style={{ fontSize: 11, color: G.t3 }}>
                {item.save_count} saves
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Compare Preview Card
function ComparePreviewCard({ item1, item2 }) {
  return (
    <Link
      href={`/compare?items=${item1.slug},${item2.slug}`}
      style={{
        display: "block",
        padding: 20,
        background: G.bg2,
        border: `1px solid ${G.border}`,
        borderRadius: 12,
        textDecoration: "none",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = G.gold;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = G.border;
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ color: G.gold }}>
          <Icon.compare />
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: G.t1 }}>
          Popular Comparison
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* Item 1 */}
        <div style={{ textAlign: "center" }}>
          {item1.image && (
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                backgroundImage: `url(${item1.image})`,
                backgroundSize: "cover",
                margin: "0 auto 8px",
              }}
            />
          )}
          <div style={{ fontSize: 13, fontWeight: 700, color: G.t1 }}>
            {item1.name}
          </div>
        </div>

        {/* VS */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: G.t3,
            padding: "4px 8px",
            background: G.bg3,
            borderRadius: 6,
          }}
        >
          VS
        </div>

        {/* Item 2 */}
        <div style={{ textAlign: "center" }}>
          {item2.image && (
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                backgroundImage: `url(${item2.image})`,
                backgroundSize: "cover",
                margin: "0 auto 8px",
              }}
            />
          )}
          <div style={{ fontSize: 13, fontWeight: 700, color: G.t1 }}>
            {item2.name}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          textAlign: "center",
          fontSize: 12,
          color: G.gold,
        }}
      >
        View Comparison <Icon.arrow />
      </div>
    </Link>
  );
}

export default function Home({
  stats,
  trendingItems,
  recentItems,
  compareExamples,
}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  async function handleSubscribe(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Layout>
      <SEO
        title="Nova - Intelligence Layer for Tech & Culture"
        description="Real-time intelligence on trending tools, products, and content. Compare, analyze, and stay ahead with Nova's AI-powered insights."
      />

      {/* HERO SECTION */}
      <section
        style={{
          padding: "80px 24px 60px",
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${G.gold}08 0%, transparent 60%)`,
          borderBottom: `1px solid ${G.border}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              background: G.gold + "15",
              border: `1px solid ${G.borderG}`,
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 800,
              color: G.gold,
              marginBottom: 24,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <Icon.sparkle />
            Intelligence Platform
          </div>

          {/* Main Heading */}
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: 24,
              background: `linear-gradient(135deg, ${G.t1} 0%, ${G.goldL} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Track What's Next in Tech
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: G.t2,
              maxWidth: 680,
              margin: "0 auto 40px",
              lineHeight: 1.6,
            }}
          >
            Real-time intelligence on AI tools, SaaS products, and emerging
            tech. Compare features, track momentum, make informed decisions.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/trending"
              style={{
                padding: "14px 28px",
                background: G.gold,
                color: "#000",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <Icon.trending />
              See What's Trending
            </Link>

            <Link
              href="/compare"
              style={{
                padding: "14px 28px",
                background: "transparent",
                color: G.t1,
                border: `1px solid ${G.border}`,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = G.gold;
                e.currentTarget.style.background = G.gold + "10";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = G.border;
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon.compare />
              Compare Tools
            </Link>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 32,
              maxWidth: 600,
              margin: "60px auto 0",
              padding: "32px 0",
              borderTop: `1px solid ${G.border}`,
            }}
          >
            <StatCounter
              value={stats.totalItems}
              label="Tools Tracked"
              delay={0}
            />
            <StatCounter
              value={stats.totalUpdates}
              label="Updates Today"
              delay={200}
            />
            <StatCounter
              value={stats.totalTrending}
              label="Trending Now"
              delay={400}
            />
          </div>
        </div>
      </section>

      {/* TRENDING SECTION */}
      <section
        style={{ padding: "60px 24px", borderBottom: `1px solid ${G.border}` }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 800,
                color: G.gold,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              <Icon.trending />
              Trending
            </div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Rising This Week
            </h2>
            <p style={{ fontSize: 15, color: G.t2 }}>
              Fastest-growing tools based on GitHub stars, Product Hunt votes,
              and community saves
            </p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {trendingItems.map((item, i) => (
              <TrendingCard key={item.id} item={item} rank={i + 1} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link
              href="/trending"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "12px 24px",
                border: `1px solid ${G.border}`,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                color: G.t1,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = G.gold;
                e.currentTarget.style.color = G.gold;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = G.border;
                e.currentTarget.style.color = G.t1;
              }}
            >
              View All Trending Tools <Icon.arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* COMPARE ENGINE PREVIEW */}
      <section
        style={{
          padding: "60px 24px",
          background: G.bg2,
          borderBottom: `1px solid ${G.border}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 800,
                color: G.gold,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              <Icon.compare />
              Compare
            </div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Side-by-Side Analysis
            </h2>
            <p style={{ fontSize: 15, color: G.t2 }}>
              Make informed decisions with detailed feature comparisons
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {compareExamples.map((example, i) => (
              <ComparePreviewCard
                key={i}
                item1={example[0]}
                item2={example[1]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* RECENTLY ADDED */}
      <section
        style={{ padding: "60px 24px", borderBottom: `1px solid ${G.border}` }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 800,
                color: G.gold,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              <Icon.sparkle />
              New
            </div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Recently Added
            </h2>
            <p style={{ fontSize: 15, color: G.t2 }}>
              Latest tools and products tracked by Nova
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {recentItems.map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.slug}`}
                style={{
                  display: "block",
                  padding: 16,
                  background: G.bg2,
                  border: `1px solid ${G.border}`,
                  borderRadius: 12,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = G.gold;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = G.border;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {item.image && (
                  <div
                    style={{
                      width: "100%",
                      height: 140,
                      borderRadius: 8,
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      marginBottom: 12,
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: G.t1,
                    marginBottom: 6,
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: G.t2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {item.short_desc}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER CTA */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              padding: "40px 32px",
              background: G.bg2,
              border: `1px solid ${G.border}`,
              borderRadius: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse 60% 80% at 50% -20%, ${G.gold}10 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: G.gold + "15",
                border: `1px solid ${G.borderG}`,
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 800,
                color: G.gold,
                marginBottom: 20,
                textTransform: "uppercase",
              }}
            >
              <Icon.sparkle />
              Weekly Intelligence Report
            </div>

            <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
              Never Miss What's Trending
            </h3>
            <p style={{ fontSize: 15, color: G.t2, marginBottom: 28 }}>
              Get the top 10 tools, products, and insights delivered every
              Monday. Zero spam, always useful.
            </p>

            {subscribed ? (
              <div
                style={{
                  padding: "14px 24px",
                  background: G.green + "15",
                  border: `1px solid ${G.green}40`,
                  borderRadius: 10,
                  color: G.green,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                You're subscribed! Check your inbox.
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                style={{
                  display: "flex",
                  gap: 8,
                  maxWidth: 400,
                  margin: "0 auto",
                }}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: "14px 18px",
                    background: G.bg3,
                    border: `1px solid ${G.border}`,
                    borderRadius: 10,
                    color: G.t1,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "14px 24px",
                    background: G.gold,
                    color: "#000",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    // Get trending items (AI Tools category)
    const trending = await Items.getItems({
      category: "ai-tools",
      limit: 10,
      orderBy: "trending_score",
    });

    // Get recent items
    const recent = await Items.getItems({
      category: "ai-tools",
      limit: 12,
      orderBy: "created_at",
    });

    // Get compare examples (manually selected popular comparisons)
    const compareItems = await Items.getItems({
      category: "ai-tools",
      limit: 6,
    });

    const compareExamples = [];
    for (let i = 0; i < compareItems.length - 1; i += 2) {
      compareExamples.push([compareItems[i], compareItems[i + 1]]);
    }

    // Get stats
    const { supabaseAdmin } = await import("shared/lib/supabaseAdmin");
    const [itemsCount, todayCount, trendingCount] = await Promise.all([
      supabaseAdmin.from("items").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("items")
        .select("id", { count: "exact", head: true })
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ),
      supabaseAdmin
        .from("items")
        .select("id", { count: "exact", head: true })
        .eq("trending", true),
    ]);

    return {
      props: {
        stats: {
          totalItems: itemsCount.count || 0,
          totalUpdates: todayCount.count || 0,
          totalTrending: trendingCount.count || 0,
        },
        trendingItems: trending || [],
        recentItems: recent || [],
        compareExamples: compareExamples || [],
      },
    };
  } catch (err) {
    console.error("Homepage data fetch error:", err);
    return {
      props: {
        stats: { totalItems: 0, totalUpdates: 0, totalTrending: 0 },
        trendingItems: [],
        recentItems: [],
        compareExamples: [],
      },
    };
  }
}
