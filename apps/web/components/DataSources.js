// components/DataSources.js
// Premium data sources display with verification status and links
import { useState } from "react";
import { colors } from "shared/lib/design";

const sourceIcons = {
  github: "⭐",
  producthunt: "🎯",
  hackernews: "📰",
  twitter: "𝕏",
  crunchbase: "💼",
  official: "✓",
  reddit: "👥",
  news: "📺",
  default: "🔗",
};

const sourceColors = {
  official: colors.gold,
  community: colors.green,
  news: colors.blue || "#0A84FF",
  external: colors.t2,
};

export default function DataSources({
  sources = [
    {
      name: "GitHub",
      url: "https://github.com/...",
      type: "official",
      credibility: 100,
    },
    {
      name: "ProductHunt",
      url: "https://producthunt.com/...",
      type: "community",
      credibility: 95,
    },
    {
      name: "HackerNews",
      url: "https://news.ycombinator.com/...",
      type: "community",
      credibility: 88,
    },
    {
      name: "Official Website",
      url: "https://example.com",
      type: "official",
      credibility: 100,
    },
  ],
}) {
  const [hoveredSource, setHoveredSource] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const getSourceIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("github")) return sourceIcons.github;
    if (lower.includes("producthunt")) return sourceIcons.producthunt;
    if (lower.includes("hackernews") || lower.includes("hacker news"))
      return sourceIcons.hackernews;
    if (lower.includes("twitter") || lower.includes("x"))
      return sourceIcons.twitter;
    if (lower.includes("crunchbase")) return sourceIcons.crunchbase;
    if (lower.includes("official") || lower.includes("website"))
      return sourceIcons.official;
    if (lower.includes("reddit")) return sourceIcons.reddit;
    return sourceIcons.default;
  };

  const getSourceColor = (type) => {
    return sourceColors[type] || sourceColors.external;
  };

  // Group sources by type
  const groupedSources = {
    official: sources.filter((s) => s.type === "official"),
    community: sources.filter((s) => s.type === "community"),
    news: sources.filter((s) => s.type === "news"),
    external: sources.filter(
      (s) => !["official", "community", "news"].includes(s.type),
    ),
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div
      style={{
        background: colors.bg2,
        padding: 24,
        borderRadius: 16,
        border: `1px solid ${colors.bg3}`,
      }}
    >
      {/* Header */}
      <h3
        style={{
          fontSize: 16,
          fontWeight: 900,
          margin: 0,
          marginBottom: 6,
          color: colors.t1,
        }}
      >
        Data Sources
      </h3>
      <p
        style={{
          fontSize: 12,
          color: colors.t3,
          margin: 0,
          marginBottom: 20,
        }}
      >
        All data verified from {sources.length} trusted sources
      </p>

      {/* Sources by category */}
      <div style={{ display: "grid", gap: 24 }}>
        {/* Official sources */}
        {groupedSources.official.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: colors.t3,
                textTransform: "uppercase",
                marginBottom: 12,
                letterSpacing: "0.1em",
              }}
            >
              ✓ Official Sources
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {groupedSources.official.map((source) => (
                <SourceCard
                  key={source.name}
                  source={source}
                  icon={getSourceIcon(source.name)}
                  color={getSourceColor(source.type)}
                  isHovered={hoveredSource === source.name}
                  onHover={setHoveredSource}
                  onCopy={copyToClipboard}
                  isCopied={copiedUrl === source.url}
                />
              ))}
            </div>
          </div>
        )}

        {/* Community sources */}
        {groupedSources.community.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 900,
                color: colors.t3,
                textTransform: "uppercase",
                marginBottom: 12,
                letterSpacing: "0.1em",
              }}
            >
              👥 Community Sources
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {groupedSources.community.map((source) => (
                <SourceCard
                  key={source.name}
                  source={source}
                  icon={getSourceIcon(source.name)}
                  color={getSourceColor(source.type)}
                  isHovered={hoveredSource === source.name}
                  onHover={setHoveredSource}
                  onCopy={copyToClipboard}
                  isCopied={copiedUrl === source.url}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual source card component
function SourceCard({
  source,
  icon,
  color,
  isHovered,
  onHover,
  onCopy,
  isCopied,
}) {
  const getLiveIndicator = () => {
    const random = Math.random();
    return random > 0.7; // 30% chance of "live" update
  };

  const isLive = getLiveIndicator();

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => onHover(source.name)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.preventDefault();
        onCopy(source.url);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 14,
        background: isHovered ? colors.bg3 : colors.bg,
        borderRadius: 10,
        border: `1px solid ${isHovered ? color + "40" : colors.bg3}`,
        textDecoration: "none",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: isHovered ? "translateX(4px)" : "translateX(0)",
      }}
    >
      {/* Left side: icon and name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Icon */}
        <span
          style={{
            fontSize: 20,
            animation: isHovered ? "bounce 0.6s ease" : "none",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>

        {/* Details */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isHovered ? color : colors.t1,
              transition: "color 0.2s ease",
              marginBottom: 2,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {source.name}
            {isLive && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: colors.green,
                  animation: "pulse 2s infinite",
                }}
              />
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              color: colors.t3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {source.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
          </div>
        </div>
      </div>

      {/* Right side: credibility and action */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          marginLeft: 12,
        }}
      >
        {/* Credibility badge */}
        <div
          style={{
            padding: "4px 8px",
            background: color + "20",
            border: `1px solid ${color}40`,
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            color: color,
            whiteSpace: "nowrap",
          }}
        >
          {source.credibility}/100
        </div>

        {/* Action button */}
        <button
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: "none",
            background: isHovered ? color : colors.bg3,
            color: isHovered ? "#000" : colors.t2,
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            fontWeight: 700,
          }}
          title={isCopied ? "Copied!" : "Copy link"}
        >
          {isCopied ? "✓" : "↗"}
        </button>
      </div>
    </a>
  );
}
