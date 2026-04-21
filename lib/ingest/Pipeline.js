// lib/ingest/Pipeline.js
// NovaHub — AI Content Pipeline v2
// Base class for all ingest providers. Handles:
//   1. AI Enrichment (Claude Haiku) — summary + vibe_scores
//   2. AI Embeddings (Gemini text-embedding-004) — vector for semantic search
//   3. Database Logic — batched upserts (50 items/batch) on slug conflict
//
// Subclasses implement:
//   - fetch()     → pull raw data from an external API
//   - transform() → map raw data to NovaHub item schema
//
// Then call .sync() to run the full ETL + AI + DB pipeline.

import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import slugify from "slugify";
import { supabaseAdmin } from "../supabaseAdmin.js";

// ── Constants ───────────────────────────────────────────────────────────────
const UPSERT_BATCH_SIZE = 50;
const AI_BATCH_SIZE = 5;
const AI_BATCH_DELAY_MS = 1200; // pause between AI batches to avoid rate limits
const EMBEDDING_MODEL = "text-embedding-004";
const ENRICHMENT_MODEL = "claude-3-5-haiku-20241022";

/**
 * Pipeline — the ETL foundation that every provider extends.
 *
 * @example
 *   class MyProvider extends Pipeline {
 *     constructor() { super('MyProvider', 'my-category'); }
 *     async fetch() { return rawApiData; }
 *     transform(rawData) { return [{ name, slug, ... }]; }
 *   }
 *   const report = await new MyProvider().sync();
 */
export class Pipeline {
  /**
   * @param {string} providerName — human-readable name (used in logs)
   * @param {string} defaultCategory — fallback category_id if item has none
   */
  constructor(providerName, defaultCategory = "ai-tools") {
    if (new.target === Pipeline) {
      throw new Error(
        "Pipeline is abstract — extend it, don't instantiate it directly.",
      );
    }

    this.providerName = providerName;
    this.defaultCategory = defaultCategory;
    this.tag = `[Ingest:${providerName}]`;

    // ── Claude AI client for enrichment ──
    const claudeKey =
      process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_ACCESS_TOKEN;
    if (!claudeKey) {
      console.warn(
        `${this.tag} ANTHROPIC_API_KEY not set — AI enrichment will be skipped.`,
      );
      this.claude = null;
    } else {
      this.claude = new Anthropic({ apiKey: claudeKey });
    }

    // ── Gemini AI client for embeddings ──
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.warn(
        `${this.tag} GEMINI_API_KEY not set — AI embeddings will be skipped.`,
      );
      this.gemini = null;
    } else {
      this.gemini = new GoogleGenAI({ apiKey: geminiKey });
    }

