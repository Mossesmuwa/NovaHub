import { supabase, getCurrentUser, getUserProfile } from "./supabase";

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
}

export async function resetPassword(email) {
  if (!supabase) return { success: false, error: "Database not ready." };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/account/reset-password",
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
