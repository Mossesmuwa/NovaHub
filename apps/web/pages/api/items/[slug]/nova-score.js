// pages/api/items/[slug]/nova-score.js
// Returns Nova Score breakdown for an item with all verification data
import { getSupabase } from "../../../../../../packages/shared/lib/supabaseClient";

const supabase = getSupabase();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug } = req.query;

    // 1. Get item by slug
    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("*")
      .eq("slug", slug)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // 2. Get latest Nova Score from history
    const { data: scoreData, error: scoreError } = await supabase
      .from("nova_score_history")
      .select("*")
      .eq("item_id", item.id)
      .order("computed_at", { ascending: false })
      .limit(1)
      .single();

    // 3. Get previous score for trend calculation
    const { data: prevScoreData } = await supabase
      .from("nova_score_history")
      .select("score")
      .eq("item_id", item.id)
      .order("computed_at", { ascending: false })
      .offset(1)
      .limit(1)
      .single();

    // 4. Get quality metrics
    const { data: qualityData } = await supabase
      .from("item_quality_metrics")
      .select("*")
      .eq("item_id", item.id)
      .single();

    // 5. Get data sources from item metadata
    const dataSources = item.data_sources || [];

    // Calculate trend
    const currentScore = scoreData?.score || 75;
    const previousScore = prevScoreData?.score || currentScore;
    const trendPercent = previousScore
      ? Math.round(((currentScore - previousScore) / previousScore) * 100)
      : 0;

    // Build response
    return res.status(200).json({
      success: true,
      score: {
        value: currentScore,
        trend: trendPercent > 0 ? "up" : trendPercent < 0 ? "down" : "stable",
        percentChange: trendPercent,
        breakdown: scoreData?.breakdown || {
          github: 75,
          community: 70,
          credibility: 85,
          freshness: 90,
        },
        confidence: scoreData?.confidence || 80,
        lastCalculated: scoreData?.computed_at || new Date().toISOString(),
      },
      quality: {
        freshness: qualityData?.freshness_score || 90,
        completeness: qualityData?.completeness_score || 85,
        confidence: qualityData?.confidence_score || 80,
        lastUpdated: item.updated_at || new Date().toISOString(),
      },
      dataSources: dataSources.map((source) => ({
        name: source.name,
        url: source.url,
        type: source.type || "external",
        credibility: source.credibility || 80,
        lastUpdated: source.lastUpdated || new Date().toISOString(),
        verified: source.verified !== false,
      })),
      metadata: {
        itemId: item.id,
        slug: item.slug,
        name: item.name,
        category: item.category_id,
      },
    });
  } catch (err) {
    console.error("Nova Score API Error:", err);
    return res.status(500).json({
      error: "Failed to fetch Nova Score",
      message: err.message,
    });
  }
}
