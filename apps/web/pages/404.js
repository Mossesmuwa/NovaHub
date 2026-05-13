// pages/404.js
// Premium 404 error page with animations and helpful navigation
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { colors } from "../lib/design";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  const [hovered, setHovered] = useState(null);

  const suggestions = [
    { emoji: "🔍", label: "Discover Tools", href: "/discover" },
    { emoji: "📈", label: "See Trending", href: "/trending" },
    { emoji: "⚔️", label: "Compare Tools", href: "/compare" },
    { emoji: "🏠", label: "Go Home", href: "/" },
  ];

  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <meta
          name="description"
          content="This page doesn't exist, but we have plenty of intelligence to discover."
        />
      </Head>

      <Navbar />

      <div
        style={{
          minHeight: "calc(100vh - 200px)",
          background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg2} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            background: `radial-gradient(circle, ${colors.gold}08, transparent)`,
            borderRadius: "50%",
            pointerEvents: "none",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 300,
            height: 300,
            background: `radial-gradient(circle, ${colors.gold}08, transparent)`,
            borderRadius: "50%",
            pointerEvents: "none",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />

        <div
          style={{
            textAlign: "center",
            maxWidth: 600,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Large 404 */}
          <div
            style={{
              fontSize: "clamp(80px, 25vw, 200px)",
              fontWeight: 900,
              margin: 0,
              marginBottom: 16,
              background: `linear-gradient(135deg, ${colors.gold}, ${colors.gold}80)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.05em",
              lineHeight: 1,
              animation: "slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            404
          </div>

          {/* Animated emoji */}
          <div
            style={{
              fontSize: 80,
              margin: "20px 0",
              animation: "bounce 1s ease-in-out infinite",
            }}
          >
            🔍
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(24px, 6vw, 40px)",
              fontWeight: 900,
              margin: 0,
              marginBottom: 12,
              color: colors.t1,
              letterSpacing: "-0.02em",
            }}
          >
            Page Not Found
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 16,
              color: colors.t2,
              margin: 0,
              marginBottom: 40,
              lineHeight: 1.6,
            }}
          >
            The intelligence you're looking for doesn't exist at this location.
            But don't worry, there's plenty to discover elsewhere.
          </p>

          {/* Suggestions */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
              marginBottom: 40,
            }}
          >
            {suggestions.map((item, idx) => (
              <Link key={item.href} href={item.href}>
                <a
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    padding: 20,
                    background: hovered === idx ? colors.bg3 : colors.bg2,
                    border: `1px solid ${hovered === idx ? colors.gold + "40" : colors.bg3}`,
                    borderRadius: 12,
                    textDecoration: "none",
                    color: colors.t1,
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform:
                      hovered === idx ? "translateY(-8px)" : "translateY(0)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      animation: hovered === idx ? "bounce 0.6s ease" : "none",
                    }}
                  >
                    {item.emoji}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: hovered === idx ? colors.gold : colors.t2,
                      transition: "color 0.2s ease",
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </Link>
            ))}
          </div>

          {/* Error details */}
          <div
            style={{
              padding: 16,
              background: colors.bg3,
              borderRadius: 12,
              border: `1px solid ${colors.bg4}`,
              fontSize: 12,
              color: colors.t3,
              fontFamily: "monospace",
              marginTop: 40,
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8, color: colors.t2 }}>
              Error Details:
            </div>
            <div>
              GET{" "}
              {typeof window !== "undefined" ? window.location.pathname : "/"}{" "}
              404
            </div>
            <div>No matching route found</div>
          </div>

          {/* Quick search */}
          <form
            style={{
              marginTop: 40,
              display: "flex",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <input
              type="text"
              placeholder="Search for something..."
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: `1px solid ${colors.bg3}`,
                background: colors.bg2,
                color: colors.t1,
                fontSize: 14,
                minWidth: 280,
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.gold;
                e.currentTarget.style.boxShadow = `0 0 12px ${colors.gold}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.bg3;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 24px",
                background: colors.gold,
                color: "#000",
                border: "none",
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 16px ${colors.gold}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <Footer />

      {/* CSS animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
        }
      `}</style>
    </>
  );
}
