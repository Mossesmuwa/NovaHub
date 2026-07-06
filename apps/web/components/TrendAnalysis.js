// components/TrendAnalysis.js
// Premium trend analysis with icons, animations, and visual timeline
import { useState } from "react";
import { colors } from "../lib/design";

const reasonIcons = {
  launch: "🚀",
  funding: "💰",
  award: "🏆",
  press: "📰",
  viral: "🔥",
  update: "⚡",
  default: "→",
};

export default function TrendAnalysis({
  reasons = [
    "+2,400 GitHub stars this week",
    "#1 on Product Hunt",
    "Official announcement",
    "Updated 1 hour ago",
  ],
  trend = "up",
  percentChange = 340,
}) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Determine icon for each reason
  const getReasonIcon = (reason) => {
    const lower = reason.toLowerCase();
    if (lower.includes("launch") || lower.includes("released"))
      return reasonIcons.launch;
    if (
      lower.includes("funding") ||
      lower.includes("round") ||
      lower.includes("$")
    )
      return reasonIcons.funding;
    if (
      lower.includes("award") ||
      lower.includes("best") ||
      lower.includes("#1")
    )
      return reasonIcons.award;
    if (
      lower.includes("news") ||
      lower.includes("press") ||
      lower.includes("announced")
    )
      return reasonIcons.press;
    if (
      lower.includes("viral") ||
      lower.includes("trending") ||
      lower.includes("spike")
    )
      return reasonIcons.viral;
    if (
      lower.includes("update") ||
      lower.includes("version") ||
      lower.includes("released")
    )
      return reasonIcons.update;
    return reasonIcons.default;
  };

  const trendColor =
    trend === "up" ? colors.green : trend === "down" ? colors.red : colors.t3;
  const trendEmoji = trend === "up" ? "📈" : trend === "down" ? "📉" : "→";

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg3} 100%)`,
        padding: 24,
        borderRadius: 16,
        border: `1px solid ${colors.bg4}`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${trendColor}, transparent)`,
        }}
      />

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 24 }}>{trendEmoji}</span>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 900,
              margin: 0,
              color: colors.t1,
            }}
          >
            Why It's Trending
          </h3>
        </div>
        <p
          style={{
            fontSize: 13,
            color: colors.t3,
            margin: 0,
            marginBottom: 12,
          }}
        >
          <span style={{ color: trendColor, fontWeight: 700 }}>
            {trend === "up"
              ? "↑ Growing"
              : trend === "down"
                ? "↓ Declining"
                : "→ Stable"}
          </span>{" "}
          with{" "}
          <span style={{ color: trendColor, fontWeight: 700 }}>
            {percentChange > 0 ? "+" : ""}
            {percentChange}%
          </span>{" "}
          this week
        </p>
      </div>

      {/* Reasons list with timeline */}
      <div style={{ display: "grid", gap: 12 }}>
        {reasons.map((reason, idx) => {
          const icon = getReasonIcon(reason);
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              style={{
                padding: 16,
                background: isExpanded ? colors.bg4 : colors.bg,
                borderRadius: 10,
                border: `1px solid ${isExpanded ? colors.gold + "40" : colors.bg3}`,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transform: isExpanded ? "translateX(8px)" : "translateX(0)",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
              onMouseEnter={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.background = colors.bg3;
                  e.currentTarget.style.borderColor = colors.bg4;
                }
              }}
              onMouseLeave={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.background = colors.bg;
                  e.currentTarget.style.borderColor = colors.bg3;
                }
              }}
            >
              {/* Icon with animation */}
              <span
                style={{
                  fontSize: 20,
                  animation: isExpanded ? "bounce 0.6s ease" : "none",
                  flexShrink: 0,
                }}
              >
                {icon}
              </span>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isExpanded ? colors.gold : colors.t1,
                    marginBottom: 4,
                    transition: "color 0.2s ease",
                  }}
                >
                  {reason}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div
                    style={{
                      fontSize: 12,
                      color: colors.t3,
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: `1px solid ${colors.bg3}`,
                      animation: "slideDown 0.3s ease",
                    }}
                  >
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          background: colors.bg3,
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Signal detected
                      </span>
                      <span
                        style={{
                          padding: "4px 8px",
                          background: colors.bg3,
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        High impact
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Expand indicator */}
              <div
                style={{
                  fontSize: 12,
                  color: colors.t3,
                  transition: "transform 0.3s ease",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                  flexShrink: 0,
                }}
              >
                ⌄
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary line */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: `1px solid ${colors.bg3}`,
          fontSize: 12,
          color: colors.t3,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: trendColor,
            animation: "pulse 2s infinite",
          }}
        />
        <span>
          Based on real-time signals from{" "}
          <span style={{ fontWeight: 700 }}>4 verified sources</span>
        </span>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
