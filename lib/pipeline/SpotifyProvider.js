// lib/pipeline/SpotifyProvider.js
// Fetches trending music from Spotify API.
// Needs: SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET in Vercel env vars.

import { BaseProvider } from './BaseProvider.js';
import { getEnvCredential, toSlug } from '../helpers.js';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_BASE      = 'https://api.spotify.com/v1';

async function getAccessToken() {
  const clientId     = getEnvCredential('SPOTIFY_CLIENT_ID');
  const clientSecret = getEnvCredential('SPOTIFY_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set');

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`Spotify token error: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export class SpotifyProvider extends BaseProvider {
  constructor(options = {}) {
    super('Spotify');
    this.limit = options.limit || 40;
  }

  async fetch() {
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const all = [];
    const seen = new Set();

    // Featured playlists — always trending
    const playlistRes = await fetch(
      `${SPOTIFY_BASE}/browse/featured-playlists?limit=10&country=US`,
      { headers }
    );

    // New releases
    const newRes = await fetch(
      `${SPOTIFY_BASE}/browse/new-releases?limit=20&country=US`,
      { headers }
    );

    if (newRes.ok) {
      const data = await newRes.json();
      const albums = data?.albums?.items || [];
      for (const album of albums) {
        if (!seen.has(album.id)) {
          seen.add(album.id);
          all.push({ ...album, _itemType: 'album' });
        }
      }
    }

    // Top tracks via categories
    const catRes = await fetch(
      `${SPOTIFY_BASE}/browse/categories?limit=5&country=US`,
      { headers }
    );

    console.log(`[Pipeline:Spotify] Fetched ${all.length} music items`);
    return all.slice(0, this.limit);
  }

  transform(items) {
    return items.map(item => {
      const artists = item.artists?.map(a => a.name).join(', ') || '';
      const name    = item.name;
      const slug    = toSlug(`${name} ${artists} spotify ${item.id}`.slice(0, 80));
      const image   = item.images?.[0]?.url || null;

      return {
        slug,
        name,
        short_desc:   artists ? `${item.album_type || 'Album'} by ${artists}` : item.album_type || 'Album',
        long_desc:    artists ? `${name} by ${artists}. Released ${item.release_date || 'recently'}.` : name,
        category_id:  'music',
        type:         item.album_type || 'album',
        image,
        year:         item.release_date ? parseInt(item.release_date.slice(0, 4)) : new Date().getFullYear(),
        rating:       null,
        rating_count: item.popularity || 0,
        author:       artists,
        tags:         ['spotify', 'music', item.album_type || 'album'].filter(Boolean).slice(0, 8),
        vibe_tags:    [],
        spotify_id:   item.id,
        affiliate_link: item.external_urls?.spotify || null,
        source_url:   item.external_urls?.spotify || null,
        source_id:    item.id,
        source_name:  'spotify',
        trending:     true,
        approved:     true,
      };
    });
  }
}
