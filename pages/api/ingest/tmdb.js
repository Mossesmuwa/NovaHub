// pages/api/ingest/tmdb.js
// Vercel Cron: 0 2 * * * (2am UTC)
// Also accepts POST from admin trigger UI

import { SyncEngine } from "../../../lib/pipeline/SyncEngine.js";
import { TMDBProvider } from "../../../lib/pipeline/TMDBProvider.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return res.status(405).end();

  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res
      .status(500)
      .json({ error: "CRON_SECRET not set in Vercel env vars" });
  }
  if (req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res
      .status(401)
      .json({ error: "Unauthorized — CRON_SECRET mismatch" });
  }

  try {
    const engine = new SyncEngine({ skipAI: true }); // skip Gemini for speed
    const provider = new TMDBProvider({ limit: 20 });
    const result = await engine.syncProvider(provider);

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("[ingest/tmdb]", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
