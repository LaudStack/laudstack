# Promotions System Audit

## Current State

### Database Schema
- **tools**: `isFeatured`, `isSpotlighted`, `isTrending` boolean flags
- **toolUpgrades**: Tracks stack featured placements (toolId, userId, tier, stripeSessionId, amountPaid, status, expiresAt)
- **deals**: Has `placement` enum (none/pinned/featured/deal_of_day), `placementExpiresAt`, `placementPlan`, `placementPaidAmount`, `placementStripeSessionId`
- **marketplaceProducts**: `isFeatured` (admin), `isBoosted` (creator-purchased), `boostExpiresAt`, `boostPlan`, `boostStripeSessionId`
- **No unified promotions table** — promotions are scattered across 3 different tables

### Stripe Plans (Hardcoded in stripe.ts)
- **FEATURED_PLANS** (Stacks): boost_30 ($149/30d), spotlight_90 ($349/90d), dominate_180 ($699/180d)
- **DEAL_PLACEMENT_PLANS**: deal_of_day ($99/1d), featured_7 ($49/7d), featured_14 ($79/14d), pinned_7 ($19/7d), pinned_14 ($29/14d)
- **MARKETPLACE_BOOST_PLANS**: boost_7 ($29/7d), spotlight_30 ($79/30d), dominate_90 ($199/90d)

### API Routes
- `/api/stripe/featured-placement` — Stack featured checkout
- `/api/stripe/deal-placement` — Deal placement checkout
- `/api/stripe/marketplace-boost` — Marketplace boost checkout
- `/api/stripe/webhook` — Handles all 3 types + creator onboarding + marketplace purchases
- `/api/cron/expire-placements` — Daily cron to expire tool upgrades and deal placements (NOT marketplace boosts)

### Frontend
- **Founder Dashboard**: PromoteTab with 3 featured plans + custom promotion requests
- **Creator Dashboard**: NO promote/boost tab exists yet
- **Admin**: No dedicated promotions management page; deals page has placement management inline

## Issues Found
1. **No unified promotions table** — promotions scattered across toolUpgrades, deals fields, marketplace fields
2. **Hardcoded pricing** — Plans/pricing in stripe.ts, not database-driven
3. **Duration rules don't match requirements** — Current: 30/90/180 days for stacks; Required: 3/7/14/30 days
4. **No Deal of the Day slot exclusivity** — No check for existing bookings
5. **Marketplace boost expiry not in cron** — expire-placements cron only handles tools and deals, NOT marketplace boosts
6. **No promotion lifecycle states** — toolUpgrades only has "pending"/"active"/"expired"; missing scheduled/cancelled/failed
7. **Creator dashboard has no promote tab** — Marketplace creators can't purchase boosts from their dashboard
8. **No admin promotions management page** — No centralized view of all promotions
9. **No promotion history** — Users can't view past/expired promotions
10. **No race condition handling for Deal of the Day** — Two users could book the same date
