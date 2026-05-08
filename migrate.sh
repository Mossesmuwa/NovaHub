#!/bin/bash
# migrate.sh — Automate monorepo migration on Unix/Mac
# On Windows PowerShell, use migrate.ps1 instead

set -e  # Exit on error

echo "🚀 NovaHub Monorepo Migration Script"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "pages" ]; then
    echo "❌ Error: Must run from NovaHub root directory"
    exit 1
fi

echo ""
echo "📁 Phase 1: Moving web app files to apps/web/"
mkdir -p apps/web
[ -d "pages" ] && mv pages apps/web/pages && echo "  ✅ Moved pages/"
[ -d "components" ] && mv components apps/web/components && echo "  ✅ Moved components/"
[ -d "lib" ] && mv lib apps/web/lib && echo "  ✅ Moved lib/"
[ -d "styles" ] && mv styles apps/web/styles && echo "  ✅ Moved styles/"
[ -d "public" ] && mv public apps/web/public && echo "  ✅ Moved public/"
[ -f ".eslintrc.json" ] && mv .eslintrc.json apps/web/.eslintrc.json && echo "  ✅ Moved .eslintrc.json"
[ -f "tsconfig.json" ] && mv tsconfig.json apps/web/tsconfig.json && echo "  ✅ Moved tsconfig.json" || true
[ -f "jest.config.js" ] && mv jest.config.js apps/web/jest.config.js && echo "  ✅ Moved jest.config.js" || true

echo ""
echo "📁 Phase 2: Moving admin files"
mkdir -p apps/admin/pages apps/admin/components
[ -d "apps/web/pages/admin" ] && mv apps/web/pages/admin apps/admin/pages/ && echo "  ✅ Moved pages/admin/"
[ -d "apps/web/components/admin" ] && mv apps/web/components/admin apps/admin/components/ && echo "  ✅ Moved components/admin/"

echo ""
echo "📁 Phase 3: Creating shared package structure"
mkdir -p packages/shared/lib packages/shared/hooks packages/shared/types

echo ""
echo "📁 Phase 4: Extracting shared code"
[ -f "apps/web/lib/supabase.js" ] && cp apps/web/lib/supabase.js packages/shared/lib/ && echo "  ✅ Copied supabase.js"
[ -f "apps/web/lib/auth.js" ] && cp apps/web/lib/auth.js packages/shared/lib/ && echo "  ✅ Copied auth.js"
[ -f "apps/web/lib/nova-score.js" ] && cp apps/web/lib/nova-score.js packages/shared/lib/ && echo "  ✅ Copied nova-score.js"
[ -f "apps/web/lib/validation.js" ] && cp apps/web/lib/validation.js packages/shared/lib/ && echo "  ✅ Copied validation.js"

# Copy hooks if they exist
[ -d "apps/web/hooks" ] && cp apps/web/hooks/*.js packages/shared/hooks/ 2>/dev/null && echo "  ✅ Copied shared hooks" || true

echo ""
echo "📁 Phase 5: Creating .env files"
if [ ! -f "apps/web/.env.local" ]; then
    cat > apps/web/.env.local << 'EOF'
# Copy these values from root .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENAI_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
EOF
    echo "  ✅ Created apps/web/.env.local (add your values)"
fi

if [ ! -f "apps/admin/.env.local" ]; then
    cat > apps/admin/.env.local << 'EOF'
# Admin-specific environment
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
EOF
    echo "  ✅ Created apps/admin/.env.local (add your values)"
fi

echo ""
echo "🧹 Cleanup"
rm -f next.config.js && echo "  ✅ Removed old next.config.js from root"

echo ""
echo "📦 Installing dependencies"
npm install

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Add environment variables to apps/web/.env.local and apps/admin/.env.local"
echo "2. Run: npm run build"
echo "3. Run: npm run dev"
echo "4. Test both apps work"
echo ""
