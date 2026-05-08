// pages/pro/index.js
// NovaHub — Pro Upgrade Page

import { useState, useEffect } from "react";
import Head from "next/head";
import { supabase } from "../../lib/supabase";

const FEATURES = [
  { free: "10 saves", pro: "Unlimited saves", icon: "◆" },
  { free: "Basic feed", pro: "Personalised feed", icon: "◆" },
  { free: "—", pro: "Nova Score on every item", icon: "◆" },
  { free: "3 Vibe searches/day", pro: "Unlimited AI search", icon: "◆" },
  { free: "—", pro: "Create & share lists", icon: "◆" },
  { free: "Weekly digest", pro: "Curated personal digest", icon: "◆" },
  { free: "—", pro: "Early access to features", icon: "◆" },
  { free: "—", pro: "Pro badge on profile", icon: "◆" },
];

export default function ProPage() {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("profiles")
          .select("is_pro")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setIsPro(data?.is_pro || false));
      }
    });
  }, []);

  async function handleUpgrade() {
    if (!user) {
      window.location.href = "/auth/login?redirect=/pro";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Nova Pro — NovaHub</title>
        <meta
          name="description"
          content="Unlock unlimited discovery with Nova Pro."
        />
      </Head>

      <div className="pro-page">
        {/* Hero */}
        <section className="pro-hero">
          <div className="pro-badge-pill">Nova Pro</div>
          <h1 className="pro-headline">Discovery without limits</h1>
          <p className="pro-subheadline">
            Unlimited saves. Personalised intelligence. The full Nova
            experience.
          </p>
          <div className="pro-price">
            <span className="price-amount">$9.99</span>
            <span className="price-period">/month</span>
          </div>
        </section>

        {/* Features comparison */}
        <section className="pro-features">
          <div className="features-grid">
            <div className="features-col features-col--header">
              <div className="col-label">Free</div>
            </div>
            <div className="features-col features-col--header features-col--pro">
              <div className="col-label">Pro</div>
            </div>

            {FEATURES.map((f, i) => (
              <>
                <div key={`free-${i}`} className="feature-cell">
                  <span className={f.free === "—" ? "feature-none" : ""}>
                    {f.free}
                  </span>
                </div>
                <div
                  key={`pro-${i}`}
                  className="feature-cell feature-cell--pro"
                >
                  <span className="feature-check">{f.icon}</span>
                  {f.pro}
                </div>
              </>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pro-cta">
          {isPro ? (
            <div className="pro-current">
              <div className="pro-current-badge">You have Nova Pro</div>
              <button
                className="btn-manage"
                onClick={handleManage}
                disabled={loading}
              >
                {loading ? "Loading..." : "Manage subscription"}
              </button>
            </div>
          ) : (
            <button
              className="btn-upgrade"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? "Redirecting..." : "Get Nova Pro"}
            </button>
          )}
          <p className="pro-cta-note">Cancel anytime. No lock-in.</p>
        </section>
      </div>

      <style jsx>{`
        .pro-page {
          max-width: 680px;
          margin: 0 auto;
          padding: 80px 24px 120px;
        }
        .pro-hero {
          text-align: center;
          margin-bottom: 64px;
        }
        .pro-badge-pill {
          display: inline-block;
          background: var(--accent, #7c3aed);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 14px;
          border-radius: 999px;
          margin-bottom: 24px;
        }
        .pro-headline {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          line-height: 1.1;
          margin: 0 0 16px;
          color: var(--text-primary, #fff);
        }
        .pro-subheadline {
          font-size: 1.1rem;
          color: var(--text-secondary, #aaa);
          margin: 0 0 32px;
        }
        .pro-price {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 4px;
        }
        .price-amount {
          font-size: 3rem;
          font-weight: 800;
          color: var(--text-primary, #fff);
        }
        .price-period {
          font-size: 1rem;
          color: var(--text-secondary, #aaa);
        }
        .pro-features {
          margin-bottom: 56px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border, #222);
          border: 1px solid var(--border, #222);
          border-radius: 16px;
          overflow: hidden;
        }
        .features-col--header .col-label {
          padding: 16px 20px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary, #aaa);
          background: var(--surface, #111);
        }
        .features-col--pro .col-label {
          color: var(--accent, #7c3aed);
        }
        .feature-cell {
          padding: 14px 20px;
          font-size: 14px;
          color: var(--text-secondary, #888);
          background: var(--surface, #111);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .feature-cell--pro {
          color: var(--text-primary, #fff);
          background: var(--surface-elevated, #161616);
          font-weight: 500;
        }
        .feature-none {
          opacity: 0.3;
        }
        .feature-check {
          color: var(--accent, #7c3aed);
          font-size: 10px;
        }
        .pro-cta {
          text-align: center;
        }
        .btn-upgrade {
          display: inline-block;
          background: var(--accent, #7c3aed);
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          padding: 16px 48px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
          letter-spacing: 0.01em;
        }
        .btn-upgrade:hover {
          opacity: 0.9;
        }
        .btn-upgrade:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-manage {
          display: inline-block;
          background: transparent;
          color: var(--text-secondary, #aaa);
          font-size: 14px;
          padding: 10px 24px;
          border: 1px solid var(--border, #333);
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .btn-manage:hover {
          border-color: var(--text-primary, #fff);
          color: var(--text-primary, #fff);
        }
        .pro-current-badge {
          font-size: 14px;
          font-weight: 600;
          color: var(--accent, #7c3aed);
          margin-bottom: 16px;
        }
        .pro-cta-note {
          margin-top: 16px;
          font-size: 13px;
          color: var(--text-secondary, #666);
        }
      `}</style>
    </>
  );
}
