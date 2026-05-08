// lib/pipeline/DevToProvider.js
// Fetches trending developer articles from DEV.to
// No API key needed for public articles.

import { BaseProvider } from './BaseProvider.js';
import { toSlug } from '../helpers.js';

const DEVTO_BASE = 'https://dev.to/api';

const TAG_TO_CATEGORY = {
  'ai':             'ai-tools',
  'machinelearning':'ai-tools',
  'security':       'security',
  'webdev':         'ai-tools',
  'javascript':     'ai-tools',
  'python':         'ai-tools',
  'devops':         'ai-tools',
  'productivity':   'productivity',
  'career':         'productivity',
  'gamedev':        'games',
  'science':        'science',
};

const FETCH_TAGS = [
  'ai', 'security', 'webdev', 'python', 'productivity', 'machinelearning'
];

export class DevToProvider extends BaseProvider {
  constructor(options = {}) {
    super('DevTo');
    this.perTag = options.perTag || 8;
  }

  async fetch() {
    const all  = [];
    const seen = new Set();

    for (const tag of FETCH_TAGS) {
      try {
        const res = await fetch(
          `${DEVTO_BASE}/articles?tag=${tag}&per_page=${this.perTag}&top=7`
        );
        if (!res.ok) continue;

        const articles = await res.json();
        for (const a of articles) {
          if (!seen.has(a.id) && a.title && a.positive_reactions_count > 10) {
            seen.add(a.id);
            all.push({ ...a, _tag: tag });
          }
        }

        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.warn(`[Pipeline:DevTo] ${tag}:`, err.message);
      }
    }

    console.log(`[Pipeline:DevTo] Fetched ${all.length} articles`);
    return all;
  }

  transform(articles) {
    return articles.map(a => {
      const slug     = toSlug(`${a.title} devto ${a.id}`.slice(0, 80));
      const category = TAG_TO_CATEGORY[a._tag] || 'ai-tools';

      return {
        slug,
        name:         a.title.slice(0, 120),
        short_desc:   a.description?.slice(0, 200) || '',
        long_desc:    a.description || '',
        category_id:  category,
        type:         'article',
        image:        a.cover_image || a.social_image || null,
        year:         new Date(a.published_at).getFullYear(),
        rating:       null,
        rating_count: a.positive_reactions_count || 0,
        author:       a.user?.name || '',
        tags:         ['devto', 'article', ...(a.tag_list || [])].slice(0, 8),
        vibe_tags:    [],
        affiliate_link: null,
        source_url:   a.url,
        source_id:    String(a.id),
        source_name:  'devto',
        trending:     a.positive_reactions_count > 100,
        approved:     true,
      };
    });
  }
}
