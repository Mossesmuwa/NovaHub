// lib/pipeline/NYTBooksProvider.js
// Fetches NYT Bestseller lists.
// Needs: NYT_API_KEY in Vercel env vars.

import { BaseProvider } from './BaseProvider.js';
import { getEnvCredential, toSlug } from '../helpers.js';

const NYT_BASE = 'https://api.nytimes.com/svc/books/v3';

const LISTS = [
  'hardcover-fiction',
  'hardcover-nonfiction',
  'paperback-nonfiction',
  'young-adult-hardcover',
  'science',
];

export class NYTBooksProvider extends BaseProvider {
  constructor(options = {}) {
    super('NYTBooks');
    this.lists = options.lists || LISTS;
  }

  async fetch() {
    const key = getEnvCredential('NYT_API_KEY');
    if (!key) throw new Error('NYT_API_KEY not set');

    const all = [];
    const seen = new Set();

    for (const list of this.lists) {
      try {
        const res = await fetch(
          `${NYT_BASE}/lists/current/${list}.json?api-key=${key}`
        );
        if (!res.ok) {
          console.warn(`[Pipeline:NYTBooks] ${list} → ${res.status}`);
          continue;
        }

        const data = await res.json();
        const books = data?.results?.books || [];

        for (const book of books) {
          const id = book.primary_isbn13 || book.title;
          if (!seen.has(id)) {
            seen.add(id);
            all.push({ ...book, _list: list });
          }
        }

        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        console.warn(`[Pipeline:NYTBooks] ${list} failed:`, err.message);
      }
    }

    console.log(`[Pipeline:NYTBooks] Fetched ${all.length} books`);
    return all;
  }

  transform(books) {
    return books.map(book => {
      const slug = toSlug(`${book.title} ${book.author} nyt`.slice(0, 80));

      return {
        slug,
        name:         book.title,
        short_desc:   book.description || `#${book.rank} on NYT ${book._list} list`,
        long_desc:    book.description || '',
        category_id:  'books',
        type:         'book',
        image:        book.book_image || null,
        year:         null,
        rating:       null,
        rating_count: book.weeks_on_list || 0,
        author:       book.author,
        publisher:    book.publisher,
        tags:         ['nyt-bestseller', 'books', book._list].slice(0, 8),
        vibe_tags:    [],
        affiliate_link: book.amazon_product_url || null,
        source_url:   book.amazon_product_url || null,
        source_id:    book.primary_isbn13 || toSlug(book.title),
        source_name:  'nyt-books',
        trending:     book.rank <= 5,
        approved:     true,
      };
    });
  }
}
