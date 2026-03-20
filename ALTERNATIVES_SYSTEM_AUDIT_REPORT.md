# Alternatives Sorting System — Audit Report

**Project:** LaudStack  
**Date:** March 15, 2026  
**Commit:** `4e553a2`  
**Deployment:** Production (Vercel) — Success

---

## Executive Summary

This audit examined the full alternatives sorting system across the LaudStack platform — from database schema and server-side queries through API routes and every frontend page that displays alternatives. The investigation covered **11 server-side files** and **4 client-side surfaces** where alternatives or related tool listings are rendered.

Five actionable issues were identified and resolved. The most critical finding was that **featured tools were excluded from all public-facing queries** across the entire platform, meaning any tool promoted to "featured" status would silently vanish from alternatives, category pages, search results, leaderboards, the sitemap, and the homepage. This was a systemic issue affecting 11 separate files.

---

## Scope of Investigation

The audit examined every code path that contributes to the alternatives system, including surfaces that feed into alternatives indirectly (e.g., the homepage API that populates the tool cache used by the `/alternatives` page).

| Surface | File(s) | Role |
|---------|---------|------|
| `/alternatives` page | `src/app/alternatives/page.tsx` | Interactive search + popular stacks grid |
| `/alt/[slug]` SEO pages | `src/app/alt/[slug]/page.tsx`, `client.tsx` | Per-tool alternatives with sort/pagination |
| Tool detail "Alternatives" tab | `src/app/tools/[slug]/page.tsx` | Same-category tools on detail page |
| SEO page infrastructure | `src/components/SEOPageClient.tsx`, `SEOPageShell.tsx` | Shared sort/pagination shell |
| Server actions (SEO) | `src/app/actions/seo.ts` | `getAlternativesData`, `getAllAlternativeSlugs`, `getCategorySEOData`, `getBestToolsData`, `getAllCategoriesWithCounts`, `getComparisonData`, `getPopularComparisonPairs`, `getDiscoverySEOData` |
| Server actions (public) | `src/app/actions/public.ts` | `getHomepageData`, `getToolsListing`, `getToolDetail`, `searchToolsAction`, `getTrendingToolsAction`, `getCategoriesWithCounts`, `getLeaderboard`, `getPlatformStats` |
| API routes | `api/homepage`, `api/featured-tools`, `api/launches/upcoming` | Data endpoints |
| Supporting files | `api/admin/recalculate-rankings`, `sitemap.xml`, `comments.ts` | Ranking, sitemap, comment tool validation |

---

## Issues Found and Resolved

### A1 (CRITICAL): Featured tools excluded from all public-facing queries

Every query in the system filtered by `eq(tools.status, "approved")`, which excluded tools with `status = "featured"`. Since the schema defines a separate `isFeatured` boolean flag, the `"featured"` status value represents a distinct promotion tier. Any tool moved to this status would disappear from all alternatives, category pages, search results, leaderboards, the homepage, and the sitemap.

**Fix applied across 11 files:**

In `seo.ts`, a reusable helper was introduced:

```typescript
function visibleToolConditions() {
  return [
    inArray(tools.status, ["approved", "featured"]),
    eq(tools.isVisible, true),
  ];
}
```

All 8 functions in `seo.ts` were updated to use this helper. In `public.ts`, a `VISIBLE_STATUSES` constant was introduced and applied to all 9 query functions. The remaining 5 files (`homepage/route.ts`, `featured-tools/route.ts`, `launches/upcoming/route.ts`, `recalculate-rankings/route.ts`, `sitemap.xml/route.ts`, `comments.ts`) were each updated individually with `inArray(tools.status, ["approved", "featured"])`.

### A2 (MEDIUM): Inconsistent default sorting across alternatives surfaces

Different alternatives surfaces used different default sort orders, creating an inconsistent user experience where the same tool would appear at different positions depending on which page the user was viewing.

| Surface | Before | After |
|---------|--------|-------|
| `/alternatives` page (inline alternatives) | `average_rating` | `rank_score` |
| Tool detail "Alternatives" tab | `average_rating + review_count` | `rank_score` |
| `/alt/[slug]` SEO pages | `rank_score` | `rank_score` (unchanged) |
| SEOPageShell default | `rank_score` | `rank_score` (unchanged) |

