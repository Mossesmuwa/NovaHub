// components/Navbar.js
// Premium responsive navbar with smooth animations and mobile-first design
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { colors } from "shared/lib/design";

const ChartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // Handle scroll effect
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setScrolled(window.scrollY > 20);
    });
  }

  const navLinks = [
    { label: "Discover", href: "/discover" },
    { label: "Trending", href: "/trending" },
    { label: "Compare", href: "/compare" },
  ];

  const isActive = (href) => router.pathname === href;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? colors.bg2 + "f0" : colors.bg,
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: `1px solid ${scrolled ? colors.bg3 : "transparent"}`,
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            gap: 24,
          }}
        >
          {/* Logo */}
          <Link href="/">
            <a
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: colors.gold,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                letterSpacing: "-0.02em",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.textShadow = `0 0 12px ${colors.gold}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.textShadow = "none";
              }}
            >
              <span
                style={{ fontSize: 24, display: "flex", alignItems: "center" }}
              >
                <ChartIcon />
              </span>
              Platform
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div
            style={{
              display: "none",
              gap: 8,
              "@media (min-width: 768px)": {
                display: "flex",
              },
            }}
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  style={{
                    padding: "8px 14px",
                    color: isActive(link.href) ? colors.gold : colors.t2,
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 700,
                    borderRadius: 8,
                    transition: "all 0.3s ease",
                    background: isActive(link.href)
                      ? colors.gold + "15"
                      : "transparent",
                    borderBottom: isActive(link.href)
                      ? `2px solid ${colors.gold}`
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color = colors.gold;
                      e.currentTarget.style.background = colors.gold + "10";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color = colors.t2;
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Search bar - Desktop */}
          <div
            style={{
              display: "none",
              flex: 1,
              maxWidth: 300,
              "@media (min-width: 768px)": {
                display: "block",
              },
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Search tools..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  borderRadius: 8,
                  border: `1px solid ${searchFocused ? colors.gold : colors.bg3}`,
                  background: colors.bg3,
                  color: colors.t1,
                  fontSize: 13,
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxShadow: searchFocused
                    ? `0 0 12px ${colors.gold}20`
                    : "none",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  color: colors.t3,
                  fontSize: 14,
                }}
              >
                🔍
              </span>
            </div>
          </div>

          {/* Right side buttons - Desktop */}
          <div
            style={{
              display: "none",
              gap: 8,
              alignItems: "center",
              "@media (min-width: 768px)": {
                display: "flex",
              },
            }}
          >
            <Link href="/account/login">
              <a
                style={{
                  padding: "8px 16px",
                  color: colors.t2,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  borderRadius: 8,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.t2;
                }}
              >
                Sign in
              </a>
            </Link>
            <button
              style={{
                padding: "8px 16px",
                background: colors.gold,
                color: "#000",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
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
              Get Pro
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              "@media (min-width: 768px)": {
                display: "none",
              },
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 2,
                  background: colors.t1,
                  borderRadius: 1,
                  transition: "all 0.3s ease",
                  transform: mobileMenuOpen
                    ? i === 0
                      ? "rotate(45deg) translateY(11px)"
                      : i === 2
                        ? "rotate(-45deg) translateY(-11px)"
                        : "scaleX(0)"
                    : "none",
                  opacity: mobileMenuOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: "16px 0",
              borderTop: `1px solid ${colors.bg3}`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              animation: "slideDown 0.3s ease",
            }}
          >
            {/* Mobile search */}
            <div style={{ marginBottom: 8 }}>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${colors.bg3}`,
                  background: colors.bg3,
                  color: colors.t1,
                  fontSize: 13,
                }}
              />
            </div>

            {/* Mobile nav links */}
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  style={{
                    padding: "10px 12px",
                    color: isActive(link.href) ? colors.gold : colors.t2,
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 700,
                    borderRadius: 8,
                    background: isActive(link.href)
                      ? colors.gold + "15"
                      : "transparent",
                    display: "block",
                  }}
                >
                  {link.label}
                </a>
              </Link>
            ))}

            {/* Mobile buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginTop: 8,
              }}
            >
              <Link href="/account/login">
                <a
                  style={{
                    padding: "10px 12px",
                    color: colors.t2,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: "center",
                    borderRadius: 8,
                    border: `1px solid ${colors.bg3}`,
                  }}
                >
                  Sign in
                </a>
              </Link>
              <button
                style={{
                  padding: "10px 12px",
                  background: colors.gold,
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Get Pro
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 768px) {
          div[style*="display: none"] {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
