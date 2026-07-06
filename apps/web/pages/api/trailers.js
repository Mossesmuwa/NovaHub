import { getSupabase } from "shared/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const tmdbId = req.query.tmdb_id;
  if (!tmdbId) {
    return res.status(400).json({ success: false, error: "Missing tmdb_id" });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("items")
      .select("metadata")
      .eq("id", tmdbId)
      .single();

    if (error) {
      return res.status(200).json({ success: true, trailers: [] });
    }

    const metadata = data?.metadata || {};
    const trailers = Array.isArray(metadata.trailers) ? metadata.trailers : [];

    return res.status(200).json({ success: true, trailers });
  } catch (err) {
    console.error("[trailers] failed", err);
    return res.status(200).json({ success: true, trailers: [] });
  }
}
