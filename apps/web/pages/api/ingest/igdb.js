// pages/api/ingest/igdb.js
import { SyncEngine } from '../../../lib/pipeline/SyncEngine.js';
import { IGDBProvider } from '../../../lib/pipeline/IGDBProvider.js';
export const config = { maxDuration: 60 };
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.IGDB_CLIENT_ID) return res.status(500).json({ error: 'IGDB_CLIENT_ID not set — get free credentials at dev.twitch.tv' });
  try {
    const result = await new SyncEngine({ skipAI: true }).syncProvider(new IGDBProvider({ limit: 40 }));
    return res.status(200).json({ success: true, ...result });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
}
