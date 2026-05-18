// ======================================================
// FILE: apps/admin/pages/account/login.js
// PURPOSE:
// Native admin authentication page
// Verifies admin role + redirects to dashboard
// ======================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import * as Auth from "shared/lib/auth";
import { checkAuth } from "shared/lib/checkAuth";
import Head from "next/head";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // --------------------------------------------------
  // AUTO REDIRECT IF ADMIN IS ALREADY LOGGED IN
  // --------------------------------------------------
  useEffect(() => {
    checkAuth().then(({ authenticated, profile }) => {
      if (authenticated && profile?.is_admin) {
        router.replace("/dashboard");
      }
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090C",
          color: "#F2F2F7",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // ADMIN LOGIN HANDLER
  // --------------------------------------------------
  async function handleLogin(e) {
    e.preventDefault();

    setErr("");
    setOk("");

    if (!email) return setErr("Please enter your email.");
    if (!password) return setErr("Please enter your password.");

    setLoading(true);

    const result = await Auth.login(email, password);

    if (!result.success) {
      setLoading(false);
      setErr(
        result.error === "Invalid login credentials"
          ? "Incorrect email or password."
          : result.error,
      );
      return;
    }

    // Verify admin role
    const { authenticated, profile } = await checkAuth();

    if (!authenticated || !profile?.is_admin) {
      setLoading(false);
      setErr(
        "Access denied. You do not have admin privileges. Please contact the administrator.",
      );
      // Sign out if not admin
      await Auth.logout();
      return;
    }

    setOk("Admin access verified. Redirecting to dashboard...");

    setTimeout(() => {
      router.replace("/dashboard");
    }, 800);
  }

  return (
    <>
      <Head>
        <title>Admin Login — NovaHub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090C",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "#0F0F14",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "40px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: "24px",
              fontWeight: "600",
              color: "#F2F2F7",
            }}
          >
            Admin Access
          </h1>
          <p
            style={{
              margin: "0 0 32px 0",
              fontSize: "14px",
              color: "#AEAEB2",
            }}
          >
            Sign in with your admin credentials
          </p>

          {err && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "rgba(255, 69, 58, 0.1)",
                border: "1px solid rgba(255, 69, 58, 0.3)",
                borderRadius: "8px",
                color: "#FF453A",
                fontSize: "13px",
              }}
            >
              {err}
            </div>
          )}

          {ok && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "rgba(48, 209, 88, 0.1)",
                border: "1px solid rgba(48, 209, 88, 0.3)",
                borderRadius: "8px",
                color: "#30D158",
                fontSize: "13px",
              }}
            >
              {ok}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#AEAEB2",
                  marginBottom: "6px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#16161E",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  color: "#F2F2F7",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#AEAEB2",
                  marginBottom: "6px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#16161E",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  color: "#F2F2F7",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: loading ? "#C9A84C66" : "#C9A84C",
                border: "none",
                borderRadius: "8px",
                color: "#09090C",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = "#E8C97A";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = "#C9A84C";
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p
            style={{
              margin: "16px 0 0 0",
              fontSize: "12px",
              color: "#636366",
              textAlign: "center",
            }}
          >
            Admin credentials required. Access logged.
          </p>
        </div>
      </div>
    </>
  );
}
