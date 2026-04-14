// lib/nova-score.js
// NovaHub — NovaScore Engine
// Calculates a personalised match percentage (0–100) between an item
// and a user's taste profile (from localStorage nova_taste or Supabase profile).
//
// This is a Pro feature — free users see the raw rating, Pro users see
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
