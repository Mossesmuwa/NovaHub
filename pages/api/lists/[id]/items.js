// pages/api/lists/[id]/items.js
// POST   → add item to list
// DELETE → remove item from list

import { supabase } from "../../../../lib/supabase";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

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

export default async function handler(req, res) {
  const user = await getVerifiedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { id: listId } = req.query;

  // Verify list belongs to this user
  const { data: list, error: listErr } = await supabaseAdmin
    .from("lists")
    .select("id, user_id")
    .eq("id", listId)
    .single();

  if (listErr || !list)
    return res.status(404).json({ error: "List not found" });
  if (list.user_id !== user.id)
    return res.status(403).json({ error: "Forbidden" });

  if (req.method === "POST") {
    const { item_id } = req.body;
    if (!item_id) return res.status(400).json({ error: "item_id is required" });

    const { data, error } = await supabaseAdmin
      .from("list_items")
      .insert({ list_id: listId, item_id })
      .select()
      .single();

    if (error) {
      if (error.code === "23505")
        return res.status(409).json({ error: "Item already in list" });
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ item: data });
  }

  if (req.method === "DELETE") {
    const { item_id } = req.body;
    if (!item_id) return res.status(400).json({ error: "item_id is required" });

    await supabaseAdmin
      .from("list_items")
      .delete()
      .eq("list_id", listId)
      .eq("item_id", item_id);

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
