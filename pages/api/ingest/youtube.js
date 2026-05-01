import { SyncEngine } from '../../../lib/pipeline/SyncEngine.js';
import { YouTubeProvider } from '../../../lib/pipeline/YouTubeProvider.js';
export const config = { maxDuration: 60 };
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.YOUTUBE_API_KEY) return res.status(500).json({ error: 'YOUTUBE_API_KEY not set' });
  try {
    const result = await new SyncEngine({ skipAI: true }).syncProvider(new YouTubeProvider({ limit: 10 }));
    return res.status(200).json({ success: true, ...result });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
}
