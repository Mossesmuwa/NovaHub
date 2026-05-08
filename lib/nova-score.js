// lib/nova-score.js
// NovaHub — NovaScore Engine
// Calculates a personalised match percentage (0–100) between an item
// and a user's taste profile (from localStorage nova_taste or Supabase profile).
//
// This is a// lib/nova-score.js - Nova Score™ Algorithm
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Nova Score™ Algorithm
 * 
 * Calculates a 0-100 score based on:
 * - External Ratings (30%): IMDb, GitHub stars, RT, Metacritic, etc.
 * - Community Engagement (25%): Saves, views, shares
 * - Momentum (25%): Recent growth, trending velocity
 * - Source Credibility (20%): Official sources, verification
 * 
 * Returns: { score: number, breakdown: object, confidence: number }
 */

/**
 * Calculate Nova Score for an item
 */
export async function calculateNovaScore(itemId) {
  try {
    // Get item with all metadata
    const { data: item, error } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error || !item) {
      throw new Error('Item not found');
    }

    // Calculate each component
    const external = calculateExternalScore(item);
    const community = calculateCommunityScore(item);
    const momentum = await calculateMomentumScore(item);
    const credibility = calculateCredibilityScore(item);

    // Weighted average
    const totalScore = Math.round(
      external.score * 0.30 +
      community.score * 0.25 +
      momentum.score * 0.25 +
      credibility.score * 0.20
    );

    // Calculate confidence (how much data we have)
    const confidence = Math.round(
      (external.confidence + community.confidence + momentum.confidence + credibility.confidence) / 4
    );

    const breakdown = {
      external: external.score,
      community: community.score,
      momentum: momentum.score,
      credibility: credibility.score,
    };

    const details = {
      external: external.details,
      community: community.details,
      momentum: momentum.details,
      credibility: credibility.details,
    };

    // Store in history
    await supabaseAdmin.from('nova_score_history').insert({
      item_id: itemId,
      score: totalScore,
      external_rating_score: external.score,
      community_score: community.score,
      momentum_score: momentum.score,
      credibility_score: credibility.score,
      github_stars: item.metadata?.github_stars || null,
      hn_points: item.metadata?.hn_points || null,
      reddit_upvotes: item.metadata?.reddit_upvotes || null,
      save_count: item.save_count || 0,
      view_count: item.view_count || 0,
    });

    return {
      score: totalScore,
      breakdown,
      details,
      confidence,
    };
  } catch (err) {
    console.error('Nova Score calculation error:', err);
    throw err;
  }
}

/**
 * External Ratings Score (0-100)
 * Sources: IMDb, RT, Metacritic, GitHub stars, Product Hunt upvotes, etc.
 */
function calculateExternalScore(item) {
  let total = 0;
  let count = 0;
  let confidence = 0;
  const details = {};

  const metadata = item.metadata || {};

  // IMDb rating (0-10 → 0-100)
  if (item.imdb_rating) {
    total += item.imdb_rating * 10;
    count++;
    confidence += 25;
    details.imdb = item.imdb_rating * 10;
  }

  // Rotten Tomatoes (0-100)
  if (metadata.rt_score) {
    total += metadata.rt_score;
    count++;
    confidence += 25;
    details.rottenTomatoes = metadata.rt_score;
  }

  // Metacritic (0-100)
  if (metadata.metacritic) {
    total += metadata.metacritic;
    count++;
    confidence += 25;
    details.metacritic = metadata.metacritic;
  }

  // GitHub stars (logarithmic scale to 100)
  if (metadata.github_stars) {
    const starScore = Math.min(100, Math.log10(metadata.github_stars + 1) * 20);
    total += starScore;
    count++;
    confidence += 20;
    details.github = Math.round(starScore);
  }

  // Product Hunt upvotes (logarithmic)
  if (metadata.ph_upvotes) {
    const phScore = Math.min(100, Math.log10(metadata.ph_upvotes + 1) * 25);
    total += phScore;
    count++;
    confidence += 20;
    details.productHunt = Math.round(phScore);
  }

  // HackerNews points (logarithmic)
  if (metadata.hn_points) {
    const hnScore = Math.min(100, Math.log10(metadata.hn_points + 1) * 30);
    total += hnScore;
    count++;
    confidence += 15;
    details.hackerNews = Math.round(hnScore);
  }

  // Reddit upvotes (logarithmic)
  if (metadata.reddit_upvotes) {
    const redditScore = Math.min(100, Math.log10(metadata.reddit_upvotes + 1) * 25);
    total += redditScore;
    count++;
    confidence += 15;
    details.reddit = Math.round(redditScore);
  }

  // Steam reviews (percentage positive)
  if (metadata.steam_positive_percent) {
    total += metadata.steam_positive_percent;
    count++;
    confidence += 20;
    details.steam = metadata.steam_positive_percent;
  }

  const score = count > 0 ? Math.round(total / count) : 50; // Default to 50 if no data
  confidence = Math.min(100, confidence);

  return { score, confidence, details };
}

