import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { getSupabase } from "shared/lib/supabaseClient";

const THEME = {
  gold: "#D4AF37",
  bg: "#000",
  glass: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  text2: "#A1A1A1",
};

function getRankMedal(rank) {
  const medals = [
    { color: "#FFD700", label: "1st" },
    { color: "#C0C0C0", label: "2nd" },
    { color: "#CD7F32", label: "3rd" },
  ];

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

export default function PremiumTrending({ items = [] }) {
  const [hovered, setHovered] = useState(null);

  const safeItems = Array.isArray(items) ? items : [];

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
            </div>
          </div>
        </div>
      </div>
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
