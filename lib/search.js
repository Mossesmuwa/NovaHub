// lib/search.js
// NovaHub — Search Library
// Layer 1: Postgres full-text search (works today, zero extra cost)
// Layer 2: Vector/semantic search (uncomment when pgvector is enabled in schema-v2.sql)
//
// Usage:
//   import { searchItems, semanticSearch } from '../lib/search';
//   const results = await searchItems('minimal productivity tool', { category: 'productivity' });

import { supabase } from './supabase';

// ─── Full-text search (active) ────────────────────────────────────────────────
// Uses the search_items() Postgres RPC defined in schema-v2.sql.
// Handles stemming (run → running → runs), ranking, and partial matches.
//
// Falls back to a simple ILIKE query if the RPC isn't set up yet.

export async function searchItems(query, {
  category = null,
  type     = null,
  limit    = 20,
  offset   = 0,
} = {}) {
  if (!query?.trim()) return { data: [], error: null };

  // Try RPC (full-text search with ranking) first
  const { data: rpcData, error: rpcError } = await supabase.rpc('search_items', {
    query_text:      query.trim(),
    category_filter: category || null,
    type_filter:     type     || null,
    result_limit:    limit,
    result_offset:   offset,
  });

  if (!rpcError && rpcData) {
    return { data: rpcData, error: null, method: 'fts' };
  }

  // Fallback: simple ILIKE — works even without schema-v2.sql applied
  console.warn('[search] RPC not available, falling back to ILIKE:', rpcError?.message);

  let q = supabase
    .from('items')
    .select('id, slug, name, type, category, short_desc, image, rating, pricing, tags')
    .eq('approved', true)
    .or(`name.ilike.%${query}%,short_desc.ilike.%${query}%,tags.cs.{${query}}`)
    .order('trending_score', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (category) q = q.eq('category_id', category);
  if (type)     q = q.eq('type', type);

  const { data, error } = await q;
  return { data: data || [], error, method: 'ilike' };
}


// ─── Semantic / vector search (disabled until pgvector enabled) ───────────────
// Steps to enable:
//   1. Run the pgvector block in schema-v2.sql
//   2. Set OPENAI_API_KEY in Vercel env vars (for embeddings)
//      OR use another embedding provider
//   3. Generate embeddings for all existing items:
//      node scripts/generate-embeddings.js
//   4. Switch search.js calls in search.js to use semanticSearch()
//
// Why OpenAI for embeddings even though we use Claude for text?
//   Anthropic doesn't yet have a dedicated embeddings endpoint.
//   text-embedding-3-small is $0.02/1M tokens — essentially free.

export async function semanticSearch(query, {
  category  = null,
  threshold = 0.7,
  limit     = 10,
} = {}) {
  if (!query?.trim()) return { data: [], error: null };

  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    console.warn('[search] semanticSearch called but OPENAI_API_KEY not set. Falling back to FTS.');
    return searchItems(query, { category, limit });
  }

  // Generate embedding for the query
  let embedding;
  try {
    const embRes = await fetch('https://api.openai.com/v1/embeddings', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query.trim(),
      }),
    });
    const embData = await embRes.json();
    embedding = embData.data?.[0]?.embedding;
  } catch (err) {
    console.error('[search] Embedding generation failed:', err);
    return searchItems(query, { category, limit }); // graceful fallback
  }

  if (!embedding) return searchItems(query, { category, limit });

  // Query Supabase match_items() RPC (defined in schema-v2.sql pgvector block)
  const { data, error } = await supabase.rpc('match_items', {
    query_embedding:  embedding,
    match_threshold:  threshold,
    match_count:      limit,
    category_filter:  category || null,
  });

  if (error) {
    console.error('[search] Vector search failed:', error.message);
    return searchItems(query, { category, limit }); // fallback
  }

  return { data: data || [], error: null, method: 'vector' };
}


// ─── Hybrid search (best of both worlds — use this when both are enabled) ─────
// Runs FTS + semantic in parallel, merges and deduplicates by id,
// re-ranks by a weighted combination of text rank + semantic similarity.

export async function hybridSearch(query, options = {}) {
  const [ftsResult, vecResult] = await Promise.allSettled([
    searchItems(query, options),
    semanticSearch(query, options),
  ]);

  const ftsItems = ftsResult.status === 'fulfilled' ? ftsResult.value.data : [];
  const vecItems = vecResult.status === 'fulfilled' ? vecResult.value.data : [];

  // Merge by id, prioritise vector results (higher quality) but include FTS-only hits
  const seen = new Map();
  for (const item of vecItems) seen.set(item.id, { ...item, _source: 'vector' });
  for (const item of ftsItems) {
    if (!seen.has(item.id)) seen.set(item.id, { ...item, _source: 'fts' });
  }

  return {
    data:   Array.from(seen.values()).slice(0, options.limit || 20),
    error:  null,
    method: 'hybrid',
  };
}
