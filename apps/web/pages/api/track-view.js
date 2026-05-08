// pages/api/track-view.js
// Endpoint to track item views server-side (prevents cheating)
// Called from frontend after fetching item details

import { supabaseAdmin } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { itemId } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: "itemId required" });
  }

  // Basic rate limiting: check IP (optional)
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    // Use service role to bypass RLS and increment view_count
    const { error } = await supabaseAdmin
      .from("items")
      .update({ view_count: supabaseAdmin.rpc("increment", { x: 1 }) }) // If using RPC
      .eq("id", itemId);

    // Alternative: Fetch current value and increment
    // This is safer as it doesn't require an RPC function
    const { data: item } = await supabaseAdmin
      .from("items")
      .select("view_count")
      .eq("id", itemId)
      .single();

    if (item) {
      await supabaseAdmin
        .from("items")
        .update({ view_count: (item.view_count || 0) + 1 })
        .eq("id", itemId);
    }

    // Optional: Log the view in a separate table for analytics
    // await supabaseAdmin.from("item_views").insert({
    //   item_id: itemId,
    //   user_agent: req.headers["user-agent"],
    //   ip_hash: hashIp(ip),
    // });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Track view error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to track view" });
  }
}
