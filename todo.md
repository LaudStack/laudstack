# LaudStack TODO — Manus Project

## Complete Stack Listing System (Current Sprint)

### Database Schema
- [x] Stacks table with all fields (name, slug, tagline, description, logo, screenshots, affiliate links, pricing, status, featured, trending, verified, etc.)
- [x] Reviews table with ratings, pros/cons, helpful votes, founder replies
- [x] Lauds table (upvote system)
- [x] Saves table (bookmark system)
- [x] Clicks table (affiliate + website click tracking)
- [x] Views table (page view tracking)
- [x] Stack screenshots table
- [x] Verification requests table
- [x] Users table with role field (admin/user)
- [x] Newsletter subscribers table

### Server-Side Logic (tRPC Routers + DB Helpers)
- [x] Stacks: list, getBySlug, getById, recordView, recordClick, categoryCounts
- [x] Reviews: listByStack, myReview, create, replyAsFounder, markHelpful
- [x] Lauds: toggle, hasLauded, myLauds
- [x] Saves: toggle, hasSaved, mySavedStacks
- [x] Founder: myStacks, launch, update, requestVerification
- [x] Admin: dashboardStats, listStacks, getStack, createStack, updateStack, deleteStack
- [x] Admin: setStatus, setVerified, setFeatured, setTrending, setSpotlighted
- [x] Admin: addScreenshot, deleteScreenshot, listVerifications, resolveVerification
- [x] Admin: recalcRankings, listUsers, uploadImage
- [x] Newsletter: subscribe

### Auth System
- [x] Replace mock AuthContext with real Manus OAuth (delegates to useAuth from _core)
- [x] SignIn page redirects to Manus OAuth
- [x] All pages use real auth hook via compatibility layer
- [x] Admin role check via adminProcedure
- [x] Protected procedures for user actions (review, laud, save)

### Frontend Rewiring (Mock Data → Real tRPC)
- [x] Home.tsx — trending, fresh launches, browse, leaderboard all from DB
- [x] ToolDetail.tsx — full stack detail page with real data, reviews, lauds, saves
- [x] AllTools.tsx — browse with real filters, sorting, pagination
- [x] Trending.tsx — trending stacks from DB
- [x] TopRated.tsx — top rated stacks from DB
- [x] NewLaunches.tsx — newest stacks from DB
- [x] SearchResults.tsx — real search via tRPC
- [x] Saved.tsx — real saved stacks from DB
- [x] Dashboard.tsx — user dashboard with real data
- [x] FounderDashboard.tsx — founder stacks, reviews, analytics from DB
- [x] LaunchPad.tsx — real stack submission via tRPC
- [x] ClaimTool.tsx — real claim flow via tRPC
- [x] Categories.tsx — dynamic category counts from DB
- [x] Reviews.tsx — real reviews from DB
- [x] Compare.tsx — real stack comparison from DB
- [x] CommunityPicks.tsx — real community picks from DB
- [x] EditorsPicks.tsx — real editor's picks from DB
- [x] Launches.tsx — real launches from DB
- [x] Navbar.tsx — real search via tRPC
- [x] WriteReviewModal — real review submission via tRPC

### Admin Panel
- [x] AdminDashboard.tsx — full admin panel with stack management, stats, CRUD
- [x] AdminStackDetail.tsx — individual stack detail with edit, moderation, analytics
- [x] Admin routes registered in App.tsx

### Data
- [x] 50 real AI & SaaS stacks seeded in database
- [x] Categories fixed to match frontend taxonomy
- [x] mockData.ts deleted — zero mock data remaining

### Ranking & Algorithms
- [x] Rank score calculation (reviews, rating, lauds, views, clicks, recency)
- [x] Sort by: rank, newest, top_rated, most_reviewed, most_lauded, trending
- [x] Category counts computed dynamically from DB
- [x] Featured, trending, verified, spotlighted badge system

### Testing
- [x] 31 vitest tests passing (stacks, reviews, lauds, saves, admin, founder, newsletter)
- [x] Auth protection tests (unauthenticated rejected)
- [x] Admin role tests (regular user rejected, admin allowed)
- [x] Public query tests (list, search, getBySlug, categoryCounts)

### Cleanup
- [x] Deleted mockData.ts
- [x] Zero custom TypeScript errors
- [x] All 31 tests pass
- [x] useSavedTools hook wired to real DB (not localStorage)

## Previously Completed (Earlier Sessions)
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
- [x] Footer with newsletter subscription (real backend)
- [x] Newsletter subscription flow
- [x] Featured badge system on tool cards
- [x] Category-specific hero banners
- [x] Platform repositioning copy updates

## Homepage Copy Updates
- [x] Update hero subheader to new copy
- [x] Update Everything in One Place section subheader to new copy
