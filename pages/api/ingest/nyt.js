import { SyncEngine } from '../../../lib/pipeline/SyncEngine.js';
import { NYTBooksProvider } from '../../../lib/pipeline/NYTBooksProvider.js';
export const config = { maxDuration: 60 };
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.NYT_API_KEY) return res.status(500).json({ error: 'NYT_API_KEY not set' });
  try {
    const result = await new SyncEngine({ skipAI: true }).syncProvider(new NYTBooksProvider());
    return res.status(200).json({ success: true, ...result });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
}
