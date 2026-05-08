// pages/api/ingest/wikipedia.js
import { enrichWithWikipedia } from '../../../lib/pipeline/WikipediaEnricher.js';
export const config = { maxDuration: 120 };
export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await enrichWithWikipedia();
    return res.status(200).json({ success: true, ...result });
  } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
}
