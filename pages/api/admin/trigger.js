// pages/api/admin/trigger.js
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });

  // CRON_SECRET shortcut
  if (process.env.CRON_SECRET && token === process.env.CRON_SECRET)
    return runProviders(req, res, "cron");

  // JWT auth
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
      .select("is_admin,display_name")
      .eq("id", user.id)
      .single();
    if (!profile?.is_admin)
      return res
        .status(403)
        .json({
          error: "Admin required",
          fix: `UPDATE profiles SET is_admin=TRUE WHERE id='${user.id}';`,
        });
    return runProviders(req, res, profile.display_name || user.email);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
}

async function run(results, key, fn) {
  try {
    console.log(`[trigger] Running ${key}...`);
    results[key] = await fn();
  } catch (err) {
    console.error(`[trigger] ${key} error:`, err.message);
    results[key] = { error: err.message };
  }
}

async function runProviders(req, res, authAs) {
  const { provider = "all" } = req.body || {};
  const results = {};
  const p = provider;

  const SE = async () => {
    const { SyncEngine } = await import("../../../lib/pipeline/SyncEngine.js");
    return SyncEngine;
  };

  if (p === "all" || p === "tmdb")
    await run(results, "tmdb", async () => {
      const SE2 = await SE();
      const { TMDBProvider } =
        await import("../../../lib/pipeline/TMDBProvider.js");
      return new SE2({ skipAI: true }).syncProvider(
        new TMDBProvider({ pages: 3 }),
      );
    });
  if (p === "all" || p === "producthunt")
    await run(results, "producthunt", async () => {
      const SE2 = await SE();
      const { ProductHuntProvider } =
        await import("../../../lib/pipeline/ProductHuntProvider.js");
      return new SE2({ skipAI: true }).syncProvider(
        new ProductHuntProvider({ limit: 50 }),
      );
    });
  if (p === "all" || p === "rawg")
    await run(results, "rawg", async () => {
      const SE2 = await SE();
      const { RAWGProvider } =
        await import("../../../lib/pipeline/RAWGProvider.js");
      return new SE2({ skipAI: true }).syncProvider(
        new RAWGProvider({ limit: 40 }),
      );
    });
  if (p === "all" || p === "books")
    await run(results, "books", async () => {
      const SE2 = await SE();
      const { BooksProvider } =
        await import("../../../lib/pipeline/BooksProvider.js");
      return new SE2({ skipAI: true }).syncProvider(
        new BooksProvider({ limitPerQuery: 5 }),
      );
    });
  if (p === "all" || p === "github")
    await run(results, "github", async () => {
      const SE2 = await SE();
      const { GitHubProvider } =
        await import("../../../lib/pipeline/GitHubProvider.js");
      return new SE2({ skipAI: true }).syncProvider(
        new GitHubProvider({ limit: 30 }),
      );
    });
  if (p === "all" || p === "hackernews")
    await run(results, "hackernews", async () => {
      const SE2 = await SE();
      const { HackerNewsProvider } =
        await import("../../../lib/pipeline/HackerNewsProvider.js");
      return new SE2({ skipAI: true }).syncProvider(
        new HackerNewsProvider({ limit: 30 }),
      );
    });
  if (p === "all" || p === "steam")
    await run(results, "steam", async () => {
      const SE2 = await SE();
      const { SteamProvider } =
        await import("../../../lib/pipeline/SteamProvider.js");
      return new SE2({ skipAI: true }).syncProvider(
        new SteamProvider({ limit: 40 }),
      );
    });
  if (p === "all" || p === "arxiv")
    await run(results, "arxiv", async () => {
      const SE2 = await SE();
      const { ArxivProvider } =
        await import("../../../lib/pipeline/ArxivProvider.js");
      return new SE2({ skipAI: true }).syncProvider(
        new ArxivProvider({ limit: 30 }),
      );
    });
  if (p === "all" || p === "reddit")
    await run(results, "reddit", async () => {
      const SE2 = await SE();
      const { RedditProvider } =
        await import("../../../lib/pipeline/RedditProvider.js");
      return new SE2({ skipAI: true }).syncProvider(
        new RedditProvider({ postsPerSub: 5 }),
      );
    });
  if (p === "all" || p === "spotify")
    await run(results, "spotify", async () => {
      const SE2 = await SE();
      const { SpotifyProvider } =
        await import("../../../lib/pipeline/SpotifyProvider.js");
      return new SE2({ skipAI: true }).syncProvider(
        new SpotifyProvider({ limit: 40 }),
      );
    });
  if (p === "all" || p === "nyt")
    await run(results, "nyt", async () => {
      const SE2 = await SE();
      const { NYTBooksProvider } =
        await import("../../../lib/pipeline/NYTBooksProvider.js");
      return new SE2({ skipAI: true }).syncProvider(new NYTBooksProvider());
    });
  if (p === "all" || p === "youtube")
    await run(results, "youtube", async () => {
      const SE2 = await SE();
      const { YouTubeProvider } =
        await import("../../../lib/pipeline/YouTubeProvider.js");
      return new SE2({ skipAI: true }).syncProvider(
        new YouTubeProvider({ limit: 10 }),
      );
    });
  if (p === "all" || p === "omdb")
    await run(results, "omdb", async () => {
      const { enrichMovies } =
        await import("../../../lib/pipeline/OMDBEnricher.js");
      return enrichMovies();
    });

  return res.status(200).json({ success: true, auth_as: authAs, results });
}
