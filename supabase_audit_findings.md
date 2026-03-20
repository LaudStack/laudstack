# Supabase Live Audit Findings

## Advisor: 16 Issues Found

### RLS Disabled on Public Tables (15 tables)
The following tables are publicly accessible via the Supabase REST API without Row Level Security enabled:

1. public.notifications
2. public.stack_follows
3. public.user_follows
4. public.marketplace_products
5. public.marketplace_orders
6. public.marketplace_reviews
7. public.marketplace_offers
8. public.promotion_pricing
9. public.email_templates
10. public.deal_of_day_slots
11. public.promotions
12. public.admin_invites
13. public.cron_job_runs
14. public.admin_audit_log
15. public.ranking_weights

### Sensitive Column Exposed (CRITICAL)
- Table `public.admin_invites` is exposed via API without RLS and contains sensitive column: `token`
- This means anyone can read invite tokens via the Supabase REST API

## Project Info
- Project: LaudStack AWS | us-east-2
- Status: Healthy
- Last Backup: 11 hours ago
- Plan: NANO
- Auth URL: https://auth.laudstack.com

## Full Table RLS Status

### RLS ENABLED (protected)
- comments
- contact_submissions
- deal_claims
- deals (has policies: deals_anon_select, deals_auth_select)
- email_verifications
- laud_rate_limits
- launch_notifications
- moderation_logs
- newsletter_subscribers
- outbound_clicks
- platform_settings
- review_helpful_votes
- review_rate_limits
- reviews
- saved_tools
- tool_claims
- tool_screenshots
- tool_submissions
- tool_upgrades
- tool_views
- tools
- upvotes
- users

### RLS DISABLED (exposed via Supabase REST API — CRITICAL)
- admin_audit_log
- admin_invites (contains sensitive `token` column)
- cron_job_runs
- deal_of_day_slots
- email_templates
- marketplace_offers
- marketplace_orders
- marketplace_products
- marketplace_reviews
- notifications
- promotion_pricing
- promotions
- ranking_weights
- stack_follows
- user_follows

## Storage Buckets
- avatars: PUBLIC bucket, NO storage policies defined
  - Risk: Anyone can read/write to the avatars bucket without restriction

## Auth URL Configuration
- Site URL: https://www.laudstack.com
- Redirect URLs allowed:
  - https://laudstack.com/**
  - http://localhost:3000/** (should be removed for production)
  - https://www.laudstack.com/**
  - https://auth.laudstack.com/**

## Auth Providers
- Email: Enabled
- Phone: Disabled
- SAML 2.0: Disabled
- Web3 Wallet: Disabled
- Allow new user signups: Enabled
- Manual linking: Disabled
- Anonymous sign-ins: Disabled
- Confirm email: Enabled (good)
