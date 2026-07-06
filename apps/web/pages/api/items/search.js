// pages/api/items/search.js
// Search items by query with ranking by Nova Score
import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { q, exclude, limit = 12, offset = 0 } = req.query;

    // Validate query
    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ error: "Query must be at least 2 characters" });
    }

    // Build query
    let query = supabase
      .from("items")
      .select(
        "id, slug, name, short_desc, image, category_id, trending_score",
        { count: "exact" },
      )
      .ilike("name", `%${q}%`)
      .order("trending_score", { ascending: false })
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Exclude items if specified
    if (exclude) {
      query = query.neq("id", exclude);
    }

    const { data: items, error, count } = await query;

    if (error) {
      throw error;
    }

    // Enrich with Nova Scores if available
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const { data: scoreData } = await supabase
          .from("nova_score_history")
          .select("score")
          .eq("item_id", item.id)
          .order("computed_at", { ascending: false })
          .limit(1)
          .single();

        return {
          ...item,
          score: scoreData?.score || null,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      items: enrichedItems,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < count,
      },
      query: q,
    });
  } catch (err) {
    console.error("Search API Error:", err);
    return res.status(500).json({
      error: "Search failed",
      message: err.message,
    });
  }
}
