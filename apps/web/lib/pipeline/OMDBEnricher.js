// lib/pipeline/OMDBEnricher.js
// NovaHub — OMDB Enrichment
// Fetches IMDB, Rotten Tomatoes, and Metacritic scores for existing movies.
// Runs against all approved movies in the DB that don't have imdb_rating yet.

import { supabaseAdmin } from '../supabaseAdmin.js';

const OMDB_BASE = 'https://www.omdbapi.com';

async function fetchOMDB(params) {
  const key = process.env.OMDB_API_KEY;
  if (!key) throw new Error('OMDB_API_KEY not set');

  const url = new URL(OMDB_BASE);
  url.searchParams.set('apikey', key);
  url.searchParams.set('r', 'json');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OMDB API error: ${res.status}`);
  const data = await res.json();
  if (data.Response === 'False') return null;
  return data;
}

function parseRating(str) {
  if (!str || str === 'N/A') return null;
  const n = parseFloat(str.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

function parseRT(ratings = []) {
  const rt = ratings.find(r => r.Source === 'Rotten Tomatoes');
  if (!rt) return null;
  return parseInt(rt.Value.replace('%', '')) || null;
}

function parseMetacritic(str) {
  if (!str || str === 'N/A') return null;
  return parseInt(str.split('/')[0]) || null;
}

export async function enrichMovies() {
  const tag = '[OMDBEnricher]';
  const stats = { enriched: 0, skipped: 0, notFound: 0, errors: [] };

  // Fetch movies that don't have imdb_rating yet
  const { data: movies, error } = await supabaseAdmin
    .from('items')
    .select('id, name, year, imdb_id')
    .eq('approved', true)
    .in('category_id', ['movies'])
    .is('imdb_rating', null)
    .limit(200); // stay within 1000/day free limit

  if (error) {
    console.error(`${tag} Failed to fetch movies:`, error.message);
    return { enriched: 0, errors: [error.message] };
  }

  console.log(`${tag} Found ${movies.length} movies to enrich`);

  for (const movie of movies) {
    try {
      let data = null;

      // Try by IMDB ID first (most accurate)
      if (movie.imdb_id) {
        data = await fetchOMDB({ i: movie.imdb_id, plot: 'short' });
      }

      // Fall back to title + year search
      if (!data && movie.name) {
        data = await fetchOMDB({
          t: movie.name,
          ...(movie.year ? { y: movie.year } : {}),
          type: 'movie',
        });

        // Try without year if not found
        if (!data && movie.year) {
          data = await fetchOMDB({ t: movie.name, type: 'movie' });
        }

        // Try TV type
        if (!data) {
          data = await fetchOMDB({ t: movie.name, type: 'series' });
        }
      }

      if (!data) {
        console.log(`${tag} Not found: ${movie.name}`);
        stats.notFound++;
        continue;
      }

      const update = {
        imdb_rating:      parseRating(data.imdbRating),
        rt_score:         parseRT(data.Ratings),
        metacritic_score: parseMetacritic(data.Metascore),
        imdb_id:          data.imdbID || movie.imdb_id || null,
      };

      // Only update if we got at least one score
      if (!update.imdb_rating && !update.rt_score && !update.metacritic_score) {
        stats.skipped++;
        continue;
      }

      const { error: updateErr } = await supabaseAdmin
        .from('items')
        .update(update)
        .eq('id', movie.id);

      if (updateErr) {
        console.error(`${tag} Update failed for ${movie.name}:`, updateErr.message);
        stats.errors.push(updateErr.message);
      } else {
        console.log(`${tag} ✓ ${movie.name} — IMDB: ${update.imdb_rating} RT: ${update.rt_score}% MC: ${update.metacritic_score}`);
        stats.enriched++;
      }

      // Rate limit — OMDB free tier is 1000/day, be safe
      await new Promise(r => setTimeout(r, 150));

    } catch (err) {
      console.error(`${tag} Error on ${movie.name}:`, err.message);
      stats.errors.push(`${movie.name}: ${err.message}`);
    }
  }

  console.log(`${tag} Done — enriched: ${stats.enriched}, not found: ${stats.notFound}, skipped: ${stats.skipped}`);
  return stats;
}
