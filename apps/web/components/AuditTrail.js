// components/AuditTrail.js
// Premium audit trail with expandable timeline and data verification history
import { useState } from "react";
import { colors } from "shared/lib/design";
import { formatDate } from "../../../packages/shared/lib/formatters";

export default function AuditTrail({
  dataSources = [
    {
      name: "GitHub",
      credibility: 100,
      lastUpdated: "1 hour ago",
      verified: true,
    },
    {
      name: "ProductHunt",
      credibility: 95,
      lastUpdated: "2 hours ago",
      verified: true,
    },
    {
      name: "HackerNews",
      credibility: 88,
      lastUpdated: "3 hours ago",
      verified: true,
    },
  ],
  lastVerified = "2 hours ago",
  changeHistory = [
    {
      action: "Data synced from GitHub",
      timestamp: "2 hours ago",
      admin: "System",
    },
    {
      action: "Nova Score recalculated",
      timestamp: "2 hours ago",
      admin: "System",
    },
    {
      action: "Featured on ProductHunt",
      timestamp: "3 hours ago",
      admin: "External",
    },
  ],
}) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [hoveredSource, setHoveredSource] = useState(null);

  const isExpanded = (section) => expandedSection === section;

  return (
    <div
      style={{
        background: colors.bg2,
        padding: 24,
        borderRadius: 16,
        border: `1px solid ${colors.bg3}`,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 900,
            margin: 0,
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: colors.t1,
          }}
        >
          🔍 Data Verification & Audit Trail
        </h3>
        <p
          style={{
            fontSize: 12,
            color: colors.t3,
            margin: 0,
          }}
        >
          Track all data sources and changes for full transparency
        </p>
      </div>

      {/* Live verification status */}
      <div
        style={{
          padding: 12,
          background: colors.green + "10",
          border: `1px solid ${colors.green}30`,
          borderRadius: 10,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: colors.green,
            animation: "pulse 2s infinite",
          }}
        />
        <span style={{ color: colors.green, fontWeight: 700 }}>
          Last verified {lastVerified}
        </span>
        <span style={{ color: colors.t3, marginLeft: "auto" }}>
          ✓ All sources verified
        </span>
      </div>

      {/* Sources section */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() =>
            setExpandedSection(isExpanded("sources") ? null : "sources")
          }
          style={{
            width: "100%",
            padding: 14,
            background: isExpanded("sources") ? colors.bg3 : colors.bg,
            border: `1px solid ${isExpanded("sources") ? colors.gold + "40" : colors.bg3}`,
            borderRadius: 10,
            color: colors.t1,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!isExpanded("sources")) {
              e.currentTarget.style.background = colors.bg3;
              e.currentTarget.style.borderColor = colors.bg4;
            }
          }}
          onMouseLeave={(e) => {
            if (!isExpanded("sources")) {
              e.currentTarget.style.background = colors.bg;
              e.currentTarget.style.borderColor = colors.bg3;
            }
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>✓</span>
            Data Sources Verified ({dataSources.length})
          </span>
          <span
            style={{
              fontSize: 12,
              transition: "transform 0.3s ease",
              transform: isExpanded("sources") ? "rotate(180deg)" : "rotate(0)",
            }}
          >
            ⌄
          </span>
        </button>

        {/* Expanded sources */}
        {isExpanded("sources") && (
          <div
            style={{
              marginTop: 12,
              display: "grid",
              gap: 10,
              animation: "slideDown 0.3s ease",
            }}
          >
            {dataSources.map((source) => (
              <div
                key={source.name}
                onMouseEnter={() => setHoveredSource(source.name)}
                onMouseLeave={() => setHoveredSource(null)}
                style={{
                  padding: 14,
                  background:
                    hoveredSource === source.name ? colors.bg3 : colors.bg,
                  borderRadius: 10,
                  border: `1px solid ${hoveredSource === source.name ? colors.gold + "40" : colors.bg3}`,
                  transition: "all 0.3s ease",
                  transform:
                    hoveredSource === source.name
                      ? "translateX(4px)"
                      : "translateX(0)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        background: colors.gold,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#000",
                        fontWeight: 700,
                        fontSize: 10,
                      }}
                    >
                      ✓
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: colors.t1,
                        transition: "color 0.2s ease",
                        color:
                          hoveredSource === source.name
                            ? colors.gold
                            : colors.t1,
                      }}
                    >
                      {source.name}
                    </span>
                    {source.verified && (
                      <span
                        style={{
                          padding: "2px 6px",
                          background: colors.green + "20",
                          color: colors.green,
                          borderRadius: 4,
                          fontSize: 9,
                          fontWeight: 700,
                        }}
                      >
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: colors.green,
                    }}
                  >
                    {source.credibility}%
                  </div>
                </div>

                {/* Source details on hover */}
                {hoveredSource === source.name && (
                  <div
                    style={{
                      fontSize: 11,
                      color: colors.t3,
                      paddingLeft: 28,
                      animation: "slideDown 0.2s ease",
                    }}
                  >
                    Last updated: {source.lastUpdated}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History section */}
      <div>
        <button
          onClick={() =>
            setExpandedSection(isExpanded("history") ? null : "history")
          }
          style={{
            width: "100%",
            padding: 14,
            background: isExpanded("history") ? colors.bg3 : colors.bg,
            border: `1px solid ${isExpanded("history") ? colors.gold + "40" : colors.bg3}`,
            borderRadius: 10,
            color: colors.t1,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!isExpanded("history")) {
              e.currentTarget.style.background = colors.bg3;
              e.currentTarget.style.borderColor = colors.bg4;
            }
          }}
          onMouseLeave={(e) => {
            if (!isExpanded("history")) {
              e.currentTarget.style.background = colors.bg;
              e.currentTarget.style.borderColor = colors.bg3;
            }
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>📋</span>
            Change History ({changeHistory.length})
          </span>
          <span
            style={{
              fontSize: 12,
              transition: "transform 0.3s ease",
              transform: isExpanded("history") ? "rotate(180deg)" : "rotate(0)",
            }}
          >
            ⌄
          </span>
        </button>

        {/* Expanded history */}
        {isExpanded("history") && (
          <div
            style={{
              marginTop: 12,
              animation: "slideDown 0.3s ease",
            }}
          >
            <div
              style={{
                padding: 16,
                background: colors.bg,
                borderRadius: 10,
                border: `1px solid ${colors.bg3}`,
                borderLeft: `3px solid ${colors.gold}`,
              }}
            >
              {changeHistory.map((change, idx) => (
                <div
                  key={idx}
                  style={{
                    paddingBottom: idx < changeHistory.length - 1 ? 12 : 0,
                    marginBottom: idx < changeHistory.length - 1 ? 12 : 0,
                    borderBottom:
                      idx < changeHistory.length - 1
                        ? `1px solid ${colors.bg3}`
                        : "none",
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: colors.gold,
                        marginTop: 4,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: colors.t1,
                          marginBottom: 2,
                        }}
                      >
                        {change.action}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: colors.t3,
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <span>{change.timestamp}</span>
                        <span>•</span>
                        <span>{change.admin}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer action */}
      <button
        style={{
          marginTop: 20,
          width: "100%",
          padding: 12,
          borderRadius: 10,
          background: "transparent",
          border: `1px solid ${colors.red}40`,
          color: colors.red,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.red + "10";
          e.currentTarget.style.borderColor = colors.red + "60";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = colors.red + "40";
        }}
      >
        🚩 Report Inaccuracy
      </button>

      {/* CSS animations */}
      <style jsx>{`
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
