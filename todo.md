# LaudStack TODO

## Previously Completed
- [x] Add founderStatus field to users schema (pending/verified/rejected/none)
- [x] Update upsertUser to support founderStatus
- [x] Founder verification gate in Navbar dropdown (Submit Tool CTA vs Founder Dashboard)
- [x] Founder verification gate in user dashboard header
- [x] User Dashboard: Add Deals tab (deals used by user)
- [x] User Dashboard: Add Templates tab (purchased templates)
- [x] User Dashboard: Add Cart tab (templates in cart)
- [x] Polished login/signup page (Google, LinkedIn, email/password)
- [x] LinkedIn OAuth profile extraction (name, location, email, photo)
- [x] useDbUser hook for fetching DB user record (founderStatus, etc.)
- [x] Real Supabase auth integration (useAuth hook)
- [x] User Dashboard: Profile tab
- [x] User Dashboard: My Reviews tab
- [x] User Dashboard: Saved Tools tab
- [x] User Dashboard: Notifications tab
- [x] User Dashboard: Settings tab
- [x] Founder Dashboard: Overview tab
- [x] Founder Dashboard: My Tools tab
- [x] Founder Dashboard: Reviews (with reply) tab
- [x] Founder Dashboard: Deals tab
- [x] Founder Dashboard: Analytics tab
- [x] Founder Dashboard: Promote tab
- [x] Founder Dashboard: Settings tab
- [x] Navbar enhanced dropdown with sections and founder gate
- [x] Server action: submitTool saves to toolSubmissions table
- [x] Server action: updates user founderStatus to 'pending'
- [x] Launch page wired to server action with loading/error states
- [x] Confirmation screen shows after successful DB save
- [x] Complete admin panel — 13 pages with UI
- [x] Admin layout with dark sidebar, header, notifications, avatar dropdown
- [x] Custom email verification (6-digit OTP via Resend)
- [x] Login page with OTP verification flow
- [x] super_admin added to userRoleEnum in schema (uncommitted)
- [x] Admin layout updated to accept super_admin role (uncommitted)

## Phase 1 — Super Admin & Auth Fixes
- [x] Fix requireAdmin() in admin.ts to accept both 'admin' and 'super_admin'
- [x] Add requireSuperAdmin() function for super-admin-only actions
- [x] Commit and push schema + layout changes

## Phase 2 — Admin User Creation & Role Assignment
- [x] Build admin user creation modal (super-admin only)
- [x] Build role assignment dropdown in admin users page
- [x] Add super_admin badge display in admin users list
- [x] Create server action: createAdminUser (super-admin only)

## Phase 3 — Missing Admin Features
- [x] Admin monetization/revenue tracking page
- [x] Enhanced admin analytics with real data and charts

## Phase 4 — User Profile & Founder Flow
- [ ] User profile settings page (edit name, avatar, bio)
- [ ] Founder upgrade flow from LaunchPad submission

## Phase 5 — Wire Frontend to Real Backend
- [x] Verify all admin pages call real server actions (not mock data)
- [x] Verify dashboard pages use real DB data

## Phase 6 — Mobile & Polish
- [x] Mobile responsiveness audit across all pages
- [x] Fix alignment, spacing, component positioning issues

## Phase 7 — Full Platform Audit
- [x] Test all navigation links work (no 404s)
- [x] Test all modals, forms, and interactive elements
- [x] Verify TypeScript build passes cleanly
- [ ] Test complete sign-up → OTP → login flow

## Phase 8 — Deploy
- [x] Commit all changes and push to GitHub
- [x] Verify Vercel auto-deployment succeeds
- [x] Test production site end-to-end

## Auth Guards (New Requirement)
- [x] Only logged-in users can upvote tools
- [x] Only logged-in users can write reviews
- [x] Only logged-in users can claim deals
- [x] Non-logged-in users can browse tools, read reviews, view deals
- [x] Show sign-in prompt when unauthenticated users try to interact

## Loading Animation & E2E Testing
- [x] Implement loading skeleton/animation for reviews page while data fetches
- [ ] Test live Vercel deployment: signup flow
- [ ] Test live Vercel deployment: OTP email verification
- [ ] Test live Vercel deployment: login flow
- [ ] Test live Vercel deployment: review submission
- [ ] Test live Vercel deployment: vote/upvote flow
- [ ] Fix any issues found during E2E testing
- [x] Rebuild login page with polished split-panel design (Google, LinkedIn, email/password)
- [x] Fix admin login: "Invalid email or password" error

