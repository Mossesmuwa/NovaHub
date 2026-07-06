// components/AdminLayout.js - Shared admin layout
import Head from "next/head";
import Link from "next/link";

const GOLD = {
  primary: "#C9A84C",
  light: "#E8C97A",
  dark: "#9B7520",
  glow: "rgba(201,168,76,0.15)",
  bg: "#09090C",
  surface: "#111116",
  surface2: "#16161E",
  borderSoft: "rgba(255,255,255,0.06)",
  border: "rgba(201,168,76,0.12)",
  text: "#F2F2F7",
  muted: "#636366",
  muted2: "#3A3A3E",
  green: "#30D158",
  red: "#FF453A",
  orange: "#FF9F0A",
  blue: "#0A84FF",
};

export default function AdminLayout({ children, profile }) {
  return (
    <>
      <Head>
        <title>Admin - Nova</title>
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        
        html, body { 
          background: ${GOLD.bg}; 
          color: ${GOLD.text}; 
          font-family: 'Syne', system-ui, sans-serif; 
          overflow-x: hidden;
        }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${GOLD.muted2}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${GOLD.muted}; }

        input[type="text"], input[type="number"] {
          font-family: 'Syne', system-ui, sans-serif;
        }

        .btn-gold {
          background: linear-gradient(135deg, ${GOLD.light}, ${GOLD.primary});
          color: #09090C;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.02em;
        }
        .btn-gold:hover:not(:disabled) { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 24px ${GOLD.glow}; 
        }
        .btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          background: transparent;
          color: ${GOLD.muted};
          border: 1px solid ${GOLD.borderSoft};
          border-radius: 8px;
          padding: 7px 14px;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-ghost:hover:not(:disabled) { 
          border-color: ${GOLD.primary}; 
          color: ${GOLD.primary}; 
        }
        .btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

        .stat-card {
          background: ${GOLD.surface};
          border: 1px solid ${GOLD.borderSoft};
          border-radius: 14px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${GOLD.primary}, transparent);
        }

        .gold-text {
          background: linear-gradient(135deg, ${GOLD.light}, ${GOLD.primary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: GOLD.bg }}>
        {/* Top Bar */}
        <div
          style={{
            borderBottom: `1px solid ${GOLD.borderSoft}`,
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 70,
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: `${GOLD.bg}E0`,
            backdropFilter: "blur(12px)",
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${GOLD.light}, ${GOLD.dark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              â—†
            </div>
            <div>
              <div
                style={{ fontSize: 14, fontWeight: 900, color: GOLD.primary }}
              >
                NOVA
              </div>
              <div style={{ fontSize: 10, color: GOLD.muted }}>ADMIN</div>
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt=""
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `1px solid ${GOLD.border}`,
                  objectFit: "cover",
                }}
              />
            )}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: GOLD.text }}>
                {profile?.display_name || "Admin"}
              </div>
              <div style={{ fontSize: 10, color: GOLD.muted }}>Super Admin</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 32px" }}>
          {children}
        </div>
      </div>
    </>
  );
}

