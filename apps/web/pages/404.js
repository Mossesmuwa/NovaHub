// pages/404.js
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { colors } from "shared/lib/design";

export default function UltimateAdaptive404() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. Device Detection
    const checkDevice = () => setIsMobile(window.innerWidth < 768);
    checkDevice();
    window.addEventListener("resize", checkDevice);

    // 2. Interaction Tracking
    const handleMove = (e) => {
      const { clientX, clientY } = e.touches ? e.touches[0] : e;
      if (!containerRef.current) return;

      const { left, top, width, height } =
        containerRef.current.getBoundingClientRect();
      // Normalized coordinates (-0.5 to 0.5)
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      setCoords({ x, y });
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, []);

  // Calculate dynamic styles based on movement
  const rotationStyle = {
    transform: isMobile
      ? `perspective(1000px) rotateX(${coords.y * 5}deg) rotateY(${coords.x * 5}deg)`
      : `perspective(1000px) rotateX(${coords.y * -15}deg) rotateY(${coords.x * 15}deg)`,
    transition: isMobile ? "none" : "transform 0.1s ease-out",
  };

  return (
    <div className="super-root">
      <Head>
        <title>404 // Protocol Interrupted</title>
      </Head>

      {/* DYNAMIC ATMOSPHERE */}
      <div
        className="ambient-glow"
        style={{
          background: `radial-gradient(circle at ${coords.x * 100 + 50}% ${coords.y * 100 + 50}%, ${colors.gold}15, transparent 50%)`,
        }}
      />

      <div className="scanline-overlay" />

      <main
        ref={containerRef}
        className="intelligence-shell"
        style={rotationStyle}
      >
        {/* HEADER: System Metadata */}
        <div className="meta-row">
          <div className="node-id">NODE_LOST_0x404</div>
          <div className="security-tag">LEVEL_7_ACCESS</div>
        </div>

        {/* HERO: The Glitch Nucleus */}
        <div className="nucleus">
          <h1 className="glitch-num" data-text="404">
            404
          </h1>
          <div className="orbit-ring" />
        </div>

        {/* CONTENT: Intelligent Recovery */}
        <div className="recovery-zone">
          <h2 className="title">Neural Path Severed</h2>
          <p className="desc">
            The data packet you requested has been purged or moved to a
            restricted sector. Initiate recovery protocol.
          </p>

          <div className="cta-stack">
            <Link href="/" className="btn-main">
              <span className="btn-label">RE-INITIALIZE CORE</span>
              <span className="btn-sub">RETURN TO HOME</span>
            </Link>

            <div className="btn-group">
              <Link href="/discover" className="btn-ghost">
                DISCOVER
              </Link>
              <Link href="/trending" className="btn-ghost">
                TRENDING
              </Link>
            </div>
          </div>
        </div>

        {/* FOOTER: Live Telemetry */}
        <div className="telemetry">
          <div className="stat">
            <span>LOC:</span>{" "}
            {typeof window !== "undefined"
              ? window.location.pathname.substring(0, 15)
              : "root"}
          </div>
          <div className="stat">
            <span>SIGNAL:</span> ENCRYPTED
          </div>
          <div className="stat hide-m">
            <span>PING:</span> 12ms
          </div>
        </div>
      </main>

      <style jsx>{`
        .super-root {
          min-height: 100vh;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
          position: relative;
        }

        .ambient-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .scanline-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(0, 0, 0, 0.5) 51%
          );
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 2;
          opacity: 0.1;
        }

        .intelligence-shell {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 650px;
          background: rgba(10, 10, 10, 0.9);
          border: 1px solid rgba(201, 168, 76, 0.2);
          border-radius: 32px;
          padding: 40px;
          backdrop-filter: blur(25px);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
          text-align: center;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          font-family: monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: ${colors.gold};
          opacity: 0.5;
          margin-bottom: 40px;
        }

        .nucleus {
          position: relative;
          display: inline-block;
          margin-bottom: 30px;
        }

        .glitch-num {
          font-size: clamp(80px, 18vw, 160px);
          font-weight: 900;
          margin: 0;
          color: white;
          position: relative;
        }

        .glitch-num::before,
        .glitch-num::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-num::before {
          color: #0ff;
          left: -2px;
          z-index: -1;
          animation: glitch 0.4s infinite;
          opacity: 0.5;
        }
        .glitch-num::after {
          color: #f0f;
          left: 2px;
          z-index: -2;
          animation: glitch 0.4s infinite reverse;
          opacity: 0.5;
        }

        .title {
          font-size: clamp(24px, 5vw, 36px);
          font-weight: 800;
          color: white;
          margin-bottom: 12px;
        }

        .desc {
          color: #888;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 40px;
          max-width: 440px;
          margin-inline: auto;
        }

        .cta-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-main {
          background: ${colors.gold};
          padding: 16px;
          border-radius: 16px;
          text-decoration: none;
          color: black;
          transition: 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .btn-label {
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 1px;
        }
        .btn-sub {
          font-size: 10px;
          font-weight: 700;
          opacity: 0.6;
        }

        .btn-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .btn-ghost {
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 14px;
          border-radius: 16px;
          color: white;
          text-decoration: none;
          font-weight: 700;
          font-size: 12px;
          transition: 0.3s;
        }

        .btn-ghost:hover {
          border-color: ${colors.gold};
          background: rgba(201, 168, 76, 0.05);
        }

        .telemetry {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
          font-family: monospace;
          font-size: 9px;
          color: #444;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 20px;
        }

        .telemetry span {
          color: ${colors.gold};
        }

        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          25% {
            transform: translate(-2px, 1px);
          }
          50% {
            transform: translate(2px, -1px);
          }
          75% {
            transform: translate(-1px, -1px);
          }
          100% {
            transform: translate(0);
          }
        }

        @media (max-width: 768px) {
          .intelligence-shell {
            padding: 30px 20px;
            margin: 10px;
            border-radius: 24px;
          }
          .hide-m {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
