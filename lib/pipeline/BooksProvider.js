// lib/pipeline/BooksProvider.js
// NovaHub — AI Content Pipeline
// Fetches AI-related books from Google Books API.
// Google Books API is free for basic queries (no key required).

import slugify from "slugify";
import { BaseProvider } from "./BaseProvider.js";
import { getEnvCredential } from "../helpers.js";

const BOOKS_BASE = "https://www.googleapis.com/books/v1";
const BATCH_SIZE = 15;

// ── Curated subjects for NovaHub audience ────────────────────────────────────
const SUBJECTS = [
  "artificial intelligence",
  "cybersecurity hacking",
  "startup entrepreneurship",
  "psychology behavior",
  "science technology",
  "productivity systems",
  "game design",
  "philosophy mind",
];

/**
 * BooksProvider — pulls curated books from Google Books API.
 *
 * Environment:
 *   GOOGLE_BOOKS_API_KEY (optional, for higher quota)
 *
 * Produces items with:
 *   category_id: 'books', type: 'book'
 */
export class BooksProvider extends BaseProvider {
  /**
   * @param {Object} [options]
   * @param {number} [options.limit=10]              — max books per subject
   * @param {number} [options.subjectsPerRun=3]      — how many subjects to pull per run
   */
  constructor(options = {}) {
    super("Books");
    this.limit = options.limit || 10;
    this.subjectsPerRun = options.subjectsPerRun || 3;
  }

  /**
   * Get the subjects to fetch in this run.
   * Rotates through all subjects daily to avoid quota limits.
   * @returns {Array<string>} Subjects for this run
   */
  _getSubjectsForRun() {
    const dayIndex =
      new Date().getDate() % Math.ceil(SUBJECTS.length / this.subjectsPerRun);
    return SUBJECTS.slice(
      dayIndex * this.subjectsPerRun,
      dayIndex * this.subjectsPerRun + this.subjectsPerRun,
    );
  }

  /**
   * Fetch books from Google Books API for a single subject.
   * @param {string} subject — search subject
   * @returns {Promise<Array<Object>>} Array of book volume objects
   */
  async _fetchSubject(subject) {
    try {
      const token = getEnvCredential(
        "GOOGLE_BOOKS_API_KEY",
        "GOOGLE_BOOKS_ACCESS_TOKEN",
      );
      const useBearer =
        token &&
        (token.startsWith("Bearer ") ||
          token.startsWith("eyJ") ||
          token.includes("."));
      const authHeader = useBearer
        ? token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`
        : "";
      const keyParam =
        token && !useBearer ? `&key=${encodeURIComponent(token)}` : "";

      const url = `${BOOKS_BASE}/volumes?q=subject:${encodeURIComponent(subject)}&orderBy=relevance&maxResults=${BATCH_SIZE}&printType=books&langRestrict=en${keyParam}`;

      const res = await fetch(url, {
        headers: authHeader ? { Authorization: authHeader } : {},
      });

      if (!res.ok) {
        throw new Error(`Google Books API error: ${res.status}`);
      }

      const data = await res.json();
      const volumes = (data.items || []).filter(
        (v) => v.volumeInfo?.title && v.volumeInfo?.description,
      );

      console.log(
        `${this.tag} Subject "${subject}" fetched: ${volumes.length} books`,
      );
      return volumes;
    } catch (err) {
      console.error(`${this.tag} Error fetching "${subject}":`, err.message);
      throw err;
    }
  }

  /**
   * Fetch books from all subjects for this run.
   * @returns {Promise<Array<Object>>} Flattened array of all book volumes
   */
  async fetch() {
    const subjects = this._getSubjectsForRun();
    console.log(
      `${this.tag} Fetching ${subjects.length} subjects: ${subjects.join(", ")}`,
    );

    const allVolumes = [];
    for (const subject of subjects) {
      const volumes = await this._fetchSubject(subject);
      allVolumes.push(...volumes);
    }

    return allVolumes;
  }

  /**
   * Transform a Google Books volume into NovaHub item format.
   * @param {Object} vol — Google Books volume object
   * @returns {Object} NovaHub-shaped item
   */
  _volumeToItem(vol) {
    const info = vol.volumeInfo || {};
    const name = info.title || "Unknown Title";
    const authors = (info.authors || []).join(", ");
    const cover =
      info.imageLinks?.thumbnail?.replace("http://", "https://") || null;

    const year = info.publishedDate
      ? parseInt(info.publishedDate.split("-")[0])
      : null;

    const rating = info.averageRating
      ? parseFloat(info.averageRating.toFixed(1))
      : null;

    const slug = slugify(`${name} book ${vol.id}`, {
      lower: true,
      strict: true,
    });

    const tags = [
      "google-books",
      "book",
      ...(info.categories || []).map((c) =>
        slugify(c, { lower: true, strict: true }),
      ),
    ].slice(0, 8);

    return {
      slug,
      name,
      short_desc: (info.description || "").slice(0, 200),
      long_desc: info.description || "",
      category_id: "books",
      type: "book",
      image: cover,
      year,
      rating,
      rating_count: info.ratingsCount || 0,
      author: authors,
      genre: (info.categories || []).join(", "),
      tags,
      vibe_tags: [],
      source_url:
        info.infoLink || `https://books.google.com/books?id=${vol.id}`,
      source_id: vol.id,
      source_name: "google-books",
      affiliate_link: info.buyLink || null,
      trending: false,
      approved: true,
    };
  }

  /**
   * Transform raw Google Books volumes into NovaHub item format.
   * @param {Array<Object>} rawVolumes — array of book volumes
   * @returns {Array<Object>} NovaHub-shaped items
   */
  transform(rawVolumes) {
    return rawVolumes.map((vol) => this._volumeToItem(vol));
  }
}
