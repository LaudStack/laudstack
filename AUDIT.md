# LaudStack Stack System — Full Audit

## Current State Summary

### Database
- Only 2 tables: `users`, `newsletter_subscribers`
- NO tables for: stacks, reviews, lauds, saves, clicks, categories, tags, screenshots

### Backend (server/)
- Only 2 routers: `auth` (me, logout), `newsletter` (subscribe)
- NO server logic for stacks, reviews, lauds, saves, admin, founder
- Storage helpers exist (S3 via storagePut/storageGet)
- Auth: Manus OAuth works (protectedProcedure, adminProcedure available)

### Frontend
- 19 pages import MOCK_TOOLS from mockData.ts (100 mock tools)
- Only 3 pages use real tRPC calls (Footer newsletter, AIChatBox, Newsletter)
- Auth context is MOCK (sessionStorage) — real useAuth exists in _core/hooks but pages use mock AuthContext
- useSavedTools: localStorage only
- WriteReviewModal: setTimeout mock, no DB
- ToolCard, ToolDetail: all from MOCK_TOOLS
- Dashboard, FounderDashboard: mock data
- No admin pages exist

### What Needs Building
1. Database schema (8+ new tables)
2. Server routers (admin, stacks, reviews, lauds, saves, clicks)
3. Replace mock AuthContext with real useAuth
4. Admin panel pages
5. Rewire ALL 19 pages from mock to tRPC
6. Seed 50 real stacks
7. Ranking algorithms
