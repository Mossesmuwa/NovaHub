// lib/supabaseAdmin.js
// NovaHub — Server-side Supabase Admin Client
// Uses the Service Role Key to bypass Row Level Security (RLS).
// NEVER import this in client-side code — it grants full database access.
//
// Usage:
//   import { supabaseAdmin } from '../lib/supabaseAdmin';

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isBrowser = typeof window !== "undefined";

if (process.env.NODE_ENV !== "production") {
  console.log("[supabaseAdmin.js] Initializing...");
  console.log("[supabaseAdmin.js] Browser context:", isBrowser);
  console.log(
    "[supabaseAdmin.js] NEXT_PUBLIC_SUPABASE_URL:",
    supabaseUrl ? "✓ set" : "✗ MISSING",
  );
  console.log(
    "[supabaseAdmin.js] SUPABASE_SERVICE_ROLE_KEY:",
    serviceRoleKey ? "✓ set" : "✗ MISSING",
  );
}

if (isBrowser) {
  console.error(
    "[supabaseAdmin] ⚠️ Browser import detected — do not import supabaseAdmin in client code.",
  );
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "[supabaseAdmin] MISSING ENV VARS — Ensure NEXT_PUBLIC_SUPABASE_URL and " +
      "SUPABASE_SERVICE_ROLE_KEY are set in .env.local",
  );
}

/**
 * Supabase admin client — bypasses RLS with the Service Role Key.
 * Use for server-side automation (ingestion, cron jobs, admin operations).
 */
export const supabaseAdmin = isBrowser
  ? null
  : createClient(supabaseUrl || "", serviceRoleKey || "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

if (process.env.NODE_ENV !== "production") {
  if (supabaseAdmin) {
    console.log("[supabaseAdmin.js] ✓ Client initialized successfully");
  } else {
    console.error("[supabaseAdmin.js] ✗ Client is NULL (browser context)");
  }
}
