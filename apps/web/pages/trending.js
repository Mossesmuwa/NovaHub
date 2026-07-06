<<<<<<< HEAD
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { getSupabase } from "shared/lib/supabaseClient";
=======
﻿// pages/trending.js
// Real-time trending page showing rising stars and momentum
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { colors } from "@lib/design";
import Navbar from "@components/Navbar";
import Footer from "@components/Footer";
>>>>>>> 50591a7c90e60952c5363e2bd4a789b18f50b8fb

export default function TrendingPage({ trendingData = [] }) {
  const [activeChart, setActiveChart] = useState("weekly");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredItem, setHoveredItem] = useState(null);

  const categories = [
    { id: "all", label: "All", count: 150 },
    { id: "ai-coding", label: "AI Coding", count: 42 },
    { id: "ai-writing", label: "AI Writing", count: 28 },
    { id: "productivity", label: "Productivity", count: 35 },
    { id: "design", label: "Design", count: 20 },
  ];
<<<<<<< HEAD

  if (rank < 3) {
    const medal = medals[rank];
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill={medal.color}
          stroke={medal.color}
          strokeWidth="1"
        >
          <circle cx="12" cy="8" r="4"></circle>
          <path d="M6 12h12v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-8z"></path>
          <line x1="6" y1="12" x2="3" y2="18"></line>
          <line x1="18" y1="12" x2="21" y2="18"></line>
        </svg>
      </div>
    );
  }
  return (
    <div style={{ fontSize: 18, fontWeight: 900, color: "#666" }}>
      #{rank + 1}
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("items")
      .select(
        "id, slug, name, short_desc, long_desc, image, category_id, type, trending_score",
      )
      .eq("approved", true)
      .order("trending_score", { ascending: false })
      .limit(10);

    if (error) throw error;

    const items = (data || []).map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      description:
        item.short_desc || item.long_desc || "No description available",
      category: item.category_id || item.type || "General",
      image: item.image,
      trending_score: item.trending_score ?? 0,
    }));

    return { props: { items } };
  } catch (err) {
    console.error("[trending] failed to load items", err);
    return { props: { items: [] } };
  }
}
=======
>>>>>>> 50591a7c90e60952c5363e2bd4a789b18f50b8fb

  // Mock trending data
  const trendingItems = [
    {
      rank: 1,
      name: "Cursor",
      growth: 340,
      score: 91,
      emoji: "🖱️",
      trending: "up",
      change: "+340%",
    },
    {
      rank: 2,
      name: "Claude AI",
      growth: 280,
      score: 92,
      emoji: "🧠",
      trending: "up",
      change: "+280%",
    },
    {
      rank: 3,
      name: "Copilot",
      growth: 150,
      score: 88,
      emoji: "✈️",
      trending: "up",
      change: "+150%",
    },
    {
      rank: 4,
      name: "GPT-4 Turbo",
      growth: 200,
      score: 89,
      emoji: "🚀",
      trending: "up",
      change: "+200%",
    },
    {
      rank: 5,
      name: "Perplexity",
      growth: 220,
      score: 85,
      emoji: "❓",
      trending: "up",
      change: "+220%",
    },
    {
      rank: 6,
      name: "Midjourney",
      growth: 120,
      score: 87,
      emoji: "🎨",
      trending: "up",
      change: "+120%",
    },
    {
      rank: 7,
      name: "Notionv2",
      growth: 95,
      score: 84,
      emoji: "📝",
      trending: "up",
      change: "+95%",
    },
    {
      rank: 8,
      name: "Figma AI",
      growth: 180,
      score: 86,
      emoji: "✨",
      trending: "up",
      change: "+180%",
    },
  ];

  const risingStars = [
    { name: "New Startup AI", growth: 450, week: "this week", emoji: "⭐" },
    { name: "Code Generator Pro", growth: 380, week: "this week", emoji: "💻" },
    { name: "Design Assistant", growth: 320, week: "today", emoji: "🎯" },
  ];

