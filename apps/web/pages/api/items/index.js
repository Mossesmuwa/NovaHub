import { getSupabase } from "../../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res
      .status(500)
      .json({ success: false, error: "Supabase not configured" });
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const category = req.query.category;
  const trending = String(req.query.trending).toLowerCase() === "true";

  try {
    let query = supabase.from("items").select("*").eq("approved", true);

    if (category && category !== "all") {
      query = query.eq("type", category);
    }

    if (trending) {
      query = query.eq("trending", true);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    return res.status(200).json({ success: true, items: data || [] });
  } catch (err) {
    console.error("[API /api/items]", err);
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to fetch items" });
  }
}
