# Save Stack Feature — Audit Notes

## Architecture Overview

**Two parallel save systems exist:**
1. `src/app/actions/public.ts` — `toggleSaveTool()` + `getUserSavedToolIds()` + `getUserSavedTools()` (used by useSavedTools hook and ToolCard)
2. `src/app/actions/user.ts` — `toggleSaveTool()` + `getUserSavedTools()` (dead code — never imported by any component)

**Hook:** `src/hooks/useSavedTools.ts` — imports from `public.ts`, manages optimistic state, localStorage fallback for unauthenticated users.

**ToolCard has its own local `useSave` hook** that imports `toggleSaveTool` from `public.ts` directly, maintaining its own local `saved` state independent of the global `useSavedTools` hook.

---

## Issues Found

### F1: CRITICAL — No unique constraint on saved_tools (tool_id, user_id)
- The `saved_tools` table has no UNIQUE constraint on `(tool_id, user_id)`.
- Race conditions (double-click, concurrent requests) can create duplicate rows.
- The `toggleSaveTool` action does a SELECT-then-INSERT without a transaction — classic TOCTOU bug.
- **Fix:** Add UNIQUE constraint via migration. Use INSERT ON CONFLICT for idempotent saves.

### F2: HIGH — Duplicate toggleSaveTool in user.ts (dead code)
- `src/app/actions/user.ts` exports `toggleSaveTool` and `getUserSavedTools` but they are never imported anywhere.
- This is confusing and a maintenance hazard — someone might import the wrong one.
- **Fix:** Remove the dead code from user.ts.

### F3: HIGH — ToolCard useSave hook is disconnected from global useSavedTools
- `ToolCard.tsx` has its own `useSave` hook with local `saved` state initialized from `initialSaved` prop.
- `initialSaved` is **never passed** by any caller (always defaults to `false`).
- This means: every ToolCard always starts as "unsaved" even if the user has saved that tool.
- After toggling save in ToolCard, the global `useSavedTools` state (used by Navbar count, Dashboard, Saved page) is NOT updated.
- After toggling save on the tool detail page (which uses `useSavedTools`), the ToolCard on other pages is NOT updated.
- **Fix:** Replace ToolCard's local `useSave` hook with the global `useSavedTools` hook.

### F4: HIGH — No tool existence/visibility validation on save
- `toggleSaveTool` in public.ts does not verify the tool exists or is visible/approved.
- A user could save a hidden, pending, or non-existent tool ID.
- **Fix:** Add tool existence check before inserting.

### F5: MEDIUM — saveCount on tools table not updated on save/unsave
- The `tools` table has a `save_count` column used by the ranking algorithm.
- `toggleSaveTool` does NOT update this counter — it only changes the `saved_tools` junction table.
- The counter is only updated during the admin ranking recalculation cron.
- This means `save_count` can be stale between recalculations.
- **Fix:** Increment/decrement `save_count` atomically in `toggleSaveTool`, or call `recalculateToolRanking` after toggle.

### F6: MEDIUM — Mobile save button missing on ToolCard
- StandardCard shows the save (bookmark) button only inside `hidden sm:flex` — it's hidden on mobile.
- Mobile users can only save from the tool detail page, not from browse/search/homepage.
- **Fix:** Add a mobile-visible save button (or make the existing one responsive).

### F7: MEDIUM — Dashboard SavedTab uses wrong field names
- `SavedTab` filters `allTools` (frontend `Tool` type with snake_case) by `savedIds.includes(t.id)`.
- But then accesses `tool.logo_url` which is correct for the frontend type.
- However, `tool.average_rating` is accessed as `(tool.average_rating || 0).toFixed(1)` — this works.
- The `toggle(tool.id)` call passes a string ID — the hook expects string. OK.
- **Status:** Actually correct for the frontend type. No fix needed.

### F8: LOW — Saved page "Clear All" only clears local state, not DB
- `clear()` in useSavedTools sets `savedIds` to `[]` and clears localStorage.
- But for authenticated users, it does NOT delete the saved_tools rows from the database.
- Next page load will re-fetch all saved tools from DB, making the "clear" appear to undo itself.
- **Fix:** Add a `clearAllSavedTools` server action and call it from the hook's `clear()`.

### F9: LOW — No loading state on Saved page
- The saved page doesn't show a loading skeleton while `useSavedTools` is fetching from DB.
- It immediately renders the empty state, then flashes to the populated state.
- **Fix:** Check `loading` from useSavedTools and show skeleton.

### F10: LOW — localStorage fallback for unauthenticated users is misleading
- Unauthenticated users can "save" tools to localStorage, but these saves are never synced to DB after login.
- The saved page shows tools from localStorage that won't persist across devices.
- **Fix:** Either sync localStorage saves to DB on login, or don't allow saving for unauthenticated users (just show auth gate).

### F11: LOW — FeaturedCard and CompactCard have no save button
- FeaturedCard (used on homepage trending/featured sections) has no save button at all.
- CompactCard (used in leaderboards/sidebars) has no save button.
- This is a design choice, not necessarily a bug, but worth noting.

### F12: INFO — No input validation on toolId
- `toggleSaveTool` accepts a raw `number` with no validation (NaN, negative, zero).
- **Fix:** Add basic validation.

## Priority Order
1. F1 — Unique constraint + idempotent save (data integrity)
2. F3 — ToolCard state sync with global hook (stale UI)
3. F4 — Tool existence validation (security)
4. F5 — saveCount update (ranking accuracy)
5. F2 — Remove dead code (maintenance)
6. F6 — Mobile save button (UX)
7. F8 — Clear all DB deletion (correctness)
8. F9 — Loading state on saved page (UX)
9. F10 — Auth gate for unauthenticated saves (UX)
10. F12 — Input validation (defense)
