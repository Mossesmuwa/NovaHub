import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

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
