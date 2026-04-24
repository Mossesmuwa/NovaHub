# NovaHub Ingestion Pipeline - Debugging & Testing Guide

## Summary of Changes

I've added comprehensive logging throughout your ingestion pipeline to identify exactly where failures occur. All changes are backward-compatible and production-ready (except the debug endpoint which is dev-only).

---

## 🔧 Files Modified

### 1. **API Endpoints** (Enhanced Request/Error Logging)

- `pages/api/ingest/producthunt.js` ✅
- `pages/api/ingest/tmdb.js` ✅

**Changes:**

- Log request received with timestamp
- Log authorization header presence
- Log CRON_SECRET env var status
- Detailed auth failure messages
- Full error stack traces in development

### 2. **Core Pipeline** (Enhanced Database & Error Logging)

- `lib/ingest/Pipeline.js` ✅

**Changes in `_batchUpsert()`:**

- Verify supabaseAdmin is initialized (not null)
- Log environment variables on startup
- Log first item schema for validation
- Check required fields (slug, name, category_id)
- Log existing slug counts
- Detailed Supabase error logging (code, message, hint)
- Per-batch upsert success/failure tracking

**Changes in `sync()`:**

- Log AI client availability (Claude, Gemini)
- Enhanced step-by-step progress reporting

### 3. **Provider Fetch Methods** (Enhanced External API Logging)

- `lib/ingest/ProductHuntProvider.js` ✅
- `lib/ingest/TMDBProvider.js` ✅

**Changes:**

- Log fetch() start
- Log token presence verification
- Log API URL and parameters
- Log response status codes
- Detailed GraphQL/API error logging
- Log final item counts

### 4. **Supabase Admin Client** (Initialization Logging)

- `lib/supabaseAdmin.js` ✅

**Changes:**

- Log browser context detection
- Log environment variable presence
- Log client initialization status

### 5. **Bug Fixes**

- Fixed duplicate `return res.json()` in TMDBProvider.js ✅

### 6. **Debug Endpoints**

- `pages/api/ingest/test-debug.js` ✅ (NEW)
- `DEBUG_INGEST.js` ✅ (NEW)

---

## 📊 How to Test

### **Option 1: Call Debug Endpoint (Quickest)**

```bash
# Test ProductHunt ingestion
curl "http://localhost:3000/api/ingest/test-debug?provider=producthunt"

# Test TMDB ingestion
curl "http://localhost:3000/api/ingest/test-debug?provider=tmdb"
```

**Expected Response:**

```json
{
  "success": true,
  "provider": "producthunt",
  "report": {
    "provider": "ProductHunt",
    "durationSeconds": "12.5",
    "itemsFetched": 10,
    "itemsEnriched": 8,
    "itemsEmbedded": 0,
    "newItemsAdded": 10,
    "existingItemsUpdated": 0,
    "failed": 0,
    "errors": []
  },
  "timestamp": "2026-04-24T..."
}
```

### **Option 2: Test with Real Cron Headers**

```bash
# Test ProductHunt with CRON_SECRET header
curl -X POST "http://localhost:3000/api/ingest/producthunt" \
  -H "Authorization: Bearer c5ecc696ae51b52b4beb1eefd64d397a10c7a83b2c970a67503e5e6c6f05fbd7"

# Test TMDB with CRON_SECRET header
curl -X POST "http://localhost:3000/api/ingest/tmdb" \
  -H "Authorization: Bearer c5ecc696ae51b52b4beb1eefd64d397a10c7a83b2c970a67503e5e6c6f05fbd7"
```

### **Option 3: Run Debug Script (Node.js)**

```bash
# From project root
node DEBUG_INGEST.js
```

---

## 🔍 What the Logs Will Tell You

### **Success Case (All 5 Steps):**

```
[Ingest:ProductHunt] ═══════════════════════════════════════════════
[Ingest:ProductHunt] Starting ETL sync...
[Ingest:ProductHunt] AI Clients: Claude=✗, Gemini=✓
[Ingest:ProductHunt] [1/5] Fetching from upstream API...
[Ingest:ProductHunt] fetch() starting...
[Ingest:ProductHunt] Token present: yes
[Ingest:ProductHunt] Making API call to https://api.producthunt.com/v2/api/graphql with limit=20...
[Ingest:ProductHunt] API response status: 200
[Ingest:ProductHunt] ✓ Fetched 20 posts
[Ingest:ProductHunt] [1/5] ✓ Fetch complete
[Ingest:ProductHunt] [2/5] Transforming data...
[Ingest:ProductHunt] [2/5] ✓ Transformed 20 items
[Ingest:ProductHunt] [5/5] Upserting to Supabase (batch size: 50)...
[Ingest:ProductHunt] DB upsert batch 1/1 (20 items)...
[Ingest:ProductHunt]   Checking existence for 20 slugs...
[Ingest:ProductHunt]   Found 0 existing slugs
[Ingest:ProductHunt]   New items: 20, Updates: 0
[Ingest:ProductHunt]   Upserting 20 items...
[Ingest:ProductHunt]   ✓ Upsert successful - inserted 20, updated 0
[Ingest:ProductHunt] ✓ Sync complete
```