/**
 * Community Engagement Score (0-100)
 * Based on saves, views, shares, comments
 */
function calculateCommunityScore(item) {
  let total = 0;
  let count = 0;
  let confidence = 0;
  const details = {};

  // Saves (logarithmic scale)
  if (item.save_count > 0) {
    const saveScore = Math.min(100, Math.log10(item.save_count + 1) * 40);
    total += saveScore;
    count++;
    confidence += 30;
    details.saves = item.save_count;
  }

  // Views (logarithmic scale)
  if (item.view_count > 0) {
    const viewScore = Math.min(100, Math.log10(item.view_count + 1) * 25);
    total += viewScore;
    count++;
    confidence += 25;
    details.views = item.view_count;
  }

  // Click-through rate (views to clicks)
  if (item.view_count > 0 && item.click_count > 0) {
    const ctr = (item.click_count / item.view_count) * 100;
    const ctrScore = Math.min(100, ctr * 20);
    total += ctrScore;
    count++;
    confidence += 20;
    details.clickThroughRate = ctr.toFixed(1) + '%';
  }

  // Featured/Daily pick bonus
  if (item.featured || item.daily_pick) {
    total += 80;
    count++;
    confidence += 25;
    details.editorial = 'Featured';
  }

  const score = count > 0 ? Math.round(total / count) : 30; // Lower default for new items
  confidence = Math.min(100, confidence);

  return { score, confidence, details };
}

/**
 * Momentum Score (0-100)
 * Tracks growth velocity and trending status
 */
async function calculateMomentumScore(item) {
  let total = 0;
  let count = 0;
  let confidence = 0;
  const details = {};

  // Trending flag (manual or algorithmic)
  if (item.trending) {
    total += 85;
    count++;
    confidence += 40;
    details.trending = true;
  }

  // Recent activity (created in last 30 days)
  const daysOld = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld <= 30) {
    const recencyScore = Math.max(50, 100 - (daysOld * 2)); // Newer = higher
    total += recencyScore;
    count++;
    confidence += 30;
    details.daysOld = Math.round(daysOld);
  }

  // Check historical growth from nova_score_history
  try {
    const { data: history } = await supabaseAdmin
      .from('nova_score_history')
      .select('save_count, view_count, computed_at')
      .eq('item_id', item.id)
      .order('computed_at', { ascending: false })
      .limit(10);

    if (history && history.length >= 2) {
      const latest = history[0];
      const weekAgo = history[Math.min(7, history.length - 1)];

      // Save growth
      const saveGrowth = latest.save_count - weekAgo.save_count;
      if (saveGrowth > 0) {
        const saveGrowthScore = Math.min(100, saveGrowth * 10);
        total += saveGrowthScore;
        count++;
        confidence += 20;
        details.saveGrowth = `+${saveGrowth}`;
      }

      // View growth
      const viewGrowth = latest.view_count - weekAgo.view_count;
      if (viewGrowth > 0) {
        const viewGrowthScore = Math.min(100, Math.log10(viewGrowth + 1) * 20);
        total += viewGrowthScore;
        count++;
        confidence += 10;
        details.viewGrowth = `+${viewGrowth}`;
      }
    }
  } catch (err) {
    console.error('Momentum history error:', err);
  }

  const score = count > 0 ? Math.round(total / count) : 50;
  confidence = Math.min(100, confidence);

  return { score, confidence, details };
}

/**
 * Source Credibility Score (0-100)
 * Based on data source quality and verification
 */
