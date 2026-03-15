# Comment System Audit V2 — Findings

## Architecture Summary

- **Schema**: `comments` table in `src/drizzle/schema.ts` — `id`, `toolId`, `userId`, `parentCommentId`, `content`, `isDeleted`, `deletedAt`, `isEdited`, `createdAt`, `updatedAt`
- **Server Actions**: `src/app/actions/comments.ts` — `getCommentsByToolId`, `createComment`, `editComment`, `deleteComment`, `getCommentCount`
- **UI Component**: `src/components/CommentsSection.tsx` — full client component with pagination, realtime, soft-delete
- **Page Integration**: `src/app/tools/[slug]/page.tsx` — CommentsSection in Discussion tab, preview in Overview tab

## Key Data Flow

- `tool.id` in the frontend `Tool` type is a **string** (converted via `String(t.id)` in adapters)
- The page passes `parseInt(tool.id, 10)` to CommentsSection and getCommentCount
- The DB `comments.toolId` is an **integer** FK to `tools.id`
- `submittedBy` and `claimedBy` on the `tools` table are integer FKs to `users.id`
- The `getCommentsByToolId` action uses `db.query.tools.findFirst` which returns the full DB record including `submittedBy`/`claimedBy`
- Founder badge is determined server-side by checking `tool.submittedBy` and `tool.claimedBy` against `comment.userId`

## Issues Found

### SERVER-SIDE

1. **CRITICAL — `getVisibleTool` uses `db.query.tools.findFirst` without explicit relations**
   - The `db` is configured with `{ schema }` so `db.query.tools.findFirst` works via Drizzle's relational query API
   - However, there are NO relations defined (no relations.ts file exists)
   - This means `db.query.tools.findFirst` will work for simple `where` clauses but won't join related tables
   - **Impact**: None currently since we only use `where` clauses, but fragile

2. **MODERATE — Delete logic has redundant branches**
   - Lines 566-589: The `if (replyCount > 0)` and `else` branches execute identical SQL
   - The differentiation was meant to be "soft-delete with placeholder" vs "hard delete", but both do soft-delete now
   - **Impact**: No functional bug, just dead code / confusing logic

3. **LOW — Rate limit cooldown counts soft-deleted comments**
   - The 30-second cooldown query (line 365-373) doesn't filter `isDeleted = false`
   - If a user posts, then immediately deletes, the cooldown still applies (which is actually correct behavior to prevent abuse)
   - **Impact**: Acceptable — prevents delete-and-repost spam

4. **LOW — `getCommentsByToolId` runs a separate COUNT query every page load**
   - The totalCount query (line 302-306) runs on every page/cursor fetch
   - Could be optimized but not a production issue for current scale
   - **Impact**: Minor performance

### CLIENT-SIDE

5. **MODERATE — `parseInt(tool.id, 10)` could produce NaN**
   - If `tool.id` is somehow undefined or non-numeric, `parseInt` returns NaN
   - The server action's `isValidId` check would catch it, but the component would still mount with NaN toolId
   - **Impact**: Would show empty state, not crash. Already handled gracefully.

6. **LOW — Realtime subscription doesn't handle EDIT events for content updates**
   - Line 647-677: When a comment is UPDATED and NOT soft-deleted, nothing happens
   - If another user edits their comment, the viewer won't see the edit until refresh
   - **Impact**: Minor UX gap — edits are rare and users can refresh

7. **LOW — `onCountChange` callback could cause parent re-render loops**
   - Line 571-573: `useEffect` fires whenever `totalCount` changes, calling `onCountChange`
   - The parent passes `setCommentCount` directly, which is a stable setState function
   - **Impact**: No actual loop since setState is stable, but the pattern is fragile

8. **LOW — Reply composer shows for deleted parent comments**
   - Line 950: `{replyingTo === comment.id && !comment.isDeleted && ...}`
   - This correctly prevents replying to deleted comments
   - **Impact**: None — already handled

9. **LOW — No scroll-to-top when Discussion tab is clicked from Overview preview**
   - When user clicks "View all" or "Start a discussion" in the Overview tab, it switches to Discussion tab
   - The page doesn't scroll to the top of the Discussion section
   - **Impact**: Minor UX — user may not see the comment composer

10. **LOW — Comment count in Discussion tab label doesn't update in real-time**
    - The `commentCount` state is set by `onCountChange` from CommentsSection
    - But CommentsSection only mounts when Discussion tab is active
    - When on Overview tab, the count is stale (fetched once on page load)
    - **Impact**: Minor — count updates when switching to Discussion tab

### STRUCTURAL

11. **INFO — No index on `parentCommentId` column**
    - The reply query uses `WHERE parent_comment_id IN (...)` which would benefit from an index
    - Currently only `tool_id` is indexed
    - **Impact**: Performance at scale

12. **INFO — `parentCommentId` has no FK constraint in the schema**
    - Line 509: `parentCommentId: integer("parent_comment_id")` — no `.references()`
    - The server action validates parent existence, but DB doesn't enforce it
    - **Impact**: Data integrity relies on application logic only

## Fixes to Apply

### Must Fix
- [F2] Clean up redundant delete branches — consolidate into single soft-delete path
- [F5] Add NaN guard for toolId in page integration
- [F9] Add scroll-to behavior when switching to Discussion tab from Overview
- [F11] Add index on `parentCommentId` for reply query performance
- [F12] Add FK constraint on `parentCommentId` (self-referencing)

### Should Fix
- [F6] Handle EDIT events in Realtime subscription (update content in-place)
- [F10] Ensure comment count stays fresh — re-fetch count when switching back to Overview tab

### Won't Fix (acceptable as-is)
- [F1] No relations file — works fine without it for current usage
- [F3] Rate limit counting deleted comments — actually prevents abuse
- [F4] Separate COUNT query — acceptable at current scale
- [F7] onCountChange pattern — stable because setState is stable
- [F8] Reply composer on deleted — already handled correctly
