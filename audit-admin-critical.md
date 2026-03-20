# CRITICAL: Admin Panel Data Loading Completely Broken

## Evidence
- Admin Dashboard: All stats show 0, toast "Failed to load dashboard data" appears
- Admin Tools: Shows "0 products on the platform", "No tools found", toast "Failed to load tools" appears
- Both pages show the error toast in the top-right corner

## Root Cause Analysis
The `requireAdmin()` function in `src/app/actions/admin.ts` is failing.
It creates a Supabase server client from cookies and calls `supabase.auth.getUser()`.
If the user is not found, it throws "UNAUTHORIZED".

BUT: The admin layout's client-side auth works fine (shows avatar, name, role).
This means the Supabase session cookies ARE present in the browser.

The issue is likely:
1. The server action's cookie forwarding might not be working correctly
2. The Supabase session might have expired on the server side
3. There could be a cookie domain mismatch

## Key Observation
The `getCurrentDbUser()` function in `src/app/actions/user.ts` uses the EXACT same pattern
and it works (the admin layout shows the user's name and role).
So the issue might be specific to how the admin actions are called.

## Next Steps
- Add console.error logging to requireAdmin() to see the actual error
- Check if getCurrentDbUser works but requireAdmin doesn't (different error handling)
- Consider adding a retry mechanism or fallback
