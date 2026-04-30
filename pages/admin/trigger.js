// pages/admin/trigger.js
// Admin UI — triggers ingestion providers manually.

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabase } from "../../lib/SupabaseContext";
import SEO from "../../components/SEO";

const PROVIDERS = [
  {
    key: "tmdb",
    label: "TMDB",
    icon: "🎬",
    desc: "Movies + TV from TMDB (3 pages × 12 endpoints)",
  },
  {
    key: "producthunt",
    label: "Product Hunt",
    icon: "🚀",
    desc: "Trending tools from Product Hunt (50 posts)",
  },
  {
    key: "rawg",
    label: "RAWG Games",
    icon: "🎮",
    desc: "Top-rated games from RAWG.io (needs RAWG_API_KEY)",
  },
  {
    key: "books",
    label: "Google Books",
    icon: "📚",
    desc: "Curated books from Google Books API",
  },
];

export default function AdminTrigger() {
  const router = useRouter();
  const { user, profile, loading, supabase } = useSupabase();
  const [results, setResults] = useState({});
  const [running, setRunning] = useState({});
  const [itemCount, setItemCount] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [envStatus, setEnvStatus] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/account/login");
      else if (profile && !profile.is_admin) router.replace("/");
    }
  }, [user, profile, loading]);

  useEffect(() => {
    if (!profile?.is_admin) return;
    loadStats();
    fetch("/api/admin/env-check")
      .then((r) => r.json())
      .then(setEnvStatus)
      .catch(() => {});
  }, [profile]);

  async function loadStats() {
    const { count } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true });
    setItemCount(count);

    // Get breakdown by source
    const { data } = await supabase
      .from("items")
      .select("source_name")
      .eq("approved", true);

    if (data) {
      const counts = data.reduce((acc, row) => {
        acc[row.source_name] = (acc[row.source_name] || 0) + 1;
        return acc;
      }, {});
      setBreakdown(Object.entries(counts).sort((a, b) => b[1] - a[1]));
    }
  }

  async function getFreshToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session?.access_token)
      throw new Error("Could not get session — reload and try again.");
    return session.access_token;
  }

  async function trigger(providerKey) {
    setRunning((p) => ({ ...p, [providerKey]: true }));
    setResults((p) => ({ ...p, [providerKey]: null }));

    try {
      const token = await getFreshToken();
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ provider: providerKey }),
      });
      const data = await res.json();
      setResults((p) => ({
        ...p,
        [providerKey]: { ...data, status: res.status },
      }));
      if (res.ok) loadStats();
    } catch (e) {
      setResults((p) => ({
        ...p,
        [providerKey]: { error: e.message, status: 0 },
      }));
    }

    setRunning((p) => ({ ...p, [providerKey]: false }));
  }

  async function triggerAll() {
    for (const p of PROVIDERS) await trigger(p.key);
  }

  function getResultSummary(key, res) {
    if (!res?.success) return null;
    const r = res.results?.[key] || res.results;
    if (!r) return "complete";
    if (key === "tmdb") return `${r.synced || 0} synced`;
    if (key === "producthunt") return `${r.synced || 0} tools synced`;
    if (key === "rawg") return `${r.synced || 0} games synced`;
    if (key === "books") return `${r.synced || 0} books synced`;
    return `${r.synced || r.count || 0} synced`;
  }

  if (loading || !profile?.is_admin)
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
            borderTopColor: "#C9A84C",
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
      <SEO title="Admin — NovaHub" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        body { background:#09090C; color:#F2F2F7; font-family:Inter,system-ui,sans-serif; margin:0; }
        .btn { padding:10px 20px; border-radius:99px; border:none; cursor:pointer; font-size:13px; font-weight:700; font-family:inherit; transition:all .2s; }
        .btn-gold { background:linear-gradient(140deg,#E8C97A,#C9A84C,#9B7520); color:#09090C; }
        .btn-gold:hover { opacity:.9; transform:translateY(-1px); }
        .btn-gold:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .btn-ghost { background:transparent; border:1px solid rgba(255,255,255,.15); color:#AEAEB2; }
        .btn-ghost:hover { border-color:#C9A84C; color:#C9A84C; }
        .btn-ghost:disabled { opacity:.5; cursor:not-allowed; }
        .card { background:#18181F; border:1px solid rgba(255,255,255,.08); border-radius:16px; padding:24px; }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <a
            href="/"
            style={{
              fontSize: 13,
              color: "#636366",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
            }}
          >
            ← NovaHub
          </a>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>
                Admin Panel
              </h1>
              <p style={{ fontSize: 13, color: "#636366", margin: 0 }}>
                {profile?.display_name || user.email}
              </p>
            </div>
            <button
              className="btn btn-gold"
              onClick={triggerAll}
              disabled={anyRunning}
            >
              {anyRunning ? "⟳ Running…" : "▶ Run All Providers"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              background: "#111116",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 900, color: "#C9A84C" }}>
              {itemCount ?? "…"}
            </div>
            <div style={{ fontSize: 12, color: "#636366", marginTop: 2 }}>
              Total items
            </div>
          </div>
          {breakdown.map(([source, count]) => (
            <div
              key={source}
              style={{
                padding: "16px 20px",
                background: "#111116",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 900, color: "#C9A84C" }}>
                {count}
              </div>
              <div style={{ fontSize: 12, color: "#636366", marginTop: 2 }}>
                {source}
              </div>
            </div>
          ))}
        </div>

        {/* Env check */}
        {envStatus && (
          <div
            style={{
              marginBottom: 24,
              padding: "16px 20px",
              background: "#111116",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#636366",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 12,
              }}
            >
              Environment
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                gap: 8,
              }}
            >
              {Object.entries(envStatus.verdict || {}).map(([k, ok]) => (
                <div
                  key={k}
                  style={{
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ color: ok ? "#30D158" : "#FF453A" }}>
                    {ok ? "✓" : "✗"}
                  </span>
                  <span style={{ color: ok ? "#AEAEB2" : "#FF453A" }}>
                    {k.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Provider cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PROVIDERS.map((p) => {
            const res = results[p.key];
            const active = running[p.key];
            const ok = res?.success;
            const isErr = res && !ok;
            const summary = getResultSummary(p.key, res);

            return (
              <div className="card" key={p.key}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", gap: 14, flex: 1 }}>
                    <span style={{ fontSize: 28, lineHeight: 1 }}>
                      {p.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontSize: 15, fontWeight: 700 }}>
                          {p.label}
                        </span>
                        {active && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#C9A84C",
                              animation: "pulse 1s infinite",
                              display: "inline-block",
                            }}
                          />
                        )}
                        {!active && ok && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#30D158",
                              display: "inline-block",
                            }}
                          />
                        )}
                        {!active && isErr && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
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
                    className="btn btn-ghost"
                    onClick={() => trigger(p.key)}
                    disabled={active}
                    style={{ flexShrink: 0 }}
                  >
                    {active ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            border: "1.5px solid #636366",
                            borderTopColor: "#C9A84C",
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
                      marginTop: 16,
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: ok
                        ? "rgba(48,209,88,.06)"
                        : "rgba(255,69,58,.06)",
                      border: `1px solid ${ok ? "rgba(48,209,88,.15)" : "rgba(255,69,58,.15)"}`,
                    }}
                  >
                    {ok ? (
                      <div
                        style={{
                          fontSize: 13,
                          color: "#30D158",
                          fontWeight: 600,
                        }}
                      >
                        ✓ {summary}
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#FF453A",
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          ✗ {res.error || "Failed"}{" "}
                          {res.status ? `(${res.status})` : ""}
                        </div>
                        {res.fix && (
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 12,
                              color: "#FF9F0A",
                              fontFamily: "monospace",
                              background: "rgba(255,159,10,.06)",
                              padding: "8px 10px",
                              borderRadius: 6,
                            }}
                          >
                            Fix: {res.fix}
                          </div>
                        )}
                        {/* Show full error JSON for debugging */}
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
            marginTop: 28,
            padding: "14px 18px",
            background: "rgba(201,168,76,.06)",
            border: "1px solid rgba(201,168,76,.12)",
            borderRadius: 10,
            fontSize: 12,
            color: "#636366",
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: "#C9A84C" }}>Cron schedule:</strong> TMDB 2am
          · PH 5am · RAWG 3am · Books 4am · Pulse 6am (UTC daily).
          <br />
          RAWG requires <code style={{ color: "#AEAEB2" }}>
            RAWG_API_KEY
          </code>{" "}
          in Vercel env vars — free at rawg.io.
        </div>
      </div>
    </>
  );
}
