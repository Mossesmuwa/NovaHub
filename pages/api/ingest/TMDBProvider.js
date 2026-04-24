// lib/ingest/TMDBProvider.js
// Fetches trending movies + TV from TMDB and upserts into Supabase.
// Uses Bearer token (TMDB_BEARER_TOKEN) or falls back to API key (TMDB_API_KEY).

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

function getSupabase() {
  return supabaseAdmin;
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function tmdbHeaders() {
  const token = process.env.TMDB_BEARER_TOKEN || process.env.TMDB_API_KEY;
  if (!token) throw new Error("TMDB_BEARER_TOKEN or TMDB_API_KEY not set");
  // JWT tokens are long; API keys are short (32 chars)
  const isBearer = token.length > 40;
  return isBearer
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

function tmdbUrl(path) {
  const token = process.env.TMDB_BEARER_TOKEN || process.env.TMDB_API_KEY;
  const isBearer = token && token.length > 40;
  return isBearer
    ? `${TMDB_BASE}${path}?language=en-US`
    : `${TMDB_BASE}${path}?api_key=${token}&language=en-US`;
}

async function tmdbFetch(path) {
  const res = await fetch(tmdbUrl(path), { headers: tmdbHeaders() });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

function movieToItem(m) {
  const name = m.title || m.original_title || "Unknown";
  return {
    slug: `${slugify(name)}-${m.id}`,
    name,
    short_desc: (m.overview || "").slice(0, 200),
    long_desc: m.overview || "",
    category_id: "movies",
    type: "movie",
    image: m.poster_path ? IMG_BASE + m.poster_path : null,
    year: m.release_date ? parseInt(m.release_date) : null,
    rating: m.vote_average ? +m.vote_average.toFixed(1) : null,
    rating_count: m.vote_count || 0,
    tags: ["tmdb", "movie"],
    vibe_tags: [],
    source_url: `https://www.themoviedb.org/movie/${m.id}`,
    source_id: String(m.id),
    source_name: "tmdb",
    trending: false,
    approved: true,
  };
}

function tvToItem(t) {
  const name = t.name || t.original_name || "Unknown";
  return {
    slug: `${slugify(name)}-tv-${t.id}`,
    name,
    short_desc: (t.overview || "").slice(0, 200),
    long_desc: t.overview || "",
    category_id: "movies",
    type: "tv",
    image: t.poster_path ? IMG_BASE + t.poster_path : null,
    year: t.first_air_date ? parseInt(t.first_air_date) : null,
    rating: t.vote_average ? +t.vote_average.toFixed(1) : null,
    rating_count: t.vote_count || 0,
    tags: ["tmdb", "tv-show"],
    vibe_tags: [],
    source_url: `https://www.themoviedb.org/tv/${t.id}`,
    source_id: `tv-${t.id}`,
    source_name: "tmdb",
    trending: false,
    approved: true,
  };
}

export class TMDBProvider {
  constructor({ limit = 20 } = {}) {
    this.limit = limit;
  }

  async sync() {
    const supabase = getSupabase();
    const results = { movies: 0, tv: 0, errors: [] };

    // Movies
    try {
      const { results: raw } = await tmdbFetch("/trending/movie/week");
      const items = (raw || []).slice(0, this.limit).map(movieToItem);
      if (items.length) {
        const { error } = await supabase
          .from("items")
          .upsert(items, { onConflict: "slug", ignoreDuplicates: false });
        if (error) throw error;
        results.movies = items.length;
      }
    } catch (e) {
      results.errors.push(`Movies: ${e.message}`);
    }

    // TV
    try {
      const { results: raw } = await tmdbFetch("/trending/tv/week");
      const items = (raw || []).slice(0, this.limit).map(tvToItem);
      if (items.length) {
        const { error } = await supabase
          .from("items")
          .upsert(items, { onConflict: "slug", ignoreDuplicates: false });
        if (error) throw error;
        results.tv = items.length;
      }
    } catch (e) {
      results.errors.push(`TV: ${e.message}`);
    }

    console.log("[TMDBProvider]", results);
    return results;
  }
}
