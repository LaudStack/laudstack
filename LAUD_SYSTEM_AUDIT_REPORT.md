# LaudStack — Lauding System Audit Report

**Date:** March 15, 2026  
**Author:** Manus AI  
**Commit:** `768a1b0` — pushed to `main` and deployed to Vercel (Production)

---

## Executive Summary

A comprehensive audit of the LaudStack "Lauding" system was performed across the full stack — server actions, database layer, client hooks, and every page that renders laud buttons or counts. The audit identified **10 distinct issues** spanning duplicate/dead code, missing auth gates, stale UI state, broken imports, and incomplete query filters. All 10 issues have been resolved, verified with a clean TypeScript build and successful Next.js production build, and deployed to Vercel.

---

## Issues Identified and Resolved

| ID | Layer | Severity | Summary |
|----|-------|----------|---------|
| F1 | Server | High | `toggleLaud` rejected lauds on "featured" tools — only "approved" status was accepted |
| F2 | Client | Medium | Tool detail page never initialized `laudCount` for tools with 0 lauds |
| F3 | Client | High | `ToolCard` used local `initialUpvoted` prop that no page ever passed — lauds always appeared un-lauded |
| F4 | Client | Medium | Launches page showed error toast instead of auth gate modal for unauthenticated users |
| F5 | Client | Medium | Tools browse page showed error toast instead of auth gate modal for unauthenticated users |
| F6 | Client | Low | Launches page lacked optimistic count updates — UI felt unresponsive |
| F7 | Server | Low | Dead code in `user.ts` — `toggleUpvote`, `getUserUpvotes`, duplicate `toggleSaveTool` |
| F8 | Database | Medium | Missing indexes on `laud_rate_limits` and `upvotes` tables |
| F9 | Server | Medium | `getMostLaudedStacks` and `getRecentlyLaudedStacks` excluded "featured" tools from results |
| F10 | Client | Critical | Launches and tools pages imported deleted `getUserUpvotes` from `user.ts` — runtime crash |

---

## Detailed Fixes

### F1 — Featured Tools Cannot Be Lauded (Server)

The `toggleLaud` server action in `laud.ts` contained a guard clause that only allowed lauding tools with `status === 'approved'`. Tools promoted to "featured" status were silently rejected. The fix expands the guard to accept both `'approved'` and `'featured'` statuses, ensuring all publicly visible tools can receive lauds.

### F2 — Zero-Laud Tools Never Initialize Count (Client)

In the tool detail page (`tools/[slug]/page.tsx`), the `laudCount` state was initialized inside a `useEffect` that only fired when `toolUpvoteCount > 0`. Tools with zero lauds never triggered the effect, leaving the count uninitialized. The fix removes the `> 0` condition so that `laudCount` is always set from the server value, including zero.

### F3 — Global Laud State Hook (`useLaudedTools`)

The `ToolCard` component previously accepted an `initialUpvoted` prop to determine whether the current user had lauded a tool. However, no page ever passed this prop, so every card always rendered as "not lauded" regardless of the user's actual state.

The fix introduces a new `useLaudedTools` global hook (modeled after the existing `useSavedTools` hook) that fetches the user's lauded tool IDs once on mount and provides `isLauded(id)` and `toggle(id)` functions. The `ToolCard` component now consumes this hook directly, eliminating the need for parent pages to pass laud state down. The tool detail page, launches page, and tools browse page all now use this same hook for consistent laud state across the platform.

### F4 & F5 — Auth Gate Modals on Launches and Tools Pages

Both the launches page and tools browse page previously caught auth errors from the `toggleUpvote` action and displayed a generic error toast ("Please sign in to laud"). The fix replaces this with the `AuthGateModal` component — the same modal used on the tool detail page — providing a consistent, user-friendly sign-in prompt with a clear call to action.

### F6 — Optimistic Count Updates on Launches Page

The launches page previously waited for the server response before updating laud counts in the `TopThreeCard` and `LeaderboardRow` components. The fix introduces a `laudCountOverrides` state map that immediately adjusts displayed counts on click, then reconciles with the server response. If the server returns a definitive `newCount`, the override is cleared; if the toggle fails, the override is reverted.

### F7 — Dead Code Removal from `user.ts`

Three functions were removed from `user.ts`:
- `toggleUpvote` — superseded by `toggleLaud` in `laud.ts`
- `getUserUpvotes` — superseded by `getUserLaudedToolIds` in `laud.ts`
- A duplicate `toggleSaveTool` definition that shadowed the canonical one

### F8 — Database Indexes

A migration script (`scripts/add-laud-rate-idx.mjs`) was created and executed to add indexes on the `laud_rate_limits` table (`user_id`, `tool_id`) and the `upvotes` table (`user_id`, `tool_id`). These indexes improve query performance for the laud toggle and laud-state-check operations.

### F9 — Featured Tools in Leaderboard Queries

The `getMostLaudedStacks` and `getRecentlyLaudedStacks` functions in `public.ts` filtered results to only include tools with `status = 'approved'`. Featured tools — which are the most prominent tools on the platform — were excluded from "Most Lauded" and "Recently Lauded" sections. The fix expands the filter to include both `'approved'` and `'featured'` statuses.

### F10 — Broken Imports After Dead Code Removal

Both the launches page and tools browse page used a dynamic `import('@/app/actions/user')` to access `getUserUpvotes`, which was removed in F7. This would have caused a runtime crash. The fix replaces these imports with the `useLaudedTools` global hook, which provides the same functionality through a cleaner interface.

---

## Files Changed

| File | Change Type |
|------|-------------|
| `src/app/actions/laud.ts` | Modified — F1: accept featured tools |
| `src/app/actions/public.ts` | Modified — F9: include featured tools in leaderboard queries |
| `src/app/actions/user.ts` | Modified — F7: remove dead code |
| `src/hooks/useLaudedTools.ts` | **Created** — F3: global laud state hook |
| `src/components/ToolCard.tsx` | Modified — F3: use global hook instead of local prop |
| `src/app/tools/[slug]/page.tsx` | Modified — F2: fix laudCount init; F3: use global hook |
| `src/app/launches/page.tsx` | Modified — F4, F6, F10: auth gate, optimistic counts, fix imports |
| `src/app/tools/page.tsx` | Modified — F5, F10: auth gate, fix imports |
| `scripts/add-laud-rate-idx.mjs` | **Created** — F8: database index migration |

---

## Verification

- TypeScript check (`tsc --noEmit`): **0 errors**
- Next.js production build (`next build`): **All pages compiled successfully**
- Commit `768a1b0` pushed to `main` on GitHub
- Vercel deployment: **Success** (Production, confirmed via GitHub Deployments API)

---

## Remaining Recommendations

1. **Rate limiting enforcement**: The `laud_rate_limits` table exists but the current `toggleLaud` action does not enforce per-user rate limits beyond the natural toggle behavior. Consider adding a cooldown (e.g., max 10 lauds per minute per user) if abuse is observed.

2. **Laud count cache**: For high-traffic pages, consider caching laud counts in a Redis layer or using ISR (Incremental Static Regeneration) to reduce database load on the `upvotes` table.

3. **E2E testing**: The audit was verified through TypeScript compilation and build success. Adding Playwright or Cypress tests for the laud toggle flow (authenticated laud, unauthenticated auth gate, optimistic update, error rollback) would provide ongoing regression protection.
