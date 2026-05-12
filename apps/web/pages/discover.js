import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Link from "next/link";

const GOLD = "#D4AF37";
const THEME = {
  movie: "#FF453A",
  game: "#32D74B",
  book: "#0A84FF",
  tool: "#BF5AF2",
  default: "#D4AF37",
};

// ─── Visual Component: Premium Glass Card ────────────────────────────────────
function DiscoveryCard({ item, index }) {
  const accent = THEME[item.type] || THEME.default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "24px",
        padding: "24px",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <img
          src={item.image}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "14px",
            objectFit: "cover",
            background: "#111",
          }}
        />
        <div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              color: accent,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {item.type}
          </span>
          <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "4px 0" }}>
            {item.name}
          </h3>
        </div>
      </div>

      <p
        style={{
          fontSize: "13px",
          color: "rgba(255,255,255,0.6)",
          lineHeight: "1.6",
          margin: 0,
        }}
      >
        {item.reason || "Matched to your current neural profile."}
      </p>

      <Link href={`/item/${item.slug}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            marginTop: "20px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          Explore Analysis <span style={{ color: accent }}>→</span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function DiscoverPage() {
  const [mood, setMood] = useState(50);
  const [energy, setEnergy] = useState(50);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const startDiscovery = async () => {
    setLoading(true);
    setItems([]);
    // Mock API Call - Replace with your fetch logic
    setTimeout(() => {
      setItems([
        {
          id: 1,
          name: "Inception",
          type: "movie",
          reason: "Deep focus meets high intensity.",
          slug: "inception",
          image: "https://via.placeholder.com/150",
        },
        {
          id: 2,
          name: "Hades",
          type: "game",
          reason: "High energy loop for your current vibe.",
          slug: "hades",
          image: "https://via.placeholder.com/150",
        },
        {
          id: 3,
          name: "Deep Work",
          type: "book",
          reason: "Perfect for your hyperfocused state.",
          slug: "deep-work",
          image: "https://via.placeholder.com/150",
        },
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <Layout activePage="discover">
      <SEO title="Neural Discovery — NovaHub" />

      {/* ── CINEMATIC HEADER ── */}
      <div
        style={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle at center, ${GOLD}10 0%, transparent 70%)`,
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            letterSpacing: "4px",
            fontSize: "12px",
            color: GOLD,
            fontWeight: 900,
            marginBottom: "20px",
          }}
        >
          ENGINE v3.4 LIVE
        </motion.div>
        <h1
          style={{
            fontSize: "clamp(40px, 10vw, 100px)",
            fontWeight: 900,
            letterSpacing: "-0.06em",
            margin: 0,
          }}
        >
          Neural <span style={{ color: GOLD }}>Pulse.</span>
        </h1>
        <p
          style={{
            maxWidth: "500px",
            color: "rgba(255,255,255,0.5)",
            fontSize: "18px",
            marginTop: "20px",
          }}
        >
          Don't browse. Synchronize. Tune the interface to your current state of
          mind.
        </p>

        {/* ── THE INTERFACE (The Wow Part) ── */}
        <div style={{ marginTop: "60px", width: "100%", maxWidth: "400px" }}>
          {/* Custom Slider 1 */}
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                fontSize: "12px",
                fontWeight: 800,
                opacity: 0.6,
              }}
            >
              <span>CHILL</span>
              <span style={{ color: GOLD }}>{mood}% INTENSITY</span>
              <span>BOLD</span>
            </div>
            <input
              type="range"
              className="premium-slider"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              style={{
                width: "100%",
                appearance: "none",
                background: "rgba(255,255,255,0.1)",
                height: "4px",
                borderRadius: "2px",
                outline: "none",
              }}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startDiscovery}
            disabled={loading}
            style={{
              background: "#fff",
              color: "#000",
              border: "none",
              padding: "20px 40px",
              borderRadius: "100px",
              fontWeight: 900,
              fontSize: "14px",
              letterSpacing: "1px",
              cursor: "pointer",
              width: "100%",
              boxShadow: `0 20px 40px ${GOLD}20`,
            }}
          >
            {loading ? "SYNCHRONIZING..." : "INITIALIZE DISCOVERY"}
          </motion.button>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div className="container" style={{ paddingBottom: "100px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "30px",
          }}
        >
          <AnimatePresence>
            {items.map((item, i) => (
              <DiscoveryCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        .premium-slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          background: #d4af37;
          border-radius: 50%;
          cursor: pointer;
          border: 4px solid #000;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
        }
      `}</style>
    </Layout>
  );
}
 