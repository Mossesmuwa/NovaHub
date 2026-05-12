import { motion } from "framer-motion";
import { useState } from "react";

// Premium Color Tokens
const THEME = {
  gold: "#D4AF37",
  glass: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.08)",
  text2: "#A1A1A1",
};

export default function PremiumTrending({ items }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      style={{
        backgroundColor: "#000",
        minHeight: "100vh",
        color: "#fff",
        padding: "0 24px",
      }}
    >
      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div
        style={{
          position: "fixed",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80vw",
          height: "50vh",
          background: `radial-gradient(circle, ${THEME.gold}10 0%, transparent 70%)`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: "120px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* HEADER SECTION */}
        <header style={{ marginBottom: "80px", textAlign: "left" }}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              color: THEME.gold,
              fontWeight: 800,
              fontSize: "12px",
              letterSpacing: "3px",
            }}
          >
            LIVE SYSTEM PULSE
          </motion.span>
          <h1
            style={{
              fontSize: "clamp(48px, 8vw, 90px)",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              marginTop: "10px",
            }}
          >
            The Global <span style={{ color: THEME.gold }}>Signals.</span>
          </h1>
        </header>

        {/* ── THE POWER GRID ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "24px",
          }}
        >
          {/* RANK #1 HERO CARD (6 Cols) */}
          <motion.div
            whileHover={{ y: -10 }}
            style={{
              gridColumn: "span 7",
              background: THEME.glass,
              borderRadius: "40px",
              border: `1px solid ${THEME.gold}40`,
              padding: "48px",
              backdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🥇</div>
            <h2 style={{ fontSize: "42px", fontWeight: 900 }}>
              {items[0].name}
            </h2>
            <p
              style={{
                color: THEME.text2,
                fontSize: "18px",
                maxWidth: "400px",
              }}
            >
              {items[0].description}
            </p>
            <div style={{ marginTop: "40px", display: "flex", gap: "20px" }}>
              <div className="stat">
                <div style={{ fontSize: "10px", color: THEME.gold }}>
                  NOVA SCORE
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800 }}>9.8</div>
              </div>
            </div>
          </motion.div>

          {/* SIDE LIST (5 Cols) */}
          <div
            style={{
              gridColumn: "span 5",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {items.slice(1, 5).map((item, i) => (
              <motion.div
                key={item.id}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  padding: "24px",
                  borderRadius: "24px",
                  background: THEME.glass,
                  border: `1px solid ${hoveredIndex === i ? THEME.gold : THEME.border}`,
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <div
                  style={{ fontSize: "20px", fontWeight: 900, opacity: 0.3 }}
                >
                  0{i + 2}
                </div>
                <img
                  src={item.image}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "12px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: "12px", color: THEME.text2 }}>
                    {item.category}
                  </div>
                </div>
                <div style={{ color: THEME.gold, fontWeight: 800 }}>
                  {item.trending_score}pts
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
