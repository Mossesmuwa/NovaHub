// pages/api/ai-recommend.js
// NovaHub — AI Recommendation Endpoint (JSON, non-streaming)
// Use this for: server-side rendering, prefetch, non-realtime surfaces.
// For realtime streaming UI use pages/api/ai-stream.js instead.

import { createRateLimit } from "../../lib/rateLimit";
import { validateRequest } from "../../lib/validation";

export const config = { maxDuration: 60 };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const anthropicKey = getEnvCredential(
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_ACCESS_TOKEN",
);
const anthropic = new Anthropic({ apiKey: anthropicKey });

// ─── Cache ────────────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function makeCacheKey(mode, params) {
  const canonical = JSON.stringify(
    { mode, ...params },
    Object.keys({ mode, ...params }).sort(),
  );
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

async function getCached(cacheKey) {
  try {
    const { data } = await supabase
      .from("ai_cache")
      .select("response, hit_count")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .single();
    if (data) {
      supabase
        .from("ai_cache")
        .update({ hit_count: data.hit_count + 1 })
        .eq("cache_key", cacheKey)
        .then(() => {});
      return data.response;
    }
  } catch {}
  return null;
}

async function setCache(cacheKey, mode, response) {
  const expires = new Date(Date.now() + CACHE_TTL_MS).toISOString();
  await supabase.from("ai_cache").upsert(
    {
      cache_key: cacheKey,
      mode,
      params_hash: cacheKey.slice(0, 8),
      response,
      expires_at: expires,
      hit_count: 0,
    },
    { onConflict: "cache_key" },
  );
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
  "title": "Exact item name",
  "description": "Brief description (max 50 words)",
  "reason": "Why this is recommended (max 15 words)",
  "category": "movies|books|ai-tools|games|security|productivity|music|courses|videos|design|science|finance|news",
  "type": "alternative" | "discovery",
  "similarity_score": 0-100 (how similar to query, or 0 for discovery),
  "slug_hint": "kebab-case-name-guess"
}

Return exactly the number of items requested. No duplicates.`;

// ─── Prompt builders ──────────────────────────────────────────────────────────
function buildPrompt(mode, body) {
  const count = body.limit || 6;
  switch (mode) {
    case "query": {
      const tasteHint = body.taste?.cats?.length
        ? `User likes: ${body.taste.cats.join(", ")}. Mood: ${body.taste.mood || "any"}.`
        : "";
      return `Analyze query: "${body.query}". Is this asking for ALTERNATIVES to something (like "Notion alternative", "tools like X", "movies like X") or DISCOVERY (like "best productivity apps", "something useful", "cool tools")?

For ALTERNATIVES: Return ${count} items that are genuine alternatives with high similarity_score (70-100). Explain why each is a better/cheaper/simpler alternative.

For DISCOVERY: Return ${count} items that are interesting discoveries with low similarity_score (0-30). Focus on curated, useful recommendations.

${tasteHint} Return a JSON array of ${count} items.`;
    }
    case "alternatives": {
      const { item } = body;
      if (!item) throw new Error("mode=alternatives requires an item object");
      return `Find ${count} genuine alternatives to "${item.name}" (${item.type}, ${item.category}). Each alternative should have:
- High similarity_score (70-100) if very similar
- Medium similarity_score (40-70) if same category but different approach
- Clear reason why it's an alternative (cheaper, simpler, more powerful, etc.)
- Brief description of what makes it better

