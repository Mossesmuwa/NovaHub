// lib/pipeline/GitHubProvider.js
// NovaHub — GitHub Trending Provider
// Fetches trending repositories from GitHub and transforms into NovaHub items.

import { BaseProvider } from './BaseProvider.js';
import { toSlug } from '../helpers.js';

const GH_BASE = 'https://api.github.com';

// Map GitHub topics/languages → NovaHub categories
function mapCategory(repo) {
  const topics = repo.topics || [];
  const lang   = (repo.language || '').toLowerCase();

  if (topics.includes('machine-learning') || topics.includes('artificial-intelligence') || topics.includes('llm') || topics.includes('ai')) return 'ai-tools';
  if (topics.includes('security') || topics.includes('cybersecurity') || topics.includes('hacking')) return 'security';
  if (topics.includes('game') || topics.includes('gamedev')) return 'games';
  if (lang === 'python' && topics.some(t => ['data', 'ml', 'deep-learning'].includes(t))) return 'ai-tools';
  return 'ai-tools'; // most trending GitHub repos are dev tools
}

export class GitHubProvider extends BaseProvider {
  constructor(options = {}) {
    super('GitHub');
    this.limit = options.limit || 30;
    this.since = options.since || 'weekly'; // daily | weekly | monthly
  }

  async fetch() {
    const token = process.env.GITHUB_TOKEN;

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'NovaHub/1.0',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Get trending repos via search — sorted by stars gained recently
    const date = new Date();
    if (this.since === 'weekly') date.setDate(date.getDate() - 7);
    else if (this.since === 'monthly') date.setMonth(date.getMonth() - 1);
    else date.setDate(date.getDate() - 1);

    const dateStr = date.toISOString().split('T')[0];

    const url = `${GH_BASE}/search/repositories?q=created:>${dateStr}&sort=stars&order=desc&per_page=${this.limit}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    const repos = data.items || [];
    console.log(`[Pipeline:GitHub] Fetched ${repos.length} trending repos`);
    return repos;
  }

  transform(repos) {
    return repos
      .filter(repo => !repo.private && repo.description)
      .map(repo => {
        const name = repo.name.replace(/-/g, ' ').replace(/_/g, ' ');
        const slug = toSlug(`${repo.full_name.replace('/', ' ')} gh`);

        return {
          slug,
          name:         repo.name,
          short_desc:   (repo.description || '').slice(0, 200),
          long_desc:    repo.description || '',
          category_id:  mapCategory(repo),
          type:         'tool',
          image:        repo.owner?.avatar_url || null,
          year:         new Date(repo.created_at).getFullYear(),
          rating:       null,
          rating_count: repo.stargazers_count || 0,
          github_stars: repo.stargazers_count || 0,
          tags:         ['github', 'open-source', repo.language?.toLowerCase(), ...(repo.topics || [])].filter(Boolean).slice(0, 8),
          vibe_tags:    [],
          affiliate_link: repo.homepage || repo.html_url,
          source_url:   repo.html_url,
          source_id:    String(repo.id),
          source_name:  'github',
          pricing:      'Free',
          trending:     false,
          approved:     true,
        };
      });
  }
}
