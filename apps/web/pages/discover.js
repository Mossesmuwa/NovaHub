// pages/discover.js
// Premium discovery page with advanced filtering and infinite scroll
import Head from "next/head";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { colors } from "../lib/design";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function DiscoverPage({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [filteredItems, setFilteredItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Intersection observer for infinite scroll
  const observerTarget = useRef(null);

  // Filter categories
  const categories = [
    { id: "all", label: "All Tools", count: 1200 },
    { id: "ai-coding", label: "AI Coding", count: 120 },
    { id: "ai-writing", label: "AI Writing", count: 95 },
    { id: "productivity", label: "Productivity", count: 340 },
    { id: "design", label: "Design", count: 210 },
    { id: "analytics", label: "Analytics", count: 180 },
  ];

  // Sort options
  const sortOptions = [
    { id: "trending", label: "📈 Trending" },
    { id: "newest", label: "✨ Newest" },
    { id: "score", label: "⭐ Highest Score" },
    { id: "saves", label: "💾 Most Saved" },
    { id: "views", label: "👁️ Most Viewed" },
  ];

  // Apply filters
  useEffect(() => {
    let filtered = [...items];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.short_desc.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (item) => item.category_id === selectedCategory,
      );
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((item) => (item.rating || 0) >= minRating);
    }

    // Sort
    switch (sortBy) {
      case "trending":
        filtered.sort(
          (a, b) => (b.trending_score || 0) - (a.trending_score || 0),
        );
        break;
      case "score":
        filtered.sort((a, b) => (b.nova_score || 0) - (a.nova_score || 0));
        break;
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        break;
      case "saves":
        filtered.sort((a, b) => (b.save_count || 0) - (a.save_count || 0));
        break;
      case "views":
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, selectedCategory, sortBy, minRating]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items?offset=${offset + 20}&limit=20`);
      const data = await res.json();

      if (data.items.length > 0) {
        setItems([...items, ...data.items]);
        setOffset(offset + 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("trending");
    setMinRating(0);
    setPriceRange([0, 200]);
  };

  const activeFiltersCount = [
    searchQuery ? 1 : 0,
    selectedCategory !== "all" ? 1 : 0,
    minRating > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <>
      <Head>
        <title>Discover Tools | Intelligence Platform</title>
        <meta
          name="description"
          content="Browse and discover the best tools ranked by intelligence score"
        />
      </Head>

      <Navbar />

      <div style={{ background: colors.bg, minHeight: "100vh" }}>
        {/* Hero header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg3} 100%)`,
            padding: "40px 24px",
            borderBottom: `1px solid ${colors.bg3}`,
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 900,
                margin: 0,
                marginBottom: 8,
                color: colors.t1,
              }}
            >
              🔍 Discover Tools
            </h1>
            <p
              style={{
                fontSize: 14,
                color: colors.t3,
                margin: 0,
              }}
            >
              Browse {filteredItems.length} tools ranked by intelligence
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
          {/* Search bar */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                gap: 8,
              }}
            >
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 40px",
                    borderRadius: 10,
                    border: `1px solid ${colors.bg3}`,
                    background: colors.bg2,
                    color: colors.t1,
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.gold;
                    e.currentTarget.style.boxShadow = `0 0 12px ${colors.gold}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.bg3;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    color: colors.t3,
                    fontSize: 16,
                  }}
                >
                  🔍
                </span>
              </div>

              {/* Filter toggle button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `1px solid ${showFilters ? colors.gold : colors.bg3}`,
                  background: showFilters ? colors.gold + "15" : colors.bg2,
                  color: showFilters ? colors.gold : colors.t2,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  if (!showFilters) {
                    e.currentTarget.style.borderColor = colors.gold;
                    e.currentTarget.style.color = colors.gold;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showFilters) {
                    e.currentTarget.style.borderColor = colors.bg3;
                    e.currentTarget.style.color = colors.t2;
                  }
                }}
              >
                🎚️ Filter
                {activeFiltersCount > 0 && (
                  <span
                    style={{
                      padding: "2px 6px",
                      background: colors.red,
                      borderRadius: 4,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `1px solid ${colors.bg3}`,
                  background: colors.bg2,
                  color: colors.t1,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div
              style={{
                padding: 20,
                background: colors.bg2,
                borderRadius: 12,
                border: `1px solid ${colors.bg3}`,
                marginBottom: 32,
                animation: "slideDown 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    margin: 0,
                    color: colors.t1,
                  }}
                >
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  style={{
                    background: "none",
                    border: "none",
                    color: colors.gold,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Clear All
                </button>
              </div>

              {/* Category filter */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: colors.t3,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Category
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: `1px solid ${selectedCategory === cat.id ? colors.gold : colors.bg3}`,
                        background:
                          selectedCategory === cat.id
                            ? colors.gold + "20"
                            : colors.bg,
                        color:
                          selectedCategory === cat.id ? colors.gold : colors.t2,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating filter */}
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: colors.t3,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Minimum Rating
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: `1px solid ${minRating === rating ? colors.gold : colors.bg3}`,
                        background:
                          minRating === rating ? colors.gold + "20" : colors.bg,
                        color: minRating === rating ? colors.gold : colors.t2,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {rating === 0 ? "All" : `${rating}+⭐`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          <div
            style={{
              marginBottom: 20,
              fontSize: 13,
              color: colors.t3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              Showing{" "}
              <span style={{ fontWeight: 700, color: colors.gold }}>
                {filteredItems.length}
              </span>{" "}
              results
            </span>
          </div>

          {/* Items grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
              marginBottom: 40,
            }}
          >
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/item/${item.slug}`}>
                <a
                  style={{
                    padding: 16,
                    background: colors.bg2,
                    borderRadius: 12,
                    border: `1px solid ${colors.bg3}`,
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    height: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.borderColor = colors.gold + "40";
                    e.currentTarget.style.boxShadow = `0 12px 32px ${colors.gold}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = colors.bg3;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Image */}
                  {item.image && (
                    <div
                      style={{
                        width: "100%",
                        height: 160,
                        borderRadius: 8,
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  )}

                  {/* Content */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: colors.t1,
                      }}
                    >
                      {item.name}
                    </div>

                    <p
                      style={{
                        fontSize: 12,
                        color: colors.t3,
                        margin: 0,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.short_desc}
                    </p>

                    {/* Footer */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 8,
                        borderTop: `1px solid ${colors.bg3}`,
                        fontSize: 11,
                      }}
                    >
                      <span style={{ color: colors.gold, fontWeight: 700 }}>
                        ⭐ {(item.nova_score || item.rating || 0).toFixed(0)}
                        /100
                      </span>
                      <span style={{ color: colors.t3 }}>
                        💾 {(item.save_count || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>

          {/* No results */}
          {filteredItems.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                color: colors.t3,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 6,
                  color: colors.t2,
                }}
              >
                No tools found
              </div>
              <p style={{ fontSize: 13, margin: 0 }}>
                Try adjusting your filters or search query
              </p>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: 20,
                color: colors.t3,
              }}
            >
              ⏳ Loading more...
            </div>
          )}

          {/* Infinite scroll target */}
          <div ref={observerTarget} style={{ height: 10 }} />
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
  // TODO: Fetch initial items
  return {
    props: {
      initialItems: [],
    },
    revalidate: 3600,
  };
}
