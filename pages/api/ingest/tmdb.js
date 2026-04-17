// pages/api/ingest/tmdb.js
// NovaHub — TMDB Ingestion Cron Endpoint
// Runs daily at 2am UTC via Vercel Cron (see vercel.json).
// Thin wrapper — all ETL logic lives in lib/ingest/TMDBProvider.js

import { TMDBProvider } from '../../../lib/ingest/TMDBProvider.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  // ── Security: only allow authorized cron requests ──
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const provider = new TMDBProvider({ limit: 20 });
    const report = await provider.sync();

    return res.status(200).json({
      success: true,
      ...report,
    });
  } catch (err) {
    console.error('[ingest/tmdb]', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'TMDB ingestion failed',
    });
  }
}
