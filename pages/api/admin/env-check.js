// pages/api/admin/env-check.js
// TEMPORARY diagnostic — delete after confirming env vars are correct.
// Visit: https://yoursite.vercel.app/api/admin/env-check
// This writes nothing to the DB. Safe to run.

export default function handler(req, res) {
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const cron = process.env.CRON_SECRET || "";

  return res.status(200).json({
    // Show presence + length, never the actual value
    NEXT_PUBLIC_SUPABASE_URL: {
      set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      len: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").length,
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      len: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").length,
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      set: !!svcKey,
      len: svcKey.length,
      looks_like_service_role: svcKey.length > 200,
    },
    CRON_SECRET: { set: !!cron, len: cron.length },
    ANTHROPIC_API_KEY: {
      set: !!process.env.ANTHROPIC_API_KEY,
      len: (process.env.ANTHROPIC_API_KEY || "").length,
    },
    TMDB_BEARER_TOKEN: {
      set: !!process.env.TMDB_BEARER_TOKEN,
      len: (process.env.TMDB_BEARER_TOKEN || "").length,
    },
    PRODUCTHUNT_DEVELOPER_TOKEN: {
      set: !!process.env.PRODUCTHUNT_DEVELOPER_TOKEN,
      len: (process.env.PRODUCTHUNT_DEVELOPER_TOKEN || "").length,
    },

    // What the runtime sees
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV, // 'production' | 'preview' | 'development'

    // Quick verdict
    verdict: {
      service_role_ok: svcKey.length > 200,
      cron_secret_ok: cron.length > 0,
      tmdb_ok: (process.env.TMDB_BEARER_TOKEN || "").length > 0,
      ph_ok: (process.env.PRODUCTHUNT_DEVELOPER_TOKEN || "").length > 0,
    },
  });
}
