# 🚀 NovaHub Ingestion Pipeline - Debugging Complete

## Summary

I've added **comprehensive logging throughout your ingestion pipeline** to identify the exact failure point. The logging captures every step from API authentication through database writes, making it easy to pinpoint where things break.

---

## ✅ What Was Fixed/Enhanced

### **7 Files Modified**

| File                                     | Change                                                  | Impact                              |
| ---------------------------------------- | ------------------------------------------------------- | ----------------------------------- |
| `pages/api/ingest/producthunt.js`        | Enhanced error logging & request tracking               | See auth failures, API errors       |
| `pages/api/ingest/tmdb.js`               | Enhanced error logging & request tracking               | See auth failures, API errors       |
| `lib/ingest/Pipeline.js`                 | Added 50+ log statements for DB operations & validation | See exactly where upserts fail      |
| `lib/ingest/ProductHuntProvider.js`      | Enhanced fetch() logging                                | See token issues, API responses     |
| `lib/ingest/TMDBProvider.js`             | Enhanced fetch() + **BUG FIX**                          | Fixed duplicate return statement    |
| `lib/supabaseAdmin.js`                   | Added initialization logging                            | Verify client setup                 |
| **NEW** `pages/api/ingest/test-debug.js` | Debug endpoint (dev-only)                               | Test without CRON_SECRET            |
| **NEW** `DEBUG_INGEST.js`                | Local test script                                       | Run locally: `node DEBUG_INGEST.js` |

### **Logging Hierarchy**

The pipeline now logs at 5 levels:

```
🎬 API Endpoint Entry → Authentication → Provider Creation
   ↓
🔄 Provider.sync() → Extract → Transform → AI Enrich → Embed
   ↓
💾 Database._batchUpsert() → Schema Validation → Slug Check → Upsert → Result
   ↓
✓ or ✗ Final Report with stats
```

---

## 🧪 How to Test NOW

### **Fastest: Use Debug Endpoint** (Development Only)

```bash
# Test ProductHunt (no auth needed)
curl "http://localhost:3000/api/ingest/test-debug?provider=producthunt"

# Test TMDB
curl "http://localhost:3000/api/ingest/test-debug?provider=tmdb"
```

### **Realistic: Use Cron Headers**

```bash
# Get CRON_SECRET from .env.local
CRON_SECRET=$(grep CRON_SECRET .env.local | cut -d= -f2)

# Test ProductHunt
curl -X POST "http://localhost:3000/api/ingest/producthunt" \
  -H "Authorization: Bearer $CRON_SECRET"

# Test TMDB
curl -X POST "http://localhost:3000/api/ingest/tmdb" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### **Local: Node Script**

```bash
# From project root
node DEBUG_INGEST.js
```

---

## 📊 Expected vs Actual Flows

### ✅ **If It Works** (Happy Path)

```
[supabaseAdmin.js] ✓ Client initialized successfully
[ingest/producthunt] ✓ Endpoint called
[ingest/producthunt] ✓ Auth passed
[Ingest:ProductHunt] fetch() starting...
[Ingest:ProductHunt] ✓ Fetched 20 posts
[Ingest:ProductHunt] [2/5] ✓ Transformed 20 items
[Ingest:ProductHunt] DB upsert batch 1/1 (20 items)...
[Ingest:ProductHunt] ✓ Upsert successful - inserted 20, updated 0
✅ Response: { "success": true, "newItemsAdded": 20 }
```

### ❌ **If It Fails** (Diagnostic Examples)

**Auth Failed:**

```
[ingest/producthunt] ✗ Auth failed - header: "undefined"
❌ Response: { "success": false, "error": "Unauthorized" }
```

**Token Missing:**

```
[Ingest:ProductHunt] Token present: NO
[Ingest:ProductHunt] ✗ CRITICAL: Product Hunt credential not found
```

**Supabase Client Broken:**

```
[supabaseAdmin.js] NEXT_PUBLIC_SUPABASE_URL: ✗ MISSING
[supabaseAdmin.js] ✗ Client is NULL
[Ingest:ProductHunt] ✗ supabaseAdmin is null!
```

**Database Error:**

```
[Ingest:ProductHunt] ✗ Upsert error: Error: column "category_id" of relation "items" violates not-null constraint
```

---

## 🔍 Log Parsing Cheat Sheet

### **Look For These Markers**

| Marker                                    | Meaning                 | Action                                 |
| ----------------------------------------- | ----------------------- | -------------------------------------- |
| `[supabaseAdmin.js] ✓ Client initialized` | Supabase OK             | Continue to next check                 |
| `Token present: NO`                       | Credential missing      | Check .env file                        |
| `✗ Fetched 0 posts`                       | API returned no data    | Check API key, rate limits             |
| `First item sample: { ... }`              | Shows what's being sent | Verify schema matches table            |
| `✗ CRITICAL: supabaseAdmin is null!`      | Auth failed             | Check SERVICE_ROLE_KEY                 |
| `✓ Upsert successful - inserted 20`       | Success!                | Check database did it actually persist |
| `failed: 0, errors: []`                   | No failures             | All items should be in DB              |

### **Grep Examples**

```bash
# Watch for errors only
npm run dev 2>&1 | grep -i "✗\|error\|failed"

