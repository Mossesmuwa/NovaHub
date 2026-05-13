// ======================================================
// FILE: apps/web/pages/account/login.js
// PURPOSE:
// Central authentication page for NovaHub (WEB APP).
//
// RESPONSIBILITIES:
// - Email/password login
// - OAuth login (Google/GitHub/Apple)
// - Supabase session creation
// - Secure redirect after login
//
// NOTE:
// This is the ONLY real authentication layer.
// Admin app does NOT authenticate users.
// ======================================================

import { useState, useEffect } from "react";
import SEO from "../../components/SEO";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Auth from "shared/lib/auth";
import { getCurrentUser } from "shared/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // AUTO REDIRECT IF USER IS ALREADY LOGGED IN
  // --------------------------------------------------
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) router.replace("/account/dashboard");
    });
  }, []);

  // --------------------------------------------------
  // SAFE RETURN URL HANDLING
  // Prevent open redirect vulnerabilities
  // --------------------------------------------------
  function getSafeReturnUrl() {
    const returnTo = router.query.return;

    const allowedOrigins = [
      process.env.NEXT_PUBLIC_WEB_APP_URL,
      process.env.NEXT_PUBLIC_ADMIN_URL,
    ];

    try {
      if (!returnTo) return "/account/dashboard";

      const url = new URL(returnTo);

      if (allowedOrigins.includes(url.origin)) {
        return returnTo;
      }
    } catch {}

    return "/account/dashboard";
  }

  // --------------------------------------------------
  // EMAIL/PASSWORD LOGIN
  // --------------------------------------------------
  async function doLogin(e) {
    e.preventDefault();

    setErr("");
    setOk("");

    if (!email) return setErr("Please enter your email.");
    if (!password) return setErr("Please enter your password.");

    setLoading(true);

    const result = await Auth.login(email, password);

    setLoading(false);

    if (!result.success) {
      setErr(
        result.error === "Invalid login credentials"
          ? "Incorrect email or password."
          : result.error,
      );
      return;
    }

    setOk("Signed in successfully. Redirecting...");

    const safeReturn = getSafeReturnUrl();

    setTimeout(() => {
      router.replace(safeReturn);
    }, 800);
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <>
      <SEO title="Sign In — NovaHub" />

      <div className="page-wrap">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your NovaHub account</p>

          {/* OAUTH LOGIN */}
          <button onClick={() => Auth.loginWithGoogle()}>
            Continue with Google
          </button>

          <button onClick={() => Auth.loginWithGithub()}>
            Continue with GitHub
          </button>

          <button onClick={() => Auth.loginWithApple()}>
            Continue with Apple
          </button>

          <div className="divider-row">
            <span>or sign in with email</span>
          </div>

          {/* ERROR / SUCCESS */}
          {err && <div className="form-err">{err}</div>}
          {ok && <div className="form-ok">{ok}</div>}

          {/* FORM */}
          <form onSubmit={doLogin}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            New to NovaHub?{" "}
            <Link href="/account/register">Create free account</Link>
          </div>
        </div>
      </div>
    </>
  );
}
