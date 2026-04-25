import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const PH_API = "https://api.producthunt.com/v2/api/graphql";

const QUERY = `
query($first: Int!) {
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
        createdAt
        thumbnail { url }
        topics { edges { node { name } } }
      }
    }
  }
}
`;

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
};

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function mapCategory(topics = []) {
  for (const t of topics) {
    if (TOPIC_MAP[t.name]) return TOPIC_MAP[t.name];
  }
  return "ai-tools";
}

export class ProductHuntProvider {
  constructor({ limit = 20 } = {}) {
    this.limit = limit;
  }

  async fetchPosts() {
    const token = process.env.PRODUCTHUNT_DEVELOPER_TOKEN;

    console.log("[PH] Token:", token ? "SET" : "MISSING");

    if (!token) {
      throw new Error("Missing PRODUCTHUNT_DEVELOPER_TOKEN");
    }

    const res = await fetch(PH_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { first: this.limit },
      }),
    });

    console.log("[PH] Status:", res.status);

    const data = await res.json();

    if (data.errors) {
      console.error("[PH] GraphQL error:", data.errors);
      throw new Error(data.errors[0]?.message);
    }

    const posts = data.data?.posts?.edges?.map((e) => e.node) || [];

    console.log("[PH] Posts fetched:", posts.length);

    return posts;
  }

  transform(posts) {
    return posts.map((post) => {
      const topics = post.topics?.edges?.map((e) => e.node) || [];
      const category = mapCategory(topics);

      return {
        slug: `${slugify(post.name)}-ph-${post.id}`,
        name: post.name,
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
        tags: [
          "product-hunt",
          "tool",
          ...topics.map((t) => slugify(t.name)),
        ].slice(0, 8),
        vibe_tags: [],
        affiliate_link: post.website || post.url || null,
        source_url: post.url || null,
        source_id: `ph-${post.id}`,
        source_name: "producthunt",
        trending: false,
        approved: true,
      };
    });
  }

  async sync() {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin not initialized");
    }

    try {
      const posts = await this.fetchPosts();

      if (!posts.length) {
        return { success: true, count: 0, message: "No posts returned" };
      }

      const items = this.transform(posts);

      console.log("[PH] Inserting items:", items.length);

      const { error } = await supabaseAdmin
        .from("items")
        .upsert(items, { onConflict: "slug" });

      if (error) {
        console.error("[PH] Insert error:", error);
        throw error;
      }

      return {
        success: true,
        count: items.length,
      };
    } catch (err) {
      console.error("[PH] Sync failed:", err.message);
      return {
        success: false,
        error: err.message,
      };
    }
  }
}
