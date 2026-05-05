// pages/admin/dashboard.js - Complete Nova Admin Panel
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Head from "next/head";

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
  shield: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  database: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  brain: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.14Z" />
    </svg>
  ),
  users: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  alert: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  refresh: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  settings: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m5.66-12.66L15 9m-6 6-2.66 2.66M23 12h-6m-6 0H1m17.66 5.66L15 15m-6-6-2.66-2.66" />
    </svg>
  ),
  trending: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
};

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Data states
  const [stats, setStats] = useState({});
  const [providers, setProviders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [b2bLeads, setB2bLeads] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user?.is_admin) {
      fetchData();
    }
  }, [tab, user]);

  async function checkAuth() {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (!profile?.is_admin) {
      window.location.href = "/";
      return;
    }

    setUser(profile);
    setLoading(false);
  }

  async function fetchData() {
    if (tab === "overview") {
      await fetchOverview();
    } else if (tab === "pipeline") {
      await fetchProviders();
    } else if (tab === "intelligence") {
      await fetchIntelligence();
    } else if (tab === "security") {
      await fetchSecurity();
    } else if (tab === "business") {
      await fetchBusiness();
    }
  }

  async function fetchOverview() {
    const [itemsRes, usersRes, providersRes] = await Promise.all([
      supabase.from("items").select("id, approved, category_id, created_at"),
      supabase.from("profiles").select("id, is_pro, created_at"),
      supabase.from("provider_sync_status").select("*"),
    ]);

    const items = itemsRes.data || [];
    const users = usersRes.data || [];
    const providerData = providersRes.data || [];

    setStats({
      totalItems: items.length,
      approvedItems: items.filter((i) => i.approved).length,
      pendingItems: items.filter((i) => !i.approved).length,
      totalUsers: users.length,
      proUsers: users.filter((u) => u.is_pro).length,
      activeProviders: providerData.filter((p) => p.status === "running")
        .length,
      errorProviders: providerData.filter((p) => p.status === "error").length,
    });
  }

  async function fetchProviders() {
    const { data } = await supabase
      .from("provider_sync_status")
      .select("*")
      .order("provider_name");
    setProviders(data || []);
  }

  async function fetchIntelligence() {
    const [anomaliesRes, pendingRes] = await Promise.all([
      supabase
        .from("trend_anomalies")
        .select("*, items(name)")
        .eq("reviewed", false)
        .order("detected_at", { ascending: false })
        .limit(20),
      supabase
        .from("pending_items")
        .select("*")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false })
        .limit(20),
    ]);

    setAnomalies(anomaliesRes.data || []);
    setPendingItems(pendingRes.data || []);
  }

  async function fetchSecurity() {
    const { data } = await supabase
      .from("admin_audit_logs")
      .select("*, profiles(display_name)")
      .order("created_at", { ascending: false })
      .limit(50);
    setAuditLogs(data || []);
  }

  async function fetchBusiness() {
    const { data } = await supabase
      .from("b2b_leads")
      .select("*")
      .order("created_at", { ascending: false });
    setB2bLeads(data || []);
  }

  async function triggerProvider(providerName) {
    try {
      const res = await fetch("/api/admin/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerName }),
      });
      if (res.ok) {
        alert(`${providerName} triggered successfully`);
        fetchProviders();
      } else {
        alert("Failed to trigger provider");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function approveItem(pendingId, itemData) {
    try {
      // Insert into items table
      const { data: newItem, error } = await supabase
        .from("items")
        .insert([{ ...itemData, approved: true }])
        .select()
        .single();

      if (error) throw error;

      // Update pending item
      await supabase
        .from("pending_items")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", pendingId);

      // Log action
      await supabase.rpc("log_admin_action", {
        p_action: "APPROVE_ITEM",
        p_resource_type: "pending_item",
        p_resource_id: pendingId,
        p_new_value: newItem,
      });

      alert("Item approved!");
      fetchIntelligence();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function rejectItem(pendingId) {
    try {
      await supabase
        .from("pending_items")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", pendingId);

      await supabase.rpc("log_admin_action", {
        p_action: "REJECT_ITEM",
        p_resource_type: "pending_item",
        p_resource_id: pendingId,
      });

      alert("Item rejected");
      fetchIntelligence();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: G.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: G.t2,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Nova</title>
      </Head>

      <div style={{ minHeight: "100vh", background: G.bg }}>
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${G.border}`,
            background: G.bg2,
          }}
        >
          <div
            style={{
              maxWidth: 1600,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>
                Nova Admin
              </h1>
              <p style={{ fontSize: 13, color: G.t3 }}>
                Welcome back, {user?.display_name || "Admin"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                onClick={fetchData}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${G.border}`,
                  background: G.bg3,
                  color: G.t2,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Icon.refresh /> Refresh
              </button>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: G.gold + "15",
                  color: G.gold,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                SUPER ADMIN
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{ borderBottom: `1px solid ${G.border}`, background: G.bg }}
        >
          <div
            style={{
              maxWidth: 1600,
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              gap: 8,
              overflowX: "auto",
            }}
          >
            {[
              { id: "overview", label: "Overview", icon: Icon.database },
              { id: "pipeline", label: "Pipeline", icon: Icon.refresh },
              { id: "intelligence", label: "Intelligence", icon: Icon.brain },
              { id: "security", label: "Security", icon: Icon.shield },
              { id: "business", label: "Business", icon: Icon.users },
              { id: "settings", label: "Settings", icon: Icon.settings },
            ].map((t) => {
              const IconComp = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      tab === t.id
                        ? `2px solid ${G.gold}`
                        : "2px solid transparent",
                    background: "none",
                    border: "none",
                    color: tab === t.id ? G.gold : G.t3,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  <IconComp /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1600, margin: "0 auto", padding: "24px" }}>
          {tab === "overview" && <OverviewTab stats={stats} />}
          {tab === "pipeline" && (
            <PipelineTab
              providers={providers}
              triggerProvider={triggerProvider}
            />
          )}
          {tab === "intelligence" && (
            <IntelligenceTab
              anomalies={anomalies}
              pendingItems={pendingItems}
              approveItem={approveItem}
              rejectItem={rejectItem}
            />
          )}
          {tab === "security" && <SecurityTab auditLogs={auditLogs} />}
          {tab === "business" && <BusinessTab leads={b2bLeads} />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

function OverviewTab({ stats }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>
        System Overview
      </h2>

      {/* KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 40,
        }}
      >
        <KPICard
          label="Total Items"
          value={stats.totalItems || 0}
          color={G.gold}
        />
        <KPICard
          label="Approved"
          value={stats.approvedItems || 0}
          color={G.green}
        />
        <KPICard
          label="Pending Review"
          value={stats.pendingItems || 0}
          color={G.orange}
        />
        <KPICard
          label="Total Users"
          value={stats.totalUsers || 0}
          color={G.blue}
        />
        <KPICard label="Pro Users" value={stats.proUsers || 0} color={G.gold} />
        <KPICard
          label="Active Providers"
          value={stats.activeProviders || 0}
          color={G.green}
        />
        <KPICard
          label="Error Providers"
          value={stats.errorProviders || 0}
          color={G.red}
        />
      </div>

      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: `1px solid ${G.border}`,
          background: G.bg2,
        }}
      >
        <p style={{ fontSize: 13, color: G.t2 }}>
          System is operational. All critical services running normally.
        </p>
      </div>
    </div>
  );
}

function KPICard({ label, value, color }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${G.border}`,
        background: G.bg2,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: G.t3,
          marginBottom: 8,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function PipelineTab({ providers, triggerProvider }) {
  const [filter, setFilter] = useState("all");

  const filtered = providers.filter((p) => {
    if (filter === "all") return true;
    if (filter === "has_key") return p.has_api_key;
    if (filter === "no_key") return !p.has_api_key;
    if (filter === "running") return p.status === "running";
    if (filter === "error") return p.status === "error";
    return true;
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 900 }}>Provider Pipeline</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "has_key", "no_key", "running", "error"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${filter === f ? G.gold + "50" : G.border}`,
                background: filter === f ? G.gold + "15" : "transparent",
                color: filter === f ? G.gold : G.t3,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((p) => (
          <div
            key={p.provider_name}
            style={{
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${G.border}`,
              background: G.bg2,
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
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <StatusDot status={p.status} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    {p.provider_name}
                  </div>
                  <div style={{ fontSize: 11, color: G.t3 }}>
                    {p.requires_api_key && (
                      <span style={{ color: p.has_api_key ? G.green : G.red }}>
                        {p.has_api_key ? "✓ API Key" : "✗ Missing API Key"}
                      </span>
                    )}
                    {!p.requires_api_key && (
                      <span style={{ color: G.green }}>✓ No Key Required</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => triggerProvider(p.provider_name)}
                  disabled={p.status === "running"}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: `1px solid ${G.border}`,
                    background: G.bg3,
                    color: G.t2,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: p.status === "running" ? "not-allowed" : "pointer",
                    opacity: p.status === "running" ? 0.5 : 1,
                  }}
                >
                  Trigger
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 12,
                fontSize: 11,
              }}
            >
              <div>
                <span style={{ color: G.t3 }}>Last Sync:</span>{" "}
                {p.last_sync_at
                  ? new Date(p.last_sync_at).toLocaleTimeString()
                  : "Never"}
              </div>
              <div>
                <span style={{ color: G.t3 }}>Items:</span>{" "}
                {p.items_synced || 0}
              </div>
              <div>
                <span style={{ color: G.t3 }}>Failed:</span>{" "}
                {p.items_failed || 0}
              </div>
              <div>
                <span style={{ color: G.t3 }}>Duration:</span>{" "}
                {p.sync_duration_ms
                  ? `${(p.sync_duration_ms / 1000).toFixed(1)}s`
                  : "N/A"}
              </div>
            </div>

            {p.last_error_message && (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 8,
                  background: G.red + "10",
                  border: `1px solid ${G.red}30`,
                  fontSize: 11,
                  color: G.red,
                }}
              >
                {p.last_error_message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusDot({ status }) {
  const colors = {
    running: G.gold,
    idle: G.green,
    error: G.red,
    disabled: G.t3,
  };
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: colors[status] || G.t3,
        animation: status === "running" ? "pulse 1.5s infinite" : "none",
      }}
    />
  );
}

function IntelligenceTab({ anomalies, pendingItems, approveItem, rejectItem }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>
        Intelligence & Review
      </h2>

      {/* Anomalies */}
      <h3
        style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: G.t2 }}
      >
        Trend Anomalies
      </h3>
      {anomalies.length === 0 ? (
        <div
          style={{
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${G.border}`,
            background: G.bg2,
            marginBottom: 40,
            textAlign: "center",
            color: G.t3,
          }}
        >
          No anomalies detected
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 40,
          }}
        >
          {anomalies.map((a) => (
            <div
              key={a.id}
              style={{
                padding: 14,
                borderRadius: 12,
                border: `1px solid ${a.severity === "critical" ? G.red + "50" : G.orange + "50"}`,
                background: G.bg2,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {a.items?.name || "Unknown Item"}
                  </div>
                  <div style={{ fontSize: 11, color: G.t3, marginTop: 4 }}>
                    {a.anomaly_type} · {a.metric_name} ·{" "}
                    {a.change_percentage > 0 ? "+" : ""}
                    {a.change_percentage.toFixed(0)}%
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    padding: "4px 8px",
                    borderRadius: 6,
                    background:
                      a.severity === "critical"
                        ? G.red + "15"
                        : G.orange + "15",
                    color: a.severity === "critical" ? G.red : G.orange,
                    fontWeight: 800,
                  }}
                >
                  {a.severity.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Items */}
      <h3
        style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: G.t2 }}
      >
        Pending Approval
      </h3>
      {pendingItems.length === 0 ? (
        <div
          style={{
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${G.border}`,
            background: G.bg2,
            textAlign: "center",
            color: G.t3,
          }}
        >
          No items pending review
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pendingItems.map((p) => (
            <div
              key={p.id}
              style={{
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${G.border}`,
                background: G.bg2,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  {p.item_data?.name || "Untitled"}
                </div>
                <div style={{ fontSize: 11, color: G.t3 }}>
                  Source: {p.source_name} · Category: {p.suggested_category}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => approveItem(p.id, p.item_data)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: G.green,
                    color: "#000",
                    fontSize: 11,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectItem(p.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: `1px solid ${G.border}`,
                    background: "transparent",
                    color: G.t2,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SecurityTab({ auditLogs }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>
        Security & Audit Logs
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {auditLogs.length === 0 ? (
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${G.border}`,
              background: G.bg2,
              textAlign: "center",
              color: G.t3,
            }}
          >
            No audit logs yet
          </div>
        ) : (
          auditLogs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${G.border}`,
                background: G.bg2,
                fontSize: 11,
                fontFamily: "monospace",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ color: G.gold }}>{log.action}</span>
                <span style={{ color: G.t3 }}>
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              <div style={{ color: G.t3 }}>
                User: {log.profiles?.display_name || "Unknown"} · Resource:{" "}
                {log.resource_type}/{log.resource_id}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BusinessTab({ leads }) {
  const stages = ["lead", "contacted", "demo", "negotiating", "won", "lost"];

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>
        B2B Pipeline
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 12,
        }}
      >
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          return (
            <div
              key={stage}
              style={{
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${G.border}`,
                background: G.bg2,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: G.t3,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                {stage} ({stageLeads.length})
              </div>
              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: `1px solid ${G.border}`,
                    background: G.bg3,
                    marginBottom: 8,
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{lead.company_name}</div>
                  <div style={{ fontSize: 10, color: G.t3 }}>
                    {lead.plan_interest}
                  </div>
                  {lead.estimated_value && (
                    <div style={{ fontSize: 10, color: G.gold, marginTop: 4 }}>
                      ${(lead.estimated_value / 100).toFixed(0)}/mo
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>
        System Settings
      </h2>
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: `1px solid ${G.border}`,
          background: G.bg2,
        }}
      >
        <p style={{ fontSize: 13, color: G.t2 }}>
          Settings interface coming soon. Use Supabase SQL Editor for now.
        </p>
      </div>
    </div>
  );
}
