// lib/pipeline/ProductHuntProvider.js
// NovaHub — AI Content Pipeline
// Fetches trending AI tools from Product Hunt via GraphQL API v2.

import slugify from "slugify";
import { BaseProvider } from "./BaseProvider.js";
import { getEnvCredential } from "../helpers.js";

const PH_API = "https://api.producthunt.com/v2/api/graphql";

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

// Note: 'pricing' field removed — no longer exists on PH Post type
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
          makers { edges { node { username } } }
        }
      }
    }
  }
`;

export class ProductHuntProvider extends BaseProvider {
  constructor(options = {}) {
    super("ProductHunt");
    this.limit = options.limit || 50;
  }

  async fetch() {
    const token = getEnvCredential(
      "PRODUCTHUNT_DEVELOPER_TOKEN",
      "PRODUCTHUNT_ACCESS_TOKEN",
    );
    if (!token) {
      throw new Error(
        "Product Hunt API credential not set (PRODUCTHUNT_DEVELOPER_TOKEN or PRODUCTHUNT_ACCESS_TOKEN).",
      );
    }

    const res = await fetch(PH_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: TRENDING_QUERY,
        variables: { first: this.limit },
      }),
    });

    if (!res.ok) {
      throw new Error(
        `Product Hunt API error: ${res.status} ${res.statusText}`,
      );
    }

    const data = await res.json();
    if (data.errors) {
      throw new Error(`Product Hunt GraphQL error: ${data.errors[0]?.message}`);
    }

    const posts = data.data?.posts?.edges?.map((e) => e.node) || [];
    console.log(`[Pipeline:ProductHunt] Fetched ${posts.length} posts`);
    return posts;
  }

  _mapCategory(topics = []) {
    for (const t of topics) {
      if (TOPIC_MAP[t.name]) return TOPIC_MAP[t.name];
    }
    return "ai-tools";
  }

  transform(rawPosts) {
    return rawPosts.map((post) => {
      const topics = post.topics?.edges?.map((e) => e.node) || [];
      const makers =
        post.makers?.edges?.map((e) => e.node.username).join(", ") || "";
      const category = this._mapCategory(topics);
      const name = post.name;
      const year = post.createdAt
        ? new Date(post.createdAt).getFullYear()
        : new Date().getFullYear();
      const slug = slugify(`${name} ph ${post.id}`, {
        lower: true,
        strict: true,
      });
      const tags = [
        "product-hunt",
        "tool",
        ...topics.map((t) => slugify(t.name, { lower: true, strict: true })),
      ].slice(0, 8);

      return {
        slug,
        name,
        short_desc: post.tagline || "",
        long_desc: post.description || post.tagline || "",
        category_id: category,
        type: "tool",
        image: post.thumbnail?.url || null,
        year,
        rating: null,
        rating_count: post.votesCount || 0,
        company: makers,
        tags,
        vibe_tags: [],
        pricing: "Freemium",
        affiliate_link: post.website || post.url || null,
        source_url: post.url || null,
        source_id: String(post.id),
        source_name: "producthunt",
        trending: false,
        featured: false,
        approved: true,
      };
    });
  }
}
