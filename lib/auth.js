import { supabase, getCurrentUser, getUserProfile } from "./supabase";

const ANON_LIMITS = { maxFavorites: 10, maxCommentsPerDay: 5 };

function _anonId() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("nova_anon_id");
  } catch {
    return null;
  }
}
function _setAnonId(id) {
  try {
    localStorage.setItem("nova_anon_id", id);
  } catch {}
}
function _clearAnonId() {
  try {
    localStorage.removeItem("nova_anon_id");
  } catch {}
}

function _fingerprint() {
  if (typeof window === "undefined") return "ssr";
  try {
    return btoa(
      [
        navigator.userAgent || "",
        navigator.language || "",
        (screen.width || 0) + "x" + (screen.height || 0),
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 0,
      ].join("|"),
    ).slice(0, 64);
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

export async function register(email, password, displayName) {
  if (!supabase) return { success: false, error: "Database not ready." };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: displayName } },
  });
  if (error) return { success: false, error: error.message };
  return { success: true, user: data.user };
}

export async function login(email, password) {
  if (!supabase) return { success: false, error: "Database not ready." };
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { success: false, error: error.message };
  mergeAnonData(data.user.id).catch(() => {});
  return { success: true, user: data.user };
}

export async function loginWithGoogle(redirectTo) {
  if (!supabase) return { success: false, error: "Database not ready." };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo || window.location.origin + "/account/dashboard",
    },
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function loginWithGithub(redirectTo) {
  if (!supabase) return { success: false, error: "Database not ready." };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: redirectTo || window.location.origin + "/account/dashboard",
    },
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function loginWithApple(redirectTo) {
  if (!supabase) return { success: false, error: "Database not ready." };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: redirectTo || window.location.origin + "/account/dashboard",
    },
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function logout() {
  if (!supabase) return;
  await supabase.auth.signOut().catch(() => {});
  _clearAnonId();
}

export async function resetPassword(email) {
  if (!supabase) return { success: false, error: "Database not ready." };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/account/reset-password",
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getOrCreateAnonSession() {
  if (!supabase) return null;
  const existingId = _anonId();
  if (existingId) {
    try {
      const { data } = await supabase
        .from("anon_sessions")
        .select("*")
        .eq("id", existingId)
        .gt("expires_at", new Date().toISOString())
        .single();
      if (data) {
        supabase
          .from("anon_sessions")
          .update({ last_seen: new Date().toISOString() })
          .eq("id", existingId)
          .then(() => {})
          .catch(() => {});
        return data;
      }
    } catch {}
  }
  try {
    const { data, error } = await supabase
      .from("anon_sessions")
      .insert({
        fingerprint: _fingerprint(),
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      })
      .select()
      .single();
    if (!error && data) {
      _setAnonId(data.id);
      return data;
    }
  } catch {}
  return null;
}

export async function checkAnonLimit(type) {
  if (!supabase) return { allowed: true };
  const id = _anonId();
  if (!id) return { allowed: true };
  try {
    const { data } = await supabase
      .from("anon_sessions")
      .select("favorites_count, comments_today, last_comment_date")
      .eq("id", id)
      .single();
    if (!data) return { allowed: true };
    if (
      type === "favorites" &&
      data.favorites_count >= ANON_LIMITS.maxFavorites
    ) {
      return {
        allowed: false,
        showUpgrade: true,
        reason: `You've reached the ${ANON_LIMITS.maxFavorites} item limit for anonymous users. Create a free account to save unlimited items.`,
      };
    }
    if (type === "comments") {
      const today = new Date().toISOString().split("T")[0];
      const isToday = data.last_comment_date === today;
      const todayCount = isToday ? data.comments_today || 0 : 0;
      if (todayCount >= ANON_LIMITS.maxCommentsPerDay) {
        return {
          allowed: false,
          showUpgrade: true,
          reason: `You've reached ${ANON_LIMITS.maxCommentsPerDay} comments today. Sign up for unlimited comments.`,
        };
      }
    }
  } catch {}
  return { allowed: true };
}

export async function mergeAnonData(userId) {
  if (!supabase) return;
  const id = _anonId();
  if (!id) return;
  try {
    const { data: favs } = await supabase
      .from("favorites")
      .select("item_id")
      .eq("anon_id", id);
    if (favs && favs.length) {
      // Free users can only have 10 favorites max. If anon user had more, migrate the 10 most recent.
      const toMigrate =
        favs.length > ANON_LIMITS.maxFavorites
          ? favs.slice(-ANON_LIMITS.maxFavorites) // most recent 10
          : favs;

      await supabase.from("favorites").upsert(
        toMigrate.map((f) => ({ item_id: f.item_id, user_id: userId })),
        { onConflict: "item_id,user_id", ignoreDuplicates: true },
      );
      await supabase.from("favorites").delete().eq("anon_id", id);
    }
  } catch {}
  _clearAnonId();
}

export { ANON_LIMITS };
