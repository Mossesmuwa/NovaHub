// pages/admin/trigger.js
// Admin UI — triggers ingestion providers manually.

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

const PROVIDERS = [
  {
    key: "tmdb",
    label: "TMDB",
    icon: "🎬",
    desc: "Movies + TV · 3 pages × 12 endpoints · ~500 items",
  },
  {
    key: "producthunt",
    label: "Product Hunt",
    icon: "🚀",
    desc: "Trending tools · 50 posts",
  },
  {
    key: "rawg",
    label: "RAWG Games",
    icon: "🎮",
    desc: "Top-rated games · needs RAWG_API_KEY",
  },
  {
    key: "books",
    label: "Google Books",
    icon: "📚",
    desc: "Curated books across 8 subjects",
  },
  {
    key: "github",
    label: "GitHub",
    icon: "⚡",
    desc: "Trending repos this week · 30 items",
  },
  {
    key: "hackernews",
    label: "Hacker News",
    icon: "🔶",
    desc: "Top HN stories today · 30 items",
  },
  {
    key: "omdb",
    label: "OMDB Enricher",
    icon: "⭐",
    desc: "Adds IMDB + RT + Metacritic to movies",
  },
];

export default function AdminTrigger() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({});
  const [running, setRunning] = useState({});
  const [breakdown, setBreakdown] = useState([]);
  const [itemCount, setItemCount] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/account/login");
        return;
      }
      setUser(user);
      supabase
        .from("profiles")
        .select("is_admin, display_name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (!data?.is_admin) {
            router.replace("/");
            return;
          }
          setProfile(data);
          setLoading(false);
          loadStats();
        });
    });
  }, []);

  async function loadStats() {
    const { count } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("approved", true);
    setItemCount(count);
    const { data } = await supabase
      .from("items")
      .select("source_name")
      .eq("approved", true);
    if (data) {
      const counts = data.reduce((acc, r) => {
        acc[r.source_name] = (acc[r.source_name] || 0) + 1;
        return acc;
      }, {});
      setBreakdown(Object.entries(counts).sort((a, b) => b[1] - a[1]));
    }
  }

  async function trigger(key) {
    setRunning((p) => ({ ...p, [key]: true }));
    setResults((p) => ({ ...p, [key]: null }));
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ provider: key }),
      });
      const data = await res.json();
      setResults((p) => ({ ...p, [key]: { ...data, status: res.status } }));
      if (res.ok) loadStats();
    } catch (e) {
      setResults((p) => ({ ...p, [key]: { error: e.message } }));
    }
    setRunning((p) => ({ ...p, [key]: false }));
  }

  async function triggerAll() {
    for (const p of PROVIDERS) await trigger(p.key);
  }

  function getSummary(key, res) {
    if (!res?.success) return null;
    const r = res.results?.[key];
    if (!r) return null;
    if (key === "omdb") return `${r.enriched || 0} movies enriched`;
    return `${r.synced || 0} items synced`;
  }

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#09090C",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "2px solid #333",
            borderTopColor: "#7C3AED",
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  const anyRunning = Object.values(running).some(Boolean);

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        body{background:#09090C;color:#F2F2F7;font-family:Inter,system-ui,sans-serif}
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <a
              href="/"
              style={{ fontSize: 13, color: "#636366", textDecoration: "none" }}
            >
              ← Home
            </a>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
              Admin Panel
            </h1>
            <p style={{ fontSize: 13, color: "#636366", marginTop: 2 }}>
              {profile?.display_name || user?.email}
            </p>
          </div>
          <button
            onClick={triggerAll}
            disabled={anyRunning}
            style={{
              background: "#7C3AED",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              opacity: anyRunning ? 0.5 : 1,
            }}
          >
            {anyRunning ? "⟳ Running..." : "▶ Run All"}
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              background: "#111116",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 12,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 900, color: "#7C3AED" }}>
              {itemCount ?? "…"}
            </div>
            <div style={{ fontSize: 12, color: "#636366", marginTop: 2 }}>
              Total items
            </div>
          </div>
          {breakdown.map(([src, count]) => (
            <div
              key={src}
              style={{
                background: "#111116",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: "#7C3AED" }}>
                {count}
              </div>
              <div style={{ fontSize: 12, color: "#636366", marginTop: 2 }}>
                {src}
              </div>
            </div>
          ))}
        </div>

        {/* Provider cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PROVIDERS.map((p) => {
            const res = results[p.key];
            const busy = running[p.key];
            const ok = res?.success;
            const summary = getSummary(p.key, res);

            return (
              <div
                key={p.key}
                style={{
                  background: "#18181F",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 14,
                  padding: "20px 22px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      flex: 1,
                    }}
                  >
                    <span style={{ fontSize: 26 }}>{p.icon}</span>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {p.label}
                        </span>
                        {busy && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: "#7C3AED",
                              display: "inline-block",
                              animation: "pulse 1s infinite",
                            }}
                          />
                        )}
                        {!busy && ok && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: "#30D158",
                              display: "inline-block",
                            }}
                          />
                        )}
                        {!busy && res && !ok && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: "#FF453A",
                              display: "inline-block",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#636366" }}>
                        {p.desc}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => trigger(p.key)}
                    disabled={busy}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,.12)",
                      color: "#AEAEB2",
                      borderRadius: 8,
                      padding: "8px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                      opacity: busy ? 0.5 : 1,
                    }}
                  >
                    {busy ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 11,
                            height: 11,
                            border: "1.5px solid #555",
                            borderTopColor: "#7C3AED",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin .7s linear infinite",
                          }}
                        />
                        Running
                      </span>
                    ) : (
                      "▶ Run"
                    )}
                  </button>
                </div>

                {res && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: ok
                        ? "rgba(48,209,88,.05)"
                        : "rgba(255,69,58,.05)",
                      border: `1px solid ${ok ? "rgba(48,209,88,.12)" : "rgba(255,69,58,.12)"}`,
                    }}
                  >
                    {ok ? (
                      <span
                        style={{
                          fontSize: 13,
                          color: "#30D158",
                          fontWeight: 600,
                        }}
                      >
                        ✓ {summary || "Complete"}
                      </span>
                    ) : (
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#FF453A",
                            fontWeight: 600,
                          }}
                        >
                          ✗ {res.error || "Failed"}
                        </div>
                        {res.fix && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#FF9F0A",
                              marginTop: 6,
                              fontFamily: "monospace",
                            }}
                          >
                            Fix: {res.fix}
                          </div>
                        )}
                        <details style={{ marginTop: 8 }}>
                          <summary
                            style={{
                              fontSize: 11,
                              color: "#636366",
                              cursor: "pointer",
                            }}
                          >
                            Full response
                          </summary>
                          <pre
                            style={{
                              fontSize: 10,
                              color: "#636366",
                              marginTop: 6,
                              overflow: "auto",
                              maxHeight: 200,
                            }}
                          >
                            {JSON.stringify(res, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 12,
            color: "#3a3a3a",
            lineHeight: 1.8,
          }}
        >
          Crons: GitHub 1am · TMDB 2am · RAWG 3am · Books 4am · PH 5am · Pulse
          6am · OMDB 7am · HN 8am (UTC)
        </div>
      </div>
    </>
  );
}
