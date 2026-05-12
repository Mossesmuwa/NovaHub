import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import {
  PosterCard,
  ToolCard,
  Carousel,
  CarouselNav,
} from "../components/Card";
import useScrollReveal from "../hooks/useScrollReveal";
import * as Items from "shared/lib/items";

const QUICK_TAGS = [
  "AI coding tools",
  "Dark sci-fi movies",
  "Cybersecurity",
  "Productivity apps",
  "RPG games",
  "Books 2026",
];

const TYPE_ICONS = {
  movie: "🍿",
  tv: "📺",
  book: "📚",
  game: "🎮",
  tool: "✨",
  course: "🧠",
  podcast: "🎙",
  security: "🔐",
  other: "◈",
};

const POSTER_TYPES = ["movie", "book", "game", "tv"];

function useKbdSearch(inputRef) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [inputRef]);
}

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [tab, setTab] = useState("all");
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useScrollReveal();
  useKbdSearch(inputRef);

  useEffect(() => {
    Items.getTrending(14)
      .then((items) => setTrending(items || []))
      .catch((err) => console.error("[Search] trending failed:", err));
  }, []);

  useEffect(() => {
    const q = (router.query.q || "").toString();
    if (!q.trim()) return;
    setQuery(q);
    doSearch(q);
  }, [router.query.q]);

  async function doSearch(value) {
    const searchQ = (value ?? query).trim();
    if (!searchQ) return;
    setLoading(true);
    setSearched(true);
    setTab("all");
    try {
      const items = await Items.search(searchQ, { limit: 48 });
      setResults(items || []);
    } catch (err) {
      console.error("[Search] search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function quickSearch(value) {
    const next = value.trim();
    if (!next) return;
    setQuery(next);
    router.replace(`/search?q=${encodeURIComponent(next)}`, undefined, {
      shallow: true,
    });
    doSearch(next);
  }

  function onSearchSubmit() {
    quickSearch(query);
  }

  function onSearchInputKeyDown(e) {
    if (e.key === "Enter") onSearchSubmit();
  }

  const types = [...new Set(results.map((i) => i.type || "other"))];
  const filtered =
    tab === "all"
      ? results
      : results.filter((i) => (i.type || "other") === tab);
  const posters = filtered.filter((i) => POSTER_TYPES.includes(i.type));
  const cards = filtered.filter((i) => !POSTER_TYPES.includes(i.type));

  return (
    <Layout activePage="search">
      <SEO
        title={searched ? `"${query}" — NovaHub Search` : "Search — NovaHub"}
        description="Search across movies, books, tools, games, and curated picks on NovaHub."
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,.26); } 70% { box-shadow: 0 0 0 7px rgba(201,168,76,0); } }
        @keyframes floatOrb { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      `}</style>

      <section
        style={{
          padding: "calc(var(--nav) + 46px) 0 34px",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 70% at 50% 0%, rgba(201,168,76,.1) 0%, transparent 62%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: "50%",
            right: -100,
            top: -130,
            background:
              "radial-gradient(circle, rgba(201,168,76,.13) 0%, transparent 70%)",
            filter: "blur(12px)",
            animation: "floatOrb 7s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="reveal" style={{ maxWidth: 860 }}>
            <div
              className="section-label"
              style={{
                marginBottom: 8,
                animation: "fadeSlideUp .5s ease both",
              }}
            >
              Search Engine
            </div>
            <h1
              style={{
                fontSize: "clamp(30px,6.5vw,58px)",
                fontWeight: 900,
                letterSpacing: "-.05em",
                lineHeight: 1.03,
                marginBottom: 10,
                animation: "fadeSlideUp .55s ease .05s both",
              }}
            >
              {searched
                ? `Results for "${query}"`
                : "Discover anything in seconds"}
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "var(--t2)",
                maxWidth: 620,
                marginBottom: 20,
                animation: "fadeSlideUp .55s ease .1s both",
              }}
            >
              Search curated content across tools, media, and knowledge domains.
              Filter by type and jump directly to what fits your intent.
            </p>

            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border2)",
                borderRadius: "var(--r)",
                padding: 10,
                animation: "fadeSlideUp .55s ease .14s both",
              }}
            >
              <div
                className="search-big"
                style={{
                  maxWidth: "none",
                  margin: 0,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 99,
                    border: "1px solid var(--border2)",
                    background: "var(--surf)",
                    color: "var(--t3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  autoComplete="off"
                  autoFocus
                  placeholder="Search movies, books, AI tools, games..."
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onSearchInputKeyDown}
                  style={{
                    borderRadius: 12,
                    borderRight: "1px solid var(--border2)",
                    padding: "12px 14px",
                    fontSize: 15,
                  }}
                />

                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setSearched(false);
                      setResults([]);
                    }}
                    className="btn-secondary"
                    style={{
                      padding: "10px 12px",
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    Clear
                  </button>
                )}

                <button
                  className="btn-gold"
                  onClick={onSearchSubmit}
                  style={{
                    minWidth: 102,
                    justifyContent: "center",
                    animation: loading
                      ? "pulseGlow 1.5s ease-in-out infinite"
                      : "none",
                    flexShrink: 0,
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid rgba(9,9,12,.3)",
                        borderTopColor: "#09090C",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin .7s linear infinite",
                      }}
                    />
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "var(--t3)",
                animation: "fadeSlideUp .55s ease .2s both",
              }}
            >
              Shortcut:{" "}
              <kbd
                style={{
                  background: "var(--surf)",
                  border: "1px solid var(--border2)",
                  borderRadius: 6,
                  padding: "2px 6px",
                  fontSize: 11,
                }}
              >
                Ctrl/Cmd + K
              </kbd>
            </div>

            <div
              className="search-filters"
              style={{
                justifyContent: "flex-start",
                margin: "16px 0 0",
                animation: "fadeSlideUp .55s ease .24s both",
              }}
            >
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  className="search-filter"
                  onClick={() => quickSearch(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div
        className="container"
        style={{ paddingTop: 24, paddingBottom: 84, minHeight: 420 }}
      >
        {searched ? (
          <>
            <div
              className="reveal"
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--r)",
                padding: "12px 14px",
                background: "var(--bg2)",
                marginBottom: 18,
              }}
            >
              <div className="search-meta" style={{ marginBottom: 10 }}>
                {loading ? (
                  "Searching..."
                ) : (
                  <>
                    <strong>{results.length}</strong> result
                    {results.length !== 1 ? "s" : ""} for "{query}"
                  </>
                )}
              </div>

              <div
                className="search-filters"
                style={{ justifyContent: "flex-start", margin: 0 }}
              >
                <button
                  className={`search-filter${tab === "all" ? " active" : ""}`}
                  onClick={() => setTab("all")}
                >
                  All ({results.length})
                </button>
                {types.map((type) => {
                  const count = results.filter(
                    (item) => (item.type || "other") === type,
                  ).length;
                  return (
                    <button
                      key={type}
                      className={`search-filter${tab === type ? " active" : ""}`}
                      onClick={() => setTab(type)}
                    >
                      {TYPE_ICONS[type] || TYPE_ICONS.other}{" "}
                      {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
                  gap: 14,
                }}
              >
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: 120,
                      borderRadius: "var(--r)",
                      border: "1px solid var(--border)",
                      background: "var(--bg2)",
                      opacity: 0.7,
                      animation: `fadeSlideUp .35s ease ${idx * 0.03}s both`,
                    }}
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state reveal">
                <span className="empty-state-icon">🔍</span>
                <h3 style={{ fontSize: 22, marginBottom: 8 }}>
                  No matches found
                </h3>
                <p>
                  Try broader terms or visit{" "}
                  <Link href="/category" style={{ color: "var(--gold)" }}>
                    categories
                  </Link>
                  .
                </p>
                <div className="search-filters" style={{ marginTop: 16 }}>
                  {QUICK_TAGS.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      className="search-filter"
                      onClick={() => quickSearch(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ animation: "fadeSlideUp .32s ease both" }}>
                {posters.length > 0 && (
                  <>
                    <div
                      className="section-header reveal"
                      style={{ marginBottom: 14 }}
                    >
                      <div>
                        <div className="section-label">Poster Items</div>
                        <h2 className="section-title">Movies, games, books</h2>
                      </div>
                    </div>
                    <div
                      className="grid-4 stagger"
                      style={{ marginBottom: cards.length ? 28 : 0 }}
                    >
                      {posters.map((item) => (
                        <div className="reveal-scale" key={item.id}>
                          <PosterCard item={item} />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {cards.length > 0 && (
                  <>
                    <div
                      className="section-header reveal"
                      style={{ marginBottom: 14 }}
                    >
                      <div>
                        <div className="section-label">Tool Items</div>
                        <h2 className="section-title">
                          Apps, services, resources
                        </h2>
                      </div>
                    </div>
                    <div className="grid-3 stagger">
                      {cards.map((item) => (
                        <div className="reveal-scale" key={item.id}>
                          <ToolCard item={item} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="section-header reveal">
              <div>
                <div className="section-label">Popular Right Now</div>
                <h2 className="section-title">Trending across NovaHub</h2>
              </div>
              <Link href="/trending" className="section-more">
                See all →
              </Link>
            </div>

            {trending.length > 0 ? (
              <>
                <Carousel
                  items={trending}
                  id="search-trending-carousel"
                  width="170px"
                />
                <CarouselNav id="search-trending-carousel" />
              </>
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">◌</span>
                <p>Trending content will appear here.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
