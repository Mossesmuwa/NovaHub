// pages/index.js
import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Card, {
  Carousel,
  CarouselNav,
  CardGrid,
  PosterCard,
  ToolCard,
} from "../components/Card";
import useScrollReveal from "../hooks/useScrollReveal";
import Link from "next/link";
import * as Items from "../lib/items";
import { useSupabase } from "../lib/SupabaseContext";

// ─── Live stat ticker ─────────────────────────────────────────────────────────
function StatTicker({ label, value, icon, delay = 0 }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        let start = 0;
        const t0 = performance.now();
        const dur = 900;
        const step = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          setN(Math.round(p * value));
          if (p < 1) requestAnimationFrame(step);
        };
        setTimeout(() => requestAnimationFrame(step), delay);
        obs.disconnect();
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div
        style={{
          fontSize: "clamp(24px,4vw,36px)",
          fontWeight: 900,
          letterSpacing: "-.04em",
          color: "var(--gold)",
        }}
      >
        {n.toLocaleString()}+
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--t3)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: ".06em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Onboarding nudge ─────────────────────────────────────────────────────────
function OnboardingNudge({ onDismiss }) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg,var(--gold-glow) 0%,rgba(201,168,76,.04) 100%)",
        border: "1px solid var(--gold-glow2)",
        borderRadius: "var(--r)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 32,
        position: "relative",
      }}
    >
      <div style={{ fontSize: 24, flexShrink: 0 }}>✦</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>
          Personalise your feed
        </div>
        <div style={{ fontSize: 13, color: "var(--t2)" }}>
          Take the 60-second taste quiz — NovaHub becomes yours.
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <Link
          href="/onboarding"
          className="btn-primary"
          style={{ fontSize: 12, padding: "7px 14px" }}
        >
          Take quiz →
        </Link>
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: "var(--t3)",
            cursor: "pointer",
            fontSize: 16,
            padding: "4px 8px",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Featured grid (asymmetric 2fr+1fr+1fr) ──────────────────────────────────
