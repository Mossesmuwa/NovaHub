// pages/api/admin/trigger.js
// Rebuilt with explicit step logging at every failure point.
// Check Vercel → Functions → Logs after each call to see exactly where it fails.

import { createClient } from "@supabase/supabase-js";

// Build admin client inline — avoids any import caching issues
function makeAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      `Missing env vars — URL: ${!!url}, SERVICE_ROLE_KEY: ${!!key} (len=${key?.length || 0})`,
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // ── STEP 1: Check env vars are present ──────────────────────────────────────
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!svcKey) {
    console.error(
      "[trigger] STEP 1 FAIL: SUPABASE_SERVICE_ROLE_KEY is empty in this environment",
    );
    console.error("[trigger] VERCEL_ENV:", process.env.VERCEL_ENV);
    return res.status(500).json({
      step: 1,
      error: "SUPABASE_SERVICE_ROLE_KEY is not set in this Vercel environment",
      vercel_env: process.env.VERCEL_ENV,
      fix: "Go to Vercel → Project Settings → Environment Variables → ensure SUPABASE_SERVICE_ROLE_KEY is set for Production (not just Preview/Development)",
    });
  }
  console.log("[trigger] STEP 1 OK: svc key present, len=", svcKey.length);

  // ── STEP 2: Extract and validate token from header ───────────────────────────
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!token) {
    console.error("[trigger] STEP 2 FAIL: No Authorization header or token");
    return res.status(401).json({
      step: 2,
      error: "No Authorization header provided",
      received_header: authHeader || "(empty)",
      fix: "The admin UI must pass: Authorization: Bearer <supabase_access_token>",
    });
  }
  console.log("[trigger] STEP 2 OK: token present, len=", token.length);

  // ── STEP 3: Verify the token is a real active session ───────────────────────
  // Use anon client scoped to this user's JWT
  const anonUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!anonUrl || !anonKey) {
    console.error("[trigger] STEP 3 FAIL: Missing public supabase env vars");
    return res
      .status(500)
      .json({ step: 3, error: "Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY" });
  }

  const userClient = createClient(anonUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();

  if (userErr || !user) {
    console.error("[trigger] STEP 3 FAIL: getUser() failed:", userErr?.message);
    return res.status(401).json({
      step: 3,
      error: "Invalid or expired session token",
      detail: userErr?.message,
      fix: "The token may have expired. The admin UI should call supabase.auth.getSession() freshly before each trigger call, not cache it.",
    });
  }
  console.log("[trigger] STEP 3 OK: user=", user.id, user.email);

  // ── STEP 4: Check is_admin using SERVICE ROLE client ────────────────────────
  let adminDb;
  try {
    adminDb = makeAdminClient();
  } catch (e) {
    console.error("[trigger] STEP 4 FAIL: makeAdminClient threw:", e.message);
    return res.status(500).json({ step: 4, error: e.message });
  }

  const { data: profile, error: profileErr } = await adminDb
    .from("profiles")
    .select("id, display_name, is_admin")
    .eq("id", user.id)
    .single();

  if (profileErr) {
    console.error(
      "[trigger] STEP 4 FAIL: profile query error:",
      profileErr.message,
      "for user:",
      user.id,
    );
    return res.status(500).json({
      step: 4,
      error: "Failed to fetch profile",
      detail: profileErr.message,
      user_id: user.id,
      fix: "This should NOT fail with service role. Check SUPABASE_SERVICE_ROLE_KEY is the correct key.",
    });
  }

  if (!profile) {
    console.error("[trigger] STEP 4 FAIL: no profile row for user:", user.id);
    return res.status(403).json({
      step: 4,
      error: "No profile found for this user",
      user_id: user.id,
      fix: `Run: INSERT INTO profiles (id) VALUES ('${user.id}') ON CONFLICT DO NOTHING;`,
    });
  }

  if (!profile.is_admin) {
    console.error(
      "[trigger] STEP 4 FAIL: is_admin=false for user:",
      user.id,
      profile.display_name,
    );
    return res.status(403).json({
      step: 4,
      error: "User does not have admin access",
      user_id: user.id,
      is_admin: profile.is_admin,
      fix: `Run in Supabase SQL Editor: UPDATE profiles SET is_admin = TRUE WHERE id = '${user.id}';`,
    });
  }
  console.log(
    "[trigger] STEP 4 OK: is_admin=true for",
    profile.display_name || user.id,
  );

  // ── STEP 5: Run providers ────────────────────────────────────────────────────
  const { provider } = req.body || {};
  const results = {};

  const PROVIDERS = {
    tmdb: async () => {
      const { TMDBProvider } = await import("../../../lib/ingest/TMDBProvider");
      return new TMDBProvider({ limit: 20 }).sync();
    },
    producthunt: async () => {
      const { ProductHuntProvider } =
        await import("../../../lib/ingest/ProductHuntProvider");
      return new ProductHuntProvider({ limit: 20 }).sync();
    },
  };

  const toRun =
    provider && PROVIDERS[provider]
      ? { [provider]: PROVIDERS[provider] }
      : PROVIDERS;

  for (const [key, fn] of Object.entries(toRun)) {
    try {
      console.log(`[trigger] Running ${key}…`);
      results[key] = await fn();
      console.log(`[trigger] ${key} done:`, results[key]);
    } catch (e) {
      console.error(`[trigger] ${key} threw:`, e.message);
      results[key] = { error: e.message };
    }
  }

  return res.status(200).json({
    success: true,
    user_id: user.id,
    admin: profile.display_name || user.email,
    results,
  });
}
