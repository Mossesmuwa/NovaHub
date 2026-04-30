// lib/pipeline/HackerNewsProvider.js
// NovaHub — Hacker News Provider
// Fetches top HN stories and transforms into NovaHub items.
// No API key needed — completely free.

import { BaseProvider } from './BaseProvider.js';
import { toSlug } from '../helpers.js';

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

export class HackerNewsProvider extends BaseProvider {
  constructor(options = {}) {
    super('HackerNews');
    this.limit = options.limit || 30;
    this.type  = options.type || 'topstories'; // topstories | beststories | newstories
  }

  async fetch() {
    // Get top story IDs
    const idsRes = await fetch(`${HN_BASE}/${this.type}.json`);
    if (!idsRes.ok) throw new Error(`HN API error: ${idsRes.status}`);
    const ids = await idsRes.json();

    // Fetch top N stories in parallel
    const topIds = ids.slice(0, this.limit);
    const stories = await Promise.all(
      topIds.map(async (id) => {
        try {
          const res = await fetch(`${HN_BASE}/item/${id}.json`);
          return res.ok ? res.json() : null;
        } catch { return null; }
      })
    );

    const valid = stories.filter(s => s && s.url && s.title && s.score > 50);
    console.log(`[Pipeline:HackerNews] Fetched ${valid.length} stories`);
    return valid;
  }

  transform(stories) {
    return stories.map(story => {
      const slug = toSlug(`${story.title} hn ${story.id}`.slice(0, 80));

      // Detect category from URL/title
      const text = `${story.title} ${story.url}`.toLowerCase();
      let category = 'ai-tools';
      if (text.includes('game') || text.includes('gaming')) category = 'games';
      if (text.includes('security') || text.includes('hack') || text.includes('breach')) category = 'security';
      if (text.includes('book') || text.includes('read')) category = 'books';
      if (text.includes('music') || text.includes('audio')) category = 'music';
      if (text.includes('science') || text.includes('research') || text.includes('study')) category = 'science';

      return {
        slug,
        name:         story.title.slice(0, 100),
        short_desc:   `${story.score} points · ${story.descendants || 0} comments on Hacker News`,
        long_desc:    story.title,
        category_id:  category,
        type:         'article',
        image:        null,
        year:         new Date(story.time * 1000).getFullYear(),
        rating:       null,
        rating_count: story.score || 0,
        tags:         ['hacker-news', 'tech', 'trending'],
        vibe_tags:    [],
        affiliate_link: story.url,
        source_url:   story.url,
        source_id:    String(story.id),
        source_name:  'hackernews',
        pricing:      'Free',
        trending:     true,
        approved:     true,
      };
    });
  }
}
