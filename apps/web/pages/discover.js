// pages/discover.js
import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Link from "next/link";
import { useSupabase } from "../lib/SupabaseContext";

// ─── Vibe label helpers ───────────────────────────────────────────────────────
const MOOD_LABELS = [
  "Chill & Calm",
  "Laid-back",
  "Balanced",
  "Energetic",
  "Intense & Bold",
];
const ENERGY_LABELS = [
  "Low key",
  "Relaxed",
  "Moderate",
  "High energy",
  "All out",
];
const FOCUS_LABELS = [
  "Total escapism",
  "Casual",
  "Semi-focused",
  "Deep focus",
  "Hyperfocused",
];

function label(val, arr) {
  return arr[Math.min(Math.floor(val / 21), 4)];
}

// ─── Type → color accent ──────────────────────────────────────────────────────
const TYPE_COLOR = {
  movie: "#E8593C",
  tv: "#E8593C",
  book: "#3B8BD4",
  game: "#7F77DD",
  tool: "#1D9E75",
  course: "#BA7517",
  podcast: "#D4537E",
  video: "#0A84FF",
};

// ─── Result card ──────────────────────────────────────────────────────────────
function VibeCard({ item, index }) {
  const [visible, setVisible] = useState(false);
  const href = item.is_db_item
    ? `/item/${encodeURIComponent(item.slug)}`
    : null;
  const accent = TYPE_COLOR[item.type] || "#C9A84C";
  const isFree = (item.pricing || "").toLowerCase().includes("free");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const inner = (
    <div
      style={{
        background: "var(--bg2)",
        border: `1px solid ${visible ? accent + "30" : "var(--border)"}`,
        borderRadius: "var(--r)",
        padding: "18px",
        height: "100%",
        transition:
          "all 0.4s var(--spring), opacity 0.4s ease, transform 0.4s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        cursor: href ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Accent line top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accent,
          opacity: 0.7,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 10,
        }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              objectFit: "cover",
              flexShrink: 0,
              background: "var(--bg3)",
            }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: accent + "20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 900,
              color: accent,
              flexShrink: 0,
            }}
          >
            {(item.name || "?").charAt(0)}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              marginBottom: 3,
              lineHeight: 1.3,
            }}
          >
            {item.name}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 99,
                background: accent + "18",
                color: accent,
              }}
            >
              {item.type}
            </span>
            {item.pricing && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: isFree
                    ? "rgba(48,209,88,.1)"
                    : "var(--gold-glow)",
                  color: isFree ? "#30D158" : "var(--gold)",
                }}
              >
                {isFree ? "Free" : item.pricing}
              </span>
            )}
            {item.is_suggestion && (
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: "var(--surf)",
                  color: "var(--t3)",
                }}
              >
                AI pick
              </span>
            )}
          </div>
        </div>
      </div>

      {item.reason && (
        <p
          style={{
            fontSize: 12,
            color: "var(--t2)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {item.reason}
        </p>
      )}
    </div>
  );

  return href ? (
    <Link
      href={href}
      style={{ display: "block", textDecoration: "none", color: "inherit" }}
    >
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ─── Vibe summary pill ────────────────────────────────────────────────────────
function VibeSummary({ mood, energy, focus }) {
  const parts = [
    label(mood, MOOD_LABELS),
    label(energy, ENERGY_LABELS),
    label(focus, FOCUS_LABELS),
  ];
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: 32,
      }}
    >
      {[
        { icon: "◐", val: parts[0] },
        { icon: "◈", val: parts[1] },
        { icon: "◎", val: parts[2] },
      ].map((p) => (
        <span
          key={p.val}
          style={{
            padding: "5px 14px",
            borderRadius: 99,
            background: "var(--gold-glow)",
            border: "1px solid var(--gold-glow2)",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--gold)",
          }}
        >
          {p.icon} {p.val}
        </span>
      ))}
    </div>
  );
}

