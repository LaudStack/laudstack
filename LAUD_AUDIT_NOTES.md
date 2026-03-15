# Laud System Audit — Findings

## Architecture Overview

- **Schema**: `upvotes` table with unique index on `(tool_id, user_id)`. `laud_rate_limits` table for rate limiting. `tools.upvoteCount` denormalized counter.
- **Server actions**: `src/app/actions/laud.ts` — `toggleLaud`, `getUserLaudedToolIds`, `getUserLaudedTools`, `getFounderLauds`, `getAdminLaudActivity`, `adminRemoveLauds`, `getAdminLaudStats`, `getAdminSuspiciousLauds`, `getMostLaudedStacks`, `getRecentlyLaudedStacks`
- **Wrappers**: `public.ts:toggleUpvote` and `user.ts:toggleUpvote` both delegate to `toggleLaud`
- **UI**: ToolCard has `useUpvote` hook with auth gate + optimistic update. Tool detail page has its own inline laud handler. Launches, community-picks, community-voting pages each have their own inline laud handlers.

## Issues Found

### F1: toggleLaud only allows `status = "approved"` — excludes `"featured"` tools
- **Severity**: HIGH
- **Location**: `laud.ts:138` — `eq(tools.status, "approved")`
- **Impact**: Featured tools cannot be lauded. Users see "Stack not found" error.
- **Fix**: Use `inArray(tools.status, ["approved", "featured"])` like the save audit did.

### F2: Tool detail page laudCount initialization bug — tools with 0 lauds never initialize
- **Severity**: MEDIUM
- **Location**: `tools/[slug]/page.tsx:374` — `if (!laudCountInitialized && toolUpvoteCount > 0)`
- **Impact**: If a tool has 0 lauds and a user lauds it, the count goes from 0→1 correctly via optimistic update. But if the user navigates away and back, the count stays at 0 because `laudCountInitialized` is never set to true (the condition requires `> 0`). The handleUpvote then shows 0+1=1 which is correct, but the initialization logic is fragile.
- **Fix**: Change condition to `if (!laudCountInitialized && toolUpvoteCount >= 0 && tool)` — always initialize once tool data is available.

### F3: ToolCard `initialUpvoted` is never passed — all cards start as "not lauded"
- **Severity**: HIGH
- **Location**: `ToolCard.tsx:259` — `useState(initialUpvoted)` where `initialUpvoted` defaults to `false`
- **Impact**: On homepage, search, saved page — all ToolCards show the laud button as inactive even if the user has lauded those tools. The ToolCard doesn't fetch laud state from the DB on its own.
- **Fix**: Add a `useEffect` in `useUpvote` that fetches the user's lauded tool IDs and syncs the local state. Use a shared cache/context to avoid N+1 calls.

### F4: Launches page has no auth gate on laud button
- **Severity**: MEDIUM
- **Location**: `launches/page.tsx:541` — `handleLaud` calls `toggleUpvote` directly without checking `isAuthenticated`
- **Impact**: Unauthenticated users click the laud button, get a server error toast "Please sign in to laud" instead of seeing the AuthGateModal. Poor UX.
- **Fix**: Add `useAuth()` import and auth check with `setShowAuthModal(true)` before calling `toggleUpvote`.

### F5: Tools browse page has no auth gate on laud button
- **Severity**: MEDIUM
- **Location**: `tools/page.tsx:565` — same issue as F4
- **Impact**: Same as F4 — server error toast instead of AuthGateModal.
- **Fix**: Same as F4.

### F6: Launches page laud button shows static `tool.upvote_count` — no optimistic update
- **Severity**: MEDIUM
- **Location**: `launches/page.tsx:315,397` — `{tool.upvote_count}` and `{tool.upvote_count.toLocaleString()}`
- **Impact**: When a user lauds on the launches page, the button toggles active/inactive state but the count doesn't change visually until page refresh. The `invalidateToolsCache()` call may eventually update it but there's a visible lag.
- **Fix**: Add a `laudCountOffsets` state (like community-voting does) and display `tool.upvote_count + offset`.

### F7: Dead code — `user.ts:toggleUpvote` and `user.ts:getUserUpvotes` are never imported
- **Severity**: LOW
- **Location**: `user.ts:88-98`
- **Impact**: Dead code. Only `public.ts:toggleUpvote` is imported by launches and tools pages.
- **Fix**: Remove dead code.

### F8: `laud_rate_limits` table has no index on `(userId, createdAt)`
- **Severity**: LOW
- **Location**: `schema.ts` — `laudRateLimits` table definition
- **Impact**: Rate limit checks do full table scans on `userId` + `createdAt` range. Performance degrades as the table grows.
- **Fix**: Add composite index on `(userId, createdAt)`.

### F9: `getMostLaudedStacks` and `getRecentlyLaudedStacks` only include `status = "approved"` — excludes featured
- **Severity**: LOW
- **Location**: `laud.ts:593,600`
- **Impact**: Featured tools with lauds don't appear in the most-lauded or recently-lauded lists.
- **Fix**: Use `inArray(tools.status, ["approved", "featured"])`.

### F10: No transaction wrapping in toggleLaud — race condition between check and insert/delete
- **Severity**: LOW (mitigated by unique index)
- **Location**: `laud.ts:155-200`
- **Impact**: The unique index on `(tool_id, user_id)` prevents duplicate inserts, but the count update could be off by 1 in a race. The `GREATEST(..., 0)` prevents negative counts. Risk is very low in practice.
- **Fix**: Not critical — the unique index is the real guard. Could wrap in a transaction for belt-and-suspenders but Supabase transaction-mode pooler has limitations.

## Already Correct

- ✅ Unique index on `upvotes(tool_id, user_id)` prevents duplicate lauds
- ✅ Rate limiting: 30/day per user, 15/hour burst, 50/day per IP
- ✅ Bot detection via user agent
- ✅ `upvoteCount` on tools table updated on every toggle (increment/decrement)
- ✅ `recalcAndPersistToolScore` called after every toggle (fire-and-forget)
- ✅ ToolCard has auth gate via `useAuth()` + `AuthGateModal`
- ✅ Tool detail page has auth gate
- ✅ Community-picks page has auth gate
- ✅ Community-voting page has auth gate
- ✅ Founder dashboard LaudsTab correctly shows per-tool breakdown
- ✅ Admin laud management (activity, suspicious, remove) is functional
- ✅ `newCount` returned from server reconciles optimistic UI
