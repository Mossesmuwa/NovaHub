// lib/pipeline/BooksProvider.js
// NovaHub — AI Content Pipeline
// Fetches trending/notable books from Google Books API.

import { BaseProvider } from "./BaseProvider.js";
import { getEnvCredential, toSlug } from "../helpers.js";

const BOOKS_BASE = "https://www.googleapis.com/books/v1/volumes";

// Curated search queries to pull interesting books across topics
const SEARCH_QUERIES = [
  "subject:technology bestseller",
  "subject:science popular",
  "subject:business strategy",
  "subject:artificial intelligence",
  "subject:psychology",
  "subject:design",
];

/**
 * BooksProvider — pulls notable books from Google Books API.
 *
 * Environment:
 *   GOOGLE_BOOKS_API_KEY  (optional — works without key but rate limited)
 *
 * Produces items with:
 *   category_id: 'books', type: 'book'
 */
export class BooksProvider extends BaseProvider {
  /**
   * @param {Object} [options]
   * @param {number} [options.limitPerQuery=5] — books per search query
   */
  constructor(options = {}) {
    super("Books");
    this.limitPerQuery = options.limitPerQuery || 5;
  }

  async fetch() {
    const key = getEnvCredential("GOOGLE_BOOKS_API_KEY");
    const allBooks = [];
    const seen = new Set();

    for (const q of SEARCH_QUERIES) {
      try {
        let url = `${BOOKS_BASE}?q=${encodeURIComponent(q)}&maxResults=${this.limitPerQuery}&orderBy=relevance&printType=books&langRestrict=en`;
        if (key) url += `&key=${key}`;

        const res = await fetch(url);
        if (!res.ok) continue;

        const data = await res.json();
        const items = data.items || [];

        for (const item of items) {
          const id = item.id;
          if (!seen.has(id)) {
            seen.add(id);
            allBooks.push(item);
          }
        }
      } catch (err) {
        console.warn(`[BooksProvider] Query "${q}" failed:`, err.message);
      }
    }

    return allBooks;
  }

  transform(rawBooks) {
    return rawBooks
      .filter((book) => {
        const info = book.volumeInfo;
        return info?.title && info?.description;
      })
      .map((book) => {
        const info = book.volumeInfo;
        const name = info.title;
        const authors = (info.authors || []).join(", ");
        const slug = toSlug(`${name} ${authors} books ${book.id}`.slice(0, 80));

        const categories = (info.categories || [])
          .flatMap((c) => c.toLowerCase().split(/[\/&,]/))
          .map((c) => c.trim())
          .filter(Boolean)
          .slice(0, 4);

        const tags = ["books", "google-books", ...categories].slice(0, 8);

        // Best available image
        const image =
          info.imageLinks?.thumbnail?.replace("http:", "https:") ||
          info.imageLinks?.smallThumbnail?.replace("http:", "https:") ||
          null;

        const rating = info.averageRating
          ? parseFloat(info.averageRating.toFixed(1))
          : null;

        return {
          slug,
          name,
          short_desc: (info.description || "").slice(0, 200),
          long_desc: info.description || "",
          category_id: "books",
          type: "book",
          image,
          year: info.publishedDate
            ? parseInt(info.publishedDate.slice(0, 4), 10)
            : null,
          rating,
          rating_count: info.ratingsCount || 0,
          author: authors,
          publisher: info.publisher || null,
          tags,
          vibe_tags: [],
          affiliate_link: info.infoLink || null,
          source_url: info.canonicalVolumeLink || info.infoLink || null,
          source_id: book.id,
          source_name: "google-books",
          trending: false,
          approved: true,
          metadata: {
            page_count: info.pageCount || null,
            language: info.language || "en",
            isbn: info.industryIdentifiers?.[0]?.identifier || null,
            categories,
          },
        };
      });
  }
}
