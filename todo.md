# LaudStack TODO

## Completed Features

- [x] Homepage with hero, trending, fresh launches, browse, leaderboard, launchpad CTA
- [x] Navbar with mega-menus (Discover, Leaderboard, Tools, Templates, Deals, Resources)
- [x] Tool detail page
- [x] Search results page
- [x] LaunchPad page (submit tool)
- [x] Reviews page
- [x] Compare page
- [x] Saved tools page
- [x] Launches / New Launches pages
- [x] About page
- [x] Trust Framework page
- [x] Contact page
- [x] Dashboard (user) and Founder Dashboard pages
- [x] Pricing page
- [x] Claim Tool page
- [x] Templates page
- [x] Deals page
- [x] All Tools / Categories page
- [x] Trending page
- [x] Top Rated page
- [x] Blog and BlogPost pages
- [x] Changelog page
- [x] Legal pages (Privacy, Terms, Cookies)
- [x] Affiliates page
- [x] Community Picks page (voting, filtering, community-curated tool cards)
- [x] Editor's Picks page (editorial spotlight cards and curated category sections)
- [x] FAQ page (comprehensive accordion sections covering all platform topics)
- [x] Footer rebuilt with multi-section ProductHunt-inspired design (5 link sections)
- [x] Old footer tagline removed ("The trusted community platform...")
- [x] Footer newsletter form wired to tRPC newsletter.subscribe mutation
- [x] Newsletter subscription flow: DB schema, tRPC procedure, welcome email (LLM-enhanced)
- [x] Navbar: Community Picks and Editor's Picks links updated to real routes
- [x] Navbar: Help Centre / FAQ added to Resources mega-menu
- [x] App.tsx: All new routes registered (/community-picks, /editors-picks, /faq)
- [x] Vitest tests for newsletter subscription flow (7 tests passing)

- [x] Removed Categories route (/categories) from App.tsx
- [x] Removed Categories, API Access, Discussions, API Docs, Status from Footer
- [x] Added replacement footer items: Top Rated, Saved Tools, Sponsored Listings, Tool Templates
- [x] Added Saved Tools and SaaS Deals to Navbar Discover mega-menu
- [x] Added Blog and Changelog to Navbar Resources mega-menu

## Pending / Future Features

- [x] Add Featured filter toggle to homepage Browse section
- [x] Add Featured filter toggle to Search page

- [ ] Discussions / Community forum
- [ ] Events page
- [ ] Slack Community integration
- [ ] Advertise page
- [ ] API Access / API Docs page
- [ ] Status page
- [ ] Careers page
- [ ] Press Kit page
- [ ] Newsletter dedicated landing page (/newsletter)
- [ ] Admin panel for managing subscribers and tools
- [ ] Real-time upvoting (optimistic updates with DB persistence)
- [ ] Tool comparison with AI-generated summary

## Missing Footer Pages
- [x] Build Advertise page (/advertise)
- [x] Build Newsletter landing page (/newsletter)
- [x] Build Press Kit page (/press)
- [x] Build Events page (/events)
- [x] Build Sitemap page (/sitemap)
- [x] Register all new routes in App.tsx

## Careers Page
- [x] Build Careers page (/careers) with culture, open positions, and application process
- [x] Register /careers route in App.tsx
- [x] Add /careers link to footer Company section

## User Panel & Authentication (Phase 2)
- [x] AuthContext upgraded to use real Manus OAuth via tRPC auth.me hook
- [x] SignIn page redesigned with Manus OAuth redirect (polished split-panel design)
- [x] User Dashboard rebuilt with 5 tabs: Profile · My Reviews · Saved Tools · Notifications · Settings
  - [x] Profile tab: avatar, stats, editable profile fields, activity feed
  - [x] My Reviews tab: list of reviews with ratings, pros/cons, edit/delete actions
  - [x] Saved Tools tab: bookmarked tools with quick actions
  - [x] Notifications tab: notification feed with read/unread states
  - [x] Settings tab: account settings, notification preferences, privacy, danger zone
- [x] Founder Dashboard rebuilt with 7 tabs: Overview · My Tools · Reviews · Deals · Analytics · Promote · Settings
  - [x] Overview tab: stats grid, performance chart, pending replies, quick actions
  - [x] My Tools tab: tool management with inline edit form, stats per tool
  - [x] Reviews tab: full review management with reply feature, rating distribution, filters
  - [x] Deals tab: create/manage deals with usage tracking, toggle active/inactive
  - [x] Analytics tab: views/clicks/reviews charts, per-tool breakdown, period selector
  - [x] Promote tab: promotion options (Featured, Newsletter, Social, LaudStack Pick)
  - [x] Settings tab: founder profile, notifications, privacy, danger zone
- [x] Navbar dropdown enhanced with sections (My Account / Founder Tools), quick stats, descriptions, and better visual hierarchy

## Login Page & Multi-Provider Auth (Phase 3)
- [x] Polished login/signup page with split-panel design (dark brand left + white auth right)
- [x] Tab switcher: Sign In / Create Account with smooth transitions
- [x] Google OAuth button (via Manus OAuth portal with provider=google hint)
- [x] LinkedIn OAuth button (via custom /api/auth/linkedin server route)
- [x] Email/password form with inline validation and password strength indicator
- [x] Password strength indicator (Weak/Fair/Good/Strong with 4 checks)
- [x] Forgot password link (redirects to Manus OAuth portal)
- [x] Error handling for OAuth failures (linkedin_denied, linkedin_failed, etc.)
- [x] DB schema extended: firstName, lastName, city, state, country, linkedinId, linkedinUrl, avatarUrl, emailVerified, loginMethod, passwordHash
- [x] LinkedIn OAuth server route (/api/auth/linkedin + /api/auth/linkedin/callback)
- [x] LinkedIn profile extraction: first name, last name, email, city/state/country, profile photo
- [x] Session cookie created after LinkedIn auth (same as Manus OAuth)
- [ ] LinkedIn OAuth credentials (LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET) — add when ready
