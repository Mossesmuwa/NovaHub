// pages/api/ai-recommend.js
// NovaHub — AI Recommendation Endpoint (JSON, non-streaming)
// Use this for: server-side rendering, prefetch, non-realtime surfaces.
// For realtime streaming UI use pages/api/ai-stream.js instead.

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Cache ────────────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function makeCacheKey(mode, params) {
  const canonical = JSON.stringify({ mode, ...params }, Object.keys({ mode, ...params }).sort());
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

async function getCached(cacheKey) {
  try {
    const { data } = await supabase
      .from('ai_cache')
      .select('response, hit_count')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();
    if (data) {
      supabase.from('ai_cache').update({ hit_count: data.hit_count + 1 }).eq('cache_key', cacheKey).then(() => {});
      return data.response;
    }
  } catch {}
  return null;
}

async function setCache(cacheKey, mode, response) {
  const expires = new Date(Date.now() + CACHE_TTL_MS).toISOString();
  await supabase.from('ai_cache').upsert({
    cache_key: cacheKey, mode,
    params_hash: cacheKey.slice(0, 8),
    response, expires_at: expires, hit_count: 0,
  }, { onConflict: 'cache_key' });
}

// ─── Vibe labels ──────────────────────────────────────────────────────────────
function vibeLabel(value, low, high) {
  if (value < 25) return low;
  if (value < 50) return `leaning ${low}`;
  if (value < 75) return `leaning ${high}`;
  return high;
}

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are NovaHub's discovery curator — a taste-forward AI that recommends niche, 
genuinely interesting content. NovaHub covers: movies, TV shows, books, games, AI tools, productivity 
tools, music, courses, videos, podcasts, design tools, security tools, science resources, finance tools.

Your recommendations should feel like advice from a knowledgeable friend — specific, opinionated, and 
non-obvious. Avoid mainstream blockbusters unless they're genuinely the best fit. Favour cult classics, 
indie gems, niche tools, and underrated picks.

CRITICAL: You must respond ONLY with a valid JSON array — no preamble, no markdown, no explanation.
No \`\`\`json fences. Just the raw JSON array.

Each item must have exactly:
{
  "name": "Exact item name",
  "type": "movie|book|game|tool|video|podcast|tv|course",
  "category": "movies|books|ai-tools|games|security|productivity|music|courses|videos|design|science|finance|news",
  "reason": "One crisp sentence (max 15 words) explaining why this fits",
  "slug_hint": "kebab-case-name-guess",
  "tags": ["tag1", "tag2", "tag3"],
  "pricing": "Free|Freemium|Paid|Open Source|null"
}

Return exactly the number of items requested. No duplicates.`;

// ─── Prompt builders ──────────────────────────────────────────────────────────
function buildPrompt(mode, body) {
  const count = body.limit || 6;
  switch (mode) {
    case 'query': {
      const tasteHint = body.taste?.cats?.length
        ? `User likes: ${body.taste.cats.join(', ')}. Mood: ${body.taste.mood || 'any'}.` : '';
      return `Recommend ${count} items for: "${body.query}". ${tasteHint} Return a JSON array of ${count} items.`;
    }
    case 'vibe': {
      const { mood = 50, energy = 50, focus = 50 } = body;
      return `Recommend ${count} items for vibe — Mood: ${vibeLabel(mood,'chill','intense')} (${mood}/100), Energy: ${vibeLabel(energy,'relaxed','energetic')} (${energy}/100), Focus: ${vibeLabel(focus,'casual','deep-focus')} (${focus}/100). Be precise. Return JSON array.`;
    }
    case 'related': {
      const { item } = body;
      if (!item) throw new Error('mode=related requires an item object');
      return `Recommend ${count} items related to "${item.name}" (${item.type}, tags: ${(item.tags||[]).join(', ')}). Share vibe not just category. Return JSON array.`;
    }
    case 'taste': {
      const { taste } = body;
      if (!taste) throw new Error('mode=taste requires a taste object');
      return `Recommend ${count} personalised picks — likes: ${taste.cats?.join(', ')||'general'}, loved: ${taste.loved?.join(', ')||'none'}, goal: ${taste.mood||'explore'}. Mix types. Return JSON array.`;
    }
    default:
      throw new Error(`Unknown mode: "${mode}"`);
  }
}

// ─── Output verification ──────────────────────────────────────────────────────
async function crossReference(suggestions) {
  if (!suggestions?.length) return [];
  const slugs = suggestions.map(s => s.slug_hint).filter(Boolean);
  const names = suggestions.map(s => s.name).filter(Boolean);
  let dbItems = [];
  if (slugs.length || names.length) {
    const orFilter = [
      ...slugs.map(s => `slug.eq.${s}`),
      ...names.map(n => `name.ilike.${n}`),
    ].join(',');
    const { data } = await supabase
      .from('items')
      .select('id, slug, name, type, category, short_desc, image, rating, pricing, tags, affiliate_link')
      .or(orFilter).eq('approved', true).limit(suggestions.length * 2);
    if (data) dbItems = data;
  }
  return suggestions.map(s => {
    const match = dbItems.find(db =>
      db.slug === s.slug_hint || db.name.toLowerCase() === s.name.toLowerCase()
    );
    return match
      ? { ...match, reason: s.reason, is_db_item: true,  is_suggestion: false }
      : { ...s, slug: s.slug_hint, is_db_item: false, is_suggestion: true };
  });
}

function parseClaudeJSON(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  const start = clean.indexOf('['), end = clean.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('No JSON array found');
  return JSON.parse(clean.slice(start, end + 1));
}

// ─── Rate limiting ────────────────────────────────────────────────────────────
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now(), window = 60_000, limit = 20;
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + window };
  if (now > entry.reset) { rateLimitMap.set(ip, { count: 1, reset: now + window }); return false; }
  if (entry.count >= limit) return true;
  entry.count++;
  rateLimitMap.set(ip, entry);
  return false;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip))
    return res.status(429).json({ success: false, error: 'Too many requests' });

  const secret = process.env.INTERNAL_API_SECRET;
  if (secret && req.headers['x-nova-key'] !== secret)
    return res.status(401).json({ success: false, error: 'Unauthorized' });

  if (!process.env.ANTHROPIC_API_KEY)
    return res.status(500).json({ success: false, error: 'AI service not configured' });

  const { mode = 'query', ...body } = req.body || {};

  const VALID_MODES = ['query', 'vibe', 'related', 'taste'];
  if (!VALID_MODES.includes(mode))
    return res.status(400).json({ success: false, error: `Invalid mode. Use: ${VALID_MODES.join(' | ')}` });

  if (body.query?.length > 300)
    return res.status(400).json({ success: false, error: 'Query too long — max 300 characters' });

  if (body.taste) {
    body.taste = {
      cats:  Array.isArray(body.taste.cats)  ? body.taste.cats.slice(0, 13).map(String) : [],
      loved: Array.isArray(body.taste.loved) ? body.taste.loved.slice(0, 20).map(String) : [],
      mood:  typeof body.taste.mood === 'string' ? body.taste.mood.slice(0, 50) : '',
    };
  }

  const limit = Math.min(Math.max(parseInt(body.limit) || 6, 1), 12);
  body.limit  = limit;

  // ─── Cache check ─────────────────────────────────────────────────────────
  const cacheKey = makeCacheKey(mode, body);
  const cached   = await getCached(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true, mode, count: cached.length,
      recommendations: cached, cached: true,
    });
  }

  try {
    const userPrompt = buildPrompt(mode, body);
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = message.content?.[0]?.text || '';
    if (!rawText) throw new Error('Empty response from Claude');

    const suggestions      = parseClaudeJSON(rawText);
    if (!Array.isArray(suggestions)) throw new Error('Claude did not return an array');

    const recommendations  = await crossReference(suggestions);

    // Save to cache
    if (recommendations.length > 0) {
      await setCache(cacheKey, mode, recommendations);
    }

    return res.status(200).json({
      success: true, mode, count: recommendations.length,
      recommendations, cached: false,
    });

  } catch (err) {
    console.error('[ai-recommend]', err.message);
    const isUserError = err.message.startsWith('Unknown mode') || err.message.startsWith('mode=');
    return res.status(isUserError ? 400 : 500).json({
      success: false,
      error: isUserError ? err.message : 'AI recommendation failed — please try again',
    });
  }
}
