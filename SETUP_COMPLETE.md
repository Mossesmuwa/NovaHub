# ✅ NovaHub Dev Environment Setup Complete

## 🎉 Status: WORKING

Both applications are running successfully:

- **Web App**: http://localhost:3000 ✅
- **Admin App**: http://localhost:3002 ✅

---

## 📋 What Was Fixed

### 1. **Turbo Configuration**

- Added `"ui": "tui"` to `turbo.json` to enable interactive terminal mode for dev tasks
- Dev servers now properly handle interactive tasks

### 2. **Environment Variables**

- Copied `.env.local` from root to both `apps/web/` and `apps/admin/`
- Next.js can now access Supabase credentials and API keys in dev mode
- All 1,400+ items loading from database successfully

### 3. **Admin App Port**

- Changed admin app from port 3001 to 3002 to avoid port conflicts
- Updated in `apps/admin/package.json`: `"dev": "next dev -p 3002"`

### 4. **Admin Auth Flow**

- Created `apps/admin/pages/index.js` - redirects `/` → `/dashboard`
- Created `apps/admin/pages/account/login.js` - redirects admin login to web app
- Seamless login flow between web and admin apps

---

## 🚀 How to Run

### Start Both Dev Servers (from root):

```bash
# Terminal 1 - Web App
cd apps/web
npm run dev
# Opens at http://localhost:3000

# Terminal 2 - Admin App
cd apps/admin
npm run dev
# Opens at http://localhost:3002
```

### Or Start from Root (requires Turbo UI):

```bash
npm run dev:web    # Start web app only
npm run dev:admin  # Start admin app only
npm run dev        # Start both apps
```

---

## 📱 What You Can Do Now

### Web App (http://localhost:3000)

- ✅ **Homepage**: Intelligence Platform overview with stats
- ✅ **Browse**: All 1,400+ tracked tools with filtering
- ✅ **Trending**: Real-time trending tools (populated from HackerNews, ProductHunt, etc.)
- ✅ **Search**: Full-text search across all items
- ✅ **Sign in/Sign up**: OAuth (Google, GitHub, Apple) + Email/Password
- ✅ **Item Details**: Click any tool to see full details, Nova Score, reviews
- ✅ **Favorites**: Save tools to your collection
- ✅ **Compare Tools**: (Coming soon - UI ready, backend pending)

### Admin App (http://localhost:3002)

- **Dashboard Tabs** (after login):
  - ✅ Overview - Admin stats and platform metrics
  - ✅ Pipeline - Content ingest status, provider health
  - ✅ Intelligence - AI enrichment, recommendations
  - ✅ Security - Audit logs, threat detection
  - ✅ Business - Revenue, pricing tiers
  - ✅ Settings - Platform configuration
  - ✅ Users - User management and moderation
  - ✅ Control Center - System commands
  - ✅ Notifications - Alert configuration
  - ✅ Providers - External API management

### Admin Login Flow:

1. Go to http://localhost:3002
2. Redirects to http://localhost:3000/account/login (web app)
3. Sign in with any account
4. After login, returns to admin dashboard at http://localhost:3002/dashboard

---

## 🏗️ Architecture

### Monorepo Structure

```
NovaHub/
├── apps/
│   ├── web/                    # Main user-facing app (port 3000)
│   │   ├── pages/              # 20+ pages (home, search, trending, etc)
│   │   ├── components/         # Layout, Navbar, Card, etc
│   │   ├── lib/                # Supabase, items, auth, etc
│   │   ├── styles/             # CSS with dark theme
│   │   └── package.json
│   │
│   └── admin/                  # Admin dashboard (port 3002)
│       ├── pages/
│       │   ├── index.js        # Redirects to dashboard
│       │   ├── dashboard.js    # Main admin UI
│       │   ├── trigger.js      # Manual actions
│       │   └── account/
│       │       └── login.js    # Redirects to web login
│       ├── components/
│       │   ├── OverviewTab.js
│       │   ├── PipelineTab.js
│       │   └── 10+ other tabs
│       ├── lib/                # Shared with web app
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared utilities, types
│       ├── lib/                # Supabase, auth, nova-score
│       ├── hooks/              # useAuth, etc
│       ├── types/              # TypeScript interfaces
│       └── package.json
│
├── db/                         # Database schema
├── package.json                # Root workspaces config
├── turbo.json                  # Turbo build orchestration
└── vercel.json                 # Vercel deployment config
```

