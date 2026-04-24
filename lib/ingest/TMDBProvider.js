// lib/ingest/TMDBProvider.js
// NovaHub — TMDB Content Provider
// Fetches trending movies & TV from The Movie Database API
// and maps them into the NovaHub items schema.

import { Pipeline } from "./Pipeline.js";
import { getEnvCredential } from "../helpers.js";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

/**
 * TMDBProvider — pulls trending movies from TMDB.
 *
 * Environment:
 *   TMDB_API_KEY  or  TMDB_ACCESS_TOKEN
 *
 * Schema mapping:
 *   category_id: 'movies'
 *   type: 'movie'
 *   slug: slugified title + TMDB ID
 */
export class TMDBProvider extends Pipeline {
  /**
   * @param {Object} [options]
   * @param {string} [options.timeWindow='week'] — 'day' or 'week'
   * @param {number} [options.limit=20]          — max items to return
   */
  constructor(options = {}) {
    super("TMDB", "movies");
    this.timeWindow = options.timeWindow || "week";
    this.limit = options.limit || 20;
  }

  /**
   * Fetch trending movies from TMDB API.
   * Supports both v3 API key and v4 bearer token authentication.
   * @returns {Promise<Object>} Raw TMDB trending response
   */
  async fetch() {
    console.log(`${this.tag} fetch() starting...`);

    const token = getEnvCredential("TMDB_API_KEY", "TMDB_ACCESS_TOKEN");
    console.log(`${this.tag} Token present: ${token ? "yes" : "NO"}`);

    if (!token) {
      console.error(`${this.tag} ✗ CRITICAL: TMDB credential not found`);
      throw new Error(
        "TMDB API credential not set (TMDB_API_KEY or TMDB_ACCESS_TOKEN).",
      );
    }

    // JWTs and bearer-style tokens contain dots
    const isBearer = token.startsWith("eyJ") || token.includes(".");
    const headers = {};
    let url = `${TMDB_BASE}/trending/movie/${this.timeWindow}?language=en-US`;

    console.log(`${this.tag} Auth type: ${isBearer ? "Bearer" : "API Key"}`);
    console.log(
      `${this.tag} Time window: ${this.timeWindow}, limit: ${this.limit}`,
    );

    if (isBearer) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      url += `&api_key=${encodeURIComponent(token)}`;
    }

    console.log(`${this.tag} Making API call to ${url}...`);

    const res = await fetch(url, { headers });
    console.log(`${this.tag} API response status: ${res.status}`);

    if (!res.ok) {
      console.error(`${this.tag} ✗ API error: ${res.status} ${res.statusText}`);
      throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log(
      `${this.tag} ✓ Response parsed, results: ${data.results?.length || 0}`,
    );

    return data;
  }

  /**
   * Transform TMDB movie objects into NovaHub item format.
   * @param {Object} rawData — TMDB trending response ({ results: [...] })
   * @returns {Array<Object>} NovaHub-shaped item objects
   */
  transform(rawData) {
    const results = (rawData.results || []).slice(0, this.limit);

    return results.map((movie) => {
      const name = movie.title || movie.original_title || "Untitled Movie";
      const slug = this.makeSlug(name, String(movie.id));

      return {
        slug,
        name,
        short_desc: (movie.overview || "").slice(0, 200),
        long_desc: movie.overview || "",
        category_id: "movies",
        type: "movie",
        image: movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : null,
        year: movie.release_date
          ? parseInt(movie.release_date.slice(0, 4), 10)
          : null,
        rating: movie.vote_average
          ? parseFloat(movie.vote_average.toFixed(1))
          : null,
        rating_count: movie.vote_count || 0,
        genre: (movie.genre_ids || []).join(", "),
        tags: ["tmdb", "movie", "trending"],
        vibe_tags: [],
        source_url: `https://www.themoviedb.org/movie/${movie.id}`,
        source_id: String(movie.id),
        source_name: "tmdb",
        trending: true,
        approved: true,
      };
    });
  }
}
