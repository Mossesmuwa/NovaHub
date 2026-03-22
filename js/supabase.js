// js/supabase.js — NovaHub Supabase Client
// This file initialises the connection to your database
// Import this before any other JS file that needs data

const SUPABASE_URL = "https://twkevfnwvrocaxiplcjk.supabase.co";

// IMPORTANT: Replace this with your actual anon key from
// Supabase → Settings → API → anon public key
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3a2V2Zm53dnJvY2F4aXBsY2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDA2MzYsImV4cCI6MjA4OTc3NjYzNn0.ISpw7w-s_jkAf4NnYn7kYoDzhfYHOoqopjlHt-AE2Y4";

// ── Create Supabase client ───────────────────────────────
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Helper: current logged in user ───────────────────────
async function getCurrentUser() {
  const {
    data: { user },
  } = await db.auth.getUser();
  return user;
}

// ── Helper: current session ──────────────────────────────
async function getCurrentSession() {
  const {
    data: { session },
  } = await db.auth.getSession();
  return session;
}

// ── Helper: is user logged in ────────────────────────────
async function isLoggedIn() {
  const user = await getCurrentUser();
  return user !== null;
}

// ── Helper: get user profile ─────────────────────────────
async function getUserProfile(userId) {
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

// ── Listen for auth state changes ────────────────────────
db.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN") {
    window.dispatchEvent(new CustomEvent("nova:signin", { detail: session }));
  }
  if (event === "SIGNED_OUT") {
    window.dispatchEvent(new CustomEvent("nova:signout"));
  }
});

// ── Export for use in other files ────────────────────────
window.NovaDB = {
  client: db,
  getCurrentUser,
  getCurrentSession,
  isLoggedIn,
  getUserProfile,
};