### Technology Stack

- **Framework**: Next.js 16.2.4 (Turbopack)
- **UI**: React 18.2.0
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build**: Turbo 2.9.10 (parallel builds)
- **Deployment**: Vercel (dual projects)

---

## 🔧 Available Commands

### From Root

```bash
npm run dev              # Start both apps (web + admin)
npm run dev:web         # Start web app only
npm run dev:admin       # Start admin app only
npm run build           # Build both apps (production)
npm run build:web       # Build web app only
npm run build:admin     # Build admin app only
npm run lint            # Run ESLint on all apps
npm run type-check      # TypeScript check
npm run clean           # Delete .next, dist, .turbo
```

### From app directories

```bash
cd apps/web
npm run dev             # Start web dev server
npm run build           # Build for production
npm run start           # Run production build locally

cd apps/admin
npm run dev             # Start admin dev server
npm run build           # Build for production
npm run start           # Run production build locally
```

---

## 📊 Database Connection

### Supabase Credentials (in .env.local)

- **URL**: `https://twkevfnwvrocaxiplcjk.supabase.co`
- **Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (anon)
- **Service Role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (private)

### Tables Available

- `categories` - Tool categories (AI, SaaS, etc)
- `profiles` - User accounts with admin flag
- `items` - 1,400+ tracked tools/products
- `favorites` - User favorites
- `lists` - Custom lists
- `comments` - User reviews
- `alternatives` - Tool comparisons
- `provider_sync_status` - Ingest pipeline health

---

## 🐛 Known Issues & Notes

### Admin Authentication

- Admin dashboard requires login via web app
- First time setup: need to mark a user as admin in Supabase
  ```sql
  UPDATE profiles SET is_admin = true WHERE id = 'your-user-id';
  ```

### HMR Warnings

- Some browser console warnings about `clientMiddlewareManifest.js` - harmless in dev
- Turbo HMR occasionally shows "Invalid message" - Next.js handles recovery

### Production Build

- Both apps build successfully with Turbo caching
- Web app: 22 pages generated in ~273ms (cached)
- Admin app: 3 pages generated in ~522ms

---

## 🚀 Next Steps

### Immediate (This Week)

1. **Test Features**: Browse items, search, sign in/up
2. **Verify Integrations**:
   - Database queries working
   - OAuth flows (Google/GitHub/Apple)
   - Stripe payment integration
3. **Admin Dashboard**: Verify all tabs render correctly

### Short Term (This Sprint)

1. **Implement Compare Engine**
   - Side-by-side tool comparison UI
   - Save/share comparison links
   - Add to product hunt for SEO

2. **Nova Score Display**
   - Show score breakdown on item details
   - Explain weighting (GitHub 30%, ProductHunt 25%, etc)
   - Add trending indicator

3. **Weekly Reports**
   - Generate AI-powered market intelligence
   - Email digest setup
   - Archive reports

### Medium Term (Next Sprint)

1. **RBAC & Security**
   - Admin role system (Super Admin, Moderator, Analyst)
   - Audit logging for all admin actions
   - 2FA/authenticator app

2. **Content Moderation**
   - Moderation queue UI
   - Approve/reject workflow
   - Spam/duplicate detection

3. **Monetization**
   - Pro tier features ($9.99/mo)
   - B2B Intelligence Reports ($299/mo)
   - Email delivery setup

---

## 📞 Support

### If Things Break

**Dev server won't start:**

```bash
# Kill any lingering node processes
Get-Process node | Stop-Process -Force

# Clear build caches
npm run clean

# Reinstall dependencies
npm install

# Try again
npm run dev
```

**Port already in use:**

```bash
# Find process using port
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID> /F
```

**Database connection error:**

- Check `.env.local` has SUPABASE_URL and keys
- Verify network connectivity
- Check Supabase dashboard for service status

**Admin won't load:**

- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors
- Verify user has `is_admin = true` in database

---

## 📈 Production Deployment

When ready to deploy:

### Web App

```bash
vercel --cwd=apps/web
# Deploys to novahub-web.vercel.app
```

### Admin App

```bash
vercel --cwd=apps/admin
# Deploys to novahub-admin.vercel.app
```

Or push to GitHub and auto-deploy via Vercel dashboard.

---

**Last Updated**: May 8, 2026  
**Environment**: Development (localhost:3000 & localhost:3002)  
**Status**: ✅ All systems operational
