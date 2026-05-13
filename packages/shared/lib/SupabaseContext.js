// ======================================================
// FILE: packages/shared/lib/SupabaseContext.js
// PURPOSE:
// Global auth + profile state for ALL apps (web + admin)
//
// FEATURES:
// - Single auth state source
// - Auto session sync
// - Profile hydration
// - Strict Mode safe
// - Race-condition safe
// ======================================================

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getSupabase } from "./supabaseClient";

const SupabaseContext = createContext(null);

// ======================================================
// PROVIDER
// ======================================================
export function SupabaseProvider({ children }) {
  const supabase = useMemo(() => getSupabase(), []);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent race conditions
  const activeUserId = useRef(null);

  // ------------------------------------------------------
  // Fetch profile safely
  // ------------------------------------------------------
  async function fetchProfile(userId) {
    if (!supabase || !userId) return;

    activeUserId.current = userId;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // Ignore stale responses
      if (activeUserId.current !== userId) return;

      setProfile(data || null);
    } catch {
      if (activeUserId.current === userId) {
        setProfile(null);
      }
    }
  }

  // ------------------------------------------------------
  // INITIAL AUTH LOAD
  // ------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Authoritative user fetch
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(user ?? null);

      if (user) {
        await fetchProfile(user.id);
      }

      if (mounted) setLoading(false);
    }

    init();

    // --------------------------------------------------
    // AUTH STATE LISTENER
    // --------------------------------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;

      setUser(u);

      if (u) {
        fetchProfile(u.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // ------------------------------------------------------
  // CONTEXT VALUE (stable)
  // ------------------------------------------------------
  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      supabase,
      setProfile,
    }),
    [user, profile, loading, supabase],
  );

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

// ======================================================
// HOOK
// ======================================================
export function useSupabase() {
  const ctx = useContext(SupabaseContext);

  if (!ctx) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }

  return ctx;
}
