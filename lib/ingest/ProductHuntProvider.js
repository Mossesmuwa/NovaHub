// lib/ingest/ProductHuntProvider.js
// NovaHub — Product Hunt Content Provider
// Fetches trending AI tools & software from Product Hunt GraphQL API v2
// and maps them into the NovaHub items schema.

import { Pipeline } from './Pipeline.js';
import { getEnvCredential } from '../helpers.js';

const PH_API = 'https://api.producthunt.com/v2/api/graphql';

// ── Map PH topics → NovaHub category IDs ────────────────────────────────────
const TOPIC_MAP = {
  'Artificial Intelligence': 'ai-tools',
  'Developer Tools':         'ai-tools',
  'Machine Learning':        'ai-tools',
  'Productivity':            'productivity',
  'Design Tools':            'design',
  'Cybersecurity':           'security',
  'Finance':                 'finance',
  'Education':               'courses',
  'Marketing':               'productivity',
  'Analytics':               'productivity',
  'Health & Fitness':        'productivity',
  'Open Source':             'ai-tools',
  'SaaS':                    'productivity',
};

// ── GraphQL query — trending posts by votes ─────────────────────────────────
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

/**
 * ProductHuntProvider — pulls trending tools from Product Hunt.
 *
 * Environment:
 *   PRODUCTHUNT_DEVELOPER_TOKEN  or  PRODUCTHUNT_ACCESS_TOKEN
 *
 * Schema mapping:
 *   category_id: mapped via TOPIC_MAP (default 'ai-tools')
 *   type: 'tool'
 *   slug: slugified name + 'ph' + PH post ID
 */
export class ProductHuntProvider extends Pipeline {
  /**
   * @param {Object} [options]
   * @param {number} [options.limit=20] — max posts to fetch
   */
  constructor(options = {}) {
    super('ProductHunt', 'ai-tools');
    this.limit = options.limit || 20;
  }

  /**
   * Fetch trending posts from the Product Hunt GraphQL API.
   * @returns {Promise<Array<Object>>} Array of PH post node objects
   */
  async fetch() {
    const token = getEnvCredential('PRODUCTHUNT_DEVELOPER_TOKEN', 'PRODUCTHUNT_ACCESS_TOKEN');
    if (!token) {
      throw new Error('Product Hunt credential not set (PRODUCTHUNT_DEVELOPER_TOKEN or PRODUCTHUNT_ACCESS_TOKEN).');
    }

    const res = await fetch(PH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: TRENDING_QUERY,
        variables: { first: this.limit },
      }),
    });

    if (!res.ok) {
      throw new Error(`Product Hunt API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (data.errors) {
      throw new Error(`Product Hunt GraphQL: ${data.errors[0]?.message}`);
    }

    return data.data?.posts?.edges?.map((e) => e.node) || [];
  }

  /**
   * Map a list of PH topics to a NovaHub category ID.
   * @param {Array<Object>} topics — [{ name: "Artificial Intelligence" }, ...]
   * @returns {string} NovaHub category_id
   */
  _mapCategory(topics = []) {
    for (const t of topics) {
      if (TOPIC_MAP[t.name]) return TOPIC_MAP[t.name];
    }
    return this.defaultCategory;
  }

  /**
   * Transform Product Hunt posts into NovaHub item format.
   * @param {Array<Object>} rawPosts — array of PH post node objects
   * @returns {Array<Object>} NovaHub-shaped item objects
   */
  transform(rawPosts) {
    return rawPosts.map((post) => {
      const topics  = post.topics?.edges?.map((e) => e.node) || [];
      const makers  = post.makers?.edges?.map((e) => e.node.username).join(', ') || '';
      const category = this._mapCategory(topics);

      // Pricing detection
      const pricingRaw = post.pricing?.unit;
      const pricing = pricingRaw
        ? pricingRaw.toLowerCase().includes('free') ? 'Free' : 'Paid'
        : 'Freemium';

      const name = post.name;
      const year = post.createdAt
        ? new Date(post.createdAt).getFullYear()
        : new Date().getFullYear();

      const slug = this.makeSlug(name, `ph-${post.id}`);

      const tags = [
        'product-hunt',
        'tool',
        ...topics.map((t) => this.makeSlug(t.name)),
      ].slice(0, 8);

      return {
        slug,
        name,
        short_desc: post.tagline || '',
        long_desc:  post.description || post.tagline || '',
        category_id: category,
        type: 'tool',
        image: post.thumbnail?.url || null,
        year,
        rating: null,
        rating_count: post.votesCount || 0,
        company: makers,
        tags,
        vibe_tags: [],
        affiliate_link: post.website || post.url || null,
        source_url: post.url || null,
        source_id: String(post.id),
        source_name: 'producthunt',
        pricing,
        trending: false,
        featured: false,
        approved: true,
      };
    });
  }
}
