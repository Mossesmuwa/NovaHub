# Supabase RLS & Authentication Fix Guide

## Problems & Root Causes

### 1. **403 Forbidden on PATCH items**

**What was happening:**
```javascript
// lib/items.js (REMOVED)
supabase.from('items')
  .update({ view_count: (data.view_count || 0) + 1 })
  .eq('id', data.id)
```

**Why it failed:**
- The client-side code tried to update `items.view_count` using the anon/public key
- No UPDATE policy existed on the `items` table for regular users
- Client-side updates are insecure anyway (users could cheat by incrementing view counts)

**Fix Applied:**
✅ Removed client-side view tracking
✅ Created server-side API endpoint: `pages/api/track-view.js`
✅ Added proper RLS policy: `items_select_approved` (SELECT only for approved items)

---

### 2. **406 Not Acceptable on favorites query**

**What was happening:**
```javascript
// OLD: Nested select with permission issues
const { data } = await supabase
  .from('favorites')
  .select('*, items(*)') // Nested join causes issues
  .eq('user_id', user.id)
```

**Why it failed:**
- Nested joins `items(*)` with RLS policies can cause permission conflicts
- Complex nested selects under RLS are less reliable
- Column permissions may not propagate through joins correctly

**Fix Applied:**
✅ Split into two separate queries:
```javascript
// Step 1: Get favorite records (lightweight)
const { data: favs } = await supabase
  .from('favorites')
  .select('id, item_id, user_id, created_at')
  .eq('user_id', user.id)

// Step 2: Fetch item details in a separate, clean query
const { data: items } = await supabase
  .from('items')
  .select('*')
  .in('id', itemIds)
```

---

### 3. **Missing/Incorrect RLS Policies**

**What was missing:**
- UPDATE policy on `anon_sessions` (was getting 403 when trying to increment favorites_count)
- DELETE policy on `anon_sessions`
- Incomplete policies on comments, comment_likes, ratings, lists

**Fix Applied:**
✅ Created comprehensive `db/003_fix_rls_policies.sql` with proper policies for:
- ✅ Favorites: SELECT own, INSERT own, DELETE own, UPDATE own
- ✅ Anon Sessions: Full CRUD operations
- ✅ Profiles: Select public, UPDATE own
- ✅ Comments: Select non-flagged, INSERT any, DELETE own
- ✅ Lists: Select public/own, CRUD with ownership checks
- ✅ History: SELECT own, INSERT own, DELETE own
- ✅ Ratings: SELECT all, INSERT/UPDATE/DELETE own
- ✅ Items: SELECT approved only (no client-side UPDATE)

---

## What You Need To Do

### Step 1: Run the SQL Migration

