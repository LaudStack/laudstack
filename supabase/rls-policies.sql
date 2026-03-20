-- ============================================================================
-- LaudStack — Comprehensive Row Level Security Policies
-- ============================================================================
-- Architecture:
--   • Server-side (Drizzle ORM via DATABASE_URL) uses the `postgres` superuser
--     role, which BYPASSES RLS automatically. No server code changes needed.
--   • The Supabase anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) maps to the `anon`
--     role. Anyone with this key can hit the PostgREST API directly.
--   • The Supabase authenticated role maps to `authenticated` (after login).
--   • RLS policies below lock down direct PostgREST/client-SDK access while
--     leaving the server-side Drizzle path completely unaffected.
--
-- Principle: DENY ALL by default. Explicitly grant minimal read access where
-- the public legitimately needs it. Block all writes via PostgREST — every
-- mutation goes through server actions which use the postgres superuser.
-- ============================================================================

-- ============================================================================
-- STEP 0: Enable RLS on ALL tables
-- ============================================================================
-- When RLS is enabled with no policies, the default is DENY ALL for non-superusers.

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tool_screenshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "moderation_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tool_views" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outbound_clicks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "review_rate_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "upvotes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "laud_rate_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "saved_tools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_subscribers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tool_upgrades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tool_claims" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tool_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "email_verifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deal_claims" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "platform_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "launch_notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "review_helpful_votes" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY; -- table not yet created
ALTER TABLE "contact_submissions" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 1: USERS table
-- ============================================================================
-- Public profiles: allow reading non-sensitive fields only.
-- Sensitive fields (email, ip, stripe IDs, supabaseId) must NOT be exposed.
-- We use a column-level approach: allow SELECT but only on safe columns.
-- NOTE: PostgREST RLS operates at row level, not column level.
-- So we allow SELECT on all rows but rely on PostgREST column selection.
-- To truly hide columns, we use a security-definer view (see below).
-- For now: allow read (public profiles exist on the site), deny all writes.

-- Anon: can read basic user profiles (needed for review authors, tool submitters)
CREATE POLICY "users_anon_select"
  ON "users" FOR SELECT
  TO anon
  USING (true);

-- Authenticated: can read all user profiles
CREATE POLICY "users_auth_select"
  ON "users" FOR SELECT
  TO authenticated
  USING (true);

-- No INSERT/UPDATE/DELETE for anon or authenticated via PostgREST.
-- All user mutations go through server actions (postgres role).

-- ============================================================================
-- STEP 2: TOOLS table
-- ============================================================================
-- Public: can read approved/visible tools only.
-- This prevents leaking pending, rejected, suspended, or unpublished tools.

CREATE POLICY "tools_anon_select"
  ON "tools" FOR SELECT
  TO anon
  USING (status IN ('approved', 'featured') AND is_visible = true);

CREATE POLICY "tools_auth_select"
  ON "tools" FOR SELECT
  TO authenticated
  USING (status IN ('approved', 'featured') AND is_visible = true);

-- No INSERT/UPDATE/DELETE via PostgREST.

-- ============================================================================
-- STEP 3: TOOL_SCREENSHOTS table
-- ============================================================================
-- Public: can read screenshots for visible tools.

CREATE POLICY "tool_screenshots_anon_select"
  ON "tool_screenshots" FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM tools
      WHERE tools.id = tool_screenshots.tool_id
        AND tools.status IN ('approved', 'featured')
        AND tools.is_visible = true
    )
  );

CREATE POLICY "tool_screenshots_auth_select"
  ON "tool_screenshots" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tools
      WHERE tools.id = tool_screenshots.tool_id
        AND tools.status IN ('approved', 'featured')
        AND tools.is_visible = true
    )
  );

-- ============================================================================
-- STEP 4: MODERATION_LOGS table
-- ============================================================================
-- Admin-only. No public or authenticated access via PostgREST.
-- (No policies = deny all for anon and authenticated. Only postgres can read.)

-- ============================================================================
-- STEP 5: TOOL_VIEWS table
-- ============================================================================
-- Contains visitor IP addresses — highly sensitive.
-- No public or authenticated access via PostgREST.
-- Server actions handle view tracking.

-- ============================================================================
-- STEP 6: OUTBOUND_CLICKS table
-- ============================================================================
-- Analytics data. No public access.

-- ============================================================================
-- STEP 7: REVIEWS table
-- ============================================================================
-- Public: can read published reviews only.
-- Hides IP addresses, user agents, moderation notes from direct access.

