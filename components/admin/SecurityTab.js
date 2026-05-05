// components/admin/SecurityTab.js
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const GOLD = {
  primary: "#C9A84C",
  surface: "#111116",
  borderSoft: "rgba(255,255,255,0.06)",
  text: "#F2F2F7",
  muted: "#636366",
  muted2: "#3A3A3E",
};

export default function SecurityTab() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    const { data } = await supabase
      .from("admin_audit_logs")
      .select("*, profiles(display_name)")
      .order("created_at", { ascending: false })
      .limit(100);

    setAuditLogs(data || []);
    setLoading(false);
  }

  const actionTypes = [
    "all",
    "APPROVE_ITEM",
    "REJECT_ITEM",
    "RUN_PROVIDER",
    "UPDATE_SETTING",
  ];
  const filteredLogs =
    filter === "all"
      ? auditLogs
      : auditLogs.filter((log) => log.action === filter);

  if (loading) {
    return <div style={{ color: GOLD.muted }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          🔒 Security & Audit
        </h1>
        <p style={{ fontSize: 14, color: GOLD.muted }}>
          Monitor admin actions and system security
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {actionTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border:
                filter === type
                  ? `1px solid ${GOLD.primary}`
                  : `1px solid ${GOLD.borderSoft}`,
              background:
                filter === type ? `rgba(201,168,76,0.15)` : "transparent",
              color: filter === type ? GOLD.primary : GOLD.muted,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              textTransform: "capitalize",
            }}
          >
            {type === "all" ? "All Actions" : type.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Logs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filteredLogs.length === 0 ? (
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
            No audit logs
          </div>
        ) : (
          <div
            style={{
              background: GOLD.surface,
              border: `1px solid ${GOLD.borderSoft}`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${GOLD.borderSoft}`,
                    background: `${GOLD.surface}CC`,
                  }}
                >
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: GOLD.muted,
                      fontWeight: 700,
                    }}
                  >
                    Time
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: GOLD.muted,
                      fontWeight: 700,
                    }}
                  >
                    Action
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: GOLD.muted,
                      fontWeight: 700,
                    }}
                  >
                    User
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: GOLD.muted,
                      fontWeight: 700,
                    }}
                  >
                    Resource
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: `1px solid ${GOLD.borderSoft}`,
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = `${GOLD.surface}66`)
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        color: GOLD.muted2,
                        fontFamily: "'JetBrains Mono'",
                      }}
                    >
                      {new Date(log.created_at).toLocaleString("en", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: GOLD.primary,
                        fontWeight: 700,
                      }}
                    >
                      {log.action}
                    </td>
                    <td style={{ padding: "12px 16px", color: GOLD.text }}>
                      {log.profiles?.display_name || "Unknown"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: GOLD.muted,
                        fontFamily: "'JetBrains Mono'",
                        fontSize: 11,
                      }}
                    >
                      {log.resource_type}/{log.resource_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div
        style={{
          marginTop: 32,
          padding: 16,
          borderRadius: 12,
          border: `1px solid ${GOLD.borderSoft}`,
          background: GOLD.surface,
          fontSize: 12,
          color: GOLD.muted,
        }}
      >
        <strong style={{ color: GOLD.text }}>Audit Log Summary:</strong>{" "}
        {auditLogs.length} total actions logged. All admin activities are
        automatically recorded for security and compliance.
      </div>
    </div>
  );
}
