// js/supabase.js — NovaHub Database Client
// Load AFTER the Supabase CDN script tag
// Environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

const NOVA_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://twkevfnwvrocaxiplcjk.supabase.co";
const NOVA_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3a2V2Zm53dnJvY2F4aXBsY2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDA2MzYsImV4cCI6MjA4OTc3NjYzNn0.ISpw7w-s_jkAf4NnYn7kYoDzhfYHOoqopjlHt-AE2Y4";

// Safe init — works with CDN (window.supabase) on all browsers
let _db = null;
(function initDB() {
  try {
    const sdk = window.supabase;
    if (sdk && typeof sdk.createClient === "function") {
      _db = sdk.createClient(NOVA_URL, NOVA_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } else {
      console.warn("[NovaHub] Supabase SDK missing — check CDN script order");
    }
  } catch (e) {
    console.error("[NovaHub] Supabase init failed:", e);
  }
})();

// ── Helpers (all safe — return null on error) ─────────────
async function _getUser() {
  if (!_db) return null;
  try {
    const { data } = await _db.auth.getUser();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

async function _getSession() {
  if (!_db) return null;
  try {
    const { data } = await _db.auth.getSession();
    return data?.session ?? null;
  } catch {
    return null;
  }
}

async function _getProfile(uid) {
  if (!_db || !uid) return null;
  try {
    const { data } = await _db
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

// Auth state broadcasts
if (_db) {
  _db.auth.onAuthStateChange((event, session) => {
    window.dispatchEvent(
      new CustomEvent("nova:auth", { detail: { event, session } }),
    );
  });
}

window.NovaDB = {
  get client() {
    return _db;
  },
  getCurrentUser: _getUser,
  getCurrentSession: _getSession,
  getUserProfile: _getProfile,
  isLoggedIn: async () => !!(await _getUser()),
};
