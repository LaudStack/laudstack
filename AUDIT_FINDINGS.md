# LaudStack Stack Listing System Audit
## Date: 2026-03-13

## Architecture
- Next.js 14+ App Router (src/app/)
- Supabase Auth (email/password, Google, LinkedIn)
- PostgreSQL via Drizzle ORM (Supabase)
- Cloudflare R2 for storage
- Resend for email
- Stripe for payments (placeholder)

## What's WORKING (connected to real backend):
1. Admin CRUD for tools, users, reviews, submissions, claims, deals, subscribers
2. User auth (Supabase) - signup, login, OTP verification
3. Tool submission via LaunchPad
4. Upvote toggle (authenticated)
5. Save tool toggle (authenticated)
6. Review submission (authenticated)
7. Homepage data fetching from DB
8. Tool detail page with reviews
9. Search functionality
10. Category filtering
11. Deals system

## Schema GAPS (must fix):
1. NO affiliate_url field on tools table
2. NO view_count / visit_count field on tools table
3. NO outbound_click_count field on tools table
4. NO save_count field on tools table
5. NO is_visible boolean on tools table
6. NO is_spotlighted boolean on tools table
7. NO claimed_by field on tools table
8. tool_status enum missing "suspended" and "unpublished"

## Features to Build:
- Admin tool detail page (/admin/tools/[id])
- Admin file upload for logos/screenshots
- Affiliate link management
- Full moderation controls
- Claim flow for founders
- Verification request flow
- View/click tracking
- Real ranking algorithm
- Edit/delete own review for users
- Remove all mock data
- Seed 50 real tools
