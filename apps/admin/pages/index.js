// ======================================================
// FILE: apps/admin/pages/index.js
// PURPOSE:
// Professional admin entry point.
// - Checks authentication state
// - Redirects safely to dashboard
// - Prevents UI flicker
// ======================================================

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabase } from "shared/lib/SupabaseContext";

export default function AdminRoot() {
  const router = useRouter();
  const { user, loading } = useSupabase();

  useEffect(() => {
    // Wait until auth state is resolved
    if (loading) return;

    // If not logged in → send to login
    if (!user) {
      router.replace("/account/login");
      return;
    }

    // If logged in → go to dashboard
    router.replace("/dashboard");
  }, [user, loading, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#09090C",
        color: "#F2F2F7",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "2px solid #C9A84C",
              borderTop: "2px solid transparent",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
        </div>

        <h1 style={{ fontSize: 18, marginBottom: 6 }}>Loading Admin Panel</h1>

        <p style={{ opacity: 0.7 }}>Verifying session...</p>

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
