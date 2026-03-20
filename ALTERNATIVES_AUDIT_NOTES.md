# Alternatives System Audit — Findings

## Architecture Overview

The alternatives system has **3 distinct surfaces**:

1. **`/alternatives` page** — Client-side search + browse. Uses `useToolsData()` hook (fetches from `/api/homepage`). Alternatives computed client-side: same category, sorted by `average_rating` desc.

2. **`/alt/[slug]` page** (accessed via `/{slug}-alternatives` URL rewrite) — Server-rendered SEO page. Uses `getAlternativesData()` from `seo.ts`. Alternatives fetched from DB: same category, sorted by `rank_score` desc (default), with sort/pagination support.

3. **Tool detail page `/tools/[slug]`** — Alternatives tab. Uses `useToolsData()` hook. Alternatives computed client-side: same category, sorted by `average_rating` desc then `review_count` desc, limited to 8.

## Issues Found

### A1: Featured tools excluded from all alternatives queries (HIGH)
- **`/api/homepage`** route filters `eq(tools.status, "approved")` — featured tools are excluded from the homepage API response
- **`getAlternativesData()`** in `seo.ts` filters `eq(tools.status, "approved")` for both the main tool lookup AND the alternatives query — featured tools can't be looked up and won't appear as alternatives
- **`getAllAlternativeSlugs()`** in `seo.ts` filters `eq(tools.status, "approved")` — featured tools won't get sitemap entries
- This means: if a tool is promoted to "featured" status, it disappears from ALL alternatives surfaces

### A2: Inconsistent sorting across surfaces (MEDIUM)
- `/alternatives` page sorts by `average_rating` desc only
- `/alt/[slug]` page defaults to `rank_score` desc (with sort options)
- Tool detail page sorts by `average_rating` desc, then `review_count` desc as tiebreaker
- These should ideally use the same default sort for consistency

### A3: No tag-based similarity matching (LOW — enhancement)
- All alternatives are purely category-based (same category = alternative)
- Tools have `tags` field that could improve relevance but is unused
- Not a bug, but a missed opportunity for better matches

### A4: Missing database indexes for alternatives queries (MEDIUM)
- No index on `tools.category` — every alternatives query does a full table scan filtered by category
- No index on `tools.status` — every query filters by status without index support
- No composite index on `(status, is_visible, category)` which is the exact filter pattern used

### A5: Client-side alternatives on /alternatives page don't filter by status/visibility (MEDIUM)
- The `/api/homepage` route correctly filters by `status=approved` and `is_visible=true`
- But if a tool is hidden (`is_visible=false`), it would still appear in client-side alternatives on `/alternatives` page IF it was in the homepage API response (it wouldn't be, so this is actually OK)
- However, the `/alternatives` page doesn't filter out tools that might have `is_visible=false` in the client-side computation — but since the source data already filters, this is fine

### A6: getAlternativesData doesn't check isVisible on the main tool lookup (LOW)
- The main tool lookup in `getAlternativesData()` only checks `status=approved`, not `isVisible=true`
- A hidden tool could still have its alternatives page accessible

### A7: Empty state on tool detail alternatives tab is good (OK)
- Already has proper empty state with "No alternatives listed yet" message and link to browse category

### A8: Comparison links in alt page use hardcoded slug format (OK)
- Links like `/${mainTool.slug}-vs-${alt.slug}` correctly match the middleware rewrite pattern

### A9: Popular stacks on /alternatives page sorted by review_count (OK)
- Reasonable default — most-reviewed tools are likely most popular

### A10: altCount on PopularStackCard computed inline (PERFORMANCE)
- Each card re-filters the entire tools array to count alternatives
- Should be precomputed once

## Fix Plan

1. **A1**: Add `or(eq(tools.status, "approved"), eq(tools.status, "featured"))` to:
   - `/api/homepage` route
   - `getAlternativesData()` — both main tool lookup and alternatives query
   - `getAllAlternativeSlugs()`
   - `getAllCategoriesWithCounts()`
   - `getComparisonData()`
   - `getPopularComparisonPairs()`
   - `getDiscoverySEOData()`
   - `getBestToolsData()`
   - `getAllBestToolsSlugs()`
   - `getCategorySEOData()`

2. **A2**: Standardize default sort to `rank_score` across all surfaces:
   - `/alternatives` page: change from `average_rating` to `rank_score`
   - Tool detail page: change from `average_rating` to `rank_score`

3. **A4**: Add composite index on tools table: `(status, is_visible, category)`

4. **A6**: Add `isVisible=true` check to main tool lookup in `getAlternativesData()`

5. **A10**: Precompute altCount map on `/alternatives` page
