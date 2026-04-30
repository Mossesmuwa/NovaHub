// pages/api/admin/trigger.js
// Accepts two auth methods:
// 1. Supabase JWT (from admin UI) — verifies user + checks is_admin
// 2. CRON_SECRET as Bearer token (for direct API calls)

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!token)
    return res.status(401).json({ error: "No authorization token provided" });

  // ── Auth method 1: CRON_SECRET direct key ──────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && token === cronSecret) {
    return runProviders(req, res, "cron");
  }

  // ── Auth method 2: Supabase JWT + is_admin check ───────────────────────────
  try {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      },
    );

    const {
      data: { user },
      error: userErr,
    } = await anonClient.auth.getUser();
    if (userErr || !user) {
      return res
        .status(401)
        .json({
          error: "Invalid or expired session",
          detail: userErr?.message,
        });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_admin, display_name")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return res.status(403).json({
        error: "Admin access required",
        fix: `Run in Supabase SQL: UPDATE profiles SET is_admin = TRUE WHERE id = '${user.id}';`,
      });
    }

    return runProviders(req, res, profile.display_name || user.email);
  } catch (err) {
    return res.status(401).json({ error: "Auth failed", detail: err.message });
  }
}

async function runProviders(req, res, authAs) {
  const { provider = "all" } = req.body || {};
  const results = {};

  if (provider === "all" || provider === "tmdb") {
    try {
      const { SyncEngine } =
        await import("../../../lib/pipeline/SyncEngine.js");
      const { TMDBProvider } =
        await import("../../../lib/pipeline/TMDBProvider.js");
      results.tmdb = await new SyncEngine({ skipAI: true }).syncProvider(
        new TMDBProvider({ pages: 3 }),
      );
    } catch (err) {
      results.tmdb = { error: err.message };
    }
  }

  if (provider === "all" || provider === "producthunt") {
    try {
      const { SyncEngine } =
        await import("../../../lib/pipeline/SyncEngine.js");
      const { ProductHuntProvider } =
        await import("../../../lib/pipeline/ProductHuntProvider.js");
      results.producthunt = await new SyncEngine({ skipAI: true }).syncProvider(
        new ProductHuntProvider({ limit: 50 }),
      );
    } catch (err) {
      results.producthunt = { error: err.message };
    }
  }

  if (provider === "all" || provider === "rawg") {
    try {
      const { SyncEngine } =
        await import("../../../lib/pipeline/SyncEngine.js");
      const { RAWGProvider } =
        await import("../../../lib/pipeline/RAWGProvider.js");
      results.rawg = await new SyncEngine({ skipAI: true }).syncProvider(
        new RAWGProvider({ limit: 20 }),
      );
    } catch (err) {
      results.rawg = { error: err.message };
    }
  }

  if (provider === "all" || provider === "books") {
    try {
      const { SyncEngine } =
        await import("../../../lib/pipeline/SyncEngine.js");
      const { BooksProvider } =
        await import("../../../lib/pipeline/BooksProvider.js");
      results.books = await new SyncEngine({ skipAI: true }).syncProvider(
        new BooksProvider({ limitPerQuery: 5 }),
      );
    } catch (err) {
      results.books = { error: err.message };
    }
  }

  return res.status(200).json({ success: true, auth_as: authAs, results });
}
