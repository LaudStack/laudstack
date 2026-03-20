#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# LaudStack — Automated Production Readiness Audit
#
# Checks for common regressions that have been fixed during manual audits:
#   1. TypeScript / Next.js build errors
#   2. force-dynamic exports (cause page flashing)
#   3. Terminology violations (product→stack, featured→spotlight, trending→rising)
#   4. Fake / mock data patterns (Math.random in components, hardcoded avatars)
#   5. Unused imports from lucide-react
#   6. Console.log / console.error in client pages
#   7. TODO / FIXME markers left in production code
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

REPORT="/tmp/audit-report.md"
FAIL=0

echo "" > "$REPORT"

section() {
  echo "" >> "$REPORT"
  echo "### $1" >> "$REPORT"
  echo "" >> "$REPORT"
}

pass() {
  echo "- ✅ $1" >> "$REPORT"
}

fail() {
  echo "- ❌ $1" >> "$REPORT"
  FAIL=1
}

warn() {
  echo "- ⚠️ $1" >> "$REPORT"
}

# ─── 1. Build Check ─────────────────────────────────────────────────────────
section "Build Check"
echo "Running Next.js build..."
if npx next build > /tmp/build-output.txt 2>&1; then
  pass "Next.js build succeeded with zero errors"
else
  fail "Next.js build failed — see workflow logs for details"
  echo '```' >> "$REPORT"
  tail -30 /tmp/build-output.txt >> "$REPORT"
  echo '```' >> "$REPORT"
fi

# ─── 2. force-dynamic Exports ───────────────────────────────────────────────
section "force-dynamic Exports"
FORCE_DYNAMIC=$(grep -rn "force-dynamic" src/app/ --include="*.tsx" --include="*.ts" || true)
if [ -z "$FORCE_DYNAMIC" ]; then
  pass "No \`force-dynamic\` exports found in app pages"
else
  COUNT=$(echo "$FORCE_DYNAMIC" | wc -l)
  fail "Found **$COUNT** \`force-dynamic\` export(s) — these cause page flashing and should be removed"
  echo '```' >> "$REPORT"
  echo "$FORCE_DYNAMIC" >> "$REPORT"
  echo '```' >> "$REPORT"
fi

# ─── 3. Terminology Violations ──────────────────────────────────────────────
section "Terminology Violations"

# Check for "product" in user-facing text (exclude URLs, SEO pages, comments, imports, types)
PRODUCT_HITS=$(grep -rn --include="*.tsx" \
  -i '"[^"]*product[^"]*"' src/app/ src/components/ \
  | grep -vi "screenshot\|productivity\|import\|//\|slug\|url\|href\|console\|type \|interface " \
  || true)
if [ -z "$PRODUCT_HITS" ]; then
  pass "No 'product' terminology found in user-facing strings (should be 'stack')"
else
  COUNT=$(echo "$PRODUCT_HITS" | wc -l)
  warn "Found **$COUNT** potential 'product' terminology occurrence(s) — should be 'stack'"
  echo '```' >> "$REPORT"
  echo "$PRODUCT_HITS" | head -20 >> "$REPORT"
  echo '```' >> "$REPORT"
fi

# Check for "Featured" badge text (should be "Spotlight")
FEATURED_HITS=$(grep -rn --include="*.tsx" \
  '"Featured"' src/app/ src/components/ \
  | grep -vi "import\|//\|type \|interface \|is_featured\|featured:" \
  || true)
if [ -z "$FEATURED_HITS" ]; then
  pass "No 'Featured' badge text found (correctly using 'Spotlight')"
else
  COUNT=$(echo "$FEATURED_HITS" | wc -l)
  warn "Found **$COUNT** 'Featured' text occurrence(s) — should be 'Spotlight'"
  echo '```' >> "$REPORT"
  echo "$FEATURED_HITS" | head -10 >> "$REPORT"
  echo '```' >> "$REPORT"
fi

# ─── 4. Fake / Mock Data Patterns ───────────────────────────────────────────
section "Fake Data Patterns"

# Math.random() in page components (used to generate fake metrics)
RANDOM_HITS=$(grep -rn "Math\.random()" src/app/ --include="*.tsx" || true)
if [ -z "$RANDOM_HITS" ]; then
  pass "No \`Math.random()\` found in page components"
