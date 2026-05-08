# NovaHub Monorepo

> NovaHub is a real-time AI-powered intelligence platform for discovering, comparing, and tracking technology products.

## 📦 Structure

```
novahub/
├── apps/
│   ├── web/                # User-facing app (nova.com)
│   │   ├── pages/          # Next.js routes
│   │   ├── components/     # React components
│   │   ├── lib/            # Web-specific utilities
│   │   ├── styles/         # CSS/styling
│   │   └── public/         # Static assets
│   └── admin/              # Admin dashboard (admin.nova.com)
│       ├── pages/          # Admin routes
│       ├── components/     # Admin UI
│       └── lib/            # Admin-specific utilities
├── packages/
│   └── shared/             # Shared code (types, utilities, hooks)
│       ├── types/          # TypeScript types
│       ├── lib/            # Shared utilities
│       └── hooks/          # Shared React hooks
├── db/                     # Database migrations & schema
├── turbo.json              # Turbo build config
├── vercel.json             # Vercel deployment config
└── package.json            # Monorepo root config
```

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Development

**Run both apps:**

```bash
npm run dev
# Web: http://localhost:3000
# Admin: http://localhost:3001
```

**Run specific app:**

```bash
npm run dev:web     # Web only
npm run dev:admin   # Admin only
```

### Build

**Build all:**

```bash
npm run build
```

**Build specific app:**

```bash
npm run build:web
npm run build:admin
```

### Other Commands

```bash
npm run lint           # Lint all apps
npm run type-check     # TypeScript check
npm run clean          # Reset node_modules and build cache
```

## 🏗️ Architecture

### Web App (`apps/web`)

- User-facing interface
- Product discovery, browsing, comparing
- User authentication & profiles
- Favorites/lists management
- Public API endpoints

**Deployed to:** `nova.com`

### Admin App (`apps/admin`)

- Content moderation dashboard
- User management
- Analytics & metrics
- System settings
- Audit logging

**Deployed to:** `admin.nova.com`

### Shared Package (`packages/shared`)

- TypeScript type definitions
- Common utilities (auth, validation, etc.)
- Shared React hooks
- Nova Score algorithm
- Database client configuration

## 📚 Shared Utilities

### From `shared/types`

```typescript
import type { User, Item, NovaScore, AuditLog } from "shared/types";
```

### From `shared/lib`

```typescript
import { supabase } from "shared/lib/supabase";
import { calcNovaScore } from "shared/lib/nova-score";
import { validateEmail } from "shared/lib/validation";
```

### From `shared/hooks`

```typescript
import { useAuth } from "shared/hooks";
import { useAdmin } from "shared/hooks";
```

## 🔧 Environment Variables

### Web App (`apps/web/.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENAI_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Admin App (`apps/admin/.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
```

## 📋 Development Workflow

### Adding a Feature to Web App

1. Create branch: `git checkout -b feature/name`
2. Make changes in `apps/web/`
3. Test: `npm run dev:web`
4. Build: `npm run build:web`
5. Push and create PR

### Adding Admin Feature

1. Create branch: `git checkout -b feature/admin-name`
2. Make changes in `apps/admin/`
3. Test: `npm run dev:admin`
4. Build: `npm run build:admin`
5. Push and create PR

### Updating Shared Code

1. Create branch: `git checkout -b refactor/shared-name`
2. Modify `packages/shared/`
3. Test both apps: `npm run dev`
4. Update types in both apps if needed
5. Push and create PR

## 🚢 Deployment

### Vercel Setup

The monorepo deploys as two separate projects:

1. **Web App Project** (`novahub-web`)
   - Root Directory: `apps/web`
   - Domain: `nova.com`

2. **Admin App Project** (`novahub-admin`)
   - Root Directory: `apps/admin`
   - Domain: `admin.nova.com`

Both share the same backend services (Supabase, etc.).

### Deploy Process

```bash
# Push to main branch
git push origin main

# Vercel automatically:
# 1. Detects changes in apps/web/ → deploys nova.com
# 2. Detects changes in apps/admin/ → deploys admin.nova.com
# 3. Runs both build commands in parallel using Turbo
```

## 🔄 Turbo Build Optimization

Uses Turbo for intelligent caching:

- Builds only changed apps
- Caches build artifacts
- Parallelizes builds
- Shares build cache across CI/CD

**View build info:**

```bash
npm run build -- --verbose
```

## 📖 Documentation

- [Monorepo Migration Guide](./MONOREPO_MIGRATION.md)
- [API Documentation](./docs/API.md) _(coming soon)_
- [Architecture Decisions](./docs/ARCHITECTURE.md) _(coming soon)_

## 🤝 Contributing

1. Create a feature branch
2. Make changes in relevant app/package
3. Test all apps: `npm run dev`
4. Lint: `npm run lint`
5. Type check: `npm run type-check`
6. Push and create PR

## 📞 Support

For questions or issues:

1. Check existing issues
2. Create new issue with context
3. Include error logs and environment details

---

**Last Updated:** May 8, 2026
