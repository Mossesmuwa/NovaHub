// pages/account/signup.js
// Premium signup page with email/password and OAuth
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { colors } from "shared/lib/design";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!fullName.trim()) return "Name is required";
    if (!email.includes("@")) return "Valid email is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!agreeToTerms) return "You must agree to terms";
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: Replace with actual Supabase signup
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      // Success - redirect to dashboard or email verification
      router.push("/account/verify-email");
    } catch (err) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider) => {
    setLoading(true);
    try {
      window.location.href = `/api/auth/oauth/${provider}`;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Account | Intelligence Platform</title>
        <meta name="description" content="Sign up for a free account" />
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
            maxWidth: 420,
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
            Join Now
          </h1>
          <p
            style={{
              fontSize: 14,
              color: colors.t3,
              margin: 0,
              marginBottom: 32,
            }}
          >
            Create your free account to save, compare, and discover
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
          <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
            {[
              { name: "Google", icon: "🔍" },
              { name: "GitHub", icon: "🐙" },
            ].map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleOAuthSignup(provider.name.toLowerCase())}
                disabled={loading}
                style={{
                  padding: 12,
                  background: colors.bg,
                  border: `1px solid ${colors.bg3}`,
                  borderRadius: 10,
                  color: colors.t1,
                  fontWeight: 700,
                  fontSize: 13,
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
                Sign up with {provider.name}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ flex: 1, height: "1px", background: colors.bg3 }} />
            <span style={{ fontSize: 12, color: colors.t3 }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: colors.bg3 }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} style={{ display: "grid", gap: 12 }}>
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
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
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
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.bg3;
                }}
              />
            </div>

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
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.bg3;
                }}
              />
              <div
                style={{
                  fontSize: 11,
                  color: colors.t3,
                  marginTop: 4,
                }}
              >
                At least 8 characters
              </div>
            </div>

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
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.bg3;
                }}
              />
            </div>

            {/* Terms checkbox */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                cursor: "pointer",
                fontSize: 12,
                color: colors.t3,
                marginTop: 8,
              }}
            >
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                style={{
                  cursor: "pointer",
                  marginTop: 2,
                }}
              />
              <span>
                I agree to the{" "}
                <Link href="/terms">
                  <a style={{ color: colors.gold, textDecoration: "none" }}>
                    Terms of Service
                  </a>
                </Link>{" "}
                and{" "}
                <Link href="/privacy">
                  <a style={{ color: colors.gold, textDecoration: "none" }}>
                    Privacy Policy
                  </a>
                </Link>
              </span>
            </label>

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
                marginTop: 12,
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
              {loading ? "⏳ Creating account..." : "🚀 Create Account"}
            </button>
          </form>

          {/* Sign in link */}
          <div
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 13,
              color: colors.t3,
            }}
          >
            Already have an account?{" "}
            <Link href="/account/login">
              <a
                style={{
                  color: colors.gold,
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Sign in
              </a>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
