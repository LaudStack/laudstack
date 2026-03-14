# LaudStack TODO

## Phase 1 — Authentication (Manus OAuth)
- [ ] Replace mock AuthContext with real Manus OAuth (useAuth from _core)
- [ ] Update Navbar to use real auth state and login/logout
- [ ] Update SignIn page to redirect to Manus OAuth
- [ ] Update all pages that use useAuth to use real auth hook
- [ ] Add role field support (user/admin) in auth context

## Phase 2 — Database Schema
- [ ] Add tools table to drizzle schema
- [ ] Add reviews table to drizzle schema
- [ ] Add deals table to drizzle schema
- [ ] Add tool_submissions table to drizzle schema
- [ ] Add saved_tools table to drizzle schema
- [ ] Add upvotes table to drizzle schema
- [ ] Run db:push to sync schema

## Phase 3 — Backend tRPC Procedures
- [ ] Tools CRUD procedures (list, get, create, update, delete)
- [ ] Reviews CRUD procedures (list, create, delete)
- [ ] Deals CRUD procedures (list, create, update)
- [ ] Tool submissions procedures (submit, list, approve/reject)
- [ ] Saved tools procedures (save, unsave, list)
- [ ] Upvote procedures (upvote, remove, count)
- [ ] Search procedure with filters
- [ ] Admin procedures (stats, user management, tool management)

## Phase 4 — Wire Frontend to Backend
- [ ] Homepage: wire trending, new launches, browse to real data
- [ ] Tool detail page: wire to real tool data + reviews
- [ ] Search page: wire to real search procedure
- [ ] Dashboard: wire to real user data
- [ ] Founder Dashboard: wire to real founder data
- [ ] Admin pages: wire to real admin procedures
- [ ] Deals page: wire to real deals data
- [ ] Reviews page: wire to real reviews data

## Phase 5 — Admin Panel
- [ ] Admin dashboard with real stats
- [ ] Admin tools management (CRUD)
- [ ] Admin users management (list, role assignment)
- [ ] Admin reviews management (list, delete)
- [ ] Admin submissions management (approve/reject)
- [ ] Admin deals management
- [ ] Admin subscribers management

## Phase 6 — Polish & Tests
- [ ] Write vitest tests for all procedures
- [ ] Mobile responsiveness audit
- [ ] Fix any TypeScript errors
- [ ] Verify all navigation links work

## Previously Completed (from earlier sessions)
- [x] Homepage with hero, trending, fresh launches, browse, leaderboard, launchpad CTA
- [x] Navbar with mega-menus
- [x] Tool detail page UI
- [x] Search results page UI
- [x] LaunchPad page UI
- [x] Reviews page UI
- [x] Compare page UI
- [x] Saved tools page UI
- [x] Dashboard and Founder Dashboard page UI
- [x] All static/marketing pages (About, Trust, Contact, Pricing, etc.)
- [x] Blog, Changelog, Legal pages
- [x] Community Picks, Editor's Picks, FAQ pages
- [x] Footer with newsletter subscription (real backend)
- [x] Newsletter subscription flow with welcome email
- [x] All footer pages (Advertise, Newsletter, Press, Events, Sitemap, Careers)
- [x] Featured badge system on tool cards
- [x] Featured filter toggles on homepage and search
- [x] Deployment configs (env.example, railway.toml, render.yaml, DEPLOYMENT.md)

## Phase 7 — Image & Screenshot Fixes
- [x] Collect real homepage screenshots for all 44 listed tools
- [x] Collect real logos for all 44 listed tools
- [x] Upload all screenshots and logos to CDN
- [x] Update database with real screenshot and logo URLs
- [x] Fix ToolCard component image display (logos aligned, screenshots fill containers)
- [x] Fix tool detail page image display
- [x] Fix homepage trending/fresh launch card images
- [x] Fix dashboard/founder panel image display (uses same DB data)
- [x] Fix admin panel image display (uses same DB data)
- [x] Fix profile photo display across all pages
- [x] Ensure all images have proper fallbacks for missing/broken images
- [x] Test all pages for correct image loading and display

## Phase 7b — Remove Mock Data & Fix Images
- [x] Check database for real tools added via admin panel (44 tools found)
- [x] Mock tools no longer used - homepage/search/detail all use DB data
- [x] Keep only the 44 real tools from database/admin panel
- [x] All pages already use database tools via /api/homepage
- [x] Collected real logos for all 44 database tools (Google Favicon V2 + CDN)
- [x] Collected real screenshots for all 44 database tools (microlink API)
- [x] Fix image display across all components (ToolCard, tool detail, dashboard, admin)
- [x] Fix logo alignment and screenshot containers
- [x] Fix profile photo display
- [x] Ensure all images have proper fallbacks (Google Favicon V2 fallback)
- [x] Test all pages for correct image loading

## Phase 8 — Fix Search Page
- [x] Diagnose search page data-loading timing issue (allTools missing from useMemo deps)
- [x] Fix search page to correctly display 44 tools from database
- [x] Ensure search filtering works correctly
- [x] Test search page on live Vercel site (stripe=1 result, AI=36 results)

## Phase 9 — User Profile & UX Enhancements
- [x] Replace email with user's name under profile in user panel
- [x] Fix profile photo upload and populating issues (switched to Supabase Storage)
- [x] Add initial/avatar fallback when no profile photo is uploaded
- [x] Create user onboarding flow to capture profile details (3-step flow)
- [x] Store onboarding data in database for admin visibility (jobTitle, company, useCase, referralSource)
- [x] Enhance founder's public profile with their tools and executive styling
- [x] Add user badges & achievements to public profile (7 badge types)
- [x] Rename "My Profile" to "My Dashboard" in logged-in user header dropdown
- [x] Fix flashing/flickering when navigating between dashboard and main pages (added authLoading state)

