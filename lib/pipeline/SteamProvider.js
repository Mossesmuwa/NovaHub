// lib/pipeline/SteamProvider.js
// Fetches top Steam games — no API key required for public data.

import { BaseProvider } from './BaseProvider.js';
import { toSlug } from '../helpers.js';

export class SteamProvider extends BaseProvider {
  constructor(options = {}) {
    super('Steam');
    this.limit = options.limit || 40;
  }

  async fetch() {
    // Steam top sellers — public endpoint, no key needed
    const endpoints = [
      'https://store.steampowered.com/api/featuredcategories?cc=us&l=en',
    ];

    // Use Steam charts for trending — public JSON
    const trendingRes = await fetch(
      'https://steamspy.com/api.php?request=top100in2weeks'
    );

    if (!trendingRes.ok) {
      throw new Error(`Steam API error: ${trendingRes.status}`);
    }

    const data = await trendingRes.json();
    const games = Object.values(data).slice(0, this.limit);
    console.log(`[Pipeline:Steam] Fetched ${games.length} games`);
    return games;
  }

  transform(rawGames) {
    return rawGames
      .filter(g => g.name && g.appid)
      .map(game => {
        const slug = toSlug(`${game.name} steam ${game.appid}`);
        const tags = ['steam', 'game', 'pc'];
        if (game.genre) tags.push(...game.genre.toLowerCase().split(',').map(g => g.trim()));

        return {
          slug,
          name:         game.name,
          short_desc:   game.genre ? `${game.genre} · ${game.positive?.toLocaleString() || 0} positive reviews` : '',
          long_desc:    '',
          category_id:  'games',
          type:         'game',
          image:        `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
          year:         null,
          rating:       game.positive && game.negative
            ? parseFloat(((game.positive / (game.positive + game.negative)) * 10).toFixed(1))
            : null,
          rating_count: (game.positive || 0) + (game.negative || 0),
          steam_id:     String(game.appid),
          tags:         tags.slice(0, 8),
          vibe_tags:    [],
          affiliate_link: `https://store.steampowered.com/app/${game.appid}`,
          source_url:   `https://store.steampowered.com/app/${game.appid}`,
          source_id:    String(game.appid),
          source_name:  'steam',
          pricing:      game.price === 0 ? 'Free' : 'Paid',
          trending:     true,
          approved:     true,
        };
      });
  }
}
