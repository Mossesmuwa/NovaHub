// pages/api/ingest/rawg.js
// NovaHub — RAWG Games Auto-Ingestion Cron
// Runs daily at 3am UTC. Pulls top-rated + newly released games.
// Get free API key: https://rawg.io/apidocs

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getEnvCredential } from "../../../lib/helpers";

export const config = { maxDuration: 60 };

const RAWG_BASE = "https://api.rawg.io/api";
const BATCH_SIZE = 20;

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function rawgFetch(path, params = {}) {
  const token = getEnvCredential("RAWG_API_KEY", "RAWG_ACCESS_TOKEN");
  const useBearer =
    token.startsWith("Bearer ") ||
    token.startsWith("eyJ") ||
    token.includes(".");
  const headers = {};
  const queryParams = { ...params };

  if (!useBearer) {
    queryParams.key = token;
  } else {
    headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }

  const qs = new URLSearchParams(queryParams).toString();
  const res = await fetch(`${RAWG_BASE}${path}${qs ? `?${qs}` : ""}`, {
    headers,
  });
  if (!res.ok) throw new Error(`RAWG error: ${res.status}`);
  return res.json();
}

function gameToItem(g) {
  const platforms = (g.platforms || []).map((p) => p.platform.name).join(", ");
  return {
    slug: slugify(g.name) + "-game-" + g.id,
    name: g.name,
    short_desc: `${platforms ? "Available on: " + platforms + ". " : ""}Released ${g.released || "TBA"}.`,
    long_desc: g.description_raw || "",
    category_id: "games",
    type: "game",
    image: g.background_image || null,
    year: g.released ? parseInt(g.released.split("-")[0]) : null,
    rating: g.rating ? parseFloat(g.rating.toFixed(1)) : null,
    rating_count: g.ratings_count || 0,
    genre: (g.genres || []).map((gen) => gen.name).join(", "),
    platforms,
    tags: ["rawg", "game", ...(g.genres || []).map((gen) => gen.slug)].slice(
      0,
      8,
    ),
    vibe_tags: [],
    source_url: `https://rawg.io/games/${g.slug}`,
    source_id: String(g.id),
    source_name: "rawg",
    trending: false,
    approved: true,
  };
}

async function upsertItems(items) {
  if (!supabaseAdmin) {
    throw new Error("Admin client not initialized");
  }
  const { error } = await supabaseAdmin.from("items").upsert(items, {
    onConflict: "source_id,source_name",
    ignoreDuplicates: false,
  });
  if (error) throw error;
  return items.length;
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return res.status(401).json({ error: "Unauthorized" });

  const rawgToken = getEnvCredential("RAWG_API_KEY", "RAWG_ACCESS_TOKEN");
  if (!rawgToken)
    return res.status(500).json({ error: "RAWG API credential not set" });

  const results = { topRated: 0, recent: 0, errors: [] };
  const today = new Date().toISOString().split("T")[0];
  const past90 = new Date(Date.now() - 90 * 864e5).toISOString().split("T")[0];

  try {
    // Top-rated all time
    const top = await rawgFetch("/games", {
      ordering: "-rating",
      page_size: BATCH_SIZE,
      metacritic: "80,100",
    });
    const items = (top.results || []).map(gameToItem);
    if (items.length) results.topRated = await upsertItems(items);
  } catch (err) {
    results.errors.push(`TopRated: ${err.message}`);
  }

  try {
    // Recently released
    const recent = await rawgFetch("/games", {
      ordering: "-released",
      dates: `${past90},${today}`,
      page_size: BATCH_SIZE,
    });
    const items = (recent.results || []).map(gameToItem);
    if (items.length) results.recent = await upsertItems(items);
  } catch (err) {
    results.errors.push(`Recent: ${err.message}`);
  }

  console.log("[ingest/rawg]", results);
  return res.status(200).json({ success: true, ...results });
}