## Critical Tasks (Priority)
- [x] Task 1: Admin login must be fully functional end-to-end
- [x] Task 2: Rebuild login page with polished split-panel design
- [x] Task 3: Branded polished OTP verification email template
- [x] Task 4: Signup and signin flows fully active and functional
- [x] Task 5: Platform error-free, no navigation issues, all links work
- [x] Task 6: Push to Vercel and ensure deployment works

## Database Seeding
- [ ] Seed database with 20 real AI/SaaS tools across multiple categories

## User & Founder Panel Audit + Recently Viewed Polish
- [x] Remove "View Plans" from user panel completely (Settings tab Account Info + Founder CTA)
- [x] Audit User Dashboard: ensure all tabs are polished and 100% functional
- [x] Audit Founder Dashboard: ensure all tabs are polished and 100% functional
- [x] Polish Recently Viewed section on homepage with better design
- [x] Build, test, and deploy all changes

## Future Features
- [ ] Auto-fetch website homepage screenshots for listed tools (like Vercel's deployment previews) — use external screenshot API (e.g., ScreenshotOne, Microlink) to capture tool homepages at standard viewport (1280x800), upload to S3, and save to tool's screenshot_url field. Trigger on tool submission via LaunchPad, weekly cron for freshness, and on-demand "Refresh Screenshot" button in Founder Dashboard.

## Tool Screenshots/Logos & Founder Dashboard Activation
- [x] Fix tool screenshots: remove placeholders, keep only 1 screenshot, fix viewport alignment and fill
- [x] Fix tool card logos: consistent alignment and fill styling
- [x] Fully build & activate Founder Dashboard Overview tab
- [x] Fully build & activate Founder Dashboard Tools tab
- [x] Fully build & activate Founder Dashboard Reviews tab
- [x] Fully build & activate Founder Dashboard Deals tab
- [x] Fully build & activate Founder Dashboard Analytics tab
- [x] Fully build & activate Founder Dashboard Promote tab
- [x] Fully build & activate Founder Dashboard Settings tab
- [x] Build, test, and deploy all changes

## Mobile Responsiveness Audit
- [x] Fix global width shifting issue on mobile (overflow-x, viewport meta, root layout)
- [x] Homepage: fully responsive hero, sections, cards, pills, social proof
- [x] Navbar: mobile menu, logo, links, dropdown fully responsive
- [x] Footer: columns, links, newsletter form responsive
- [x] Tools page: grid, filters, cards responsive
- [x] Tool Detail page: screenshots, reviews, sidebar responsive
- [x] Search page: search bar, results, filters responsive
- [x] User Dashboard: sidebar, all tabs, forms, cards responsive
- [x] Founder Dashboard: sidebar, all tabs, forms, modals responsive
- [x] LaunchPad page: form, steps, layout responsive
- [x] Deals page: cards, filters responsive
- [x] Reviews page: cards, filters responsive
- [x] Trending page: cards, layout responsive
- [x] All remaining pages (About, Contact, FAQ, etc.) responsive
- [x] Modals, toasts, overlays responsive on mobile
- [x] Build, test, and deploy all mobile fixes

## Mobile Menu Search & Footer Stats
- [x] Add search bar to mobile menu
- [x] Remove stats section above the footer completely

## Login Page Polish
- [x] Use main site header with logo (no menu items)
- [x] Move email/password fields upward on right side
- [x] Google and LinkedIn buttons show only logos (icon-only)
- [x] Polish input fields to be visible against white background

## Social Icons & First/Last Name Refactor
- [x] Make Google and LinkedIn login icons bigger (larger button + icon size)
- [x] Update database schema: add firstName and lastName columns to users table
- [x] Update server actions for first/last name (signup, onboarding, profile update, OAuth)
- [x] Update login/signup form: replace Full Name with First Name + Last Name
- [x] Update onboarding form: replace Full Name with First Name + Last Name
- [x] Update user dashboard settings: replace Full Name with First Name + Last Name
- [x] Update founder dashboard settings: replace name with First Name + Last Name
- [x] Update display logic across platform to use firstName + lastName
- [x] Build, test, and deploy all changes

## Card Redesign & Homepage Polish
- [x] Redesign ToolCard component: professional, clean, no-screenshot standard card
- [x] Create FeaturedToolCard variant: with screenshot, only for featured/trending sections
- [x] Remove screenshots from standard tool listings (browse, search, saved, categories)
- [x] Rebuild Trending section: use clean cards without screenshots (or limit to featured only)
- [x] Rebuild Fresh Launches section: Product Hunt-style numbered list, no screenshots
- [x] Polish Browse by Category section cards
- [x] Polish sidebar leaderboard and reviews
- [x] Remove About section from homepage (move to /about page if needed)
- [x] Polish LaunchPad CTA section
- [x] Update tools page to use new card component
- [x] Update search page to use new card component
- [x] Update saved page to use new card component
- [x] Build, test, and push all card redesign changes

## Card Layout Fix — Match Product Hunt Sizing
- [ ] Make cards bigger overall (match PH card height/padding)
- [ ] Bigger logo (64px+) with image properly filling the container
- [ ] Bold tool name with verified check, star ratings directly under name
- [ ] Description extended to 2 lines, badges moved under description
- [ ] Reduce badge count (max 1 badge visible)
- [ ] Bigger upvote button, centered vertically on right side, icon + number stacked
- [x] Build, test, and push

## Featured Card Polish & Horizontal Scroll
- [x] Polish FeaturedCard: bold name, rating under name, thicker upvote icon
- [x] Wrap featured/trending sections in professional horizontal scroll container
- [x] Ensure horizontal scroll works on both desktop and mobile
- [x] Build, test, and push

## Section Headers & Featured Container Fix
- [x] Make section header headlines larger and bolder (more visible)
- [x] Make section header subtexts larger and more readable
- [x] Make section label pills more prominent
- [x] Rebuild featured tools container with proper visible background
- [x] Fix featured card positioning inside the scroll container

## Featured Section — Bold Container Redesign
- [x] Rebuild Featured Tools section with bold amber colored container background
- [x] White text for section header inside the container
- [x] White rounded cards inside the colored container
- [x] Remove all card shadows
- [x] Horizontal scroll with cards in a row
- [x] CTA button inside the container header

## Homepage & Navbar Polish Round
- [x] Reduce featured container height by 20%
- [x] Increase featured container width to 1350px
- [x] Adjust featured container amber shade to a different tone
- [x] Hide Trending This Week section from homepage
- [x] Polish Browse by Category section with better design
- [x] Restore sticky behavior starting from sorting/filter bar
- [x] Rename Recent Reviews sidebar to Trending This Week with same design
- [x] Hide For Founders sidebar on mobile (redundant with section below)
- [x] Rename Tools to Categories in navbar

## Browse by Category — Full Polish
- [x] Category tabs: larger text, bottom-border active indicator, 16px emoji, visible on desktop with "More" dropdown
- [x] Section width to max-w-[1300px], white background, increased grid gap
- [x] Filter bar: cleaner labels, custom sort dropdown, results count prominent, active filter chips
- [x] Tool cards: left-border accent for featured/top-rated, hide category pill when category selected, hover micro-interaction
- [x] Contextual sidebar: show "Top in [Category]" when specific category selected
- [x] Add Compare Tools CTA card to sidebar
- [x] Add Weekly Picks email signup card to sidebar
- [x] Empty states: illustrated with icon, message, and CTA
- [x] Loading skeleton placeholders for cards
- [x] Progress indicator on "Show more" button
- [x] Build, test, and push

## Sticky Category + Filter Bar Container
- [x] Wrap category tabs and filter bar in a single container with no rounded edges
- [x] Make the container sticky so it stays in place while tool cards scroll
- [x] Ensure proper z-index and background so content doesn't show through
- [x] Build, test, and push

## Browse by Category — Fix & Container Polish
- [x] Fix Browse by Category section not working (diagnose and resolve)
- [x] Add side edges (left/right borders) to the sticky container
- [x] Change container background to a subtle non-white color
- [x] Ensure the container looks polished and attractive
- [x] Build, test, and push

## Sticky Behavior Refinement — Browse by Category
- [x] Refine sticky container so it only sticks within the Browse by Category section bounds
- [x] Ensure sticky unsticks when user scrolls past the section
- [x] Add visual feedback when container becomes sticky (e.g. enhanced shadow)
- [x] Ensure smooth transition between sticky and non-sticky states
- [x] Build, test, and push

## Homepage Fixes — 5 Items
- [x] Move "Everything in One Place" section down to replace "For Founders" LaunchPad CTA section
- [x] Rename Featured Tools container to Trending and keep same container design
- [x] Slightly reduce section headers (excluding hero)
- [x] Move logo position upward aligned with tool name in horizontal StandardCard
- [x] Fix Browse by Category: tool list scrolls independently inside the section (contained scroll)
- [x] Build, test, and push

## Browse by Category — Revert to Original Sticky
- [x] Revert internal scroll container, restore original page-level sticky behavior (category tabs + filters stick, page scrolls naturally)
- [x] Build, test, and push

## Browse by Category — Fix Sticky (Still Not Working)
- [x] Diagnose why sticky is not working (audit overflow, parent containers, CSS)
- [x] Fix the sticky behavior so category tabs + filters stick to viewport top
- [x] Build, test, and push

## Browse by Category — Sticky Fix Round 2 + Label Removal
- [x] Fix sticky behavior (still not working after previous attempt)
- [x] Remove "All Tools showing X of Y" label from Browse by Category
- [x] Remove "Showing X of Y tools" label from Browse by Category
- [x] Build, test, and push

## Browse by Category — Premium Sticky Enhancement
- [x] Sticky bar should only span the left column (tool list), not cover the right sidebar
- [x] Sticky bar should unstick/release at the end of the tool list
- [x] Add polished transitions, subtle shadow on stick, and smooth animation
- [x] Ensure premium feel with proper z-index layering and visual refinement
- [x] Apply same fixes to both laudstack (Vite) and laudstack-next (Next.js) projects
- [x] Test on dev server and Vercel production

## Browse by Category — Restore Full Width, Remove Sticky
- [x] Move category tabs and filter bar back above the grid (full section width)
- [x] Remove all sticky/pinned behavior from category tabs and filter bar
- [x] Remove IntersectionObserver sentinel refs and isSticky/isPastEnd state
- [x] Keep everything else (label removal, section restructuring, etc.)
- [x] Apply to both laudstack (Vite) and laudstack-next (Next.js)
- [x] Test and push

## Move Browse by Category After Hero
- [x] Move Browse by Category section to directly after the hero (before Trending and Fresh Launches)
- [x] New order: Hero → Browse by Category → Trending → Fresh Launches → Everything in One Place → Footer
- [x] Apply to both laudstack (Vite) and laudstack-next (Next.js)
- [x] Test and push

## Back to Top Floating Button
- [x] Add a floating "Back to top" button that appears when scrolling past Browse by Category
- [x] Smooth scroll to top on click, polished animation on show/hide
- [x] Apply to both laudstack (Vite) and laudstack-next (Next.js)
- [x] Test and push

## Move Trending Under Hero + Soften Container Color
- [x] Move Trending This Week section to directly under the hero (before Browse by Category)
- [x] Soften the Trending container color to a calmer tone
- [x] Apply to both laudstack (Vite) and laudstack-next (Next.js)
- [x] Test and push

## Category-Specific Hero Banners in Browse by Category
- [x] Design category banner data (headline, description, icon, accent color per category)
- [x] Create CategoryBanner component with smooth transition on category change
- [x] Integrate banner into Browse by Category section (between section header and category tabs)
- [x] Apply to both laudstack (Vite) and laudstack-next (Next.js)
- [x] Test and push

## Homepage Copy Updates
- [ ] Update hero subheader to new copy about Stacks, Laud, and builders
- [ ] Adjust hero subheader width for exactly 2 lines (first line longer)
- [ ] Update Everything in One Place section subheader to new copy

## P0 Critical Fixes
- [x] Deals page: Replace 12 hardcoded mock deals with real DB data via getActiveDeals()
- [x] useSavedTools: Replace localStorage-only hook with DB-backed server actions (toggleSaveTool/getUserSavedToolIds)
- [x] Tool detail: Remove getToolReviews() fake review generation (3 fabricated reviews for tools with no real reviews)
- [x] Tool detail: Fix rating breakdown to compute from actual review data instead of synthetic formula
- [x] Tool detail: Add empty state for tools with no reviews ("No reviews yet" + CTA)
- [x] Push P0 fixes to GitHub and verify Vercel deployment

## Database Migration & Schema Sync (March 14, 2026)
- [x] Run migration to add features/pricing_tiers JSONB columns to tools table
- [x] Run migration to add notes/verify_method/proof_url to tool_claims table
- [x] Run migration to add founder_reply/founder_reply_at to reviews table
- [x] Run migration to add onboarding fields to users table
- [x] Run migration to add max_claims/created_by to deals table
- [x] Create moderation_logs, outbound_clicks, tool_screenshots, tool_views tables
- [x] Add all foreign key constraints
- [x] Verify 44 stacks display correctly on live site (www.laudstack.com)

## Full System Audit (March 14, 2026)
- [ ] Phase 1: Database & Data Audit
- [ ] Phase 2: Admin System Audit
- [ ] Phase 3: Founder Flow Audit
- [ ] Phase 4: User Interaction Audit
- [ ] Phase 5: Public Stack Page Audit
- [ ] Phase 6: Ranking & Algorithm Audit
- [ ] Phase 7: UI/UX Component Audit
- [ ] Phase 8: Backend Logic Audit
- [ ] Phase 9: Error & Bug Scan
- [ ] Phase 10: Produce verification report

## Review Engine — Complete Rebuild (March 14, 2026)
- [x] Purge all mock reviews from Supabase database
- [x] Reset all review_count and average_rating to 0 on tools table
- [x] Update reviews table schema (add ip_address, moderation_status, flag fields)
- [x] Build server actions: submitReview with anti-fraud (rate limit, IP, duplicate check)
- [x] Build server actions: editReview, deleteReview (user ownership)
- [x] Build server actions: flagReview (founder), replyToReview (founder)
- [x] Build server actions: admin moderation (approve, hide, remove, reject flag)
- [x] Build per-tool review API endpoint (uses getToolDetail server action)
- [x] Update tool detail page to fetch and display reviews per-tool
- [x] Build review submission UI (star rating, text, validation) — already existed, wired to backend
- [x] Build founder review management UI (view, reply, flag)
- [x] Build admin review moderation panel (flagged reviews, moderation actions)
- [x] Implement anti-fraud: rate limiting, IP tracking, duplicate prevention, spam detection
- [x] Auto-update average_rating and review_count on tools table (recalcToolStats)
- [x] Test all review flows end-to-end (TypeScript check + Next.js build passed)
- [x] Push to GitHub (commit f532252)

## Review Engine Hardening (March 14, 2026)
- [x] Audit all backend review actions for bugs, mock data, FIXMEs
- [x] Audit all frontend review components for bugs, placeholders, unwired UI
- [x] Fix all discovered backend issues
- [x] Fix all discovered frontend issues (rewrote /reviews page, added edit/delete to user dashboard, wired Helpful button to DB, removed duplicate adminDeleteReview)
- [x] Verify TypeScript + Next.js build pass with zero errors
- [x] Verify live site review flows via browser
- [x] Push hardened code to GitHub (commits f5c044a + 27fa92e)

## Laud Engine — Complete Build (March 14, 2026)
- [x] Audit existing upvote/Laud system (schema, actions, UI, mock data)
- [x] Purge all mock Laud/upvote data from Supabase
- [x] Reset all upvote_count to 0 on tools table
- [x] Update upvotes table schema (add IP tracking, user_agent, timestamps)
- [x] Add laud_rate_limits table for anti-spam
- [x] Build backend: toggleLaud with anti-fraud (rate limit, IP, duplicate check, cooldown)
- [x] Build backend: getUserLaudedToolIds for checking user's Lauds
- [x] Build backend: admin Laud moderation (view activity, detect suspicious, remove fraudulent)
- [x] Build frontend: Laud button on ToolCard and tool detail page (toggle, auth gate, instant UI)
- [x] Build founder Laud visibility (dashboard stats, history, daily activity)
- [x] Build admin Laud moderation panel (activity view, suspicious detection, removal)
- [x] Integrate Lauds into ranking algorithm (Most Lauded, Trending, Recently Lauded)
- [x] Verify TypeScript + Next.js build pass with zero errors
- [x] Test live site Laud flows via browser
- [x] Push to GitHub (commit 391a5c1)

## Laud Engine Hardening (March 14, 2026)
- [x] Audit laud.ts backend for bugs, mock data, FIXMEs, TODOs, console.logs
- [x] Audit public.ts/user.ts laud delegations for correctness
- [x] Audit founder.ts laud references for correctness
- [x] Audit ToolCard.tsx laud wiring (useUpvote hook, toggleLaud, optimistic UI)
- [x] Audit tool detail page laud wiring — FIXED: upvoted state now initialized from DB, laudCount uses absolute value not offset
- [x] Audit useLauds.ts hook — FIXED: removed console.error calls
- [x] Audit founder dashboard Lauds tab for bugs and unwired UI
- [x] Audit admin /admin/lauds page — FIXED: suspicious users query now includes firstName/lastName
- [x] Audit homepage/tools/search/trending sort options for Most Lauded
- [x] Audit ranking algorithm laud integration
- [x] Audit schema (upvotes + laud_rate_limits) for correctness
- [x] Fix all discovered issues (6 bugs fixed: tool detail upvoted init, laudCount math, community-picks wired to laud engine, console.errors removed, admin suspicious name display, AuthGateModal laud action)
- [x] Verify TypeScript + Next.js build pass with zero errors
- [x] Push hardened code to GitHub

## Header Color Update (March 14, 2026)
- [x] Update Navbar background from #0F1629 to #EDF2FA (very light blue) with dark text
- [x] Swap logo to dark-text variant (logo-light-transparent.png), update all UI elements for light bg
- [x] Verify build and push to GitHub
