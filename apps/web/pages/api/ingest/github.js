// pages/api/ingest/github.js
// Vercel Cron: 0 1 * * * (1am UTC daily)

import { SyncEngine }      from '../../../lib/pipeline/SyncEngine.js';
import { GitHubProvider }  from '../../../lib/pipeline/GitHubProvider.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return res.status(401).json({ error: 'Unauthorized' });

  try {
    const engine   = new SyncEngine({ skipAI: true });
    const provider = new GitHubProvider({ limit: 30, since: 'weekly' });
    const result   = await engine.syncProvider(provider);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[ingest/github]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
