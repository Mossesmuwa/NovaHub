// components/ScoreBreakdown.js
// Premium score breakdown with smooth animations and interactive tooltips
import { useState } from "react";
import { colors } from "shared/lib/design";

const componentInfo = {
  github: {
    label: "GitHub Momentum",
    weight: "35%",
    description: "Stars, commits, activity, and community engagement on GitHub",
    icon: "⭐",
    color: "#0A84FF",
  },
  community: {
    label: "Community Signal",
    weight: "25%",
    description:
      "Product Hunt votes, Reddit discussions, HackerNews activity, and saves",
    icon: "👥",
    color: colors.green,
  },
  credibility: {
    label: "Credibility",
    weight: "20%",
    description:
      "Official sources, verified links, and data quality verification",
    icon: "✓",
    color: colors.gold,
  },
  freshness: {
    label: "Freshness",
    weight: "20%",
    description: "How recently the data was updated and verified",
    icon: "🔄",
    color: colors.orange,
  },
};

export default function ScoreBreakdown({
  breakdown = {
    github: 95,
    community: 88,
    credibility: 100,
    freshness: 99,
  },
}) {
  const [hoveredComponent, setHoveredComponent] = useState(null);

  const items = [
    { key: "github", value: breakdown.github },
    { key: "community", value: breakdown.community },
    { key: "credibility", value: breakdown.credibility },
    { key: "freshness", value: breakdown.freshness },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
      {items.map((item) => {
        const info = componentInfo[item.key];
        const isHovered = hoveredComponent === item.key;

        return (
          <div
            key={item.key}
            onMouseEnter={() => setHoveredComponent(item.key)}
            onMouseLeave={() => setHoveredComponent(null)}
            style={{
              padding: 16,
              background: isHovered ? colors.bg3 : colors.bg2,
              borderRadius: 12,
              border: `1px solid ${isHovered ? colors.gold + "40" : colors.bg3}`,
              transition: "all 0.2s ease",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background gradient on hover */}
            {isHovered && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(90deg, ${info.color}10, transparent)`,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Header with icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{info.icon}</span>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: colors.t1,
                      transition: "color 0.2s ease",
                      color: isHovered ? info.color : colors.t1,
                    }}
                  >
                    {info.label}
                  </div>
                  {isHovered && (
                    <div
                      style={{
                        fontSize: 11,
                        color: colors.t3,
                        marginTop: 2,
                        animation: "fadeIn 0.2s ease",
                      }}
                    >
                      {info.description}
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: info.color,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 2,
                }}
              >
                <span>{item.value}/100</span>
                <span style={{ fontSize: 10, color: colors.t3 }}>
                  {info.weight}
                </span>
              </div>
            </div>

            {/* Progress bar with smooth animation */}
            <div
              style={{
                width: "100%",
                height: 6,
                background: colors.bg,
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: `${item.value}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${info.color}, ${info.color}dd)`,
                  borderRadius: 3,
                  transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: isHovered ? `0 0 12px ${info.color}60` : "none",
                }}
              />
            </div>

            {/* Value percentage label */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: isHovered ? "100%" : "0%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 16,
                transition: "width 0.3s ease",
                pointerEvents: "none",
                background: isHovered
                  ? `linear-gradient(90deg, transparent, ${info.color}10)`
                  : "transparent",
              }}
            >
              {isHovered && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: info.color,
                    opacity: 0.8,
                  }}
                >
                  {item.value}%
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

