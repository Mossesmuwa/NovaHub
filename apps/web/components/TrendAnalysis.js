// components/TrendAnalysis.js
// Premium trend analysis with SVG icons, animations, and visual timeline
import { useState } from "react";
import { colors } from "shared/lib/design";

const reasonIcons = {
  launch: "🚀",
  funding: "💰",
  award: "🏆",
  press: "📰",
  viral: "🔥",
  update: "⚡",
  default: "→",
};

// SVG Icon renderer for reasons
const getReasonIconSVG = (icon) => {
  const iconMap = {
    "🚀": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth="2"><path d="M4 17l12-12" /><path d="M20 4L8 16" /><path d="M7 7L3.5 10.5" /><path d="M21 3v6h-6" /></svg>,
    "💰": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth="2"><circle cx="12" cy="12" r="8" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="9.5" y1="11" x2="14.5" y2="13" /></svg>,
    "🏆": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth="2"><path d="M6 9c0-1 .5-2 1.5-2h9c1 0 1.5 1 1.5 2v3c0 2-1 3-3 3h-6c-2 0-3-1-3-3V9z" /><rect x="8" y="15" width="8" height="4" /><line x1="10" y1="15" x2="10" y2="12" /><line x1="14" y1="15" x2="14" y2="12" /></svg>,
    "📰": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.orange} strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><line x1="6" y1="9" x2="18" y2="9" /><line x1="6" y1="13" x2="16" y2="13" /></svg>,
    "🔥": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.red} strokeWidth="2"><path d="M8 21s-.5-7 2-10c1-1.5 2-3 2-5 0-2-1-4-3-4-3 0-5 2-5 6 0 2 1 4 2 6-1 1-2 3-2 5 0 2 1 3 4 3z" /></svg>,
    "⚡": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    "→": <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.t2} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  };
  return iconMap[icon] || iconMap["→"];
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
  
  const TrendIcon = () => {
    if (trend === "up") {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
    } else if (trend === "down") {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.red} strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>;
    }
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.t2} strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /></svg>;
  };

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
          <TrendIcon />
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  animation: isExpanded ? "bounce 0.6s ease" : "none",
                  flexShrink: 0,
                }}
              >
                {getReasonIconSVG(icon)}
              </div>

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
