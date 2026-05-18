// pages/item/[slug].js
// Premium item detail page - complete intelligence layer with all 4 cores visible
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "shared/lib/supabase";
import { colors } from "shared/lib/design";

// Import premium components
import ScoreGauge from "../../components/ScoreGauge";
import ScoreBreakdown from "../../components/ScoreBreakdown";
import TrendAnalysis from "../../components/TrendAnalysis";
import TrustBadge from "../../components/TrustBadge";
import AuditTrail from "../../components/AuditTrail";
import CompareButton from "../../components/CompareButton";

export default function ItemDetail({
  item,
  novaScore,
  quality,
  dataSources,
  changeHistory,
}) {
  const [compareOpen, setCompareOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(item.save_count || 0);

  // Handle save
  const handleSave = async () => {
    setIsSaved(!isSaved);
    setSaveCount(isSaved ? saveCount - 1 : saveCount + 1);
    // TODO: persist to database
  };

  return (
    <>
      <Head>
        <title>{item.name} | Intelligence Platform</title>
        <meta name="description" content={item.short_desc} />
        <meta property="og:title" content={item.name} />
        <meta property="og:description" content={item.short_desc} />
        <meta property="og:image" content={item.image} />
      </Head>

      <div style={{ minHeight: "100vh", background: colors.bg }}>
        {/* Hero Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg3} 100%)`,
            borderBottom: `1px solid ${colors.bg3}`,
            padding: "48px 24px",
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
              width: 300,
              height: 300,
              background: `radial-gradient(circle, ${colors.gold}10, transparent)`,
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: 32,
                alignItems: "start",
              }}
            >
              {/* Item image */}
              {item.image && (
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `2px solid ${colors.gold}40`,
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={140}
                    height={140}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}

              {/* Item info */}
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      background: colors.gold + "20",
                      border: `1px solid ${colors.gold}40`,
                      borderRadius: 8,
                      color: colors.gold,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.category_id}
                  </span>
                </div>

                <h1
                  style={{
                    fontSize: 44,
                    fontWeight: 900,
                    margin: 0,
                    marginBottom: 8,
                    letterSpacing: "-0.02em",
                    color: colors.t1,
                  }}
                >
                  {item.name}
                </h1>

                <p
                  style={{
                    fontSize: 18,
                    color: colors.t2,
                    margin: 0,
                    marginBottom: 20,
                  }}
                >
                  {item.short_desc}
                </p>

                {/* Action buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => setCompareOpen(true)}
                    style={{
                      padding: "12px 20px",
                      background: colors.gold,
                      color: "#000",
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 8px 20px ${colors.gold}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    ⚔️ Compare
                  </button>

                  <button
                    onClick={handleSave}
                    style={{
                      padding: "12px 20px",
                      background: isSaved ? colors.gold : colors.bg,
                      color: isSaved ? "#000" : colors.t1,
                      border: `1px solid ${isSaved ? colors.gold : colors.bg3}`,
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSaved) {
                        e.currentTarget.style.borderColor = colors.gold;
                        e.currentTarget.style.color = colors.gold;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSaved) {
                        e.currentTarget.style.borderColor = colors.bg3;
                        e.currentTarget.style.color = colors.t1;
                      }
                    }}
                  >
                    {isSaved ? "❤️" : "🖤"} Save ({saveCount})
                  </button>

                  <a
                    href={item.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "12px 20px",
                      background: colors.bg,
                      color: colors.t1,
                      border: `1px solid ${colors.bg3}`,
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.gold;
                      e.currentTarget.style.color = colors.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.bg3;
                      e.currentTarget.style.color = colors.t1;
                    }}
                  >
                    🔗 Visit
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ padding: "48px 24px", maxWidth: 1200, margin: "0 auto" }}>
          {/* CORE 2: RANKING - Nova Score (Hero section) */}
          <section style={{ marginBottom: 60 }}>
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  margin: 0,
                  marginBottom: 8,
                  color: colors.t1,
                }}
              >
                Intelligence Analysis
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: colors.t3,
                  margin: 0,
                }}
              >
                Comprehensive ranking across multiple signals
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "240px 1fr",
                gap: 48,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  background: colors.bg2,
                  padding: 32,
                  borderRadius: 16,
                  border: `1px solid ${colors.bg3}`,
                  textAlign: "center",
                }}
              >
                <ScoreGauge
                  score={novaScore.value}
                  trend={novaScore.percentChange}
                  size={180}
                />
              </div>

              <ScoreBreakdown breakdown={novaScore.breakdown} />
            </div>
          </section>

          {/* CORE 2: RANKING - Why Trending */}
          <section style={{ marginBottom: 60 }}>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 900,
                margin: 0,
                marginBottom: 24,
                color: colors.t1,
              }}
            >
              🚀 Why It's Trending
            </h2>
            <TrendAnalysis
              reasons={[
                "+2,400 GitHub stars this week",
                "#1 on Product Hunt",
                "Official announcement",
                "Updated 1 hour ago",
              ]}
              percentChange={novaScore.percentChange}
            />
          </section>

          {/* CORE 4: TRUST - Data quality */}
          <section style={{ marginBottom: 60 }}>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 900,
                margin: 0,
                marginBottom: 24,
                color: colors.t1,
              }}
            >
              ✅ Data Quality & Trust
            </h2>
            <TrustBadge
              freshness={quality.freshness}
              completeness={quality.completeness}
              confidence={quality.confidence}
              lastUpdated={quality.lastUpdated}
            />
          </section>

          {/* CORE 4: TRUST - Sources */}
          <section style={{ marginBottom: 60 }}>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 900,
                margin: 0,
                marginBottom: 24,
                color: colors.t1,
              }}
            >
              🔗 Data Sources
            </h2>
            <DataSources sources={dataSources} />
          </section>

          {/* CORE 4: TRUST - Audit Trail */}
          <section style={{ marginBottom: 60 }}>
            <AuditTrail
              dataSources={dataSources}
              changeHistory={changeHistory}
              lastVerified={quality.lastUpdated}
            />
          </section>

          {/* Related items */}
          <section
            style={{
              padding: 32,
              background: colors.bg2,
              borderRadius: 16,
              border: `1px solid ${colors.bg3}`,
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 900,
                margin: 0,
                marginBottom: 12,
                color: colors.t1,
              }}
            >
              Want more intelligence?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: colors.t3,
                margin: 0,
                marginBottom: 16,
              }}
            >
              Explore similar tools or subscribe to weekly intelligence reports
            </p>
            <button
              style={{
                padding: "12px 24px",
                background: colors.gold,
                color: "#000",
                border: "none",
                borderRadius: 10,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Explore Tools
            </button>
          </section>
        </div>
      </div>

      {/* Compare Modal */}
      {compareOpen && (
        <CompareButton
          currentItem={item}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { slug } = params;

    // Get item from DB
    const { data: item, error } = await supabase
      .from("items")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !item) {
      return { notFound: true };
    }

    // Mock data - replace with actual API calls
    const novaScore = {
      value: 91,
      percentChange: 340,
      breakdown: {
        github: 95,
        community: 88,
        credibility: 100,
        freshness: 99,
      },
    };

    const quality = {
      freshness: 99,
      completeness: 96,
      confidence: 94,
      lastUpdated: "2 hours ago",
    };

    const dataSources = [
      {
        name: "GitHub",
        url: "https://github.com",
        type: "official",
        credibility: 100,
      },
      {
        name: "ProductHunt",
        url: "https://producthunt.com",
        type: "community",
        credibility: 95,
      },
    ];

    const changeHistory = [
      { action: "Data synced", timestamp: "2 hours ago", admin: "System" },
    ];

    return {
      props: {
        item,
        novaScore,
        quality,
        dataSources,
        changeHistory,
      },
      revalidate: 3600,
    };
  } catch (err) {
    console.error(err);
    return { notFound: true };
  }
}
