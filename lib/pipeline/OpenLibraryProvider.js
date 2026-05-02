// lib/pipeline/OpenLibraryProvider.js
// Fetches trending and classic books from OpenLibrary.
// No API key needed — completely free and open.

import { BaseProvider } from './BaseProvider.js';
import { toSlug } from '../helpers.js';

const OL_BASE = 'https://openlibrary.org';

const SUBJECTS = [
  'artificial_intelligence',
  'programming',
  'entrepreneurship',
  'psychology',
  'science',
  'philosophy',
  'design',
  'economics',
  'history',
  'biography',
];

export class OpenLibraryProvider extends BaseProvider {
  constructor(options = {}) {
    super('OpenLibrary');
    this.limit          = options.limit || 8;
    this.subjectsPerRun = options.subjectsPerRun || 4;
  }

  _getSubjects() {
    const day = new Date().getDate();
    const idx = day % Math.ceil(SUBJECTS.length / this.subjectsPerRun);
    return SUBJECTS.slice(idx * this.subjectsPerRun, idx * this.subjectsPerRun + this.subjectsPerRun);
  }

  async fetch() {
    const subjects = this._getSubjects();
    console.log(`[Pipeline:OpenLibrary] Subjects: ${subjects.join(', ')}`);

    const all  = [];
    const seen = new Set();

    for (const subject of subjects) {
      try {
        const res = await fetch(
          `${OL_BASE}/subjects/${subject}.json?limit=${this.limit}&sort=edition_count`
        );
        if (!res.ok) continue;

        const data  = await res.json();
        const works = data.works || [];

        for (const work of works) {
          if (!seen.has(work.key)) {
            seen.add(work.key);
            all.push({ ...work, _subject: subject });
          }
        }

        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        console.warn(`[Pipeline:OpenLibrary] ${subject}:`, err.message);
      }
    }

    console.log(`[Pipeline:OpenLibrary] Fetched ${all.length} books`);
    return all;
  }

  transform(works) {
    return works
      .filter(w => w.title && w.key)
      .map(work => {
        const olId    = work.key.replace('/works/', '');
        const authors = (work.authors || []).map(a => a.name).filter(Boolean).join(', ');
        const cover   = work.cover_id
          ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
          : null;

        const year = work.first_publish_year || null;
        const slug = toSlug(`${work.title} ${authors} ol ${olId}`.slice(0, 80));

        return {
          slug,
          name:         work.title.slice(0, 120),
          short_desc:   authors ? `By ${authors}${year ? ` · ${year}` : ''}` : '',
          long_desc:    '',
          category_id:  'books',
          type:         'book',
          image:        cover,
          year,
          rating:       null,
          rating_count: work.edition_count || 0,
          author:       authors,
          tags:         ['openlibrary', 'book', work._subject.replace(/_/g, '-')].slice(0, 8),
          vibe_tags:    [],
          affiliate_link: null,
          source_url:   `https://openlibrary.org${work.key}`,
          source_id:    olId,
          source_name:  'openlibrary',
          trending:     false,
          approved:     true,
        };
      });
  }
}
