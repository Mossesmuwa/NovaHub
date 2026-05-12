export const NovaScoreTypes = {
  NovaScore: {
    score: 91, // 0-100
    trend: 'up', // 'up', 'down', 'stable'
    percentChange: 340,
    breakdown: { github: 95, community: 88, credibility: 100, freshness: 99 },
    reasons: ['+2,400 GitHub stars', '#1 ProductHunt', 'Official source', 'Updated 1h ago'],
    confidence: 94,
  },
  DataQuality: { freshness: 99, completeness: 96, confidence: 94, lastUpdated: '2 hours ago' },
  DataSource: { name: 'GitHub', url: '...', type: 'official', credibility: 100 },
  Trend: { direction: 'up', percentChange: 340, period: 'week', reasons: [...] },
};