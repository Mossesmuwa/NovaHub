// apps/web/pages/compare.js - Nova Compare Engine
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Items from "shared/lib/items";

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

const Icon = {
  check: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  minus: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  search: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  ),
};

// Nova Score Circle
function ScoreCircle({ score, size = 80 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `conic-gradient(${G.gold} ${score * 3.6}deg, ${G.bg4} 0deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: size - 8,
          height: size - 8,
          borderRadius: "50%",
          background: G.bg2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: size / 3, fontWeight: 900, color: G.gold }}>
          {score}
        </div>
        <div style={{ fontSize: size / 8, color: G.t3, fontWeight: 700 }}>
          SCORE
        </div>
      </div>
    </div>
  );
}

// Comparison Row
function ComparisonRow({ label, value1, value2, type = "text" }) {
  const renderValue = (val) => {
    if (type === "boolean") {
      return val ? (
        <div
          style={{
            color: G.green,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon.check /> Yes
        </div>
      ) : (
        <div
          style={{
            color: G.red,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon.x /> No
        </div>
      );
    }
    if (type === "price") {
      return val ? (
        <div style={{ fontSize: 18, fontWeight: 800, color: G.gold }}>
          ${val}
          <span style={{ fontSize: 12, color: G.t3 }}>/mo</span>
        </div>
      ) : (
        <div style={{ color: G.green, fontWeight: 700 }}>Free</div>
      );
    }
    if (type === "rating") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: val >= 4 ? G.green : val >= 3 ? G.orange : G.red,
            }}
          >
            {val}/5
          </div>
        </div>
      );
    }
    return <div style={{ color: G.t1 }}>{val || "â€”"}</div>;
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 24,
        padding: "16px 0",
        borderBottom: `1px solid ${G.border}`,
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "right", fontSize: 14 }}>
        {renderValue(value1)}
      </div>
      <div
        style={{
          fontSize: 12,
          color: G.t3,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          minWidth: 140,
          textAlign: "center",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14 }}>{renderValue(value2)}</div>
    </div>
  );
}

// Search Bar Component
function SearchBar({ onSelect, selectedItems }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const items = await Items.searchItems(query, { limit: 5 });
        setResults(
          items.filter((i) => !selectedItems.find((s) => s.id === i.id)),
        );
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedItems]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: G.t3,
          }}
        >
          <Icon.search />
        </div>
        <input
          type="text"
          placeholder="Search tools to compare..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 20px 14px 48px",
            background: G.bg3,
            border: `1px solid ${G.border}`,
            borderRadius: 12,
            color: G.t1,
            fontSize: 15,
            outline: "none",
          }}
        />
      </div>

      {results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 8,
            background: G.bg2,
            border: `1px solid ${G.border}`,
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item);
                setQuery("");
                setResults([]);
              }}
              style={{
                width: "100%",
                padding: 12,
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${G.border}`,
                color: G.t1,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                gap: 12,
                alignItems: "center",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = G.bg3)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {item.image && (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: "cover",
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: G.t3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.short_desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 8,
            padding: 20,
            background: G.bg2,
            border: `1px solid ${G.border}`,
            borderRadius: 12,
            textAlign: "center",
            color: G.t3,
            fontSize: 13,
          }}
        >
          Searching...
        </div>
      )}
    </div>
  );
}