Go to [Supabase Dashboard](https://app.supabase.com) → SQL Editor → Run this file:

**File:** `db/003_fix_rls_policies.sql`

**Steps:**
1. Open Supabase SQL Editor
2. Paste the entire contents of `db/003_fix_rls_policies.sql`
3. Click "Run" 
4. Wait for confirmation that all policies are created

**Important:** This will:
- Drop old incorrect policies
- Add the `user_id` column to `favorites` if missing
- Create 30+ new RLS policies for all tables
- Enable RLS on additional tables (ratings, affiliate_clicks, featured_listings)

---

### Step 2: Frontend Code is Already Fixed ✅

These files have been updated:

**`lib/items.js`** - Removed view tracking
- ❌ REMOVED: `supabase.from('items').update({ view_count: ... })`
- ✅ REASON: View tracking now happens server-side via API

**`lib/favorites.js`** - Fixed the 406 error
- ✅ CHANGED: Split `select('*, items(*)')` into two queries
- ✅ REASON: Nested joins under RLS can fail; separate queries are more reliable

**`lib/supabaseClient.js`** - Already singleton ✅
- ✅ Uses lazy initialization to prevent double instances
- ✅ Exported via Proxy for transparent API

**`lib/SupabaseContext.js`** - Already fixed with useMemo ✅
- ✅ Uses `useMemo(() => getSupabase(), [])` for stable reference
- ✅ Prevents multiple GoTrueClient warnings

---

### Step 3: Optional - Call View Tracking Endpoint

**File:** `pages/api/track-view.js` (NEW)

If you want to track item views, call this endpoint from your item detail page:

```javascript
// components/ItemDetail.js or similar
async function trackItemView(itemId) {
  try {
    await fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId })
    });
  } catch (e) {
    console.warn('Could not track view:', e);
  }
}

// Call after fetching item:
const item = await getBySlug(slug);
if (item?.id) trackItemView(item.id);
```

---

## Testing Checklist

After running the SQL migration:

### ✅ Test Authenticated User Operations

1. **Login** → Create account or sign in
2. **Add to Favorites**
   - Click "Save" button
   - Should succeed (201 Created)
   - Check browser DevTools → Network → POST request should work
   
3. **View Favorites**
   - Go to "My Favorites" or dashboard
   - Should show your saved items
   - Should NOT show 406 error

4. **Remove Favorite**
   - Click remove button
   - Should succeed
   - Item should disappear from list

### ✅ Test Anonymous User Operations

1. **Load site without logging in**
2. **Add to Favorites** (as anon)
   - Should work
   - Should not exceed 10 limit
   
3. **Then Login**
   - Should migrate your anon favorites to your account
   - Check "My Favorites" - should still see them

### ✅ Check Browser Console

- ❌ Should NOT see: "Multiple GoTrueClient instances" warning
- ❌ Should NOT see: "403 Forbidden" errors
- ❌ Should NOT see: "406 Not Acceptable" errors
- ✅ Should see: Clean console (or only your app's logs)

### ✅ Check Supabase Dashboard

Go to "Database" → "Editor":
1. Click on `favorites` table
2. Should see rows with `user_id` populated for logged-in users
3. Click on `anon_sessions` table
4. Should see sessions with correct `favorites_count` values

---

## How the Fixes Work

### Favorites Flow (Authenticated)

```
User clicks "Save"
    ↓
addFavorite(itemId) called
    ↓
Supabase auth.uid() = user.id ✓
    ↓
INSERT INTO favorites (item_id, user_id)
    ↓
RLS Policy "favorites_insert_authenticated" checks:
  - auth.uid() == user_id ✓
  - user_id IS NOT NULL ✓
    ↓
Insert succeeds! ✅
```

### Favorites Query Flow

```
getAllFavorites() called
    ↓
SELECT id, item_id, user_id, created_at FROM favorites
    ↓
RLS Policy "favorites_select_own" checks:
  - auth.uid() == user_id ✓
    ↓
Returns favorite records ✓
    ↓
SELECT * FROM items WHERE id IN (...)
    ↓
RLS Policy "items_select_approved" checks:
  - approved == true ✓
    ↓
Returns full item details! ✅
```

### Anon Favorites Flow

```
User (not logged in) clicks "Save"
    ↓
getOrCreateAnonSession()
    ↓
INSERT INTO anon_sessions (fingerprint)
    ↓
RLS Policy "anon_sessions_insert" allows (TRUE) ✓
    ↓
Get anon session ID
    ↓
INSERT INTO favorites (item_id, anon_id, user_id=NULL)
    ↓
RLS Policy "favorites_insert_anonymous" checks:
  - user_id IS NULL ✓
  - anon_id IS NOT NULL ✓
    ↓
Insert succeeds! ✅
    ↓
UPDATE anon_sessions SET favorites_count = ...
    ↓
RLS Policy "anon_sessions_update" allows (TRUE) ✓
    ↓
Success! ✅
```

---

## Security Notes

### ✅ What's Secure

1. **No client-side updates to items** - View counts are now server-side only
2. **Users can only see their own data** - RLS policies enforce `auth.uid() = user_id`
3. **Anonymous data is isolated** - Each anon session is separate
4. **Nested data is protected** - Favorites query splits into two, each with RLS
5. **Service role is server-only** - API endpoints use `supabaseAdmin`, not exposed to client

### ⚠️ What to Avoid

- ❌ Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend code
- ❌ Never bypass RLS by using service role from client-side code
- ❌ Never trust `user_id` sent from client - always validate with `auth.uid()`
- ❌ Never allow client-side updates to user-agnostic data (like item counts)

---

## Troubleshooting

### Error: "column user_id does not exist"

**Solution:** Run this in Supabase SQL editor:
```sql
ALTER TABLE favorites ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
```

### Error: "403 Forbidden"

**Causes:**
1. RLS policy doesn't allow the operation
2. Trying to access another user's data
3. Auth session is invalid

**Debug:**
- Check browser DevTools → Network → Response body
- Look for which policy failed
- Verify `auth.uid()` matches the `user_id` in your data

### Error: "406 Not Acceptable"

**Causes:**
- Nested select with incompatible permissions
- Column doesn't exist
- Invalid query syntax

**Solution:** Use the split-query approach (already applied)

### Favorites not showing after login

**Cause:** `mergeAnonData()` may not have completed before rendering

**Solution:** Add a small delay or refetch after login:
```javascript
// In login handler
await login(email, password);
await new Promise(r => setTimeout(r, 500)); // Wait for merge
// Then refetch favorites
```

---

## File Changes Summary

| File | Change | Reason |
|------|--------|--------|
| `lib/items.js` | ❌ Removed view tracking | Server-side only |
| `lib/favorites.js` | ✅ Split nested query | Fix 406 errors |
| `lib/supabaseClient.js` | ✅ Already singleton | No change needed |
| `lib/SupabaseContext.js` | ✅ Uses useMemo | Prevent double init |
| `pages/api/track-view.js` | ✅ NEW endpoint | Server-side view tracking |
| `db/003_fix_rls_policies.sql` | ✅ NEW migration | RLS policies for all tables |

---

## Next Steps

1. **Run the SQL migration** in Supabase (`db/003_fix_rls_policies.sql`)
2. **Test all operations** using the checklist above
3. **Monitor browser console** for any new errors
4. **Implement view tracking** if desired (call `/api/track-view`)
5. **Add more policies** as you add new features

---

## Questions?

- 📚 [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- 🔐 [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- 🛡️ [Auth Policies Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
