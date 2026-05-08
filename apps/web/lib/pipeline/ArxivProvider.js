// lib/pipeline/ArxivProvider.js
// Fetches trending research papers from arXiv — no API key needed.

import { BaseProvider } from './BaseProvider.js';
import { toSlug } from '../helpers.js';

const SUBJECTS = [
  'cs.AI',      // Artificial Intelligence
  'cs.LG',      // Machine Learning
  'cs.CR',      // Cryptography and Security
  'physics.pop-ph', // Popular Physics
  'q-bio',      // Quantitative Biology
  'econ.GN',    // General Economics
];

export class ArxivProvider extends BaseProvider {
  constructor(options = {}) {
    super('arXiv');
    this.limit = options.limit || 30;
  }

  async fetch() {
    const allPapers = [];
    const seen = new Set();

    for (const subject of SUBJECTS.slice(0, 3)) {
      try {
        const url = `https://export.arxiv.org/api/query?search_query=cat:${subject}&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;
        const res = await fetch(url);
        if (!res.ok) continue;

        const text = await res.text();

        // Parse XML manually — no xml2js needed
        const entries = text.split('<entry>').slice(1);
        for (const entry of entries) {
          const id      = entry.match(/<id>(.*?)<\/id>/)?.[1]?.trim() || '';
          const title   = entry.match(/<title>(.*?)<\/title>/s)?.[1]?.trim().replace(/\s+/g, ' ') || '';
          const summary = entry.match(/<summary>(.*?)<\/summary>/s)?.[1]?.trim().replace(/\s+/g, ' ') || '';
          const authors = [...entry.matchAll(/<name>(.*?)<\/name>/g)].map(m => m[1]).slice(0, 3).join(', ');
          const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || '';
          const arxivId = id.split('/abs/').pop() || '';

          if (arxivId && !seen.has(arxivId) && title && summary.length > 50) {
            seen.add(arxivId);
            allPapers.push({ arxivId, title, summary, authors, published, subject });
          }
        }
      } catch (err) {
        console.warn(`[Pipeline:arXiv] ${subject} failed:`, err.message);
      }
    }

    console.log(`[Pipeline:arXiv] Fetched ${allPapers.length} papers`);
    return allPapers.slice(0, this.limit);
  }

  transform(papers) {
    return papers.map(paper => {
      const slug = toSlug(`${paper.title} arxiv ${paper.arxivId}`.slice(0, 80));

      // Map subject to category
      let category = 'science';
      if (paper.subject.startsWith('cs.AI') || paper.subject.startsWith('cs.LG')) category = 'ai-tools';
      if (paper.subject.startsWith('cs.CR')) category = 'security';

      return {
        slug,
        name:         paper.title.slice(0, 120),
        short_desc:   paper.summary.slice(0, 200),
        long_desc:    paper.summary,
        category_id:  category,
        type:         'paper',
        image:        null,
        year:         paper.published ? new Date(paper.published).getFullYear() : new Date().getFullYear(),
        rating:       null,
        rating_count: 0,
        author:       paper.authors,
        tags:         ['arxiv', 'research', 'paper', paper.subject.toLowerCase()].slice(0, 8),
        vibe_tags:    [],
        source_url:   `https://arxiv.org/abs/${paper.arxivId}`,
        source_id:    paper.arxivId,
        source_name:  'arxiv',
        trending:     false,
        approved:     true,
      };
    });
  }
}
