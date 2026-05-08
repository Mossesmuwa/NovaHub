// lib/pipeline/ProductHuntProvider.js

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

// Minimal query — only fields confirmed to exist in PH API v2
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
          createdAt
          thumbnail { url }
          topics { edges { node { name } } }
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
    if (!token) throw new Error("PRODUCTHUNT_DEVELOPER_TOKEN not set.");

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

    if (!res.ok) throw new Error(`Product Hunt API error: ${res.status}`);

    const data = await res.json();
    if (data.errors)
      throw new Error(`Product Hunt GraphQL error: ${data.errors[0]?.message}`);

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
      const category = this._mapCategory(topics);
      const slug = slugify(`${post.name} ph ${post.id}`, {
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
        tags,
        vibe_tags: [],
        pricing: "Freemium",
        affiliate_link: post.website || post.url || null,
        source_url: post.url || null,
        source_id: String(post.id),
        source_name: "producthunt",
        trending: false,
        approved: true,
      };
    });
  }
}
