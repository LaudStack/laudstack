# Laud System Client-Side Fixes

## Issues Found

### F2: Tool detail page laudCount initialization bug
- `laudCountInitialized` only set to true when `toolUpvoteCount > 0`
- Tools with 0 lauds never initialize, so the count stays at 0 but the flag never flips
- Fix: Always initialize laudCount from toolUpvoteCount, remove the > 0 guard

### F3: ToolCard initialUpvoted never passed — all cards start as "not lauded"
- No page passes `initialUpvoted` to ToolCard
- Need a global `useLaudedTools` hook (like useSavedTools) that fetches user's lauded IDs once
- ToolCard's useUpvote should use this global hook instead of local state

### F4: Launches page has no auth gate
- `handleLaud` calls `toggleUpvote` directly, no auth check
- If unauthenticated, server returns error, user sees "Please sign in to laud" toast
- Should show AuthGateModal instead
- Also imports `getUserUpvotes` from user.ts which was deleted (F7 dead code removal)

### F5: Tools browse page has no auth gate  
- Same issue as launches page
- Also imports `getUserUpvotes` from user.ts which was deleted

### F6: Launches page laud count is static
- PodiumCard and LeaderboardRow show `tool.upvote_count` which doesn't update on toggle
- Need optimistic count update like community-picks/community-voting pages

### F10: Launches/tools pages import dead getUserUpvotes from user.ts
- Both pages dynamically import `getUserUpvotes` from `@/app/actions/user`
- This function was removed in F7 fix
- Need to switch to `getUserLaudedToolIds` from `@/app/actions/laud`

## Fix Strategy

1. Create `useLaudedTools` global hook (like useSavedTools)
2. Refactor ToolCard to use global hook
3. Fix tool detail page laudCount initialization
4. Fix launches page: add auth gate, optimistic counts, fix import
5. Fix tools browse page: add auth gate, fix import
