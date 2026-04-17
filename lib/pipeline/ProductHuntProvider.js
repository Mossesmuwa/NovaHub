// lib/pipeline/ProductHuntProvider.js
// NovaHub — AI Content Pipeline
// Fetches trending AI tools from Product Hunt via GraphQL API v2.

import slugify from 'slugify';
import { BaseProvider } from './BaseProvider.js';
import { getEnvCredential } from '../helpers.js';

const PH_API = 'https://api.producthunt.com/v2/api/graphql';

// ── Map PH topics → NovaHub categories ──────────────────────────────────────
const TOPIC_MAP = {
  'Artificial Intelligence': 'ai-tools',
  'Developer Tools':         'ai-tools',
  'Productivity':            'productivity',
  'Design Tools':            'design',
  'Cybersecurity':           'security',
  'Finance':                 'finance',
  'Education':               'courses',
  'Marketing':               'productivity',
  'Analytics':               'productivity',
  'Health & Fitness':        'productivity',
};

// ── GraphQL query — trending posts sorted by votes ──────────────────────────
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
 * Produces items with:
 *   category_id: mapped via TOPIC_MAP (default 'ai-tools'), type: 'tool'
 */
export class ProductHuntProvider extends BaseProvider {
  /**
   * @param {Object} [options]
   * @param {number} [options.limit=20] — max posts to fetch
   */
  constructor(options = {}) {
    super('ProductHunt');
    this.limit = options.limit || 20;
  }

  /**
   * Fetch trending posts from Product Hunt GraphQL API.
   * @returns {Promise<Array<Object>>} Array of PH post node objects
   */
  async fetch() {
    const token = getEnvCredential('PRODUCTHUNT_DEVELOPER_TOKEN', 'PRODUCTHUNT_ACCESS_TOKEN');
    if (!token) {
      throw new Error('Product Hunt API credential not set (PRODUCTHUNT_DEVELOPER_TOKEN or PRODUCTHUNT_ACCESS_TOKEN).');
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
      throw new Error(`Product Hunt GraphQL error: ${data.errors[0]?.message}`);
    }

    return data.data?.posts?.edges?.map((e) => e.node) || [];
  }

  /**
   * Map a PH topic list to a NovaHub category ID.
   * @param {Array<Object>} topics — array of { name: string }
   * @returns {string} NovaHub category ID
   */
  _mapCategory(topics = []) {
    for (const t of topics) {
      if (TOPIC_MAP[t.name]) return TOPIC_MAP[t.name];
    }
    return 'ai-tools'; // default — most PH products are tools
  }

  /**
   * Transform Product Hunt posts into NovaHub item format.
   * @param {Array<Object>} rawPosts — array of PH post nodes
   * @returns {Array<Object>} NovaHub-shaped items
   */
  transform(rawPosts) {
    return rawPosts.map((post) => {
      const topics  = post.topics?.edges?.map((e) => e.node) || [];
      const makers  = post.makers?.edges?.map((e) => e.node.username).join(', ') || '';
      const category = this._mapCategory(topics);

      // Detect pricing
      const pricingRaw = post.pricing?.unit;
      const pricing = pricingRaw
        ? pricingRaw.toLowerCase().includes('free') ? 'Free' : 'Paid'
        : 'Freemium';

      const name = post.name;
      const year = post.createdAt
        ? new Date(post.createdAt).getFullYear()
        : new Date().getFullYear();

      const slug = slugify(`${name} ph ${post.id}`, { lower: true, strict: true });

      const tags = [
        'product-hunt',
        'tool',
        ...topics.map((t) => slugify(t.name, { lower: true, strict: true })),
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
