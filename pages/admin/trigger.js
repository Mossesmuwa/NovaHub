// pages/admin/trigger.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

const PROVIDERS = [
  {
    key: "tmdb",
    label: "TMDB",
    icon: "🎬",
    desc: "Movies + TV · ~500 items",
    needsKey: false,
  },
  {
    key: "producthunt",
    label: "Product Hunt",
    icon: "🚀",
    desc: "Trending tools · 50 posts",
    needsKey: false,
  },
  {
    key: "rawg",
    label: "RAWG Games",
    icon: "🎮",
    desc: "Top games · 40 items",
    needsKey: true,
    keyName: "RAWG_API_KEY",
  },
  {
    key: "books",
    label: "Google Books",
    icon: "📚",
    desc: "Curated books · 8 subjects",
    needsKey: false,
  },
  {
    key: "github",
    label: "GitHub",
    icon: "⚡",
    desc: "Trending repos · 30 items",
    needsKey: false,
  },
  {
    key: "hackernews",
    label: "Hacker News",
    icon: "🔶",
    desc: "Top stories · 30 items",
    needsKey: false,
  },
  {
    key: "steam",
    label: "Steam",
    icon: "🖥️",
    desc: "Top PC games · 40 items",
    needsKey: false,
  },
  {
    key: "arxiv",
    label: "arXiv",
    icon: "🔬",
    desc: "Research papers · 30 items",
    needsKey: false,
  },
  {
    key: "reddit",
    label: "Reddit",
    icon: "🟠",
    desc: "Top posts across subreddits",
    needsKey: false,
  },
  {
    key: "spotify",
    label: "Spotify",
    icon: "🎵",
    desc: "Trending music · 40 items",
    needsKey: true,
    keyName: "SPOTIFY_CLIENT_ID",
  },
  {
    key: "nyt",
    label: "NYT Books",
    icon: "📰",
    desc: "Bestseller lists",
    needsKey: true,
    keyName: "NYT_API_KEY",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: "▶️",
    desc: "Trending videos · 50 items",
    needsKey: true,
    keyName: "YOUTUBE_API_KEY",
  },
  {
    key: "omdb",
    label: "OMDB Enricher",
    icon: "⭐",
    desc: "Adds IMDB+RT+Metacritic to movies",
    needsKey: true,
    keyName: "OMDB_API_KEY",
  },
];

export default function AdminTrigger() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({});
  const [running, setRunning] = useState({});
  const [stats, setStats] = useState({ total: null, breakdown: [] });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/account/login");
        return;
      }
      setUser(user);
      supabase
        .from("profiles")
        .select("is_admin,display_name")
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
    const { data } = await supabase
      .from("items")
      .select("source_name")
      .eq("approved", true);
    if (data) {
      const counts = data.reduce((acc, r) => {
        acc[r.source_name] = (acc[r.source_name] || 0) + 1;
        return acc;
      }, {});
      setStats({
        total: count,
        breakdown: Object.entries(counts).sort((a, b) => b[1] - a[1]),
      });
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
      setResults((p) => ({ ...p, [key]: { ...data, httpStatus: res.status } }));
      if (res.ok) loadStats();
    } catch (e) {
      setResults((p) => ({ ...p, [key]: { error: e.message } }));
    }
    setRunning((p) => ({ ...p, [key]: false }));
  }

  async function runAll() {
    for (const p of PROVIDERS) await trigger(p.key);
  }

  function summary(key, res) {
    if (!res?.success) return null;
    const r = res.results?.[key];
    if (!r) return "done";
    if (key === "omdb") return `${r.enriched || 0} enriched`;
    return `${r.synced || 0} synced`;
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
            border: "2px solid #222",
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
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}body{background:#09090C;color:#F2F2F7;font-family:Inter,system-ui,sans-serif}`}</style>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>
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
            onClick={runAll}
            disabled={anyRunning}
            style={{
              background: "#7C3AED",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: anyRunning ? "not-allowed" : "pointer",
              opacity: anyRunning ? 0.5 : 1,
            }}
          >
            {anyRunning ? "⟳ Running..." : "▶ Run All Providers"}
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))",
            gap: 8,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              background: "#111116",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 900, color: "#7C3AED" }}>
              {stats.total ?? "…"}
            </div>
            <div style={{ fontSize: 11, color: "#636366", marginTop: 2 }}>
              Total items
            </div>
          </div>
          {stats.breakdown.map(([src, count]) => (
            <div
              key={src}
              style={{
                background: "#111116",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 900, color: "#7C3AED" }}>
                {count}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#636366",
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {src}
              </div>
            </div>
          ))}
        </div>

        {/* Providers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(380px,1fr))",
            gap: 10,
          }}
        >
          {PROVIDERS.map((p) => {
            const res = results[p.key];
            const busy = running[p.key];
            const ok = res?.success;
            const sum = summary(p.key, res);

            return (
              <div
                key={p.key}
                style={{
                  background: "#18181F",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 14,
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>
                      {p.icon}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700 }}>
                          {p.label}
                        </span>
                        {p.needsKey && (
                          <span
                            style={{
                              fontSize: 9,
                              background: "rgba(255,159,10,.15)",
                              color: "#FF9F0A",
                              padding: "1px 5px",
                              borderRadius: 4,
                              fontWeight: 700,
                            }}
                          >
                            KEY
                          </span>
                        )}
                        {busy && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
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
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#30D158",
                              display: "inline-block",
                            }}
                          />
                        )}
                        {!busy && res && !ok && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#FF453A",
                              display: "inline-block",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "#636366" }}>
                        {p.desc}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => trigger(p.key)}
                    disabled={busy}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,.1)",
                      color: "#AEAEB2",
                      borderRadius: 8,
                      padding: "6px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: busy ? "not-allowed" : "pointer",
                      flexShrink: 0,
                      opacity: busy ? 0.5 : 1,
                    }}
                  >
                    {busy ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            border: "1.5px solid #444",
                            borderTopColor: "#7C3AED",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin .7s linear infinite",
                          }}
                        />
                        …
                      </span>
                    ) : (
                      "▶"
                    )}
                  </button>
                </div>

                {res && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "8px 12px",
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
                          fontSize: 12,
                          color: "#30D158",
                          fontWeight: 600,
                        }}
                      >
                        ✓ {sum}
                      </span>
                    ) : (
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#FF453A",
                            fontWeight: 600,
                          }}
                        >
                          ✗ {res.error || `HTTP ${res.httpStatus}`}
                        </div>
                        {res.fix && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "#FF9F0A",
                              marginTop: 4,
                              fontFamily: "monospace",
                            }}
                          >
                            {res.fix}
                          </div>
                        )}
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
            fontSize: 11,
            color: "#2a2a2a",
            lineHeight: 2,
          }}
        >
          Crons (UTC): GitHub 1am · TMDB 2am · RAWG 3am · Books 4am · PH 5am ·
          Pulse 6am · OMDB 7am · HN 8am · Reddit 9am · arXiv 10am · Steam 11am ·
          Spotify 12pm · NYT 1pm · YouTube 2pm
        </div>
      </div>
    </>
  );
}
