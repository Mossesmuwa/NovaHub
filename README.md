# NovaHub

> AI-powered discovery platform for movies, books, AI tools, games, cyber security resources, and more.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://novahub.vercel.app)
[![Built with Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

---

## What is NovaHub?

NovaHub is a discovery engine that helps people find the best content across every category — movies, books, AI tools, games, security resources, videos, and more. It combines human curation with AI-powered search and recommendations.

**Key features:**
- AI recommendation engine
- Anonymous browsing — no account required to save up to 10 items
- Full account system — unlimited saves, lists, and cross-device sync
- Google and GitHub OAuth login
- Dark and light mode
- Fully responsive — works on all screen sizes
- Real-time database via Supabase

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email, Google, GitHub) |
| Hosting | Vercel |
| Fonts | Syne + DM Sans (Google Fonts) |

No build step. No framework. No node_modules. Just files.

---

## Project Structure

```
novahub/
├── index.html              # Home page
├── category.html           # Browse by category
├── item.html               # Item detail page
├── search.html             # Search and explore
├── blog.html               # Blog listing
├── vercel.json             # Vercel config (fixes routing)
│
├── account/
│   ├── login.html          # Sign in
│   ├── register.html       # Create account
│   └── dashboard.html      # User dashboard
│
├── css/
│   └── main.css            # Full design system
│
├── js/
│   ├── db.js               # Supabase client
│   ├── theme.js            # Dark/light mode
│   ├── data.js             # Local content data
│   └── ui.js               # Shared UI components
│
└── assets/
    ├── logo.svg            # Full wordmark
    └── favicon.svg         # Icon mark
```

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Mossesmuwa/NovaHub.git
cd NovaHub
```

### 2. Configure Supabase

Open `js/db.js` and replace:

```js
const NOVA_KEY = 'YOUR_ANON_KEY_HERE'
```

With your actual anon key from:  
**Supabase → Settings → API → anon public key**

### 3. Run the database schema

Go to **Supabase → SQL Editor → New Query** and run the schema from `supabase/schema.sql` (in previous session output).

### 4. Deploy

**Option A — Vercel (recommended)**
1. Push to GitHub
2. Import repo at vercel.com
3. Add environment variable: `SUPABASE_ANON_KEY`
4. Deploy

**Option B — Local development**

Any static file server works:

```bash
# Python
python3 -m http.server 3000

# Node
npx serve .

# VS Code
# Use the Live Server extension
```

---

## Environment Variables

Only one variable is needed for the frontend:

```
NOVA_KEY = your_supabase_anon_key
```

This is safe to expose in frontend code (it is the public anon key, not the secret service key).

---

## Content Categories

| ID | Name | Description |
|----|------|-------------|
| `movies` | Movies & TV | Blockbusters, indie films, series |
| `books` | Books | Bestsellers, classics, must-reads |
| `ai-tools` | AI Tools | Writing, coding, image, video AI |
| `games` | Games | Console, PC, indie games |
| `security` | Cyber Security | Tools, courses, certifications |
| `videos` | Videos | Tutorials, channels, documentaries |
| `productivity` | Productivity | Apps and tools to get more done |

---

## Adding Content

Content lives in `js/data.js`. Each item follows this structure:

```js
{
  id:           'unique-slug',
  slug:         'unique-slug',
  name:         'Item Name',
  type:         'movie' | 'book' | 'tool' | 'game' | 'video',
  category_id:  'movies',
  short_desc:   'One sentence description.',
  image:        'https://images.unsplash.com/...',
  rating:       8.5,
  year:         2024,
  affiliate_link: 'https://...',
  trending:     true,
  daily_pick:   false,
  featured:     true,
}
```

When Supabase is connected, data is pulled from the database instead. Add items via the Supabase table editor or SQL.

---

## Roadmap

- [ ] TMDB API integration (auto-fetch movies)
- [ ] Google Books API (auto-fetch books)
- [ ] RAWG API (auto-fetch games)
- [ ] AI chat interface (Claude API)
- [ ] Browser extension
- [ ] Weekly AI-generated newsletter
- [ ] Pro tier with Stripe

---

## License

MIT — do what you want with the code.

---

Built by [Mosses Muwa](https://mossesmuwa.github.io) · Cyber Security student and developer
