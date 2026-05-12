// components/Footer.js
import Link from "next/link";
import { colors } from "../lib/design";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Intelligence: [
      { label: "Market Pulse", href: "/discover" },
      { label: "Neural Compare", href: "/compare" },
      { label: "Signals", href: "/trending" },
      { label: "Nova Pro", href: "/pro" },
    ],
    Network: [
      { label: "About Node", href: "/about" },
      { label: "Changelog", href: "/changelog" },
      { label: "Status", href: "/status" },
      { label: "Security", href: "/security" },
    ],
    Legal: [
      { label: "Privacy Protocol", href: "/privacy" },
      { label: "Terms of Sync", href: "/terms" },
    ],
  };

  const socials = [
    { name: "X", icon: "𝕏", href: "#" },
    { name: "GitHub", icon: "🐙", href: "#" },
    { name: "Discord", icon: "💬", href: "#" },
  ];

  return (
    <footer className="footer-root">
      <div className="footer-container">
        {/* 1. TOP SECTION: BRAND & NEWSLETTER */}
        <div className="top-section">
          <div className="brand-stack">
            <div className="logo">
              <span className="logo-icon">📊</span>
              <span className="logo-text">
                NOVA<span className="gold">HUB</span>
              </span>
            </div>
            <p className="brand-desc">
              Next-gen decision intelligence. Processing market signals into
              actionable growth paths.
            </p>
            <div className="social-row">
              {socials.map((s) => (
                <a key={s.name} href={s.href} className="social-pill">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="newsletter-box">
            <h4>JOIN THE INTELLIGENCE FEED</h4>
            <div className="input-group">
              <input type="email" placeholder="agent@agency.ai" />
              <button>SUBSCRIBE</button>
            </div>
            <p className="input-hint">Weekly signals. No noise. Pure data.</p>
          </div>
        </div>

        {/* 2. MIDDLE SECTION: THE GRID */}
        <div className="links-grid">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="link-group">
              <h5>{category}</h5>
              {links.map((link) => (
                <Link key={link.label} href={link.href}>
                  <a className="footer-link">{link.label}</a>
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* 3. BOTTOM SECTION: TELEMETRY */}
        <div className="bottom-bar">
          <div className="copyright">
            © {currentYear} NOVAHUB CORE. ALL SYSTEMS OPERATIONAL.
          </div>
          <div className="status-container">
            <div className="status-dot" />
            <span>ENCRYPTED CONNECTION</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-root {
          background: ${colors.bg};
          border-top: 1px solid ${colors.bg3};
          padding: 80px 24px 40px;
          position: relative;
          overflow: hidden;
        }

        /* Ambient Glow */
        .footer-root::before {
          content: "";
          position: absolute;
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 300px;
          background: radial-gradient(
            circle,
            ${colors.gold}08,
            transparent 70%
          );
          pointer-events: none;
        }

        .footer-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .top-section {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 60px;
          margin-bottom: 80px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 900;
          color: white;
          letter-spacing: -1px;
          margin-bottom: 16px;
        }

        .gold {
          color: ${colors.gold};
        }

        .brand-desc {
          color: ${colors.t2};
          font-size: 14px;
          max-width: 320px;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .social-row {
          display: flex;
          gap: 12px;
        }
        .social-pill {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: ${colors.bg2};
          border: 1px solid ${colors.bg3};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .social-pill:hover {
          border-color: ${colors.gold};
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
        }

        /* Newsletter Styling */
        .newsletter-box h4 {
          font-size: 11px;
          letter-spacing: 2px;
          color: ${colors.gold};
          margin-bottom: 16px;
        }

        .input-group {
          display: flex;
          background: ${colors.bg2};
          border: 1px solid ${colors.bg3};
          padding: 6px;
          border-radius: 14px;
          transition: 0.3s;
        }

        .input-group:focus-within {
          border-color: ${colors.gold}80;
          box-shadow: 0 0 20px ${colors.gold}10;
        }

        .input-group input {
          background: transparent;
          border: none;
          padding: 10px 16px;
          color: white;
          flex: 1;
          outline: none;
          font-size: 14px;
        }

        .input-group button {
          background: ${colors.gold};
          color: black;
          border: none;
          padding: 0 20px;
          border-radius: 10px;
          font-weight: 900;
          font-size: 12px;
          cursor: pointer;
        }

        .input-hint {
          font-size: 11px;
          color: ${colors.t3};
          margin-top: 10px;
        }

        /* Links Grid */
        .links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 40px;
          border-top: 1px solid ${colors.bg3};
          padding-top: 60px;
          margin-bottom: 60px;
        }

        .link-group h5 {
          color: white;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .footer-link {
          display: block;
          color: ${colors.t3};
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 12px;
          transition: 0.2s;
        }

        .footer-link:hover {
          color: ${colors.gold};
          transform: translateX(5px);
        }

        /* Bottom Telemetry */
        .bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: monospace;
          font-size: 10px;
          color: #444;
          letter-spacing: 1px;
        }

        .status-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: ${colors.green || "#4ade80"};
          border-radius: 50%;
          box-shadow: 0 0 10px ${colors.green || "#4ade80"};
          animation: blink 2s infinite;
        }

        @keyframes blink {
          50% {
            opacity: 0.3;
          }
        }

        @media (max-width: 768px) {
          .top-section {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }
          .brand-desc {
            margin-inline: auto;
          }
          .social-row {
            justify-content: center;
          }
          .bottom-bar {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
