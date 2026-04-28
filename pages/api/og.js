// pages/api/og.js
// Dynamic Open Graph image generation using @vercel/og.
// Install: npm install @vercel/og
//
// Usage in SEO.js:
//   <meta property="og:image" content={`/api/og?title=${encodeURIComponent(item.name)}&type=${item.type}`} />
//
// Renders a 1200x630 branded image for any item.

import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "NovaHub";
  const type = searchParams.get("type") || "";
  const category = searchParams.get("category") || "";
  const rating = searchParams.get("rating") || "";
  const image = searchParams.get("image") || "";

  const TYPE_LABEL = {
    movie: "Movie",
    tv: "TV Show",
    book: "Book",
    game: "Game",
    tool: "Tool",
    course: "Course",
    podcast: "Podcast",
  };

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#09090C",
        padding: "60px",
        fontFamily: "Inter, system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 60% at 80% 20%, rgba(201,168,76,0.12) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative",
        }}
      >
        {/* Nova logo wordmark */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "#C9A84C",
            letterSpacing: "-0.04em",
            marginBottom: "auto",
          }}
        >
          NOVAHUB
        </div>

        {/* Item image if available */}
        {image && (
          <div style={{ display: "flex", marginBottom: 28 }}>
            <img
              src={image}
              width={80}
              height={120}
              style={{ borderRadius: 10, objectFit: "cover" }}
            />
          </div>
        )}

        {/* Type badge */}
        {(type || category) && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 14px",
              borderRadius: 99,
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.3)",
              fontSize: 13,
              fontWeight: 700,
              color: "#C9A84C",
              marginBottom: 20,
              width: "fit-content",
            }}
          >
            {TYPE_LABEL[type] || type || category}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? 42 : 52,
            fontWeight: 900,
            color: "#F2F2F7",
            letterSpacing: "-0.04em",
            lineHeight: 1.15,
            marginBottom: 16,
            maxWidth: 800,
          }}
        >
          {title}
        </div>

        {/* Rating */}
        {rating && (
          <div style={{ fontSize: 18, color: "#AEAEB2", fontWeight: 500 }}>
            ★ {rating}
          </div>
        )}

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: 14, color: "#636366" }}>novahub.app</div>
          <div style={{ fontSize: 13, color: "#636366" }}>The Discovery OS</div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