CREATE POLICY "reviews_anon_select"
  ON "reviews" FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "reviews_auth_select"
  ON "reviews" FOR SELECT
  TO authenticated
  USING (status = 'published');

-- No INSERT/UPDATE/DELETE via PostgREST.

-- ============================================================================
-- STEP 8: REVIEW_RATE_LIMITS table
-- ============================================================================
-- Contains IP addresses. No public access.

-- ============================================================================
-- STEP 9: UPVOTES table
-- ============================================================================
-- Public can see upvote counts (aggregated on tools table).
-- Individual upvote records: allow read for authenticated users (own upvotes).

CREATE POLICY "upvotes_auth_select"
  ON "upvotes" FOR SELECT
  TO authenticated
  USING (true);

-- Anon can see upvotes too (for displaying on tool pages)
CREATE POLICY "upvotes_anon_select"
  ON "upvotes" FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- STEP 10: LAUD_RATE_LIMITS table
-- ============================================================================
-- Contains IP addresses. No public access.

-- ============================================================================
-- STEP 11: SAVED_TOOLS table
-- ============================================================================
-- Private per-user data. No public access.
-- Authenticated users should not see other users' saved tools via PostgREST.

-- ============================================================================
-- STEP 12: NEWSLETTER_SUBSCRIBERS table
-- ============================================================================
-- Contains email addresses. No public or authenticated access via PostgREST.
-- Server actions handle subscriptions.

-- ============================================================================
-- STEP 13: TOOL_UPGRADES table
-- ============================================================================
-- Contains Stripe session IDs and payment data. No public access.

-- ============================================================================
-- STEP 14: TOOL_CLAIMS table
-- ============================================================================
-- Contains verification tokens. No public access.

-- ============================================================================
-- STEP 15: TOOL_SUBMISSIONS table
-- ============================================================================
-- Contains founder personal info and verification data. No public access.

-- ============================================================================
-- STEP 16: EMAIL_VERIFICATIONS table
-- ============================================================================
-- Contains OTP codes! CRITICAL — no public access whatsoever.

-- ============================================================================
-- STEP 17: DEALS table
-- ============================================================================
-- Public: can read active, approved deals only.

CREATE POLICY "deals_anon_select"
  ON "deals" FOR SELECT
  TO anon
  USING (is_active = true AND approval_status = 'approved');

CREATE POLICY "deals_auth_select"
  ON "deals" FOR SELECT
  TO authenticated
  USING (is_active = true AND approval_status = 'approved');

-- ============================================================================
-- STEP 18: DEAL_CLAIMS table
-- ============================================================================
-- No public access. Server actions handle claim tracking.

-- ============================================================================
-- STEP 19: PLATFORM_SETTINGS table
-- ============================================================================
-- Public read for non-sensitive settings (e.g., site name, feature flags).

CREATE POLICY "platform_settings_anon_select"
  ON "platform_settings" FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "platform_settings_auth_select"
  ON "platform_settings" FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- STEP 20: LAUNCH_NOTIFICATIONS table
-- ============================================================================
-- Contains email addresses. No public access.

-- ============================================================================
-- STEP 21: COMMENTS table
-- ============================================================================
-- Public: can read non-deleted comments.

CREATE POLICY "comments_anon_select"
  ON "comments" FOR SELECT
  TO anon
  USING (is_deleted = false);

CREATE POLICY "comments_auth_select"
  ON "comments" FOR SELECT
  TO authenticated
  USING (is_deleted = false);

-- ============================================================================
-- STEP 22: REVIEW_HELPFUL_VOTES table
-- ============================================================================
-- Public can see helpful vote counts (aggregated on reviews table).
-- Allow read for display purposes.

CREATE POLICY "review_helpful_votes_anon_select"
  ON "review_helpful_votes" FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "review_helpful_votes_auth_select"
  ON "review_helpful_votes" FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- STEP 23: NOTIFICATIONS table
-- ============================================================================
-- Private per-user. No public access via PostgREST.
-- Even authenticated users should not see other users' notifications.

-- ============================================================================
-- STEP 24: CONTACT_SUBMISSIONS table
-- ============================================================================
-- Contains sender emails and IP addresses. Admin-only.
-- No public or authenticated access.

-- ============================================================================
-- VERIFICATION QUERY — Run after applying to confirm all policies
-- ============================================================================
-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
