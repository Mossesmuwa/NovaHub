import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const G = {
  bg2: "#0F0F14",
  border: "rgba(255,255,255,0.06)",
  t1: "#F2F2F7",
  t3: "#636366",
  green: "#30D158",
  red: "#FF453A",
  gold: "#C9A84C",
  blue: "#0A84FF",
};

export default function NotificationsTab() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [providerStatus, setProviderStatus] = useState([]);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [dismissed, setDismissed] = useState({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [logsRes, statusRes, anomalyRes] = await Promise.all([
        supabase.from("admin_audit_logs").select("id, action, created_at").order("created_at", { ascending: false }).limit(40),
        supabase.from("provider_sync_status").select("provider_name,status,last_error_message,last_sync_at"),
        supabase.from("trend_anomalies").select("id", { count: "exact", head: true }).eq("reviewed", false),
      ]);
      setAuditLogs(logsRes.data || []);
      setProviderStatus(statusRes.data || []);
      setAnomalyCount(anomalyRes.count || 0);
    } catch (err) {
      console.error("[NotificationsTab] load failed:", err);
    }
  }

  const notifications = useMemo(() => {
    const items = [];

    const failedProviders = providerStatus.filter((p) => p.status === "error");
    failedProviders.forEach((p) => {
      items.push({
        id: `provider-${p.provider_name}`,
        title: `${p.provider_name} has errors`,
        detail: p.last_error_message || "Provider failed recently",
        tone: "error",
      });
    });

    if (anomalyCount > 0) {
      items.push({
        id: "anomaly-open",
        title: `${anomalyCount} anomaly alerts need review`,
        detail: "Open Intelligence tab and review trend anomalies.",
        tone: "warning",
      });
    }

    const recentSensitive = auditLogs.filter((l) =>
      ["REJECT_ITEM", "APPROVE_ITEM", "REJECT_ANOMALY", "APPROVE_ANOMALY"].includes(l.action),
    );
    if (recentSensitive.length > 0) {
      items.push({
        id: "audit-sensitive",
        title: `${recentSensitive.length} sensitive admin actions`,
        detail: "Security tab shows details and actor trace.",
        tone: "info",
      });
    }

    if (items.length === 0) {
      items.push({
        id: "all-good",
        title: "No critical notifications",
        detail: "System currently looks healthy.",
        tone: "success",
      });
    }

    return items.filter((n) => !dismissed[n.id]);
  }, [providerStatus, anomalyCount, auditLogs, dismissed]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Notifications Center</h2>
        <p style={{ fontSize: 14, color: G.t3 }}>
          Actionable alerts for provider errors, intelligence events, and security-sensitive activity.
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              background: G.bg2,
              border: `1px solid ${tone(n.tone).border}`,
              borderRadius: 12,
              padding: 14,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: tone(n.tone).dot,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: G.t1, marginBottom: 3 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: G.t3 }}>{n.detail}</div>
            </div>
            {n.id !== "all-good" && (
              <button
                onClick={() => setDismissed((prev) => ({ ...prev, [n.id]: true }))}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 8,
                  padding: "7px 10px",
                  border: `1px solid ${G.border}`,
                  background: "transparent",
                  color: G.t3,
                  cursor: "pointer",
                }}
              >
                Dismiss
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function tone(type) {
  if (type === "error") {
    return { border: "rgba(255,69,58,0.45)", dot: "#FF453A" };
  }
  if (type === "warning") {
    return { border: "rgba(201,168,76,0.45)", dot: "#C9A84C" };
  }
  if (type === "success") {
    return { border: "rgba(48,209,88,0.45)", dot: "#30D158" };
  }
  return { border: "rgba(10,132,255,0.45)", dot: "#0A84FF" };
}
