import { createContext, useContext, useEffect, useState } from "react";
import { supabase, getUserProfile } from "./supabase";

const SupabaseContext = createContext();

export function SupabaseProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let ready = false;

    if (!supabase) {
      setLoading(false);
      return;
    }

    const applySession = async (sess) => {
      if (!mounted) return;
      setSession(sess);

      if (sess?.user) {
        setUser(sess.user);
        const prof = await getUserProfile(sess.user.id);
        if (mounted) setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }

      if (mounted && ready) {
        setLoading(false);
      }
    };

    const init = async () => {
      const {
        data: { session: initialSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Supabase session recover failed:", error.message);
      } else {
        await applySession(initialSession);
      }

      if (mounted) {
        ready = true;
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!ready) return;
      await applySession(sess);
    });

    init();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ session, user, profile, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  return useContext(SupabaseContext);
}
