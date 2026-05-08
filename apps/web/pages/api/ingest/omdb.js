// pages/api/ingest/omdb.js
// Vercel Cron: 0 7 * * * (7am UTC daily)
// Enriches existing movies with IMDB, RT, Metacritic scores.

import { enrichMovies } from '../../../lib/pipeline/OMDBEnricher.js';

export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return res.status(401).json({ error: 'Unauthorized' });

  try {
    const result = await enrichMovies();
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[ingest/omdb]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
