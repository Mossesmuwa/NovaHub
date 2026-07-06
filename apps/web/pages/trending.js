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
        <SEO title="Trending � NovaHub" />
        <div style={styles.center}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: "#fff", textAlign: "center" }}
          >
            <h2>No signal data yet</h2>
            <p style={{ color: THEME.text2 }}>
              Waiting for live momentum to surface.
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage="trending">
      <SEO title="Trending � NovaHub" />
      <div style={styles.page}>
        <div style={styles.glow} />

        <div style={styles.container}>
          <header style={styles.header}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={styles.kicker}>LIVE SIGNAL BOARD</div>
              <h1 style={styles.title}>
                What’s <span style={{ color: THEME.gold }}>Gaining</span>{" "}
                Momentum
              </h1>
              <p style={styles.subtitle}>
                A curated view of fast-moving picks, creators, and cultural
                signals.
              </p>
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
                  <div style={styles.label}>SIGNAL SCORE</div>
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
                  <motion.a
                    key={item.id || i}
                    href={`/item/${item.slug}`}
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
                  </motion.a>
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
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(circle at top, rgba(212, 175, 55, 0.16), transparent 45%)",
  },
  header: {
    marginBottom: 28,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: "0.24em",
    color: THEME.gold,
    fontWeight: 800,
    marginBottom: 10,
  },
  title: {
    fontSize: 44,
    fontWeight: 900,
    lineHeight: 1.05,
    margin: "0 0 10px",
  },
  subtitle: {
    color: THEME.text2,
    fontSize: 16,
    maxWidth: 640,
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 24,
  },
  hero: {
    background: THEME.glass,
    border: `1px solid ${THEME.border}`,
    borderRadius: 24,
    padding: 24,
    minHeight: 320,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 800,
    marginTop: 12,
    marginBottom: 10,
  },
  desc: {
    color: THEME.text2,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  metaRow: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 11,
    letterSpacing: "0.2em",
    color: THEME.text2,
    marginBottom: 6,
  },
  score: {
    fontSize: 24,
    fontWeight: 900,
    color: THEME.gold,
  },
  category: {
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
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
    padding: 14,
    background: THEME.glass,
    border: `1px solid ${THEME.border}`,
    borderRadius: 16,
    textDecoration: "none",
    color: "inherit",
  },
  rank: {
    width: 40,
    display: "flex",
    justifyContent: "center",
  },
  img: {
    width: 68,
    height: 68,
    objectFit: "cover",
    borderRadius: 12,
    border: `1px solid ${THEME.border}`,
  },
  imgPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${THEME.border}`,
  },
  name: {
    fontWeight: 700,
    marginBottom: 4,
  },
  sub: {
    fontSize: 12,
    color: THEME.text2,
  },
  points: {
    fontWeight: 800,
    color: THEME.gold,
    minWidth: 40,
    textAlign: "right",
  },
};
