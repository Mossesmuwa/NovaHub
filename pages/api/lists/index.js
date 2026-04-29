// pages/api/lists/index.js
// NovaHub — List API
// GET  /api/lists       → get current user's lists
// POST /api/lists       → create a new list (Pro only)

import { supabase } from "../../../lib/supabase";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

async function getVerifiedUser(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

async function isProUser(userId) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("is_pro")
    .eq("id", userId)
    .single();
  return data?.is_pro || false;
}

export default async function handler(req, res) {
  const user = await getVerifiedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("lists")
      .select("id, name, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ lists: data || [] });
  }

  if (req.method === "POST") {
    // Pro gate
    const pro = await isProUser(user.id);
    if (!pro)
      return res
        .status(403)
        .json({ error: "Nova Pro required to create lists." });

    const { name, description } = req.body;
    if (!name?.trim())
      return res.status(400).json({ error: "List name is required." });
    if (name.length > 80)
      return res.status(400).json({ error: "Name too long (max 80 chars)." });

    // Limit: max 20 lists per user
    const { count } = await supabaseAdmin
      .from("lists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (count >= 20)
      return res.status(400).json({ error: "Maximum 20 lists allowed." });

    const { data, error } = await supabaseAdmin
      .from("lists")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ list: data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