## Phase 10 — Welcome Email on Onboarding
- [ ] Audit existing email/notification infrastructure
- [ ] Implement welcome email in completeOnboarding action
- [ ] Build, push, and test on Vercel

## Category-Specific Hero Banners in Browse by Category
- [x] Design category banner data (headline, description, icon, accent color per category)
- [x] Create CategoryBanner component with smooth transition on category change
- [x] Integrate banner into Browse by Category section (between section header and category tabs)
- [x] Polish ToolCard: 64px logos, 18px bold names, max 1 badge
- [x] Apply to both laudstack (Vite) and laudstack-next (Next.js)
- [x] Test and push

## Trending Container BG + Remove CategoryBanner + Categories Page
- [x] Change Trending This Week container background color to soft mint (not full section)
- [x] Remove CategoryBanner from Browse by Category section on homepage
- [x] Build dedicated Categories page with polished grid of category cards
- [x] Register /categories route and update Navbar link
- [x] Apply all changes to Next.js project
- [x] Push both projects to GitHub for Vercel deployment

## Fix Trending Container + Vercel Build Error
- [ ] Restore Trending This Week container structure (was accidentally changed)
- [ ] Only change the container background color to soft mint (#F0F7F4)
- [ ] Fix framer-motion missing dependency in Next.js project
- [ ] Push fix to GitHub and verify Vercel deployment

## Platform Repositioning — Multi-Purpose Launch, Discovery & Growth Platform
- [x] Audit all current files (Home, Navbar, Footer, mockData, categories, pages)
- [x] Rewrite hero section: new tagline, subtitle, CTAs reflecting 5 pillars (Launches, Discovery, Reviews, Deals, Templates)
- [x] Rewrite social proof bar to reflect platform breadth (not just "directory")
- [x] Restructure Navbar: Launches, Discover, Reviews, Deals, Templates as primary nav
- [x] Update Trending section copy — position as community-driven momentum
- [x] Rewrite Fresh Launches section — emphasize Product Hunt-style launch culture
- [x] Rewrite Three Pillars section — expand to 5 pillars matching platform positioning
- [x] Rewrite LaunchPad CTA section — position for founders launching products
- [x] Update Browse by Category section copy
- [x] Update Footer copy, links, and sections to reflect full platform
- [x] Update page title and meta description
- [x] Remove all "directory" language across the platform
- [x] Apply all changes to Next.js project
- [x] Push to GitHub for Vercel deployment

## Full Platform Repositioning — Comprehensive Overhaul
### Phase 1: Hero & Global Fixes
- [ ] Fix hero headline to "Launch, Discover & Grow with AI & SaaS."
- [ ] Fix social proof: replace "98% verified" with "500+ products launched"
- [ ] Bulk rename "tool/tools" to "product/products" across all user-facing copy

### Phase 2: Navigation & Menu
- [ ] Add Comparisons menu item under Discover
- [ ] Add Alternatives menu item under Discover
- [ ] Add Community Voting item under Launches
- [ ] Update all menu descriptions to platform language

### Phase 3: Page Updates (rename tools → products)
- [ ] AllTools page → All Products page
- [ ] ToolDetail page → Product Detail page with alternatives, similar products, voting
- [ ] Trending page → rename tools to products
- [ ] TopRated page → rename tools to products
- [ ] NewLaunches page → rename tools to products
- [ ] Saved page → rename tools to products
- [ ] Search page → rename tools to products
- [ ] Compare page → update to Product vs Product
- [ ] Categories page → update copy
- [ ] Reviews page → update copy
- [ ] LaunchPad page → update copy
- [ ] ClaimTool page → Claim Your Product page
- [ ] Sitemap → update all references

### Phase 4: Components
- [ ] ToolCard → ProductCard (rename component and all references)
- [ ] CompareBar → update copy
- [ ] CategoryBanner → update copy
- [ ] WriteReviewModal → update copy
- [ ] PageHero → update any tool references
- [ ] Footer → update any remaining tool references
- [ ] Navbar → update any remaining tool references

### Phase 5: Data & Hooks
- [ ] mockData.ts → rename tool references to products
- [ ] useToolsData → rename to useProductsData
- [ ] useSavedTools → rename to useSavedProducts
- [ ] blogData → update tool references

### Phase 6: Product Detail Enhancements
- [ ] Add Alternatives section to product detail page
- [ ] Add Similar Products section
- [ ] Add community voting UI (upvote/downvote)
- [ ] Ensure comparison links work (Product A vs Product B)

### Phase 7: Apply to Next.js & Push
- [ ] Apply all changes to Next.js project
- [ ] Build and verify
- [ ] Push to GitHub for Vercel deployment

## Build Missing Pages for All Menu Items
- [ ] Build /alternatives page — find alternatives to any product
- [ ] Build /community-voting page — upvote and discuss products  
- [ ] Update Navbar links to point to new dedicated pages
- [ ] Push all changes to GitHub

## Database Migration & Re-seed (March 14, 2026)
- [ ] Run database migration to add features/pricing_tiers columns
- [ ] Re-seed production database with 50 stacks
- [ ] Verify live site displays stacks
