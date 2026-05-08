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

  const { slug } = req.query;
  if (!slug) {
    return res
      .status(400)
      .json({ success: false, error: "Item slug is required" });
  }

  try {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, item: data });
  } catch (err) {
    console.error("[API /api/items/[slug]]", err);
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to load item" });
  }
}
