// components/TrailerPlayer.js - Movie Trailer Component
import { useState, useEffect } from "react";

const G = {
  bg: "#09090C",
  bg2: "#0F0F14",
  bg3: "#16161E",
  bg4: "#1C1C26",
  gold: "#C9A84C",
  goldL: "#E8C97A",
  border: "rgba(255,255,255,0.06)",
  borderG: "rgba(201,168,76,0.20)",
  t1: "#F2F2F7",
  t2: "#AEAEB2",
  t3: "#636366",
  green: "#30D158",
  red: "#FF453A",
  orange: "#FF9F0A",
  blue: "#0A84FF",
};

const Icon = {
  play: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  close: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

export default function TrailerPlayer({ tmdbId, itemName }) {
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (tmdbId) {
      fetchTrailers();
    }
  }, [tmdbId]);

  async function fetchTrailers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/trailers?tmdb_id=${tmdbId}`);
      if (res.ok) {
        const data = await res.json();
        setTrailers(data.trailers || []);
        if (data.trailers && data.trailers.length > 0) {
          setSelectedTrailer(data.trailers[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch trailers:", err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          background: G.bg2,
          border: `1px solid ${G.border}`,
          borderRadius: 16,
          color: G.t3,
        }}
      >
        Loading trailers...
      </div>
    );
  }

  if (trailers.length === 0) {
    return null; // Don't show anything if no trailers
  }

  return (
    <div
      style={{
        marginBottom: 40,
        background: G.bg2,
        border: `1px solid ${G.border}`,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Thumbnail Grid (when player not open) */}
      {!showPlayer && (
        <div style={{ padding: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>
            Trailers & Videos
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {trailers.map((trailer) => (
              <button
                key={trailer.key}
                onClick={() => {
                  setSelectedTrailer(trailer);
                  setShowPlayer(true);
                }}
                style={{
                  position: "relative",
                  aspectRatio: "16/9",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `2px solid ${G.border}`,
                  background: G.bg3,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = G.gold;
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = G.border;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {/* YouTube Thumbnail */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                {/* Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: G.gold,
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Icon.play />
                  </div>
                  <div
                    style={{
                      color: G.t1,
                      fontSize: 13,
                      fontWeight: 700,
                      textAlign: "center",
                      padding: "0 12px",
                    }}
                  >
                    {trailer.name}
                  </div>
                  <div
                    style={{
                      color: G.t3,
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {trailer.type}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video Player (when open) */}
      {showPlayer && selectedTrailer && (
        <div style={{ position: "relative" }}>
          {/* Close Button */}
          <button
            onClick={() => setShowPlayer(false)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.8)",
              border: `1px solid ${G.border}`,
              color: G.t1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = G.gold;
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.8)";
              e.currentTarget.style.color = G.t1;
            }}
          >
            <Icon.close />
          </button>

          {/* YouTube Embed */}
          <div
            style={{
              position: "relative",
              paddingTop: "56.25%",
              background: "#000",
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&rel=0&modestbranding=1`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Trailer Info */}
          <div style={{ padding: 20, background: G.bg3 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
              {selectedTrailer.name}
            </div>
            <div style={{ fontSize: 13, color: G.t3 }}>
              {selectedTrailer.type} ·{" "}
              {new Date(selectedTrailer.published_at).toLocaleDateString()}
            </div>
          </div>

          {/* Other Trailers */}
          {trailers.length > 1 && (
            <div
              style={{
                padding: "16px 20px 20px",
                background: G.bg2,
                borderTop: `1px solid ${G.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: G.t3,
                  marginBottom: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                More Videos
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {trailers
                  .filter((t) => t.key !== selectedTrailer.key)
                  .map((trailer) => (
                    <button
                      key={trailer.key}
                      onClick={() => setSelectedTrailer(trailer)}
                      style={{
                        flexShrink: 0,
                        width: 160,
                        aspectRatio: "16/9",
                        borderRadius: 8,
                        overflow: "hidden",
                        border: `2px solid ${G.border}`,
                        background: G.bg3,
                        cursor: "pointer",
                        position: "relative",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = G.gold)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = G.border)
                      }
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundImage: `url(https://img.youtube.com/vi/${trailer.key}/mqdefault.jpg)`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: G.gold,
                            color: "#000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon.play />
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
