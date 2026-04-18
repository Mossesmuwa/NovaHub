# NovaHub Security & Architecture Audit

## ✅ Fixed Issues

### 1. **Authentication: getUser() vs getSession() (FIXED in usePro.js)**
- **Issue**: `usePro.js` was using `getSession()` which reads from localStorage without server verification
- **Risk**: While not critical (pro status verified via DB), less secure for access control
- **Fix Applied**: Updated to use `getCurrentUser()` which calls `getUser()` for server-side verification
- **Status**: ✅ Implemented
- **Files Changed**: `hooks/usePro.js`

**Rule of thumb:**
- `getSession()` → UI display only (navbar username, initial theme) — fast, no network call
- `getUser()` → Access control, data writes, premium features — verified server-side

Current correct usage:
- `lib/supabaseClient.js`: `getCurrentUser()` uses `getUser()` ✅
- `lib/favorites.js`: Uses `getCurrentUser()` for data access ✅
- `lib/SupabaseContext.js`: Uses `getSession()` for UI initialization ✅
- `lib/auth.js`: Uses `getSession()` for startup sync ✅

---

### 2. **Free-Tier Migration Cap (FIXED in lib/auth.js)**
- **Issue**: `mergeAnonData()` migrated ALL anonymous favorites to new free users without respecting the 10-item cap
- **Scenario**: Anon user saves 12 items locally, signs up as free user → all 12 got migrated, violating the constraint
- **Fix Applied**: Now limits migration to the 10 most recent items when an anon account exceeds the limit
- **Status**: ✅ Implemented
- **Files Changed**: `lib/auth.js`

```javascript
// Before: migrated ALL items
// After: migrates only the 10 most recent if limit exceeded
const toMigrate = favs.length > ANON_LIMITS.maxFavorites 
  ? favs.slice(-ANON_LIMITS.maxFavorites) 
  : favs;
```

---

## ⚠️ Architecture Concern: Dual AI Vendors

### Current Setup
- **Gemini 1.5 Flash**: Used in `lib/ingest/Pipeline.js` for content enrichment (summaries + vibe scores)
- **Claude (Anthropic)**: Used in `pages/api/ai-recommend.js` and `pages/api/ai-stream.js` for recommendations

### The Issue
Maintaining two separate AI SDKs (`@google/genai` and `@anthropic-ai/sdk`) creates:
- Dependency bloat
- Inconsistent error handling patterns
- Different rate limit / retry logic
- Two API keys to manage
- Risk of vendor lock-in across the platform

### Recommendation
**Consolidate to single vendor.** Options:

#### Option A: Migrate everything to Claude (Anthropic)
✅ **Pros:**
- Claude excels at content reasoning and structured JSON output
- Haiku model is cost-effective for pipeline enrichment
- Simpler stack, fewer SDKs

❌ **Cons:**
- May be slightly higher cost than Gemini Flash for high-volume ingestion

**Action:** Migrate `lib/ingest/Pipeline.js` to use Claude Haiku instead of Gemini Flash

#### Option B: Migrate everything to Gemini
✅ **Pros:**
- Gemini Flash is very cheap for structured JSON
- Embeddings are built-in (no separate call to embeddings API)

❌ **Cons:**
- Slightly weaker at content reasoning than Claude

**Recommendation: Option A (Claude)** is preferred for a discovery platform where content understanding matters.

---

## ✅ Verified Good Patterns

### 1. **DB Constraints Over App-Level Caps**
The free-tier 10-favorite limit is enforced at the DB level (trigger), not just in application code. This is correct — application-level caps can be bypassed; DB constraints cannot. ✅

### 2. **Pipeline Architecture**
The `BaseProvider → concrete providers → SyncEngine` pattern is clean and maintainable. Thin route wrappers (70 lines vs 323) is a real improvement. ✅

### 3. **Cookie-Based Dismissal**
Using cookies to dismiss upgrade nudges prevents pestering users with the same modal repeatedly. This is the right approach. ✅

### 4. **Caching Layer**
The in-memory cache in `pages/api/ai-recommend.js` (10-min TTL) reduces API costs and improves latency for repeated requests. Good for development; consider Redis for production. ✅

---

## Summary Table

| Issue | Severity | Status | Files |
|-------|----------|--------|-------|
| usePro using getSession | Medium | ✅ Fixed | `hooks/usePro.js` |
| mergeAnonData exceeding free cap | Medium | ✅ Fixed | `lib/auth.js` |
| Dual AI vendors (Gemini + Claude) | Low | ⚠️ Recommend consolidation | `lib/ingest/Pipeline.js`, `pages/api/ai-recommend.js` |

---

## Next Steps

1. **Run tests** on login flow to verify migration behavior
2. **Consider AI consolidation** in next sprint (low priority but good technical debt)
3. **Monitor** free-tier signup conversion after auth improvements
