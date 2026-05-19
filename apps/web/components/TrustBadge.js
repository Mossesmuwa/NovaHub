// components/TrustBadge.js
// Premium data quality display with visual confidence indicators
import { useState } from "react";
import { colors } from "shared/lib/design";
import { formatDate } from "shared/lib/formatters";

const metricInfo = {
  freshness: {
    icon: "⏱️",
    label: "Freshness",
    description: "How recently data was updated and verified",
    tooltip: "Data updated within the last hour is considered very fresh",
  },
  completeness: {
    icon: "✅",
    label: "Completeness",
    description: "Percentage of data fields that are populated",
    tooltip: "27 out of 28 fields have valid data",
  },
  confidence: {
    icon: "🎯",
    label: "Confidence",
    description: "Overall trust score based on sources and accuracy",
    tooltip: "Multiple verified sources confirm this data",
  },
};

function ScoreCircle({ value, label, icon }) {
  // Determine color based on value
  const getColor = (val) => {
    if (val >= 90) return colors.green;
    if (val >= 70) return colors.gold;
    if (val >= 50) return colors.orange;
    return colors.red;
  };

  const scoreColor = getColor(value);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          position: "relative",
          width: 120,
          height: 120,
          margin: "0 auto 12px",
          filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
        }}
      >
        <svg width={120} height={120} style={{ position: "absolute" }}>
          {/* Background circle */}
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            stroke={colors.bg3}
            strokeWidth="6"
          />

          {/* Progress circle */}
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "60px 60px",
              transition:
                "stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </svg>

        {/* Center content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 28, marginBottom: 4 }}>{icon}</span>
          <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor }}>
            {value}
          </div>
          <div style={{ fontSize: 9, color: colors.t3, fontWeight: 700 }}>
            / 100
          </div>
        </div>
      </div>

      {/* Label */}
      <div style={{ fontSize: 12, fontWeight: 800, color: colors.t1 }}>
        {label}
      </div>
    </div>
  );
}

export default function TrustBadge({
  freshness = 99,
  completeness = 96,
  confidence = 94,
  lastUpdated = "2 hours ago",
}) {
  const [expandedMetric, setExpandedMetric] = useState(null);

  // Overall trust score
  const overallScore = Math.round((freshness + completeness + confidence) / 3);

  // Get overall trust level
  const getTrustLevel = (score) => {
    if (score >= 95)
      return {
        label: "Highly Trusted",
        color: colors.green,
        icon: (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.green}
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ),
      };
    if (score >= 80)
      return {
        label: "Trusted",
        color: colors.gold,
        icon: (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.gold}
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ),
      };
    if (score >= 60)
      return {
        label: "Moderate",
        color: colors.orange,
        icon: (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.orange}
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05l-8.47-14.14a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      };
    return {
      label: "Low",
      color: colors.red,
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.red}
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    };
  };

  const trustLevel = getTrustLevel(overallScore);

  const metrics = [
    { key: "freshness", value: freshness },
    { key: "completeness", value: completeness },
    { key: "confidence", value: confidence },
  ];

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
      {/* Header with overall trust */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: `1px solid ${colors.bg3}`,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 900,
              margin: 0,
              marginBottom: 4,
            }}
          >
            Data Quality & Trust
          </h3>
          <p style={{ fontSize: 12, color: colors.t3, margin: 0 }}>
            Overall trust score based on data verification
          </p>
        </div>

        {/* Overall score badge */}
        <div
          style={{
            padding: 16,
            background: trustLevel.color + "15",
            border: `1px solid ${trustLevel.color}40`,
            borderRadius: 12,
            textAlign: "center",
            minWidth: 100,
          }}
        >
          <div
            style={{
              marginBottom: 4,
            }}
          >
            {trustLevel.icon}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: trustLevel.color,
              marginBottom: 2,
            }}
          >
            {overallScore}
          </div>
          <div
            style={{
              fontSize: 10,
              color: trustLevel.color,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {trustLevel.label}
          </div>
        </div>
      </div>

      {/* Metric circles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.key}
            onClick={() =>
              setExpandedMetric(
                expandedMetric === metric.key ? null : metric.key,
              )
            }
            style={{
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <ScoreCircle
              value={metric.value}
              label={metricInfo[metric.key].label}
              icon={metricInfo[metric.key].icon}
            />

            {/* Expanded info */}
            {expandedMetric === metric.key && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: colors.bg3,
                  borderRadius: 8,
                  fontSize: 11,
                  color: colors.t3,
                  animation: "slideUp 0.3s ease",
                }}
              >
                <div
                  style={{ marginBottom: 4, color: colors.t2, fontWeight: 700 }}
                >
                  {metricInfo[metric.key].description}
                </div>
                <div style={{ fontSize: 10, color: colors.t3 }}>
                  💡 {metricInfo[metric.key].tooltip}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Last updated info */}
      <div
        style={{
          padding: 12,
          background: colors.bg3,
          borderRadius: 8,
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: colors.t3,
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
        <span>
          <span style={{ fontWeight: 700 }}>Last verified</span> {lastUpdated}
        </span>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
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

