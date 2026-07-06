// components/ScoreGauge.js
// Premium Nova Score display with smooth animations and micro-interactions
import { useState, useEffect } from "react";
import { colors } from "shared/lib/design";
import { formatTrend } from "../../../packages/shared/lib/formatters";

export default function ScoreGauge({
  score = 91, // 0-100
  trend = 340, // % change
  animated = true, // auto-animate on mount
  size = 160, // diameter
}) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const [hovered, setHovered] = useState(false);

  // Animate score on mount
  useEffect(() => {
    if (!animated) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.min(Math.floor(progress), score));
      }
    }, 30);

    return () => clearInterval(interval);
  }, [score, animated]);

  // SVG calculations
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  // Determine color based on score
  const getScoreColor = () => {
    if (displayScore >= 85) return colors.gold;
    if (displayScore >= 70) return "#0A84FF"; // blue
    if (displayScore >= 55) return colors.orange;
    return colors.red;
  };

  // Get score label
  const getScoreLabel = () => {
    if (displayScore >= 90) return "Excellent";
    if (displayScore >= 75) return "Great";
    if (displayScore >= 60) return "Good";
    if (displayScore >= 45) return "Fair";
    return "Low";
  };

  const scoreColor = getScoreColor();
  const scoreLabel = getScoreLabel();
  const trendColor =
    trend > 0 ? colors.green : trend < 0 ? colors.red : colors.t3;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textAlign: "center",
        transition: "transform 0.3s ease",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        cursor: "default",
      }}
    >
      {/* SVG Gauge */}
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          margin: "0 auto 24px",
          filter: hovered
            ? "drop-shadow(0 0 20px rgba(201, 168, 76, 0.3))"
            : "drop-shadow(0 0 10px rgba(0, 0, 0, 0.2))",
          transition: "filter 0.3s ease",
        }}
      >
        <svg
          width={size}
          height={size}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.bg3}
            strokeWidth="10"
            opacity="0.6"
          />

          {/* Progress circle with animation */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: `${size / 2}px ${size / 2}px`,
              transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease",
              filter: "drop-shadow(0 0 8px " + scoreColor + "20)",
            }}
          />

          {/* Animated pulsing dot at end (visual wow) */}
          {hovered && (
            <circle
              cx={size / 2}
              cy={size / 2 - radius}
              r="4"
              fill={scoreColor}
              style={{
                animation: "pulse 1.5s infinite",
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          {/* Main score */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: scoreColor,
              letterSpacing: "-0.05em",
              marginBottom: 4,
              transition: "color 0.3s ease, text-shadow 0.3s ease",
              textShadow: hovered ? `0 0 10px ${scoreColor}40` : "none",
            }}
          >
            {displayScore}
          </div>

          {/* Label */}
          <div
            style={{
              fontSize: 11,
              color: colors.t3,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {scoreLabel}
          </div>
        </div>
      </div>

      {/* Trend indicator with animation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 14,
          fontWeight: 800,
          color: trendColor,
          marginBottom: 8,
          transition: "transform 0.3s ease",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
        }}
      >
        <span
          style={{
            fontSize: 18,
            animation: hovered ? "bounce 0.6s ease-in-out" : "none",
          }}
        >
          {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}
        </span>
        <span>
          {trend > 0 ? "+" : ""}
          {trend}% this week
        </span>
      </div>

      {/* Data freshness indicator */}
      <div
        style={{
          fontSize: 11,
          color: colors.t3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: colors.green,
            animation: "pulse 2s infinite",
          }}
        />
        Updated live
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.3);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}