function calculateCredibilityScore(item) {
  let total = 0;
  let count = 0;
  let confidence = 100; // We can always assess credibility
  const details = {};

  // Primary source credibility
  const officialSources = ['tmdb', 'github', 'producthunt', 'steam', 'spotify', 'nyt'];
  const isOfficial = officialSources.includes(item.source_name);
  
  if (isOfficial) {
    total += 90;
    details.sourceType = 'Official';
  } else {
    total += 60;
    details.sourceType = 'Community';
  }
  count++;

  // Has verified links
  if (item.source_url) {
    total += 80;
    count++;
    details.verifiedLink = true;
  }

  // Has rich metadata
  const metadataFields = Object.keys(item.metadata || {}).length;
  if (metadataFields > 5) {
    total += 85;
    count++;
    details.metadataFields = metadataFields;
  } else if (metadataFields > 0) {
    total += 60;
    count++;
    details.metadataFields = metadataFields;
  }

  // Has quality metrics
  try {
    const hasQualityMetrics = item.quality_score !== undefined;
    if (hasQualityMetrics && item.quality_score > 70) {
      total += 80;
      count++;
      details.qualityScore = item.quality_score;
    }
  } catch (err) {
    // Quality metrics not available
  }

  const score = count > 0 ? Math.round(total / count) : 70;

  return { score, confidence, details };
}

/**
 * Bulk calculate Nova Scores for multiple items
 */
export async function calculateBulkScores(itemIds) {
  const results = [];
  
  for (const itemId of itemIds) {
    try {
      const result = await calculateNovaScore(itemId);
      results.push({ itemId, ...result });
    } catch (err) {
      console.error(`Failed to calculate score for ${itemId}:`, err);
      results.push({ itemId, error: err.message });
    }
  }

  return results;
}

/**
 * Get Nova Score from cache or calculate fresh
 */
export async function getNovaScore(itemId, maxAge = 3600000) {
  try {
    // Check cache
    const { data: cached } = await supabaseAdmin
      .from('nova_score_history')
      .select('*')
      .eq('item_id', itemId)
      .order('computed_at', { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.computed_at).getTime();
      if (age < maxAge) {
        return {
          score: cached.score,
          breakdown: {
            external: cached.external_rating_score,
            community: cached.community_score,
            momentum: cached.momentum_score,
            credibility: cached.credibility_score,
          },
          cached: true,
        };
      }
    }

    // Calculate fresh
    return await calculateNovaScore(itemId);
  } catch (err) {
    console.error('Get Nova Score error:', err);
    return { score: 50, breakdown: {}, error: err.message };
  }
}

/**
 * Update trending_score field based on Nova Score momentum component
 */
export async function updateTrendingScores() {
  try {
    const { data: trendingItems } = await supabaseAdmin
      .from('items')
      .select('id')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(100);

    for (const item of trendingItems || []) {
      const { breakdown } = await calculateNovaScore(item.id);
      
      // Update trending_score field
      await supabaseAdmin
        .from('items')
        .update({ 
          trending_score: breakdown.momentum,
          trending: breakdown.momentum > 75,
        })
        .eq('id', item.id);
    }

    console.log(`Updated trending scores for ${trendingItems?.length || 0} items`);
    return { success: true, count: trendingItems?.length || 0 };
  } catch (err) {
    console.error('Update trending scores error:', err);
    throw err;
  }
}

// Pro feature — free users see the raw rating, Pro users see
// their personal match score. See components/NovaScore.js for the UI.
//
// Usage:
//   import { calcNovaScore } from '../lib/nova-score';
//   const score = calcNovaScore(item, taste);
//   // score: { value: 87, label: 'Strong match', breakdown: {...} }

// ─── Weight config ────────────────────────────────────────────────────────────
// How much each signal contributes to the final score.
// Total must equal 1.0.
const WEIGHTS = {
  category:    0.35, // user's preferred categories
  tags:        0.25, // tag overlap between item and user taste
  loved:       0.20, // item name/slug appears in user's loved list
  mood:        0.10, // item vibe_tags match user's current mood goal
  quality:     0.10, // item's own rating (normalised to 0–1)
};

// ─── Category score ───────────────────────────────────────────────────────────
// 1.0 if item.category is in user's preferred categories, 0 otherwise
function categoryScore(item, taste) {
  const cats = taste?.cats || [];
  if (!cats.length) return 0.5; // no preference = neutral
  return cats.includes(item.category_id || item.category) ? 1.0 : 0.0;
}

