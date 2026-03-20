# Debug Notes

## API Response Issue
The `/api/homepage` returns `{"tools":[],"leaderboard":[],"reviews":[],"totalReviews":0,"totalUsers":0}` — no `_error` field visible, which means the response might be cached from before the fix, OR the error is still happening but the `_error` field was stripped.

The response does NOT include `_error`, which means either:
1. The old cached response is being served (Vercel edge cache)
2. The query is succeeding but returning empty results

Need to check: is the `status = 'approved'` filter the issue? The seeded tools might have a different status.
