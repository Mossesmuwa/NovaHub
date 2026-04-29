// lib/nova-pulse.js
// NovaHub — Nova Pulse Engine
// Calculates trending_score for every approved item in the database.
// Runs server-side only (Supabase admin client).
//
// Formula:
//   score = (saves × 3 + clicks × 1 + views × 0.5) × recency_decay
//
// recency_decay = e^(-λ × days_since_activity)
//   λ = 0.05 → half-life ≈ 14 days
//   Items with no activity decay to near-zero over ~2 months.
//
// Called by: pages/api/pulse.js (Vercel Cron, runs every 6 hours)

import { supabaseAdmin } from "./supabaseAdmin.js";

const LAMBDA = 0.05; // decay constant

/**
 * Calculate recency decay multiplier.
 * @param {string|null} lastActivity — ISO timestamp of last activity
 * @returns {number} 0.01–1.0
 */
function recencyDecay(lastActivity) {
  if (!lastActivity) return 0.1; // no activity = low score
  const daysSince = (Date.now() - new Date(lastActivity).getTime()) / 86400000;
  return Math.max(0.01, Math.exp(-LAMBDA * daysSince));
}

/**
 * Calculate raw engagement score for an item.
 * @param {Object} item
 * @returns {number}
 */
function engagementScore(item) {
  const saves = (item.save_count || 0) * 3;
  const clicks = (item.click_count || 0) * 1;
  const views = (item.view_count || 0) * 0.5;
  return saves + clicks + views;
}

/**
 * Calculate final trending score for one item.
 * @param {Object} item
 * @returns {number} rounded to 4 decimal places
 */
export function calcTrendingScore(item) {
  const engagement = engagementScore(item);
  const decay = recencyDecay(item.last_activity_at);
  const score = engagement * decay;
  return parseFloat(score.toFixed(4));
}

/**
 * Run Nova Pulse — recalculate trending_score for all approved items.
 * Uses batched updates to avoid Supabase payload limits.
 *
 * @returns {Promise<{ updated: number, errors: string[] }>}
 */
export async function runNovaPulse() {
  const tag = "[NovaPulse]";
  const stats = { updated: 0, errors: [] };

  console.log(`${tag} Starting pulse calculation...`);

  // Fetch all approved items with engagement columns
  const { data: items, error: fetchErr } = await supabaseAdmin
    .from("items")
    .select("id, save_count, click_count, view_count, last_activity_at")
    .eq("approved", true);

  if (fetchErr) {
    console.error(`${tag} Failed to fetch items:`, fetchErr.message);
    return { updated: 0, errors: [fetchErr.message] };
  }

  console.log(`${tag} Calculating scores for ${items.length} items...`);

  // Build update payloads
  const updates = items.map((item) => ({
    id: item.id,
    trending_score: calcTrendingScore(item),
  }));

  // Update in batches of 100
  const BATCH = 100;
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);

    try {
      const { error } = await supabaseAdmin
        .from("items")
        .upsert(batch, { onConflict: "id" });

      if (error) throw error;
      stats.updated += batch.length;
    } catch (err) {
      console.error(`${tag} Batch update failed:`, err.message);
      stats.errors.push(err.message);
    }
  }

  console.log(
    `${tag} Pulse complete — updated: ${stats.updated}, errors: ${stats.errors.length}`,
  );
  return stats;
}

/**
 * Get top trending items from DB (already scored).
 * Used by the trending feed — reads pre-computed scores, doesn't recalculate.
 *
 * @param {Object} [opts]
 * @param {number} [opts.limit=20]
 * @param {string} [opts.category] — filter by category_id
 * @returns {Promise<Array>}
 */
export async function getTrendingItems({ limit = 20, category } = {}) {
  let query = supabaseAdmin
    .from("items")
    .select("*")
    .eq("approved", true)
    .order("trending_score", { ascending: false })
    .limit(limit);

  if (category) query = query.eq("category_id", category);

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}