# Follow a single ingestion run
npm run dev 2>&1 | grep "\[Ingest:ProductHunt\]"

# Find auth failures
npm run dev 2>&1 | grep "Auth failed\|Unauthorized"

# Find DB issues
npm run dev 2>&1 | grep "Upsert\|Supabase"
```

---

## 🛠️ Pre-Flight Checklist

Before testing, verify:

- [ ] `.env.local` has `SUPABASE_SERVICE_ROLE_KEY` (not the anon key!)
- [ ] `.env.local` has `PRODUCTHUNT_DEVELOPER_TOKEN` or `TMDB_API_KEY`
- [ ] `.env.local` has `CRON_SECRET`
- [ ] Supabase DB is running and accessible
- [ ] Migration `002_add_embeddings.sql` has been run (vibe_scores, embedding columns)
- [ ] Categories table has data: `SELECT COUNT(*) FROM categories;`
- [ ] Current item count: `SELECT COUNT(*) FROM items;`

---

## 🎯 The Exact Points You'll Get Answers For

After running one of the test commands above, you'll immediately know:

1. **Is the endpoint even being called?**
   - See: `[ingest/producthunt] ✓ Endpoint called`

2. **Is authentication working?**
   - See: `[ingest/producthunt] ✓ Auth passed` or `✗ Auth failed`

3. **Can we fetch from Product Hunt?**
   - See: `[Ingest:ProductHunt] ✓ Fetched 20 posts` or error message

4. **Are items being transformed correctly?**
   - See: `First item sample: { slug: "...", name: "...", category_id: "..." }`

5. **Is the Supabase connection alive?**
   - See: `[Ingest:ProductHunt] ✓ supabaseAdmin initialized`

6. **Are items being inserted?**
   - See: `✓ Upsert successful - inserted 20, updated 0`

7. **What's the actual DB error (if any)?**
   - See: `Error: column "X" violates not-null constraint` or detailed Supabase response

---

## 📝 After You Get Results

**Once you run the test and post the logs**, I can immediately identify the issue and provide the fix. The logs will show the exact failure point.

### Attach These When Asking for Help:

1. Full console output from the test endpoint
2. Any error messages shown
3. Current item count: `SELECT COUNT(*) FROM items;`
4. First item in DB: `SELECT * FROM items LIMIT 1;`

---

## 🚀 Production Readiness

Once ingestion works:

1. **Remove debug endpoint** before deploying:

   ```bash
   rm pages/api/ingest/test-debug.js
   ```

2. **Keep the logging** — it's production-safe and useful for troubleshooting

3. **Configure Vercel cron** in `vercel.json` to call the real endpoints with CRON_SECRET

4. **Monitor logs** in Vercel dashboard

---

## 📚 Complete Documentation

See `INGESTION_DEBUG_GUIDE.md` for:

- Detailed testing procedures
- Common issues & solutions
- Production monitoring
- Performance tuning

---

**🎯 Next Step:** Run one of the test commands above and share the output. The logs will tell us exactly what's wrong!
