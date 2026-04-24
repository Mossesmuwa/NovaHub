// lib/ingest/ProductHuntProvider.js
// Fetches trending tools from Product Hunt GraphQL API and upserts into Supabase.

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const PH_API = "https://api.producthunt.com/v2/api/graphql";

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const TOPIC_MAP = {
  "Artificial Intelligence": "ai-tools",
  "Developer Tools": "ai-tools",
  Productivity: "productivity",
  "Design Tools": "design",
  Cybersecurity: "security",
  Finance: "finance",
  Education: "courses",
  "No-Code": "productivity",
  Marketing: "productivity",
  Analytics: "productivity",
};

function mapCategory(topics = []) {
  for (const t of topics) {
    if (TOPIC_MAP[t.name]) return TOPIC_MAP[t.name];
  }
  return "ai-tools";
}

const QUERY = `
  query($first: Int!) {
    posts(first: $first, order: VOTES) {
      edges {
        node {
          id name tagline description url website
          votesCount commentsCount createdAt
          thumbnail { url }
          topics { edges { node { name } } }
          makers  { edges { node { username } } }
        }
      }
    }
  }
`;

async function fetchTrending(limit) {
  const token = process.env.PRODUCTHUNT_DEVELOPER_TOKEN;
  if (!token) throw new Error("PRODUCTHUNT_DEVELOPER_TOKEN not set");

  const res = await fetch(PH_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { first: limit } }),
  });

  if (!res.ok) throw new Error(`PH API ${res.status}`);
  const data = await res.json();
  if (data.errors)
    throw new Error(data.errors[0]?.message || "PH GraphQL error");
  return data.data?.posts?.edges?.map((e) => e.node) || [];
}

function phToItem(post) {
  const topics = post.topics?.edges?.map((e) => e.node) || [];
  const category = mapCategory(topics);
  const name = post.name;
  const tags = [
    "product-hunt",
    "tool",
    ...topics.map((t) => slugify(t.name)),
  ].slice(0, 8);

  return {
    slug: `${slugify(name)}-ph-${post.id}`,
    name,
    short_desc: post.tagline || "",
    long_desc: post.description || post.tagline || "",
    category_id: category,
    type: "tool",
    image: post.thumbnail?.url || null,
    year: post.createdAt
      ? new Date(post.createdAt).getFullYear()
      : new Date().getFullYear(),
    rating: null,
    rating_count: post.votesCount || 0,
    pricing: "Freemium",
    tags,
    vibe_tags: [],
    affiliate_link: post.website || post.url || null,
    source_url: post.url || null,
    source_id: `ph-${post.id}`,
    source_name: "producthunt",
    trending: false,
    approved: true,
  };
}

export class ProductHuntProvider {
  constructor({ limit = 20 } = {}) {
    this.limit = limit;
  }

  async sync() {
    if (!supabaseAdmin) {
      throw new Error("Admin client not initialized");
    }
    const results = { count: 0, errors: [] };

    try {
      const posts = await fetchTrending(this.limit);
      if (!posts.length) return { ...results, message: "No posts returned" };

      const items = posts.map(phToItem);
      const { error } = await supabaseAdmin
        .from("items")
        .upsert(items, { onConflict: "slug", ignoreDuplicates: false });
      if (error) throw error;
      results.count = items.length;
    } catch (e) {
      results.errors.push(e.message);
    }

    console.log("[ProductHuntProvider]", results);
    return results;
  }
}
