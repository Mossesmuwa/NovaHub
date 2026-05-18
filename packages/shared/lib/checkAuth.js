// ======================================================
// FILE: packages/shared/lib/checkAuth.js
// PURPOSE:
// Universal auth verification helper for all apps
// Checks user session + admin role when needed
// ======================================================

import { supabase } from "./supabaseClient";

/**
 * Check if user is authenticated + get profile
 * @returns {Object} {authenticated: boolean, user: Object|null, profile: Object|null, error: string|null}
 */
export async function checkAuth() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { authenticated: false, user: null, profile: null, error: null };
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return {
        authenticated: true,
        user,
        profile: null,
        error: profileError.message,
      };
    }

    return { authenticated: true, user, profile, error: null };
  } catch (error) {
    return {
      authenticated: false,
      user: null,
      profile: null,
      error: error.message,
    };
  }
}

/**
 * Check if user is admin
 * @returns {boolean}
 */
export async function isAdmin() {
  const { user, profile } = await checkAuth();
  return user && profile && profile.is_admin === true;
}

/**
 * Server-side auth check (use in getServerSideProps)
 * @param {Object} context - Next.js context
 * @returns {Object} {authenticated: boolean, user: Object|null, profile: Object|null}
 */
export async function checkAuthSSR(context) {
  try {
    // Get session from cookies
    const session = await supabase.auth.getSession();

    if (!session?.data?.session) {
      return { authenticated: false, user: null, profile: null };
    }

    const user = session.data.session.user;

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return { authenticated: true, user, profile };
  } catch (error) {
    return { authenticated: false, user: null, profile: null };
  }
}

/**
 * Check admin role specifically
 * @returns {boolean}
 */
export async function checkAdminRole() {
  const { user, profile } = await checkAuth();
  if (!user || !profile) return false;
  return profile.is_admin === true;
}
