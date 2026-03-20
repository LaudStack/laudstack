# Comment System Audit — Findings

## Server-Side (src/app/actions/comments.ts)

### Issues Found

1. **CRITICAL: No tool visibility/status check in getCommentsByToolId**
   - Comments can be fetched for hidden/pending/rejected tools
   - Must enforce `isVisible = true` AND `status = 'approved'` like review system

2. **CRITICAL: No tool visibility/status check in createComment**
   - Users can post comments on hidden/unapproved tools
   - The `tool exists` check only verifies `tools.id`, not visibility/status

3. **MEDIUM: No minimum content length**
   - Users can post single-character comments ("a")
   - Should enforce minimum 2-character content

4. **MEDIUM: deleteComment reply count is unreliable**
   - Uses `Array.isArray(replyResult)` which may not work with postgres.js driver
   - The fallback count query counts ALL deleted replies (including previously deleted ones)
   - Should count replies BEFORE deleting them, not after

5. **LOW: No admin edit capability**
   - Admins can delete but cannot edit comments (consistent with most platforms, acceptable)

6. **LOW: getCommentsByToolId returns all comments at once**
   - No pagination — could be slow for tools with 100+ comments
   - Acceptable for MVP but should be noted

7. **GOOD: Rate limiting is solid** — 10/hour/tool and 50 total/tool/user
8. **GOOD: Reply nesting prevention** — blocks replies-to-replies
9. **GOOD: Parent comment validation** — checks same toolId + not deleted
10. **GOOD: Founder badge** — checks both submittedBy and claimedBy
11. **GOOD: Soft delete** — cascades to replies when deleting top-level

## Client-Side (src/components/CommentsSection.tsx)

### Issues Found

1. **MEDIUM: Duplicate CommentsSection on Overview tab**
   - CommentsSection appears on BOTH Overview tab (line 809) AND Discussion tab (line 1227)
   - Both use the same toolId — creates duplicate state, double fetching
   - Should only appear in Discussion tab; Overview should show comment count + link to Discussion tab

2. **MEDIUM: No optimistic update for edit**
   - Edit updates local state correctly but doesn't update `updatedAt`
   - Minor: the `isEdited` flag is set locally but the timestamp stays stale

3. **LOW: Error boundary import at bottom of file**
   - `import React from "react"` at line 790 should be at top of file
   - Works but is non-standard

4. **GOOD: Auth gating** — properly gates all actions
5. **GOOD: Loading/error/empty states** — all handled
6. **GOOD: Show more/less** — 5 comment initial display with expand
7. **GOOD: Keyboard shortcuts** — Cmd+Enter to submit, Escape to cancel
8. **GOOD: Character counter** — shows count/2000
9. **GOOD: Delete confirmation** — two-step delete with cancel

## Action Items

### Server fixes:
- [ ] Add isVisible + status check to getCommentsByToolId
- [ ] Add isVisible + status check to createComment
- [ ] Add minimum content length (2 chars)
- [ ] Fix deleteComment reply counting
- [ ] Add updatedAt to edit response

### Client fixes:
- [ ] Remove duplicate CommentsSection from Overview tab, replace with count + link
- [ ] Move React import to top of file
- [ ] Add updatedAt to optimistic edit update
