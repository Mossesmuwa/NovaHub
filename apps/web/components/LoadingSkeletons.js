// components/LoadingSkeletons.js
import { colors } from "../lib/design";

/**
 * 🛰️ THE UPGRADE: Holographic Base Skeleton
 * Uses a sharper, high-contrast shimmer to mimic "data loading."
 */
function Skeleton({
  height = "1rem",
  width = "100%",
  borderRadius = "8px",
  marginBottom = "0",
}) {
  return (
    <div
      className="skeleton-base"
      style={{
        height,
        width,
        borderRadius,
        marginBottom,
        position: "relative",
        overflow: "hidden",
        background: colors.bg3, // Base dark layer
      }}
    />
  );
}

// 🗂️ Item card skeleton - Optimized for the "NovaHub" Feed
export function ItemCardSkeleton() {
  return (
    <div
      style={{
        padding: "20px",
        background: `${colors.bg2}80`,
        borderRadius: "20px",
        border: `1px solid ${colors.bg3}`,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backdropFilter: "blur(10px)",
      }}
    >
      <Skeleton height="180px" width="100%" borderRadius="14px" />
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Skeleton height="22px" width="70%" />
        <Skeleton height="14px" width="100%" />
        <Skeleton height="14px" width="40%" />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
          alignItems: "center",
        }}
      >
        <Skeleton height="32px" width="32px" borderRadius="50%" />
        <Skeleton height="24px" width="80px" borderRadius="99px" />
      </div>
    </div>
  );
}

// 🎯 Intelligence Score Gauge Skeleton
export function ScoreGaugeSkeleton({ size = 180 }) {
  return (
    <div
      style={{
        padding: "30px",
        background: `linear-gradient(180deg, ${colors.bg2}, transparent)`,
        borderRadius: "24px",
        border: `1px solid ${colors.bg3}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `4px solid ${colors.bg3}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Skeleton height="40px" width="60px" />
        {/* Decorative orbit ring */}
        <div className="skeleton-orbit" />
      </div>
      <Skeleton height="18px" width="120px" />
    </div>
  );
}

// 🏛️ Item detail page skeleton - The "Full Terminal" look
export function ItemDetailSkeleton() {
  return (
    <div style={{ padding: "40px 24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div className="detail-header-grid">
        <Skeleton height="160px" width="160px" borderRadius="24px" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
          }}
        >
          <Skeleton height="40px" width="60%" />
          <Skeleton height="20px" width="90%" />
          <div style={{ display: "flex", gap: "12px" }}>
            <Skeleton height="45px" width="140px" borderRadius="12px" />
            <Skeleton height="45px" width="140px" borderRadius="12px" />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
          marginTop: "60px",
        }}
      >
        <ScoreGaugeSkeleton />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="100px" width="100%" borderRadius="16px" />
          ))}
        </div>
      </div>

      <style jsx>{`
        .detail-header-grid {
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
        }
        @media (max-width: 600px) {
          .detail-header-grid {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

// 📦 Global Switcher
export default function LoadingState({ type = "grid", count = 6 }) {
  const content = () => {
    switch (type) {
      case "card":
        return <ItemCardSkeleton />;
      case "gauge":
        return <ScoreGaugeSkeleton />;
      case "detail":
        return <ItemDetailSkeleton />;
      case "grid":
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {Array.from({ length: count }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        );
      default:
        return <ItemCardSkeleton />;
    }
  };

  return (
    <div className="loading-fade-in">
      {content()}
      <style jsx global>{`
        .loading-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .skeleton-base::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            ${colors.gold}10,
            /* Subtle Gold Shimmer */ ${colors.gold}25,
            /* Brighter Center */ ${colors.gold}10,
            transparent
          );
          animation: shimmer-stream 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }

        .skeleton-orbit {
          position: absolute;
          inset: -10px;
          border: 1px dashed ${colors.bg4};
          border-radius: 50%;
          animation: rotate 10s linear infinite;
        }

        @keyframes shimmer-stream {
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
