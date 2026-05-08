// lib/SupabaseContext.js
// Single source of truth for auth state across all pages.
// Wrap app in <SupabaseProvider> (_app.js already does this).
// Read state with useSupabase() — instant, no async, no flash.
// Uses the shared singleton from supabaseClient.js (no double initialization).

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getSupabase } from "./supabaseClient";

const Ctx = createContext({
  user: null,
  profile: null,
  loading: true,
  supabase: null,
  setProfile: () => {},
});

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize the stable singleton reference to prevent effect re-runs in React Strict Mode
  const supabase = useMemo(() => getSupabase(), []);

  async function fetchProfile(userId) {
    if (!supabase) {
      setProfile(null);
      return;
    }
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data || null);
    } catch {
      setProfile(null);
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Immediately resolve from cached session — no network round-trip
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    // Keep in sync when auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <Ctx.Provider value={{ user, profile, loading, supabase, setProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSupabase() {
  return useContext(Ctx);
}
