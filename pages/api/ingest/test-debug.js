// pages/api/ingest/test-debug.js
// DEBUG ENDPOINT — Test ingestion without auth
// WARNING: Remove this before deploying to production!
// Access: GET /api/ingest/test-debug?provider=producthunt

import { ProductHuntProvider } from "../../../lib/ingest/ProductHuntProvider.js";
import { TMDBProvider } from "../../../lib/ingest/TMDBProvider.js";

export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  // Only allow in development
//   if (process.env.NODE_ENV === "production") {
//     return res.status(403).json({
//       success: false,
//       error: "Debug endpoint not available in production",
//     });
//   }

  const reqId = `[debug-${Date.now()}]`;
  const provider = req.query.provider?.toLowerCase() || "producthunt";

  console.log(`${reqId} DEBUG INGESTION ENDPOINT`);
  console.log(`${reqId} Provider: ${provider}`);
  console.log(`${reqId} Environment checks:`);
  console.log(
    `${reqId}   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗"}`,
  );
  console.log(
    `${reqId}   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗"}`,
  );
  console.log(
    `${reqId}   PRODUCTHUNT_DEVELOPER_TOKEN: ${process.env.PRODUCTHUNT_DEVELOPER_TOKEN ? "✓" : "✗"}`,
  );
  console.log(
    `${reqId}   TMDB_API_KEY: ${process.env.TMDB_API_KEY ? "✓" : "✗"}`,
  );
  console.log(
    `${reqId}   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? "✓" : "✗"}`,
  );
  console.log(
    `${reqId}   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "✓" : "✗ (optional)"}`,
  );

  try {
    let providerInstance;

    if (provider === "producthunt") {
      console.log(`${reqId} Creating ProductHuntProvider...`);
      providerInstance = new ProductHuntProvider({ limit: 10 });
    } else if (provider === "tmdb") {
      console.log(`${reqId} Creating TMDBProvider...`);
      providerInstance = new TMDBProvider({ limit: 10 });
    } else {
      return res.status(400).json({
        success: false,
        error: `Unknown provider: ${provider}. Use 'producthunt' or 'tmdb'`,
      });
    }

    console.log(`${reqId} Calling sync()...`);
    const report = await providerInstance.sync();

    console.log(`${reqId} Sync complete!`);
    return res.status(200).json({
      success: true,
      provider,
      report,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`${reqId} FATAL ERROR:`, err.message);
    console.error(`${reqId} Stack:`, err.stack);

    return res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
