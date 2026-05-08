// lib/pipeline/BaseProvider.js
// NovaHub — AI Content Pipeline
// Abstract base class for all data providers.
// Subclasses must implement fetch() and transform().

/**
 * BaseProvider — the foundation of every content provider in the pipeline.
 *
 * Subclass contract:
 *   - override fetch()      → return raw API response data
 *   - override transform()  → convert raw data into NovaHub item objects
 *
 * The run() template method calls fetch → transform and handles errors.
 */
export class BaseProvider {
  /**
   * @param {string} name — human-readable provider name (used in logs)
   */
  constructor(name) {
    if (new.target === BaseProvider) {
      throw new Error('BaseProvider is abstract — extend it, don\'t instantiate it directly.');
    }
    this.name = name;
    this.tag = `[Pipeline:${name}]`;
  }

  /**
   * Fetch raw data from the upstream API.
   * @returns {Promise<any>} Raw API response payload
   */
  async fetch() {
    throw new Error(`${this.tag} fetch() must be implemented by subclass.`);
  }

  /**
   * Transform raw API data into an array of NovaHub item objects.
   * Each item must have at minimum: slug, name, category_id, type.
   * @param {any} rawData — whatever fetch() returned
   * @returns {Array<Object>} Array of NovaHub-shaped item objects
   */
  transform(rawData) {
    throw new Error(`${this.tag} transform() must be implemented by subclass.`);
  }

  /**
   * Template method — runs the full provider lifecycle.
   * 1. Fetch raw data from the upstream API
   * 2. Transform into NovaHub items
   * 3. Return the items array
   *
   * Handles errors with tagged logging.
   * @returns {Promise<Array<Object>>} Array of NovaHub items ready for sync
   */
  async run() {
    console.log(`${this.tag} Starting data fetch...`);

    try {
      const rawData = await this.fetch();
      console.log(`${this.tag} Fetch complete. Transforming data...`);

      const items = this.transform(rawData);

      if (!Array.isArray(items)) {
        throw new Error('transform() must return an array of items.');
      }

      console.log(`${this.tag} Transformed ${items.length} items.`);
      return items;
    } catch (err) {
      console.error(`${this.tag} Pipeline error:`, err.message);
      throw err;
    }
  }
}
