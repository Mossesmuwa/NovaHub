// pages/api/ingest/tmdb.js
// NovaHub — TMDB Auto-Ingestion Cron
// Runs daily at 2am UTC via Vercel Cron (see vercel.json)
// Pulls trending movies + TV and upserts into Supabase items table.
//
// Setup:
//   1. Get free API key at https://www.themoviedb.org/settings/api
//   2. Add TMDB_API_KEY to Vercel env vars
//   3. Add CRON_SECRET to Vercel env vars (any random string)

const TMDB_BASE  = 'https://api.themoviedb.org/3';
const TMDB_IMG   = 'https://image.tmdb.org/t/p/w500';
const BATCH_SIZE = 20; // items per run (stay within free tier limits)

import { createClient } from '@supabase/supabase-js';

// Use service role key for ingestion (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Slugify a name ───────────────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ─── Fetch from TMDB ──────────────────────────────────────────────────────────
async function tmdbFetch(path) {
  const url = `${TMDB_BASE}${path}?api_key=${process.env.TMDB_API_KEY}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status} ${path}`);
  return res.json();
}

// ─── Map TMDB movie → NovaHub item ───────────────────────────────────────────
function movieToItem(m) {
  const name = m.title || m.original_title;
  return {
    slug:        slugify(name) + '-' + m.id,
    name,
    short_desc:  (m.overview || '').slice(0, 200),
    long_desc:   m.overview || '',
    category_id: 'movies',
    type:        'movie',
    image:       m.poster_path  ? TMDB_IMG + m.poster_path  : null,
    year:        m.release_date ? parseInt(m.release_date.split('-')[0]) : null,
    rating:      m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : null,
    rating_count: m.vote_count  || 0,
    genre:       '', // populated below from genre_ids if needed
    tags:        ['tmdb', 'movie'],
    vibe_tags:   [],
    source_url:  `https://www.themoviedb.org/movie/${m.id}`,
    source_id:   String(m.id),
    source_name: 'tmdb',
    trending:    true,
    approved:    true,
  };
}

// ─── Map TMDB TV show → NovaHub item ──────────────────────────────────────────
function tvToItem(t) {
  const name = t.name || t.original_name;
  return {
    slug:        slugify(name) + '-tv-' + t.id,
    name,
    short_desc:  (t.overview || '').slice(0, 200),
    long_desc:   t.overview || '',
    category_id: 'movies',
    type:        'tv',
    image:       t.poster_path ? TMDB_IMG + t.poster_path : null,
    year:        t.first_air_date ? parseInt(t.first_air_date.split('-')[0]) : null,
    rating:      t.vote_average ? parseFloat(t.vote_average.toFixed(1)) : null,
    rating_count: t.vote_count || 0,
    tags:        ['tmdb', 'tv-show'],
    vibe_tags:   [],
    source_url:  `https://www.themoviedb.org/tv/${t.id}`,
    source_id:   String(t.id),
    source_name: 'tmdb',
    trending:    true,
    approved:    true,
  };
}

// ─── Upsert items into Supabase ───────────────────────────────────────────────
async function upsertItems(items) {
  const { data, error } = await supabase
    .from('items')
    .upsert(items, { onConflict: 'source_id,source_name', ignoreDuplicates: false });
  if (error) throw error;
  return data?.length || items.length;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Verify this is a legitimate cron call from Vercel
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.TMDB_API_KEY) {
    return res.status(500).json({ error: 'TMDB_API_KEY not set' });
  }

  const results = { movies: 0, tv: 0, errors: [] };

  try {
    // Trending movies (week)
    const movieData = await tmdbFetch('/trending/movie/week');
    const movies    = (movieData.results || []).slice(0, BATCH_SIZE).map(movieToItem);
    if (movies.length) results.movies = await upsertItems(movies);
  } catch (err) {
    results.errors.push(`Movies: ${err.message}`);
  }

  try {
    // Trending TV (week)
    const tvData = await tmdbFetch('/trending/tv/week');
    const shows  = (tvData.results || []).slice(0, BATCH_SIZE).map(tvToItem);
    if (shows.length) results.tv = await upsertItems(shows);
  } catch (err) {
    results.errors.push(`TV: ${err.message}`);
  }

  console.log('[ingest/tmdb]', results);
  return res.status(200).json({ success: true, ...results });
}
