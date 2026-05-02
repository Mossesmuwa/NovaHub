// lib/pipeline/IGDBProvider.js
// Fetches games from IGDB (Twitch's game database).
// Needs: IGDB_CLIENT_ID + IGDB_CLIENT_SECRET in Vercel env vars.
// Get free credentials at: dev.twitch.tv

import { BaseProvider } from './BaseProvider.js';
import { getEnvCredential, toSlug } from '../helpers.js';

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_URL  = 'https://api.igdb.com/v4/games';

let _tokenCache = { token: null, expires: 0 };

async function getToken() {
  if (_tokenCache.token && Date.now() < _tokenCache.expires) return _tokenCache.token;

  const clientId     = getEnvCredential('IGDB_CLIENT_ID');
  const clientSecret = getEnvCredential('IGDB_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('IGDB_CLIENT_ID or IGDB_CLIENT_SECRET not set');

  const res = await fetch(
    `${TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error(`IGDB token error: ${res.status}`);
  const data = await res.json();

  _tokenCache = {
    token:   data.access_token,
    expires: Date.now() + (data.expires_in * 1000) - 60000,
  };
  return _tokenCache.token;
}

// Platform ID → name mapping (IGDB platform IDs)
const PLATFORM_MAP = {
  6:   'PC',
  48:  'PS4',
  167: 'PS5',
  49:  'Xbox One',
  169: 'Xbox Series',
  130: 'Nintendo Switch',
  14:  'Mac',
  3:   'Linux',
  34:  'Android',
  39:  'iOS',
};

// Genre ID → name
const GENRE_MAP = {
  2:  'Point-and-click',
  4:  'Fighting',
  5:  'Shooter',
  7:  'Music',
  8:  'Platform',
  9:  'Puzzle',
  10: 'Racing',
  11: 'Real-time strategy',
  12: 'Role-playing',
  13: 'Simulator',
  14: 'Sport',
  15: 'Strategy',
  16: 'Turn-based strategy',
  24: 'Tactical',
  25: 'Hack and slash',
  26: 'Quiz/Trivia',
  31: 'Adventure',
  32: 'Indie',
  33: 'Arcade',
  34: 'Visual Novel',
  35: 'Card & Board Game',
  36: 'MOBA',
};

export class IGDBProvider extends BaseProvider {
  constructor(options = {}) {
    super('IGDB');
    this.limit = options.limit || 40;
  }

  async fetch() {
    const token    = await getToken();
    const clientId = getEnvCredential('IGDB_CLIENT_ID');
    const all = [];
    const seen = new Set();

    const queries = [
      // Top rated recent games
      `fields id,name,summary,cover.url,first_release_date,rating,rating_count,aggregated_rating,genres,platforms,slug,websites.url,websites.category;
       where rating > 75 & rating_count > 100 & first_release_date > ${Math.floor(Date.now()/1000) - 63072000};
       sort rating desc; limit 20;`,

      // Most popular all time
      `fields id,name,summary,cover.url,first_release_date,rating,rating_count,aggregated_rating,genres,platforms,slug,websites.url,websites.category;
       where rating > 80 & rating_count > 500;
       sort rating_count desc; limit 20;`,
    ];

    for (const body of queries) {
      try {
        const res = await fetch(IGDB_URL, {
          method: 'POST',
          headers: {
            'Client-ID':    clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain',
          },
          body,
        });

        if (!res.ok) {
          console.warn(`[Pipeline:IGDB] ${res.status}`);
          continue;
        }

        const games = await res.json();
        for (const g of games) {
          if (g.id && !seen.has(g.id)) {
            seen.add(g.id);
            all.push(g);
          }
        }
      } catch (err) {
        console.warn(`[Pipeline:IGDB] Query failed:`, err.message);
      }
    }

    console.log(`[Pipeline:IGDB] Fetched ${all.length} games`);
    return all;
  }

  transform(games) {
    return games.map(game => {
      const name  = game.name || 'Unknown';
      const slug  = toSlug(`${name} igdb ${game.id}`);

      // Fix cover URL
      const cover = game.cover?.url
        ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
        : null;

      const genres = (game.genres || [])
        .map(id => GENRE_MAP[id] || null)
        .filter(Boolean);

      const platforms = (game.platforms || [])
        .map(id => PLATFORM_MAP[id] || null)
        .filter(Boolean)
        .slice(0, 4);

      const year = game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : null;

      // IGDB rating is 0-100, convert to 0-10
      const rating = game.rating
        ? parseFloat((game.rating / 10).toFixed(1))
        : null;

      // aggregated_rating is Metacritic equivalent
      const metacritic = game.aggregated_rating
        ? Math.round(game.aggregated_rating)
        : null;

      // Find Steam URL if available
      const steamSite = (game.websites || []).find(w => w.category === 13);
      const steamUrl  = steamSite?.url || null;

      return {
        slug,
        name,
        short_desc:       (game.summary || '').slice(0, 200),
        long_desc:        game.summary || '',
        category_id:      'games',
        type:             'game',
        image:            cover,
        year,
        rating,
        rating_count:     game.rating_count || 0,
        metacritic_score: metacritic,
        genre:            genres.slice(0, 3).join(', '),
        platforms:        platforms.join(', '),
        tags:             ['igdb', 'game', ...genres.map(g => g.toLowerCase())].slice(0, 8),
        vibe_tags:        [],
        affiliate_link:   steamUrl,
        source_url:       `https://www.igdb.com/games/${game.slug || name.toLowerCase().replace(/\s/g, '-')}`,
        source_id:        String(game.id),
        source_name:      'igdb',
        trending:         false,
        approved:         true,
      };
    });
  }
}
