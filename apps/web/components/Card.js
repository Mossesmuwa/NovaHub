import Link from "next/link";
import NovaScore from "./NovaScore";
import { esc } from "../lib/helpers";

export function PosterCard({ item }) {
  if (!item) return null;
  const href = `/item/${encodeURIComponent(item.slug)}`;
  const sub =
    item.director || item.author || item.developer || item.genre || "";
  return (
    <Link href={href} className="card-poster">
      <div
        className="bg-zoom"
        style={{ backgroundImage: `url('${item.image || ""}')` }}
      ></div>
      {item.trending && <span className="badge badge-trending">🔥 Hot</span>}
      {!item.trending && item.daily_pick && (
        <span className="badge badge-pick">⭐ Pick</span>
      )}
      <div className="card-poster-content">
        <div className="card-poster-title">{item.name}</div>
        {sub && <div className="card-poster-sub">{sub}</div>}
        <NovaScore item={item} />
      </div>
    </Link>
  );
}

export function ToolCard({ item }) {
  if (!item) return null;
  const href = `/item/${encodeURIComponent(item.slug)}`;
  const isFree = (item.pricing || "").toLowerCase().includes("free");

  // Generate "Best for" based on category and tags
  const getBestFor = (item) => {
    const category = item.category || "";
    const tags = item.tags || [];

    if (category === "ai-tools") {
      if (tags.includes("writing")) return "Content creators";
      if (tags.includes("coding")) return "Developers";
      if (tags.includes("design")) return "Designers";
      return "Productivity users";
    }
    if (category === "productivity") return "Teams & professionals";
    if (category === "security") return "Privacy-conscious users";
    if (category === "finance") return "Investors & analysts";
    if (category === "courses") return "Learners & students";
    return "Everyone";
  };

  // Generate key advantages
  const getAdvantages = (item) => {
    const advantages = [];
    const pricing = (item.pricing || "").toLowerCase();

    if (pricing.includes("free")) advantages.push("Free");
    if (pricing.includes("open source")) advantages.push("Open source");
    if (item.rating && item.rating >= 4.5) advantages.push("Highly rated");
    if (item.save_count && item.save_count > 100) advantages.push("Popular");

    // Add category-specific advantages
    if (item.category === "ai-tools") advantages.push("AI-powered");
    if (item.category === "security") advantages.push("Secure");

    return advantages.slice(0, 2); // Max 2 advantages
  };

  const bestFor = getBestFor(item);
  const advantages = getAdvantages(item);

  return (
    <div
      className="card"
      onClick={() => (window.location.href = href)}
      style={{ cursor: "pointer" }}
    >
      <div className="card-icon">{(item.name || "?").charAt(0)}</div>
      <div className="card-title">{item.name}</div>

      {item.pricing && (
        <span
          className={isFree ? "tag-free" : "tag-paid"}
          style={{ display: "inline-block", marginBottom: "8px" }}
        >
          {item.pricing}
        </span>
      )}

      {bestFor && (
        <div
          style={{
            fontSize: "12px",
            color: "var(--t3)",
            marginBottom: "4px",
            fontWeight: "600",
          }}
        >
          Best for: {bestFor}
        </div>
      )}

      <p
        className="card-desc"
        style={{ fontSize: "13px", lineHeight: "1.4", marginBottom: "8px" }}
      >
        {item.short_desc || "Discover this item"}
      </p>

      {advantages.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            marginBottom: "12px",
          }}
        >
          {advantages.map((adv, i) => (
            <span
              key={i}
              style={{
                fontSize: "11px",
                background: "var(--bg3)",
                color: "var(--t2)",
                padding: "2px 6px",
                borderRadius: "4px",
                border: "1px solid var(--border2)",
              }}
            >
              {adv}
            </span>
          ))}
        </div>
      )}

      {item.reason && (
        <div
          style={{
            fontSize: "12px",
            color: "var(--gold)",
            fontStyle: "italic",
            marginBottom: "8px",
          }}
        >
          {item.reason}
        </div>
      )}

      <div className="card-actions">
        <Link
          href={href}
          className="btn-secondary"
          style={{ fontSize: "12px", padding: "7px 14px" }}
          onClick={(e) => e.stopPropagation()}
        >
          Details
        </Link>
        <a
          href={item.affiliate_link || href}
          target="_blank"
          rel="noopener"
          className="btn-primary"
          style={{ fontSize: "12px", padding: "7px 14px" }}
          onClick={(e) => e.stopPropagation()}
        >
          Get →
        </a>
      </div>
    </div>
  );
}

export default function Card({ item }) {
  if (!item) return null;
  if (["movie", "book", "game"].includes(item.type))
    return <PosterCard item={item} />;
  return <ToolCard item={item} />;
}

export function CardGrid({ items, gridClass = "grid-4 stagger" }) {
  if (!items || !items.length) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">📭</span>
        <p>Nothing here yet.</p>
      </div>
    );
  }
  return (
    <div className={gridClass}>
      {items.map((item, i) => (
        <div className="reveal-scale" key={item.id || i}>
          <Card item={item} />
        </div>
      ))}
    </div>
  );
}

export function Carousel({ items, id, width = "150px" }) {
  if (!items || !items.length) return null;
  return (
    <div className="carousel" id={id}>
      {items.map((item, i) => (
        <div className="carousel-item" style={{ width }} key={item.id || i}>
          <Card item={item} />
        </div>
      ))}
    </div>
  );
}

export function CarouselNav({ id }) {
  const scroll = (dir) => {
    const el = document.getElementById(id);
    if (el) el.scrollBy({ left: dir * 280, behavior: "smooth" });
  };
  return (
    <div className="carousel-nav">
      <button className="carousel-btn" onClick={() => scroll(-1)}>
        ←
      </button>
      <button className="carousel-btn" onClick={() => scroll(1)}>
        →
      </button>
    </div>
  );
}
