// pages/api/ingest/producthunt.js
// NovaHub — Product Hunt Ingestion Cron Endpoint
// Runs daily at 5am UTC via Vercel Cron (see vercel.json).
// Thin wrapper — all ETL logic lives in lib/ingest/ProductHuntProvider.js

import { ProductHuntProvider } from '../../../lib/ingest/ProductHuntProvider.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  // ── Security: only allow authorized cron requests ──
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const provider = new ProductHuntProvider({ limit: 20 });
    const report = await provider.sync();

    return res.status(200).json({
      success: true,
      ...report,
    });
  } catch (err) {
    console.error('[ingest/producthunt]', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Product Hunt ingestion failed',
    });
  }
}
