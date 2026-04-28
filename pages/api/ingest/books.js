// pages/api/ingest/books.js
// Vercel Cron: 0 4 * * * (4am UTC)
// Google Books API is free — no key required for basic queries

import { SyncEngine } from "../../../lib/pipeline/SyncEngine.js";
import { BooksProvider } from "../../../lib/pipeline/BooksProvider.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return res.status(405).end();

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret)
    return res.status(500).json({ error: "CRON_SECRET not set" });
  if (req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const engine = new SyncEngine({ skipAI: true });
    const provider = new BooksProvider({ limit: 10, subjectsPerRun: 3 });
    const result = await engine.syncProvider(provider);

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("[ingest/books]", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
