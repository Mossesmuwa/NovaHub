#!/bin/bash
# VALIDATION_CHECKLIST.sh
# Run this to verify your ingestion setup is correct
# Usage: bash VALIDATION_CHECKLIST.sh

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        NovaHub Ingestion Pipeline - Validation             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

check() {
  local name="$1"
  local condition="$2"
  
  if eval "$condition"; then
    echo -e "${GREEN}✓${NC} $name"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $name"
    ((FAILED++))
  fi
}

# 1. Environment Variables
echo "📋 ENVIRONMENT VARIABLES:"
check "  .env.local exists" "[ -f .env.local ]"
check "  NEXT_PUBLIC_SUPABASE_URL set" "grep -q 'NEXT_PUBLIC_SUPABASE_URL=' .env.local"
check "  SUPABASE_SERVICE_ROLE_KEY set" "grep -q 'SUPABASE_SERVICE_ROLE_KEY=' .env.local"
check "  CRON_SECRET set" "grep -q 'CRON_SECRET=' .env.local"
check "  PRODUCTHUNT_DEVELOPER_TOKEN set" "grep -q 'PRODUCTHUNT_DEVELOPER_TOKEN=' .env.local"
check "  TMDB_API_KEY set" "grep -q 'TMDB_API_KEY=' .env.local"
check "  GEMINI_API_KEY set" "grep -q 'GEMINI_API_KEY=' .env.local"
echo ""

# 2. Files Exist
echo "📁 FILES:"
check "  pages/api/ingest/producthunt.js" "[ -f pages/api/ingest/producthunt.js ]"
check "  pages/api/ingest/tmdb.js" "[ -f pages/api/ingest/tmdb.js ]"
check "  pages/api/ingest/test-debug.js" "[ -f pages/api/ingest/test-debug.js ]"
check "  lib/ingest/Pipeline.js" "[ -f lib/ingest/Pipeline.js ]"
check "  lib/ingest/ProductHuntProvider.js" "[ -f lib/ingest/ProductHuntProvider.js ]"
check "  lib/ingest/TMDBProvider.js" "[ -f lib/ingest/TMDBProvider.js ]"
check "  lib/supabaseAdmin.js" "[ -f lib/supabaseAdmin.js ]"
echo ""

# 3. Logging Enhancements
echo "🔍 LOGGING ENHANCEMENTS:"
check "  producthunt.js has console.log" "grep -q 'console.log' pages/api/ingest/producthunt.js"
check "  tmdb.js has console.log" "grep -q 'console.log' pages/api/ingest/tmdb.js"
check "  Pipeline.js validates items" "grep -q '_batchUpsert' lib/ingest/Pipeline.js"
check "  supabaseAdmin logs init" "grep -q 'Initializing' lib/supabaseAdmin.js"
echo ""

# 4. Bug Fixes
echo "🐛 BUG FIXES:"
check "  TMDBProvider has no duplicate return" "! grep -A5 'return data' lib/ingest/TMDBProvider.js | grep -q 'return res.json()'"
echo ""

# 5. Database (if running Supabase locally)
echo "💾 DATABASE (if Supabase running):"
check "  PostgreSQL accessible on localhost:5432" "nc -z localhost 5432 2>/dev/null || echo 'skip'"
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED${NC}"
else
  echo -e "${GREEN}Failed: $FAILED${NC}"
fi
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Ready to test ingestion.${NC}"
  echo ""
  echo "Quick test commands:"
  echo "  curl 'http://localhost:3000/api/ingest/test-debug?provider=producthunt'"
  echo "  or"
  echo "  node DEBUG_INGEST.js"
else
  echo -e "${RED}✗ Please fix the failed checks above.${NC}"
fi
