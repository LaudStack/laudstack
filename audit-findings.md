# LaudStack Stacks-Focused Audit Findings

## Phase 1: Public Pages — Console Errors
All pages tested with ZERO console errors on live site (laudstack.com):
- Homepage, Launches, LaunchPad, Deals, Marketplace, Templates, Top Rated, Trending
- Tool Detail (ChatGPT), Categories, Community Voting, User Dashboard, Founder Dashboard, Claim

## Phase 2: Codebase Issues Found

### Critical Issues
1. **Broken link: /founder/dashboard → 404** — Two references point to `/founder/dashboard` (admin.ts:1042, email.ts:1572) but the actual route is `/dashboard/founder`. Must fix both.

### Moderate Issues
2. **ops-console/templates uses MOCK_TEMPLATES** — Admin email templates page uses hardcoded mock data instead of DB. This is admin-only so lower priority.
3. **ops-console/settings has placeholder Google Analytics ID** — `G-XXXXXXXXXX` as defaultValue. Should be empty or removed.
4. **templates/page.tsx uses MOCK_REVIEWS** — Template reviews are hardcoded. This is acceptable for a marketplace feature that's pre-launch.
5. **admin.ts:808 Stripe placeholder** — Revenue stats return zeros with "Placeholder until Stripe is integrated" comment. Acceptable since Stripe isn't set up.

### Low Priority / Acceptable
6. **Hardcoded marketing numbers (12,000+, 95+)** — Used across many pages. These are aspirational marketing copy, common for new platforms.
7. **Comments system DELETED_PLACEHOLDER** — This is proper soft-delete handling, not a bug.
8. **LaunchPad "mock" comments** — These are UI mockup descriptions in comments, not actual mock data.


---

# Admin Panel Full Cleanup Audit (March 18, 2026)

## 1. ORPHANED PAGES (4 files)
Promotion subpages exist as files but are NOT linked in the sidebar.
Replaced by tabs in the main Promotions page but files never deleted.

- `src/app/ops-console/promotions/all/page.tsx`
- `src/app/ops-console/promotions/stacks/page.tsx`
- `src/app/ops-console/promotions/deals/page.tsx`
- `src/app/ops-console/promotions/marketplace/page.tsx`

**Action:** Delete all 4 files.

## 2. DUPLICATE requireAdmin() FUNCTION (7 copies)
Same auth helper copy-pasted across 7 files with slight variations:
- admin.ts, admin-comments.ts, admin-creators.ts, promotions.ts (Full Supabase auth)
- laud.ts, marketplace.ts (Uses requireAuth() wrapper)
- admin-system.ts (Uses requireStaff() + ROLE_HIERARCHY — most complete)

**Action:** Create shared `src/lib/admin-auth.ts`, replace all 7 copies.

## 3. DEAD SERVER ACTION FUNCTIONS (7 functions in admin.ts)
- getAdminTools, getAdminSubmissions, getAdminClaims, getGrowthData
- createAdminUser, adminGetScreenshots, reviewPromotionRequest

**Action:** Remove all 7 dead functions.

## 4. ROLE INCONSISTENCY (Critical)
New roles (manager, customer_rep) only recognized in admin-system.ts.
These files still only check admin/super_admin:
- verify-admin API route, layout.tsx, admin.ts, admin-comments.ts, admin-creators.ts, promotions.ts, laud.ts, marketplace.ts

**Action:** Update all to accept staff roles.

## 5. LARGE FILE (admin.ts = 2069 lines)
65 exported functions. Note for future refactoring.

## 6-10. CLEAN
No backup files, no console.log in pages, no TODO/FIXME, all components used, shared constants correct.
