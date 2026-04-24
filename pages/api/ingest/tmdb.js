// pages/api/ingest/tmdb.js
// NovaHub — TMDB Ingestion Cron Endpoint
// Runs daily at 2am UTC via Vercel Cron (see vercel.json).
// Thin wrapper — all ETL logic lives in lib/ingest/TMDBProvider.js

import { TMDBProvider } from "../../../lib/ingest/TMDBProvider.js";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  const reqId = `[ingest/tmdb-${Date.now()}]`;

  console.log(`${reqId} ✓ Endpoint called`);
  console.log(
    `${reqId} Authorization header: ${req.headers.authorization ? "present" : "MISSING"}`,
  );
  console.log(
    `${reqId} CRON_SECRET env: ${process.env.CRON_SECRET ? "set" : "MISSING"}`,
  );

  // ── Security: only allow authorized cron requests ──
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error(
      `${reqId} ✗ Auth failed - header: "${req.headers.authorization}"`,
    );
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  console.log(`${reqId} ✓ Auth passed`);

  try {
    console.log(`${reqId} Creating TMDBProvider with limit=20`);
    const provider = new TMDBProvider({ limit: 20 });

    console.log(`${reqId} Calling provider.sync()...`);
    const report = await provider.sync();

    console.log(
      `${reqId} ✓ Sync complete - report:`,
      JSON.stringify(report, null, 2),
    );

    return res.status(200).json({
      success: true,
      ...report,
    });
  } catch (err) {
    console.error(`${reqId} ✗ FATAL ERROR:`, err.message);
    console.error(`${reqId} Stack:`, err.stack);
    return res.status(500).json({
      success: false,
      error: err.message || "TMDB ingestion failed",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
}
