// lib/pipeline/RAWGProvider.js
// NovaHub — AI Content Pipeline
// Fetches trending/top-rated games from RAWG.io and transforms into NovaHub items.

import { BaseProvider } from "./BaseProvider.js";
import { getEnvCredential, toSlug } from "../helpers.js";

const RAWG_BASE = "https://api.rawg.io/api";

// Map RAWG genres → NovaHub tags
const GENRE_TAGS = {
  action: "action",
  indie: "indie",
  adventure: "adventure",
  "role-playing-games-rpg": "rpg",
  strategy: "strategy",
  shooter: "shooter",
  casual: "casual",
  simulation: "simulation",
  puzzle: "puzzle",
  arcade: "arcade",
  platformer: "platformer",
  racing: "racing",
  sports: "sports",
  fighting: "fighting",
  family: "family",
  horror: "horror",
};

/**
 * RAWGProvider — pulls top-rated recent games from RAWG.io.
 *
 * Environment:
 *   RAWG_API_KEY
 *
 * Produces items with:
 *   category_id: 'games', type: 'game'
 */
export class RAWGProvider extends BaseProvider {
  /**
   * @param {Object} [options]
   * @param {number} [options.limit=40]            — max games to fetch
   * @param {string} [options.ordering='-rating']  — RAWG ordering param
   */
  constructor(options = {}) {
    super("RAWG");
    this.limit = options.limit || 40;
    this.ordering = options.ordering || "-rating";
  }

  async fetch() {
    const key = getEnvCredential("RAWG_API_KEY");
    if (!key) throw new Error("RAWG_API_KEY environment variable is not set.");

    const allGames = [];
    const seen = new Set();

    // Multiple endpoints → ensures we always get data
    const endpoints = [
      // Most popular (very reliable)
      `${RAWG_BASE}/games?key=${key}&ordering=-added&page_size=20`,

      // Top rated
      `${RAWG_BASE}/games?key=${key}&ordering=-rating&page_size=20`,

      // Recently released
      `${RAWG_BASE}/games?key=${key}&ordering=-released&page_size=20`,
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);

        if (!res.ok) {
          console.warn(`[RAWG] ${res.status} on ${url}`);
          continue;
        }

        const data = await res.json();
        const games = data.results || [];

        console.log(`[RAWG] ${games.length} games from endpoint`);

        for (const g of games) {
          if (g.id && !seen.has(g.id) && g.name) {
            seen.add(g.id);
            allGames.push(g);
          }

          if (allGames.length >= this.limit) break;
        }
      } catch (err) {
        console.warn("[RAWG] Fetch error:", err.message);
      }

      if (allGames.length >= this.limit) break;
    }

    console.log(`[RAWG] Total unique games: ${allGames.length}`);

    return allGames.slice(0, this.limit);
  }

  transform(rawGames) {
    return rawGames.map((game) => {
      const name = game.name || "Unknown Game";
      const slug = toSlug(`${name} rawg ${game.id}`);

      const genres = (game.genres || []).map(
        (g) => GENRE_TAGS[g.slug] || g.slug,
      );

      const platforms = (game.platforms || [])
        .map((p) => p.platform?.name)
        .filter(Boolean)
        .slice(0, 4);

      const year = game.released
        ? parseInt(game.released.slice(0, 4), 10)
        : null;

      const tags = ["rawg", "game", ...genres].slice(0, 8);

      return {
        slug,
        name,

        short_desc: `${genres.slice(0, 2).join(", ")} game${
          year ? ` • ${year}` : ""
        }`,

        // RAWG list endpoint doesn't include full description
        long_desc: game.description_raw || "",

        category_id: "games",
        type: "game",

        image: game.background_image || null,

        year,
        rating: game.rating ? parseFloat(game.rating.toFixed(1)) : null,
        rating_count: game.ratings_count || 0,

        genre: genres.slice(0, 3).join(", "),

        platforms: platforms.join(", "),

        tags,
        vibe_tags: [],

        source_url: `https://rawg.io/games/${game.slug}`,
        source_id: String(game.id),
        source_name: "rawg",

        trending: false,
        approved: true,

        metadata: {
          metacritic: game.metacritic || null,
          esrb: game.esrb_rating?.name || null,
          platforms,
        },
      };
    });
  }
}
