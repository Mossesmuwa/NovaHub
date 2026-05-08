// lib/pipeline/RedditProvider.js
// Fetches top Reddit posts — uses public JSON API, no key needed.

import { BaseProvider } from './BaseProvider.js';
import { toSlug } from '../helpers.js';

// Subreddits mapped to NovaHub categories
const SUBREDDITS = [
  { sub: 'artificial',        category: 'ai-tools',     type: 'article' },
  { sub: 'MachineLearning',   category: 'ai-tools',     type: 'article' },
  { sub: 'netsec',            category: 'security',     type: 'article' },
  { sub: 'gaming',            category: 'games',        type: 'article' },
  { sub: 'gamedev',           category: 'games',        type: 'article' },
  { sub: 'books',             category: 'books',        type: 'article' },
  { sub: 'science',           category: 'science',      type: 'article' },
  { sub: 'technology',        category: 'ai-tools',     type: 'article' },
  { sub: 'productivity',      category: 'productivity', type: 'article' },
  { sub: 'music',             category: 'music',        type: 'article' },
];

export class RedditProvider extends BaseProvider {
  constructor(options = {}) {
    super('Reddit');
    this.postsPerSub = options.postsPerSub || 5;
    this.timeframe   = options.timeframe || 'week'; // hour|day|week|month
  }

  async fetch() {
    const allPosts = [];
    const seen = new Set();

    for (const { sub, category, type } of SUBREDDITS) {
      try {
        const url = `https://www.reddit.com/r/${sub}/top.json?limit=${this.postsPerSub}&t=${this.timeframe}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'NovaHub/1.0 (content aggregator)' }
        });

        if (!res.ok) {
          console.warn(`[Pipeline:Reddit] r/${sub} → ${res.status}`);
          continue;
        }

        const data = await res.json();
        const posts = data?.data?.children || [];

        for (const { data: post } of posts) {
          if (!post.id || seen.has(post.id)) continue;
          if (post.score < 100) continue; // only quality posts
          if (post.over_18) continue;     // no NSFW

          seen.add(post.id);
          allPosts.push({ ...post, _category: category, _type: type });
        }

        // Be polite to Reddit
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.warn(`[Pipeline:Reddit] r/${sub} failed:`, err.message);
      }
    }

    console.log(`[Pipeline:Reddit] Fetched ${allPosts.length} posts`);
    return allPosts;
  }

  transform(posts) {
    return posts.map(post => {
      const slug = toSlug(`${post.title} reddit ${post.id}`.slice(0, 80));

      return {
        slug,
        name:         post.title.slice(0, 120),
        short_desc:   post.selftext
          ? post.selftext.slice(0, 200)
          : `${post.score.toLocaleString()} upvotes · r/${post.subreddit}`,
        long_desc:    post.selftext || '',
        category_id:  post._category,
        type:         post._type,
        image:        post.thumbnail?.startsWith('http') ? post.thumbnail : null,
        year:         new Date(post.created_utc * 1000).getFullYear(),
        rating:       null,
        rating_count: post.score || 0,
        tags:         ['reddit', `r-${post.subreddit.toLowerCase()}`, 'community'].slice(0, 8),
        vibe_tags:    [],
        affiliate_link: post.url !== `https://www.reddit.com${post.permalink}` ? post.url : null,
        source_url:   `https://www.reddit.com${post.permalink}`,
        source_id:    post.id,
        source_name:  'reddit',
        trending:     post.score > 1000,
        approved:     true,
      };
    });
  }
}
