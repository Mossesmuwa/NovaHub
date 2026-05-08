// pages/category.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { PosterCard, ToolCard, CardGrid } from "../components/Card";
import useScrollReveal from "../hooks/useScrollReveal";
import Link from "next/link";
import * as Items from "../lib/items";
import { getCategoryInfo, getAllCategories } from "../lib/helpers";

const SORT_OPTIONS = [
  { id: "trending", label: "🔥 Trending" },
  { id: "rating", label: "⭐ Top Rated" },
  { id: "newest", label: "🆕 Newest" },
  { id: "name", label: "🔤 A–Z" },
];

// Category colours for hero accents
const CAT_ACCENTS = {
  movies: "#E8593C",
  books: "#3B8BD4",
  "ai-tools": "#C9A84C",
  games: "#7F77DD",
  security: "#1D9E75",
  productivity: "#BA7517",
  music: "#D4537E",
  courses: "#0A84FF",
  design: "#FF9F0A",
  science: "#30D158",
  finance: "#1D9E75",
  news: "#636366",
};

export default function CategoryPage() {
  const router = useRouter();
  const [cat, setCat] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("trending");
  const [freeOnly, setFreeOnly] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const c = router.query.cat || "";
    setCat(c);
  }, [router.query.cat]);

  useEffect(() => {
    if (!cat) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Items.getByCategory(cat, { limit: 60, sortBy, freeOnly })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, [cat, sortBy, freeOnly]);

  const info = getCategoryInfo(cat);
  const accent = CAT_ACCENTS[cat] || "#C9A84C";
  const isPoster = ["movies", "books", "games"].includes(cat);
  const categories = getAllCategories();

  // ── All categories grid ──────────────────────────────────────────────────────
  if (!cat) {
    return (
      <Layout activePage="browse">
        <SEO
          title="Browse — NovaHub"
          description="Browse all categories on NovaHub."
        />

        <div
          style={{
            textAlign: "center",
            padding: "calc(var(--nav) + 48px) 20px 40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%,rgba(201,168,76,.09) 0%,transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--gold-glow)",
                border: "1px solid var(--gold-glow2)",
                borderRadius: 99,
                padding: "5px 14px",
                fontSize: 11,
                fontWeight: 800,
                color: "var(--gold)",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              ◫ Browse
            </div>
            <h1
              style={{
                fontSize: "clamp(32px,7vw,56px)",
                fontWeight: 900,
                letterSpacing: "-.05em",
                marginBottom: 10,
              }}
            >
              Browse Categories
            </h1>
            <p
              style={{
                fontSize: 16,
                color: "var(--t2)",
                maxWidth: 460,
                margin: "0 auto",
              }}
            >
              {categories.length} worlds to explore. Pick your rabbit hole.
            </p>
          </div>
        </div>

        <div className="container" style={{ paddingBottom: 80 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
              gap: 12,
            }}
            className="stagger"
          >
            {categories.map((c) => {
              const ac = CAT_ACCENTS[c.id] || "#C9A84C";
              return (
                <Link
                  href={`/category?cat=${c.id}`}
                  className="reveal-scale"
                  key={c.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px 16px",
                    borderRadius: "var(--r)",
                    textDecoration: "none",
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    transition: "all var(--spring)",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = ac + "50";
                    e.currentTarget.style.background = ac + "08";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--bg2)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{c.icon}</div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "var(--t1)",
                      marginBottom: 4,
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--t3)",
                      lineHeight: 1.4,
                    }}
                  >
                    {c.desc}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Layout>
    );
  }

  // ── Single category ───────────────────────────────────────────────────────────
  return (
    <Layout activePage="browse">
      <SEO
        title={`${info.name} — NovaHub`}
        description={`Browse the best ${info.name.toLowerCase()} on NovaHub.`}
      />

      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>

      {/* Hero */}
      <div
        style={{
          padding: "calc(var(--nav) + 48px) 0 36px",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 60% 70% at 50% 0%, ${accent}12 0%, transparent 60%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent 0%, ${accent}40 50%, transparent 100%)`,
          }}
        />

        <div
          className="container"
          style={{ position: "relative", zIndex: 1, textAlign: "center" }}
        >
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--t3)",
              marginBottom: 20,
            }}
          >
            <Link
              href="/"
              style={{ color: "var(--t3)", textDecoration: "none" }}
            >
              Home
            </Link>
            <span>›</span>
            <Link
              href="/category"
              style={{ color: "var(--t3)", textDecoration: "none" }}
            >
              Browse
            </Link>
            <span>›</span>
            <span style={{ color: "var(--t1)", fontWeight: 600 }}>
              {info.name}
            </span>
          </div>

          <div style={{ fontSize: 52, marginBottom: 12 }}>{info.icon}</div>
          <h1
            style={{
              fontSize: "clamp(32px,7vw,56px)",
              fontWeight: 900,
              letterSpacing: "-.05em",
              marginBottom: 10,
            }}
          >
            {info.name}
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "var(--t2)",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            {info.desc}
          </p>

          {items.length > 0 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 16,
                padding: "4px 12px",
                borderRadius: 99,
                background: accent + "18",
                border: `1px solid ${accent}30`,
                fontSize: 12,
                fontWeight: 700,
                color: accent,
              }}
            >
              {items.length} items
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        {/* Filter bar */}
        <div className="filter-bar" style={{ marginTop: 24 }}>
          <span className="filter-label">Sort:</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.id}
                className={`sort-pill${sortBy === s.id ? " active" : ""}`}
                onClick={() => setSortBy(s.id)}
              >
                {s.label}
              </button>
            ))}
            <button
              className={`sort-pill${freeOnly ? " active" : ""}`}
              onClick={() => setFreeOnly((p) => !p)}
            >
              💰 Free Only
            </button>
          </div>
          <div className="filter-right">
            <span className="item-count">
              <strong>{items.length}</strong> items
            </span>
          </div>
        </div>

        {/* Items */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isPoster
                ? "repeat(auto-fill,minmax(160px,1fr))"
                : "repeat(auto-fill,minmax(240px,1fr))",
              gap: 14,
              marginTop: 24,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: isPoster ? 240 : 140,
                  background: "var(--bg2)",
                  borderRadius: "var(--r)",
                  border: "1px solid var(--border)",
                  animation: `pulse 1.5s ease-in-out ${i * 0.06}s infinite`,
                }}
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <CardGrid
            items={items}
            gridClass={isPoster ? "grid-4 stagger" : "grid-3 stagger"}
          />
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <h3>No items yet</h3>
            <p>
              This category is being populated. Check back soon or{" "}
              <Link href="/category" style={{ color: "var(--gold)" }}>
                explore another category
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
