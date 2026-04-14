// pages/api/ai-stream.js
// NovaHub — Streaming AI Recommendations (Server-Sent Events)
// Users see cards appear one-by-one as Claude generates them —
// no loading spinner, no waiting for the full response.
//
// How it works:
//   1. Client opens an EventSource connection to this endpoint
//   2. Claude streams tokens; we buffer until we detect a complete JSON object
//   3. Each complete item is emitted as an SSE event immediately
//   4. Client renders the card the moment it arrives
//
// Client usage (React):
//   const source = new EventSource('/api/ai-stream?mode=vibe&mood=80&energy=30&focus=60');
//   source.addEventListener('item', (e) => {
//     const item = JSON.parse(e.data);
//     setItems(prev => [...prev, item]);
//   });
//   source.addEventListener('done', () => source.close());
//   source.addEventListener('error', (e) => { console.error(e.data); source.close(); });

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const config = { maxDuration: 60 };

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// ─── SSE helpers ──────────────────────────────────────────────────────────────
function sendEvent(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ─── Cache helpers (same logic as ai-recommend.js) ───────────────────────────
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
      // Increment hit count (fire and forget)
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

// ─── Same prompt builders as ai-recommend.js (kept in sync) ──────────────────
function vibeLabel(v, low, high) {
  if (v < 25) return low;
  if (v < 50) return `leaning ${low}`;
  if (v < 75) return `leaning ${high}`;
  return high;
}

const SYSTEM_PROMPT = `You are NovaHub's discovery curator. Recommend niche, genuinely interesting content.

CRITICAL OUTPUT FORMAT: You must output a JSON array, ONE OBJECT PER LINE, like this:
{"name":"Item Name","type":"movie","category":"movies","reason":"Why it fits in under 15 words","slug_hint":"item-name","tags":["tag1","tag2"],"pricing":"Free"}
{"name":"Next Item","type":"tool","category":"ai-tools","reason":"Why it fits","slug_hint":"next-item","tags":["tag1"],"pricing":"Paid"}

Each line must be a complete, valid JSON object. No array brackets. No preamble. No explanation.
Favour cult classics, indie gems, niche tools over mainstream picks.`;

function buildPrompt(mode, params) {
  const count = params.limit || 6;
  switch (mode) {
    case "query":
      return `Recommend ${count} items for: "${params.query}". ${params.taste?.cats?.length ? `User likes: ${params.taste.cats.join(", ")}.` : ""} Output one JSON object per line.`;
    case "vibe":
      return `Recommend ${count} items for vibe — Mood: ${vibeLabel(params.mood, "chill", "intense")}, Energy: ${vibeLabel(params.energy, "relaxed", "energetic")}, Focus: ${vibeLabel(params.focus, "casual", "deep-focus")}. Output one JSON object per line.`;
    case "related":
      return `Recommend ${count} items related to "${params.item?.name}" (${params.item?.type}, tags: ${params.item?.tags?.join(", ")}). Output one JSON object per line.`;
    case "taste":
      return `Recommend ${count} picks for user who likes: ${params.taste?.cats?.join(", ")}. Previously loved: ${params.taste?.loved?.join(", ")}. Output one JSON object per line.`;
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

// ─── Output verification — cross-check each item against Supabase ─────────────
async function verifyItem(item) {
  try {
    const { data } = await supabase
      .from("items")
      .select(
        "id, slug, name, type, category, short_desc, image, rating, pricing, tags, affiliate_link",
      )
      .or(`slug.eq.${item.slug_hint},name.ilike.${item.name}`)
      .eq("approved", true)
      .limit(1)
      .single();

    if (data) {
      return {
        ...data,
        reason: item.reason,
        is_db_item: true,
        is_suggestion: false,
      };
    }
  } catch {}

  // Not in DB — return as suggestion with is_suggestion flag
  return {
    ...item,
    slug: item.slug_hint,
    is_db_item: false,
    is_suggestion: true,
  };
}

// ─── Main SSE handler ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  // Auth check
  const secret = process.env.INTERNAL_API_SECRET;
  if (secret && req.headers["x-nova-key"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Parse query params (SSE uses GET, not POST body)
  const {
    mode = "query",
    query,
    mood,
    energy,
    focus,
    limit = "6",
    item: itemJson,
    taste: tasteJson,
  } = req.query;

  const params = {
    query,
    mood: parseInt(mood) || 50,
    energy: parseInt(energy) || 50,
    focus: parseInt(focus) || 50,
    limit: Math.min(Math.max(parseInt(limit), 1), 12),
    item: itemJson ? JSON.parse(itemJson) : undefined,
    taste: tasteJson ? JSON.parse(tasteJson) : undefined,
  };

  // ─── Set SSE headers ────────────────────────────────────────────────────────
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering on Vercel
  res.flushHeaders();

  // ─── Check DB cache first — if hit, stream all items immediately ────────────
  const cacheKey = makeCacheKey(mode, params);
  const cached = await getCached(cacheKey);

  if (cached) {
    for (const item of cached) {
      sendEvent(res, "item", { ...item, cached: true });
    }
    sendEvent(res, "done", { count: cached.length, cached: true });
    return res.end();
  }

  // ─── No cache — stream from Claude ─────────────────────────────────────────
  let userPrompt;
  try {
    userPrompt = buildPrompt(mode, params);
  } catch (err) {
    sendEvent(res, "error", { message: err.message });
    return res.end();
  }

  const allItems = [];
  let buffer = "";

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    // Process token stream
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta?.type === "text_delta"
      ) {
        buffer += event.delta.text;

        // Try to extract complete JSON objects line by line
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete last line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("{")) continue;

          try {
            const parsed = JSON.parse(trimmed);
            // Validate required fields before emitting
            if (!parsed.name || !parsed.type) continue;

            // Output verification against Supabase (async, per item)
            const verified = await verifyItem(parsed);
            allItems.push(verified);
            sendEvent(res, "item", verified);
          } catch {
            // Incomplete JSON line — skip, keep buffering
          }
        }
      }
    }

    // Process any remaining buffer content
    const finalTrimmed = buffer.trim();
    if (finalTrimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(finalTrimmed);
        if (parsed.name && parsed.type) {
          const verified = await verifyItem(parsed);
          allItems.push(verified);
          sendEvent(res, "item", verified);
        }
      } catch {}
    }

    // Save to cache
    if (allItems.length > 0) {
      await setCache(cacheKey, mode, allItems);
    }

    sendEvent(res, "done", { count: allItems.length, cached: false });
  } catch (err) {
    console.error("[ai-stream] Claude error:", err.message);
    sendEvent(res, "error", { message: "AI stream failed — please try again" });
  }

  res.end();
}
