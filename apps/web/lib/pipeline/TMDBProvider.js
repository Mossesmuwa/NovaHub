// lib/pipeline/TMDBProvider.js
// NovaHub — AI Content Pipeline
// Fetches movies + TV from multiple TMDB endpoints with pagination.
// Produces hundreds of items per run, always current.

import slugify from "slugify";
import { BaseProvider } from "./BaseProvider.js";
import { getEnvCredential } from "../helpers.js";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

// All endpoints to pull from — 6 movie + 6 TV
const MOVIE_ENDPOINTS = [
  "/trending/movie/week",
  "/trending/movie/day",
  "/movie/now_playing",
  "/movie/popular",
  "/movie/top_rated",
  "/movie/upcoming",
];

const TV_ENDPOINTS = [
  "/trending/tv/week",
  "/trending/tv/day",
  "/tv/popular",
  "/tv/top_rated",
  "/tv/on_the_air",
  "/tv/airing_today",
];

export class TMDBProvider extends BaseProvider {
  /**
   * @param {Object} [options]
   * @param {number} [options.pages=3]  — pages per endpoint (20 items/page)
   * @param {number} [options.limit=20] — legacy single-page limit (ignored when pages > 1)
   */
  constructor(options = {}) {
    super("TMDB");
    this.pages = options.pages || 3;
  }

  _getHeaders(token) {
    const isBearer = token.startsWith("eyJ") || token.length > 40;
    return isBearer ? { Authorization: `Bearer ${token}` } : {};
  }

  _buildUrl(path, token, page = 1) {
    const isBearer = token.startsWith("eyJ") || token.length > 40;
    const base = `${TMDB_BASE}${path}?language=en-US&page=${page}`;
    return isBearer ? base : `${base}&api_key=${encodeURIComponent(token)}`;
  }

  async _fetchPage(path, token, page) {
    try {
      const res = await fetch(this._buildUrl(path, token, page), {
        headers: this._getHeaders(token),
      });
      if (!res.ok) {
        console.warn(`[TMDB] ${path} p${page} → ${res.status}`);
        return [];
      }
      const data = await res.json();
      return data.results || [];
    } catch (err) {
      console.warn(`[TMDB] ${path} p${page} failed:`, err.message);
      return [];
    }
  }

  async _fetchEndpoint(path, token) {
    const all = [];
    for (let page = 1; page <= this.pages; page++) {
      const results = await this._fetchPage(path, token, page);
      all.push(...results);
      if (results.length < 20) break; // reached last page
    }
    return all;
  }

  /**
   * Fetch from all movie and TV endpoints.
   * Returns { movies: [...], tv: [...] }
   */
  async fetch() {
    const token = getEnvCredential(
      "TMDB_BEARER_TOKEN",
      "TMDB_API_KEY",
      "TMDB_ACCESS_TOKEN",
    );
    if (!token)
      throw new Error(
        "TMDB API credential not set (TMDB_BEARER_TOKEN or TMDB_API_KEY).",
      );

    const allMovies = [];
    const allTV = [];

    for (const endpoint of MOVIE_ENDPOINTS) {
      const results = await this._fetchEndpoint(endpoint, token);
      allMovies.push(...results);
    }

    for (const endpoint of TV_ENDPOINTS) {
      const results = await this._fetchEndpoint(endpoint, token);
      allTV.push(...results);
    }

    console.log(
      `[TMDB] Raw fetched — movies: ${allMovies.length}, tv: ${allTV.length}`,
    );
    return { movies: allMovies, tv: allTV };
  }

  transform({ movies = [], tv = [] }) {
    const seen = new Set();
    const items = [];

    // Deduplicate and transform movies
    for (const m of movies) {
      const key = `m-${m.id}`;
      if (!m.id || seen.has(key)) continue;
      seen.add(key);

      const name = m.title || m.original_title || "Untitled";
      const slug = slugify(`${name} ${m.id}`, { lower: true, strict: true });

      items.push({
        slug,
        name,
        short_desc: (m.overview || "").slice(0, 200),
        long_desc: m.overview || "",
        category_id: "movies",
        type: "movie",
        image: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
        year: m.release_date ? parseInt(m.release_date.slice(0, 4), 10) : null,
        rating: m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : null,
        rating_count: m.vote_count || 0,
        genre: (m.genre_ids || []).join(", "),
        tags: ["tmdb", "movie"],
        vibe_tags: [],
        source_url: `https://www.themoviedb.org/movie/${m.id}`,
        source_id: String(m.id),
        source_name: "tmdb",
        trending: false,
        approved: true,
      });
    }

    // Deduplicate and transform TV
    for (const t of tv) {
      const key = `tv-${t.id}`;
      if (!t.id || seen.has(key)) continue;
      seen.add(key);

      const name = t.name || t.original_name || "Untitled";
      const slug = slugify(`${name} tv ${t.id}`, { lower: true, strict: true });

      items.push({
        slug,
        name,
        short_desc: (t.overview || "").slice(0, 200),
        long_desc: t.overview || "",
        category_id: "movies",
        type: "tv",
        image: t.poster_path ? `${TMDB_IMG}${t.poster_path}` : null,
        year: t.first_air_date
          ? parseInt(t.first_air_date.slice(0, 4), 10)
          : null,
        rating: t.vote_average ? parseFloat(t.vote_average.toFixed(1)) : null,
        rating_count: t.vote_count || 0,
        tags: ["tmdb", "tv-show"],
        vibe_tags: [],
        source_url: `https://www.themoviedb.org/tv/${t.id}`,
        source_id: `tv-${t.id}`,
        source_name: "tmdb",
        trending: false,
        approved: true,
      });
    }

    console.log(`[TMDB] After dedup: ${items.length} total items`);
    return items;
  }
}
