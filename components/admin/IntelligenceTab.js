// components/admin/IntelligenceTab.js
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const GOLD = {
  primary: "#C9A84C",
  surface: "#111116",
  borderSoft: "rgba(255,255,255,0.06)",
  text: "#F2F2F7",
  muted: "#636366",
  green: "#30D158",
  red: "#FF453A",
  orange: "#FF9F0A",
};

export default function IntelligenceTab({ onRefresh }) {
  const [pendingItems, setPendingItems] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    setUser(authUser);

    const [pendingRes, anomaliesRes] = await Promise.all([
      supabase
        .from("pending_items")
        .select("*")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false })
        .limit(30),
      supabase
        .from("trend_anomalies")
        .select("*, items(name)")
        .eq("reviewed", false)
        .order("detected_at", { ascending: false })
        .limit(20),
    ]);

    setPendingItems(pendingRes.data || []);
    setAnomalies(anomaliesRes.data || []);
    setLoading(false);
  }

  async function approveItem(pendingId, itemData) {
    try {
      const { data: newItem } = await supabase
        .from("items")
        .insert([{ ...itemData, approved: true }])
        .select()
        .single();

      await supabase
        .from("pending_items")
        .update({
          status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", pendingId);

      await loadData();
      onRefresh?.();
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
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", pendingId);

      await loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  if (loading) {
    return <div style={{ color: GOLD.muted }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          🧠 Intelligence & Review
        </h1>
        <p style={{ fontSize: 14, color: GOLD.muted }}>
          Manage pending items and system anomalies
        </p>
      </div>

      {/* Anomalies Section */}
      {anomalies.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 800,
              marginBottom: 16,
              color: GOLD.text,
            }}
          >
            ⚠️ Detected Anomalies ({anomalies.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {anomalies.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${a.severity === "critical" ? GOLD.red + "60" : GOLD.orange + "60"}`,
                  background: GOLD.surface,
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
                    <div
                      style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}
                    >
                      {a.items?.name || "Unknown"}
                    </div>
                    <div style={{ fontSize: 11, color: GOLD.muted }}>
                      {a.anomaly_type} · {a.metric_name} ·{" "}
                      {a.change_percentage > 0 ? "+" : ""}
                      {a.change_percentage.toFixed(0)}%
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "6px 12px",
                      borderRadius: 6,
                      background:
                        a.severity === "critical"
                          ? GOLD.red + "20"
                          : GOLD.orange + "20",
                      color: a.severity === "critical" ? GOLD.red : GOLD.orange,
                      fontWeight: 800,
                    }}
                  >
                    {a.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Items Section */}
      <div>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 800,
            marginBottom: 16,
            color: GOLD.text,
          }}
        >
          📋 Items Awaiting Approval ({pendingItems.length})
        </h2>
        {pendingItems.length === 0 ? (
          <div
            style={{
              padding: 40,
              borderRadius: 12,
              border: `1px solid ${GOLD.borderSoft}`,
              background: GOLD.surface,
              textAlign: "center",
              color: GOLD.muted,
            }}
          >
            ✓ No items pending review
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            }}
          >
            {pendingItems.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${GOLD.borderSoft}`,
                  background: GOLD.surface,
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}
                  >
                    {item.item_data?.name || "Untitled"}
                  </div>
                  <div
                    style={{ fontSize: 11, color: GOLD.muted, marginBottom: 8 }}
                  >
                    Source: <strong>{item.source_name}</strong> · Category:{" "}
                    <strong>{item.suggested_category}</strong>
                  </div>
                  {item.item_data?.description && (
                    <div
                      style={{
                        fontSize: 11,
                        color: GOLD.muted,
                        lineHeight: 1.5,
                        marginBottom: 10,
                      }}
                    >
                      {item.item_data.description.substring(0, 150)}...
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <button
                    onClick={() => approveItem(item.id, item.item_data)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: GOLD.green,
                      color: "#000",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.opacity = "0.8")}
                    onMouseOut={(e) => (e.target.style.opacity = "1")}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => rejectItem(item.id)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "transparent",
                      color: GOLD.text,
                      border: `1px solid ${GOLD.borderSoft}`,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.borderColor = GOLD.red;
                      e.target.style.color = GOLD.red;
                    }}
                    onMouseOut={(e) => {
                      e.target.style.borderColor = GOLD.borderSoft;
                      e.target.style.color = GOLD.text;
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
