import { SyncEngine } from '../../../lib/pipeline/SyncEngine.js';
import { SteamProvider } from '../../../lib/pipeline/SteamProvider.js';
export const config = { maxDuration: 60 };
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await new SyncEngine({ skipAI: true }).syncProvider(new SteamProvider({ limit: 40 }));
    return res.status(200).json({ success: true, ...result });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
}
