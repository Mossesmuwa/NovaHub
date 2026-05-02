// lib/pipeline/CoursesProvider.js
// Fetches popular courses from multiple platforms.
// Uses Udemy free API (no key for basic search) + Coursera public catalog.

import { BaseProvider } from './BaseProvider.js';
import { toSlug } from '../helpers.js';

const UDEMY_BASE    = 'https://www.udemy.com/api-2.0/courses';
const COURSERA_BASE = 'https://api.coursera.org/api/courses.v1';

const TOPICS = [
  'artificial intelligence',
  'machine learning',
  'cybersecurity',
  'web development',
  'data science',
  'python programming',
  'digital marketing',
  'graphic design',
];

export class CoursesProvider extends BaseProvider {
  constructor(options = {}) {
    super('Courses');
    this.limit = options.limit || 30;
  }

  async _fetchCoursera() {
    try {
      const res = await fetch(
        `${COURSERA_BASE}?fields=id,name,slug,photoUrl,description,partnerIds,workload,primaryLanguages&limit=20&q=search&query=artificial+intelligence`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.elements || []).map(c => ({ ...c, _platform: 'coursera' }));
    } catch {
      return [];
    }
  }

  async _fetchUdemy(topic) {
    try {
      const res = await fetch(
        `${UDEMY_BASE}/?search=${encodeURIComponent(topic)}&ordering=highest-rated&page_size=8&ratings=4.5`,
        {
          headers: {
            'Accept': 'application/json, text/plain, */*',
          },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).map(c => ({ ...c, _platform: 'udemy', _topic: topic }));
    } catch {
      return [];
    }
  }

  async fetch() {
    const all  = [];
    const seen = new Set();

    // Coursera
    const coursera = await this._fetchCoursera();
    for (const c of coursera) {
      if (!seen.has(c.id)) { seen.add(c.id); all.push(c); }
    }

    // Udemy — sample topics
    for (const topic of TOPICS.slice(0, 3)) {
      const courses = await this._fetchUdemy(topic);
      for (const c of courses) {
        const id = `udemy-${c.id}`;
        if (!seen.has(id)) { seen.add(id); all.push(c); }
      }
      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`[Pipeline:Courses] Fetched ${all.length} courses`);
    return all.slice(0, this.limit);
  }

  transform(courses) {
    return courses
      .filter(c => c.name || c.title)
      .map(c => {
        const title    = c.name || c.title || 'Untitled Course';
        const platform = c._platform || 'courses';
        const slug     = toSlug(`${title} ${platform} ${c.id}`.slice(0, 80));

        return {
          slug,
          name:         title.slice(0, 120),
          short_desc:   (c.description || c.headline || '').slice(0, 200),
          long_desc:    c.description || c.headline || '',
          category_id:  'courses',
          type:         'course',
          image:        c.photoUrl || c.image_480x270 || c.image_125_H || null,
          year:         new Date().getFullYear(),
          rating:       c.rating ? parseFloat(parseFloat(c.rating).toFixed(1)) : null,
          rating_count: c.num_reviews || c.ratings_count || 0,
          author:       c.visible_instructors?.[0]?.title || '',
          tags:         ['course', platform, c._topic || 'learning'].filter(Boolean).slice(0, 8),
          vibe_tags:    [],
          pricing:      c.price === 0 || c.price === '0' ? 'Free' : 'Paid',
          affiliate_link: c.url
            ? (platform === 'udemy' ? `https://www.udemy.com${c.url}` : null)
            : null,
          source_url:   c.url
            ? (platform === 'udemy' ? `https://www.udemy.com${c.url}` : `https://www.coursera.org/learn/${c.slug}`)
            : null,
          source_id:    String(c.id),
          source_name:  platform,
          trending:     false,
          approved:     true,
        };
      });
  }
}