export default function DiscoverPage() {
  const { user } = useSupabase();
  const [mood, setMood] = useState(50);
  const [energy, setEnergy] = useState(50);
  const [focus, setFocus] = useState(50);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const esRef = useRef(null);
  const resultsRef = useRef(null);

  // Cleanup SSE on unmount
  useEffect(() => () => esRef.current?.close(), []);

  async function discover() {
    // Close any existing stream
    esRef.current?.close();
    setItems([]);
    setError("");
    setDone(false);
    setCount(0);
    setLoading(true);

    // Use REST endpoint (non-streaming fallback) for simplicity + reliability
    try {
      const params = new URLSearchParams({
        mode: "vibe",
        mood,
        energy,
        focus,
        limit: "9",
      });
      const res = await fetch(`/api/ai-stream?${params}`);

      if (!res.ok || !res.body) {
        // Fallback to non-streaming
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not reach the AI — try again.");
        setLoading(false);
        return;
      }

      // Stream parsing
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processChunk = (chunk) => {
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload && !payload.count && payload.name) {
                setItems((prev) => [...prev, payload]);
                setCount((c) => c + 1);
              }
            } catch {}
          }
          if (line.startsWith("event: done")) {
            setDone(true);
            setLoading(false);
            setTimeout(
              () =>
                resultsRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                }),
              100,
            );
          }
          if (line.startsWith("event: error")) {
            setError("AI error — try again.");
            setLoading(false);
          }
        }
      };

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) {
          setLoading(false);
          setDone(true);
          break;
        }
        processChunk(decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      setError("Network error — check your connection.");
      setLoading(false);
    }
  }

  const hasResults = items.length > 0;

  return (
    <Layout activePage="discover">
      <SEO
        title="Vibe Dial — NovaHub"
        description="Set your mood, energy, and focus — NovaHub's AI finds what you need."
      />

      <style>{`
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.04)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .slider-track { position:relative; }
        .slider-track input[type=range]::-webkit-slider-runnable-track { background: linear-gradient(to right, var(--gold) 0%, var(--gold) var(--pct,50%), var(--border2) var(--pct,50%), var(--border2) 100%); }
      `}</style>

      {/* ── HERO ── */}
      <div
        style={{
          textAlign: "center",
          padding: "calc(var(--nav) + 60px) 20px 0",
          position: "relative",
          overflow: "hidden",
          minHeight: 340,
        }}
      >
        {/* Background orbs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "15%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(201,168,76,.12) 0%,transparent 70%)",
              animation: "orbFloat 8s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "20%",
              right: "10%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(127,119,221,.08) 0%,transparent 70%)",
              animation: "orbFloat 11s ease-in-out infinite 3s",
            }}
          />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--gold-glow)",
              border: "1px solid var(--gold-glow2)",
              borderRadius: 99,
              padding: "5px 16px",
              fontSize: 11,
              fontWeight: 800,
              color: "var(--gold)",
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--gold)",
                animation: "pulse 2s infinite",
              }}
            />
            ✦ AI-Powered Discovery
          </div>
          <h1 className="vibe-title" style={{ marginBottom: 12 }}>
            Set Your Vibe
          </h1>
          <p className="vibe-sub">
            Tune three dials. Our AI reads your energy and surfaces exactly what
            fits right now.
          </p>
        </div>
      </div>

      {/* ── DIAL CONTAINER ── */}
      <div className="container" style={{ paddingBottom: 0 }}>
        <div className="dial-container" style={{ marginTop: 40 }}>
          {/* Mood */}
          <div className="dial-group">
            <div className="dial-label-row">
              <span>◐ Mood</span>
              <span className="dial-val">{label(mood, MOOD_LABELS)}</span>
            </div>
            <div className="slider-track">
              <input
                type="range"
                min="0"
                max="100"
                value={mood}
                style={{ "--pct": mood + "%" }}
                onChange={(e) => setMood(+e.target.value)}
              />
            </div>
            <div className="dial-ends">
              <span>Chill</span>
              <span>Intense</span>
            </div>
          </div>

          {/* Energy */}
          <div className="dial-group">
            <div className="dial-label-row">
              <span>◈ Energy</span>
              <span className="dial-val">{label(energy, ENERGY_LABELS)}</span>
            </div>
            <div className="slider-track">
              <input
                type="range"
                min="0"
                max="100"
                value={energy}
                style={{ "--pct": energy + "%" }}
                onChange={(e) => setEnergy(+e.target.value)}
              />
            </div>
            <div className="dial-ends">
              <span>Relaxed</span>
              <span>Pumped</span>
            </div>
          </div>

          {/* Focus */}
          <div className="dial-group">
            <div className="dial-label-row">
              <span>◎ Focus level</span>
              <span className="dial-val">{label(focus, FOCUS_LABELS)}</span>
            </div>
            <div className="slider-track">
              <input
                type="range"
                min="0"
                max="100"
                value={focus}
                style={{ "--pct": focus + "%" }}
                onChange={(e) => setFocus(+e.target.value)}
              />
            </div>
            <div className="dial-ends">
              <span>Casual</span>
              <span>Deep focus</span>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 16px",
                background: "rgba(255,69,58,.08)",
                border: "1px solid rgba(255,69,58,.2)",
                borderRadius: "var(--rsm)",
                fontSize: 13,
                color: "#FF453A",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            className="btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              fontSize: 16,
              padding: "16px",
              gap: 10,
            }}
            onClick={discover}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(9,9,12,.3)",
                    borderTopColor: "#09090C",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                AI is reading your vibe{count > 0 ? ` — ${count} found` : "…"}
              </>
            ) : (
              <>{hasResults ? "↺ Rediscover" : "Discover ✦"}</>
            )}
          </button>

          {!user && (
            <div
              style={{
                marginTop: 12,
                textAlign: "center",
                fontSize: 12,
                color: "var(--t3)",
              }}
            >
              <Link
                href="/account/register"
                style={{ color: "var(--gold)", fontWeight: 700 }}
              >
                Sign up free
              </Link>{" "}
              to save picks and get personalised results
            </div>
          )}
        </div>
      </div>

      {/* ── RESULTS ── */}
      {hasResults && (
        <div
          className="container"
          style={{ paddingTop: 48, paddingBottom: 80 }}
          ref={resultsRef}
        >
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <div className="section-label" style={{ marginBottom: 8 }}>
              Your Vibe Match
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,4vw,32px)",
                fontWeight: 900,
                letterSpacing: "-.03em",
                marginBottom: 16,
              }}
            >
              {done
                ? `${items.length} picks, curated for you`
                : "Loading your picks…"}
            </h2>
            <VibeSummary mood={mood} energy={energy} focus={focus} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              gap: 14,
            }}
          >
            {items.map((item, i) => (
              <VibeCard key={item.slug || i} item={item} index={i} />
            ))}
            {/* Skeleton placeholders while loading */}
            {loading &&
              items.length < 9 &&
              Array.from({ length: 9 - items.length }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r)",
                    padding: 18,
                    height: 120,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
          </div>

          {done && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button
                className="btn-secondary"
                onClick={discover}
                style={{ fontSize: 13 }}
              >
                ↺ New picks for this vibe
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty hero state CTA */}
      {!hasResults && !loading && (
        <div
          className="container"
          style={{ paddingTop: 32, paddingBottom: 80, textAlign: "center" }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: 13,
              color: "var(--t3)",
            }}
          >
            <span>✦ Movies, books, games, tools, courses</span>
            <span>·</span>
            <span>Personalised to right now</span>
          </div>
        </div>
      )}
    </Layout>
  );
}
