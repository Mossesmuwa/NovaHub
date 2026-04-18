// lib/SupabaseContext.js
// Single source of truth for auth state across all pages.
// Wrap app in <SupabaseProvider> (_app.js already does this).
// Read state with useSupabase() — instant, no async, no flash.

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

const Ctx = createContext({
  user:       null,
  profile:    null,
  loading:    true,
  supabase,
  setProfile: () => {},
});

export function SupabaseProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data || null);
    } catch {
      setProfile(null);
    }
  }

  useEffect(() => {
    // Immediately resolve from cached session — no network round-trip
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id).finally(() => setLoading(false));
      else   setLoading(false);
    });

    // Keep in sync when auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) fetchProfile(u.id);
        else   setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider value={{ user, profile, loading, supabase, setProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSupabase() { return useContext(Ctx); }
export { supabase };
