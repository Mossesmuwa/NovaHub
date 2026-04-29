// pages/api/ingest/rawg.js
// Vercel Cron: 0 3 * * * (3am UTC)
// Get API key: https://rawg.io/login?forward=developer

import { SyncEngine } from "../../../lib/pipeline/SyncEngine.js";
import { RAWGProvider } from "../../../lib/pipeline/RAWGProvider.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return res.status(405).end();

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret)
    return res.status(500).json({ error: "CRON_SECRET not set" });
  if (req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!process.env.RAWG_API_KEY) {
    return res.status(500).json({
      error: "RAWG_API_KEY not set",
      note: "Get a free key at rawg.io/login?forward=developer",
    });
  }

  try {
    const engine = new SyncEngine({ skipAI: true });
    const provider = new RAWGProvider({ limit: 20 });
    const result = await engine.syncProvider(provider);

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("[ingest/rawg]", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