function FeaturedGrid({ items }) {
  if (!items.length) return null;
  const [hero, ...rest] = items;
  return (
    <div className="featured-grid" style={{ marginBottom: 32 }}>
      {/* Hero card */}
      <Link
        href={`/item/${encodeURIComponent(hero.slug)}`}
        className="featured-hero-card"
        style={{
          gridColumn: "1",
          gridRow: "1 / span 2",
          borderRadius: "var(--rlg)",
          overflow: "hidden",
          display: "block",
          position: "relative",
          minHeight: 360,
          textDecoration: "none",
        }}
      >
        {hero.image && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${hero.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "transform .6s ease",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.2) 50%,transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 24,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--gold)",
              color: "#09090C",
              fontSize: 10,
              fontWeight: 800,
              padding: "3px 10px",
              borderRadius: 99,
              marginBottom: 10,
              width: "fit-content",
            }}
          >
            ✦ Featured Pick
          </div>
          <div
            style={{
              fontSize: "clamp(18px,3vw,26px)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-.03em",
              marginBottom: 6,
              lineHeight: 1.2,
            }}
          >
            {hero.name}
          </div>
          {hero.short_desc && (
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,.65)",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {hero.short_desc}
            </div>
          )}
        </div>
      </Link>

      {/* Supporting cards */}
      {rest.slice(0, 4).map((item) => (
        <Link
          key={item.id}
          href={`/item/${encodeURIComponent(item.slug)}`}
          style={{
            borderRadius: "var(--r)",
            overflow: "hidden",
            position: "relative",
            display: "block",
            minHeight: 160,
            textDecoration: "none",
            background: "var(--bg3)",
          }}
        >
          {item.image && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${item.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 60%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "12px",
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.3,
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,.5)",
                marginTop: 2,
              }}
            >
              {item.type}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── AI Section ────────────────────────────────────────────────────────────────
function AISection({ taste }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Auto-load taste recs if user has taste profile
  useEffect(() => {
    if (!taste?.cats?.length) return;
    loadTasteRecs();
  }, [taste]);

  async function loadTasteRecs() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "taste", taste, limit: 6 }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.recommendations || []);
        setDone(true);
      }
    } catch {}
    setLoading(false);
  }

  async function askAI() {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setDone(false);
    try {
      const res = await fetch("/api/ai-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "query", query, taste, limit: 6 }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.recommendations || []);
        setDone(true);
      }
    } catch {}
    setLoading(false);
  }

  return (
    <div className="ai-section">
      <div className="ai-section-bg" />
      <div className="ai-badge">✦ AI-Powered</div>
      <h2
        style={{
          fontSize: "clamp(20px,3vw,28px)",
          fontWeight: 900,
          letterSpacing: "-.03em",
          marginBottom: 6,
        }}
      >
        {taste?.cats?.length ? "Picked for your taste" : "Ask NovaHub AI"}
      </h2>
      <p style={{ fontSize: 14, color: "var(--t2)", marginBottom: 0 }}>
        {taste?.cats?.length
          ? "Based on your taste profile."
          : "Describe exactly what you're looking for."}
      </p>

      <div className="ai-input-row">
        <input
          type="text"
          placeholder='e.g. "dark sci-fi movies with complex plots" or "free AI writing tools"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askAI()}
        />
        <button
          className="btn-gold"
          onClick={askAI}
          disabled={loading}
          style={{ minWidth: 100 }}
        >
          {loading ? "…" : "Ask ✦"}
        </button>
      </div>

      {loading && !results.length && (
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 20,
            alignItems: "center",
            color: "var(--t3)",
            fontSize: 13,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              border: "2px solid var(--border2)",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              animation: "spin .7s linear infinite",
            }}
          />
          AI is thinking…
        </div>
      )}

      {results.length > 0 && (
        <div className="ai-recs-grid" style={{ marginTop: 20 }}>
          {results.map((item, i) => (
            <Link
              key={item.slug || i}
              href={
                item.is_db_item ? `/item/${encodeURIComponent(item.slug)}` : "#"
              }
              className="ai-rec-card"
              onClick={!item.is_db_item ? (e) => e.preventDefault() : undefined}
            >
              {item.image && (
                <img src={item.image} alt={item.name} className="ai-rec-img" />
              )}
              <div className="ai-rec-name">{item.name}</div>
              <div className="ai-rec-why">{item.reason}</div>
              {item.is_suggestion && (
                <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 4 }}>
                  AI suggestion
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category tiles ────────────────────────────────────────────────────────────
const CATS = [
  { id: "movies", icon: "🍿", name: "Movies", accent: "#E8593C" },
  { id: "books", icon: "📚", name: "Books", accent: "#3B8BD4" },
  { id: "ai-tools", icon: "✨", name: "AI Tools", accent: "#C9A84C" },
  { id: "games", icon: "🎮", name: "Games", accent: "#7F77DD" },
  { id: "security", icon: "🔐", name: "Security", accent: "#1D9E75" },
  { id: "productivity", icon: "⚡", name: "Productivity", accent: "#BA7517" },
  { id: "music", icon: "🎵", name: "Music", accent: "#D4537E" },
  { id: "courses", icon: "🧠", name: "Courses", accent: "#0A84FF" },
  { id: "design", icon: "🎨", name: "Design", accent: "#FF9F0A" },
  { id: "science", icon: "🔬", name: "Science", accent: "#30D158" },
  { id: "finance", icon: "📈", name: "Finance", accent: "#1D9E75" },
  { id: "news", icon: "📰", name: "News", accent: "#636366" },
];

export default function Home() {
  const { user } = useSupabase();
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [aiTools, setAiTools] = useState([]);
  const [movies, setMovies] = useState([]);
  const [games, setGames] = useState([]);
  const [security, setSecurity] = useState([]);
  const [books, setBooks] = useState([]);
  const [gems, setGems] = useState([]);
  const [taste, setTaste] = useState(null);
  const [showNudge, setShowNudge] = useState(false);
  const [nlEmail, setNlEmail] = useState("");
  const [nlDone, setNlDone] = useState(false);
  const [heroQuery, setHeroQuery] = useState("");
  useScrollReveal();

  useEffect(() => {
    // Read taste from localStorage
    try {
      const t = JSON.parse(localStorage.getItem("nova_taste") || "null");
      setTaste(t);
    } catch {}
    // Show onboarding nudge if no taste + no account
    const done =
      localStorage.getItem("nova_onboard_done") ||
      localStorage.getItem("nova_onboard_skip");
    if (!done && !user) setShowNudge(true);
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const [f, t, at, m, g, s, b] = await Promise.all([
          Items.getFeatured(5),
          Items.getTrending(14),
          Items.getByCategory("ai-tools", { limit: 8 }),
          Items.getByCategory("movies", { limit: 10 }),
          Items.getByCategory("games", { limit: 10 }),
          Items.getByCategory("security", { limit: 6 }),
          Items.getByCategory("books", { limit: 10 }),
        ]);
        setFeatured(f);
        setTrending(t);
        setAiTools(at);
        setMovies(m);
        setGames(g);
        setSecurity(s);
        setBooks(b);
      } catch (e) {
        console.error("[Home] init:", e);
      }
    })();
  }, []);

  function goSearch() {
    if (heroQuery.trim())
      window.location.href = `/search?q=${encodeURIComponent(heroQuery.trim())}`;
  }

  async function surpriseMe() {
    const random = trending[Math.floor(Math.random() * trending.length)];
    if (random)
      window.location.href = `/item/${encodeURIComponent(random.slug)}`;
  }

  async function subscribe(e) {
    e.preventDefault();
    if (!nlEmail.includes("@")) return;
    setNlDone(true);
  }

  const dismissNudge = () => {
    try {
      localStorage.setItem("nova_onboard_skip", "1");
    } catch {}
    setShowNudge(false);
  };

  return (
    <Layout activePage="home">
      <SEO
        title="NovaHub — The Discovery OS for the Internet"
        description="Movies, books, AI tools, games, security resources — curated by humans, powered by AI. One place for all of it."
      />

      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-24px) scale(1.06)} }
        @keyframes heroFade { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes badgePulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.4)} 70%{box-shadow:0 0 0 6px rgba(201,168,76,0)} }
        .featured-grid { display:grid; grid-template-columns:2fr 1fr; grid-template-rows:180px 180px; gap:12px; }
        @media(max-width:640px) { .featured-grid { grid-template-columns:1fr; grid-template-rows:auto; } }
        .featured-grid a:first-child { grid-column:1; grid-row:1/span 2; }
        @media(max-width:640px) { .featured-grid a:first-child { grid-column:1; grid-row:auto; min-height:240px; } }
        .stat-divider { width:1px; height:40px; background:var(--border2); }
        .hero-search input:focus { outline:none; }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-orb" />

        <div
          className="hero-content"
          style={{ animation: "heroFade .6s ease forwards" }}
        >
          {/* Live badge */}
          <div
            className="hero-badge"
            style={{ animation: "badgePulse 3s ease-in-out infinite" }}
          >
            <div className="hero-badge-dot" />
            AI Discovery · Updated Daily
          </div>

          <h1 className="hero-title">
            Discover Everything
            <br />
            Worth Your Time
          </h1>
          <p className="hero-sub">
            Movies, books, AI tools, games, niche companies — curated by humans,
            powered by intelligence. One place for all of it.
          </p>

          {/* Hero search */}
          <div className="hero-search">
            <input
              type="text"
              placeholder='Try "dark sci-fi movies" or "free AI coding tools"…'
              autoComplete="off"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goSearch()}
            />
            <button className="btn-gold" onClick={goSearch}>
              Search →
            </button>
          </div>

          {/* Action pills */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/category"
              className="btn-ghost"
              style={{ fontSize: 13, padding: "8px 18px" }}
            >
              Browse All
            </Link>
            <button
              className="btn-secondary"
              onClick={surpriseMe}
              style={{ fontSize: 13, padding: "8px 18px" }}
            >
              🎲 Surprise Me
            </button>
            <Link
              href="/discover"
              className="btn-secondary"
              style={{ fontSize: 13, padding: "8px 18px" }}
            >
              ✦ Vibe Dial
            </Link>
          </div>

          {/* Category chips */}
          <div
            className="hero-cat-chips"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 8,
              marginTop: 24,
            }}
          >
            {[
              { href: "/trending", label: "🔥 Trending" },
              { href: "/category?cat=ai-tools", label: "✨ AI Tools" },
              { href: "/category?cat=games", label: "🎮 Games" },
              { href: "/category?cat=movies", label: "🍿 Movies" },
              { href: "/category?cat=security", label: "🔐 Security" },
              { href: "/category?cat=books", label: "📚 Books" },
              { href: "/weekly", label: "📬 Digest" },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="cat-chip"
                style={{ fontSize: 12, padding: "6px 14px" }}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg2)",
          padding: "32px 0",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              gap: 0,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "◈", label: "Curated Items", value: 1200, delay: 0 },
              { icon: "♥", label: "Items Saved", value: 8400, delay: 100 },
              { icon: "✦", label: "AI Picks Daily", value: 50, delay: 200 },
              { icon: "◫", label: "Categories", value: 13, delay: 300 },
            ].map((s, i, arr) => (
              <>
                <div
                  key={s.label}
                  style={{ flex: 1, minWidth: 120, padding: "8px 20px" }}
                >
                  <StatTicker {...s} />
                </div>
                {i < arr.length - 1 && (
                  <div
                    key={`d${i}`}
                    className="stat-divider"
                    style={{
                      alignSelf: "center",
                      display: window?.innerWidth > 480 ? "block" : "none",
                    }}
                  />
                )}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ paddingBottom: 80 }}>
        {/* ── ONBOARDING NUDGE ── */}
        {showNudge && (
          <div className="container" style={{ paddingTop: 32 }}>
            <OnboardingNudge onDismiss={dismissNudge} />
          </div>
        )}

        {/* ── FEATURED ── */}
        {featured.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header reveal">
                <div>
                  <div className="section-label">Hand-picked</div>
                  <h2 className="section-title">Featured Today</h2>
                </div>
                <Link href="/category" className="section-more">
                  All →
                </Link>
              </div>
              <FeaturedGrid items={featured} />
            </div>
          </section>
        )}

        <div className="divider" />

        {/* ── TRENDING ── */}
        {trending.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header reveal">
                <div>
                  <div
                    className="section-label"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#FF453A",
                        display: "inline-block",
                        animation: "badgePulse 2s infinite",
                      }}
                    />
                    Live
                  </div>
                  <h2 className="section-title">🔥 Trending Now</h2>
                </div>
                <Link href="/trending" className="section-more">
                  See all →
                </Link>
              </div>
              <Carousel items={trending} id="trending-carousel" width="150px" />
              <CarouselNav id="trending-carousel" />
            </div>
          </section>
        )}

        <div className="divider" />

        {/* ── AI SECTION ── */}
        <section className="section">
          <div className="container">
            <AISection taste={taste} />
          </div>
        </section>

        <div className="divider" />

        {/* ── AI TOOLS ── */}
        {aiTools.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header reveal">
                <div>
                  <div className="section-label">Tools</div>
                  <h2 className="section-title">✨ AI Tools</h2>
                </div>
                <Link href="/category?cat=ai-tools" className="section-more">
                  All →
                </Link>
              </div>
              <Carousel items={aiTools} id="aitools-carousel" width="200px" />
              <CarouselNav id="aitools-carousel" />
            </div>
          </section>
        )}

        <div className="divider" />

        {/* ── CATEGORIES GRID ── */}
        <section className="section">
          <div className="container">
            <div className="section-header reveal">
              <div>
                <div className="section-label">Explore</div>
                <h2 className="section-title">Every World</h2>
              </div>
              <Link href="/category" className="section-more">
                All →
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
                gap: 10,
              }}
              className="stagger"
            >
              {CATS.map((c) => (
                <Link
                  key={c.id}
                  href={`/category?cat=${c.id}`}
                  className="cat-tile reveal-scale"
                  style={{
                    padding: "20px 14px",
                    textDecoration: "none",
                    borderBottom: `2px solid ${c.accent}30`,
                    transition: "all var(--spring)",
                  }}
                >
                  <div
                    className="cat-tile-icon"
                    style={{ fontSize: 26, marginBottom: 8 }}
                  >
                    {c.icon}
                  </div>
                  <div className="cat-tile-name">{c.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ── MOVIES ── */}
        {movies.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header reveal">
                <div>
                  <div className="section-label">Watch</div>
                  <h2 className="section-title">🍿 Movies & TV</h2>
                </div>
                <Link href="/category?cat=movies" className="section-more">
                  All →
                </Link>
              </div>
              <Carousel items={movies} id="movies-carousel" width="150px" />
              <CarouselNav id="movies-carousel" />
            </div>
          </section>
        )}

        <div className="divider" />

        {/* ── GAMES ── */}
        {games.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header reveal">
                <div>
                  <div className="section-label">Play</div>
                  <h2 className="section-title">🎮 Games</h2>
                </div>
                <Link href="/category?cat=games" className="section-more">
                  All →
                </Link>
              </div>
              <Carousel items={games} id="games-carousel" width="150px" />
              <CarouselNav id="games-carousel" />
            </div>
          </section>
        )}

        <div className="divider" />

        {/* ── SECURITY ── */}
        {security.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header reveal">
                <div>
                  <div className="section-label">Featured</div>
                  <h2 className="section-title">🔐 Cyber Security</h2>
                </div>
                <Link href="/category?cat=security" className="section-more">
                  All →
                </Link>
              </div>
              <CardGrid items={security} gridClass="grid-3 stagger" />
            </div>
          </section>
        )}

        <div className="divider" />

        {/* ── BOOKS ── */}
        {books.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header reveal">
                <div>
                  <div className="section-label">Read</div>
                  <h2 className="section-title">📚 Books</h2>
                </div>
                <Link href="/category?cat=books" className="section-more">
                  All →
                </Link>
              </div>
              <Carousel items={books} id="books-carousel" width="150px" />
              <CarouselNav id="books-carousel" />
            </div>
          </section>
        )}

        <div className="divider" />

        {/* ── NEWSLETTER ── */}
        <section className="section">
          <div className="container">
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--rxl)",
                padding: "clamp(32px,5vw,56px) clamp(24px,5vw,48px)",
                textAlign: "center",
                maxWidth: 600,
                margin: "0 auto",
                position: "relative",
                overflow: "hidden",
              }}
              className="reveal"
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse 70% 80% at 50% -20%,rgba(201,168,76,.09) 0%,transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div className="ai-badge" style={{ marginBottom: 16 }}>
                ✦ Weekly Digest
              </div>
              <h2
                style={{
                  fontSize: "clamp(22px,4vw,34px)",
                  fontWeight: 900,
                  letterSpacing: "-.04em",
                  marginBottom: 12,
                }}
              >
                Never Miss What&apos;s Next
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--t2)",
                  maxWidth: 380,
                  margin: "0 auto 28px",
                  lineHeight: 1.6,
                }}
              >
                5 curated picks every Sunday. AI-written, human-approved. Free
                forever.
              </p>
              {nlDone ? (
                <div
                  style={{
                    padding: "14px 24px",
                    background: "rgba(48,209,88,.1)",
                    border: "1px solid rgba(48,209,88,.2)",
                    borderRadius: 99,
                    fontSize: 15,
                    color: "#30D158",
                    fontWeight: 700,
                  }}
                >
                  ✦ You&apos;re on the list — see you Sunday!
                </div>
              ) : (
                <form onSubmit={subscribe}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      maxWidth: 400,
                      margin: "0 auto 12px",
                    }}
                  >
                    <input
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={nlEmail}
                      onChange={(e) => setNlEmail(e.target.value)}
                      style={{
                        background: "var(--bg3)",
                        border: "1px solid var(--border2)",
                        borderRadius: 99,
                        padding: "13px 20px",
                        fontSize: 15,
                        fontFamily: "var(--font)",
                        color: "var(--t1)",
                        outline: "none",
                      }}
                    />
                    <button
                      type="submit"
                      className="btn-gold"
                      style={{ padding: "13px 24px", justifyContent: "center" }}
                    >
                      Subscribe →
                    </button>
                  </div>
                </form>
              )}
              <p
                style={{
                  fontSize: 12,
                  color: "var(--t3)",
                  position: "relative",
                }}
              >
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