    // ── Stats tracking ──
    this._stats = {
      fetched: 0,
      enriched: 0,
      embedded: 0,
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ABSTRACT METHODS — subclasses MUST implement these
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Fetch raw data from the upstream API.
   * @returns {Promise<any>} Raw API response
   */
  async fetch() {
    throw new Error(`${this.tag} fetch() must be implemented by subclass.`);
  }

  /**
   * Transform raw API data into an array of NovaHub item objects.
   * Each item should have at minimum: { name, slug, category_id, type }
   * @param {any} rawData — whatever fetch() returned
   * @returns {Array<Object>} NovaHub-shaped items
   */
  transform(rawData) {
    throw new Error(`${this.tag} transform() must be implemented by subclass.`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SLUG GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate a unique SEO-friendly slug from a title.
   * @param {string} title
   * @param {string} [suffix] — optional suffix for uniqueness (e.g., source ID)
   * @returns {string}
   */
  makeSlug(title, suffix = "") {
    const base = slugify(title, { lower: true, strict: true, trim: true });
    return suffix ? `${base}-${suffix}` : base;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AI ENRICHMENT — Claude Haiku
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Enrich a single item with an AI-generated summary and vibe scores.
   * @param {string} description — raw text to analyze
   * @returns {Promise<Object>} { summary, vibe_scores }
   */
  async _enrichWithAI(description) {
    if (!this.claude || !description || description.trim().length < 10) {
      return { summary: "", vibe_scores: {} };
    }

    const prompt = `You are a content curator for NovaHub, a discovery platform.

Given this description, return a JSON object with exactly two fields:

1. "summary": A vibe-heavy, evocative summary in EXACTLY 20 words.
   Punchy, opinionated, aesthetic — like a friend recommending something.

2. "vibe_scores": A JSONB object with numeric scores (0–100) for these dimensions:
   - "minimalism": How clean and stripped-back? (100 = ultra-minimal)
   - "cyberpunk": How techy, futuristic, neon-edged? (100 = full cyberpunk)
   - "utility": How practical and productivity-oriented? (100 = pure utility)
   - "creativity": How artistic, experimental, or inventive? (100 = peak creative)
   - "hype": How buzzy, trending, or culturally relevant right now? (100 = maximum hype)

CRITICAL: Return ONLY valid JSON. No markdown, no explanation.

Example:
{"summary":"A neon-drenched noir thriller that rewires your brain and refuses to let go","vibe_scores":{"minimalism":20,"cyberpunk":85,"utility":10,"creativity":70,"hype":60}}

Description:
"""
${description.slice(0, 1500)}
"""`;

    try {
      const message = await this.claude.messages.create({
        model: ENRICHMENT_MODEL,
        max_tokens: 300,
        system: "You are a content curator. Respond only with valid JSON.",
        messages: [{ role: "user", content: prompt }],
      });

      const text = message.content?.[0]?.text || "";
      const clean = text
        .replace(/```json\s*/gi, "")
        .replace(/```/g, "")
        .trim();
      const start = clean.indexOf("{");
      const end = clean.lastIndexOf("}");

      if (start === -1 || end === -1)
        throw new Error("No JSON object in response");

      const parsed = JSON.parse(clean.slice(start, end + 1));

      // Clamp all vibe scores to 0–100
      const vibeScores = {};
      for (const [key, val] of Object.entries(parsed.vibe_scores || {})) {
        const n = parseInt(val, 10);
        vibeScores[key] = isNaN(n) ? 50 : Math.max(0, Math.min(100, n));
      }

      return {
        summary: (parsed.summary || "").slice(0, 300),
        vibe_scores: vibeScores,
      };
    } catch (err) {
      console.error(`${this.tag} AI enrichment failed:`, err.message);
      return { summary: "", vibe_scores: {} };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AI EMBEDDINGS — Gemini text-embedding-004
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate a vector embedding for semantic search.
   * Uses Gemini text-embedding-004 (768 dimensions).
   * @param {string} text — text to embed (name + description)
   * @returns {Promise<number[]|null>} 768-dim vector or null on failure
   */
  async _generateEmbedding(text) {
    if (!this.gemini || !text || text.trim().length < 5) {
      return null;
    }

    try {
      const response = await this.gemini.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text.slice(0, 2000), // limit input size
      });

      const embedding = response.embeddings?.[0]?.values || null;
      return embedding;
    } catch (err) {
      console.error(`${this.tag} Embedding generation failed:`, err.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH AI PROCESSING — rate-limited
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Process all items through AI enrichment + embedding in rate-limited batches.
   * @param {Array<Object>} items
   * @returns {Promise<Array<Object>>} Items with AI fields populated
   */
  async _processAIBatches(items) {
    if (!this.claude && !this.gemini) {
      console.log(`${this.tag} Skipping AI processing — no API keys set.`);
      return items;
    }

    const processed = [];
    const totalBatches = Math.ceil(items.length / AI_BATCH_SIZE);

    for (let i = 0; i < items.length; i += AI_BATCH_SIZE) {
      const batchNum = Math.floor(i / AI_BATCH_SIZE) + 1;
      const batch = items.slice(i, i + AI_BATCH_SIZE);

      console.log(
        `${this.tag} AI batch ${batchNum}/${totalBatches} (${batch.length} items)...`,
      );

      const results = await Promise.all(
        batch.map(async (item) => {
          try {
            // Enrichment: summary + vibe_scores
            const description =
              item.long_desc || item.short_desc || item.name || "";
            const enrichment = await this._enrichWithAI(description);

            // Embedding: vector for semantic search
            const embeddingText =
              `${item.name || ""} ${item.short_desc || ""} ${description}`.trim();
            const embedding = await this._generateEmbedding(embeddingText);

            const enriched = {
              ...item,
              short_desc: enrichment.summary || item.short_desc,
              vibe_scores:
                Object.keys(enrichment.vibe_scores).length > 0
                  ? enrichment.vibe_scores
                  : undefined,
              vibe_tags: Object.entries(enrichment.vibe_scores).map(
                ([k, v]) => `${k}:${v}`,
              ),
            };

            // Only add embedding if we got one
            if (embedding) {
              enriched.embedding = embedding;
              this._stats.embedded++;
            }

            this._stats.enriched++;
            return enriched;
          } catch (err) {
            console.error(
              `${this.tag} AI processing failed for "${item.name}":`,
              err.message,
            );
            return item;
          }
        }),
      );

      processed.push(...results);

      // Rate-limit pause between batches
      if (i + AI_BATCH_SIZE < items.length) {
        await this._sleep(AI_BATCH_DELAY_MS);
      }
    }

    return processed;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DATABASE — Batched Upserts
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Upsert items into Supabase `items` table in batches of 50.
   * Uses onConflict: 'slug' to prevent duplicates.
   * Tracks new insertions vs updates for reporting.
   *
   * @param {Array<Object>} items — items to upsert
   * @returns {Promise<{inserted: number, updated: number, failed: number}>}
   */
  async _batchUpsert(items) {
    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < items.length; i += UPSERT_BATCH_SIZE) {
      const batch = items.slice(i, i + UPSERT_BATCH_SIZE);
      const batchNum = Math.floor(i / UPSERT_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(items.length / UPSERT_BATCH_SIZE);

      console.log(
        `${this.tag} DB upsert batch ${batchNum}/${totalBatches} (${batch.length} items)...`,
      );

      try {
        // Check which slugs already exist to distinguish inserts vs updates
        const slugs = batch.map((item) => item.slug);
        const { data: existing } = await supabaseAdmin
          .from("items")
          .select("slug")
          .in("slug", slugs);

        const existingSlugs = new Set((existing || []).map((r) => r.slug));
        const newCount = batch.filter(
          (item) => !existingSlugs.has(item.slug),
        ).length;
        const updateCount = batch.length - newCount;

        // Clean items — remove undefined fields that Supabase won't accept
        const cleanBatch = batch.map((item) => {
          const clean = {};
          for (const [key, val] of Object.entries(item)) {
            if (val !== undefined) clean[key] = val;
          }
          // Always set updated_at on upsert
          clean.updated_at = new Date().toISOString();
          return clean;
        });

        const { error } = await supabaseAdmin.from("items").upsert(cleanBatch, {
          onConflict: "slug",
          ignoreDuplicates: false,
        });

        if (error) throw error;

        inserted += newCount;
        updated += updateCount;
      } catch (err) {
        console.error(
          `${this.tag} Upsert batch ${batchNum} failed:`,
          err.message,
        );
        failed += batch.length;
        this._stats.errors.push(`Batch ${batchNum}: ${err.message}`);
      }
    }

    return { inserted, updated, failed };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — The main entry point
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Run the full ETL pipeline:
   *   1. Extract — fetch() raw data from upstream API
   *   2. Transform — transform() into NovaHub items
   *   3. Enrich — AI summary + vibe_scores via Gemini Flash
   *   4. Embed — vector embedding via Gemini text-embedding-004
   *   5. Load — batched upsert to Supabase
   *
   * This method is idempotent — safe to run multiple times.
   * Duplicates are resolved by slug conflict.
   *
   * @returns {Promise<Object>} Sync report with stats
   */
  async sync() {
    const startTime = Date.now();
    console.log(`${this.tag} ═══════════════════════════════════════════════`);
    console.log(`${this.tag} Starting ETL sync...`);
    console.log(`${this.tag} ═══════════════════════════════════════════════`);

    try {
      // ── Step 1: Extract ──
      console.log(`${this.tag} [1/5] Fetching from upstream API...`);
      const rawData = await this.fetch();

      // ── Step 2: Transform ──
      console.log(`${this.tag} [2/5] Transforming data...`);
      const items = this.transform(rawData);

      if (!Array.isArray(items) || items.length === 0) {
        console.log(`${this.tag} No items to process. Done.`);
        return this._buildReport(startTime);
      }

      this._stats.fetched = items.length;
      console.log(`${this.tag} Transformed ${items.length} items.`);

      // ── Step 3 & 4: AI Enrich + Embed ──
      console.log(`${this.tag} [3/5] AI enrichment (Gemini Flash)...`);
      console.log(`${this.tag} [4/5] AI embeddings (text-embedding-004)...`);
      const enrichedItems = await this._processAIBatches(items);

      // ── Step 5: Load ──
      console.log(
        `${this.tag} [5/5] Upserting to Supabase (batch size: ${UPSERT_BATCH_SIZE})...`,
      );
      const dbStats = await this._batchUpsert(enrichedItems);

      this._stats.inserted = dbStats.inserted;
      this._stats.updated = dbStats.updated;
      this._stats.failed = dbStats.failed;

      const report = this._buildReport(startTime);
      console.log(
        `${this.tag} ═══════════════════════════════════════════════`,
      );
      console.log(
        `${this.tag} ✓ Sync complete`,
        JSON.stringify(report, null, 2),
      );
      console.log(
        `${this.tag} ═══════════════════════════════════════════════`,
      );

      return report;
    } catch (err) {
      console.error(`${this.tag} ✗ Sync failed:`, err.message);
      this._stats.errors.push(err.message);
      return this._buildReport(startTime);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Build the final sync report.
   * @param {number} startTime — Date.now() when sync started
   * @returns {Object}
   */
  _buildReport(startTime) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    return {
      provider: this.providerName,
      durationSeconds: parseFloat(elapsed),
      itemsFetched: this._stats.fetched,
      itemsEnriched: this._stats.enriched,
      itemsEmbedded: this._stats.embedded,
      newItemsAdded: this._stats.inserted,
      existingItemsUpdated: this._stats.updated,
      failed: this._stats.failed,
      errors: this._stats.errors,
    };
  }

  /**
   * Sleep helper.
   * @param {number} ms
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
