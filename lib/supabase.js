import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail loudly in development so you know exactly what's missing
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== "production") {
    console.error(
      "MISSING SUPABASE ENV VARS: Check your .env.local file. " +
        "Ensure they start with NEXT_PUBLIC_",
    );
  }
}

export const supabase = (() => {
  try {
    return createClient(supabaseUrl || "", supabaseAnonKey || "", {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (e) {
    console.error("Failed to create Supabase client:", e.message);
    return null;
  }
})();

// ── Helpers ─────────────────────────────────────────

/**
 * Gets the current authenticated user object
 */
export async function getCurrentUser() {
  if (!supabase) return null;
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (err) {
    console.error("Error fetching user:", err.message);
    return null;
  }
}

/**
 * Gets the current session details
 */
export async function getCurrentSession() {
  if (!supabase) return null;
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error("Error fetching session:", error.message);
    return null;
  }
  return session;
}

/**
 * Fetches a user profile by ID
 */
export async function getUserProfile(uid) {
  if (!supabase || !uid) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error(`Error fetching profile for ${uid}:`, err.message);
    return null;
  }
}
