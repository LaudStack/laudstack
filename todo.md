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
