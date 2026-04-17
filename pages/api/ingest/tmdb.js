// pages/api/ingest/tmdb.js
// NovaHub — TMDB Auto-Ingestion Cron
// Runs daily at 2am UTC via Vercel Cron (see vercel.json)
// Pulls trending movies and upserts into Supabase items table.

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const BATCH_SIZE = 20;

import { createClient } from "@supabase/supabase-js";
import { getEnvCredential } from "../../../lib/helpers";

export const config = { maxDuration: 60 };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
);

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function tmdbFetch(path) {
  const token = getEnvCredential("TMDB_API_KEY", "TMDB_ACCESS_TOKEN");
  const useBearer =
    token.startsWith("Bearer ") ||
    token.startsWith("eyJ") ||
    token.includes(".");
  const headers = {};
  let url = `${TMDB_BASE}${path}?language=en-US`;

  if (useBearer) {
    headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  } else {
    url += `&api_key=${encodeURIComponent(token)}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`TMDB error: ${res.status} ${path}`);
  return res.json();
}

function movieToItem(movie) {
  const name = movie.title || movie.original_title || "Untitled Movie";
  return {
    slug: `${slugify(name)}-${movie.id}`,
    name,
    short_desc: (movie.overview || "").slice(0, 200),
    long_desc: movie.overview || "",
    category_id: "movies",
    type: "movie",
    image: movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : null,
    year: movie.release_date
      ? parseInt(movie.release_date.slice(0, 4), 10)
      : null,
    release_date: movie.release_date || null,
    source_url: `https://www.themoviedb.org/movie/${movie.id}`,
    source_id: String(movie.id),
    source_name: "tmdb",
    trending: true,
    approved: true,
  };
}

async function upsertItems(items) {
  const { data, error } = await supabase
    .from("items")
    .upsert(items, { onConflict: "source_id,source_name" });
  if (error) throw error;
  return data?.length ?? items.length;
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const tmdbToken = getEnvCredential("TMDB_API_KEY", "TMDB_ACCESS_TOKEN");
  if (!tmdbToken) {
    return res
      .status(500)
      .json({ success: false, error: "TMDB API credential not set" });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return res
      .status(500)
      .json({ success: false, error: "Supabase env vars not configured" });
  }

  try {
    const movieData = await tmdbFetch("/trending/movie/week");
    const movies = (movieData.results || [])
      .slice(0, BATCH_SIZE)
      .map(movieToItem);

    const syncedCount = movies.length ? await upsertItems(movies) : 0;
    return res.status(200).json({ success: true, moviesSynced: syncedCount });
  } catch (err) {
    console.error("[ingest/tmdb]", err);
    return res
      .status(500)
      .json({ success: false, error: err.message || "TMDB ingestion failed" });
  }
}