<<<<<<< HEAD
  const sorted = useMemo(() => {
    return [...safeItems].sort(
      (a, b) => (b.trending_score || 0) - (a.trending_score || 0),
    );
  }, [safeItems]);

  const hero = sorted[0];
  const rest = sorted.slice(1, 10);

  if (!hero) {
    return (
      <Layout activePage="trending">
        <SEO title="Trending — NovaHub" />
        <div style={styles.center}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: "#fff", textAlign: "center" }}
          >
            <h2>No trending data yet</h2>
            <p style={{ color: THEME.text2 }}>Waiting for live signals...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage="trending">
      <SEO title="Trending — NovaHub" />
      <div style={styles.page}>
        <div style={styles.glow} />

        <div style={styles.container}>
          <header style={styles.header}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={styles.kicker}>GLOBAL TREND ENGINE</div>
              <h1 style={styles.title}>
                What’s <span style={{ color: THEME.gold }}>Exploding</span> Now
              </h1>
            </motion.div>
          </header>

          <div style={styles.grid}>
            <motion.div whileHover={{ scale: 1.01 }} style={styles.hero}>
              {getRankMedal(0)}

              <h2 style={styles.heroTitle}>{hero.name}</h2>

              <p style={styles.desc}>
                {hero.description || "No description available"}
              </p>

              <div style={styles.metaRow}>
                <div>
                  <div style={styles.label}>TREND SCORE</div>
                  <div style={styles.score}>{hero.trending_score ?? 0}</div>
                </div>

                <div>
                  <div style={styles.label}>CATEGORY</div>
                  <div style={styles.category}>
                    {hero.category || "General"}
                  </div>
                </div>
              </div>
            </motion.div>

            <div style={styles.list}>
              <AnimatePresence>
                {rest.map((item, i) => (
                  <motion.div
                    key={item.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ x: 6 }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      ...styles.card,
                      borderColor: hovered === i ? THEME.gold : THEME.border,
                    }}
                  >
                    <div style={styles.rank}>{getRankMedal(i + 1)}</div>

                    {item.image ? (
                      <img src={item.image} alt="" style={styles.img} />
                    ) : (
                      <div style={styles.imgPlaceholder} />
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={styles.name}>{item.name}</div>
                      <div style={styles.sub}>{item.category}</div>
                    </div>

                    <div style={styles.points}>{item.trending_score ?? 0}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
=======
  const insights = [
    {
      icon: "🚀",
      title: "AI Boom Continues",
      desc: "AI tools show 3.2x growth vs last month",
    },
    {
      icon: "📱",
      title: "Mobile First",
      desc: "65% of trending tools have mobile apps",
    },
    {
      icon: "💰",
      title: "Funding Wave",
      desc: "Top 10 trending raised $2.3B this quarter",
    },
    {
      icon: "👥",
      title: "Community Power",
      desc: "User-reviewed items rank highest",
    },
  ];

  return (
    <>
      <Head>
        <title>Trending Now | Intelligence Platform</title>
        <meta
          name="description"
          content="See what's trending in tech, ranked by intelligence"
        />
      </Head>

      <Navbar />

      <div style={{ background: colors.bg, minHeight: "100vh" }}>
        {/* Hero section */}
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg3} 100%)`,
            padding: "60px 24px",
            borderBottom: `1px solid ${colors.bg3}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background accent */}
          <div
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              background: `radial-gradient(circle, ${colors.gold}08, transparent)`,
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            <h1
              style={{
                fontSize: "clamp(28px, 6vw, 48px)",
                fontWeight: 900,
                margin: 0,
                marginBottom: 12,
                color: colors.t1,
                letterSpacing: "-0.02em",
              }}
            >
              📈 Trending Now
            </h1>
            <p
              style={{
                fontSize: 16,
                color: colors.t2,
                margin: 0,
                maxWidth: 600,
                lineHeight: 1.6,
              }}
            >
              Real-time intelligence on what's gaining momentum. Updated hourly.
            </p>

            {/* Time period selector */}
            <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
              {["today", "weekly", "monthly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setActiveChart(period)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: `1px solid ${activeChart === period ? colors.gold : colors.bg3}`,
                    background:
                      activeChart === period ? colors.gold + "20" : colors.bg,
                    color: activeChart === period ? colors.gold : colors.t2,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (activeChart !== period) {
                      e.currentTarget.style.borderColor = colors.gold;
                      e.currentTarget.style.color = colors.gold;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeChart !== period) {
                      e.currentTarget.style.borderColor = colors.bg3;
                      e.currentTarget.style.color = colors.t2;
                    }
                  }}
                >
                  {period === "today" && "📅 Today"}
                  {period === "weekly" && "📆 This Week"}
                  {period === "monthly" && "📊 This Month"}
                </button>
              ))}
