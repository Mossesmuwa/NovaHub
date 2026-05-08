# NovaHub Monorepo Migration Guide

## Overview

NovaHub is being restructured from a single Next.js app into a **monorepo** with:

- **apps/web** — User-facing application (nova.com)
- **apps/admin** — Admin dashboard (admin.nova.com)
- **packages/shared** — Shared code, types, utilities
- **Turbo** — Build orchestration

## Current Structure (In Progress)

```
novahub/
├── turbo.json              ✅ Created
├── package.json            ✅ Updated (monorepo root)
├── vercel.json             ✅ Updated (dual projects)
├── apps/
│   ├── web/                ⏳ In progress
│   │   ├── package.json    ✅ Created
│   │   ├── next.config.js  ✅ Created
│   │   ├── pages/          ⏳ Needs files moved
│   │   ├── components/     ⏳ Needs files moved
│   │   ├── lib/            ⏳ Needs files moved
│   │   ├── styles/         ⏳ Needs files moved
│   │   └── public/         ⏳ Needs files moved
│   └── admin/
│       ├── package.json    ✅ Created
│       ├── next.config.js  ✅ Created
│       ├── pages/          ⏳ Needs files moved
│       ├── components/     ⏳ Needs files moved
│       └── lib/            ⏳ Needs files moved
├── packages/
│   └── shared/
│       ├── package.json    ✅ Created
│       ├── index.js        ✅ Created
│       ├── types/          ⏳ Needs creation
│       ├── lib/            ⏳ Needs shared code
│       └── hooks/          ⏳ Needs shared hooks
└── db/                     ✅ Stays at root
```

## What Needs to Happen Next

### Phase 1: Move Web App Files (This Step)

**Files to move from root → apps/web:**

```bash
# Move these files/folders:
pages/               → apps/web/pages/
components/          → apps/web/components/
lib/                 → apps/web/lib/
styles/              → apps/web/styles/
public/              → apps/web/public/
.eslintrc.json       → apps/web/.eslintrc.json
tsconfig.json        → apps/web/tsconfig.json (if exists)
```

**Files to KEEP at root:**

```
db/                  (shared database migrations)
.git/
.gitignore
vercel.json
turbo.json
package.json
```

**Files to DELETE:**

```
next.config.js       (already copied to apps/web/)
```

### Phase 2: Extract Admin

**Files to move from root → apps/admin:**

```bash
# These will come from:
pages/admin/         → apps/admin/pages/
components/admin/    → apps/admin/components/
```

### Phase 3: Create Shared Package

**Extract shared utilities → packages/shared:**

```bash
lib/supabase.js              → packages/shared/lib/supabase.js
lib/auth.js                  → packages/shared/lib/auth.js
lib/nova-score.js            → packages/shared/lib/nova-score.js
lib/validation.js            → packages/shared/lib/validation.js

hooks/useAuth.js             → packages/shared/hooks/useAuth.js
hooks/usePro.js              → packages/shared/hooks/usePro.js
```

## Manual Migration Steps

Since moving 100+ files automatically is risky, here's the recommended approach:

### Option 1: Using Terminal (Recommended)

```bash
# 1. Navigate to project root
cd "c:\Users\MOSSESMUWA\Desktop\Git Repo\NovaHub"

# 2. Move web app files
mv pages apps/web/
mv components apps/web/
mv lib apps/web/
mv styles apps/web/
mv public apps/web/
mv .eslintrc.json apps/web/ 2>/dev/null || true

# 3. Move admin files
mv apps/web/pages/admin apps/admin/pages/
mv apps/web/components/admin apps/admin/components/

# 4. Create shared lib directory
mkdir -p packages/shared/lib packages/shared/hooks packages/shared/types

# 5. Copy shared utilities (don't move, copy first)
cp apps/web/lib/supabase.js packages/shared/lib/
cp apps/web/lib/auth.js packages/shared/lib/
cp apps/web/lib/nova-score.js packages/shared/lib/
cp apps/web/lib/validation.js packages/shared/lib/

# 6. Copy shared hooks
cp apps/web/hooks/useAuth.js packages/shared/hooks/
cp apps/web/hooks/usePro.js packages/shared/hooks/

# 7. Install monorepo dependencies
npm install
```

### Option 2: Using File Explorer (If Terminal Doesn't Work)

1. Open File Explorer
2. Navigate to `C:\Users\MOSSESMUWA\Desktop\Git Repo\NovaHub`
3. **Move these folders to `apps/web/`:**
   - `pages/`
   - `components/`
   - `lib/`
   - `styles/`
   - `public/`
   - `.eslintrc.json`

4. **Move from `apps/web/` to `apps/admin/`:**
   - `pages/admin/` → `apps/admin/pages/`
   - `components/admin/` → `apps/admin/components/`

5. **Create folders in `packages/shared/`:**
   - `lib/`
   - `hooks/`
   - `types/`

6. **Copy (don't move) to `packages/shared/lib/`:**
   - `supabase.js`
   - `auth.js`
   - `nova-score.js`
   - `validation.js`

7. **Copy (don't move) to `packages/shared/hooks/`:**
   - `useAuth.js`
   - `usePro.js`

## What Comes After Migration

### 1. Update Imports

All imports need to change:

**Before (root-level):**

```javascript
import { getBySlug } from "../lib/items";
import Layout from "../components/Layout";
```

**After (apps/web):**

```javascript
import { getBySlug } from "../lib/items"; // stays same, relative to apps/web
import Layout from "../components/Layout";
```

**Shared imports (from either app):**

```javascript
// Instead of importing from ../lib/nova-score
import { calcNovaScore } from "shared/lib/nova-score";
```

### 2. Environment Variables

Both `apps/web/` and `apps/admin/` need `.env.local` files:

```bash
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
STRIPE_SECRET_KEY=...

# apps/admin/.env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Update Next.js Configs

Both apps already have `next.config.js` — verify they work.

### 4. Testing the Build

```bash
# Build everything (web + admin)
npm run build

# Build only web app
npm run build:web

# Build only admin app
npm run build:admin

# Dev mode
npm run dev          # Runs both in parallel
npm run dev:web      # Web only on :3000
npm run dev:admin    # Admin only on :3001
```

## Deployment Changes

After migration:

**Web app**: Deploys to `nova.com` (novahub-web project)
**Admin app**: Deploys to `admin.nova.com` (novahub-admin project)

Both use the same Supabase backend.

## Potential Issues & Fixes

### Issue: `Module not found: 'shared'`

**Fix**: Ensure `npm install` runs at monorepo root, installing workspace packages

### Issue: Build fails with "can't find next.config.js"

**Fix**: Verify `apps/web/next.config.js` and `apps/admin/next.config.js` exist

### Issue: Port already in use (dev mode)

**Fix**: Admin runs on port 3001, web on 3000 (configured in package.json)

### Issue: Turbo build issues

**Fix**: Run `npm run clean` then `npm install` to reset

## Next Steps After Migration

1. ✅ Move files (this document)
2. ✅ Test `npm run build`
3. ✅ Test `npm run dev`
4. ✅ Update Vercel project settings
5. ✅ Deploy and verify both apps work
6. ✅ Add RBAC to admin (separate phase)
7. ✅ Add audit logging (separate phase)

## Questions?

If build fails after migration:

1. Check that all files moved correctly
2. Verify `npm install` output has no errors
3. Run `npm run clean && npm install` to reset
4. Check `.env.local` files exist in both apps
5. See "Potential Issues" section above
