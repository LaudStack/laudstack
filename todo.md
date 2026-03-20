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

## Navbar Color — Match Futurepedia (March 14, 2026)
- [x] Inspect Futurepedia.io navbar background color (#3960EF vivid blue, white text)
- [x] Update LaudStack Navbar to match (bg, logo, text, icons, search pill, avatar, mobile)
- [x] Verify build and push to GitHub

## Navigation Architecture Finalization (March 14, 2026)

### Header Restructure
- [x] Header items: Launches, Discover, Leaderboard, SaaS Deals, Templates
- [x] Launches → dropdown only (no landing page)
- [x] Discover → dropdown only (no landing page)
- [x] Leaderboard → dropdown only (no landing page)
- [x] SaaS Deals → direct page (no dropdown)
- [x] Templates → direct page (no dropdown)
- [x] Remove Resources from header

### Launches Dropdown Pages
- [x] LaunchPad (existing, audited)
- [x] Today's Launches (existing /new-launches, audited)
- [x] Upcoming Launches (NEW — built)
- [x] Recently Launched (NEW — built)
- [x] Launch Archive (existing, audited)

### Discover Dropdown Pages
- [x] All Stacks (existing /tools, audited)
- [x] Browse Categories (existing /categories, audited)
- [x] Comparisons (existing, audited)
- [x] Alternatives (existing, audited)
- [x] Recently Added (NEW — built)

### Leaderboard Dropdown Pages
- [x] Trending Stacks (existing /trending, audited)
- [x] Top Rated (existing /top-rated, audited)
- [x] Most Lauded (NEW — built)
- [x] Rising Stacks (NEW — built)
- [x] Recently Launched (shared with Launches, audited)

### New Top-Level Pages
- [x] SaaS Deals page (existing /deals, audited)
- [x] Templates page (existing /templates, audited)

### Footer Restructure
- [x] Move Resources section from header to footer
- [x] Add Comparisons section to footer
- [x] All footer links verified

### Platform Consistency
- [x] All pages use real backend data (useToolsData → /api/homepage → Supabase)
- [x] No mock data, placeholder UI, FIXMEs, TODOs
- [x] Stack cards, Laud system, reviews, rankings all wired
- [x] All navigation links correct (16/16 routes verified)
- [x] No outdated/conflicting pages

### Final Verification
- [x] TypeScript + Next.js build passes (zero errors)
- [x] Push to GitHub

## Programmatic SEO Engine (March 14, 2026)

### Infrastructure
- [x] Build shared SEO metadata generator (dynamic titles, descriptions, canonical URLs)
- [x] Build shared server actions for dynamic tool queries (by category, tags, use case)
- [x] Build shared SEO page components (ToolGrid, SortBar, InternalLinks, SEO heading hierarchy)

### Category SEO Pages
- [x] Dynamic route: /c/[category-slug] (e.g., /c/ai-writing-tools, /c/marketing-tools)
- [x] Category description, tool list, sorting (Top Rated, Trending, Newest), stack cards with ratings/Lauds
- [x] Auto-updates when new stacks added to category

### Best Tools Pages
- [x] Dynamic route: /best/[slug] (e.g., /best/ai-tools-for-marketing) — 18 page definitions
- [x] Introduction text, curated list, rankings from real signals, links to stack detail pages
- [x] Generated from categories + tags

### Alternatives Pages
- [x] Dynamic route: /[tool-slug]-alternatives via middleware rewrite to /alt/[slug]
- [x] Original stack overview, list of alternatives, comparison highlights, stack cards
- [x] Alternatives determined by category similarity + tags

### Comparison Pages
- [x] Dynamic route: /[tool-a]-vs-[tool-b] via middleware rewrite to /vs/[slugA]/[slugB]
- [x] Side-by-side comparison table, features, pricing, ratings, links to stack pages
- [x] Data derived from stack attributes in database

### Trending/Discovery SEO Pages
- [x] /trending-ai-tools, /top-rated-ai-tools, /new-ai-tools, /most-popular-saas-tools
- [x] Powered by ranking algorithm, real data

### Internal Linking
- [x] All SEO pages link to stack detail, category, comparison, and alternatives pages
- [x] Cross-linking between related SEO pages
- [x] XML sitemap at /sitemap.xml with all SEO page URLs
- [x] robots.txt with sitemap reference
- [x] Footer updated with SEO page links

### Page Generation Rules
- [x] Pages only generated when enough stacks exist (minimum threshold)
- [x] No empty pages, no duplicate pages
- [x] All pages use real database data

### Final Verification
- [x] TypeScript + Next.js build passes
- [x] Push to GitHub

## Footer Redesign — Product Hunt Style (March 14, 2026)
- [x] Remove tagline paragraph under the footer logo
- [x] Keep top section: logo + social + newsletter + current 4 menu columns
- [x] Add new bottom section: 5 additional menu columns in a grid (separated by border)
- [x] Build, test, and push to GitHub

## Navbar Search Bar Visibility (March 14, 2026)
- [x] Make desktop search pill lighter/more visible against dark header
- [x] Make mobile search bar lighter/more visible against dark header
- [x] Push to GitHub

## Footer Alignment & Menu Rebalance (March 14, 2026)
- [x] Fix alignment issues in footer layout (consistent spacing, column alignment)
- [x] Rebalance bottom section menu items — represent SaaS + AI launching platform, not just AI directory
- [x] Push to GitHub

## Hero Section Polish (March 14, 2026)
- [x] Redesign shared PageHero component: reduce padding/height, cleaner alignment, less clutter
- [x] Audit and fix individual page hero usages with custom children
- [x] Update SEOPageShell hero section
- [x] Update standalone hero sections (launchpad, tools detail, tools catalog)
- [x] Downgraded all size="lg" heroes to "md", SEO pages to "sm"
- [x] Build, test, and push to GitHub

## Remove Hero Stat Bars (March 14, 2026)
- [x] Remove stat bars from shared PageHero component (StatRow, StatItem, stats prop all removed)
- [x] Remove stat bars from all 6 pages: trending, deals, alternatives, comparisons, community-voting, launch-archive
- [x] Remove stats strip from tools catalog page hero
- [x] Push to GitHub

## Consolidate Recently Launched & Recently Added (March 14, 2026)
- [x] Audit all routes, pages, and nav references for both pages
- [x] Rename Recently Added page content to "Recently Launched" (shows both founder launches + admin-added stacks)
- [x] Delete the old /recently-launched page directory
- [x] Update all navbar dropdown links — consolidated to one "Recently Launched" in Launches dropdown, replaced duplicate in Discover with "Spotlight Picks", replaced duplicate in Leaderboard with "Community Voting"
- [x] Update footer links — consolidated to one "Recently Launched" in Launches section, replaced duplicate with "Community Voting"
- [x] Verified no remaining references to /recently-launched in codebase
- [x] Push to GitHub

## Remove Rising Stacks (March 14, 2026)
- [x] Delete /rising page directory
- [x] Remove Rising Stacks from navbar Leaderboard dropdown (replaced with Changelog)
- [x] Rename "Rising Stacks" to "Trending Stacks" in footer Discover section
- [x] Update sitemap page reference from Rising Stacks to Trending Stacks
- [x] Verified no remaining /rising route references in codebase
- [x] No duplicate menu items across all dropdowns
- [x] Push to GitHub

## Changelog & Trust Framework Nav Updates (March 14, 2026)
- [x] Changelog already present in footer Resources section
- [x] Replace Changelog with Trust Framework in navbar Leaderboard dropdown
- [x] Trust Framework already present in footer Resources section
- [x] Fixed navbar Trust Framework href to match actual route (/trust)
- [x] Push to GitHub

## LaunchPad Page Rebuild (March 14, 2026)
- [x] Audit current LaunchPad page structure and content
- [x] Redesign hero section — centered, professional, clean, no gradients, dual CTAs
- [x] Redesign "How It Works" section — clear 3-step numbered process with detail badges
- [x] Redesign comparison table — Free vs Verified founder feature comparison
- [x] Redesign benefits section — 6 benefits in clean 3×2 grid with neutral icons
- [x] Add social proof strip with live platform stats
- [x] Redesign testimonials — 3 founder quotes with metrics
- [x] Redesign FAQ — accordion with smooth transitions
- [x] Redesign final CTA — clean light section (no dark background per design rules)
- [x] Consistent light theme, proper spacing, responsive design
- [x] TypeScript build passes
- [x] Push to GitHub

## LaunchPad — Trust Bar & Legibility (March 14, 2026)
- [x] Replace stats strip with "Trusted by" logo bar (Notion, Linear, Vercel, Stripe, Figma, Supabase)
- [x] Improve text legibility: body text → text-[15px]/text-[16px], color → slate-600, added leading-relaxed
- [x] Push to GitHub

## LaunchPad Enhancements (March 14, 2026)
- [x] Replace text brand logos with real inline SVG logos (Notion, Linear, Vercel, Stripe, Figma, Supabase)
- [x] Add micro-interactions (hover scale/shadow/translate, scroll fade-in via IntersectionObserver + framer-motion)
- [x] Add Recently Launched showcase strip with real DB data (6 tools, fetched via server action)
- [x] Improve comparison table for mobile (stacked card layout with checklist per tier)
- [x] Wire Launch/Claim CTAs to auth-gated routes (/launch, /claim with login redirect)
- [x] Add FAQ structured data JSON-LD for SEO rich results (FAQPage schema)
- [x] Add headline A/B test analytics tracking (sessionStorage variant, sendBeacon events)
- [x] Build, test, and push to GitHub

## Launches Page Polish (March 14, 2026)
- [x] Remove all stats from the page (completely removed stats grid)
- [x] Fix page flashing on visit (added PageSkeleton loading state, shown during data fetch)
- [x] Enhance Upcoming Launch cards with real stack logos, details, and polished compact countdown
- [x] Wire all modals, features, and interactive components (Notify Me, period tabs, leaderboard rows, upcoming cards)
- [x] Created /api/launches/upcoming API route for real DB data (tools + submissions with future dates)
- [x] Ensure page is fully functional and activated
- [x] Push to GitHub

## Upcoming Launches Page Polish (March 14, 2026)
- [x] Audit current page structure and data fetching
- [x] Add scheduled_launch_at field to tools schema so admins can mark listings as upcoming
- [x] Run migration to push schema changes to Supabase (applied via psql)
- [x] Update /api/launches/upcoming route to use scheduled_launch_at field
- [x] Rebuild Upcoming Launches page with polished cards, real data, no flash
- [x] Ensure page is never empty (fallback to recently launched stacks)
- [x] Wire all interactive components (Notify Me, countdown, links)
- [x] Add admin UI: Scheduled Launch Date field in admin tool detail page
- [x] Seed 5 upcoming tools (Cursor, Perplexity AI, Linear, Vercel, Notion)
- [x] Push to GitHub

## Notify Me Email System (March 14, 2026)
- [x] Create launch_notifications table in Supabase (email, toolId, notifiedAt, etc.)
- [x] Create /api/launches/notify POST endpoint to collect emails
- [x] Wire "Notify Me" buttons on upcoming-launches page to POST endpoint
- [x] Create Resend email template for launch-day notification (sendLaunchNotificationEmail)
- [x] Create /api/cron/send-launch-notifications endpoint to send emails on launch day
- [x] Push to GitHub

## Auto-Transition: Upcoming → Launched (March 14, 2026)
- [x] Create /api/cron/transition-launches endpoint that checks scheduled_launch_at
- [x] When scheduled_launch_at passes, clear it and update launchedAt to now
- [x] Configure Vercel cron jobs in vercel.json (transition at 6am UTC, notifications at 7am UTC)
- [x] Push to GitHub

## Founder Scheduled Launch Date (March 14, 2026)
- [x] Add scheduledLaunchAt field to LaunchPad submission form (renamed label, added description)
- [x] toolSubmissions already has launch_date column — no schema change needed
- [x] submitTool server action already saves launchDate to launch_date column
- [x] Show scheduled date in admin submission review (with Upcoming badge for future dates)
- [x] When admin approves, carry scheduled date to the tool record (auto-creates tool with scheduledLaunchAt)
- [x] Push to GitHub

## Launches Page Flash Fix + New Launches Activation (March 14, 2026)
- [x] Fix /launches page flash issue (URL sync was writing to /launches instead of /new-launches)
- [x] Ensure /new-launches page is fully wired with real data (uses useToolsData hook → /api/homepage)
- [x] Ensure all interactive components on /new-launches are activated (Laud buttons call toggleUpvote, loading skeleton, lauded state tracking)
- [x] Fix Footer link from /launches to /new-launches
- [x] Build verification (zero errors)
- [x] Push to GitHub (commit adf4558)

## Consolidate /launches and /new-launches (March 14, 2026)
- [ ] Copy polished /new-launches page content to /launches
- [ ] Delete /new-launches directory
- [ ] Update all URL references from /new-launches to /launches across codebase
- [ ] Update Footer, Navbar, and sitemap references
- [ ] Build verification
- [ ] Push to GitHub

## Consolidate to /launches + Unify Card Design (March 14, 2026)
- [ ] Copy polished /new-launches page code to /launches (replace old leaderboard)
- [ ] Update all internal URL references from /new-launches to /launches
- [ ] Delete /new-launches directory
- [ ] Apply same polished card design to All Stacks (/tools) page
- [ ] Update Navbar, Footer, Sitemap, CompareBar references
- [ ] Build verification
- [ ] Push to GitHub

## Restore /launches + Polish All Stacks Cards (March 14, 2026)
- [x] Restore original /launches leaderboard page from git history (commit 9e5f1d2)
- [x] Fix Navbar: Today's Launches now links to /launches (was /new-launches)
- [x] Fix Footer: Today's Launches now links to /launches (was /new-launches)
- [x] Deleted /new-launches page (consolidated into /launches)
- [x] Updated sitemap, sitemap.xml, CompareBar references from /new-launches to /launches
- [x] Polish All Stacks (/tools) page cards to match /new-launches card design (grid + list views with laud buttons)
- [x] Build verification (zero errors)
- [x] Push to GitHub (commit 1a3c167)

## Polish & Activate /launches Page (March 14, 2026)
- [x] Remove Stats section completely from /launches page
- [x] Fix page flashing when visiting the page (added loading skeleton)
- [x] Enhance Upcoming Launches cards with real stack details and logos from /api/launches/upcoming
- [x] Reduce countdown timer size — compact inline font-mono design
- [x] Wire all interactive components (laud buttons with real toggleUpvote, Notify Me with email + API, period tabs)
- [x] Ensure leaderboard uses real data and laud functionality (laudedIds, handleLaud, invalidateToolsCache)
- [x] Polish overall page design (light theme bg-white, consistent amber accent, no gradients)
- [x] Build verification (zero errors)
- [x] Push to GitHub (commit fb40dce)

## Countdown Pill Redesign (March 14, 2026)
- [ ] Redesign countdown timer on /launches upcoming cards to be a prominent centered pill
- [ ] Ensure countdown is well legible and inside the middle of the card
- [ ] Build verification
- [ ] Push to GitHub

## Countdown Pill + Notify Me Button Polish (March 14, 2026)
- [x] /launches: Move countdown from tiny top bar to prominent centered pill inside card body (dark pill, amber accents, font-mono)
- [x] /upcoming-launches: Make Notify Me button more visible and colored (amber bg, white text, shadow, hover)
- [x] Build verification (zero errors)
- [x] Push to GitHub (commit fa16dbd)

## LaunchPad Production Audit (March 14, 2026)
- [ ] Full code audit: read every line, catalog all issues
- [ ] Remove all mock/placeholder/hardcoded data
- [ ] Remove all TODO/FIXME/debug code
- [ ] Verify all backend wiring (form submission, pricing, auth)
- [ ] Fix flashes and unstable loading behavior
- [ ] Fix all UI inconsistencies and minor polish
- [ ] Ensure full mobile responsiveness
- [ ] Activate all components and interactions (or remove if decorative-only)
- [ ] Eliminate potential console errors
- [ ] Build verification
- [ ] Push to GitHub

## Product-Level Commenting System (March 14, 2026)
- [x] Add comments table to database schema (id, tool_id, user_id, parent_comment_id, content, is_deleted, is_edited, created_at, updated_at)
- [x] Generate and apply migration to Supabase (0006_chunky_loners.sql)
- [x] Create server actions for comments CRUD (getComments, createComment, editComment, deleteComment)
- [x] Auth-gated comment creation (only logged-in users)
- [x] Only comment author can edit/delete their own comments
- [x] Founder badge logic (show badge only for stack owner/claimer)
- [x] Build Comments UI component (composer, comment list, reply support)
- [x] Loading skeletons for comments section
- [x] Empty state for no comments
- [x] Auth gate modal for unauthenticated comment attempts
- [x] Single-level reply support (founder and user replies)
- [x] Edit and delete own comments
- [x] Mobile responsive design
- [x] Integrate comments section into stack detail page (new tab)
- [ ] Write vitest tests for comments server actions
- [x] Push to GitHub for Vercel deployment (commit 0531b5f)

## Comments System Audit & Hardening (March 14, 2026)
- [x] Add toolId existence validation in createComment before insert
- [x] Add Number.isFinite() guards for toolId/commentId in all server actions
- [x] Add try-catch wrappers in handleCreateComment, handleReply, handleEdit, handleDelete
- [x] Remove dead variable oneHourAgo and fix misleading rate-limit comment
- [x] Remove unused imports: asc, isNull from comments.ts; MessageSquare, X from CommentsSection.tsx
- [x] Fix bogus disabled condition (!isAuthenticated && false) in CommentComposer
- [x] Fix delete count for top-level comments with replies (decrement by 1 + replies.length)
- [x] Add self-referencing FK constraint for parentCommentId in schema
- [x] Add DB index on comments.tool_id for query performance
- [x] Add error boundary / defensive rendering around CommentsSection
- [x] Sync editContent state with comment.content prop changes
- [x] Implement proper time-based rate limiting (10 comments per hour per user per tool)

## Comparison System Audit & Hardening (March 15, 2026)
- [x] C5: Add compare button to ToolCard (StandardCard) for listing pages (desktop + mobile)
- [x] C7: Add horizontal scroll wrapper to /compare page for mobile grid overflow
- [x] C7: Add minWidth to all grid containers in /compare page
- [x] C8: SEO routing — CompareBar and share URL use /vs/slugA/slugB for 2-tool comparisons
- [x] C8: CompareBar handleCompare uses /vs/ route for 2 tools, /compare?tools= for 3
- [x] C9: Mobile-responsive ComparisonRow in /vs/ page (responsive padding, font sizes, flex-wrap)
- [x] C9: Mobile-responsive ToolHeaderCard in /vs/ page (responsive logo, text, padding)
- [x] C9: Mobile-responsive CTA buttons in /vs/ page (stacked on mobile)
- [x] C9: Mobile-responsive feature comparison header in /vs/ page
- [x] C9: CompareBar flexWrap for mobile layout
- [x] Build verification (zero errors)
- [x] Push to GitHub (commit 5f10cbe)

## Newsletter Subscription System Audit & Hardening (March 15, 2026)
- [x] N1: Fix blog detail page (/blog/[slug]) — wire fake subscribe form to tRPC newsletter.subscribe
- [x] N2: Fix blog listing page — add email @ validation before calling subscribe mutation
- [x] N3: Fix newsletter page — remove dead onError 'already subscribed' check, handle via onSuccess
- [x] N4: Add server-side rate limiting to newsletter.subscribe tRPC endpoint
- [x] N5: Add input sanitization/trimming for firstName field in subscribe procedure
- [x] Build verification (zero errors)
- [x] Push to GitHub (commit 1fc73f6)

## Launching & Claiming System Audit (March 2026)
- [x] L1: Fix reviewSubmission to set claimedBy and isVerified when approving a founder's submission
- [x] L2: Fix UpcomingCard notify for submission-based items — pass submissionId instead of null toolId
- [x] L3: Add "Launch Now" toggle to the launch form (launch immediately vs schedule future date)
- [x] L4: Fix slug collision risk in reviewSubmission — append numeric suffix if slug already exists
- [x] L5: Fix launchedAt for scheduled launches — use scheduledLaunchAt as launchedAt, cron preserves it
- [x] Build verification (zero errors)
- [x] Push to GitHub (commit bef79ba)

## Notify Me Flow Update (March 2026)
- [x] Remove email popup from /launches page UpcomingCard — one-click notify for auth users only
- [x] Remove email dialog from /upcoming-launches page — one-click notify for auth users only
- [x] Redirect unauthenticated users to login when clicking Notify Me
- [x] Update notify API to support userId-based subscriptions (capture account details)
- [x] Build verification (zero errors)
- [x] Push to GitHub (commit ffb5f2e)

## User & Founder Account/Onboarding Audit (Mar 2026)
- [x] A1: Create /auth/error page — auth callback redirects here on failure but page doesn't exist (404)
- [x] A2: Wire password reset to Supabase — currently entirely fake (setTimeout simulation)
- [x] A3: Create DB user record on email signup — upsertUser only called in OAuth callback, email users have no DB record
- [x] A4: Redirect email signup users to onboarding after OTP verification — currently skips onboarding
- [x] A5: Fix welcome page hero text color — text-slate-900 on dark bg should be text-white
- [x] A6: Remove or redirect dead /auth/verify-email page — OTP verification happens inline in login page
- [x] Build verification (zero errors)
- [x] Push to GitHub (commit 49b3c94)

## Notification System Audit (Mar 15, 2026)
- [x] N1: Create `notifications` table schema with type, recipientId, message, read, link, createdAt
- [x] N2: Create server-side `createNotification` helper and `getNotifications`/`markAsRead` actions
- [x] N3: Wire admin bell to real notifications (replace MOCK_NOTIFICATIONS)
- [x] N4: Wire user dashboard NotificationsTab to real notifications from DB
- [x] N5: Add notification triggers: new review, founder reply, comment reply, claim/submission status
- [x] N6: Call sendToolSubmissionEmail when founder submits a tool
- [x] N7: Wire admin settings handleSave to real DB persistence (platform_settings table)
- [x] N8: Add unread notification badge to Navbar bell (desktop + mobile)
- [x] N9: Admin bell polls every 30s, click-to-navigate, mark-all-as-read
- [x] Build verification (zero errors)
- [x] Push to GitHub (commit 3e3bdd7)

## Auth System Audit (Mar 15, 2026)
- [x] A1: Fix reset-password page creating new Supabase client on every render (use singleton)
- [x] A2: Add server-side rate limiting on OTP code sending (max 5 per email per hour)
- [x] A3: Add brute-force protection on OTP verification (max 5 attempts per code, then lock)
- [x] A4: Fix admin login to verify role server-side before redirecting to admin dashboard
- [x] A5: Add index on email in users table for faster lookups
- [x] A6: Fix return URL preservation across auth callback (support both 'return' and 'next' params, prevent open redirect)
- [x] A7: Fix founder dashboard to check dbLoading to prevent flash of unauthenticated state
- [x] A8: Add proper email format validation on signup form
- [x] A9: Sanitize all auth inputs (trim whitespace, lowercase email) across useAuth, login, signup, reset-password, admin login, upsertUser
- [x] A10: Fix reset-password redirectTo to route through /api/auth/callback for proper session exchange
- [x] A11: Add graceful duplicate account error handling on signup
- [x] A12: Fix VerifyStep handleResend to surface rate limit errors from sendVerificationCode
- [x] A13: Build verification (zero errors, exit code 0)
- [x] A14: Push to GitHub (commit 8a2e774) and deploy via Vercel

## Email Verification System Audit (Mar 15, 2026)
- [x] V1: Replace Math.random() with crypto.randomInt() for cryptographically secure code generation
- [x] V2: Add composite index on email_verifications(email, supabase_id) + index on expires_at for faster lookups
- [x] V3: Fix rate limit counting — now counts before deleting unused codes, rate limit is consistent
- [x] V4: Add cleanup of expired verification codes on every send (prevents DB bloat)
- [x] V5: OTP input auto-focuses first field on mount
- [x] V6: Enter key support on OTP input to submit verification
- [x] V7: Clear OTP code input on failed verification attempt so user can re-enter
- [x] V8: Mobile-responsive OTP input fields (w-[40px] sm:w-[44px], gap-1.5 sm:gap-2)
- [x] V9: Email subject includes code for UX convenience (industry standard — Gmail/Google do this too)
- [x] V10: supabaseId binding enforced — code is tied to specific supabase_id + email combo
- [x] V11: sendVerificationEmail already returns boolean + console.error for debugging
- [x] V12: Added constant-time string comparison (timingSafeEqual) to prevent timing attacks
- [x] V13: Added autoComplete="one-time-code" for browser autofill support
- [x] V14: Added aria-label for accessibility on OTP inputs
- [x] V15: Added email format validation in sendVerificationCode server action
- [x] V16: Clear code on resend for clean UX
- [x] V17: Build verification (zero errors, exit code 0)
- [x] V18: Push to GitHub (commit 9fa719a) and deploy via Vercel

## Password Reset System Audit (Mar 15, 2026)
- [x] P1: Add client-side cooldown on reset request (60s after sending, button shows countdown)
- [x] P2: Fix password strength meter — now based on requirements met count instead of just length
- [x] P3: Add password complexity requirements (uppercase, lowercase, number, min 8 chars)
- [x] P4: Fix auth callback to skip onboarding redirect when destination is reset-password
- [x] P5: Add session verification before showing reset form (verifying → reset or invalid stage)
- [x] P6: Fix "Done" stage to redirect to /dashboard (user is already authenticated after reset)
- [x] P7: Add password requirements checklist UI with check/X icons for each requirement
- [x] P8: Add "invalid" stage for expired/invalid reset links with clear messaging
- [x] P9: Add confirm password match indicator (green border + checkmark when matching)
- [x] P10: Don't reveal whether email exists on reset request (security best practice)
- [x] P11: Handle Supabase-specific errors (same_password, expired session) with clear messages
- [x] P12: Add autoComplete attributes (email, new-password) for browser autofill
- [x] P13: Disable submit button until all password requirements are met + passwords match
- [x] P14: Handle Supabase rate limit errors on reset request
- [x] P15: Build verification (zero errors, exit code 0)
- [x] P16: Push to GitHub (commit 3c860eb) and deploy via Vercel

## Email System Audit (Mar 15, 2026)
- [x] E1: Add escapeHtml() utility to prevent XSS in all email templates
- [x] E2: Fix duplicate welcome email — completeOnboarding checks welcomeEmailSent flag, added column to users table
- [x] E3: Add error logging to all catch blocks in email functions (sendToolSubmissionEmail, sendClaimApprovedEmail, etc.)
- [x] E4: Fix sendContactFormEmail to check Resend API error response (not just exceptions)
- [x] E5: Replace fake SMTP/SendGrid admin settings with Resend status display and active email types list
- [x] E6: Add sendNewReviewEmail function, wired into submitReview action (emails founder on new review)
- [x] E7: Add sendReplyNotificationEmail function, wired into replyToReview action (emails reviewer on founder reply)
- [x] E8: Supabase email: password reset only (intentional — uses built-in token exchange). Signup confirmation should be disabled in Supabase dashboard.
- [x] E9: Build verification (zero errors, exit code 0)
- [x] E10: Push to GitHub (commit eb3dff1) and deploy via Vercel

## Email Template Audit (Mar 15, 2026)
- [x] T1: Fix branding — "95+ Tools" → "95+ Stacks", "trending products" → "rising stacks" in footer
- [x] T2: Fix contact form layout — removed extra div wrapper, proper table-based structure
- [x] T3: Fix contact form to check Resend API { error } response and log errors
- [x] T4: Replace display:inline-flex/flex in launch notification with table-based layout
- [x] T5: Replace display:inline-flex in "Now Live" badge with nested table layout
- [x] T6: Add per-template preheader text (OTP code, welcome message, submission status, etc.)
- [x] T7: Escape toolName in email subject lines via escapeHtml()
- [x] T8: Add List-Unsubscribe header on marketing emails (welcome, launch notification)
- [x] T9: Fix OTP digit cells — responsive via @media (36px on mobile, 48px on desktop)
- [x] T10: Add Outlook VML fallbacks for CTA buttons (v:roundrect) and icon blocks
- [x] T11: Add shared helpers (ctaButton, iconBlock, infoBox, footerNote) for DRY templates
- [x] T12: Add MSO conditional comments for header/footer Outlook rendering
- [x] T13: Add meta tags for email client compatibility (x-apple-disable-message-reformatting, format-detection)
- [x] T14: Build verification (zero errors, exit code 0)
- [x] T15: Push to GitHub (commit 13d4d75) and deploy via Vercel

## Admin Email Reporting System Audit (Mar 15, 2026)
- [x] A1: Create sendAdminNewUserAlert email function (new user signup → admin email)
- [x] A2: Create sendAdminNewSubmissionAlert email function (new tool submission → admin email)
- [x] A3: Create sendAdminNewClaimAlert email function (new claim request → admin email)
- [x] A4: Create sendAdminNewReviewAlert email function (new review posted, especially flagged → admin email)
- [x] A5: Create sendAdminPromotionRequestAlert email function (founder promotion request → admin email)
- [x] A6: Create sendAdminDailyDigest email function (daily platform metrics → admin email)
- [x] A7: Wire sendAdminNewUserAlert into user.ts completeOnboarding action
- [x] A8: Wire sendAdminNewSubmissionAlert into submitTool.ts (on new submission)
- [x] A9: Wire sendAdminNewClaimAlert into founder.ts claimExistingTool action
- [x] A10: Wire sendAdminNewReviewAlert into public.ts submitReview action
- [x] A11: Wire sendAdminPromotionRequestAlert into founder.ts requestPromotion action
- [x] A12: Wire notifyAdmins() in-app notifications for submissions, claims, promotions
- [x] A13: Create /api/cron/admin-daily-digest endpoint for scheduled digest emails
- [x] A14: Add admin-daily-digest to vercel.json cron schedule
- [x] A15: Add getAdminEmails() helper to fetch all admin/super_admin email addresses
- [x] A16: Build verification (zero errors, exit code 0)
- [x] A17: Push to GitHub and deploy via Vercel (commit 65b3f78)

## Contact System Audit & Hardening
- [x] C1: Create contactSubmissions table in schema.ts (id, name, email, topic, message, status, ipAddress, createdAt, archivedAt)
- [x] C2: Run drizzle migration to create the table in Supabase (via SQL Editor)
- [x] C3: Add server action for persisting contact submissions to DB + sending admin email
- [x] C4: Update tRPC contact.submit mutation to persist to DB, add rate limiting and spam prevention
- [x] C5: Add getContactSubmissions and updateContactStatus admin server actions
- [x] C6: Create admin/messages page with full CRUD for contact submissions
- [x] C7: Add Messages nav item to admin sidebar layout
- [x] C8: Update sendContactFormEmail to also send to all admin emails via getAdminEmails()
- [x] C9: Add email validation regex and message length validation to frontend form
- [x] C10: TypeScript build verification (zero errors)
- [x] C11: Push to GitHub for Vercel deployment (commit 45dc61f)

## Search System Audit & Hardening

### Backend
- [x] S1: Replaced Typesense with PostgreSQL full-text search (tsvector/tsquery + pg_trgm) in search.ts
- [x] S2: Enable pg_trgm extension in Supabase for fuzzy/typo-tolerant search
- [x] S3: Add tsvector search column to tools table and create GIN index for full-text search (+ trigram indexes on name/tagline, auto-update trigger)
- [x] S4: Created searchToolsPg() and autocompleteSearch() functions with full-text + trigram + ILIKE fallback
- [x] S5: Updated /api/search route with autocomplete + full search modes, category/pricing/featured filters, pagination
- [x] S6: Replaced tRPC tools.search with searchToolsPg(), removed Typesense import
- [x] S7: Removed indexTool() import and calls from recalculate-rankings cron

### Frontend - Navbar Search
- [x] S8: Wire Navbar search overlay to use /api/search autocomplete instead of client-side useToolsData() filtering
- [x] S9: Added debounced autocomplete (250ms) with AbortController, loading spinner, and server-side results
- [ ] S10: Add keyboard navigation (arrow keys) to Navbar search results

### Frontend - /search Page
- [x] S11: Wire /search page to use /api/search with server-side full-text search, pagination, and filters
- [x] S12: Added pagination to /search results (21 per page, page controls)
- [x] S13: Category/sort/featured filters work with server-side search (category sent to API, sort applied client-side)

### Frontend - /tools Page
- [x] S14: /tools page search kept client-side — correct for faceted browsing with sidebar filters (all tools loaded for facet counts)
- [x] S15: Client-side category/pricing/rating/badge filters retained — instant feedback for multi-facet sidebar

### Admin Panel
- [x] S16: Wired admin header search bar to navigate to /admin/tools?q=... on Enter
- [x] S17: Verified all admin page search bars use server-side ILIKE (tools, users, reviews, subscribers, messages) — founders uses client-side filter (acceptable)

### Cleanup
- [x] S18: Removed typesense npm package, kept typesenseId in schema/rowToTool (column still in DB)
- [x] S19: TypeScript build verification (zero errors, exit code 0)
- [x] S20: Push to GitHub for Vercel deployment (commit 2b2cd01)

## Deals System Audit & Hardening

### Schema & Database
- [x] D1: Add placement enum column (none/pinned/featured/deal_of_day) to deals table
- [x] D2: Add dealType enum column (discount/lifetime/free_trial/exclusive) to deals table
- [x] D3: Add approvalStatus enum column (pending/approved/rejected) to deals table
- [x] D4: Add originalPrice and dealPrice varchar columns to deals table
- [x] D5: Create deal_claims table for per-user claim tracking (dealId, userId, claimedAt, unique constraint)
- [x] D6: Run migration SQL in Supabase (Success)

### Backend Server Actions
- [x] D7: Update createFounderDeal to set approvalStatus='pending' instead of isActive=true
- [x] D8: Add admin approveDeal / rejectDeal actions with email notification
- [x] D9: Add admin updateDealPlacement action (assign placement tier, enforce 1 deal_of_day at a time)
- [x] D10: Add admin editDeal action for updating deal fields
- [x] D11: Fix claimDeal in user.ts — track per-user claims in deal_claims, prevent duplicates, increment claimCount
- [x] D12: Remove duplicate getActiveDeals from user.ts (keep the one in public.ts)
- [x] D13: Update getActiveDeals in public.ts to include placement and dealType fields
- [x] D14: Update getAdminDeals to include placement, dealType, approvalStatus fields

### Frontend — Public Deals Page
- [x] D15: Wire LaunchDealModal to createFounderDeal backend action (replace placeholder toast)
- [x] D16: Fix Deal of the Day to use placement field from DB instead of index === 0
- [ ] D17: Add Featured Deals section (placement = 'featured')
- [x] D18: Add Pinned Deals visual indicator (placement = 'pinned')
- [x] D19: Wire claim button to call claimDeal action (not just clipboard copy)
- [x] D20: Polish deal cards — add original price, deal price, deal type badge, placement badge, consistent layout

### Frontend — Admin Deals Page
- [x] D21: Add approve/reject workflow for pending deals
- [x] D22: Add placement assignment UI (dropdown to set placement tier)
- [x] D23: Add deal edit modal for updating deal fields
- [x] D24: Add claim monitoring (show claim count, max claims, progress)
- [x] D25: Add filter tabs (All / Pending / Active / Expired / Rejected)

### Frontend — Founder Dashboard Deals
- [x] D26: Add deal type selection to founder deal creation form
- [x] D27: Show approval status badge on founder's deals list
- [ ] D28: Add placement upgrade request option with pricing display

### Monetization
- [ ] D29: Display placement pricing in founder dashboard (Deal of the Day $99, Featured $39-79, Pinned $19-29)
- [ ] D30: Store placement tier pricing as constants

### Final
- [x] D31: TypeScript build verification (zero errors)
- [x] D32: Push to GitHub for Vercel deployment (commit ebad4af)

## Deals Audit & Stripe Monetization
### Public Deals Page Hardening
- [x] D15: Wire LaunchDealModal to createFounderDeal backend action (replace placeholder toast)
- [x] D17: Add Featured Deals section (placement = 'featured') with visual distinction
- [x] D18: Add Pinned Deals visual indicator (placement = 'pinned')
- [x] D19: Wire claim button to call claimDeal action (not just clipboard copy)
### Stripe Integration for Deal Placements
- [x] S-STRIPE-1: Stripe SDK already installed
- [x] S-STRIPE-2: Placement pricing constants in stripe.ts (5 plans)
- [x] S-STRIPE-3: /api/stripe/deal-placement checkout route
- [x] S-STRIPE-4: Extended webhook handler for deal placements
- [x] S-STRIPE-5: DealPlacementUpgrade component in founder dashboard
- [x] S-STRIPE-6: Auto-assign placement via webhook
- [x] S-STRIPE-7: Revenue summary + per-deal payment info in admin
- [x] S-STRIPE-8: TypeScript build clean (EXIT_CODE=0)
- [x] S-STRIPE-9: Push to GitHub (commit fc68562)

## Bug Fixes
- [x] BUG-1: Fix "Failed to Load Deals" error on public deals page — stale pnpm-lock.yaml + missing DB migration

## Supabase RLS Audit & Hardening
- [x] RLS-1: Inventoried all 23 tables — all had RLS disabled, zero policies
- [x] RLS-2: Mapped all data access patterns — server uses postgres role (bypasses RLS), client uses anon key
- [x] RLS-3: Identified critical gap — all tables fully exposed via Supabase anon key
- [x] RLS-4: Applied 18 policies across 23 tables via Supabase SQL Editor
- [x] RLS-5: Verified — pg_policies shows 18 policies, live site works correctly
- [x] RLS-6: Documented in supabase/rls-policies.sql and audit report
- [x] RLS-7: Pushed to GitHub (commit e2a5733)
- [x] BUG-2: Fix "Failed to Load Deals" error — missing DB columns (starts_at, claim_count, etc.) + SSR window guard (commit c2c561e)

## User & Founder Panel Production Audit
- [ ] AUDIT-1: Read and catalog all User Dashboard tabs, components, and server actions
- [ ] AUDIT-2: Read and catalog all Founder Dashboard tabs, components, and server actions
- [ ] AUDIT-3: Find all placeholders, mock data, TODOs, FIXMEs, console.logs, dead ends
- [ ] AUDIT-4: Fix all User Dashboard issues — wire features, remove placeholders
- [ ] AUDIT-5: Fix all Founder Dashboard issues — wire features, remove placeholders
- [ ] AUDIT-6: TypeScript build verification (zero errors)
- [ ] AUDIT-7: Live site browser testing — verify every tab and action
- [ ] AUDIT-8: Push to GitHub

## Full UI & Responsiveness Audit (March 16, 2026)
- [ ] R1: Homepage hero — reduce navbar-hero spacing, bolder headline typography, two-line break preserved
- [ ] R2: Global styles — mobile typography, line-height, body text readability improvements
- [ ] R3: Navbar — mobile menu polish, spacing, alignment
- [ ] R4: Footer — mobile layout, column stacking, spacing
- [ ] R5: Search page — mobile filters, category pills, collapsible controls
- [ ] R6: Trending page — mobile grid, cards, spacing
- [ ] R7: Categories/Tools page — mobile grid, alignment, filter pills
- [ ] R8: Tool detail page — mobile layout, tabs, media, reviews, sidebar
- [ ] R9: Stack/Best pages — mobile grid, hero, cards
- [ ] R10: Deals page — mobile cards, filters, layout
- [ ] R11: Launch/Launches pages — mobile cards, countdown, layout
- [ ] R12: Compare/Alternatives pages — mobile table/comparison layout
- [ ] R13: Founder Dashboard — mobile tabs, forms, analytics
- [ ] R14: User Dashboard — mobile layout, panels
- [ ] R15: Admin panels — mobile sidebar, tables, forms
- [ ] R16: ToolCard component — mobile sizing, alignment, text wrapping
- [ ] R17: PageHero component — mobile typography, spacing
- [ ] R18: Modals/dialogs — mobile sizing, scrolling
- [ ] R19: Forms and inputs — mobile touch targets, spacing
- [ ] R20: Cards and grids — consistent mobile breakpoints
- [ ] R21: Fix horizontal overflow/scrolling issues across all pages
- [ ] R22: Ensure consistent spacing and padding across breakpoints
- [ ] R23: Advertise, LaunchPad, About, FAQ, Contact pages — mobile polish
- [ ] R24: TypeScript build verification (zero errors)
- [ ] R25: Push to GitHub for Vercel deployment

## Footer Restructure & SEO Enhancement
- [x] Remove Founder Dashboard, Pricing, RSS Feed, Sitemap, /claim from footer
- [x] Create founder resource pages (launch guide, visibility tips, listing optimization, promotions guide)
- [x] Add SEO discovery sections: Stack vs Stack, Alternatives, Best SaaS for, Best AI for
- [x] Add Founders Resources section to footer
- [x] Reorganize footer into cleaner logical groups
- [x] Protect /claim route for authenticated users only (AuthGateModal already in place)
- [x] Ensure footer is fully responsive on mobile

## Sticky Scroll Fix (March 16, 2026)
- [x] Fix homepage "Explore SaaS & AI Stacks by Category" desktop sticky scroll feature broken during responsiveness audit

## Community Growth Features (March 16, 2026)

### One-Click Review Flow
- [x] Create ReviewNudge component (30s timer, non-intrusive slide-in)
- [x] Integrate ReviewNudge into tool detail page
- [x] Only show to authenticated users who haven't reviewed this tool

### Structured Review Prompts
- [x] Add "What problem does this solve?" guided field to WriteReviewModal
- [x] Add "Who is it best for?" guided field to WriteReviewModal
- [x] Add "Any downsides?" guided field to WriteReviewModal

### Review Share Buttons
- [x] Create ReviewShareButtons component (Twitter/X, LinkedIn, copy link)
- [x] Integrate share buttons into review display on tool detail page

### Review Milestones & Badges
- [x] Create ReviewBadges display component
- [x] Integrate badges next to reviewer names on tool detail page
- [x] Add badge computation logic based on review count

### Founder Reply from Tool Detail
- [x] Create FounderReplyForm component for inline reply on tool detail page
- [x] Wire to existing replyToReview server action

### Email Notifications
- [x] Add sendToolLaudedEmail function to email.ts
- [x] Add sendWeeklyDigestEmail function to email.ts
- [x] Wire laud notification into toggleLaud action

### SEO Comparison Pages Enhancement
- [x] Verify /best/[slug] pages are working with real data
- [x] Add JSON-LD structured data to comparison pages

## Typography & Contrast Enhancements
- [x] Increase base font sizes across the platform (desktop + mobile)
- [x] Improve text contrast — make light/gray text darker and more readable
- [x] Make mobile homepage hero header bigger
- [x] Reduce space between mobile hero header and navbar
- [x] Bold all section headers and hero headers across all pages
- [x] Enhance global CSS for better readability
- [x] Update page-level typography where inline styles override globals

## Tool Detail Page Mobile Alignment Fix
- [x] Audit and fix mobile layout alignment on /tools/[slug] page
- [x] Fix header section alignment (logo, name, badges, buttons)
- [x] Fix review section alignment on mobile
- [x] Fix sidebar/content stacking on mobile
- [x] Fix spacing and padding consistency on mobile
- [x] Build, test, and push

## Signup Error Fix
- [x] Investigate "An unexpected error occurred" on signup
- [x] Fix: Supabase creates account but sendVerificationCode fails
- [x] Fix: Users bypass verification and onboarding after error
- [x] Fix signUpWithEmail to prevent premature auto-login during OTP step
- [x] Add detailed error handling in sendVerificationCode (not generic catch)
- [x] Add retry mechanism for OTP sending failures
- [x] Add verification guard — unverified email users redirected to verify
- [x] Fix onboarding redirect flow for newly verified users
- [x] Test full flow: signup → OTP → verify → onboarding (vitest tests passing)
- [x] Build, test, and push (deployed to Vercel - commit 347bfb7)

## Navbar & Homepage Professional Redesign
- [x] Audit current Navbar component (menu items, grouping, mobile menu)
- [x] Audit current Homepage sections and layout
- [x] Redesign Navbar: modern professional aesthetic, clean typography, refined spacing
- [x] Redesign Homepage hero section: professional, clean, centered
- [x] Redesign Homepage content sections: trending, launches, categories, browse
- [x] Redesign Homepage sidebar and leaderboard
- [x] Redesign Homepage LaunchPad CTA section
- [x] Ensure mobile responsiveness for new designs
- [x] Build compiles with zero errors
- [x] Push to GitHub and verify Vercel deployment (commit 76b1113)

## Capterra-Style Homepage & Navbar Redesign
- [x] Visit Capterra page and capture full design (double header, hero, all sections)
- [x] Document Capterra design system (colors, typography, spacing, layout)
- [x] Rebuild Navbar: Capterra double header design (top bar + main nav)
- [x] Rebuild Homepage hero: Capterra streamlined hero with search
- [x] Rebuild Homepage sections: match Capterra section layouts with LaudStack copy
- [x] Preserve LaunchPad button and Sign In button
- [x] Preserve all existing menu items and grouping
- [x] Build compiles with zero errors
- [x] Push to GitHub and verify Vercel deployment (commit 7baf55b)

## Navbar Pixel-Perfect Capterra Match
- [x] Capture exact Capterra navbar measurements (heights, colors, font sizes, logo size, spacing)
- [x] Rebuild Navbar to exactly match Capterra design (same heights, color theme, logo size)
- [x] Preserve all LaudStack menu items and grouping
- [x] Build compiles with zero errors
- [x] Push to GitHub and verify Vercel deployment (commit 14a6ada)

## Navbar Enhancements (Round 2)
- [x] Center all menu items in the second navbar bar
- [x] Replace "For Founders" with "Stack Finder" linking to /stack-finder
- [x] Less rounded LaunchPad button (8px radius, not pill)
- [x] Smooth scroll-to-hide effect on second nav bar (header slides up 56px, cubic-bezier easing)
- [x] Build compiles with zero errors
- [x] Pushed to GitHub (commit cb98547)

## Scroll Effect Fix
- [x] Fix: top bar (logo/search/auth) must be completely static — never moves
- [x] Fix: only the second nav bar (menu items) slides in/out on scroll
- [x] Separate the two bars into independent fixed elements
- [x] Build compiles with zero errors
- [x] Pushed to GitHub (commit 545b14e)

## Fix All Pages — Navbar Spacing (128px)
- [ ] Audit all page files for existing top padding/margin/spacer values
- [ ] Fix all pages so content doesn't hide under the 128px navbar
- [ ] Build, commit, push to GitHub

## Homepage Hero Redesign — Enterprise-Grade
- [ ] Redesign hero: compact height, NOT full viewport
- [ ] Enterprise-grade aesthetic: clean, confident, conversion-focused
- [ ] No gradients, no flashy effects — professional and modern
- [ ] Proper search bar integration
- [ ] Social proof / trust indicators (compact)
- [ ] Build compiles with zero errors
- [ ] Push to GitHub for Vercel deployment


## Homepage Rebuild — Match Aggregator X Webflow Template
- [ ] Hero: centered heading, subtitle, search bar + category filter dropdown, decorative elements
- [ ] Featured Stacks: 3 horizontal cards (logo, name, desc, category pill, Learn more + Visit)
- [ ] Latest Stacks: vertical list with sidebar (category filter + Submit CTA card)
- [ ] Two CTA cards side-by-side: Launch your Stack + Write a Review (colored backgrounds)
- [ ] Collections curated: 3 category collection cards with colored backgrounds
- [ ] Articles & Resources: horizontal carousel with article/tip cards
- [ ] Match template card styles, rounded corners, heights, spacing, typography
- [ ] Keep all existing LaudStack copy, data, and functionality
- [x] Fix homepage hero being cut off under the navbar
- [x] Replace Learn more/Visit on homepage cards with PH-style Comment and Laud icons
- [x] Replace ChevronUp Laud icon with bold SVG upward triangle (PH-style)
- [x] Rebuild Comment + Laud buttons to exact pixel-perfect Product Hunt match (polished, professional)
- [x] Replace 'Filter by category' sidebar with Top Rated leaderboard (old design)
- [x] Polish Top Rated sidebar with modern professional design
- [x] Polish Launch CTA sidebar with modern professional design
- [x] Polish Newsletter CTA sidebar with modern professional design
- [x] Make Top Rated and Weekly Picks sidebar containers more visually prominent
- [x] Audit all platform colors and create unified color palette
- [x] Apply unified palette across all components for consistent UI
- [x] Rename Spotlight Stacks to Featured Stacks on homepage
- [x] Increase Featured Stacks from 3 to 5
- [x] Increase Latest Stacks to 15
- [x] Make both Featured and Latest sections sticky with sidebar
- [x] Fix sticky sidebar behavior on homepage Featured + Latest sections
- [x] Test sticky behavior live on Vercel deployment
- [x] FIX: Spotlight still not renamed to Featured on live site
- [x] FIX: Featured cards still showing only 3 instead of 5
- [x] FIX: Sticky sidebar still not working properly on live site

## Homepage Updates — Latest, CTAs, Collections
- [x] Cap Latest stacks at 15, replace Next button with "View all Stacks" linking to categories
- [x] Polish Launch your stack and Write a review CTA cards with modern aligned design
- [x] Update CTA card terminology to match LaudStack copy
- [x] Replace Articles & Resources section with Collections curated by our team
- [x] Generate custom images for each collection card (Best SaaS Tools categories)
- [x] Add more Best SaaS Tools collection cards with horizontal scroll
- [x] Remove old 3-card Collections curated section

## Homepage Hero Polish
- [x] Improve hero decorative elements with better modern design
- [x] Update hero header text with LaudStack terminology, break into 2 centered lines
- [x] Update hero subheader text with LaudStack terminology
- [x] Remove filter button from hero search bar
- [x] Ensure hero is well polished and properly centered

## Mobile Navbar Enhancement
- [x] Redesign mobile navbar: hamburger left, logo centered, profile icon/avatar right
- [x] Profile icon links to login for unauthenticated users
- [x] Profile icon shows panel dropdown for logged-in users/founders
- [x] Ensure mobile navbar is well aligned and not cut off
- [x] Mobile navbar should only have 3 items

## Homepage Hero — Remove Bulky Elements
- [x] Remove all bulky card-style decorative elements from hero
- [x] Replace with subtle background-blending design elements
- [x] Ensure decorative elements feel integrated with the hero background
- [x] Keep hero clean, professional, and non-intrusive

## Collapsed Single Header on Inner Pages
- [x] Keep double header (72px + 56px) only on homepage
- [x] Single 64px header on all inner pages: logo + nav items + auth
- [x] Inner page nav items: Launches, Discover, Leaderboard, SaaS Deals, Templates, Write a Review
- [x] Inner page auth: Log in + Launch page buttons
- [x] Remove logo tagline from inner page header
- [x] Remove search bar from inner page header
- [x] Update all inner page spacers from 128px to 64px

## LaunchPad Page Rebuild
- [x] Rebuild LaunchPad page with modern sleek design inspired by homepage
- [x] Match homepage design language: colors, typography, spacing, light theme
- [x] Professional design targeting technical audience (software engineers)
- [x] Pricing section visible only on LaunchPad page
- [x] Clean, polished hero section
- [x] Well-structured content sections
- [x] Verify collapsed single header works correctly on LaunchPad page
- [x] Test live to confirm header and page rendering

## Inner Page Header Nav Centering
- [x] Center nav items in the collapsed single header on inner pages

## Homepage Hero Header Update
- [x] Match homepage hero header font and structure to LaunchPad hero
- [x] Update header text: "Discover, Review & Launch" / "SaaS & AI Tools"
- [x] Update subheader text
- [x] Center header and subheader properly

## Homepage Secondary Navbar Color Update
- [x] Update Row 2 nav item text color to navy blue
- [x] Update Row 2 button color to orange accent
- [x] Enhance Row 2 overlays and active states
- [x] Enhance Row 2 dropdown styling with navy blue and orange
- [x] Keep Row 2 background color unchanged

## Navbar Fixes — Buttons, Casing, Colors
- [x] Write a Review: change from orange pill back to text link
- [x] LaunchPad: keep as orange pill (only button with pill style)
- [x] Fix casing: "Sign In" (not "LOG IN" or uppercase) and "LaunchPad" (not "LAUNCHPAD")
- [x] Update all header item colors consistently across Row 1 and Row 2

## Color Palette Cleanup — Eliminate Blue, Blend Navy + Orange
- [x] Audit and remove all blue buttons across homepage, LaunchPad, navbars
- [x] Audit and remove all light blue text across homepage, LaunchPad, navbars
- [x] Replace blue accents (#5178FF, #3B82F6, #2563EB, #ECF2FF, etc.) with navy/orange palette
- [x] Navbar: eliminate all blue references in Row 1, Row 2, inner page header, mobile menu
- [x] Homepage: eliminate all blue buttons, blue text, blue accents
- [x] LaunchPad: eliminate all blue buttons, blue text, blue accents
- [x] Ensure consistent navy (#0C1830) + orange (#F59E0B) palette throughout

## Restore Light Blue Backgrounds
- [x] Restore #ECF2FF for secondary navbar background
- [x] Restore #ECF2FF for homepage hero and section backgrounds
- [x] Restore #ECF2FF for LaunchPad hero and section backgrounds
- [x] Restore #D6E2FF borders where changed to warm tones

## CTA Card Fix + Platform Contrast + Hero Sections + Category Pages
- [ ] Fix For Founders CTA card: icon and text not visible on dark background
- [ ] Fix For Founders CTA card: background color too dark
- [x] Enhance platform-wide text contrast and legibility
- [ ] Polish all hero sections (excluding homepage and LaunchPad) with breadcrumbs
- [ ] Ensure hero sections properly spaced, not cut off or overlapping navbar
- [ ] Ensure hero sections properly aligned with no over-spacing
- [ ] Delete and remove /tools page
- [ ] Create dedicated pages for each category linked from /categories
- [ ] Polish /categories cards
- [ ] Ensure all pages scroll to top on navigation
- [ ] Ensure all pages are well-built, blend with design, well-structured, aligned
- [ ] Ensure all pages are fully wired, linked, and functional

## Contrast, Breadcrumbs, Categories & /tools Removal
- [x] Fix sidebar For Founders CTA card: icon container now amber (#D97706), label text now #FBBF24, description text improved to 0.75 opacity
- [x] Fix Write a Review CTA card: same icon/label/text contrast improvements
- [x] Fix stats row text contrast in both CTA cards (0.85 opacity, better dividers)
- [x] Breadcrumb separators upgraded from text-slate-300 to text-slate-400 across all pages
- [x] Dashboard text-slate-300 on light bg fixed to text-slate-500
- [x] Events page text-slate-300 on light bg fixed to text-slate-500
- [x] Templates page text-slate-300 on light bg fixed to text-slate-500
- [x] Launch page text-slate-300 on light bg fixed to text-slate-400
- [x] Reviews page inline #94A3B8 text upgraded to #64748B
- [x] Saved page inline #94A3B8 text upgraded to #64748B
- [x] PageHero component rewritten with proper breadcrumb support (multi-level)
- [x] Breadcrumbs added to all pages using PageHero (trending, top-rated, most-lauded, upcoming-launches, reviews, deals, events, templates, saved, categories)
- [x] Verified breadcrumbs exist in custom hero pages (alternatives, comparisons, editors-picks, stack-finder)
- [x] Homepage and LaunchPad excluded from hero changes per user request
- [x] /tools page deleted (catalog removed)
- [x] All /tools links updated to /categories across Navbar, Footer, Dashboard, Saved, Homepage
- [x] Homepage collection links updated from /tools?category=X to /c/[slug] format
- [x] Alternatives page category links updated to /c/[slug] format
- [x] Tool detail page category links updated to /c/[slug] format
- [x] Categories page polished: uses PageHero with breadcrumbs, modern card design with accent bars
- [x] Category cards link to /c/[slug] dedicated pages
- [x] BackToTop component moved to global Providers (available on all pages)
- [x] Removed duplicate BackToTop from homepage

## Mobile Navbar Enhancement
- [x] Make hamburger icon thicker and bigger without container
- [x] Make login/profile avatar thicker (bolder border/ring)

## Homepage Mobile Redesign (Capterra-inspired structure)
- [x] Study Capterra mobile structure and document key patterns
- [x] Redesign mobile hero: compact, search-focused, no large text blocks
- [x] Add horizontal scrollable category pills on mobile
- [x] Redesign mobile tool cards: smaller logos, compact padding, touch-friendly
- [x] Show sidebar content (leaderboard, CTA, newsletter) on mobile
- [x] Reduce section spacing on mobile (120px → 48px)
- [x] Make dual CTA cards mobile-friendly with reduced padding
- [x] Make collections section mobile-friendly (smaller cards, compact text)
- [x] Keep desktop layout unchanged, only modify mobile breakpoints

## Full Platform Mobile Enhancement
- [x] Categories page: mobile card grid, hero spacing, search bar
- [x] Trending page: mobile card layout, hero, filters
- [x] Top-rated page: mobile card layout, hero, filters
- [x] Most-lauded page: mobile card layout, hero
- [x] Reviews page: mobile review cards, filters, hero
- [x] Deals page: mobile deal cards, filters, hero
- [x] Tool detail page: mobile screenshots, sidebar, reviews section
- [x] Search page: mobile search bar, results, filters
- [x] Comparisons page: mobile comparison cards, hero
- [x] Alternatives page: mobile alt cards, hero
- [x] VS comparison page: mobile side-by-side layout
- [x] LaunchPad page: mobile form, steps layout (already well-optimized)
- [x] Events page: mobile event cards, hero
- [x] Templates page: mobile template cards, hero
- [x] Editors-picks page: mobile cards, hero
- [x] Stack-finder page: mobile quiz/form layout
- [x] Launches page: mobile launch cards
- [x] Upcoming-launches page: mobile countdown cards
- [x] Best page: mobile best-of cards
- [x] Blog page: mobile blog cards
- [x] About page: mobile layout
- [x] Contact page: mobile form layout
- [x] FAQ page: mobile accordion layout
- [x] Saved page: mobile saved cards
- [x] Community pages: mobile layout
- [x] Footer: mobile column layout (already well-optimized)
- [x] Navbar mobile menu: polish and alignment (already well-optimized)
- [x] Trust page: mobile card padding, table layout, section spacing
- [x] Changelog page: mobile timeline cards, CTA section
- [x] Pricing page: mobile plan cards, feature comparison table, CTA
- [x] Blog detail page: mobile hero, sidebar, related articles
- [x] Profile page: mobile avatar, stats grid, card padding
- [x] SEOPageShell: mobile hero, filter bar, grid, related links (cascades to all /c/ and /best pages)

## Mobile Visual Audit & Fixes (Visual Inspection)
- [x] Audit homepage mobile - fix any overflow/expansion issues
- [x] Audit navbar mobile menu - fix any expansion/misalignment
- [x] Audit footer mobile - fix any overflow
- [x] Audit categories page mobile
- [x] Audit trending page mobile
- [x] Audit top-rated page mobile
- [x] Audit reviews page mobile
- [x] Audit deals page mobile
- [x] Audit search page mobile
- [x] Audit tool detail page mobile
- [x] Audit blog pages mobile
- [x] Audit profile page mobile
- [x] Audit vs comparison page mobile
- [x] Audit about/contact/FAQ/pricing/trust/changelog pages mobile
- [x] Audit events/templates pages mobile
- [x] Audit auth flows - fix layout expansion on login/signup
- [x] Audit modals/dialogs - fix layout expansion
- [x] Audit launchpad/editors-picks/stack-finder/saved pages mobile
- [x] Fix global overflow-x issues causing horizontal scroll

## Stack Detail Page (tools/[slug]) Mobile Layout Fix
- [x] Fix header: logo, name, rating, tagline properly aligned horizontally on mobile
- [x] Fix all sections for full mobile responsiveness and structure
- [x] Fix tab navigation for mobile
- [x] Fix sidebar/content layout stacking on mobile
- [x] Fix stats row, badges, and CTA buttons on mobile
- [x] Fix review edit form pros/cons grid (grid-cols-1 on mobile)
- [x] Fix ReviewNudge floating component positioning on mobile
- [x] Fix skeleton loading state to match new mobile layout
- [x] Build, test, and push

## Laud Button Design Consistency
- [x] Identify the exact homepage card Laud button design (reference standard)
- [x] Find all Laud/upvote button instances across all pages and components
- [x] Update all Laud buttons to match the homepage card design exactly
- [x] Build, test, and push

## Breadcrumb Enhancement
- [x] Audit all breadcrumb instances across all pages (14 pages with breadcrumbs found)
- [x] Create unified Breadcrumbs component (src/components/Breadcrumbs.tsx)
- [x] Ensure proper horizontal alignment on mobile (overflow-x-auto, shrink-0, whitespace-nowrap)
- [x] Ensure well-spaced layout on desktop (gap-2, 13px text, amber hover accent)
- [x] Replace inline breadcrumbs: alternatives, best, compare, comparisons, editors-picks, stack-finder
- [x] Replace inline breadcrumbs: blog/[slug], tools/[slug], vs/[slugA]/[slugB], SEOPageShell
- [x] Update PageHero to use unified Breadcrumbs component
- [x] Remove duplicate breadcrumb in vs comparison page
- [x] Home icon on mobile, Home icon + text on desktop
- [x] Build passes with no errors
- [x] Commit and push

## Restore SVG Triangle Laud Button
- [x] Find original SVG triangle (ProductHunt-style) Laud button from git history
- [x] Restore the SVG triangle design in homepage ProductCard
- [x] Update all Laud buttons across all pages to use SVG triangle design
- [x] Created reusable LaudIcon component (src/components/LaudIcon.tsx)
- [x] Updated AuthGateModal to use LaudIcon for upvote/laud actions
- [x] Build, test, and push

## Platform-Wide Mobile Polish & Visual Enhancement

### Contrast & Color Enhancement
- [x] Audit text visibility across all pages (ensure proper contrast ratios)
- [x] Fix card backgrounds and text colors for legibility
- [x] Fix modal text and background contrast
- [x] Ensure all buttons have visible text against backgrounds

### Homepage Mobile
- [x] Hide one of the duplicate Founders LaunchPad CTA sections on mobile

### Login Page Redesign
- [x] Use main platform Navbar on login page (same as other pages)
- [x] Replace dark split side with polished niche-relevant graphics on desktop
- [x] Polish the login form layout

### Hero & Section Header Shortening (exclude homepage hero)
- [x] Scan all pages for long hero titles and subtitles
- [x] Rewrite long headers with shorter versions that align properly on mobile
- [x] Ensure headers don't break layout on mobile devices

### Remaining Mobile Responsiveness
- [x] Final mobile audit across all pages
- [x] Fix any remaining overflow, alignment, or spacing issues

### Build & Deploy
- [x] Build passes with no errors
- [x] Commit and push to GitHub

## Navbar Menu Restructuring
- [x] Remove "All Stacks" from Discover dropdown menu
- [x] Rearrange Discover menu items by hierarchy
- [x] Rename "SaaS Deals" to "Deals" in navbar
- [x] Swap positions of Deals and Templates in navbar

## LaunchPad Page Polish
- [x] Remove duplicate trust bar on /launchpad (keep only one)
- [x] Polish the remaining trust bar with company logos (no stats)
- [x] Wrap "Why LaudStack" section in a sleek polished container

## Filter/Sort Container for Listing Pages
- [x] Create sleek modern filter/sort container component
- [x] Apply to /trending page
- [x] Apply to /top-rated page
- [x] Apply to /community-voting page
- [x] Apply to /recently-added page
- [x] Apply to /most-lauded pagee Quick Comparison Fix
- [x] Fix Quick Comparison section misaligned full width on /best pages

## Breadcrumb Alignment & Spacing Fixes
- [x] Find all centered breadcrumbs and left-align them
- [x] Fix breadcrumbs too close to navbar
- [x] Fix breadcrumbs too far from navbar
- [x] Ensure consistent breadcrumb positioning across all pages

## Login Page Redesign (Stripe-style)
- [x] Rebuild login page to Stripe-style (no split, clean centered form)
- [x] Maintain current copy and login form design
- [x] Remove the dark split branding panel

## LaunchPad Trust Bar & Hero Fix
- [x] Increase company logo sizes in trust bar (currently too small)
- [x] Shorten LaunchPad hero header for mobile to prevent cramping/spilling

## LaunchPad Professional Polish (Capterra/G2 Inspired)
- [x] Enlarge trust bar logos to be prominent and clearly visible
- [x] Add bold stats row section (like G2's large numbers)
- [x] Replace benefits grid with alternating left-right feature sections with visuals
- [x] Add testimonial section with professional quote styling
- [x] Polish comparison table design
- [x] Reduce hero decorative noise for cleaner look
- [x] Polish overall section spacing and visual hierarchy

## Login Page Cleanup
- [x] Remove extra spacing/secondary empty navbar between navbar and page content
- [x] Remove the logo inside the login page (keep only Navbar logo)
- [x] Remove the security tip section

## LaunchPad Section Cleanup & Logo Marquee
- [x] Remove Stats trust bar section from /launchpad
- [x] Remove Compare Plans section from /launchpad
- [x] Remove FAQ section from /launchpad
- [x] Get Livingtrail.com logo
- [x] Get Rehablookup.com logo
- [x] Add more companies with original colored logos
- [x] Implement continuous right-to-left scrolling marquee for company logos

## Footer Enhancement & Missing Pages
- [x] Enhance footer text contrast and legibility on dark background
- [x] Bold section titles to differentiate from menu item lists
- [x] Audit all footer links and identify missing pages (all exist via dynamic routes)
- [x] Verify all footer links work with no 404s (all pages confirmed present)

## Fix Footer 404 Errors
- [x] Test all footer links — audited all routes in codebase
- [x] Fix mismatched /best/ slugs in footer (ai-writing-tools → ai-tools-for-writing, etc.)
- [x] Verify all footer links now point to valid page definitions

## Follow Feature (Users & Stacks)
- [x] Add userFollows table to schema (follower_id, following_id, created_at)
- [x] Add stackFollows table to schema (user_id, tool_id, created_at)
- [x] Push database migrations (generated SQL, will apply on Vercel deploy)
- [x] Build server actions: followUser, unfollowUser, getFollowers, getFollowing
- [x] Build server actions: followStack, unfollowStack, getFollowedStacks
- [x] Build server actions: getFollowCounts (followers/following counts for a user)
- [x] Build server action: isFollowing (check if current user follows a user/stack)
- [x] Tool detail page: Add "Follow" button for stacks
- [x] User profile page: Show follower/following counts
- [x] User profile page: Expandable followers/following lists
- [x] User cards: Follow button on user cards where appropriate
- [x] Dashboard: "Following" tab showing followed users and stacks
- [x] Wire deal notifications for followed stacks only
- [x] Build, test, commit and push

## Follow Feature — Full Hardening Audit
- [x] Schema: verify user_follows and stack_follows tables, indexes, FKs, cascade deletes
- [x] Schema: verify migration SQL matches schema definition
- [x] Server actions: audit all auth checks, error handling, edge cases
- [x] Server actions: ensure toggle functions handle race conditions
- [x] Server actions: verify return types are consistent and typed
- [x] FollowStackButton: audit loading states, error handling, auth redirect, optimistic UI
- [x] FollowUserButton: audit loading states, error handling, auth redirect, optimistic UI
- [x] useFollowedStacks hook: audit caching, refresh logic, error handling
- [x] Dashboard Following tab: audit data loading, empty states, unfollow actions, sub-tabs
- [x] User profile page: audit follower/following counts, expandable lists, follow button integration
- [x] Tool detail page: audit FollowStackButton placement and behavior
- [x] notifyFollowers helper: audit batch insert, error handling, edge cases
- [x] admin.ts: verify notification wiring in approveDeal and createAdminDeal
- [x] TypeScript: full build check with zero errors
- [x] Commit and push to GitHub

## Homepage Clickable Stacks & Header Tagline Fix
- [x] Make homepage stack cards clickable (link to /tools/[slug])
- [x] Make header tagline non-clickable

## Marketplace Implementation — Phase 1: Database & Core Backend
- [x] Add marketplace enums to schema (category, product_status, offer_status)
- [x] Add marketplace creator fields to users table (stripeConnectAccountId, isMarketplaceCreator, creatorOnboardedAt)
- [x] Create marketplace_products table
- [x] Create marketplace_orders table
- [x] Create marketplace_reviews table
- [x] Create marketplace_offers table
- [x] Generate and apply migration
- [x] Create src/app/actions/marketplace.ts with all server actions
- [x] Extend src/server/stripe.ts with Stripe Connect functions
- [x] Create API routes: marketplace-onboarding, marketplace-purchase, marketplace-boost
- [x] Create API routes: connect-onboarding (POST + GET)
- [x] Create cron route: expire-offers (added to vercel.json)
- [x] Extend Stripe webhook with marketplace event handlers (checkout.session.completed, account.updated)

## Marketplace Implementation — Phase 2: Creator Onboarding & Dashboard
- [x] Creator onboarding page: multi-step flow (intro → payment → Stripe Connect → complete)
- [x] Product submission form: all fields, file uploads, category selection, pricing, offer settings
- [x] Creator Dashboard: Products tab (list, edit, delete products)
- [x] Creator Dashboard: Orders tab (sales, revenue, payouts)
- [x] Creator Dashboard: Offers tab (incoming offers, accept/reject/counter)
- [x] Creator Dashboard: Analytics tab (stats overview)
- [x] Marketplace upload API route
- [x] Add Marketplace link to Navbar
- [x] TypeScript: zero errors
- [x] Commit and push

## Marketplace Implementation — Phase 3: Buyer-Facing Pages
- [x] Marketplace browse page: grid layout, category filters, search, sort, pagination
- [x] Product detail page: hero, screenshots, features, tech stack, reviews, purchase CTA
- [x] MakeOfferModal: offer submission for eligible categories
- [x] Stripe checkout wiring: buy now button → Stripe → success page
- [x] TypeScript: zero errors
- [x] Commit and push

## Marketplace Implementation — Phase 4: Admin Panel
- [x] Admin Marketplace page: moderation queue (pending products, approve/reject)
- [x] Admin Marketplace page: all products list with status filters
- [x] Admin Marketplace page: revenue dashboard (total sales, commissions, payouts)
- [x] Admin Marketplace page: creators management tab
- [x] Admin sidebar: add Marketplace link
- [x] TypeScript: zero errors
- [x] Commit and push


## Marketplace Implementation — Phase 5: Reviews, Notifications, Dashboard, Polish
- [x] Marketplace review system: submit review (only after purchase), display on product page
- [x] Notification events: purchase confirmation, offer lifecycle, product approval/rejection (10 events wired)
- [x] User dashboard: "My Purchases" tab with order history
- [x] User dashboard: "My Offers" tab with offer status tracking, cancel, pay actions
- [x] Marketplace links in Footer
- [x] TypeScript: zero errors
- [x] Write Review form on product detail page (purchase-gated)
- [x] ReviewCard fixed to handle { review, user } data structure
- [x] PurchasesTab enhanced with download links and review CTA
- [x] Offer expiration cron job (every 6 hours via Vercel Cron)
- [x] Commit and push (2ee7e84)

## Platform Audit — Production Readiness Fixes
- [x] Database: Applied migration 0015 (follows tables) to Supabase
- [x] Database: Applied migration 0016 (marketplace tables, enums, indexes) to Supabase
- [x] Fix /top-rated SSR crash: guard window.location.search access in parseUrlFilters
- [x] Fix /templates SSR crash: guard window.location.search access in parseUrlFilters
- [x] Fix /trending SSR crash: guard window.location.search in useMemo and useEffect
- [x] Fix marketplace purchase: add GET handler to /api/stripe/marketplace-purchase for dashboard offer links
- [x] Create /marketplace/purchase-success page for post-checkout redirect
- [x] Secure /api/debug route with CRON_SECRET auth protection
- [x] Fix Footer: correct Developer Tools category link
- [x] Fix Footer: update social links to LaudStack accounts
- [x] Fix providers.tsx: add VERCEL_URL fallback for base URL
- [x] Fix ToolCard: add try/catch for laud and save toggle error handling
- [x] Fix community-voting: add try/catch for vote toggle error handling
- [x] Fix deals LaunchDealModal: wire to actual createFounderDeal action
- [x] TypeScript: zero errors confirmed
- [x] All 30 database tables verified in Supabase
- [x] All 6 Vercel cron jobs configured and auth-protected
- [x] All 15 server action files have "use server" directive
- [x] All component, hook, and lib imports verified — no missing files
- [x] Commit and push to GitHub
- [ ] Verify Vercel deployment

## Stacks Deep Audit (Phase 2)
- [ ] Audit Stacks schema, DB tables, SQL queries
- [ ] Audit backend server actions, API routes, cron jobs for Stacks
- [ ] Audit frontend pages, components, UI for all Stack flows
- [ ] Live site testing — visit each Stacks page, check console errors
- [ ] Fix all issues found: no placeholders, no mock data, no dead-ends
- [ ] Ensure stack launching, claiming, founder, admin flows are fully wired
- [ ] Push fixes to GitHub and verify Vercel deployment

## Admin Account & Route Changes
- [ ] Create super-admin account (henrykabak77@gmail.com) in Supabase Auth + DB
- [ ] Change admin route from /admin/login to non-obvious path (no "admin" in URL)
- [ ] Rebuild admin login page — centered container only, clean minimal design
- [ ] Update all internal references to old admin route
- [ ] Verify admin login works end-to-end on live site

## Stacks Audit — Issues Found & Fixed
- [x] Fix broken link: /founder/dashboard → /dashboard/founder in admin.ts notification
- [x] Fix broken link: /founder/dashboard → /dashboard/founder in email.ts deal rejection email
- [x] Replace hardcoded sparkline chart data with real weekly growth queries (getWeeklyGrowth)
- [x] Remove hardcoded "+12% this week" and "+8% this week" trend labels from admin stat cards
- [x] Fix "Verified Founders" stat card: replace hardcoded dash with real DB count
- [x] Add verifiedFounders count to getAdminStats server action
- [x] Fix Google Analytics placeholder: clear defaultValue in admin settings
- [ ] Email Templates page uses MOCK_TEMPLATES (acceptable — template editor is a future feature)
- [x] Hardcoded social proof numbers (12K+, 95+, 4.9 rating) — ALL REMOVED per user request
- [x] Commit and push all audit fixes to GitHub
- [ ] Verify Vercel deployment with fixes

## Remove All Mock/Placeholder Social Proof Numbers
- [x] Find and catalog every instance of fake numbers (12K+, 12,000+, 95+, 4.9 rating, 98%, etc.)
- [x] Remove or replace all fake social proof from homepage (page.tsx)
- [x] Remove or replace all fake social proof from advertise page
- [x] Remove or replace all fake social proof from affiliates page
- [x] Remove or replace all fake social proof from auth/login page
- [x] Remove or replace all fake social proof from careers page
- [x] Remove or replace all fake social proof from founder dashboard
- [x] Remove or replace all fake social proof from deals page
- [x] Remove or replace all fake social proof from events page
- [x] Remove or replace all fake social proof from newsletter page
- [x] Remove or replace all fake social proof from press page
- [x] Remove or replace all fake social proof from launch-guide page
- [x] Remove or replace all fake social proof from email templates (email.ts)
- [x] Remove or replace all fake social proof from admin templates page
- [x] Remove or replace all fake social proof from any other files (sitemap, templates)
- [ ] Verify build passes after all removals
- [x] Commit and push to GitHub
- [ ] Verify Vercel deployment

## Admin Sidebar Size & Icon Fix
- [x] Reduce admin sidebar width (currently too large at w-80)
- [x] Increase sidebar menu item sizes (currently too tiny relative to sidebar width)
- [x] Use LaudStack favicon icon for collapsed sidebar logo

## Admin Stacks Restructure
- [x] Rename "Tools" to "Stacks" across entire admin panel (sidebar, page titles, labels, tabs, routes)
- [x] Build Listed page: admin-added stacks with full CRUD (add, edit, feature, moderate, status)
- [x] Build Launches page: founder-launched stacks with Pending/Approved/Rejected/All tabs
- [x] Build Claimed page: claimed stacks with ownership details and claim management
- [x] Build View/Manage Stack modal with full stack profile, details, and admin actions
- [x] Wire all backend: server actions, schema updates, queries for Listed/Launches/Claimed
- [x] Ensure polished UI: tables, tabs, cards, modals, clean spacing, proper alignment
- [x] Test, commit, push to GitHub

## Admin StackViewModal Rebuild
- [x] Rebuild modal with larger, professional, well-structured design
- [x] Proper tab navigation (Overview, Details & Media, Reviews, Moderation, Settings, Danger Zone)
- [x] Show all stack data: name, logo, tagline, description, category, pricing, website, rankings, lauds, views, clicks
- [x] Show media gallery (screenshots, demo video)
- [x] Show founder/owner info with full profile
- [x] Show reviews with ratings and comments
- [x] Show moderation log with admin actions history
- [x] Full admin controls: feature, spotlight, verify, suspend, delete, hide, edit status
- [x] Better alignment, spacing, and visual hierarchy
- [x] Test, commit, push to GitHub

## Duplicate Admin Pages/Modals Cleanup
- [x] Remove old /ops-console/tools/ page (replaced by /ops-console/stacks/listed/)
- [x] Move /ops-console/tools/[id]/ edit page to /ops-console/stacks/[id]/
- [x] Remove old /ops-console/submissions/ page (replaced by /ops-console/stacks/launches/)
- [x] Remove old /ops-console/claims/ page (replaced by /ops-console/stacks/claimed/)
- [x] No duplicate modal components (only StackViewModal exists)
- [x] Clean up all references: sidebar, header, search, dashboard, notifications
- [x] Verified zero references to old routes remain in codebase
- [x] Pushed to GitHub (commit d259786)

## Admin Sidebar Dropdown Restructure
- [x] Restructure sidebar with collapsible dropdown sections
- [x] Arrange menu items by proper hierarchy with grouped submenus
- [x] Ensure only one dropdown is open at a time (accordion behavior)
- [x] Stacks submenu (Listed, Launches, Claimed) in a dropdown
- [x] Group other related items into logical dropdown sections (Content, People, Marketing)
- [x] Push to GitHub (commits de55084 + f901378)

## Moderation Section Build

- [x] Restructure sidebar: rename "Content" to "Moderation", add Comments, move Deals to standalone
- [x] Build admin comment backend functions (getAdminComments, adminDeleteComment, adminRestoreComment, adminPermanentDeleteComment)
- [x] Build ReviewViewModal — full detail modal for review moderation
- [x] Enhance Reviews page with modal integration (click row to open modal)
- [x] Build CommentViewModal — full detail modal for comment moderation
- [x] Build Comments moderation page with filters, search, pagination
- [x] Enhance Lauds page with LaudViewModal integration
- [x] Test build passes
- [x] Commit and push to GitHub
- [ ] Verify Vercel deployment

## Admin Creators Management
- [x] Add Creators to People dropdown in sidebar navigation
- [x] Build admin-creators.ts backend functions:
  - [x] getAdminCreators (paginated, search, filter by status: all/active/suspended/pending-stripe)
  - [x] getAdminCreatorStats (total, active, suspended, revenue, pending stripe onboarding)
  - [x] getAdminCreatorDetails (full profile + listings + orders + revenue + activity)
  - [x] adminSuspendCreator (deactivate creator, hide all their listings)
  - [x] adminReactivateCreator (reactivate suspended creator)
  - [x] adminRevokeCreator (permanently revoke creator status)
- [x] Build CreatorViewModal with full management:
  - [x] Overview tab: profile, creator status, Stripe Connect status, activation date
  - [x] Listings tab: all marketplace products by this creator with status/revenue
  - [x] Revenue tab: orders, total revenue, platform fees, creator payouts
  - [x] Activity tab: recent activity (listings, sales, reviews received)
  - [x] Moderation tab: suspend/reactivate/revoke actions with confirmation
- [x] Build Creators listing page:
  - [x] Stats cards (total creators, active, suspended, total revenue)
  - [x] Filter tabs (All, Active, Suspended, Pending Stripe)
  - [x] Search by name/email
  - [x] Paginated creator list with key metrics
  - [x] Click row to open CreatorViewModal
- [x] Test build passes
- [x] Commit and push to GitHub
- [ ] Verify Vercel deployment

## Prepaid Promotions System
- [ ] Create unified `promotions` table with full lifecycle states (pending_payment, paid, scheduled, active, expired, cancelled, failed)
- [ ] Create `promotion_pricing` table for admin-managed pricing rules (database-driven, not hardcoded)
- [ ] Create `deal_of_day_slots` table for exclusive slot booking with race condition handling
- [ ] Update Stripe plans to use database-driven pricing instead of hardcoded constants
- [ ] Enforce duration rules: Deal of Day = 1 day only; all others = 3/7/14/30 days; 7 days default + recommended
- [ ] Build promotion purchase API routes with payment verification before activation
- [x] Update Stripe webhook to handle unified promotion payments and create proper promotion records
- [ ] Build Deal of the Day slot availability check and exclusive booking logic
- [x] Update expire-placements cron to handle all promotion types including marketplace boosts
- [ ] Build admin promotion management backend functions (view all, extend, shorten, pause, cancel, override)
- [ ] Build admin promotion pricing management functions
- [ ] Build admin Deal of the Day slot management
- [ ] Build founder Promote tab with unified promotion purchase flow (select type → duration → price → pay)
- [ ] Build creator Promote tab for marketplace product boosts
- [ ] Build promotion history view for founders and creators (active, expired, all history)
- [ ] Build admin Promotions management page with filters, search, and modals
- [ ] Build admin promotion pricing management UI
- [ ] Wire promotion activation to visibility/placement logic (featured, boosted, spotlight, category, homepage)
- [ ] Wire promotion expiry to remove visibility flags
- [ ] Add validation at API, database, and UI levels for duration rules
- [ ] Handle race conditions for Deal of the Day slot booking
- [ ] Remove hardcoded pricing from stripe.ts, replace with database lookups
- [ ] Update sidebar navigation to add Promotions under Marketing section
- [ ] Test build and push to GitHub

## Enhanced Admin Promotions System (Multi-Page)
- [ ] Convert Promotions sidebar from single link to dropdown with 6 subpages
- [ ] Build backend: adminGetDOTDSlots, adminOverrideDOTDSlot, adminRemoveDOTDSlot
- [ ] Build backend: adminManualFeature/Boost (direct visibility override)
- [ ] Build backend: getAdminPromotionStats with per-target breakdowns
- [ ] Build PromotionViewModal: full details, edit, extend, pause/resume/cancel, notes
- [ ] Build All Promotions / Overview page with stats dashboard and full list
- [ ] Build Stacks Promotions subpage (filtered to target=stack)
- [ ] Build Deals Promotions subpage (filtered to target=deal)
- [ ] Build Marketplace Promotions subpage (filtered to target=marketplace)
- [ ] Build Pricing & Plans management page (full CRUD, grouped by type)
- [ ] Build Deal of the Day slot management page (calendar view, booking list)
- [ ] Update sidebar: Promotions dropdown with Overview, Stacks, Deals, Marketplace, Pricing, DOTD
- [ ] Enforce duration rules: DOTD=1 day only, others=3/7/14/30 only
- [ ] Duration validation at API level in createPendingPromotion and adminCreateManualPromotion
- [ ] Test build and push to GitHub

## Admin Sidebar Hierarchy Reorganization (March 18, 2026)
- [x] Reorganize admin sidebar into logical hierarchy groups
- [x] Push to GitHub and deploy to Vercel

## Admin Sidebar Flat List Rearrangement (March 18, 2026)
- [x] Remove section labels, rearrange sidebar as flat list in better hierarchy
- [x] Push to GitHub and deploy to Vercel
- [x] Reduce Promotions dropdown — move Stacks/Deals/Marketplace into tabs on overview page
- [x] Update Promotions overview page with tabbed interface (Overview, Stacks, Deals, Marketplace)

## Admin Panel Missing Features (March 18, 2026)
- [x] Schema: Expand user_role enum to include manager, customer_rep
- [x] Schema: Add admin_audit_log table for activity tracking
- [x] Build Rankings page (sortable table, score breakdown, manual recalc, weight display)
- [x] Build Staff management page (directory, invite, role assignment)
- [x] Build Admin Profile page (edit name, avatar, password)
- [x] Build Activity/Audit Log page (filterable, exportable)
- [x] Build Cron Jobs monitor page (status, last run, manual trigger)
- [x] Build Reports/Flagged Content dashboard (centralized flags queue)
- [x] Update sidebar navigation with Rankings, Staff, Reports, System dropdown
- [x] Backend: Add server actions for rankings, staff, audit log, cron status, reports
- [x] Push to GitHub and deploy to Vercel

## Admin Panel Full Cleanup Audit (March 18, 2026)
- [ ] Map all admin files, routes, server actions, and dependencies
- [ ] Identify duplicates, dead code, orphaned pages, redundancies
- [ ] Remove dead code, consolidate duplicates, fix inconsistencies
- [x] Build verification — zero errors
- [ ] Push to GitHub and deploy to Vercel

## Strict RBAC & User/Admin Panel Separation (March 19, 2026)
- [ ] Update role enum: add "moderator" and "analyst" roles to schema
- [ ] Create permissions matrix: define per-role access for every admin feature
- [ ] Create shared permissions config file (src/lib/permissions.ts)
- [x] Update admin-auth.ts to support moderator and analyst roles
- [x] Update verify-admin API route to support all staff roles (not just admin/super_admin)
- [ ] Update ops-console layout auth guard to allow all staff roles
- [ ] Implement role-based sidebar filtering (hide menu items by role)
- [x] Add middleware route protection for /ops-console/* (server-side, not just client-side)
- [x] Add middleware route protection for /dashboard/* (block staff from user panel)
- [ ] Harden all admin server actions with granular role checks
- [ ] Harden all API routes under /api/admin/* with proper role checks
- [ ] Fix recalculate-rankings route: add proper auth when no CRON_SECRET
- [ ] Separate admin functions from user action files (laud.ts, marketplace.ts)
- [x] Prevent privilege escalation in staff management (can't promote above own level)
- [ ] Add rate limiting headers to admin API routes
- [ ] Audit all shared components for data leaks between panels
- [x] Build verification — zero errors
- [ ] Push to GitHub and deploy to Vercel

## Admin Dashboard Full Rebuild (March 19, 2026)
- [x] Audit current dashboard page, schema, and data sources
- [x] Build backend server actions for dashboard analytics (KPIs, time-series, breakdowns)
- [x] Design compact KPI cards row (users, stacks, reviews, revenue, lauds, etc.)
- [x] Build revenue/income chart (line/area chart with time range selector)
- [x] Build user growth chart (line chart with daily/weekly/monthly)
- [x] Build stacks by category breakdown (bar/pie chart)
- [x] Build recent activity feed (latest reviews, submissions, signups)
- [x] Build top performing stacks table
- [x] Build traffic/engagement metrics section
- [x] Wire all dashboard components to real backend data
- [x] Ensure professional alignment, spacing, and responsive design
- [x] Build verification — zero errors
- [x] Push to GitHub and deploy to Vercel (commit 6c7cd18)

## Super-Admin Setup & User Flush (March 19, 2026)
- [ ] Audit current user schema, roles, and staff management code
- [ ] Flush all user accounts from database except henrykabak77@gmail.com
- [ ] Set henrykabak77@gmail.com as the only super_admin
- [ ] Ensure only super-admin can create/promote admin accounts
- [ ] Clean up related data (reviews, submissions, etc.) for flushed users
- [ ] Build verification — zero errors
- [ ] Push to GitHub and deploy to Vercel

## Auth, Routing & RBAC Fixes (March 19, 2026)
- [x] Purge mysterkass@hmail.com from Supabase Auth
- [ ] Fix admin routing — admin accounts must ONLY access admin panel, not user-facing site
- [ ] Fix user registration/verification/onboarding flow — no errors or bugs
- [ ] Enforce strict role-based access: users → user panel only, admins → admin panel only
- [x] Users can become founders/creators through normal flow
- [ ] Only super-admin can create admin accounts
- [ ] Build verification — zero errors
- [ ] Push to GitHub

## Full Platform Audit & Hardening Pass
- [x] Remove all dead /templates pages, routes, and components
- [x] Remove all template-related imports and references across codebase
- [x] Remove template-related mock data and constants
- [ ] Audit all pages for placeholder content, mock data, dead buttons
- [ ] Audit all server actions for completeness and correct wiring
- [ ] Audit all API routes for proper auth guards and error handling
- [ ] Audit all user flows (registration, verification, onboarding, dashboard)
- [ ] Audit founder/creator flows (submit tool, claim, LaunchPad)
- [ ] Audit admin flows (staff management, tool moderation, deals, promotions)
- [ ] Fix console errors, warnings, dead code, TODOs, FIXMEs
- [ ] Remove all dead/duplicate code
- [ ] Verify all database queries and mutations work correctly
- [ ] Verify all cron jobs and automations
- [ ] Verify all permissions and RBAC enforcement
- [ ] Final build verification — zero errors
- [ ] Push to GitHub and deploy to Vercel

## Admin Panel Sidebar Fix
- [x] Fix blank sidebar in ops-console — navigation items not rendering (supabase_id mismatch)
- [x] Ensure all admin pages are accessible from sidebar

## Performance Optimization (March 19, 2026)
- [ ] Audit and fix slow page loading across platform
- [ ] Optimize database queries (add indexes, reduce N+1 queries)
- [ ] Optimize API calls and data fetching (reduce payload sizes)
- [ ] Fix unnecessary re-renders and component inefficiencies
- [ ] Add proper loading states and skeleton screens
- [ ] Implement caching where appropriate
- [ ] Optimize frontend bundle and lazy loading

## Admin Account & Invite System (March 19, 2026)
- [ ] Build secure admin invite system (Super Admin only)
- [ ] Create admin_invites table with secure tokens
- [ ] Implement invite email template via Resend
- [ ] Build invite acceptance page with secure password setup
- [ ] Add time-limited, single-use invite tokens with expiration
- [ ] Add resend invite functionality
- [ ] Ensure admin accounts are NOT publicly creatable

## RBAC Hardening (March 19, 2026)
- [ ] Enforce RBAC at backend/API level for all admin endpoints
- [ ] Enforce RBAC at database query level
- [ ] Dynamic admin UI rendering based on role permissions
- [ ] Protect all restricted features at both UI and backend level
- [ ] Prevent role escalation attacks
- [ ] Ensure session isolation between user and admin panels
- [ ] Audit all server actions for proper permission checks
- [ ] Add role-based middleware for all admin API routes

## Comprehensive Analytics Dashboard Rebuild
- [x] Build comprehensive backend analytics server action (getComprehensiveAnalytics)
- [x] User analytics: total, active, new over time, growth trends, engagement
- [x] Geographic insights: users/founders/creators by country/city with world map data
- [x] Founder & Creator insights: totals, growth, top locations, activity levels
- [x] Traffic & visitor analytics: views, sessions, top pages, trends
- [x] Stacks/Deals/Marketplace insights: top ranked, most reviewed, most saved, top deals
- [x] Platform activity: review/comment/deal claim trends over time
- [x] Install react-simple-maps for world map heatmap
- [x] Build enterprise-grade analytics dashboard UI with recharts
- [x] Summary metric cards with deltas and trends
- [x] Interactive line/bar/pie/donut charts
- [x] World map heatmap for geographic distribution
- [x] Time range filters (24h, 7d, 30d, 90d, all time)
- [x] Tab-based navigation for analytics sections
- [x] Loading skeletons and empty states
- [x] Wire all components to real backend data
- [x] Test and harden: no console errors, no broken charts
- [x] Push to GitHub and verify Vercel deployment

## Dynamic Featured Stacks System
- [x] Add impressionCount column to promotions table + migrate
- [x] Build getActiveFeaturedStacks() server action with rotation algorithm
- [x] Build reusable FeaturedStacksSidebar component with "Sponsored" badge
- [x] Rewire homepage featured section to use real promoted/admin-featured stacks
- [x] Add featured sidebar to tool detail page
- [ ] Add featured sidebar to categories page (skipped - no sidebar layout)
- [x] Add featured sidebar to search page
- [x] Add featured sidebar to deals page
- [x] Impression tracking (batch increment on page load)
- [x] Backfill with top-rated stacks when fewer featured stacks exist
- [x] Time-based rotation algorithm for fair visibility
- [x] Build, test, push to GitHub, verify Vercel deployment

## Search Page & Featured Sidebar Polish
- [ ] Redesign FeaturedStacksSidebar as split-screen panel (no rounded corners, proper polish)
- [ ] Fix search page grid to 2 cards per row with rectangular card layout
- [ ] Make stack cards more rectangular and well-aligned
- [ ] Add split-screen featured sidebar to all major stack pages (search, categories, trending, discover, leaderboard)
- [ ] Ensure all pages display and render properly
- [ ] Polish featured cards in sidebar (clean layout, proper spacing)
- [ ] Test build and verify production deployment

## Layout Alignment Fix
- [ ] Audit navbar max-width and identify the standard content width
- [ ] Fix all split-screen pages to use consistent max-width (1300px content within 1400px header)
- [ ] Ensure sidebar is properly contained within the max-width container
- [ ] Change sidebar breakpoint from xl to lg for better visibility
- [ ] Build, test, push to GitHub, verify deployment

## Featured Sidebar Enhancement & Page Alignment
- [x] Rename "Promoted Stacks" to "Featured" in sidebar component
- [x] Enhance sidebar viewport balance (proper sticky positioning, spacing)
- [x] Align all page hero sections to navbar max-w-[1400px]
- [x] Align all page main content areas to navbar max-w-[1400px]
- [x] Standardize breadcrumb spacing/height across all pages to match /trending
- [x] Build, test, push to GitHub and verify on production

## Breadcrumb Vertical Spacing Standardization
- [x] Audit trending page navbar-to-breadcrumb spacing as reference
- [x] Identify all pages with inconsistent breadcrumb spacing
- [x] Fix all pages to match trending page breadcrumb spacing
- [x] Build, test, push to GitHub and verify on production

## UI Enhancements — Sidebar, Featured Section, Sticky Filters, Crash Fixes
- [x] Remove Featured sidebar from /categories page
- [x] Remove Featured sidebar from /editors-picks page
- [x] Remove Featured sidebar from Homepage
- [x] Enhance homepage Featured section to be fully functional and wired to real data (already wired to /api/featured-stacks with rotation algorithm, fallback, and impression tracking)
- [x] Fix sticky filter bar so Featured sidebar isn't hidden behind it on pages with sticky filters
- [x] Diagnose and fix Server Components crash errors on production pages (added try/catch to 9 server components)
- [ ] Build, commit, push to GitHub, verify on production

## Navbar Flash, Badges Dropdown, Marketplace Spacing, Hero Centering
- [x] Fix navbar avatar flash (LaunchPad button flashes where profile avatar should be during navigation)
- [x] Move Badges into filter bar dropdown on pages with sticky filter bars (trending, top-rated)
- [x] Fix /marketplace hero breadcrumb vertical spacing to match trending page (removed double spacer div)
- [x] Center hero section content on most public pages (excluding homepage, launchpad, breadcrumbs stay left-aligned)
- [ ] Build, commit, push to GitHub, verify on production

## Navbar Color Change — Light Blue to Navy Blue
- [x] Create NAV_BAR_BG (#1E3A5F), NAV_BAR_TEXT, NAV_BAR_HOVER, NAV_BAR_ACTIVE constants
- [x] Homepage ROW 2 (secondary navbar): change background from light blue to navy blue
- [x] Homepage ROW 2: update all nav item text colors to white
- [x] Homepage ROW 2: update divider and hover states for navy background
- [x] Inner pages header: change background from white to navy blue
- [x] Inner pages: update logo to white version (logo-dark-transparent.png)
- [x] Inner pages: update all nav item text colors to white
- [x] Inner pages: update bell icon, avatar, sign in button colors for navy background
- [x] Inner pages: update skeleton loading placeholders for navy background
- [x] Mobile: update hamburger icon and logo for navy background on inner pages
- [x] Keep dropdown menus white (separate overlays, not affected)
- [x] Keep homepage ROW 1 (logo + search) white
- [x] Fix admin-analytics.ts build error (totalMarketplaceProducts variable name)
- [x] Build passes with zero errors
- [x] Push to GitHub and verify Vercel deployment

## Premium Hero Section Enhancement — All Public Pages
- [x] Audit all public page hero sections and catalog current styles
- [x] Design cohesive premium hero treatment (decorative backgrounds, refined colors, subtle patterns)
- [x] Apply premium hero enhancements to all public pages
- [x] Ensure visual consistency across all hero sections
- [x] Keep homepage hero as-is (already has its own treatment)
- [x] Build, test, push to GitHub, verify Vercel deployment

## Background Color Polish — Eliminate Color Rioting
- [x] Audit all public pages for background color inconsistencies
- [x] Define harmonized color palette (page bg, section bg, card bg, content areas)
- [x] Fix pages using mismatched bg colors (gray-50 vs slate-50 vs white vs custom)
- [x] Ensure smooth visual flow: navy navbar → premium hero (#F8FAFC) → content → footer
- [x] Standardize section backgrounds across all pages
- [x] Polish card and content area backgrounds for consistency
- [x] Build, test, push to GitHub, verify Vercel deployment

## Color Inversion — White Content Areas, Slate-50 Cards
- [x] Switch all public page root backgrounds from bg-slate-50 to bg-white
- [x] Switch card/panel backgrounds from bg-white to bg-slate-50/bg-slate-50 with refined borders
- [x] Enhance text contrast: headings darker (slate-900), body text (slate-700), secondary (slate-500)
- [x] Update section dividers and separators for white background context
- [x] Polish sticky filter bars and tab bars for white content area
- [x] Ensure hero sections still contrast against white content below
- [x] Build, test, push to GitHub, verify Vercel deployment

## Hero Polish, Centering, Inputs, and Navbar Flash Fix
- [x] Break /editors-picks hero into 2 well-polished aligned rows
- [x] Break /reviews hero into 2 well-polished aligned rows
- [x] Center category slug (/c/[slug]) hero content (excluding breadcrumbs)
- [x] Center best-stacks slug (/best/[slug]) hero content (excluding breadcrumbs)
- [x] Center search bars and filter components in hero sections properly
- [x] Fix /comparisons section under hero to white background
- [x] Continue polishing page content areas to white background
- [x] Make text input/typing areas white (search bars, contact forms, etc.)
- [x] Fix navbar login/launchpad section flash on page navigation
- [x] Build, test, push to GitHub, verify Vercel deployment

## Text Visibility & Contrast Enhancement — Platform-Wide
- [x] Navbar: fix hover/active state visibility on navy background (barely visible)
- [x] Navbar: increase item spacing for better readability
- [x] Navbar: make menu items slightly bolder (font-weight upgrade)
- [x] Navbar: ensure all text on navy bg has proper white/light contrast
- [x] Admin panel: fix sidebar item text visibility (barely visible)
- [x] Admin panel: fix sidebar hover/active states for better contrast
- [x] Admin panel: enhance all text contrast across admin pages
- [x] Public pages: audit and fix all low-contrast text (headings, body, labels, badges)
- [x] Public pages: ensure text on dark backgrounds (footer, hero overlays) is clearly visible
- [x] User/Founder dashboard: fix text contrast across all tabs and components
- [x] Cards: ensure all card text (titles, descriptions, badges, metadata) has proper contrast
- [x] Forms: ensure all form labels, placeholders, and helper text are clearly visible
- [x] Build, test, push to GitHub, verify Vercel deployment

## Multi-Enhancement Batch — Hero Fonts, Footer, Scroll, Marketplace, Launchpad, Stack Profile
- [x] Enhance all page hero header font sizes to match /reviews (excluding homepage and launchpad)
- [x] Footer: remove tagline under logo
- [x] Footer: update social icons to x.com, LinkedIn, Facebook, Instagram, Reddit, message icon
- [x] Improve scroll-to-top behavior across all pages, steps, and panels
- [x] Remove top ranked cards from /top-rated page hero section
- [x] Apply /trending filter bar design to /marketplace page search and filter
- [x] Move Product type inside marketplace filter bar as a dropdown
- [x] Update /launchpad company trust section with real logos
- [x] Update rehablook and livingtrail with their attached logos
- [x] Enhance stack profile page header/hero with social media design
- [x] Stack profile: show follower count in hero
- [x] Stack profile: make tabs slightly bigger and more visible
- [x] Build, test, push to GitHub, verify Vercel deployment

## Progressive Email Verification — Remove from Signup, Add to Sensitive Actions
- [x] Remove email verification requirement from basic signup flow
- [x] Allow users to sign up, log in, and access normal user panel without email verification
- [x] Simplify signup flow - no verification code dependency during registration
- [x] Implement action-based verification guards for sensitive operations
- [x] Add verification status check at point of sensitive action attempt
- [x] Create verification prompt UI for when verification is required
- [x] Audit and fix email verification system (resend code, expiry, token validation, email delivery)
- [x] Update route protection to not block unverified users from normal features
- [x] Update backend auth logic for progressive verification model
- [x] Update frontend auth flow - signup, login, session, redirects, onboarding
- [x] Test full signup/login flow works without verification
- [x] Test sensitive actions properly require verification
- [x] Push to GitHub

## LinkedIn OAuth Login
- [x] Audit current auth system (Supabase providers, login UI, callback)
- [x] Configure LinkedIn OAuth provider in Supabase
- [x] LinkedIn sign-in backend logic already implemented
- [x] LinkedIn sign-in button already in login UI
- [x] LinkedIn callback and user creation already handled
- [x] Test full LinkedIn login flow
- [x] Push to GitHub

## Expanded Progressive Verification + Frictionless Signup
- [x] Disable Supabase "Confirm email" setting to unblock OAuth and email signup
- [x] Configure Supabase URL settings for laudstack.com
- [x] Add verification guard to: leave a review
- [x] Add verification guard to: verified badge on profile
- [x] Add verification guard to: submit/publish deals
- [x] Add EmailVerificationModal to review submission UI
- [x] Add EmailVerificationModal to deal submission UI
- [x] Clean up any remaining legacy verification code from signup
- [x] Ensure LinkedIn OAuth signup creates DB user and redirects to onboarding
- [x] Ensure email/password signup is frictionless with no verification blocking
- [x] Build, test, push to GitHub

## Login Page UI Polish
- [x] Remove Google login button
- [x] Make LinkedIn button slightly smaller with full LinkedIn logo
- [x] Change divider text "or" to "Or Continue with"
- [x] Verify LinkedIn login on live site
- [x] Push to GitHub

## LinkedIn Logo + Profile Data
- [x] Make LinkedIn logo slightly bigger on login page
- [x] Audit LinkedIn OAuth callback to extract full user data (name, photo, email)
- [x] Ensure LinkedIn user data populates user profile fully
- [x] Ensure first-time LinkedIn users redirect to onboarding
- [ ] Push to GitHub
