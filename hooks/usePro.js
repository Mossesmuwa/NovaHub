// hooks/usePro.js
// NovaHub — Pro Status Hook
// Returns the current user's pro status, days remaining, and feature access map.
//
// Usage:
//   const { isPro, daysLeft, can, loading } = usePro();
//   if (!can('vibeDialUnlimited')) return <ProGate feature="vibeDialUnlimited" />;

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ─── Feature access map ───────────────────────────────────────────────────────
// Defines exactly what free vs pro users can do.
// Add new features here — ProGate + usePro read from this single source of truth.
export const FEATURES = {
  // Saves
  savesUnlimited:       { pro: true,  free: false, label: 'Unlimited saves'                },
  savesLimit:           { pro: null,  free: 10,    label: '10 saves on free tier'           },

  // Vibe Dial
  vibeDialUnlimited:    { pro: true,  free: false, label: 'Unlimited Vibe Dial uses'        },
  vibeDialFreeLimit:    { pro: null,  free: 3,     label: '3 Vibe Dial uses/day (free)'     },

  // AI features
  novaScore:            { pro: true,  free: false, label: 'Personalised match % on items'   },
  aiDigestPersonal:     { pro: true,  free: false, label: 'Weekly personalised AI digest'   },
  aiDigestGeneral:      { pro: false, free: true,  label: 'General weekly digest'            },

  // Lists
  publicLists:          { pro: true,  free: false, label: 'Public shareable lists'          },
  listCount:            { pro: null,  free: 3,     label: '3 lists max (free)'              },

  // History & taste
  tasteHistory:         { pro: true,  free: false, label: 'Taste evolution graph'           },
  exportData:           { pro: true,  free: false, label: 'Export saves & taste profile'    },

  // Access
  earlyAccess:          { pro: true,  free: false, label: 'Early access to new features'    },
  badgeProfile:         { pro: true,  free: false, label: 'Pro badge on public profile'     },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePro() {
  const [isPro,    setIsPro]    = useState(false);
  const [daysLeft, setDaysLeft] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [userId,   setUserId]   = useState(null);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (mounted) setLoading(false);
        return;
      }

      if (mounted) setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro, pro_expires_at')
        .eq('id', session.user.id)
        .single();

      if (!mounted) return;

      if (profile?.is_pro) {
        const expires = profile.pro_expires_at ? new Date(profile.pro_expires_at) : null;
        const now     = new Date();
        if (!expires || expires > now) {
          setIsPro(true);
          if (expires) {
            const days = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
            setDaysLeft(days);
          } else {
            setDaysLeft(null); // lifetime
          }
        }
      }

      setLoading(false);
    }

    check();

    // Re-check on auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  // Helper: check if user can access a specific feature
  function can(featureKey) {
    const feature = FEATURES[featureKey];
    if (!feature) {
      console.warn(`[usePro] Unknown feature: "${featureKey}"`);
      return false;
    }
    if (isPro)  return feature.pro  !== false;
    return feature.free !== false && feature.free !== null;
  }

  // Helper: get the limit for a numeric-limit feature
  function limit(featureKey) {
    const feature = FEATURES[featureKey];
    if (!feature) return 0;
    return isPro ? (feature.pro || Infinity) : (feature.free || 0);
  }

  return { isPro, daysLeft, can, limit, loading, userId };
}
