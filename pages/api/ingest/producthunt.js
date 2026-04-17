// pages/api/ingest/producthunt.js
// NovaHub — Product Hunt Ingestion Cron
// Runs daily at 5am UTC (see vercel.json).
// Uses the Product Hunt GraphQL API v2 with Developer Token.
//
// Setup:
//   1. Get token at: https://www.producthunt.com/v2/oauth/applications
//   2. Add PRODUCTHUNT_DEVELOPER_TOKEN to Vercel env vars (already in .env.local)
//   3. Add CRON_SECRET to Vercel env vars

import { createClient } from "@supabase/supabase-js";
import { getEnvCredential } from "../../../lib/helpers";

export const config = { maxDuration: 60 };

const PH_API = "https://api.producthunt.com/v2/api/graphql";
const BATCH_SIZE = 20; // posts per run

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// ─── Slugify ──────────────────────────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ─── Map PH topic → NovaHub category ─────────────────────────────────────────
const TOPIC_MAP = {
  "Artificial Intelligence": "ai-tools",
  "Developer Tools": "ai-tools",
  Productivity: "productivity",
  "Design Tools": "design",
  Cybersecurity: "security",
  Finance: "finance",
  Education: "courses",
  Marketing: "productivity",
  Analytics: "productivity",
  "Health & Fitness": "productivity",
};

function mapCategory(topics = []) {
  for (const t of topics) {
    if (TOPIC_MAP[t.name]) return TOPIC_MAP[t.name];
  }
  return "ai-tools"; // default for PH — most things are tools
}

// ─── GraphQL query — fetch today's trending posts ────────────────────────────
const TRENDING_QUERY = `
  query TrendingPosts($first: Int!) {
    posts(first: $first, order: VOTES) {
      edges {
        node {
          id
          name
          tagline
          description
          url
          website
          votesCount
          commentsCount
          createdAt
          thumbnail { url }
          topics { edges { node { name } } }
          pricing { unit }
          makers { edges { node { username } } }
        }
      }
    }
  }
`;

// ─── Fetch from Product Hunt API ──────────────────────────────────────────────
async function fetchPHTrending(limit = BATCH_SIZE) {
  const token = getEnvCredential(
    "PRODUCTHUNT_DEVELOPER_TOKEN",
    "PRODUCTHUNT_ACCESS_TOKEN",
  );
  const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

  const res = await fetch(PH_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: TRENDING_QUERY,
      variables: { first: limit },
    }),
  });

  if (!res.ok) throw new Error(`PH API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (data.errors) throw new Error(`PH GraphQL: ${data.errors[0]?.message}`);
  return data.data?.posts?.edges?.map((e) => e.node) || [];
}

// ─── Map PH post → NovaHub item ──────────────────────────────────────────────
function phPostToItem(post) {
  const topics = post.topics?.edges?.map((e) => e.node) || [];
  const category = mapCategory(topics);
  const makers =
    post.makers?.edges?.map((e) => e.node.username).join(", ") || "";

  // Detect pricing — PH has a pricing field but it's often null
  const pricingRaw = post.pricing?.unit;
  const pricing = pricingRaw
    ? pricingRaw.toLowerCase().includes("free")
      ? "Free"
      : "Paid"
    : "Freemium"; // PH default — most tools have a free tier

  const name = post.name;
  const year = post.createdAt
    ? new Date(post.createdAt).getFullYear()
    : new Date().getFullYear();
  const tags = [
    "product-hunt",
    "tool",
    ...topics.map((t) => slugify(t.name)),
  ].slice(0, 8);

  return {
    slug: slugify(name) + "-ph-" + post.id,
    name,
    short_desc: post.tagline || "",
    long_desc: post.description || post.tagline || "",
    category_id: category,
    type: "tool",
    image: post.thumbnail?.url || null,
    year,
    rating: null, // PH has votes not a rating score
    rating_count: post.votesCount || 0,
    company: makers,
    tags,
    vibe_tags: [],
    affiliate_link: post.website || post.url || null,
    source_url: post.url || null,
    source_id: String(post.id),
    source_name: "producthunt",
    pricing,
    trending: false,
    featured: false,
    approved: true,
  };
}

// ─── Upsert to Supabase ───────────────────────────────────────────────────────
async function upsertItems(items) {
  const { error } = await supabase.from("items").upsert(items, {
    onConflict: "source_id,source_name",
    ignoreDuplicates: false,
  });
  if (error) throw error;
  return items.length;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const phToken = getEnvCredential(
    "PRODUCTHUNT_DEVELOPER_TOKEN",
    "PRODUCTHUNT_ACCESS_TOKEN",
  );

  if (!phToken) {
    return res
      .status(500)
      .json({ error: "Product Hunt API credential not set" });
  }

  try {
    const posts = await fetchPHTrending(BATCH_SIZE);
    if (!posts.length) {
      return res
        .status(200)
        .json({ success: true, count: 0, message: "No posts returned" });
    }

    const items = posts.map(phPostToItem);
    const count = await upsertItems(items);

    console.log(`[ingest/producthunt] Upserted ${count} items`);
    return res
      .status(200)
      .json({ success: true, count, sample: items[0]?.name });
  } catch (err) {
    console.error("[ingest/producthunt]", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
