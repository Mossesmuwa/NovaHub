// pages/compare/[item1]-vs-[item2].js
// Complete comparison page - side-by-side intelligence comparison

import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { colors } from "@shared/lib/design";

export default function ComparePage({ item1, item2 }) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [hoveredRow, setHoveredRow] = useState(null);

  // Handle missing data
  if (!item1 || !item2) {
    return (
      <div
        style={{
          background: colors.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: colors.t3 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: colors.t2,
            }}
          >
            Tools not found
          </div>
        </div>
      </div>
    );
  }

  // Determine winner for each category
  const getWinner = (val1, val2) => {
    if (val1 > val2) return 1;
    if (val2 > val1) return 2;
    return 0;
  };

  // Comparison data
  const comparisonRows = [
    {
      category: "Intelligence Score",
      icon: "⭐",
      val1: item1.nova_score || 75,
      val2: item2.nova_score || 70,
      unit: "/100",
    },
    {
      category: "Community Support",
      icon: "👥",
      val1: item1.save_count || 5000,
      val2: item2.save_count || 4000,
      unit: "saves",
    },
    {
      category: "Market Momentum",
      icon: "📈",
      val1: item1.trending_score || 85,
      val2: item2.trending_score || 78,
      unit: "/100",
    },
    {
      category: "Data Freshness",
      icon: "🔄",
      val1: item1.freshness || 98,
      val2: item2.freshness || 95,
      unit: "%",
    },
    {
      category: "User Rating",
      icon: "🏆",
      val1: item1.rating || 4.6,
      val2: item2.rating || 4.3,
      unit: "/5",
    },
  ];

  // Feature comparison data
  const features = {
    Pricing: [
      { name: "Free Tier", val1: "Yes", val2: "Yes" },
      { name: "Pro Plan", val1: "$20/mo", val2: "$20/mo" },
      { name: "Enterprise", val1: "Custom", val2: "Custom" },
    ],

    Integration: [
      { name: "VS Code", val1: "Yes", val2: "Yes" },
      { name: "JetBrains", val1: "Yes", val2: "Limited" },
      { name: "GitHub", val1: "Full", val2: "Basic" },
    ],

    Features: [
      { name: "AI Code Completion", val1: "Yes", val2: "Yes" },
      { name: "Real-time Suggestions", val1: "Yes", val2: "Yes" },
      { name: "Custom Training", val1: "Pro", val2: "Enterprise" },
    ],
  };

  // Navigation tabs
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "users", label: "Users" },
  ];

  return (
    <>
      <Head>
        <title>
          {item1.name} vs {item2.name} | Comparison
        </title>

        <meta
          name="description"
          content={`Compare ${item1.name} and ${item2.name} side-by-side with detailed intelligence analysis`}
        />

        <meta property="og:title" content={`${item1.name} vs ${item2.name}`} />
      </Head>

      <Navbar />

      <div
        style={{
          background: colors.bg,
          minHeight: "100vh",
        }}
      >
        {/* Hero header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg3} 100%)`,
            padding: "40px 24px",
            borderBottom: `1px solid ${colors.bg3}`,
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              {/* Item 1 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {item1.image && (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      backgroundImage: `url(${item1.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                )}

                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: colors.t1,
                  }}
                >
                  {item1.name}
                </div>
              </div>

              {/* VS */}
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: colors.gold,
                }}
              >
                ⚔️
              </div>

              {/* Item 2 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {item2.image && (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      backgroundImage: `url(${item2.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                )}

                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: colors.t1,
                  }}
                >
                  {item2.name}
                </div>
              </div>
            </div>

            <p
              style={{
                textAlign: "center",
                fontSize: 14,
                color: colors.t3,
                margin: 0,
              }}
            >
              Detailed side-by-side comparison based on intelligence data
            </p>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px 24px",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${colors.bg3}`,
              marginBottom: 40,
              gap: 8,
              overflowX: "auto",
              paddingBottom: 16,
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                style={{
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    selectedTab === tab.id
                      ? `2px solid ${colors.gold}`
                      : "2px solid transparent",
                  color: selectedTab === tab.id ? colors.gold : colors.t3,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {selectedTab === "overview" && (
            <div style={{ display: "grid", gap: 24 }}>
              {/* Comparison grid */}
              <div
                style={{
                  borderRadius: 12,
                  border: `1px solid ${colors.bg3}`,
                  overflow: "hidden",
                }}
              >
                {comparisonRows.map((row, idx) => {
                  const winner = getWinner(row.val1, row.val2);

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        borderBottom:
                          idx < comparisonRows.length - 1
                            ? `1px solid ${colors.bg3}`
                            : "none",
                        background:
                          hoveredRow === idx ? colors.bg3 : colors.bg2,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Category */}
                      <div
                        style={{
                          padding: 20,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontWeight: 700,
                          fontSize: 14,
                          color: colors.t1,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{row.icon}</span>

                        {row.category}
                      </div>

                      {/* Item 1 value */}
                      <div
                        style={{
                          padding: 20,
                          textAlign: "center",
                          fontWeight: winner === 1 ? 800 : 600,
                          fontSize: 14,
                          color: winner === 1 ? colors.gold : colors.t2,
                        }}
                      >
                        {winner === 1 && "🏆 "}
                        {row.val1} {row.unit}
                      </div>

                      {/* Item 2 value */}
                      <div
                        style={{
                          padding: 20,
                          textAlign: "center",
                          fontWeight: winner === 2 ? 800 : 600,
                          fontSize: 14,
                          color: winner === 2 ? colors.gold : colors.t2,
                        }}
                      >
                        {winner === 2 && "🏆 "}
                        {row.val2} {row.unit}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Winner verdict */}
              <div
                style={{
                  padding: 24,
                  background: `linear-gradient(135deg, ${colors.gold}10, ${colors.gold}05)`,
                  borderRadius: 12,
                  border: `1px solid ${colors.gold}40`,
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    marginBottom: 12,
                    color: colors.t1,
                  }}
                >
                  🏆 The Verdict
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    color: colors.t2,
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  <strong>{item1.name}</strong> wins on market momentum and
                  community adoption.
                  <strong> {item2.name}</strong> offers strong core features
                  with excellent data freshness.
                </p>

                {/* CTA Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href={`/item/${item1.slug}`}
                    style={{
                      padding: "10px 16px",
                      background: colors.gold,
                      color: "#000",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Try {item1.name}
                  </Link>

                  <Link
                    href={`/item/${item2.slug}`}
                    style={{
                      padding: "10px 16px",
                      background: colors.bg3,
                      color: colors.t1,
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      border: `1px solid ${colors.bg4}`,
                    }}
                  >
                    Try {item2.name}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {selectedTab === "features" && (
            <div style={{ display: "grid", gap: 24 }}>
              {Object.entries(features).map(([category, featureList]) => (
                <div key={category}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      marginBottom: 12,
                      color: colors.t1,
                    }}
                  >
                    {category}
                  </h3>

                  <div
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${colors.bg3}`,
                      overflow: "hidden",
                    }}
                  >
                    {featureList.map((feature, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          borderBottom:
                            idx < featureList.length - 1
                              ? `1px solid ${colors.bg3}`
                              : "none",
                          background: colors.bg2,
                        }}
                      >
                        <div
                          style={{
                            padding: 16,
                            fontWeight: 700,
                            fontSize: 13,
                            color: colors.t1,
                          }}
                        >
                          {feature.name}
                        </div>

                        <div
                          style={{
                            padding: 16,
                            textAlign: "center",
                            fontSize: 13,
                            color: colors.t2,
                          }}
                        >
                          {feature.val1}
                        </div>

                        <div
                          style={{
                            padding: 16,
                            textAlign: "center",
                            fontSize: 13,
                            color: colors.t2,
                          }}
                        >
                          {feature.val2}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Placeholder tabs */}
          {(selectedTab === "pricing" || selectedTab === "users") && (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                color: colors.t3,
                background: colors.bg2,
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  marginBottom: 12,
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth="2">
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
              </div>

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: colors.t2,
                }}
              >
                {selectedTab === "pricing"
                  ? "Pricing Comparison"
                  : "User Base Comparison"}
              </div>

              <p
                style={{
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                Detailed data coming soon
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

// Server-side rendering
export async function getServerSideProps({ params }) {
  const { item1: slug1, item2: slug2 } = params;

  try {
    // TODO: Replace with real database query
    const item1 = {
      id: "1",
      slug: slug1,
      name: "Cursor",
      image: "/images/cursor.jpg",
      nova_score: 91,
      save_count: 12000,
      trending_score: 95,
      freshness: 99,
      rating: 4.8,
    };

    const item2 = {
      id: "2",
      slug: slug2,
      name: "Copilot",
      image: "/images/copilot.jpg",
      nova_score: 88,
      save_count: 18000,
      trending_score: 88,
      freshness: 96,
      rating: 4.6,
    };

    return {
      props: {
        item1,
        item2,
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
}
