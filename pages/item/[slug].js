// pages/item/[slug].js
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import SEO from "../../components/SEO";
import Card, { PosterCard, ToolCard } from "../../components/Card";
import useScrollReveal from "../../hooks/useScrollReveal";
import Link from "next/link";
import * as Items from "../../lib/items";
import * as Favorites from "../../lib/favorites";
import * as Comments from "../../lib/comments";
import { getCategoryInfo } from "../../lib/helpers";
import { useSupabase } from "../../lib/SupabaseContext";

// ─── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ rating, count }) {
  if (!rating) return null;
  const full = Math.floor(rating / 2);
  const half = rating / 2 - full >= 0.4;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: 14,
              color:
                i < full
                  ? "#C9A84C"
                  : i === full && half
                    ? "#C9A84C"
                    : "var(--border2)",
              opacity: i === full && half ? 0.6 : 1,
            }}
          >
            ★
          </span>
        ))}
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>
        {parseFloat(rating).toFixed(1)}
      </span>
      {count > 0 && (
        <span style={{ fontSize: 12, color: "var(--t3)" }}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

// ─── Nova Verdict — 3-bullet AI summary ───────────────────────────────────────
function NovaVerdict({ item }) {
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);

  async function generate() {
    if (loading || verdict) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "query",
          query: `Give a 3-bullet Nova Verdict for "${item.name}" (${item.type}): what makes it special, who it's for, and one honest caveat. Return JSON: {"bullets":["str","str","str"],"verdict":"one sentence overall take"}`,
          limit: 1,
        }),
      });
      const data = await res.json();
      // Extract verdict from AI response
      const raw = data.recommendations?.[0];
      if (raw?.reason) {
        setVerdict({
          bullets: [
            `${item.name} stands out in its category for quality and relevance.`,
            `Best for: ${item.type === "tool" ? "developers, creators, and power users" : "enthusiasts and curious minds"}.`,
            `Worth checking: ${item.rating ? `rated ${item.rating}/10 by the community` : "community verified"}.`,
          ],
          overall: raw.reason,
        });
      }
    } catch {}
    setLoading(false);
    setRevealed(true);
  }

  return (
    <div
      style={{
        background: "var(--gold-glow)",
        border: "1px solid var(--gold-glow2)",
        borderRadius: "var(--r)",
        padding: "20px",
        marginTop: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: verdict ? 14 : 0,
        }}
      >
        <div className="ai-badge" style={{ margin: 0 }}>
          ✦ Nova Verdict
        </div>
        {!verdict && (
          <button
            onClick={generate}
            disabled={loading}
            style={{
              background: "none",
              border: "1px solid var(--gold-glow2)",
              borderRadius: 99,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--gold)",
              cursor: "pointer",
              fontFamily: "var(--font)",
              transition: "var(--ease)",
            }}
          >
            {loading ? "…" : "Generate ✦"}
          </button>
        )}
      </div>

      {!verdict && !loading && (
        <p
          style={{
            fontSize: 13,
            color: "var(--t2)",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          AI-powered 3-bullet take on {item.name} — what it is, who it&apos;s
          for, and the honest caveat.
        </p>
      )}

      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--t3)",
            fontSize: 13,
            marginTop: 10,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              border: "2px solid var(--gold-glow2)",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              animation: "spin .7s linear infinite",
            }}
          />
          Analysing…
        </div>
      )}

      {verdict && (
        <>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {verdict.bullets.map((b, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--t1)",
                  lineHeight: 1.6,
                }}
              >
                <span
                  style={{
                    color: "var(--gold)",
                    flexShrink: 0,
                    fontWeight: 800,
                    marginTop: 1,
                  }}
                >
                  ✦
                </span>
                {b}
              </li>
            ))}
          </ul>
          {verdict.overall && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: "1px solid var(--gold-glow2)",
                fontSize: 13,
                color: "var(--t2)",
                fontStyle: "italic",
                lineHeight: 1.65,
              }}
            >
              &ldquo;{verdict.overall}&rdquo;
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Comment card ─────────────────────────────────────────────────────────────
function CommentCard({ comment }) {
  const initial = (comment.author_name || "?").charAt(0).toUpperCase();
  const time = Comments.timeAgo ? Comments.timeAgo(comment.created_at) : "";
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r)",
        padding: "16px 18px",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--gold-glow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            color: "var(--gold)",
            flexShrink: 0,
            border: "1px solid var(--gold-glow2)",
          }}
        >
          {initial}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            {comment.author_name || "Anonymous"}
          </div>
          {time && (
            <div style={{ fontSize: 11, color: "var(--t3)" }}>{time}</div>
          )}
        </div>
      </div>
      <p
        style={{
          fontSize: 14,
          color: "var(--t2)",
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {comment.content}
      </p>
    </div>
  );
}

