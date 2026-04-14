// lib/ai.js
// NovaHub — Client-side AI helper
// Wraps /api/ai-recommend for each surface with clean, typed interfaces.
// All functions return: { recommendations: Item[], error?: string }

const ENDPOINT = '/api/ai-recommend';

async function callEndpoint(payload) {
  try {
    const res = await fetch(ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { recommendations: [], error: data.error || 'Request failed' };
    }
    return { recommendations: data.recommendations || [], error: null };
  } catch (err) {
    console.error('[ai.js] fetch error:', err);
    return { recommendations: [], error: 'Network error — please try again' };
  }
}

// ─── Homepage: text query + optional taste profile ────────────────────────────
// Usage (index.js):
//   const taste = JSON.parse(localStorage.getItem('nova_taste') || '{}');
//   const result = await getQueryRecommendations('minimal productivity tools', taste);
export async function getQueryRecommendations(query, taste = null, limit = 6) {
  return callEndpoint({ mode: 'query', query, taste, limit });
}

// ─── Homepage: personalised picks (no query, uses onboarding taste) ───────────
// Usage (index.js):
//   const taste = JSON.parse(localStorage.getItem('nova_taste') || '{}');
//   const result = await getTasteRecommendations(taste);
export async function getTasteRecommendations(taste, limit = 6) {
  if (!taste?.cats?.length && !taste?.loved?.length) {
    // Fallback: treat as a generic "explore everything" query
    return callEndpoint({ mode: 'query', query: 'niche interesting discoveries across all categories', limit });
  }
  return callEndpoint({ mode: 'taste', taste, limit });
}

// ─── Vibe Dial (discover.js): slider values → recommendations ─────────────────
// Usage (discover.js):
//   const result = await getVibeRecommendations({ mood: 80, energy: 30, focus: 60 });
export async function getVibeRecommendations({ mood = 50, energy = 50, focus = 50 }, limit = 6) {
  return callEndpoint({ mode: 'vibe', mood, energy, focus, limit });
}

// ─── Item page ([slug].js): related item picks ────────────────────────────────
// Usage (pages/item/[slug].js):
//   const result = await getRelatedRecommendations(item);  // item from Supabase
export async function getRelatedRecommendations(item, limit = 4) {
  return callEndpoint({ mode: 'related', item, limit });
}

// ─── Search page (search.js): AI-assisted results alongside DB results ─────────
// Usage (search.js):
//   const result = await getSearchRecommendations(searchQuery);
export async function getSearchRecommendations(query, limit = 4) {
  if (!query?.trim()) return { recommendations: [], error: null };
  return callEndpoint({ mode: 'query', query, limit });
}
