// pages/account/login.js
// Premium login page with OAuth and email/password auth
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { colors } from "shared/lib/design";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginMethod, setLoginMethod] = useState("email"); // email or oauth

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // TODO: Replace with actual Supabase auth
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Success - redirect to dashboard
      router.push("/account/dashboard");
    } catch (err) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    try {
      // TODO: Implement OAuth login with Supabase
      window.location.href = `/api/auth/oauth/${provider}`;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | Intelligence Platform</title>
        <meta name="description" content="Sign in to your account" />
      </Head>

      <Navbar />

      <div
        style={{
          background: colors.bg,
          minHeight: "calc(100vh - 200px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            padding: 32,
            background: colors.bg2,
            borderRadius: 16,
            border: `1px solid ${colors.bg3}`,
          }}
        >
          {/* Header */}
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              margin: 0,
              marginBottom: 8,
              color: colors.t1,
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              fontSize: 14,
              color: colors.t3,
              margin: 0,
              marginBottom: 32,
            }}
          >
            Sign in to your account to save and compare
          </p>

          {/* Error message */}
          {error && (
            <div
              style={{
                padding: 12,
                background: colors.red + "15",
                border: `1px solid ${colors.red}40`,
                borderRadius: 8,
                color: colors.red,
                fontSize: 12,
                marginBottom: 20,
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
            {[
              { name: "Google", icon: "🔍" },
              { name: "GitHub", icon: "🐙" },
              { name: "Apple", icon: "🍎" },
            ].map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleOAuthLogin(provider.name.toLowerCase())}
                disabled={loading}
                style={{
                  padding: 12,
                  background: colors.bg,
                  border: `1px solid ${colors.bg3}`,
                  borderRadius: 10,
                  color: colors.t1,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = colors.gold;
                    e.currentTarget.style.color = colors.gold;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = colors.bg3;
                    e.currentTarget.style.color = colors.t1;
                  }
                }}
              >
                <span style={{ fontSize: 16 }}>{provider.icon}</span>
                Sign in with {provider.name}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ flex: 1, height: "1px", background: colors.bg3 }} />
            <span style={{ fontSize: 12, color: colors.t3 }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: colors.bg3 }} />
          </div>

          {/* Email/password form */}
          <form
            onSubmit={handleEmailLogin}
            style={{ display: "grid", gap: 12 }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.t2,
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${colors.bg3}`,
                  background: colors.bg,
                  color: colors.t1,
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.gold;
                  e.currentTarget.style.boxShadow = `0 0 8px ${colors.gold}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.bg3;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: colors.t2,
                  }}
                >
                  Password
                </label>
                <Link href="/account/forgot-password">
                  <a
                    style={{
                      fontSize: 11,
                      color: colors.gold,
                      textDecoration: "none",
                    }}
                  >
                    Forgot?
                  </a>
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${colors.bg3}`,
                  background: colors.bg,
                  color: colors.t1,
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.gold;
                  e.currentTarget.style.boxShadow = `0 0 8px ${colors.gold}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.bg3;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: 12,
                background: colors.gold,
                color: "#000",
                border: "none",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                marginTop: 8,
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 16px ${colors.gold}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {loading ? "⏳ Signing in..." : "🔓 Sign In"}
            </button>
          </form>

          {/* Sign up link */}
          <div
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 13,
              color: colors.t3,
            }}
          >
            Don't have an account?{" "}
            <Link href="/account/signup">
              <a
                style={{
                  color: colors.gold,
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Sign up
              </a>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
