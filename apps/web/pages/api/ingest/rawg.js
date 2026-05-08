// pages/api/ingest/rawg.js
// NovaHub — RAWG Games Ingestion Cron
// Runs daily at 3am UTC via Vercel Cron.

import { SyncEngine } from "../../../lib/pipeline/SyncEngine.js";
import { RAWGProvider } from "../../../lib/pipeline/RAWGProvider.js";
import { isAuthorizedCron } from "../../../lib/helpers.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!isAuthorizedCron(req)) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const engine = new SyncEngine({ skipAI: false });
    const provider = new RAWGProvider({ limit: 20 });
    const result = await engine.syncProvider(provider);

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("[ingest/rawg]", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