// ─── Tag overlap score ────────────────────────────────────────────────────────
// Jaccard-like: intersection / union of item tags and all tags from user's loved items
function tagScore(item, taste) {
  const itemTags = new Set([
    ...(item.tags      || []).map(t => t.toLowerCase()),
    ...(item.vibe_tags || []).map(t => t.toLowerCase()),
  ]);
  if (!itemTags.size) return 0.3;

  // Build a tag universe from the user's loved items (names as crude proxies)
  const lovedWords = new Set(
    (taste?.loved || []).flatMap(name =>
      name.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ')
    ).filter(w => w.length > 3)
  );
  if (!lovedWords.size) return 0.3;

  let overlap = 0;
  for (const tag of itemTags) {
    if (lovedWords.has(tag)) overlap++;
    // Partial: check if any loved word is contained in the tag
    for (const word of lovedWords) {
      if (tag.includes(word) || word.includes(tag)) { overlap += 0.5; break; }
    }
  }

  return Math.min(1.0, overlap / Math.max(itemTags.size, lovedWords.size));
}

// ─── Loved list score ─────────────────────────────────────────────────────────
// 1.0 if this exact item was loved in onboarding, 0 otherwise
function lovedScore(item, taste) {
  const loved = (taste?.loved || []).map(s => s.toLowerCase());
  const name  = (item.name || '').toLowerCase();
  const slug  = (item.slug || '').toLowerCase();
  return loved.some(l => name.includes(l) || slug.includes(l) || l.includes(name)) ? 1.0 : 0.0;
}

// ─── Mood score ───────────────────────────────────────────────────────────────
// Matches item vibe_tags against user's mood goal
const MOOD_TAGS = {
  learn:     ['educational', 'tutorial', 'course', 'book', 'documentary', 'science'],
  entertain: ['fun', 'movie', 'game', 'music', 'creative', 'comedy'],
  tools:     ['tool', 'productivity', 'ai', 'developer', 'automation', 'workflow'],
  explore:   ['niche', 'indie', 'discovery', 'experimental', 'unusual', 'deep-dive'],
};

function moodScore(item, taste) {
  const mood = taste?.mood;
  if (!mood || !MOOD_TAGS[mood]) return 0.5;

  const moodSet  = new Set(MOOD_TAGS[mood]);
  const itemTags = [
    ...(item.tags      || []).map(t => t.toLowerCase()),
    ...(item.vibe_tags || []).map(t => t.toLowerCase()),
    (item.type     || '').toLowerCase(),
    (item.category || '').toLowerCase(),
  ];

  const hits = itemTags.filter(t => moodSet.has(t)).length;
  return Math.min(1.0, hits / 2); // 2+ hits = full match
}

// ─── Quality score ────────────────────────────────────────────────────────────
// Normalises item.rating (0–10) to 0–1
function qualityScore(item) {
  const r = parseFloat(item.rating);
  if (!r || isNaN(r)) return 0.5; // no rating = neutral
  return Math.min(1.0, r / 10);
}

// ─── Score label ──────────────────────────────────────────────────────────────
function scoreLabel(value) {
  if (value >= 90) return 'Perfect match';
  if (value >= 75) return 'Strong match';
  if (value >= 55) return 'Good match';
  if (value >= 35) return 'Partial match';
  return 'Low match';
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function calcNovaScore(item, taste) {
  if (!item) return null;

  const breakdown = {
    category: categoryScore(item, taste),
    tags:     tagScore(item, taste),
    loved:    lovedScore(item, taste),
    mood:     moodScore(item, taste),
    quality:  qualityScore(item),
  };

  const weighted =
    breakdown.category * WEIGHTS.category +
    breakdown.tags     * WEIGHTS.tags     +
    breakdown.loved    * WEIGHTS.loved    +
    breakdown.mood     * WEIGHTS.mood     +
    breakdown.quality  * WEIGHTS.quality;

  const value = Math.round(weighted * 100);

  return {
    value,
    label: scoreLabel(value),
    breakdown: Object.fromEntries(
      Object.entries(breakdown).map(([k, v]) => [k, Math.round(v * 100)])
    ),
  };
}

// ─── Batch scorer — score a list of items at once ─────────────────────────────
// Usage: const scored = scoreItems(items, taste);
// Returns items sorted by score descending, each with a .novaScore property
export function scoreItems(items, taste) {
  return items
    .map(item => ({ ...item, novaScore: calcNovaScore(item, taste) }))
    .sort((a, b) => (b.novaScore?.value || 0) - (a.novaScore?.value || 0));
}

// ─── Read taste from localStorage (client-side only) ─────────────────────────
export function getTasteFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('nova_taste') || 'null');
  } catch {
    return null;
  }
}