export default function ComparePage({ initialItems }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  function handleSelect(item) {
    if (items.length < 2) {
      const newItems = [...items, item];
      setItems(newItems);
      router.push(
        `/compare?items=${newItems.map((i) => i.slug).join(",")}`,
        undefined,
        { shallow: true },
      );
    }
  }

  function handleRemove(index) {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    if (newItems.length > 0) {
      router.push(
        `/compare?items=${newItems.map((i) => i.slug).join(",")}`,
        undefined,
        { shallow: true },
      );
    } else {
      router.push("/compare", undefined, { shallow: true });
    }
  }

  const item1 = items[0];
  const item2 = items[1];

  return (
    <Layout>
      <SEO
        title={
          items.length === 2
            ? `${item1.name} vs ${item2.name} - Compare`
            : "Compare Tools - Nova"
        }
        description={
          items.length === 2
            ? `Detailed comparison of ${item1.name} and ${item2.name}`
            : "Compare features, pricing, and performance of any two tools side-by-side"
        }
      />

      <div style={{ minHeight: "100vh", background: G.bg, paddingTop: 80 }}>
        {/* Header */}
        <div
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${G.gold}06 0%, transparent 60%)`,
            padding: "40px 24px",
            borderBottom: `1px solid ${G.border}`,
          }}
        >
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
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
                marginBottom: 16,
                textTransform: "uppercase",
              }}
            >
              <Icon.sparkle />
              Compare Engine
            </div>

            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: 900,
                marginBottom: 12,
                letterSpacing: "-0.03em",
              }}
            >
              {items.length === 2
                ? `${item1.name} vs ${item2.name}`
                : "Compare Tools Side-by-Side"}
            </h1>
            <p style={{ fontSize: 16, color: G.t2, marginBottom: 32 }}>
              {items.length === 2
                ? "Detailed feature comparison powered by real-time data"
                : "Select two tools to compare features, pricing, and performance"}
            </p>

            {/* Search Bar */}
            {items.length < 2 && (
              <SearchBar onSelect={handleSelect} selectedItems={items} />
            )}
          </div>
        </div>

        {/* Selection Slots */}
        {items.length < 2 && (
          <div style={{ padding: "40px 24px" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: items.length === 0 ? "1fr" : "1fr 1fr",
                  gap: 20,
                }}
              >
                {[0, 1].map((index) => (
                  <div
                    key={index}
                    style={{
                      padding: 32,
                      background: items[index] ? G.bg2 : G.bg3,
                      border: `2px dashed ${items[index] ? G.gold : G.border}`,
                      borderRadius: 16,
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    {items[index] ? (
                      <>
                        <button
                          onClick={() => handleRemove(index)}
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            padding: "6px 12px",
                            background: G.bg4,
                            border: `1px solid ${G.border}`,
                            borderRadius: 8,
                            color: G.t3,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                        {items[index].image && (
                          <div
                            style={{
                              width: 100,
                              height: 100,
                              borderRadius: 12,
                              backgroundImage: `url(${items[index].image})`,
                              backgroundSize: "cover",
                              margin: "0 auto 16px",
                            }}
                          />
                        )}
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            marginBottom: 8,
                          }}
                        >
                          {items[index].name}
                        </div>
                        <div style={{ fontSize: 13, color: G.t3 }}>
                          {items[index].short_desc}
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            fontSize: 48,
                            marginBottom: 16,
                            opacity: 0.3,
                          }}
                        >
                          +
                        </div>
                        <div
                          style={{ fontSize: 14, color: G.t3, fontWeight: 600 }}
                        >
                          {index === 0
                            ? "Select first tool"
                            : "Select second tool"}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comparison Grid */}
        {items.length === 2 && (
          <div style={{ padding: "40px 24px" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              {/* Header Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: 24,
                  marginBottom: 40,
                }}
              >
                {[item1, item2].map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 24,
                      background: G.bg2,
                      border: `1px solid ${G.border}`,
                      borderRadius: 16,
                      textAlign: "center",
                    }}
                  >
                    {item.image && (
                      <div
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 12,
                          backgroundImage: `url(${item.image})`,
                          backgroundSize: "cover",
                          margin: "0 auto 16px",
                        }}
                      />
                    )}
                    <h3
                      style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}
                    >
                      {item.name}
                    </h3>
                    <p style={{ fontSize: 13, color: G.t2, marginBottom: 20 }}>
                      {item.short_desc}
                    </p>
                    <ScoreCircle score={item.rating || 85} />
                    <Link
                      href={`/item/${item.slug}`}
                      style={{
                        display: "inline-block",
                        marginTop: 16,
                        padding: "8px 16px",
                        background: G.bg3,
                        border: `1px solid ${G.border}`,
                        borderRadius: 8,
                        color: G.t1,
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                ))}

                {/* VS Badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: G.gold,
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    VS
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              <div
                style={{
                  background: G.bg2,
                  border: `1px solid ${G.border}`,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>
                  Feature Comparison
                </h3>

                <ComparisonRow
                  label="Category"
                  value1={item1.category_id}
                  value2={item2.category_id}
                />
                <ComparisonRow
                  label="Rating"
                  value1={item1.rating || 4.5}
                  value2={item2.rating || 4.2}
                  type="rating"
                />
                <ComparisonRow
                  label="Community Saves"
                  value1={item1.save_count || 0}
                  value2={item2.save_count || 0}
                />
                <ComparisonRow
                  label="Views"
                  value1={item1.view_count || 0}
                  value2={item2.view_count || 0}
                />
                <ComparisonRow
                  label="Trending"
                  value1={item1.trending}
                  value2={item2.trending}
                  type="boolean"
                />
                <ComparisonRow
                  label="Featured"
                  value1={item1.featured}
                  value2={item2.featured}
                  type="boolean"
                />
                <ComparisonRow
                  label="Release Year"
                  value1={item1.year}
                  value2={item2.year}
                />
              </div>

              {/* Change Selection */}
              <div style={{ textAlign: "center", marginTop: 32 }}>
                <button
                  onClick={() => {
                    setItems([]);
                    router.push("/compare", undefined, { shallow: true });
                  }}
                  style={{
                    padding: "12px 24px",
                    background: G.bg3,
                    border: `1px solid ${G.border}`,
                    borderRadius: 10,
                    color: G.t1,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Compare Different Tools
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ query }) {
  const { items: itemSlugs } = query;

  if (!itemSlugs) {
    return { props: { initialItems: [] } };
  }

  try {
    const slugs = itemSlugs.split(",").slice(0, 2);
    const items = await Promise.all(
      slugs.map((slug) => Items.getItemBySlug(slug)),
    );

    return {
      props: {
        initialItems: items.filter(Boolean),
      },
    };
  } catch (err) {
    console.error("Compare page error:", err);
    return { props: { initialItems: [] } };
  }
}