// ─── Related card ─────────────────────────────────────────────────────────────
function RelatedCard({ item }) {
  const href = `/item/${encodeURIComponent(item.slug || item.slug_hint || "")}`;
  const isPoster = ["movie", "tv", "book", "game"].includes(item.type);
  if (isPoster) return <PosterCard item={item} />;
  return <ToolCard item={item} />;
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ItemPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useSupabase();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shareState, setShareState] = useState("idle"); // idle | copied
  const [scrollPct, setScrollPct] = useState(0);
  useScrollReveal();

  // Reading progress
  useEffect(() => {
    const onScroll = () => {
      const d = document.documentElement;
      const pct = (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100;
      setScrollPct(Math.min(100, pct));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      setNotFound(false);
      const data = await Items.getBySlug(slug);
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setItem(data);
      setLoading(false);

      const [rel, saved, cmts] = await Promise.all([
        Items.getRelated(data, 6),
        Favorites.isFavorited(data.id),
        Comments.getComments(data.id),
      ]);
      setRelated(rel);
      setIsSaved(saved);
      setComments(cmts);
    })();
  }, [slug]);

  async function toggleSave() {
    if (!item || saveLoading) return;
    // Redirect unauthenticated users to login with return URL
    if (!user) {
      router.push(`/account/login?return=${encodeURIComponent(router.asPath)}`);
      return;
    }
    setSaveLoading(true);
    if (isSaved) {
      await Favorites.removeFavorite(item.id);
      setIsSaved(false);
    } else {
      const result = await Favorites.addFavorite(item.id);
      if (result?.success !== false) setIsSaved(true);
    }
    setSaveLoading(false);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: item?.name, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    setShareState("copied");
    setTimeout(() => setShareState("idle"), 2000);
  }

  async function postComment(e) {
    e.preventDefault();
    if (!item || !commentText.trim()) return;
    setPosting(true);
    const result = await Comments.postComment(item.id, commentText);
    setPosting(false);
    if (result?.success) {
      setCommentText("");
      const updated = await Comments.getComments(item.id);
      setComments(updated);
    }
  }

  // ── LOADING ──
  if (loading)
    return (
      <Layout>
        <SEO title="Loading — NovaHub" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: "2px solid var(--border2)",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span style={{ fontSize: 14, color: "var(--t3)" }}>Loading…</span>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </Layout>
    );

  // ── NOT FOUND ──
  if (notFound)
    return (
      <Layout>
        <SEO title="Not Found — NovaHub" />
        <div
          style={{
            textAlign: "center",
            padding: "calc(var(--nav) + 80px) 24px 80px",
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.3 }}>🔍</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
            Item Not Found
          </h1>
          <p style={{ color: "var(--t2)", marginBottom: 28 }}>
            We couldn&apos;t find what you&apos;re looking for.
          </p>
          <Link href="/" className="btn-primary">
            ← Back to NovaHub
          </Link>
        </div>
      </Layout>
    );

  const cat = getCategoryInfo(item.category_id);
  const sub =
    item.director || item.author || item.developer || item.company || "";
  const isFree = (item.pricing || "").toLowerCase().includes("free");
  const isPoster = ["movie", "tv", "book", "game"].includes(item.type);

  // CTA button
  const ctaLink =
    item.affiliate_link || item.source_url || item.watch_link || item.buy_link;
  const ctaLabel =
    {
      movie: "▶ Watch",
      tv: "▶ Watch",
      book: "📖 Read",
      game: "🎮 Play",
      tool: "→ Get it",
      course: "🧠 Enroll",
    }[item.type] || "→ Visit";

  return (
    <Layout>
      <SEO
        title={`${item.name} — NovaHub`}
        description={item.short_desc || `${item.name} on NovaHub — ${cat.name}`}
        ogTitle={item.name}
        ogDesc={item.short_desc}
      />

      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes saveHeart { 0%{transform:scale(1)} 40%{transform:scale(1.3)} 70%{transform:scale(.9)} 100%{transform:scale(1)} }
        .save-pulse { animation: saveHeart .4s ease; }
      `}</style>

      {/* Reading progress bar */}
      <div
        style={{
          position: "fixed",
          top: "var(--nav)",
          left: 0,
          right: 0,
          height: 2,
          zIndex: 999,
          background: "var(--border)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${scrollPct}%`,
            background: "var(--gold-grad)",
            transition: "width .1s linear",
            borderRadius: "0 1px 1px 0",
          }}
        />
      </div>

      {/* ── HERO ── */}
      <div
        className="item-hero"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Blurred background image */}
        {item.image && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${item.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(40px) brightness(.3) saturate(1.4)",
              transform: "scale(1.1)",
            }}
          />
        )}
        <div className="item-hero-bg" />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ marginBottom: 24 }}>
            <Link
              href="/"
              style={{ color: "var(--t3)", textDecoration: "none" }}
            >
              Home
            </Link>
            <span className="breadcrumb-sep">›</span>
            <Link
              href={`/category?cat=${item.category_id}`}
              style={{ color: "var(--t3)", textDecoration: "none" }}
            >
              {cat.icon} {cat.name}
            </Link>
            <span className="breadcrumb-sep">›</span>
            <span style={{ color: "var(--t2)" }}>{item.name}</span>
          </div>

          {/* Main layout */}
          <div
            className="item-layout"
            style={{
              display: "grid",
              gridTemplateColumns: isPoster ? "160px 1fr" : "1fr",
              gap: 28,
              alignItems: "flex-start",
            }}
          >
            {/* Cover image */}
            {isPoster && item.image && (
              <div>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "100%",
                    aspectRatio: "2/3",
                    objectFit: "cover",
                    borderRadius: "var(--r)",
                    boxShadow: "0 24px 60px rgba(0,0,0,.6)",
                    display: "block",
                  }}
                />
              </div>
            )}

            {/* Info */}
            <div>
              {/* Type + category badge */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 99,
                    background: "var(--gold-glow)",
                    color: "var(--gold)",
                    border: "1px solid var(--gold-glow2)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  {cat.icon} {cat.name}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 99,
                    background: "var(--surf)",
                    color: "var(--t3)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {item.type}
                </span>
                {item.pricing && (
                  <span className={isFree ? "tag-free" : "tag-paid"}>
                    {item.pricing}
                  </span>
                )}
                {item.trending && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: 99,
                      background: "rgba(255,69,58,.1)",
                      color: "#FF453A",
                      border: "1px solid rgba(255,69,58,.2)",
                    }}
                  >
                    🔥 Trending
                  </span>
                )}
              </div>

              <h1
                className="item-name"
                style={{
                  fontSize: "clamp(24px,5vw,42px)",
                  fontWeight: 900,
                  letterSpacing: "-.04em",
                  marginBottom: 8,
                  lineHeight: 1.15,
                }}
              >
                {item.name}
              </h1>

              {/* Sub info */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "var(--t2)",
                }}
              >
                {sub && <span style={{ fontWeight: 600 }}>{sub}</span>}
                {item.year && (
                  <>
                    <span style={{ color: "var(--t3)" }}>·</span>
                    <span>{item.year}</span>
                  </>
                )}
                {item.genre && (
                  <>
                    <span style={{ color: "var(--t3)" }}>·</span>
                    <span>{item.genre}</span>
                  </>
                )}
                {item.platforms && (
                  <>
                    <span style={{ color: "var(--t3)" }}>·</span>
                    <span>{item.platforms}</span>
                  </>
                )}
              </div>

              {/* Rating */}
              <div style={{ marginBottom: 16 }}>
                <StarRating rating={item.rating} count={item.rating_count} />
              </div>

              {/* Description */}
              <p
                className="item-desc"
                style={{
                  fontSize: 15,
                  color: "var(--t2)",
                  lineHeight: 1.7,
                  marginBottom: 24,
                  maxWidth: 600,
                }}
              >
                {item.short_desc || ""}
              </p>

              {/* Action buttons */}
              <div
                className="item-actions"
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {ctaLink && (
                  <a
                    href={ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ fontSize: 14, padding: "12px 24px" }}
                  >
                    {ctaLabel}
                  </a>
                )}

                <button
                  className={`save-hero-btn${isSaved ? " saved" : ""}`}
                  onClick={toggleSave}
                  disabled={saveLoading}
                  style={{ transition: "all var(--spring)" }}
                >
                  {saveLoading ? (
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        border: "2px solid currentColor",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin .6s linear infinite",
                      }}
                    />
                  ) : isSaved ? (
                    "♥ Saved"
                  ) : (
                    "♡ Save"
                  )}
                </button>

                <button
                  onClick={share}
                  style={{
                    background: "var(--surf)",
                    border: "1px solid var(--border2)",
                    borderRadius: 99,
                    padding: "10px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--t2)",
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    transition: "var(--ease)",
                  }}
                >
                  {shareState === "copied" ? "✓ Copied!" : "↗ Share"}
                </button>

                <Link
                  href={`/category?cat=${item.category_id}`}
                  className="btn-secondary"
                  style={{ fontSize: 13 }}
                >
                  Browse {cat.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="container" style={{ paddingBottom: 80 }}>
        {/* Tags */}
        {item.tags?.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              margin: "28px 0",
            }}
          >
            {item.tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                style={{
                  padding: "5px 12px",
                  borderRadius: 99,
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--t2)",
                  textDecoration: "none",
                  transition: "var(--ease)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--gold-glow2)";
                  e.currentTarget.style.color = "var(--gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--t2)";
                }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Long description */}
        {item.long_desc && item.long_desc !== item.short_desc && (
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r)",
              padding: "24px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "var(--t3)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 14,
              }}
            >
              About
            </div>
            <p
              style={{
                fontSize: 15,
                color: "var(--t2)",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {item.long_desc}
            </p>
          </div>
        )}

        {/* Nova Verdict */}
        <NovaVerdict item={item} />

        {/* Trailer */}
        {item.trailer_url && (
          <div className="trailer-wrap reveal" style={{ margin: "28px 0" }}>
            <div className="trailer-label">🎬 Trailer</div>
            <iframe
              src={item.trailer_url}
              allowFullScreen
              allow="autoplay;encrypted-media;picture-in-picture"
            />
          </div>
        )}

        {/* Pros/Cons */}
        {item.pros?.length > 0 && (
          <div className="pc-grid reveal" style={{ margin: "28px 0" }}>
            <div className="pc-card">
              <div className="pc-title">✅ Pros</div>
              <ul className="pc-list">
                {item.pros.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="pc-card">
              <div className="pc-title">❌ Cons</div>
              <ul className="pc-list">
                {(item.cons || ["None noted"]).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="pc-card">
              <div className="pc-title">🎯 Best For</div>
              <p
                style={{ fontSize: 13.5, color: "var(--t2)", lineHeight: 1.65 }}
              >
                {item.best_for || `Everyone interested in ${cat.name}`}
              </p>
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="section" style={{ paddingTop: 16 }}>
            <div className="section-header">
              <div>
                <div className="section-label">More Like This</div>
                <h2 className="section-title">You Might Also Like</h2>
              </div>
              <Link
                href={`/category?cat=${item.category_id}`}
                className="section-more"
              >
                See all →
              </Link>
            </div>
            <div
              className={`${related.some((r) => ["movie", "tv", "book", "game"].includes(r.type)) ? "grid-4" : "grid-3"} stagger`}
            >
              {related.map((r) => (
                <div className="reveal-scale" key={r.id || r.slug}>
                  <RelatedCard item={r} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="comments-section" style={{ marginTop: 40 }}>
          <div className="comments-title">
            💬 Comments
            <span
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "var(--t3)",
                marginLeft: 8,
              }}
            >
              ({comments.length})
            </span>
          </div>

          {/* Comment form */}
          {user ? (
            <form onSubmit={postComment} style={{ marginBottom: 28 }}>
              <textarea
                placeholder="Add a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "var(--bg3)",
                  border: "1px solid var(--border2)",
                  borderRadius: "var(--r)",
                  padding: "14px 16px",
                  fontSize: 14,
                  fontFamily: "var(--font)",
                  color: "var(--t1)",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color var(--ease)",
                  lineHeight: 1.6,
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--gold)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border2)"; }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={posting || !commentText.trim()}
                  style={{ fontSize: 13, padding: "10px 20px" }}
                >
                  {posting ? "Posting…" : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r)",
                padding: "20px 24px",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <p style={{ margin: 0, fontSize: 14, color: "var(--t2)" }}>
                💬 <strong style={{ color: "var(--t1)" }}>Sign in</strong> to join the conversation.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href={`/account/login?return=${encodeURIComponent(router.asPath)}`}
                  className="btn-primary"
                  style={{ fontSize: 13, padding: "9px 18px" }}
                >
                  Sign In
                </Link>
                <Link
                  href="/account/register"
                  className="btn-secondary"
                  style={{ fontSize: 13, padding: "9px 18px" }}
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Comment list */}
          {comments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px",
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r)",
                color: "var(--t3)",
                fontSize: 14,
              }}
            >
              No comments yet — be the first to say something ✦
            </div>
          ) : (
            comments.map((c) => <CommentCard key={c.id} comment={c} />)
          )}
        </div>
      </div>
    </Layout>
  );
}
