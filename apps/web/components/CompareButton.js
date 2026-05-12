// components/CompareButton.js
// Premium comparison modal with smooth search, beautiful cards, and instant comparison
import { useState, useEffect } from "react";
import { colors } from "../lib/design";
import Link from "next/link";

export default function CompareButton({ currentItem, onClose }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function handleSearch(query) {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/items/search?q=${query}&exclude=${currentItem.id}`,
      );
      const data = await res.json();
      setResults(data.items || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
    setLoading(false);
  }

  // Featured tools for quick compare
  const featuredTools = [
    {
      name: "Copilot",
      slug: "copilot",
      image: "/images/copilot.jpg",
      score: 88,
    },
    { name: "Claude", slug: "claude", image: "/images/claude.jpg", score: 92 },
    {
      name: "ChatGPT",
      slug: "chatgpt",
      image: "/images/chatgpt.jpg",
      score: 85,
    },
  ];

  const displayItems = search ? results : featuredTools;

  const handleCompare = (item) => {
    if (item.slug === currentItem.slug) return;
    setSelectedItem(item);
    // Navigate to comparison page
    window.location.href = `/compare/${currentItem.slug}-vs-${item.slug}`;
  };

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 998,
          animation: "fadeIn 0.3s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 999,
          width: "90%",
          maxWidth: 600,
          maxHeight: "85vh",
          background: colors.bg2,
          borderRadius: 20,
          border: `1px solid ${colors.bg3}`,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 24,
            background: `linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg3} 100%)`,
            borderBottom: `1px solid ${colors.bg3}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 900,
                margin: 0,
                marginBottom: 4,
                color: colors.t1,
              }}
            >
              ⚔️ Compare Tools
            </h2>
            <p
              style={{
                fontSize: 12,
                color: colors.t3,
                margin: 0,
              }}
            >
              See how {currentItem.name} stacks up
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: colors.bg,
              border: `1px solid ${colors.bg3}`,
              color: colors.t2,
              cursor: "pointer",
              fontSize: 20,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.bg3;
              e.currentTarget.style.color = colors.gold;
              e.currentTarget.style.transform = "rotate(90deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.bg;
              e.currentTarget.style.color = colors.t2;
              e.currentTarget.style.transform = "rotate(0)";
            }}
          >
            ×
          </button>
        </div>

        {/* Search input */}
        <div style={{ padding: 20, borderBottom: `1px solid ${colors.bg3}` }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                color: colors.t3,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search tools to compare..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                borderRadius: 12,
                border: `1px solid ${colors.bg3}`,
                background: colors.bg,
                color: colors.t1,
                fontSize: 14,
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.gold;
                e.currentTarget.style.boxShadow = `0 0 12px ${colors.gold}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.bg3;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Quick tip */}
          {!search && (
            <div
              style={{
                fontSize: 11,
                color: colors.t3,
                marginTop: 8,
                paddingLeft: 12,
              }}
            >
              💡 Or pick from trending tools below
            </div>
          )}
        </div>

        {/* Results grid */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {loading && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: 40,
                color: colors.t3,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  animation: "spin 1s linear infinite",
                  marginBottom: 8,
                }}
              >
                ⏳
              </div>
              Searching...
            </div>
          )}

          {!loading && displayItems.length === 0 && search && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: 40,
                color: colors.t3,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              No tools found. Try another search!
            </div>
          )}

          {!loading &&
            displayItems.map((item, idx) => (
              <div
                key={item.slug || idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleCompare(item)}
                style={{
                  padding: 16,
                  background: hoveredIndex === idx ? colors.bg3 : colors.bg,
                  borderRadius: 12,
                  border: `1px solid ${hoveredIndex === idx ? colors.gold + "40" : colors.bg3}`,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform:
                    hoveredIndex === idx ? "translateY(-4px)" : "translateY(0)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Hover glow */}
                {hoveredIndex === idx && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg, ${colors.gold}10, transparent)`,
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Item image/icon */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      marginBottom: 8,
                      objectFit: "cover",
                      transition: "transform 0.3s ease",
                      transform:
                        hoveredIndex === idx ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                )}

                {/* Item name */}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: hoveredIndex === idx ? colors.gold : colors.t1,
                    marginBottom: 4,
                    transition: "color 0.2s ease",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {item.name}
                </div>

                {/* Nova score if available */}
                {item.score && (
                  <div
                    style={{
                      fontSize: 11,
                      color: colors.green,
                      fontWeight: 700,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    ⭐ {item.score}/100
                  </div>
                )}

                {/* Hover CTA */}
                {hoveredIndex === idx && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 10,
                      color: colors.gold,
                      fontWeight: 700,
                      animation: "slideDown 0.3s ease",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    Click to compare →
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Footer hint */}
        {!search && displayItems.length > 0 && (
          <div
            style={{
              padding: 12,
              background: colors.bg3,
              borderTop: `1px solid ${colors.bg3}`,
              fontSize: 11,
              color: colors.t3,
              textAlign: "center",
            }}
          >
            Showing {displayItems.length} most compared tools
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 20px));
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
