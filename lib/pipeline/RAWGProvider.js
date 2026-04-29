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
   * @param {number} [options.limit=20]           — max games to fetch
   * @param {string} [options.ordering='-rating'] — RAWG ordering param
   */
  constructor(options = {}) {
    super("RAWG");
    this.limit = options.limit || 20;
    this.ordering = options.ordering || "-rating";
  }

  async fetch() {
    const key = getEnvCredential("RAWG_API_KEY");
    if (!key) throw new Error("RAWG_API_KEY environment variable is not set.");

    // Get games from the past year, ordered by rating
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    const dateFrom = cutoff.toISOString().split("T")[0];
    const dateTo = new Date().toISOString().split("T")[0];

    const url = `${RAWG_BASE}/games?key=${key}&ordering=${this.ordering}&dates=${dateFrom},${dateTo}&page_size=${this.limit}&metacritic=70,100`;

    const res = await fetch(url);
    if (!res.ok)
      throw new Error(`RAWG API error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    return data.results || [];
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

      const tags = ["rawg", "game", ...genres].slice(0, 8);

      return {
        slug,
        name,
        short_desc: `${genres.slice(0, 2).join(", ")} game${game.released ? ` • ${game.released.slice(0, 4)}` : ""}`,
        long_desc: game.description_raw || "",
        category_id: "games",
        type: "game",
        image: game.background_image || null,
        year: game.released ? parseInt(game.released.slice(0, 4), 10) : null,
        rating: game.rating ? parseFloat(game.rating.toFixed(1)) : null,
        rating_count: game.ratings_count || 0,
        genre: genres.slice(0, 3).join(", "),
        platform: platforms.join(", "),
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
          platforms: platforms,
        },
      };
    });
  }
}
