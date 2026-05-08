import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== "production") {
    console.error(
      "MISSING SUPABASE ENV VARS: Check your .env.local file. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    );
  }
}

// ─── True singleton: only created ONCE per process ──────────────────────────
// This solves React Strict Mode double initialization + multiple instances
let supabaseInstance = null;

function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[Supabase] Cannot create client: missing environment variables",
    );
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (e) {
    console.error("Failed to create Supabase client:", e.message);
    supabaseInstance = null;
  }

  return supabaseInstance;
}

// Export lazy-initialized singleton
export const supabase = new Proxy(
  {},
  {
    get(_, prop) {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error(
          "[Supabase] Client not initialized. Check environment variables.",
        );
      }
      return client[prop];
    },
  },
);

// Direct reference for when you need the actual client object
export function getSupabase() {
  return getSupabaseClient();
}

export async function getCurrentUser() {
  const client = getSupabase();
  if (!client) return null;
  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error) throw error;
    return user;
  } catch (err) {
    console.error("Error fetching user:", err.message);
    return null;
  }
}

export async function getCurrentSession() {
  const client = getSupabase();
  if (!client) return null;
  const {
    data: { session },
    error,
  } = await client.auth.getSession();
  if (error) {
    console.error("Error fetching session:", error.message);
    return null;
  }
  return session;
}

export async function getUserProfile(uid, fields = "*") {
  const client = getSupabase();
  if (!client || !uid) return null;
  try {
    const { data, error } = await client
      .from("profiles")
      .select(fields)
      .eq("id", uid)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error(`Error fetching profile for ${uid}:`, err.message);
    return null;
  }
}
