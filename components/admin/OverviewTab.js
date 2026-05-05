// components/admin/OverviewTab.js
const GOLD = {
  primary: "#C9A84C",
  light: "#E8C97A",
  surface: "#111116",
  borderSoft: "rgba(255,255,255,0.06)",
  text: "#F2F2F7",
  muted: "#636366",
  green: "#30D158",
  orange: "#FF9F0A",
  red: "#FF453A",
  blue: "#0A84FF",
};

export default function OverviewTab({ stats }) {
  const cards = [
    {
      label: "Total Items",
      value: stats.totalItems,
      color: GOLD.primary,
      icon: "📦",
    },
    {
      label: "Approved",
      value: stats.approvedItems,
      color: GOLD.green,
      icon: "✓",
    },
    {
      label: "Pending",
      value: stats.pendingItems,
      color: GOLD.orange,
      icon: "⏳",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      color: GOLD.blue,
      icon: "👥",
    },
    {
      label: "Pro Users",
      value: stats.proUsers,
      color: GOLD.primary,
      icon: "⭐",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
          <span
            style={{
              background: `linear-gradient(135deg, ${GOLD.light}, ${GOLD.primary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Dashboard Overview
          </span>
        </h1>
        <p style={{ fontSize: 14, color: GOLD.muted }}>
          System health & key metrics
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.label}
            className="stat-card"
            style={{
              animation: "fadeIn 0.6s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: GOLD.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {card.label}
              </span>
              <span style={{ fontSize: 20 }}>{card.icon}</span>
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: card.color,
                letterSpacing: "-0.04em",
              }}
            >
              {card.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Source Breakdown */}
      {stats.bySource.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 800,
              marginBottom: 16,
              color: GOLD.text,
            }}
          >
            Items by Source
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {stats.bySource.slice(0, 6).map(([source, count]) => {
              const percentage = (
                (count / (stats.totalItems || 1)) *
                100
              ).toFixed(1);
              return (
                <div
                  key={source}
                  className="stat-card"
                  style={{
                    background: GOLD.surface,
                    border: `1px solid ${GOLD.borderSoft}`,
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
                    <span style={{ fontSize: 12, fontWeight: 700 }}>
                      {source}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: GOLD.primary,
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: GOLD.borderSoft,
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, percentage)}%`,
                        background: `linear-gradient(90deg, ${GOLD.primary}, ${GOLD.light})`,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{ fontSize: 10, color: GOLD.muted, marginTop: 6 }}
                  >
                    {percentage}% of total
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Section */}
      <div
        style={{
          padding: 24,
          borderRadius: 14,
          border: `1px solid ${GOLD.borderSoft}`,
          background: GOLD.surface,
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 12,
            color: GOLD.text,
          }}
        >
          System Status
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: GOLD.green,
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ fontSize: 13, color: GOLD.muted }}>
            ✓ All systems operational
          </span>
        </div>
        <div style={{ fontSize: 12, color: GOLD.muted, lineHeight: 1.6 }}>
          Platform is running smoothly. {stats.totalItems.toLocaleString()}{" "}
          items available from {stats.bySource.length} sources.
        </div>
      </div>
    </div>
  );
}
