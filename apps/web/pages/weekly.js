import { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { supabase } from "shared/lib/supabase";
import { colors } from "shared/lib/design"; // Ensure this matches Home Page colors
import Navbar from "../components/Navbar";

export default function WeeklyPage({ latestIssue, archive }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase
      .from("subscribers")
      .insert([{ email, source: "weekly_digest" }]);

    if (error) setStatus("error");
    else {
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <div
      style={{ background: colors.bg, minHeight: "100vh", color: colors.t1 }}
    >
      <Head>
        <title>The Weekly Digest | Issue #{latestIssue?.issue_number}</title>
      </Head>
      <Navbar />

      {/* ── PREMIUM HERO ── */}
      <section
        style={{
          padding: "120px 24px 80px",
          background: `radial-gradient(circle at 0% 0%, ${colors.gold}10 0%, transparent 40%), ${colors.bg}`,
          borderBottom: `1px solid ${colors.bg3}`,
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "inline-flex",
            padding: "6px 16px",
            borderRadius: "99px",
            background: `${colors.gold}15`,
            border: `1px solid ${colors.gold}30`,
            color: colors.gold,
            fontSize: "12px",
            fontWeight: "800",
            letterSpacing: "0.1em",
            marginBottom: "24px",
          }}
        >
          ✦ ISSUE #{latestIssue?.issue_number} · {latestIssue?.publish_date}
        </motion.div>
        <h1
          style={{
            fontSize: "clamp(40px, 8vw, 64px)",
            fontWeight: 900,
            margin: "0 0 16px",
          }}
        >
          The Weekly <span style={{ color: colors.gold }}>Digest</span>
        </h1>
        <p
          style={{
            color: colors.t2,
            maxWidth: "600px",
            margin: "0 auto",
            fontSize: "18px",
          }}
        >
          The top 5 intelligence signals in tech, AI, and culture. Hand-picked
          and explainable.
        </p>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "60px",
        }}
      >
        {/* DIGEST ITEMS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {latestIssue?.items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              style={{
                background: colors.bg2,
                border: `1px solid ${colors.bg3}`,
                borderRadius: "24px",
                padding: "32px",
                display: "flex",
                gap: "24px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  background: colors.bg3,
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${colors.bg4}`,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "8px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      color: colors.gold,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.category}
                  </span>
                  <span
                    style={{
                      height: "4px",
                      width: "4px",
                      borderRadius: "50%",
                      background: colors.bg4,
                    }}
                  />
                  <span style={{ fontSize: "12px", color: colors.t3 }}>
                    {item.tag}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "22px",
                    marginBottom: "12px",
                    fontWeight: 700,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: colors.t2,
                    lineHeight: "1.6",
                    marginBottom: "20px",
                  }}
                >
                  {item.description}
                </p>
                <div
                  style={{
                    color: colors.gold,
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  ★ NOVA SCORE: {item.score}/10
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SIDEBAR */}
        <aside
          style={{ display: "flex", flexDirection: "column", gap: "32px" }}
        >
          {/* Subscribe Box */}
          <div
            style={{
              background: `linear-gradient(135deg, ${colors.bg2}, ${colors.bg})`,
              padding: "32px",
              borderRadius: "24px",
              border: `1px solid ${colors.gold}30`,
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>Join 10k+ Readers</h3>
            <p
              style={{
                fontSize: "14px",
                color: colors.t2,
                marginBottom: "24px",
              }}
            >
              Get the signal, skip the noise. Every Sunday morning.
            </p>
            <form
              onSubmit={handleSubscribe}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.bg3}`,
                  padding: "12px",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <button
                style={{
                  background: colors.gold,
                  color: "#000",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {status === "loading" ? "Joining..." : "Subscribe ✦"}
              </button>
            </form>
            {status === "success" && (
              <p
                style={{
                  color: colors.gold,
                  fontSize: "12px",
                  marginTop: "12px",
                }}
              >
                Success! Check your inbox.
              </p>
            )}
          </div>

          {/* Archive */}
          <div style={{ padding: "0 10px" }}>
            <h4
              style={{
                fontSize: "14px",
                color: colors.t3,
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Previous Issues
            </h4>
            {archive.map((issue) => (
              <div
                key={issue.id}
                style={{
                  padding: "12px 0",
                  borderBottom: `1px solid ${colors.bg3}`,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  #{issue.issue_number} {issue.title}
                </span>
                <span style={{ color: colors.t3 }}>{issue.publish_date}</span>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const { data: issues } = await supabase
    .from("weekly_issues")
    .select(`*, items:weekly_items(*)`)
    .order("issue_number", { ascending: false });

  return {
    props: {
      latestIssue: issues?.[0] || null,
      archive: issues?.slice(1, 6) || [],
    },
  };
}
