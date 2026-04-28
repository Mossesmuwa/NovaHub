// DEBUG_INGEST.js
// Manual ingestion test — run with: node DEBUG_INGEST.js
// This will execute the ProductHunt ingestion and show all logs

import { SyncEngine } from "./lib/pipeline/SyncEngine.js";
import { ProductHuntProvider } from "./lib/pipeline/ProductHuntProvider.js";
import { TMDBProvider } from "./lib/pipeline/TMDBProvider.js";
import { BooksProvider } from "./lib/pipeline/BooksProvider.js";

async function testIngestion() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║           NOVAHUB INGESTION DEBUG TEST                     ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("");

  // Check environment
  console.log("📋 ENVIRONMENT CHECK:");
  console.log(
    "  NEXT_PUBLIC_SUPABASE_URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗",
  );
  console.log(
    "  SUPABASE_SERVICE_ROLE_KEY:",
    process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗",
  );
  console.log(
    "  PRODUCTHUNT_DEVELOPER_TOKEN:",
    process.env.PRODUCTHUNT_DEVELOPER_TOKEN ? "✓" : "✗",
  );
  console.log("  TMDB_API_KEY:", process.env.TMDB_API_KEY ? "✓" : "✗");
  console.log("  GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "✓" : "✗");
  console.log(
    "  ANTHROPIC_API_KEY:",
    process.env.ANTHROPIC_API_KEY ? "✓" : "✗ (optional)",
  );
  console.log("");

  const engine = new SyncEngine({ skipAI: true });

  try {
    // Test ProductHunt
    console.log("🚀 TESTING PRODUCT HUNT INGESTION:");
    console.log("─".repeat(60));
    const phProvider = new ProductHuntProvider({ limit: 5 });
    const phReport = await engine.syncProvider(phProvider);
    console.log("✓ ProductHunt report:", JSON.stringify(phReport, null, 2));
    console.log("");
  } catch (err) {
    console.error("✗ ProductHunt error:", err.message);
    console.error("  Stack:", err.stack);
    console.log("");
  }

  try {
    // Test TMDB
    console.log("🚀 TESTING TMDB INGESTION:");
    console.log("─".repeat(60));
    const tmdbProvider = new TMDBProvider({ limit: 5 });
    const tmdbReport = await engine.syncProvider(tmdbProvider);
    console.log("✓ TMDB report:", JSON.stringify(tmdbReport, null, 2));
    console.log("");
  } catch (err) {
    console.error("✗ TMDB error:", err.message);
    console.error("  Stack:", err.stack);
    console.log("");
  }

  try {
    // Test Books
    console.log("🚀 TESTING BOOKS INGESTION:");
    console.log("─".repeat(60));
    const booksProvider = new BooksProvider({ limit: 5, subjectsPerRun: 2 });
    const booksReport = await engine.syncProvider(booksProvider);
    console.log("✓ Books report:", JSON.stringify(booksReport, null, 2));
    console.log("");
  } catch (err) {
    console.error("✗ Books error:", err.message);
    console.error("  Stack:", err.stack);
    console.log("");
  }

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                      TEST COMPLETE                        ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  process.exit(0);
}

testIngestion().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
