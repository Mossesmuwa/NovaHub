import { supabase, getCurrentUser } from "./supabase";

export async function addFavorite(itemId) {
  if (!supabase) return { success: false, error: "Not ready." };
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please log in to save items." };
  try {
    const { error } = await supabase
      .from("favorites")
      .insert({ item_id: itemId, user_id: user.id });
    if (error) {
      if (error.code === "23505")
        return { success: false, error: "Already saved." };
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function removeFavorite(itemId) {
  if (!supabase) return { success: false, error: "Not ready." };
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Please log in to continue." };
  try {
    await supabase
      .from("favorites")
      .delete()
      .eq("item_id", itemId)
      .eq("user_id", user.id);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function isFavorited(itemId) {
  if (!supabase || !itemId) return false;
  const user = await getCurrentUser();
  if (!user) return false;
  try {
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("item_id", itemId)
      .eq("user_id", user.id)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

export async function getAllFavorites() {
  if (!supabase) return [];
  const user = await getCurrentUser();
  if (!user) return [];
  try {
    const { data: favs, error } = await supabase
      .from("favorites")
      .select("id, item_id, user_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Favorites fetch error:", error);
      return [];
    }

    if (!favs || favs.length === 0) return [];

    const itemIds = favs.map((f) => f.item_id);
    const { data: items } = await supabase
      .from("items")
      .select("*")
      .in("id", itemIds);

    return items || [];
  } catch (e) {
    console.error("getAllFavorites error:", e);
    return [];
  }
}
