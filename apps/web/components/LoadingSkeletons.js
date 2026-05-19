// components/LoadingSkeletons.js
// Premium loading skeletons with smooth pulsing animations
import { colors } from "../lib/design";

// Base skeleton component
function Skeleton({ height = "1rem", width = "100%", borderRadius = "8px" }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius,
        background: `linear-gradient(90deg, ${colors.bg3} 0%, ${colors.bg4} 50%, ${colors.bg3} 100%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

// Item card skeleton
export function ItemCardSkeleton() {
  return (
    <div
      style={{
        padding: 16,
        background: colors.bg2,
        borderRadius: 12,
        border: `1px solid ${colors.bg3}`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Image skeleton */}
      <Skeleton height="200px" width="100%" borderRadius="8px" />

      {/* Content skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton height="20px" width="80%" />
        <Skeleton height="14px" width="100%" />
        <Skeleton height="14px" width="90%" />
      </div>

      {/* Footer skeleton */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 8,
        }}
      >
        <Skeleton height="16px" width="30%" />
        <Skeleton height="16px" width="40%" />
      </div>
    </div>
  );
}

// Score gauge skeleton
export function ScoreGaugeSkeleton({ size = 160 }) {
  return (
    <div
      style={{
        padding: 24,
        background: colors.bg2,
        borderRadius: 16,
        border: `1px solid ${colors.bg3}`,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Circular skeleton */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `linear-gradient(90deg, ${colors.bg3} 0%, ${colors.bg4} 50%, ${colors.bg3} 100%)`,
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />

      {/* Text skeleton */}
      <Skeleton height="16px" width="60%" />
      <Skeleton height="12px" width="80%" />
    </div>
  );
}

// Item detail page skeleton
export function ItemDetailSkeleton() {
  return (
    <div style={{ padding: "40px 24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "140px 1fr",
          gap: 32,
          marginBottom: 40,
        }}
      >
        <Skeleton height="140px" width="140px" borderRadius="12px" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Skeleton height="20px" width="60%" />
          <Skeleton height="36px" width="80%" />
          <Skeleton height="16px" width="100%" />
          <div style={{ display: "flex", gap: 8 }}>
            <Skeleton height="40px" width="120px" borderRadius="10px" />
            <Skeleton height="40px" width="120px" borderRadius="10px" />
            <Skeleton height="40px" width="120px" borderRadius="10px" />
          </div>
        </div>
      </div>

      {/* Score section */}
      <div style={{ marginBottom: 40 }}>
        <Skeleton height="24px" width="30%" marginBottom="20px" />
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}
        >
          <ScoreGaugeSkeleton />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                height="80px"
                width="100%"
                borderRadius="10px"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content sections */}
      {[1, 2, 3].map((section) => (
        <div key={section} style={{ marginBottom: 40 }}>
          <Skeleton height="24px" width="40%" marginBottom="20px" />
          <Skeleton height="200px" width="100%" borderRadius="12px" />
        </div>
      ))}
    </div>
  );
}

// Grid of items skeleton
export function ItemGridSkeleton({ count = 6 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Search results skeleton
export function SearchResultsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: 16,
            background: colors.bg2,
            borderRadius: 12,
            border: `1px solid ${colors.bg3}`,
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <Skeleton height="60px" width="60px" borderRadius="8px" />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <Skeleton height="18px" width="40%" />
            <Skeleton height="14px" width="70%" />
            <Skeleton height="14px" width="60%" />
          </div>
          <Skeleton height="32px" width="80px" borderRadius="8px" />
        </div>
      ))}
    </div>
  );
}

// Export main component
export default function LoadingState({ type = "item", count = 6 }) {
  switch (type) {
    case "card":
      return <ItemCardSkeleton />;
    case "gauge":
      return <ScoreGaugeSkeleton />;
    case "detail":
      return <ItemDetailSkeleton />;
    case "grid":
      return <ItemGridSkeleton count={count} />;
    case "search":
      return <SearchResultsSkeleton />;
    default:
      return <ItemCardSkeleton />;
  }
}

// CSS for shimmer animation
const styles = `
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
