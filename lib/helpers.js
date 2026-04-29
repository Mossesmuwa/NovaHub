// lib/helpers.js
// Shared utilities for the NovaHub pipeline and API routes.

/**
 * Returns the first defined, non-empty environment variable from the provided keys.
 * Used by providers to support multiple possible env var names.
 *
 * @param {...string} keys — env var names to try in order
 * @returns {string|null}
 */
export function getEnvCredential(...keys) {
  for (const key of keys) {
    const val = process.env[key];
    if (val && val.trim().length > 0) return val.trim();
  }
  return null;
}

/**
 * Simple slugify without external dependency.
 * Used as fallback when slugify package is unavailable.
 */
export function toSlug(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Clamp a number between min and max.
 */
export function clamp(val, min = 0, max = 100) {
  const n = parseFloat(val);
  if (isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/**
 * Validate that a required cron request has the correct CRON_SECRET header.
 * Returns true if authorized, false otherwise.
 */
export function isAuthorizedCron(req) {
  return req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
}

// ── Category metadata ─────────────────────────────────────────────────────────
const CATEGORIES = {
  movies: { name: "Movies & TV", icon: "🎬", color: "#E50914" },
  "ai-tools": { name: "AI Tools", icon: "🤖", color: "#7C3AED" },
  games: { name: "Games", icon: "🎮", color: "#10B981" },
  books: { name: "Books", icon: "📚", color: "#F59E0B" },
  music: { name: "Music", icon: "🎵", color: "#EC4899" },
  productivity: { name: "Productivity", icon: "⚡", color: "#3B82F6" },
  design: { name: "Design", icon: "🎨", color: "#F97316" },
  security: { name: "Security", icon: "🔒", color: "#6B7280" },
  finance: { name: "Finance", icon: "💰", color: "#22C55E" },
  courses: { name: "Courses", icon: "🧠", color: "#8B5CF6" },
  science: { name: "Science", icon: "🔬", color: "#06B6D4" },
  news: { name: "News", icon: "📰", color: "#64748B" },
};

export function getCategoryInfo(categoryId) {
  return (
    CATEGORIES[categoryId] || {
      name: categoryId || "Other",
      icon: "◆",
      color: "#7C3AED",
    }
  );
}

export function getAllCategories() {
  return Object.entries(CATEGORIES).map(([id, info]) => ({ id, ...info }));
}