>>>>>>> 50591a7c90e60952c5363e2bd4a789b18f50b8fb
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
          {/* Top trending with chart visualization */}
          <section style={{ marginBottom: 60 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 900,
                margin: 0,
                marginBottom: 24,
                color: colors.t1,
              }}
            >
              🔥 Top Trending
            </h2>

            <div
              style={{
                background: colors.bg2,
                borderRadius: 16,
                border: `1px solid ${colors.bg3}`,
                padding: 24,
              }}
            >
              {trendingItems.slice(0, 8).map((item, idx) => {
                const maxGrowth = Math.max(
                  ...trendingItems.map((i) => i.growth),
                );
                const barWidth = (item.growth / maxGrowth) * 100;

                return (
                  <Link
                    key={item.name}
                    href={`/item/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <a
                      onMouseEnter={() => setHoveredItem(idx)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 1fr 120px 120px 80px",
                        gap: 16,
                        padding: 16,
                        borderRadius: 12,
                        background:
                          hoveredItem === idx ? colors.bg3 : colors.bg,
                        borderBottom:
                          idx < 7 ? `1px solid ${colors.bg3}` : "none",
                        transition: "all 0.3s ease",
                        alignItems: "center",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      {/* Rank */}
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: idx === 0 ? colors.gold : colors.t2,
                          textAlign: "center",
                        }}
                      >
                        {item.rank === 1 && "🥇"}
                        {item.rank === 2 && "🥈"}
                        {item.rank === 3 && "🥉"}
                        {item.rank > 3 && `#${item.rank}`}
                      </div>

                      {/* Item info */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color:
                              hoveredItem === idx ? colors.gold : colors.t1,
                            transition: "color 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span style={{ fontSize: 16 }}>{item.emoji}</span>
                          {item.name}
                        </div>

                        {/* Growth bar */}
                        <div
                          style={{
                            height: 4,
                            background: colors.bg3,
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${barWidth}%`,
                              background: `linear-gradient(90deg, ${colors.gold}, ${colors.gold}60)`,
                              animation:
                                hoveredItem === idx
                                  ? "pulse 1s ease-in-out"
                                  : "none",
                            }}
                          />
                        </div>
                      </div>

                      {/* Growth % */}
                      <div
                        style={{
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 900,
                            color: colors.gold,
                          }}
                        >
                          {item.change}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: colors.t3,
                          }}
                        >
                          this{" "}
                          {activeChart === "today"
                            ? "day"
                            : activeChart === "weekly"
                              ? "week"
                              : "month"}
                        </div>
                      </div>

                      {/* Score */}
                      <div
                        style={{
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: colors.t1,
                          }}
                        >
                          {item.score}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: colors.t3,
                          }}
                        >
                          Score
                        </div>
                      </div>

                      {/* View button */}
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: colors.gold,
                        }}
                      >
                        →
                      </div>
                    </a>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Rising stars */}
          <section style={{ marginBottom: 60 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 900,
                margin: 0,
                marginBottom: 24,
                color: colors.t1,
              }}
            >
              ⭐ Rising Stars
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {risingStars.map((star, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredItem(`rising-${idx}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    padding: 24,
                    background: colors.bg2,
                    borderRadius: 12,
                    border: `1px solid ${hoveredItem === `rising-${idx}` ? colors.gold + "40" : colors.bg3}`,
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform:
                      hoveredItem === `rising-${idx}`
                        ? "translateY(-8px)"
                        : "translateY(0)",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>
                    {star.emoji}
                  </div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      margin: 0,
                      marginBottom: 8,
                      color:
                        hoveredItem === `rising-${idx}`
                          ? colors.gold
                          : colors.t1,
                      transition: "color 0.2s ease",
                    }}
                  >
                    {star.name}
                  </h3>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: colors.green,
                      marginBottom: 8,
                    }}
                  >
                    +{star.growth}% {star.week}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: colors.t3,
                      marginBottom: 16,
                    }}
                  >
                    New entrant making waves
                  </div>
                  <button
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      border: `1px solid ${colors.gold}40`,
                      background: colors.gold + "10",
                      color: colors.gold,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.gold;
                      e.currentTarget.style.color = "#000";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.gold + "10";
                      e.currentTarget.style.color = colors.gold;
                    }}
                  >
                    Explore
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Market insights */}
          <section style={{ marginBottom: 60 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 900,
                margin: 0,
                marginBottom: 24,
                color: colors.t1,
              }}
            >
              💡 Market Insights
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 20,
                    background: colors.bg2,
                    borderRadius: 12,
                    border: `1px solid ${colors.bg3}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      marginBottom: 12,
                    }}
                  >
                    {insight.icon}
                  </div>
                  <h4
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      margin: 0,
                      marginBottom: 6,
                      color: colors.t1,
                    }}
                  >
                    {insight.title}
                  </h4>
                  <p
                    style={{
                      fontSize: 12,
                      color: colors.t3,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {insight.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Category filter */}
          <section
            style={{
              padding: 32,
              background: colors.bg2,
              borderRadius: 12,
              border: `1px solid ${colors.bg3}`,
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                margin: 0,
                marginBottom: 16,
                color: colors.t1,
              }}
            >
              Filter by Category
            </h3>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: `1px solid ${selectedCategory === cat.id ? colors.gold : colors.bg3}`,
                    background:
                      selectedCategory === cat.id
                        ? colors.gold + "20"
                        : colors.bg,
                    color:
                      selectedCategory === cat.id ? colors.gold : colors.t2,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.borderColor = colors.gold;
                      e.currentTarget.style.color = colors.gold;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.borderColor = colors.bg3;
                      e.currentTarget.style.color = colors.t2;
                    }
                  }}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
<<<<<<< HEAD
    </Layout>
  );
}

const styles = {
  page: {
    background: THEME.bg,
    minHeight: "100vh",
    color: "#fff",
    padding: "0 20px",
  },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
    paddingTop: 100,
    position: "relative",
    zIndex: 2,
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
  },

  glow: {
    position: "fixed",
    top: "-20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "70vw",
    height: "60vh",
    background:
      "radial-gradient(circle, rgba(212,175,55,0.12), transparent 70%)",
    pointerEvents: "none",
  },

  header: {
    marginBottom: 60,
  },

  kicker: {
    fontSize: 12,
    letterSpacing: 3,
    color: THEME.gold,
  },

  title: {
    fontSize: "clamp(40px, 6vw, 80px)",
    fontWeight: 900,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: 24,
  },

  hero: {
    padding: 40,
    borderRadius: 28,
    background: THEME.glass,
    border: `1px solid ${THEME.gold}55`,
    backdropFilter: "blur(20px)",
  },

  heroTitle: {
    fontSize: 38,
    fontWeight: 900,
  },

  desc: {
    color: THEME.text2,
    marginTop: 10,
    lineHeight: 1.5,
  },

  metaRow: {
    marginTop: 30,
    display: "flex",
    gap: 40,
  },

  label: {
    fontSize: 11,
    color: THEME.gold,
    letterSpacing: 2,
  },

  score: {
    fontSize: 22,
    fontWeight: 800,
  },

  category: {
    fontWeight: 600,
    color: THEME.text2,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  card: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    background: THEME.glass,
    border: `1px solid ${THEME.border}`,
    transition: "0.2s ease",
  },

  rank: {
    opacity: 0.5,
    fontWeight: 800,
    width: 40,
  },

  img: {
    width: 42,
    height: 42,
    borderRadius: 10,
    objectFit: "cover",
  },

  imgPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "rgba(255,255,255,0.08)",
  },

  name: {
    fontWeight: 700,
  },

  sub: {
    fontSize: 12,
    color: THEME.text2,
  },

  points: {
    color: THEME.gold,
    fontWeight: 800,
  },
};
=======

      <Footer />

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {
      trendingData: [],
    },
    revalidate: 60, // Update every minute
  };
}
>>>>>>> 50591a7c90e60952c5363e2bd4a789b18f50b8fb
