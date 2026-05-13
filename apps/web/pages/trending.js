import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";

const THEME = {
  gold: "#D4AF37",
  bg: "#000",
  glass: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  text2: "#A1A1A1",
};

function getRankEmoji(rank) {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  return `#${rank + 1}`;
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

  // EMPTY STATE (critical for Vercel + SSR)
  if (!hero) {
    return (
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
    );
  }

  return (
    <div style={styles.page}>
      {/* Glow background */}
      <div style={styles.glow} />

      <div style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={styles.kicker}>GLOBAL TREND ENGINE</div>
            <h1 style={styles.title}>
              What’s <span style={{ color: THEME.gold }}>Exploding</span> Now
            </h1>
          </motion.div>
        </header>

        {/* MAIN GRID */}
        <div style={styles.grid}>
          {/* HERO CARD */}
          <motion.div whileHover={{ scale: 1.01 }} style={styles.hero}>
            <div style={{ fontSize: 60 }}>{getRankEmoji(0)}</div>

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
                <div style={styles.category}>{hero.category || "General"}</div>
              </div>
            </div>
          </motion.div>

          {/* LIST */}
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
                  <div style={styles.rank}>{getRankEmoji(i + 1)}</div>

                  <img src={item.image} alt="" style={styles.img} />

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
  );
}

/* ---------------- STYLES ---------------- */

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
