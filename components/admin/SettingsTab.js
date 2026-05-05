// components/admin/SettingsTab.js
import { useState, useEffect } from "react";

const GOLD = {
  primary: "#C9A84C",
  light: "#E8C97A",
  surface: "#111116",
  surface2: "#16161E",
  borderSoft: "rgba(255,255,255,0.06)",
  border: "rgba(201,168,76,0.12)",
  text: "#F2F2F7",
  muted: "#636366",
  green: "#30D158",
  red: "#FF453A",
  orange: "#FF9F0A",
};

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    enableAutoSync: true,
    emailOnError: true,
    maintenanceMode: false,
    rateLimitPerMinute: 60,
    maxItemsPerRun: 500,
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
    setSaved(false);
  };

  const handleChange = (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  };

  const saveSettings = async () => {
    // In production, this would save to database
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          ⚡ System Settings
        </h1>
        <p style={{ fontSize: 14, color: GOLD.muted }}>
          Configure platform behavior and limits
        </p>
      </div>

      {/* Feature Toggles */}
      <div
        style={{
          background: GOLD.surface,
          border: `1px solid ${GOLD.borderSoft}`,
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 20,
            color: GOLD.text,
          }}
        >
          Feature Toggles
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              key: "enableAutoSync",
              label: "Enable Auto-Sync",
              desc: "Automatically run providers on schedule",
            },
            {
              key: "emailOnError",
              label: "Email on Error",
              desc: "Send notifications when providers fail",
            },
            {
              key: "maintenanceMode",
              label: "Maintenance Mode",
              desc: "Disable platform for maintenance",
            },
          ].map((toggle) => (
            <div
              key={toggle.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 16,
                borderBottom: `1px solid ${GOLD.borderSoft}`,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: GOLD.text,
                    marginBottom: 4,
                  }}
                >
                  {toggle.label}
                </div>
                <div style={{ fontSize: 11, color: GOLD.muted }}>
                  {toggle.desc}
                </div>
              </div>
              <button
                onClick={() => handleToggle(toggle.key)}
                style={{
                  width: 50,
                  height: 28,
                  borderRadius: 14,
                  border: "none",
                  background: settings[toggle.key] ? GOLD.green : GOLD.muted,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "3px 4px",
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: GOLD.surface,
                    marginLeft: settings[toggle.key] ? "auto" : 0,
                    transition: "margin 0.3s",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Limiting */}
      <div
        style={{
          background: GOLD.surface,
          border: `1px solid ${GOLD.borderSoft}`,
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 20,
            color: GOLD.text,
          }}
        >
          Rate Limiting
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: GOLD.muted,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Requests per minute
            </label>
            <input
              type="number"
              value={settings.rateLimitPerMinute}
              onChange={(e) =>
                handleChange("rateLimitPerMinute", parseInt(e.target.value))
              }
              style={{
                width: "100%",
                maxWidth: 200,
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${GOLD.borderSoft}`,
                background: GOLD.surface2,
                color: GOLD.text,
                fontSize: 13,
                fontFamily: "'Syne', sans-serif",
              }}
            />
            <div style={{ fontSize: 10, color: GOLD.muted, marginTop: 4 }}>
              Default: 60 requests/minute
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: GOLD.muted,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Max items per provider run
            </label>
            <input
              type="number"
              value={settings.maxItemsPerRun}
              onChange={(e) =>
                handleChange("maxItemsPerRun", parseInt(e.target.value))
              }
              style={{
                width: "100%",
                maxWidth: 200,
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${GOLD.borderSoft}`,
                background: GOLD.surface2,
                color: GOLD.text,
                fontSize: 13,
                fontFamily: "'Syne', sans-serif",
              }}
            />
            <div style={{ fontSize: 10, color: GOLD.muted, marginTop: 4 }}>
              Default: 500 items/run
            </div>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div
        style={{
          background: GOLD.surface,
          border: `1px solid ${GOLD.borderSoft}`,
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 16,
            color: GOLD.text,
          }}
        >
          API Key Status
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {[
            { name: "TMDB_API_KEY", status: "set" },
            { name: "SPOTIFY_CLIENT_ID", status: "not-set" },
            { name: "YOUTUBE_API_KEY", status: "not-set" },
            { name: "OMDB_API_KEY", status: "not-set" },
            { name: "RAWG_API_KEY", status: "set" },
            { name: "NYT_API_KEY", status: "not-set" },
          ].map((key) => (
            <div
              key={key.name}
              style={{
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${GOLD.borderSoft}`,
                background: GOLD.surface2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono'",
                  color: GOLD.muted,
                }}
              >
                {key.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  padding: "4px 8px",
                  borderRadius: 4,
                  background:
                    key.status === "set" ? `${GOLD.green}20` : `${GOLD.red}20`,
                  color: key.status === "set" ? GOLD.green : GOLD.red,
                  fontWeight: 700,
                }}
              >
                {key.status === "set" ? "✓ SET" : "✗ NOT SET"}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: GOLD.muted }}>
          💡 Tip: Set API keys via environment variables. Contact support for
          key generation.
        </div>
      </div>

      {/* Backup & Maintenance */}
      <div
        style={{
          background: GOLD.surface,
          border: `1px solid ${GOLD.borderSoft}`,
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 16,
            color: GOLD.text,
          }}
        >
          Backup & Maintenance
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <button
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: `linear-gradient(135deg, ${GOLD.light}, ${GOLD.primary})`,
              color: "#09090C",
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            📦 Backup Database
          </button>
          <button
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${GOLD.borderSoft}`,
              background: "transparent",
              color: GOLD.text,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            🔄 Sync Schedule
          </button>
          <button
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${GOLD.borderSoft}`,
              background: "transparent",
              color: GOLD.text,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            🧹 Clean Cache
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        style={{
          padding: "12px 32px",
          borderRadius: 10,
          background: `linear-gradient(135deg, ${GOLD.light}, ${GOLD.primary})`,
          color: "#09090C",
          border: "none",
          fontSize: 13,
          fontWeight: 800,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        {saved ? "✓ Saved" : "💾 Save Settings"}
      </button>

      {/* Footer Info */}
      <div
        style={{
          marginTop: 40,
          padding: 16,
          borderRadius: 12,
          border: `1px solid ${GOLD.borderSoft}`,
          background: GOLD.surface,
          fontSize: 11,
          color: GOLD.muted,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: GOLD.text, display: "block", marginBottom: 8 }}>
          ℹ️ Information
        </strong>
        These settings control how the platform behaves. Changes take effect
        immediately. Contact the development team if you need to adjust
        server-side configuration.
      </div>
    </div>
  );
}
