```jsx
// pages/index.js — NovaHub (Upgraded, Production Version)

import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Carousel, CarouselNav, CardGrid } from "../components/Card";
import useScrollReveal from "../hooks/useScrollReveal";
import Link from "next/link";
import * as Items from "../lib/items";
import { useSupabase } from "../lib/SupabaseContext";

// ─── HERO suggestions ─────────────────────────────────────────────────────────
const HERO_SUGGESTIONS = [
  "dark sci-fi movies",
  "free AI coding tools",
  "mind-bending books",
  "underrated indie games",
];

// ─── Stat ticker ──────────────────────────────────────────────────────────────
function StatTicker({ label, value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start = 0;
    const dur = 800;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      setN(Math.round(p * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{n}+</div>
      <div style={{ fontSize: 11, color: "var(--t3)" }}>{label}</div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useSupabase();

  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [movies, setMovies] = useState([]);
  const [aiTools, setAiTools] = useState([]);
  const [taste, setTaste] = useState(null);
  const [recent, setRecent] = useState([]);
  const [heroQuery, setHeroQuery] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useScrollReveal();

  // ─── rotate suggestions ─────────────────────────────────────────────────────
  useEffect(() => {
    const i = setInterval(() => {
      setSuggestionIndex((s) => (s + 1) % HERO_SUGGESTIONS.length);
    }, 2500);
    return () => clearInterval(i);
  }, []);

  // ─── load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [f, t, m, at] = await Promise.all([
        Items.getFeatured(5),
        Items.getTrending(20),
        Items.getByCategory("movies", { limit: 10 }),
        Items.getByCategory("ai-tools", { limit: 10 }),
      ]);
      setFeatured(f);
      setTrending(t);
      setMovies(m);
      setAiTools(at);
    })();

    try {
      const t = JSON.parse(localStorage.getItem("nova_taste") || "null");
      setTaste(t);

      const r = JSON.parse(localStorage.getItem("nova_recent") || "[]");
      setRecent(r);
    } catch {}
  }, []);

  // ─── actions ────────────────────────────────────────────────────────────────
  function goSearch() {
    if (!heroQuery.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(heroQuery)}`;
  }

  async function surpriseMe() {
    const pool = await Items.getTrending(50);
    const r = pool[Math.floor(Math.random() * pool.length)];
    if (r) window.location.href = `/item/${r.slug}`;
  }

  return (
    <Layout activePage="home">
      <SEO title="NovaHub — Discover What Matters" />

      {/* ─── HERO ───────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-content">

          <div className="hero-badge">
            ✦ AI Discovery · Updated Daily
          </div>

          <h1 className="hero-title">
            Discover Everything Worth Your Time
          </h1>

          <p className="hero-micro">
            1,200+ curated picks. Ranked by taste, not hype.
          </p>

          <div className="hero-search">
            <input
              placeholder={`Try "${HERO_SUGGESTIONS[suggestionIndex]}"…`}
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goSearch()}
            />
            <button className="btn-gold" onClick={goSearch}>
              Search →
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn-secondary" onClick={surpriseMe}>
              🎲 Surprise Me
            </button>
            <Link href="/category" className="btn-ghost">
              Browse All
            </Link>
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────── */}
      <section style={{ padding: 30 }}>
        <div style={{ display: "flex", gap: 40, justifyContent: "center" }}>
          <StatTicker label="Items" value={1200} />
          <StatTicker label="Saved" value={8400} />
          <StatTicker label="AI Picks" value={50} />
        </div>
      </section>

      {/* ─── FEATURED ─────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="section">
          <h2>Featured</h2>
          <Carousel items={featured} id="featured" />
          <CarouselNav id="featured" />
        </section>
      )}

      {/* ─── TRENDING ─────────────────────────────────── */}
      {trending.length > 0 && (
        <section className="section">
          <h2>🔥 Trending</h2>
          <Carousel items={trending} id="trending" />
          <CarouselNav id="trending" />
        </section>
      )}

      {/* ─── PERSONALIZED ─────────────────────────────── */}
      {taste?.cats?.length > 0 && (
        <section className="section">
          <h2>Because you like {taste.cats[0]}</h2>
          <Carousel
            items={trending.filter(
              (i) => i.category_id === taste.cats[0]
            )}
            id="taste"
          />
          <CarouselNav id="taste" />
        </section>
      )}

      {/* ─── RECENT ───────────────────────────────────── */}
      {recent.length > 0 && (
        <section className="section">
          <h2>Recently viewed</h2>
          <Carousel items={recent} id="recent" />
          <CarouselNav id="recent" />
        </section>
      )}

      {/* ─── AI TOOLS ─────────────────────────────────── */}
      {aiTools.length > 0 && (
        <section className="section">
          <h2>✨ AI Tools</h2>
          <Carousel items={aiTools} id="tools" />
          <CarouselNav id="tools" />
        </section>
      )}

      {/* ─── MOVIES ───────────────────────────────────── */}
      {movies.length > 0 && (
        <section className="section">
          <h2>🍿 Movies</h2>
          <Carousel items={movies} id="movies" />
          <CarouselNav id="movies" />
        </section>
      )}

    </Layout>
  );
}
```
