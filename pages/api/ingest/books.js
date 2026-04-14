// pages/api/ingest/books.js
// NovaHub — Google Books Auto-Ingestion Cron
// Runs daily at 4am UTC. Pulls curated subject lists.
// Google Books API is free, no key required for basic queries
// (but add GOOGLE_BOOKS_API_KEY to Vercel env for higher quota).

import { createClient } from '@supabase/supabase-js';

const BOOKS_BASE = 'https://www.googleapis.com/books/v1';
const BATCH_SIZE = 15;

// Subjects to pull — curated to match NovaHub's audience
const SUBJECTS = [
  'artificial intelligence',
  'cybersecurity hacking',
  'startup entrepreneurship',
  'psychology behavior',
  'science technology',
  'productivity systems',
  'game design',
  'philosophy mind',
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function bookToItem(vol) {
  const info    = vol.volumeInfo || {};
  const name    = info.title || 'Unknown Title';
  const authors = (info.authors || []).join(', ');
  const cover   = info.imageLinks?.thumbnail?.replace('http://', 'https://') || null;

  return {
    slug:        slugify(name) + '-book-' + vol.id,
    name,
    short_desc:  (info.description || '').slice(0, 200),
    long_desc:   info.description  || '',
    category_id: 'books',
    type:        'book',
    image:       cover,
    year:        info.publishedDate ? parseInt(info.publishedDate.split('-')[0]) : null,
    rating:      info.averageRating ? parseFloat(info.averageRating.toFixed(1)) : null,
    rating_count: info.ratingsCount || 0,
    author:      authors,
    genre:       (info.categories || []).join(', '),
    tags:        ['google-books', 'book', ...(info.categories || []).map(c => slugify(c))].slice(0, 8),
    vibe_tags:   [],
    source_url:  info.infoLink || `https://books.google.com/books?id=${vol.id}`,
    source_id:   vol.id,
    source_name: 'google-books',
    affiliate_link: info.buyLink || null,
    trending:    false,
    approved:    true,
  };
}

async function fetchSubject(subject) {
  const key = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : '';
  const url = `${BOOKS_BASE}/volumes?q=subject:${encodeURIComponent(subject)}&orderBy=relevance&maxResults=${BATCH_SIZE}&printType=books&langRestrict=en${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Books API error: ${res.status}`);
  const data = await res.json();
  return (data.items || []).filter(v => v.volumeInfo?.title && v.volumeInfo?.description);
}

async function upsertItems(items) {
  const { error } = await supabase
    .from('items')
    .upsert(items, { onConflict: 'source_id,source_name', ignoreDuplicates: false });
  if (error) throw error;
  return items.length;
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return res.status(401).json({ error: 'Unauthorized' });

  const results = { total: 0, subjects: {}, errors: [] };

  // Rotate subjects — do 2 per run to avoid quota limits
  const dayIndex   = new Date().getDate() % Math.ceil(SUBJECTS.length / 2);
  const todayBatch = SUBJECTS.slice(dayIndex * 2, dayIndex * 2 + 2);

  for (const subject of todayBatch) {
    try {
      const volumes = await fetchSubject(subject);
      const items   = volumes.map(bookToItem);
      if (items.length) {
        const count = await upsertItems(items);
        results.subjects[subject] = count;
        results.total += count;
      }
    } catch (err) {
      results.errors.push(`${subject}: ${err.message}`);
    }
  }

  console.log('[ingest/books]', results);
  return res.status(200).json({ success: true, ...results });
}
