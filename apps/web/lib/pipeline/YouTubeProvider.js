// lib/pipeline/YouTubeProvider.js
// Fetches trending YouTube videos by category.
// Needs: YOUTUBE_API_KEY in Vercel env vars.

import { BaseProvider } from './BaseProvider.js';
import { getEnvCredential, toSlug } from '../helpers.js';

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

// YouTube category IDs → NovaHub categories
const YT_CATEGORIES = [
  { id: '28', category: 'science',     label: 'Science & Technology' },
  { id: '20', category: 'games',       label: 'Gaming' },
  { id: '10', category: 'music',       label: 'Music' },
  { id: '27', category: 'science',     label: 'Education' },
  { id: '24', category: 'ai-tools',    label: 'Entertainment' },
];

export class YouTubeProvider extends BaseProvider {
  constructor(options = {}) {
    super('YouTube');
    this.limit = options.limit || 10; // per category
  }

  async fetch() {
    const key = getEnvCredential('YOUTUBE_API_KEY');
    if (!key) throw new Error('YOUTUBE_API_KEY not set');

    const all = [];
    const seen = new Set();

    for (const cat of YT_CATEGORIES) {
      try {
        const res = await fetch(
          `${YT_BASE}/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=${cat.id}&maxResults=${this.limit}&regionCode=US&key=${key}`
        );

        if (!res.ok) {
          console.warn(`[Pipeline:YouTube] category ${cat.id} → ${res.status}`);
          continue;
        }

        const data = await res.json();
        const videos = data.items || [];

        for (const video of videos) {
          if (!seen.has(video.id)) {
            seen.add(video.id);
            all.push({ ...video, _category: cat.category });
          }
        }
      } catch (err) {
        console.warn(`[Pipeline:YouTube] category ${cat.id} failed:`, err.message);
      }
    }

    console.log(`[Pipeline:YouTube] Fetched ${all.length} videos`);
    return all;
  }

  transform(videos) {
    return videos.map(video => {
      const snippet    = video.snippet || {};
      const stats      = video.statistics || {};
      const slug       = toSlug(`${snippet.title} yt ${video.id}`.slice(0, 80));
      const viewCount  = parseInt(stats.viewCount || 0);
      const likeCount  = parseInt(stats.likeCount || 0);

      return {
        slug,
        name:         snippet.title?.slice(0, 120) || 'Untitled',
        short_desc:   snippet.description?.slice(0, 200) || '',
        long_desc:    snippet.description || '',
        category_id:  video._category,
        type:         'video',
        image:        snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || null,
        year:         snippet.publishedAt ? new Date(snippet.publishedAt).getFullYear() : new Date().getFullYear(),
        rating:       null,
        rating_count: viewCount,
        author:       snippet.channelTitle || '',
        tags:         ['youtube', 'video', 'trending'].slice(0, 8),
        vibe_tags:    [],
        affiliate_link: `https://youtube.com/watch?v=${video.id}`,
        source_url:   `https://youtube.com/watch?v=${video.id}`,
        source_id:    video.id,
        source_name:  'youtube',
        trending:     viewCount > 1000000,
        approved:     true,
        metadata: {
          youtube_id:  video.id,
          view_count:  viewCount,
          like_count:  likeCount,
          channel:     snippet.channelTitle,
        },
      };
    });
  }
}