Return JSON array of ${count} alternatives.`;
    }
    case "vibe": {
      const { mood = 50, energy = 50, focus = 50 } = body;
      return `Recommend ${count} items for vibe — Mood: ${vibeLabel(mood, "chill", "intense")} (${mood}/100), Energy: ${vibeLabel(energy, "relaxed", "energetic")} (${energy}/100), Focus: ${vibeLabel(focus, "casual", "deep-focus")} (${focus}/100). Set type="discovery", similarity_score=0. Return JSON array.`;
    }
    case "related": {
      const { item } = body;
      if (!item) throw new Error("mode=related requires an item object");
      return `Recommend ${count} items related to "${item.name}" (${item.type}, tags: ${(item.tags || []).join(", ")}). Share vibe not just category. Set type="discovery", similarity_score=0. Return JSON array.`;
    }
    case "taste": {
      const { taste } = body;
      if (!taste) throw new Error("mode=taste requires a taste object");
      return `Recommend ${count} personalised picks — likes: ${taste.cats?.join(", ") || "general"}, loved: ${taste.loved?.join(", ") || "none"}, goal: ${taste.mood || "explore"}. Mix types. Set type="discovery", similarity_score=0. Return JSON array.`;
    }
    case "surprise": {
      return `Return ${count} "surprise me" recommendations — mix of hidden gems, underrated tools, and slightly unexpected but useful items. Focus on quality over randomness. Set type="discovery", similarity_score=0. Return JSON array.`;
    }
    default:
      throw new Error(`Unknown mode: "${mode}"`);
  }
}

// ─── Output verification ──────────────────────────────────────────────────────
async function crossReference(suggestions) {
  if (!suggestions?.length) return [];
  const slugs = suggestions.map((s) => s.slug_hint).filter(Boolean);
  const names = suggestions.map((s) => s.title).filter(Boolean);
  let dbItems = [];
  if (slugs.length || names.length) {
    const orFilter = [
      ...slugs.map((s) => `slug.eq.${s}`),
      ...names.map((n) => `name.ilike.${n}`),
    ].join(",");
    const { data } = await supabase
      .from("items")
      .select(
        "id, slug, name, type, category, short_desc, image, rating, pricing, tags, affiliate_link",
      )
      .or(orFilter)
      .eq("approved", true)
      .limit(suggestions.length * 2);
    if (data) dbItems = data;
  }
  return suggestions.map((s) => {
    const match = dbItems.find(
      (db) =>
        db.slug === s.slug_hint ||
        db.name.toLowerCase() === s.title.toLowerCase(),
    );
    return match
      ? {
          ...match,
          reason: s.reason,
          is_db_item: true,
          is_suggestion: false,
          type: s.type || "discovery",
          similarity_score: s.similarity_score || 0,
        }
      : {
          ...s,
          name: s.title,
          slug: s.slug_hint,
          is_db_item: false,
          is_suggestion: true,
          type: s.type || "discovery",
          similarity_score: s.similarity_score || 0,
        };
  });
}

function parseClaudeJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("["),
    end = clean.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array found");
  return JSON.parse(clean.slice(start, end + 1));
}

// ─── Rate limiting ────────────────────────────────────────────────────────────
const rateLimit = createRateLimit({
  windowMs: 60000, // 1 minute
  maxRequests: 20, // 20 requests per minute
  progressiveDelay: true,
});

// ─── Validation schema ──────────────────────────────────────────────────────
const validationSchema = {
  mode: {
    required: false,
    validate: "query", // mode should be safe text
    sanitize: (v) => String(v || "query"),
  },
  query: {
    required: false,
    validate: "query",
    sanitize: (v) => String(v || "").substring(0, 300),
  },
  limit: {
    required: false,
    sanitize: (v) => Math.min(Math.max(parseInt(v) || 6, 1), 12),
  },
  taste: {
    required: false,
    sanitize: (v) => {
      if (!v || typeof v !== "object") return {};
      return {
        cats: Array.isArray(v.cats) ? v.cats.slice(0, 13).map(String) : [],
        loved: Array.isArray(v.loved) ? v.loved.slice(0, 20).map(String) : [],
        mood: typeof v.mood === "string" ? v.mood.substring(0, 50) : "",
      };
    },
  },
  item: {
    required: false,
    sanitize: (v) =>
      v && typeof v === "object"
        ? {
            name: String(v.name || "").substring(0, 200),
            type: String(v.type || "").substring(0, 50),
            category: String(v.category || "").substring(0, 50),
            tags: Array.isArray(v.tags) ? v.tags.slice(0, 10).map(String) : [],
          }
        : undefined,
  },
};

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Apply rate limiting
  await new Promise((resolve, reject) => {
    rateLimit(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  if (req.method !== "POST")
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });

  // Apply validation
  await new Promise((resolve, reject) => {
    validateRequest(validationSchema)(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const secret = process.env.INTERNAL_API_SECRET;
  if (secret && req.headers["x-nova-key"] !== secret)
    return res.status(401).json({ success: false, error: "Unauthorized" });

  if (!anthropicKey)
    return res
      .status(500)
      .json({ success: false, error: "AI service not configured" });

  const { mode = "query", ...body } = req.body || {};

  const VALID_MODES = ["query", "vibe", "related", "taste"];
  if (!VALID_MODES.includes(mode))
    return res.status(400).json({
      success: false,
      error: `Invalid mode. Use: ${VALID_MODES.join(" | ")}`,
    });

  // ─── Cache check ─────────────────────────────────────────────────────────
  const cacheKey = makeCacheKey(mode, body);
  const cached = await getCached(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      mode,
      count: cached.length,
      recommendations: cached,
      cached: true,
    });
  }

  try {
    const userPrompt = buildPrompt(mode, body);
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const rawText = message.content?.[0]?.text || "";
    if (!rawText) throw new Error("Empty response from Claude");

    const suggestions = parseClaudeJSON(rawText);
    if (!Array.isArray(suggestions))
      throw new Error("Claude did not return an array");

    const recommendations = await crossReference(suggestions);

    // Save to cache
    if (recommendations.length > 0) {
      await setCache(cacheKey, mode, recommendations);
    }

    return res.status(200).json({
      success: true,
      mode,
      count: recommendations.length,
      recommendations,
      cached: false,
    });
  } catch (err) {
    console.error("[ai-recommend]", err.message);
    const isUserError =
      err.message.startsWith("Unknown mode") || err.message.startsWith("mode=");
    return res.status(isUserError ? 400 : 500).json({
      success: false,
      error: isUserError
        ? err.message
        : "AI recommendation failed — please try again",
    });
  }
}
