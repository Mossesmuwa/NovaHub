// lib/pipeline/WikipediaEnricher.js
// Enriches existing items with Wikipedia summaries.
// No API key needed — Wikipedia REST API is free and open.

import { supabaseAdmin } from '../supabaseAdmin.js';

const WIKI_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary';

async function fetchSummary(title) {
  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const res = await fetch(`${WIKI_BASE}/${encoded}`, {
      headers: { 'User-Agent': 'NovaHub/1.0 (content enrichment)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === 'disambiguation') return null;
    return {
      summary:   data.extract || null,
      image:     data.thumbnail?.source || null,
      wiki_url:  data.content_urls?.desktop?.page || null,
    };
  } catch {
    return null;
  }
}

export async function enrichWithWikipedia() {
  const tag = '[WikipediaEnricher]';
  const stats = { enriched: 0, skipped: 0, errors: [] };

  // Get items with short descriptions that could use enrichment
  const { data: items, error } = await supabaseAdmin
    .from('items')
    .select('id, name, year, type, long_desc, category_id')
    .eq('approved', true)
    .or('long_desc.is.null,long_desc.eq.')
    .in('category_id', ['movies', 'games', 'books', 'music', 'science'])
    .limit(150);

  if (error) {
    console.error(`${tag} Fetch error:`, error.message);
    return { enriched: 0, errors: [error.message] };
  }

  console.log(`${tag} Enriching ${items.length} items with Wikipedia summaries`);

  for (const item of items) {
    try {
      // Try with year for better disambiguation
      let result = await fetchSummary(
        item.year ? `${item.name} (${item.year} ${item.type})` : item.name
      );

      // Fallback to just the name
      if (!result?.summary) {
        result = await fetchSummary(item.name);
      }

      if (!result?.summary || result.summary.length < 50) {
        stats.skipped++;
        continue;
      }

      const update = {
        long_desc: result.summary,
      };

      // Only update image if item doesn't have one
      if (result.image) {
        const { data: existing } = await supabaseAdmin
          .from('items')
          .select('image')
          .eq('id', item.id)
          .single();
        if (!existing?.image) update.image = result.image;
      }

      const { error: updateErr } = await supabaseAdmin
        .from('items')
        .update(update)
        .eq('id', item.id);

      if (updateErr) {
        stats.errors.push(updateErr.message);
      } else {
        console.log(`${tag} ✓ ${item.name}`);
        stats.enriched++;
      }

      // Wikipedia rate limit — be polite
      await new Promise(r => setTimeout(r, 100));

    } catch (err) {
      stats.errors.push(`${item.name}: ${err.message}`);
    }
  }

  console.log(`${tag} Done — enriched: ${stats.enriched}, skipped: ${stats.skipped}`);
  return stats;
}
