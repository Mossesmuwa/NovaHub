// pages/api/pulse.js
// NovaHub — Nova Pulse Engine
// Runs nightly at 1am UTC via Vercel Cron (see vercel.json).
//
// Formula:
//   raw    = (click_count × 0.2) + (save_count × 0.5) + (view_count × 0.3)
//   decay  = e^(−0.01 × days_since_last_activity)
//   pulse  = raw × decay
//
// This means:
//   - Saves are the strongest signal (0.5) — someone wanted to keep this
//   - Views are meaningful but passive (0.3)
//   - Clicks are engagement but could be curiosity (0.2)
//   - Items with no recent activity decay toward zero over ~70 days
//   - A fresh item with 10 saves beats an old item with 10,000 views

import { createClient } from '@supabase/supabase-js';

// Service role bypasses RLS — required for bulk updates
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Decay function ───────────────────────────────────────────────────────────
// Returns a value between 0 and 1.
// At day 0  → 1.0  (full score)
// At day 70 → 0.5  (half score)
// At day 140 → 0.25 (quarter score)
function decay(daysSinceActivity) {
  return Math.exp(-0.01 * Math.max(0, daysSinceActivity));
}

// ─── Days since a timestamp ───────────────────────────────────────────────────
function daysSince(isoTimestamp) {
  if (!isoTimestamp) return 365; // treat null as very old
  const ms = Date.now() - new Date(isoTimestamp).getTime();
  return Math.max(0, ms / (1000 * 60 * 60 * 24));
}

// ─── Batch processor ──────────────────────────────────────────────────────────
// Processes items in batches of 200 to avoid memory issues at scale
const BATCH_SIZE = 200;

async function processBatch(items) {
  const updates = items.map(item => {
    const raw =
      (item.click_count || 0) * 0.2 +
      (item.save_count  || 0) * 0.5 +
      (item.view_count  || 0) * 0.3;

    // Use the most recent of: last save, last view, creation
    const lastActive = item.last_activity_at || item.created_at;
    const age        = daysSince(lastActive);
    const score      = parseFloat((raw * decay(age)).toFixed(4));

    return { id: item.id, trending_score: score };
  });

  // Upsert all scores in one query
  const { error } = await supabase
    .from('items')
    .upsert(updates, { onConflict: 'id' });

  if (error) throw error;
  return updates.length;
}

// ─── Mark top-N as trending ───────────────────────────────────────────────────
// After scores are written, flip the `trending` boolean on the top 20
async function markTrending() {
  // Get top 20 by score
  const { data: topItems, error: fetchErr } = await supabase
    .from('items')
    .select('id')
    .eq('approved', true)
    .order('trending_score', { ascending: false })
    .limit(20);

  if (fetchErr) throw fetchErr;
  const topIds = (topItems || []).map(i => i.id);

  // Clear all trending flags
  await supabase.from('items').update({ trending: false }).neq('id', 'none');

  // Set trending on top items
  if (topIds.length > 0) {
    await supabase.from('items').update({ trending: true }).in('id', topIds);
  }

  return topIds.length;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Verify Vercel Cron auth
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' });
  }

  const started = Date.now();
  let   totalProcessed = 0;
  let   page           = 0;

  try {
    // Stream through all items in pages
    while (true) {
      const { data: items, error } = await supabase
        .from('items')
        .select('id, click_count, save_count, view_count, created_at, last_activity_at')
        .eq('approved', true)
        .range(page * BATCH_SIZE, (page + 1) * BATCH_SIZE - 1);

      if (error) throw error;
      if (!items || items.length === 0) break;

      await processBatch(items);
      totalProcessed += items.length;
      page++;

      // Safety: stop after 10k items (scale up later)
      if (totalProcessed >= 10000) break;
    }

    // Mark top trending items
    const trendingCount = await markTrending();

    const duration = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`[pulse] Done — ${totalProcessed} items scored, ${trendingCount} marked trending in ${duration}s`);

    return res.status(200).json({
      success:    true,
      processed:  totalProcessed,
      trending:   trendingCount,
      duration_s: parseFloat(duration),
    });

  } catch (err) {
    console.error('[pulse] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