The `rank_score` field is the composite ranking signal that incorporates rating, review count, engagement, and recency — making it the most intentional and stable sort order for alternatives.

### A4 (MEDIUM): Missing database indexes for alternatives queries

Every alternatives query filters on `(status, is_visible, category)` and orders by `rank_score`, but no indexes existed on these columns. This means every query performed a full table scan.

**Three indexes added:**

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_tools_status_visible_category` | `(status, is_visible, category)` | Covers the exact WHERE pattern used by all alternatives queries |
| `idx_tools_rank_score` | `(rank_score DESC)` | Covers the ORDER BY used in most listing queries |
| `idx_tools_category` | `(category)` | Covers GROUP BY in category count queries |

### A6 (LOW): `getAlternativesData` did not check `isVisible` on main tool lookup

The function that fetches alternatives data for a specific tool only checked `status = "approved"` on the main tool lookup, but did not verify `isVisible = true`. This meant a hidden tool could still have its alternatives page rendered.

**Fix:** Added `...visibleToolConditions()` to the main tool lookup query, which includes both the status check and the `isVisible` check.

### A10 (PERF): Inline `altCount` computation in PopularStackCard

On the `/alternatives` page, each `PopularStackCard` received its `altCount` prop via an inline `.filter()` call that scanned the entire tools array per card. With 12 cards rendered, this performed 12 full array scans on every render.

**Fix:** Precomputed `categoryCounts` via `useMemo`, then created an `altCountForTool` helper function that performs a single map lookup per card instead of a full array scan.

---

## Items Verified as Correct (No Changes Needed)

The following aspects of the alternatives system were audited and found to be working correctly:

- **Category-based matching logic** — Alternatives are correctly identified as tools in the same category, excluding the current tool. This is the intended behavior per the schema design (no explicit `alternatives` relationship table exists; category is the similarity signal).

- **Sort options in SEOPageShell** — The `DEFAULT_SORT_OPTIONS` array provides five consistent options (`rank_score`, `top_rated`, `trending`, `newest`, `most_lauded`) across all SEO pages.

- **Pagination** — Both `SEOPageClient` and `getAlternativesData` correctly implement offset-based pagination with configurable page sizes.

- **Empty state handling** — Both the `/alternatives` page and `SEOPageShell` display appropriate empty state messages when no tools are found.

- **URL rewriting** — The middleware correctly rewrites `/{slug}-alternatives` to `/alt/{slug}` for clean SEO URLs.

- **Sitemap generation** — `getAllAlternativeSlugs` correctly filters to only generate alternatives pages for tools with at least 2 alternatives in the same category.

- **Frontend adapter** — `dbToolToFrontend` correctly maps `rankScore` to `rank_score` in the frontend `Tool` type.

- **Admin queries** — The `admin.ts` file correctly uses `eq(tools.status, "approved")` for admin-specific counts (these should not include featured tools in admin dashboard metrics).

---

## Verification

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | 0 errors |
| Next.js build (`next build`) | All pages compiled successfully |
| Database indexes | 3 indexes created successfully on Supabase |
| Git commit | `4e553a2` pushed to `main` |
| Vercel deployment | Production — **Success** |

---

## Files Modified

| File | Changes |
|------|---------|
| `src/app/actions/seo.ts` | `visibleToolConditions()` helper; 8 functions updated (A1, A6) |
| `src/app/actions/public.ts` | `VISIBLE_STATUSES` constant; 9 functions updated (A1) |
| `src/app/api/homepage/route.ts` | `inArray` status filter (A1) |
| `src/app/api/featured-tools/route.ts` | `inArray` status filter (A1) |
| `src/app/api/launches/upcoming/route.ts` | `inArray` status filter (A1) |
| `src/app/api/admin/recalculate-rankings/route.ts` | `inArray` status filter (A1) |
| `src/app/sitemap.xml/route.ts` | `inArray` status filter (A1) |
| `src/app/actions/comments.ts` | `inArray` status filter (A1) |
| `src/app/alternatives/page.tsx` | `rank_score` sort (A2), precomputed `altCountForTool` (A10) |
| `src/app/tools/[slug]/page.tsx` | `rank_score` sort (A2) |
| `scripts/add-tools-alt-idx.mjs` | New migration script (A4) |
