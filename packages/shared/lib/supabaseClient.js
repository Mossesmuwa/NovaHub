import { createClient } from "@supabase/supabase-js";

// ======================================================
// ENVIRONMENT VARIABLES
// ======================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate env early (fail fast in dev)
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== "production") {
    console.error(
      "[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
}

// ======================================================
// SINGLETON CLIENT
// ======================================================
let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("[Supabase] Cannot initialize client: missing env vars");
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}

// ======================================================
// MAIN CLIENT EXPORT (STANDARD USAGE)
// ======================================================
export const supabase = getSupabase();

// ======================================================
// HELPERS
// ======================================================

export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) return null;

    return user;
  } catch (err) {
    console.error("[Supabase] getCurrentUser error:", err);
    return null;
  }
}

export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) return null;

    return session;
  } catch (err) {
    console.error("[Supabase] getCurrentSession error:", err);
    return null;
  }
}

export async function getUserProfile(uid, fields = "*") {
  if (!uid) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(fields)
      .eq("id", uid)
      .single();

    if (error) return null;

    return data;
  } catch (err) {
    console.error("[Supabase] getUserProfile error:", err);

    return null;
  }
}
