// pages/api/ingest/books.js
// NovaHub — Google Books Ingestion Cron
// Runs daily at 4am UTC via Vercel Cron.

import { SyncEngine } from "../../../lib/pipeline/SyncEngine.js";
import { BooksProvider } from "../../../lib/pipeline/BooksProvider.js";
import { isAuthorizedCron } from "../../../lib/helpers.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!isAuthorizedCron(req)) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const engine = new SyncEngine({ skipAI: false });
    const provider = new BooksProvider({ limitPerQuery: 5 });
    const result = await engine.syncProvider(provider);

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("[ingest/books]", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
