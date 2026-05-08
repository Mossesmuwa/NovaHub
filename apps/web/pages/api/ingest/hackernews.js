// pages/api/ingest/hackernews.js
// Vercel Cron: 0 8 * * * (8am UTC daily)

import { SyncEngine }           from '../../../lib/pipeline/SyncEngine.js';
import { HackerNewsProvider }   from '../../../lib/pipeline/HackerNewsProvider.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return res.status(401).json({ error: 'Unauthorized' });

  try {
    const engine   = new SyncEngine({ skipAI: true });
    const provider = new HackerNewsProvider({ limit: 30 });
    const result   = await engine.syncProvider(provider);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[ingest/hackernews]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
