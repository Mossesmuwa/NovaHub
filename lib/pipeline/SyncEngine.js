// lib/pipeline/SyncEngine.js
// NovaHub — AI Content Pipeline
// Orchestrates: Provider.run() → AIService.enrich() → Supabase upsert.
// Uses the Service Role Key to bypass RLS for server-side writes.

import { createClient } from '@supabase/supabase-js';
import { AIService } from './AIService.js';

/**
 * SyncEngine — the central orchestrator of the content pipeline.
 *
 * Workflow:
 *   1. Calls provider.run() to fetch + transform items
 *   2. Enriches each item with AIService (batched to avoid rate limits)
 *   3. Upserts into Supabase `items` table with onConflict: 'slug'
 *
 * Environment:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   GEMINI_API_KEY (used by AIService)
 */
export class SyncEngine {
  /**
   * @param {Object} [options]
   * @param {number} [options.batchSize=5]      — items per AI enrichment batch
   * @param {number} [options.batchDelayMs=1000] — delay between batches (ms)
   * @param {boolean} [options.skipAI=false]     — skip AI enrichment entirely
   */
  constructor(options = {}) {
    this.tag = '[SyncEngine]';

    // ── Supabase admin client (Service Role Key bypasses RLS) ──
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new Error(`${this.tag} NEXT_PUBLIC_SUPABASE_URL is not set.`);
    }
    if (!serviceRoleKey) {
      throw new Error(`${this.tag} SUPABASE_SERVICE_ROLE_KEY is not set. Required to bypass RLS.`);
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // ── AI Service ──
    this.skipAI = options.skipAI || false;
    this.aiService = this.skipAI ? null : new AIService();

    // ── Rate limiting config ──
    this.batchSize = options.batchSize || 5;
    this.batchDelayMs = options.batchDelayMs || 1000;

    // ── Registered providers ──
    this.providers = [];
  }

  /**
   * Register a provider for syncAll().
   * @param {import('./BaseProvider.js').BaseProvider} provider
   * @returns {SyncEngine} this (for chaining)
   */
  register(provider) {
    this.providers.push(provider);
    return this;
  }

  /**
   * Sleep for a given number of milliseconds.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Enrich a single item via AIService.
   * Merges AI summary into short_desc and vibe_scores into vibe_tags.
   * @param {Object} item
   * @returns {Promise<Object>} Enriched item
   */
  async _enrichItem(item) {
    if (this.skipAI || !this.aiService) return item;

    try {
      const description = item.long_desc || item.short_desc || item.name || '';
      const ai = await this.aiService.enrich(description);

      // Merge AI data into item
      return {
        ...item,
        short_desc: ai.summary || item.short_desc,
        vibe_tags: [
          `minimalism:${ai.vibe_scores.minimalism}`,
          `cyberpunk:${ai.vibe_scores.cyberpunk}`,
          `utility:${ai.vibe_scores.utility}`,
        ],
      };
    } catch (err) {
      console.error(`${this.tag} AI enrichment failed for "${item.name}":`, err.message);
      return item; // return un-enriched item as fallback
    }
  }

  /**
   * Enrich items in rate-limited batches.
   * @param {Array<Object>} items
   * @returns {Promise<Array<Object>>} Enriched items
   */
  async _enrichBatch(items) {
    if (this.skipAI) return items;

    const enriched = [];
    const totalBatches = Math.ceil(items.length / this.batchSize);

    for (let i = 0; i < items.length; i += this.batchSize) {
      const batchNum = Math.floor(i / this.batchSize) + 1;
      const batch = items.slice(i, i + this.batchSize);

      console.log(`${this.tag} Enriching batch ${batchNum}/${totalBatches} (${batch.length} items)...`);

      // Process items within a batch concurrently
      const results = await Promise.all(
        batch.map((item) => this._enrichItem(item))
      );
      enriched.push(...results);

      // Delay between batches (skip after last batch)
      if (i + this.batchSize < items.length) {
        console.log(`${this.tag} Rate-limit pause: ${this.batchDelayMs}ms...`);
        await this._sleep(this.batchDelayMs);
      }
    }

    return enriched;
  }

  /**
   * Upsert items into Supabase `items` table.
   * Uses onConflict: 'slug' to update existing entries.
   * @param {Array<Object>} items
   * @returns {Promise<{synced: number, failed: number, errors: string[]}>}
   */
  async _upsert(items) {
    const stats = { synced: 0, failed: 0, errors: [] };

    // Upsert in batches of 50 to avoid payload size limits
    const UPSERT_BATCH = 50;
    for (let i = 0; i < items.length; i += UPSERT_BATCH) {
      const batch = items.slice(i, i + UPSERT_BATCH);

      try {
        const { error } = await this.supabase
          .from('items')
          .upsert(batch, {
            onConflict: 'slug',
            ignoreDuplicates: false,
          });

        if (error) {
          throw error;
        }

        stats.synced += batch.length;
      } catch (err) {
        console.error(`${this.tag} Upsert batch failed:`, err.message);
        stats.failed += batch.length;
        stats.errors.push(err.message);
      }
    }

    return stats;
  }

  /**
   * Run the full sync pipeline for a single provider.
   *
   * @param {import('./BaseProvider.js').BaseProvider} provider
   * @param {Object} [options]
   * @param {boolean} [options.skipAI] — override engine-level skipAI for this run
   * @returns {Promise<Object>} { provider, synced, failed, errors, totalItems }
   */
  async syncProvider(provider, options = {}) {
    const startTime = Date.now();
    console.log(`${this.tag} ═══════════════════════════════════════`);
    console.log(`${this.tag} Syncing provider: ${provider.name}`);
    console.log(`${this.tag} ═══════════════════════════════════════`);

    try {
      // Step 1: Fetch + Transform
      const items = await provider.run();
      if (!items.length) {
        console.log(`${this.tag} No items returned from ${provider.name}. Skipping.`);
        return { provider: provider.name, synced: 0, failed: 0, errors: [], totalItems: 0 };
      }

      // Step 2: AI Enrichment (batched)
      const originalSkipAI = this.skipAI;
      if (options.skipAI !== undefined) this.skipAI = options.skipAI;

      const enrichedItems = await this._enrichBatch(items);
      this.skipAI = originalSkipAI;

      // Step 3: Supabase Upsert
      const stats = await this._upsert(enrichedItems);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`${this.tag} ✓ ${provider.name} complete in ${elapsed}s — synced: ${stats.synced}, failed: ${stats.failed}`);

      return {
        provider: provider.name,
        totalItems: items.length,
        ...stats,
      };
    } catch (err) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`${this.tag} ✗ ${provider.name} failed after ${elapsed}s:`, err.message);
      return {
        provider: provider.name,
        synced: 0,
        failed: 0,
        totalItems: 0,
        errors: [err.message],
      };
    }
  }

  /**
   * Run the full sync pipeline for all registered providers (sequentially).
   * @returns {Promise<Array<Object>>} Array of per-provider result objects
   */
  async syncAll() {
    console.log(`${this.tag} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`${this.tag} Starting full pipeline sync (${this.providers.length} providers)`);
    console.log(`${this.tag} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const results = [];

    for (const provider of this.providers) {
      const result = await this.syncProvider(provider);
      results.push(result);
    }

    // Summary
    const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    console.log(`${this.tag} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`${this.tag} Pipeline complete — synced: ${totalSynced}, failed: ${totalFailed}`);
    console.log(`${this.tag} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    return results;
  }
}
