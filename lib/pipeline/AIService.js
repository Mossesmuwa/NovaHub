// lib/pipeline/AIService.js
// NovaHub — AI Content Pipeline
// Uses Google Gemini 1.5 Flash to enrich items with vibe-heavy summaries
// and vibe scores (minimalism, cyberpunk, utility).

import { GoogleGenAI } from '@google/genai';

/**
 * AIService — Gemini-powered content enrichment.
 *
 * Takes a raw item description and produces:
 *   - summary:     A 20-word 'vibe-heavy' summary
 *   - vibe_scores: { minimalism: 0-100, cyberpunk: 0-100, utility: 0-100 }
 *
 * Environment:
 *   GEMINI_API_KEY
 */
export class AIService {
  /**
   * @param {Object} [options]
   * @param {string} [options.model='gemini-1.5-flash'] — Gemini model ID
   * @param {number} [options.maxRetries=1]             — retries on failure
   */
  constructor(options = {}) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('[AIService] GEMINI_API_KEY environment variable is not set.');
    }

    this.ai = new GoogleGenAI({ apiKey });
    this.model = options.model || 'gemini-1.5-flash';
    this.maxRetries = options.maxRetries ?? 1;
    this.tag = '[AIService]';
  }

  /**
   * Build the structured prompt for Gemini.
   * @param {string} description — raw item description
   * @returns {string} The prompt string
   */
  _buildPrompt(description) {
    return `You are a content curator for a modern discovery platform called NovaHub.

Given the following item description, produce a JSON object with exactly two fields:

1. "summary": A vibe-heavy, evocative summary in EXACTLY 20 words. 
   Make it feel like a friend recommending something — punchy, opinionated, aesthetic.
   
2. "vibe_scores": An object with exactly three keys, each scored 0–100:
   - "minimalism": How clean, simple, and stripped-back is this? (100 = ultra-minimal)
   - "cyberpunk": How techy, futuristic, neon-edged, or hacker-coded does it feel? (100 = full cyberpunk)
   - "utility": How practical, tool-like, and productivity-oriented is it? (100 = pure utility)

CRITICAL: Return ONLY valid JSON. No markdown fences, no explanation, no preamble.

Example output:
{"summary":"A neon-drenched noir thriller that rewires your brain and refuses to let go of your soul","vibe_scores":{"minimalism":20,"cyberpunk":85,"utility":10}}

Item description:
"""
${description.slice(0, 1000)}
"""`;
  }

  /**
   * Parse and validate Gemini's JSON response.
   * @param {string} text — raw response text from Gemini
   * @returns {Object} Parsed { summary, vibe_scores }
   */
  _parseResponse(text) {
    // Strip markdown fences if present
    const clean = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

    // Find the JSON object
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error('No JSON object found in Gemini response.');
    }

    const parsed = JSON.parse(clean.slice(start, end + 1));

    // Validate structure
    if (typeof parsed.summary !== 'string') {
      throw new Error('Missing or invalid "summary" field in Gemini response.');
    }
    if (typeof parsed.vibe_scores !== 'object' || parsed.vibe_scores === null) {
      throw new Error('Missing or invalid "vibe_scores" field in Gemini response.');
    }

    // Clamp scores to 0–100
    const scores = parsed.vibe_scores;
    return {
      summary: parsed.summary.slice(0, 300),
      vibe_scores: {
        minimalism: this._clamp(scores.minimalism),
        cyberpunk:  this._clamp(scores.cyberpunk),
        utility:    this._clamp(scores.utility),
      },
    };
  }

  /**
   * Clamp a value to the 0–100 integer range.
   * @param {any} val
   * @returns {number}
   */
  _clamp(val) {
    const n = parseInt(val, 10);
    if (isNaN(n)) return 50; // default to neutral
    return Math.max(0, Math.min(100, n));
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
   * Enrich a raw description with AI-generated summary and vibe scores.
   *
   * @param {string} description — the raw text to analyze
   * @returns {Promise<Object>} { summary: string, vibe_scores: { minimalism, cyberpunk, utility } }
   */
  async enrich(description) {
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      console.warn(`${this.tag} Skipping enrichment — description too short or missing.`);
      return this._defaultResult();
    }

    let lastError = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const backoff = Math.pow(2, attempt) * 1000; // 2s, 4s, ...
          console.log(`${this.tag} Retry ${attempt}/${this.maxRetries} after ${backoff}ms...`);
          await this._sleep(backoff);
        }

        const prompt = this._buildPrompt(description);

        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: prompt,
        });

        const text = response.text;
        if (!text) {
          throw new Error('Empty response from Gemini.');
        }

        return this._parseResponse(text);
      } catch (err) {
        lastError = err;
        console.error(`${this.tag} Attempt ${attempt + 1} failed:`, err.message);
      }
    }

    console.error(`${this.tag} All attempts exhausted. Using defaults. Last error:`, lastError?.message);
    return this._defaultResult();
  }

  /**
   * Returns a safe default result when AI enrichment fails.
   * @returns {Object}
   */
  _defaultResult() {
    return {
      summary: '',
      vibe_scores: {
        minimalism: 50,
        cyberpunk: 50,
        utility: 50,
      },
    };
  }
}