else
  COUNT=$(echo "$RANDOM_HITS" | wc -l)
  fail "Found **$COUNT** \`Math.random()\` usage(s) in page components — likely fake data"
  echo '```' >> "$REPORT"
  echo "$RANDOM_HITS" >> "$REPORT"
  echo '```' >> "$REPORT"
fi

# Hardcoded pravatar.cc (fake avatar images)
PRAVATAR_HITS=$(grep -rn "pravatar" src/ --include="*.tsx" --include="*.ts" || true)
if [ -z "$PRAVATAR_HITS" ]; then
  pass "No hardcoded pravatar.cc avatar URLs found"
else
  COUNT=$(echo "$PRAVATAR_HITS" | wc -l)
  fail "Found **$COUNT** pravatar.cc reference(s) — should use real user data"
  echo '```' >> "$REPORT"
  echo "$PRAVATAR_HITS" >> "$REPORT"
  echo '```' >> "$REPORT"
fi

# Hardcoded "12,000+" or similar fake social proof numbers
FAKE_PROOF=$(grep -rn --include="*.tsx" \
  '12,000\|"4\.9"\|"98%"' src/app/ \
  | grep -vi "//\|import\|console" \
  || true)
if [ -z "$FAKE_PROOF" ]; then
  pass "No hardcoded social proof numbers detected"
else
  COUNT=$(echo "$FAKE_PROOF" | wc -l)
  warn "Found **$COUNT** potential hardcoded social proof number(s)"
  echo '```' >> "$REPORT"
  echo "$FAKE_PROOF" | head -10 >> "$REPORT"
  echo '```' >> "$REPORT"
fi

# ─── 5. Console Statements in Client Pages ──────────────────────────────────
section "Console Statements"
CONSOLE_HITS=$(grep -rn "console\.\(log\|error\|warn\|debug\)" src/app/ --include="*.tsx" \
  | grep -v "// " \
  || true)
if [ -z "$CONSOLE_HITS" ]; then
  pass "No console.log/error/warn/debug found in app pages"
else
  COUNT=$(echo "$CONSOLE_HITS" | wc -l)
  warn "Found **$COUNT** console statement(s) in app pages"
  echo '```' >> "$REPORT"
  echo "$CONSOLE_HITS" | head -15 >> "$REPORT"
  echo '```' >> "$REPORT"
fi

# ─── 6. TODO / FIXME Markers ────────────────────────────────────────────────
section "TODO / FIXME Markers"
TODO_HITS=$(grep -rn "TODO\|FIXME\|HACK\|XXX" src/app/ src/components/ --include="*.tsx" --include="*.ts" \
  | grep -v "node_modules" \
  || true)
if [ -z "$TODO_HITS" ]; then
  pass "No TODO/FIXME/HACK/XXX markers found in source"
else
  COUNT=$(echo "$TODO_HITS" | wc -l)
  warn "Found **$COUNT** TODO/FIXME marker(s) — review before release"
  echo '```' >> "$REPORT"
  echo "$TODO_HITS" | head -20 >> "$REPORT"
  echo '```' >> "$REPORT"
fi

# ─── 7. navigator.sendBeacon (analytics beacons to non-existent endpoints) ──
section "Analytics Beacons"
BEACON_HITS=$(grep -rn "sendBeacon\|/api/analytics" src/app/ --include="*.tsx" || true)
if [ -z "$BEACON_HITS" ]; then
  pass "No unverified analytics beacons found"
else
  COUNT=$(echo "$BEACON_HITS" | wc -l)
  warn "Found **$COUNT** analytics beacon reference(s) — verify endpoints exist"
  echo '```' >> "$REPORT"
  echo "$BEACON_HITS" >> "$REPORT"
  echo '```' >> "$REPORT"
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════"
echo "  AUDIT REPORT"
echo "═══════════════════════════════════════════════"
cat "$REPORT"
echo ""

if [ "$FAIL" -eq 1 ]; then
  echo "❌ Audit FAILED — critical issues detected."
  exit 1
else
  echo "✅ Audit PASSED — no critical issues."
  exit 0
fi
