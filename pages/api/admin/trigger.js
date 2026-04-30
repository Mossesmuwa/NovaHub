// pages/api/admin/trigger.js
// Accepts Supabase JWT (from admin UI) or CRON_SECRET directly.

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (!token) return res.status(401).json({ error: "No authorization token" });

  // Auth method 1: CRON_SECRET
  if (process.env.CRON_SECRET && token === process.env.CRON_SECRET) {
    return runProviders(req, res, "cron");
  }

  // Auth method 2: Supabase JWT + is_admin
  try {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      },
    );
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error || !user)
      return res.status(401).json({ error: "Invalid session" });

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_admin, display_name")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin)
      return res.status(403).json({
        error: "Admin access required",
        fix: `UPDATE profiles SET is_admin = TRUE WHERE id = '${user.id}';`,
      });

    return runProviders(req, res, profile.display_name || user.email);
  } catch (err) {
    return res.status(401).json({ error: "Auth failed", detail: err.message });
  }
}

async function runProviders(req, res, authAs) {
  const { provider = "all" } = req.body || {};
  const results = {};

  async function run(key, fn) {
    try {
      console.log(`[trigger] Running ${key}...`);
      results[key] = await fn();
      console.log(`[trigger] ${key} done:`, JSON.stringify(results[key]));
    } catch (err) {
      console.error(`[trigger] ${key} error:`, err.message);
      results[key] = { error: err.message };
    }
  }

  if (provider === "all" || provider === "tmdb") {
    const { SyncEngine } = await import("../../../lib/pipeline/SyncEngine.js");
    const { TMDBProvider } =
      await import("../../../lib/pipeline/TMDBProvider.js");
    await run("tmdb", () =>
      new SyncEngine({ skipAI: true }).syncProvider(
        new TMDBProvider({ pages: 3 }),
      ),
    );
  }

  if (provider === "all" || provider === "producthunt") {
    const { SyncEngine } = await import("../../../lib/pipeline/SyncEngine.js");
    const { ProductHuntProvider } =
      await import("../../../lib/pipeline/ProductHuntProvider.js");
    await run("producthunt", () =>
      new SyncEngine({ skipAI: true }).syncProvider(
        new ProductHuntProvider({ limit: 50 }),
      ),
    );
  }

  if (provider === "all" || provider === "rawg") {
    const { SyncEngine } = await import("../../../lib/pipeline/SyncEngine.js");
    const { RAWGProvider } =
      await import("../../../lib/pipeline/RAWGProvider.js");
    await run("rawg", () =>
      new SyncEngine({ skipAI: true }).syncProvider(
        new RAWGProvider({ limit: 20 }),
      ),
    );
  }

  if (provider === "all" || provider === "books") {
    const { SyncEngine } = await import("../../../lib/pipeline/SyncEngine.js");
    const { BooksProvider } =
      await import("../../../lib/pipeline/BooksProvider.js");
    await run("books", () =>
      new SyncEngine({ skipAI: true }).syncProvider(
        new BooksProvider({ limitPerQuery: 5 }),
      ),
    );
  }

  if (provider === "all" || provider === "github") {
    const { SyncEngine } = await import("../../../lib/pipeline/SyncEngine.js");
    const { GitHubProvider } =
      await import("../../../lib/pipeline/GitHubProvider.js");
    await run("github", () =>
      new SyncEngine({ skipAI: true }).syncProvider(
        new GitHubProvider({ limit: 30, since: "weekly" }),
      ),
    );
  }

  if (provider === "all" || provider === "hackernews") {
    const { SyncEngine } = await import("../../../lib/pipeline/SyncEngine.js");
    const { HackerNewsProvider } =
      await import("../../../lib/pipeline/HackerNewsProvider.js");
    await run("hackernews", () =>
      new SyncEngine({ skipAI: true }).syncProvider(
        new HackerNewsProvider({ limit: 30 }),
      ),
    );
  }

  if (provider === "all" || provider === "omdb") {
    const { enrichMovies } =
      await import("../../../lib/pipeline/OMDBEnricher.js");
    await run("omdb", () => enrichMovies());
  }

  return res.status(200).json({ success: true, auth_as: authAs, results });
}
