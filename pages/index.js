import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Card, { Carousel, CarouselNav, CardGrid } from "../components/Card";
import useScrollReveal from "../hooks/useScrollReveal";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import * as Items from "../lib/items";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [aiTools, setAiTools] = useState([]);
  const [movies, setMovies] = useState([]);
  const [games, setGames] = useState([]);
  const [security, setSecurity] = useState([]);
  const [books, setBooks] = useState([]);
  const [recs, setRecs] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [hiddenGems, setHiddenGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResult, setAiResult] = useState(null);

  useScrollReveal();

  useEffect(() => {
    (async () => {
      try {
        const [f, t, at, m, g, s, b, r, alt, gems] = await Promise.all([
          Items.getFeatured(5),
          Items.getTrending(14),
          Items.getByCategory("ai-tools", { limit: 8 }),
          Items.getByCategory("movies", { limit: 10 }),
          Items.getByCategory("games", { limit: 10 }),
          Items.getByCategory("security", { limit: 6 }),
          Items.getByCategory("books", { limit: 10 }),
          Items.getRecommendations(6),
          getAlternativesSection(),
          getHiddenGemsSection(),
        ]);
        setFeatured(f);
        setTrending(t);
        setAiTools(at);
        setMovies(m);
        setGames(g);
        setSecurity(s);
        setBooks(b);
        setRecs(r);
        setAlternatives(alt);
        setHiddenGems(gems);
      } catch (err) {
        console.error("[NovaHub] Init error:", err);
      }
      setLoading(false);
    })();
  }, []);

  function heroSearch() {
    const q = document.getElementById("hero-input")?.value?.trim();
    if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
  }

  async function surpriseMe() {
    try {
      const res = await fetch("/api/ai-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "surprise", limit: 8 }),
      });
      if (res.ok) {
        const items = await res.json();
        // Store in session storage and redirect to search with special mode
        sessionStorage.setItem("surprise_items", JSON.stringify(items));
        window.location.href = "/search?mode=surprise";
      }
    } catch (error) {
      console.error("Surprise me error:", error);
    }
  }

  async function aiSearch() {
    if (!aiQuery.trim()) return;
    setAiResult("searching");
    try {
      const items = await Items.search(aiQuery, { limit: 6 });
      setAiResult(items);
    } catch {
      setAiResult([]);
    }
  }

  const reasons = [
    "Trending now",
    "Community pick",
    "Editor's choice",
    "Highly rated",
    "New & noteworthy",
    "Perfect for today",
  ];

  async function getAlternativesSection() {
    try {
      // Get popular items that have alternatives
      const popular = await Items.getTrending(20);
      // For now, return a subset - in future this could be based on actual alternatives table
      return popular
        .slice(0, 6)
        .map((item) => ({ ...item, reason: "Popular alternative" }));
    } catch {
      return [];
    }
  }

  async function getHiddenGemsSection() {
    try {
      // Get items with low save_count but high rating - "hidden gems"
      const { data } = await supabase
        .from("items")
        .select("*")
        .eq("approved", true)
        .gte("rating", 4.0)
        .lt("save_count", 50)
        .order("rating", { ascending: false })
        .limit(6);
      return data || [];
    } catch {
      return [];
    }
  }

  return (
    <Layout activePage="home">
      <SEO />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-orb"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <div className="hero-badge-dot"></div>AI Discovery · Updated Daily
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
          <div className="hero-search">
            <input
              type="text"
              id="hero-input"
              placeholder='Try "best AI coding tools" or "dark sci-fi movies"…'
              autoComplete="off"
              onKeyDown={(e) => e.key === "Enter" && heroSearch()}
            />
            <button className="btn-gold" onClick={heroSearch}>
              Search →
            </button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <button
              className="btn-outline"
              onClick={() => (window.location.href = "/search")}
              style={{ fontSize: "14px", padding: "8px 16px" }}
            >
              Browse All
            </button>
            <button
              className="btn-outline"
              onClick={surpriseMe}
              style={{ fontSize: "14px", padding: "8px 16px" }}
            >
              🎲 Surprise Me
            </button>
          </div>
          <div
            className="hero-cat-chips"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "8px",
              marginTop: "20px",
            }}
          >
            <Link
              href="/search?q=trending"
              className="cat-chip"
              style={{ fontSize: "12px", padding: "6px 14px" }}
            >
              Trending
            </Link>
            <Link
              href="/category?cat=ai-tools"
              className="cat-chip"
              style={{
                fontSize: "12px",
                padding: "6px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>{" "}
              AI Tools
            </Link>
            <Link
              href="/category?cat=games"
              className="cat-chip"
              style={{
                fontSize: "12px",
                padding: "6px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
              >
                <path d="M21 6h-7V3c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v3H3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zm-1 14H4V8h16v12zm-6-7.5h4V13h-4v-.5zm0 3h4V16h-4v-.5zM6 13h4v.5H6zm0-3h4V13H6z" />
              </svg>{" "}
              Games
            </Link>
            <Link
              href="/category?cat=movies"
              className="cat-chip"
              style={{
                fontSize: "12px",
                padding: "6px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
              >
                <path d="M18 4l2 4h-3l2-4h-2l-2 4h-3l2-4H8l2 4H7l2-4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
              </svg>{" "}
              Movies
            </Link>
            <Link
              href="/category?cat=books"
              className="cat-chip"
              style={{
                fontSize: "12px",
                padding: "6px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
              >
                <path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H5V4h14v16z" />
              </svg>{" "}
              Books
            </Link>
            <Link
              href="/category?cat=security"
              className="cat-chip"
              style={{
                fontSize: "12px",
                padding: "6px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>{" "}
              Security
            </Link>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <div className="scroll-line"></div>
          <span>Scroll</span>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section" style={{ paddingTop: "36px" }}>
        <div className="container">
          <div className="section-header reveal">
            <div>
              <div className="section-label">Featured</div>
              <h2 className="section-title">Editor&apos;s Picks</h2>
            </div>
            <Link href="/category" className="section-more">
              All →
            </Link>
          </div>
          <div className="featured-grid reveal" id="featured-grid">
            {loading ? (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "60px",
                  color: "var(--t3)",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    border: "2px solid var(--border2)",
                    borderTopColor: "var(--gold)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 10px",
                  }}
                ></div>
                Loading picks…
              </div>
            ) : featured.length >= 2 ? (
              <>
                <Link
                  href={`/item/${encodeURIComponent(featured[0].slug)}`}
                  className="featured-hero-card"
                >
                  <img
                    src={featured[0].image || ""}
                    alt={featured[0].name}
                    loading="lazy"
                  />
                  <div className="feat-overlay"></div>
                  <div className="feat-info">
                    <div className="feat-type">
                      {(featured[0].type || "").toUpperCase()}
                    </div>
                    <div className="feat-title">{featured[0].name}</div>
                    {featured[0].rating && (
                      <div className="feat-rating">★ {featured[0].rating}</div>
                    )}
                  </div>
                </Link>
                {featured.slice(1, 5).map((i) => (
                  <Link
                    href={`/item/${encodeURIComponent(i.slug)}`}
                    className="featured-card"
                    key={i.id}
                  >
                    <img src={i.image || ""} alt={i.name} loading="lazy" />
                    <div className="feat-overlay"></div>
                    <div className="feat-info">
                      <div className="feat-type">
                        {(i.type || "").toUpperCase()}
                      </div>
                      <div className="feat-title" style={{ fontSize: "13px" }}>
                        {i.name}
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            ) : (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "48px",
                  color: "var(--t3)",
                  fontSize: "14px",
                }}
              >
                Set featured=true on items in Supabase to see them here.
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* TRENDING */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div>
              <div className="section-label">Hot Now</div>
              <h2 className="section-title">Trending</h2>
            </div>
            <Link href="/trending" className="section-more">
              See all →
            </Link>
          </div>
          <Carousel items={trending} id="trending-carousel" width="150px" />
          <CarouselNav id="trending-carousel" />
        </div>
      </section>

      <div className="divider"></div>

      {/* POPULAR ALTERNATIVES */}
      {alternatives.length > 0 && (
        <>
          <section className="section">
            <div className="container">
              <div className="section-header reveal">
                <div>
                  <div className="section-label">Alternatives</div>
                  <h2 className="section-title">
                    Popular Alternatives This Week
                  </h2>
                </div>
                <Link href="/search?q=alternatives" className="section-more">
                  Find more →
                </Link>
              </div>
              <div className="grid-3 stagger">
                {alternatives.map((item) => (
                  <Card item={item} key={item.id} />
                ))}
              </div>
            </div>
          </section>
          <div className="divider"></div>
        </>
      )}

      {/* HIDDEN GEMS */}
      {hiddenGems.length > 0 && (
        <>
          <section className="section">
            <div className="container">
              <div className="section-header reveal">
                <div>
                  <div className="section-label">Discovery</div>
                  <h2 className="section-title">Hidden Gems</h2>
                </div>
                <Link href="/search?q=hidden+gems" className="section-more">
                  Explore →
                </Link>
              </div>
              <div className="grid-3 stagger">
                {hiddenGems.map((item) => (
                  <Card item={item} key={item.id} />
                ))}
              </div>
            </div>
          </section>
          <div className="divider"></div>
        </>
      )}

      {/* AI RECOMMENDATIONS */}
      <section className="section">
        <div className="container">
          <div className="ai-section reveal">
            <div className="ai-section-bg"></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="ai-badge">✦ AI-Powered</div>
              <div className="section-header" style={{ marginBottom: "8px" }}>
                <div>
                  <div className="section-label">Personalised</div>
                  <h2 className="section-title">
                    Tell us what you&apos;re in the mood for
                  </h2>
                </div>
                <Link href="/search" className="section-more">
                  Full Search →
                </Link>
              </div>
              <p
                style={{
                  color: "var(--t2)",
                  fontSize: "14px",
                  maxWidth: "520px",
                }}
              >
                Type anything — &quot;dark thriller with twists&quot; or
                &quot;free tool to speed up my workflow&quot;.
              </p>
              <div className="ai-input-row">
                <input
                  type="text"
                  id="ai-input"
                  placeholder='e.g. "mind-bending sci-fi" or "free AI coding tool"…'
                  autoComplete="off"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && aiSearch()}
                />
                <button className="btn-gold" onClick={aiSearch}>
                  Ask ✦
                </button>
              </div>
              {aiResult === "searching" && (
                <div className="ai-result">
                  <span style={{ color: "var(--t3)" }}>✦ Searching…</span>
                </div>
              )}
              {Array.isArray(aiResult) && aiResult.length === 0 && (
                <div className="ai-result">
                  No results —{" "}
                  <Link
                    href={`/search?q=${encodeURIComponent(aiQuery)}`}
                    style={{ color: "var(--gold)" }}
                  >
                    Try full search →
                  </Link>
                </div>
              )}
              {Array.isArray(aiResult) && aiResult.length > 0 && (
                <div className="ai-result">
                  <strong>
                    {aiResult.length} result{aiResult.length !== 1 ? "s" : ""}
                  </strong>{" "}
                  for &quot;{aiQuery}&quot;:
                  <br />
                  <br />
                  {aiResult.map((i) => (
                    <Link
                      href={`/item/${encodeURIComponent(i.slug)}`}
                      key={i.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "6px 13px",
                        margin: "3px",
                        background: "var(--bg4)",
                        border: "1px solid var(--border)",
                        borderRadius: "99px",
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "var(--gold)",
                      }}
                    >
                      → {i.name}
                    </Link>
                  ))}
                </div>
              )}
              {recs.length > 0 && (
                <div className="ai-recs-grid stagger">
                  {recs.map((item, i) => (
                    <Link
                      href={`/item/${encodeURIComponent(item.slug)}`}
                      className="ai-rec-card"
                      key={item.id}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          className="ai-rec-img"
                          alt={item.name}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ fontSize: "28px", marginBottom: "10px" }}>
                          {(item.name || "?").charAt(0)}
                        </div>
                      )}
                      <div className="ai-rec-name">{item.name}</div>
                      <div className="ai-rec-why">
                        {reasons[i % reasons.length]}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* AI TOOLS */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div>
              <div className="section-label">Productivity</div>
              <h2 className="section-title">AI Tools</h2>
            </div>
            <Link href="/category?cat=ai-tools" className="section-more">
              All →
            </Link>
          </div>
          <Carousel items={aiTools} id="tools-carousel" width="260px" />
          <CarouselNav id="tools-carousel" />
        </div>
      </section>

      <div className="divider"></div>

      {/* CATEGORY GRID */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div>
              <div className="section-label">Browse</div>
              <h2 className="section-title">All Categories</h2>
            </div>
            <Link href="/category" className="section-more">
              More →
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "10px",
            }}
            className="stagger"
          >
            {[
              {
                cat: "movies",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l2-4h-2l-2 4h-3l2-4H8l2 4H7l2-4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
                name: "Movies & TV",
                count: "120+ items",
              },
              {
                cat: "books",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H5V4h14v16z"/></svg>',
                name: "Books",
                count: "85+ items",
              },
              {
                cat: "ai-tools",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
                name: "AI Tools",
                count: "90+ items",
              },
              {
                cat: "games",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 6h-7V3c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v3H3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zm-1 14H4V8h16v12zm-6-7.5h4V13h-4v-.5zm0 3h4V16h-4v-.5zM6 13h4v.5H6zm0-3h4V13H6z"/></svg>',
                name: "Games",
                count: "64+ items",
              },
              {
                cat: "security",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
                name: "Security",
                count: "40+ items",
              },
              {
                cat: "music",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v9.28c-.47-.46-1.12-.75-1.84-.75-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V7h4V3h-4z"/></svg>',
                name: "Music",
                count: "55+ items",
              },
              {
                cat: "courses",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 5.3L1 11l11 6 11-6-11-5.7zM12 12.27L4.5 8.6v3.9L12 16l7.5-3.5v-3.9L12 12.27z"/></svg>',
                name: "Courses",
                count: "38+ items",
              },
              {
                cat: "news",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54h3.58l4.96-6.33c.72-.92.23-2.29-1.17-2.29H9.5c-.9 0-1.36 1.05-.59 1.76l2.05 2.32z"/></svg>',
                name: "News",
                count: "Daily",
              },
              {
                cat: "design",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
                name: "Design",
                count: "45+ items",
              },
              {
                cat: "science",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>',
                name: "Science",
                count: "30+ items",
              },
              {
                cat: "finance",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.83v-1.93c-1.04-.24-1.84-.74-2.45-1.59h2.05c.41.62.98 1.02 1.69 1.02.97 0 1.69-.48 1.69-1.1 0-.61-.32-1.03-1.84-1.37-2.33-.76-2.88-1.62-2.88-2.74 0-1.39 1.07-2.35 2.61-2.52V4h2.83v1.97c.87.21 1.64.65 2.05 1.44h-2.05c-.29-.46-.9-.75-1.69-.75-.64 0-1.31.32-1.31 1.07 0 .58.58 1.04 1.3 1.35 1.63.41 3.14 1.04 3.14 2.89-.01 1.47-1.12 2.41-2.91 2.57z"/></svg>',
                name: "Finance",
                count: "28+ items",
              },
              {
                cat: "productivity",
                icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9l-7-7z"/></svg>',
                name: "Productivity",
                count: "60+ items",
              },
            ].map((c) => (
              <Link
                href={`/category?cat=${c.cat}`}
                className="cat-tile reveal-scale"
                key={c.cat}
              >
                <div
                  className="cat-tile-icon"
                  dangerouslySetInnerHTML={{ __html: c.icon }}
                  style={{ width: "24px", height: "24px" }}
                />
                <div className="cat-tile-name">{c.name}</div>
                <div className="cat-tile-count">{c.count}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* MOVIES */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div>
              <div className="section-label">Watch</div>
              <h2 className="section-title">Movies & TV</h2>
            </div>
            <Link href="/category?cat=movies" className="section-more">
              All →
            </Link>
          </div>
          <Carousel items={movies} id="movies-carousel" width="150px" />
          <CarouselNav id="movies-carousel" />
        </div>
      </section>

      <div className="divider"></div>

      {/* GAMES */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div>
              <div className="section-label">Play</div>
              <h2 className="section-title">Games</h2>
            </div>
            <Link href="/category?cat=games" className="section-more">
              All →
            </Link>
          </div>
          <Carousel items={games} id="games-carousel" width="150px" />
          <CarouselNav id="games-carousel" />
        </div>
      </section>

      <div className="divider"></div>

      {/* SECURITY */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div>
              <div className="section-label">Featured</div>
              <h2 className="section-title">Cyber Security</h2>
            </div>
            <Link href="/category?cat=security" className="section-more">
              All →
            </Link>
          </div>
          <CardGrid items={security} gridClass="grid-3 stagger" />
        </div>
      </section>

      <div className="divider"></div>

      {/* BOOKS */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <div>
              <div className="section-label">Read</div>
              <h2 className="section-title">Books</h2>
            </div>
            <Link href="/category?cat=books" className="section-more">
              All →
            </Link>
          </div>
          <Carousel items={books} id="books-carousel" width="150px" />
          <CarouselNav id="books-carousel" />
        </div>
      </section>

      <div className="divider"></div>

      {/* NEWSLETTER */}
      <section className="section">
        <div className="container">
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--rxl)",
              padding: "48px 32px",
              textAlign: "center",
              maxWidth: "600px",
              margin: "0 auto",
            }}
            className="reveal"
          >
            <div className="ai-badge" style={{ marginBottom: "16px" }}>
              ✦ Weekly Digest
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,4vw,34px)",
                fontWeight: 900,
                letterSpacing: "-.04em",
                marginBottom: "12px",
              }}
            >
              Never Miss What&apos;s Next
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "var(--t2)",
                maxWidth: "380px",
                margin: "0 auto 28px",
                lineHeight: 1.6,
              }}
            >
              AI-curated weekly picks straight to your inbox. Every Sunday. No
              spam.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("✦ You're on the list!");
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  maxWidth: "400px",
                  margin: "0 auto 12px",
                }}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                  style={{
                    flex: 1,
                    background: "var(--bg3)",
                    border: "1px solid var(--border2)",
                    borderRadius: "99px",
                    padding: "13px 20px",
                    fontSize: "15px",
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
            <p style={{ fontSize: "12px", color: "var(--t3)" }}>
              Join the list. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