### **Failure Point Detection:**

**If fails at fetch:**

```
[Ingest:ProductHunt] Token present: NO
[Ingest:ProductHunt] ✗ CRITICAL: Product Hunt credential not found
```

**If fails at Supabase:**

```
[Ingest:ProductHunt] ✗ supabaseAdmin is null!
[Ingest:ProductHunt] ✗ CRITICAL: supabaseAdmin is not initialized
```

**If fails at upsert:**

```
[Ingest:ProductHunt] ✗ Upsert error: Error: column "category_id" of relation "items" violates not-null constraint
```

---

## ✅ Pre-Flight Checks

### 1. **Environment Variables**

```bash
# Verify in .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PRODUCTHUNT_DEVELOPER_TOKEN=...
TMDB_API_KEY=...
GEMINI_API_KEY=...
CRON_SECRET=...
```

### 2. **Database Migrations**

Run in Supabase SQL Editor:

```sql
-- Check if vibe_scores and embedding columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name='items'
AND column_name IN ('vibe_scores', 'embedding');
```

Expected: Both columns should be present

### 3. **Categories**

```sql
-- Verify categories exist
SELECT id, name FROM categories;
```

Expected: Rows including: 'ai-tools', 'movies', 'productivity', 'design', 'security', 'finance', 'courses'

### 4. **Service Role Key**

The Service Role Key must be used for admin operations (not the anon key):

- ✓ `SUPABASE_SERVICE_ROLE_KEY` — correct
- ✗ `NEXT_PUBLIC_SUPABASE_ANON_KEY` — this would fail!

---

## 🐛 Common Issues & Solutions

### **Issue 1: 401 Unauthorized on Cron**

**Symptom:** `/api/ingest/producthunt` returns 401

**Diagnosis:**

- Check header: `Authorization: Bearer <CRON_SECRET>`
- Check .env: `CRON_SECRET` is set
- Check header matches exactly

**Solution:**

```bash
curl -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)" http://localhost:3000/api/ingest/producthunt
```

### **Issue 2: No Items Inserted**

**Symptom:** Ingestion "succeeds" but database has 0 new rows

**Possible Causes (in order):**

1. Upsert failed silently (check Supabase error logs)
2. All items already exist (check slugs)
3. Required fields missing (slug, name, category_id)
4. Database constraint violation

**Debug:**

- Check logs for upsert batch errors
- Check item sample in logs: `First item sample: { slug: "...", name: "...", category_id: "..." }`
- Query existing items: `SELECT COUNT(*) FROM items;`

### **Issue 3: AI Enrichment Skipped**

**Symptom:** `itemsEnriched: 0` in report

**Diagnosis:** ANTHROPIC_API_KEY not set

**Solution:** Add to .env.local (optional):

```
ANTHROPIC_API_KEY=sk-...
```

If not set, items will still be inserted without AI enrichment — this is fine.

### **Issue 4: Embedding Generation Skipped**

**Symptom:** `itemsEmbedded: 0` in report

**Diagnosis:** GEMINI_API_KEY not set or invalid

**Solution:** Verify in .env.local:

```
GEMINI_API_KEY=AIzaSy...
```

---

## 📈 Monitoring in Production

### **Vercel Logs**

For cron jobs, check:

1. Vercel Dashboard → Project → Functions
2. Filter by `/api/ingest/*`
3. Look for request logs with `[ingest/...]` tags

### **Supabase Logs**

Check database operations:

1. Supabase Dashboard → Logs
2. Filter by upsert operations
3. Look for constraint violations

### **Query Current Item Count**

```sql
SELECT COUNT(*) as total,
       source_name,
       COUNT(*) as count
FROM items
GROUP BY source_name;
```

---

## 🚀 Next Steps After Debugging

1. **Once ingestion works:**
   - Remove `pages/api/ingest/test-debug.js` before deploying
   - Schedule cron jobs in Vercel
   - Monitor for 24 hours

2. **To optimize:**
   - Adjust `limit` in provider constructors
   - Adjust `UPSERT_BATCH_SIZE` in Pipeline.js
   - Add rate limiting if needed

3. **To extend:**
   - Add more providers (books, games, etc.)
   - Add data validation/deduplication
   - Add email notifications for failures

---

## 📝 Logging Format

All logs use this format for easy grepping:

```
[Ingest:ProviderName] [step/status] Message
```

Examples:

- `[Ingest:ProductHunt] [1/5] Fetching...`
- `[Ingest:TMDB] ✓ Fetched 20 posts`
- `[Ingest:ProductHunt] ✗ Auth failed`

Grep examples:

```bash
# Find all ingestion errors
grep "\[Ingest:" logs | grep "✗"

# Find ProductHunt only
grep "\[Ingest:ProductHunt\]" logs

# Find all upsert operations
grep "DB upsert" logs
```
