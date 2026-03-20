# LaudStack Marketplace — Implementation Plan (v2)

**Status:** Updated with finalized monetization and negotiation rules. Awaiting approval before development begins.
**Date:** March 17, 2026
**Revision:** v2 — Incorporates finalized $39 creator onboarding fee, 12% platform commission, Make Offer negotiation system, and updated product categories.

---

## 1. Executive Summary

This document outlines the plan to convert the existing placeholder Templates page (`/templates`) into a **Lite Digital Product Marketplace** where creators sell digital products directly through LaudStack. The marketplace handles six product categories — Templates, SaaS Boilerplates, Micro-SaaS, Full Apps, Automation Tools, and Startup Assets — and uses **Stripe Connect** for automatic payment splitting between creators and the platform.

Three revenue streams power the marketplace: a **one-time $39 creator onboarding fee** that gates seller access and filters spam, a **12% platform commission** on every sale automatically collected via Stripe Connect, and **self-serve listing boost purchases** that increase product visibility.

A new **Make Offer** negotiation system allows buyers to propose custom prices on higher-value listings (Micro-SaaS, Full Apps, and Startup Assets only), enabling price discovery on products where value is subjective and deal sizes are larger.

The plan prioritizes reuse of existing LaudStack infrastructure — the current Templates page provides approximately 60-70% of the marketplace browse UI, and the Stripe integration, admin moderation flow, notification system, file upload pipeline, and dashboard architecture all serve as direct foundations for the new marketplace systems.

---

## 2. Platform Audit — What Already Exists

### 2.1 Current Templates Page (`src/app/templates/page.tsx`)

The existing Templates page is a fully built placeholder with rich UI but no database backing.

| Component | Status | Reusable? |
|-----------|--------|-----------|
| `Template` TypeScript interface (id, name, author, category, price, rating, reviews, downloads, tags, description, screenshots, techStack, includes, previewUrl) | Mock data only | **Yes** — maps closely to the marketplace product model |
| `TemplateCard` component (preview image, name, author, category, price, rating, badge) | Fully built UI | **Yes** — rename to `MarketplaceProductCard`, wire to DB |
| `PreviewModal` with Overview/Reviews tabs, viewport switcher, live preview iframe | Fully built UI | **Yes** — wire to real product data and reviews |
| `FullScreenPreview` with responsive viewport modes | Fully built UI | **Yes** — keep as-is, connect to real preview URLs |
| `CartDrawer` with add/remove/quantity management | Fully built UI | **Remove** — marketplace uses single-product Stripe checkout, not a cart model |
| `CheckoutModal` with multi-step flow (Cart, Billing, Confirmation) | Fully built UI | **Remove** — replaced by Stripe Connect checkout sessions |
| Category filter pills (SaaS, Landing, Dashboard, Email, Docs, Design) | Fully built UI | **Modify** — update to marketplace categories |
| Price filter (All/Free/Paid), sort options, search | Fully built UI | **Yes** — keep and wire to DB queries |
| Featured Templates section (staff picks) | Fully built UI | **Yes** — wire to admin-featured/boosted products |
| Trust strip (Quality Vetted, Community Trusted, Ready to Ship) | Fully built UI | **Yes** — keep as-is |
| "Sell your templates" CTA at bottom | Fully built UI | **Yes** — rename to "Become a Creator" CTA |
| `PageHero` integration | Fully built UI | **Yes** — update copy for Marketplace |
| Navbar link "Templates" | Exists | **Rename** to "Marketplace" |
| Footer link "Templates" | Exists | **Rename** to "Marketplace" |

**Verdict:** The Templates page provides approximately 60-70% of the marketplace browse UI. The card component, filter bar, search, sort, featured section, preview modal, and page structure can all be reused. The cart/checkout flow must be replaced with Stripe Connect single-product checkout, and a Make Offer button must be added for eligible categories.

### 2.2 Authentication and User System

| System | Location | Reusable? |
|--------|----------|-----------|
| Supabase Auth (email + LinkedIn OAuth) | `src/lib/supabase/` | **Yes** — no changes needed |
| `users` table with `role` enum (user, admin, super_admin) | `src/drizzle/schema.ts` | **Extend** — add marketplace creator fields |
| `useAuth()` hook | `src/hooks/useAuth.ts` | **Yes** |
| `useDbUser()` hook | `src/hooks/useDbUser.ts` | **Yes** |
| `requireAuth()` server action helper | `src/app/actions/user.ts` | **Yes** |
| User onboarding flow | `src/app/onboarding/page.tsx` | **Reference** — creator onboarding follows same pattern |

### 2.3 User Dashboard

| System | Location | Reusable? |
|--------|----------|-----------|
| User dashboard with tabs (Profile, Reviews, Saved, Following, Deals, Notifications, Settings) | `src/app/dashboard/page.tsx` | **Extend** — add "Purchases" and "My Offers" tabs |
| Tab rendering pattern | Same file | **Yes** — follow same pattern for new tabs |

### 2.4 Founder Dashboard

| System | Location | Reusable? |
|--------|----------|-----------|
| Founder dashboard with tabs (Overview, My Products, Reviews, Deals, Lauds, Analytics, Promote, Claims, Settings) | `src/app/dashboard/founder/page.tsx` | **Reference** — Creator Dashboard follows same architecture |
| Tool submission flow | `src/app/actions/founder.ts` | **Reference** — product submission follows same pattern |
| Promote tab with Stripe checkout for boosts | Same file | **Yes** — same boost pattern for marketplace products |

### 2.5 Stripe Integration

| System | Location | Reusable? |
|--------|----------|-----------|
| Stripe SDK singleton (`getStripe()`) | `src/server/stripe.ts` | **Yes** — extend with Connect functions |
| `FEATURED_PLANS` pricing config | Same file | **Reference** — same pattern for boost plans |
| `DEAL_PLACEMENT_PLANS` pricing config | Same file | **Reference** — same pattern for marketplace boosts |
| `createFeaturedCheckoutSession()` | Same file | **Reference** — same pattern for creator onboarding and product purchase |
| `constructWebhookEvent()` | Same file | **Yes** — extend webhook handler |
| Stripe webhook route | `src/app/api/stripe/webhook/route.ts` | **Extend** — add marketplace event handlers |
| Featured placement API route | `src/app/api/stripe/featured-placement/route.ts` | **Reference** — same pattern for marketplace routes |
| Deal placement API route | `src/app/api/stripe/deal-placement/route.ts` | **Reference** — same pattern |
| `STRIPE_SECRET_KEY` env var | Vercel env | **Yes** |
| `STRIPE_WEBHOOK_SECRET` env var | Vercel env | **Yes** |

The current Stripe integration uses standard Stripe checkout where the platform receives 100% of payment. The marketplace requires **Stripe Connect** for automatic payment splitting. This is a new capability that must be added.

### 2.6 File Upload

| System | Location | Reusable? |
|--------|----------|-----------|
| User avatar upload to Supabase Storage | `src/app/api/upload/route.ts` | **Reference** — same pattern for product images |
| Admin tool asset upload to Supabase Storage | `src/app/api/admin/upload/route.ts` | **Reference** — same pattern |
| `useFileUpload` hook | `src/hooks/useFileUpload.ts` | **Yes** — use for product screenshot uploads |

### 2.7 Admin Panel

| System | Location | Reusable? |
|--------|----------|-----------|
| Admin layout with sidebar | `src/app/admin/layout.tsx` | **Extend** — add Marketplace menu item |
| Admin submissions review (pending to approved/rejected) | `src/app/admin/submissions/page.tsx` | **Reference** — marketplace product moderation follows same pattern |
| Admin tools management | `src/app/admin/tools/page.tsx` | **Reference** |
| Admin deals management | `src/app/admin/deals/page.tsx` | **Reference** |
| Admin users management | `src/app/admin/users/page.tsx` | **Reference** |
| Admin revenue page | `src/app/admin/revenue/page.tsx` | **Extend** — add marketplace revenue section |
| `getAdminSubmissions()`, `reviewSubmission()` server actions | `src/app/actions/admin.ts` | **Reference** — same moderation pattern |

### 2.8 Notification System

| System | Location | Reusable? |
|--------|----------|-----------|
| `createNotification()` | `src/app/actions/notifications.ts` | **Yes** — use for marketplace events |
| `notifyAdmins()` | Same file | **Yes** — notify admins of new product submissions |
| Notification bell + dropdown | Dashboard | **Yes** |
| Email notifications via Resend | `src/server/email.ts` | **Extend** — add marketplace email templates |

### 2.9 Review System

| System | Location | Reusable? |
|--------|----------|-----------|
| `reviews` table (rating, title, body, pros, cons, moderation) | `src/drizzle/schema.ts` | **Reference** — marketplace product reviews follow same schema pattern |
| Review display components | Tool detail page | **Reference** — reuse review UI patterns |

---

## 3. What Must Be Renamed or Restructured

| Current | New | Files Affected |
|---------|-----|----------------|
| Navbar link "Templates" | "Marketplace" | `src/components/Navbar.tsx` |
| Footer link "Templates" | "Marketplace" | `src/components/Footer.tsx` |
| Route `/templates` | `/marketplace` | Rename `src/app/templates/` to `src/app/marketplace/` |
| `TemplateCard` component (inline) | `MarketplaceProductCard` | Inside marketplace page |
| `PreviewModal` (inline) | Keep name, wire to DB | Inside marketplace page |
| Admin "Email Templates" menu | Keep as-is (separate concern) | No change |
| Categories (SaaS, Landing, Dashboard, Email, Docs, Design) | (Templates, SaaS Boilerplates, Micro-SaaS, Full Apps, Automation Tools, Startup Assets) | Inside marketplace page |
| "Sell your templates" CTA | "Become a Creator" | Inside marketplace page |
| Cart/Checkout flow | Remove entirely, replace with Stripe Connect checkout + Make Offer modal | Inside marketplace page |

---

## 4. What Must Be Modified

### 4.1 Stripe Module (`src/server/stripe.ts`)

The Stripe module must be extended with Stripe Connect functions and marketplace-specific constants.

**New constants:**

| Constant | Value | Description |
|----------|-------|-------------|
| `MARKETPLACE_COMMISSION_PERCENT` | `12` | Platform takes 12% of every sale |
| `CREATOR_ONBOARDING_FEE_CENTS` | `3900` | One-time $39 creator onboarding fee |
| `MARKETPLACE_BOOST_PLANS` | Config object | Boost 7 days ($29), Spotlight 30 days ($79), Dominate 90 days ($199) |

**New functions:**

- `createConnectAccount(userId, email)` — create a Stripe Connect Express account for a creator
- `createConnectAccountLink(accountId, refreshUrl, returnUrl)` — generate onboarding link for Connect account setup
- `createConnectLoginLink(accountId)` — generate Stripe Express dashboard link for existing Connect accounts
- `createCreatorOnboardingCheckoutSession(userId, successUrl, cancelUrl)` — standard Stripe Checkout for the one-time $39 fee
- `createMarketplaceCheckoutSession(productId, buyerId, creatorConnectAccountId, amountCents, successUrl, cancelUrl)` — Stripe Checkout with `payment_intent_data.application_fee_amount` set to `amountCents * 0.12` and `payment_intent_data.transfer_data.destination` set to the creator's Connect account
- `createOfferCheckoutSession(offerId, buyerId, creatorConnectAccountId, negotiatedAmountCents, successUrl, cancelUrl)` — same as marketplace checkout but uses the negotiated offer price instead of the listing price
- `createMarketplaceBoostCheckoutSession(productId, creatorId, planKey, successUrl, cancelUrl)` — standard Stripe Checkout for boost purchases

### 4.2 Stripe Webhook (`src/app/api/stripe/webhook/route.ts`)

Add handlers for the following events:

| Event | Metadata Key | Action |
|-------|-------------|--------|
| `checkout.session.completed` | `type === "creator_onboarding"` | Set `isMarketplaceCreator = true`, record `creatorActivatedAt` |
| `checkout.session.completed` | `type === "marketplace_purchase"` | Create order record, grant download access, notify creator and buyer |
| `checkout.session.completed` | `type === "marketplace_offer_purchase"` | Same as above but for accepted offer, update offer status to `completed` |
| `checkout.session.completed` | `type === "marketplace_boost"` | Activate product boost, set `boostExpiresAt` |
| `account.updated` | N/A | Track Connect account status changes, update `stripeConnectOnboarded` |

### 4.3 Users Table (`src/drizzle/schema.ts`)

Add the following fields to the existing `users` table:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `isMarketplaceCreator` | boolean | `false` | Whether user has paid the onboarding fee |
| `creatorActivatedAt` | timestamp | nullable | When creator status was activated |
| `stripeConnectAccountId` | varchar | nullable | Stripe Connect Express account ID |
| `stripeConnectOnboarded` | boolean | `false` | Whether Connect account setup is complete |
| `creatorOnboardingStripeSessionId` | varchar | nullable | Stripe session ID for the onboarding payment |

### 4.4 Admin Layout (`src/app/admin/layout.tsx`)

Add sidebar menu item: "Marketplace" linking to `/admin/marketplace`.

### 4.5 User Dashboard (`src/app/dashboard/page.tsx`)

Add two new tabs:

- **Purchases** — list of marketplace orders with download links, purchase date, and receipt
- **My Offers** — list of offers the user has made, with status (pending, accepted, rejected, countered, expired, completed), and a "Pay Now" button for accepted offers

### 4.6 Notification System

Add notification type `marketplace` to the `notificationTypeEnum` (requires migration). The following marketplace events will trigger notifications:

| Event | Recipient | Channel |
|-------|-----------|---------|
| Product submission received | Creator | In-app |
| Product approved | Creator | In-app + Email |
| Product rejected (with reason) | Creator | In-app + Email |
| New sale | Creator | In-app + Email |
| Purchase confirmation + download link | Buyer | In-app + Email |
| New offer received | Creator | In-app + Email |
| Offer accepted | Buyer | In-app + Email |
| Offer rejected | Buyer | In-app |
| Offer countered | Buyer | In-app + Email |
| Offer expired (auto, after 72 hours) | Both | In-app |

### 4.7 Email System (`src/server/email.ts`)

Add the following email templates via Resend:

- Creator onboarding welcome (after $39 payment)
- Product submission received
- Product approved
- Product rejected (with admin notes)
- Purchase receipt (buyer, with download link)
- New sale notification (creator, with order details)
- New offer received (creator)
- Offer accepted (buyer, with payment link)
- Offer countered (buyer, with counter details)

---

## 5. What Must Be Built New

### 5.1 Database Tables

**`marketplace_products` table:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PK | Auto-incrementing primary key |
| `creatorId` | integer | FK to `users.id`, NOT NULL | The creator who listed this product |
| `slug` | varchar(128) | UNIQUE, NOT NULL | URL-friendly identifier |
| `name` | varchar(128) | NOT NULL | Product display name |
| `tagline` | varchar(200) | NOT NULL | Short one-line description |
| `description` | text | NOT NULL | Markdown-formatted product description |
| `longDescription` | text | nullable | Extended description with features, use cases |
| `category` | marketplace_category_enum | NOT NULL | Product category |
| `price` | integer | NOT NULL | Price in cents (0 = free) |
| `compareAtPrice` | integer | nullable | Original price for showing discounts |
| `offersEnabled` | boolean | default `false` | Whether Make Offer is enabled (auto-set based on category) |
| `minimumOfferPercent` | integer | default `60` | Minimum offer as percentage of listing price (e.g., 60 = buyer must offer at least 60% of price) |
| `previewImageUrl` | text | nullable | Primary product image URL |
| `screenshots` | jsonb | default `[]` | Array of screenshot URLs |
| `demoUrl` | text | nullable | External link to live demo |
| `downloadFileKey` | text | nullable | Supabase Storage key for the digital product file |
| `downloadFileName` | varchar(256) | nullable | Original filename for display |
| `downloadFileSize` | integer | nullable | File size in bytes |
| `techStack` | jsonb | default `[]` | Array of technology tags |
| `includes` | jsonb | default `[]` | Array of what is included in the purchase |
| `features` | jsonb | default `[]` | Array of `{title, description}` objects |
| `tags` | jsonb | default `[]` | Array of searchable tags |
| `status` | marketplace_product_status_enum | NOT NULL, default `draft` | Current listing status |
| `reviewNotes` | text | nullable | Admin notes on rejection |
| `reviewedAt` | timestamp | nullable | When admin reviewed the product |
| `reviewedBy` | integer | FK to `users.id`, nullable | Admin who reviewed |
| `isFeatured` | boolean | default `false` | Admin-featured product |
| `isBoosted` | boolean | default `false` | Creator-purchased boost active |
| `boostExpiresAt` | timestamp | nullable | When the boost expires |
| `boostPlan` | varchar | nullable | Which boost plan was purchased |
| `boostStripeSessionId` | varchar | nullable | Stripe session for the boost purchase |
| `averageRating` | real | default `0` | Cached average rating |
| `reviewCount` | integer | default `0` | Cached review count |
| `salesCount` | integer | default `0` | Cached total sales |
| `viewCount` | integer | default `0` | Page view counter |
| `totalRevenue` | integer | default `0` | Cached total revenue in cents |
| `createdAt` | timestamp | NOT NULL, default `now()` | Record creation time |
| `updatedAt` | timestamp | NOT NULL, default `now()` | Last update time |

**`marketplace_product_status_enum`:** `draft`, `pending`, `approved`, `rejected`, `paused`

**`marketplace_category_enum`:** `templates`, `saas_boilerplates`, `micro_saas`, `full_apps`, `automation_tools`, `startup_assets`

> Categories where **Make Offer is enabled by default**: `micro_saas`, `full_apps`, `startup_assets`. For these categories, `offersEnabled` is automatically set to `true` when the product is created, and `minimumOfferPercent` defaults to `60`. Creators can adjust the minimum offer percentage or disable offers entirely from their dashboard.

**`marketplace_orders` table:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PK | Auto-incrementing primary key |
| `productId` | integer | FK to `marketplace_products.id`, NOT NULL | The purchased product |
| `buyerId` | integer | FK to `users.id`, NOT NULL | The buyer |
| `creatorId` | integer | FK to `users.id`, NOT NULL | The creator (denormalized for query performance) |
| `offerId` | integer | FK to `marketplace_offers.id`, nullable | If this order originated from a negotiated offer |
| `stripeSessionId` | varchar | NOT NULL | Stripe Checkout session ID |
| `stripePaymentIntentId` | varchar | nullable | Stripe PaymentIntent ID |
| `amount` | integer | NOT NULL | Total charged in cents |
| `platformFee` | integer | NOT NULL | LaudStack commission in cents (12% of amount) |
| `creatorPayout` | integer | NOT NULL | Creator receives in cents (88% of amount) |
| `currency` | varchar(3) | default `usd` | Currency code |
| `status` | varchar | NOT NULL, default `pending` | Order status: pending, completed, refunded |
| `downloadGranted` | boolean | default `false` | Whether buyer has download access |
| `createdAt` | timestamp | NOT NULL, default `now()` | Order creation time |

**`marketplace_reviews` table:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PK | Auto-incrementing primary key |
| `productId` | integer | FK to `marketplace_products.id`, NOT NULL | The reviewed product |
| `userId` | integer | FK to `users.id`, NOT NULL | The reviewer |
| `orderId` | integer | FK to `marketplace_orders.id`, NOT NULL | Must have purchased to review |
| `rating` | integer | NOT NULL, CHECK 1-5 | Star rating |
| `title` | varchar(256) | NOT NULL | Review title |
| `body` | text | NOT NULL | Review body |
| `creatorReply` | text | nullable | Creator's response |
| `creatorReplyAt` | timestamp | nullable | When creator replied |
| `status` | varchar | NOT NULL, default `published` | Status: published, hidden, removed |
| `createdAt` | timestamp | NOT NULL, default `now()` | Review creation time |
| `updatedAt` | timestamp | NOT NULL, default `now()` | Last update time |

**`marketplace_offers` table (NEW — Make Offer system):**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PK | Auto-incrementing primary key |
| `productId` | integer | FK to `marketplace_products.id`, NOT NULL | The product being negotiated |
| `buyerId` | integer | FK to `users.id`, NOT NULL | The buyer making the offer |
| `creatorId` | integer | FK to `users.id`, NOT NULL | The creator receiving the offer |
| `offerAmountCents` | integer | NOT NULL | Buyer's proposed price in cents |
| `message` | text | nullable | Optional message from buyer |
| `status` | marketplace_offer_status_enum | NOT NULL, default `pending` | Current offer status |
| `counterAmountCents` | integer | nullable | Creator's counter-offer price in cents |
| `counterMessage` | text | nullable | Creator's message with counter-offer |
| `rejectionReason` | text | nullable | Creator's reason for rejection |
| `stripeSessionId` | varchar | nullable | Stripe session for accepted/countered offer payment |
| `expiresAt` | timestamp | NOT NULL | Auto-expires 72 hours after creation or last counter |
| `respondedAt` | timestamp | nullable | When creator responded |
| `completedAt` | timestamp | nullable | When payment was completed |
| `createdAt` | timestamp | NOT NULL, default `now()` | Offer creation time |

**`marketplace_offer_status_enum`:** `pending`, `accepted`, `rejected`, `countered`, `expired`, `completed`, `cancelled`

**`marketplace_boost_plans` (config constant, not a table):**

| Plan | Duration | Price | Description |
|------|----------|-------|-------------|
| Boost | 7 days | $29 | Highlighted in category listings |
| Spotlight | 30 days | $79 | Featured in marketplace hero + category |
| Dominate | 90 days | $199 | Top placement across all marketplace pages |

### 5.2 API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/stripe/creator-onboarding` | POST | Create Stripe Checkout for $39 creator onboarding fee |
| `/api/stripe/marketplace-purchase` | POST | Create Stripe Connect checkout for product purchase |
| `/api/stripe/marketplace-offer-purchase` | POST | Create Stripe Connect checkout for accepted/countered offer |
| `/api/stripe/marketplace-boost` | POST | Create Stripe Checkout for product boost |
| `/api/stripe/connect-onboarding` | POST | Create Stripe Connect account + onboarding link |
| `/api/stripe/connect-dashboard` | POST | Generate Connect Express dashboard login link |
| `/api/marketplace/upload` | POST | Upload product screenshots/files to Supabase Storage |

### 5.3 Server Actions

**File:** `src/app/actions/marketplace.ts`

**Creator actions:**

| Action | Description |
|--------|-------------|
| `submitMarketplaceProduct(data)` | Create product in `pending` status, auto-set `offersEnabled` based on category |
| `updateMarketplaceProduct(productId, data)` | Edit product details (only if creator owns it and status is draft/rejected/approved) |
| `pauseMarketplaceProduct(productId)` | Set status to `paused`, hide from marketplace |
| `resumeMarketplaceProduct(productId)` | Set status back to `approved`, show in marketplace |
| `deleteMarketplaceProduct(productId)` | Soft delete (set status to `paused` and mark deleted) |
| `getCreatorProducts()` | List creator's own products with status badges |
| `getCreatorOrders(page, limit)` | Paginated list of sales for creator's products |
| `getCreatorAnalytics()` | Sales, views, revenue summary, conversion rate |

**Offer actions (creator side):**

| Action | Description |
|--------|-------------|
| `getCreatorOffers(page, limit)` | Paginated list of offers received on creator's products |
| `acceptOffer(offerId)` | Accept an offer, generate Stripe checkout link for buyer |
| `rejectOffer(offerId, reason?)` | Reject an offer with optional reason |
| `counterOffer(offerId, counterAmountCents, message?)` | Counter with a new price, reset 72-hour expiry |

**Offer actions (buyer side):**

| Action | Description |
|--------|-------------|
| `submitOffer(productId, amountCents, message?)` | Submit an offer (validates against `minimumOfferPercent`) |
| `getBuyerOffers(page, limit)` | Paginated list of offers the buyer has made |
| `acceptCounterOffer(offerId)` | Accept a counter-offer, generate Stripe checkout link |
| `cancelOffer(offerId)` | Cancel a pending offer |

**Public actions:**

| Action | Description |
|--------|-------------|
| `getMarketplaceProducts(filters)` | Paginated, filterable product listing (category, price range, sort, search) |
| `getMarketplaceProduct(slug)` | Single product by slug with creator info |
| `getFeaturedMarketplaceProducts()` | Featured and boosted products for hero section |
| `getMarketplaceProductReviews(productId, page)` | Paginated reviews for a product |
| `submitMarketplaceReview(orderId, data)` | Submit review (must have completed order) |
| `getUserPurchases(page, limit)` | Paginated list of buyer's orders with download links |
| `getProductDownloadUrl(orderId)` | Generate signed Supabase Storage URL for verified purchaser |

**Admin actions:**

| Action | Description |
|--------|-------------|
| `getAdminMarketplaceSubmissions(page, status?)` | Pending products for review |
| `reviewMarketplaceProduct(productId, action, notes?)` | Approve or reject with notes |
| `getAdminMarketplaceOrders(page, filters?)` | All orders with filtering |
| `getAdminMarketplaceCreators(page)` | All creators with stats |
| `featureMarketplaceProduct(productId)` | Admin-feature a product |
| `unfeatureMarketplaceProduct(productId)` | Remove admin featuring |
| `getMarketplaceRevenue(dateRange?)` | Revenue dashboard data (total, commission, by category) |
| `getAdminMarketplaceOffers(page)` | All offers for monitoring |

### 5.4 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/marketplace` | Browse page | Converted from `/templates` — category filters, search, sort, product cards, featured section |
| `/marketplace/[slug]` | Product detail | Screenshots, description, features, demo link, creator info, reviews, Buy Now + Make Offer buttons |
| `/marketplace/creator/onboarding` | Creator onboarding | Pay $39 fee, Stripe Connect setup, redirect to creator dashboard |
| `/dashboard?tab=purchases` | User purchases tab | List of purchased products with download links |
| `/dashboard?tab=offers` | User offers tab | List of offers made with status and actions |
| `/dashboard/creator` | Creator Dashboard | Tabs: Overview, Products, Orders, Offers, Analytics, Boost, Settings |
| `/admin/marketplace` | Admin marketplace | Tabs: Submissions, Products, Orders, Creators, Offers, Revenue, Boosts |

### 5.5 Components

| Component | Description |
|-----------|-------------|
| `MarketplaceProductCard` | Evolved from `TemplateCard` — preview image, name, creator, category, price, rating, "Make Offer" badge for eligible categories |
| `MarketplaceProductDetail` | Full product page with screenshots gallery, description, features, tech stack, creator card, reviews, purchase CTA, Make Offer CTA |
| `MakeOfferModal` | Modal form with offer price input (with minimum validation), optional message field, and submit button |
| `OfferResponseModal` | Creator modal to accept, reject (with reason), or counter (with price + message) an offer |
| `CreatorDashboard` | Tab-based dashboard following founder dashboard pattern |
| `CreatorOffersTab` | List of incoming offers with accept/reject/counter actions |
| `BuyerOffersTab` | List of outgoing offers with status, pay now, and cancel actions |
| `AdminMarketplace` | Admin management page following admin submissions pattern |
| `CreatorOnboardingFlow` | Multi-step: Information, Pay $39, Connect account setup, Welcome |

---

## 6. Stripe Connect Integration

### 6.1 Flow Overview

**Creator Onboarding:**

The creator onboarding flow is a three-step process. First, the user clicks "Become a Creator" and is taken to `/marketplace/creator/onboarding`, where they see the benefits, the $39 one-time fee, the 12% commission rate, and what they can sell. After clicking "Get Started," a standard Stripe Checkout session is created for $39. Upon successful payment, the webhook sets `isMarketplaceCreator = true` and `creatorActivatedAt` on the user record. The user is then redirected to Stripe Connect Express onboarding, where they enter bank details and complete identity verification. Once Connect onboarding is complete, the webhook sets `stripeConnectOnboarded = true`. The creator is then redirected to `/dashboard/creator` with a welcome message and can immediately begin submitting products.

**Product Purchase (Buy Now):**

When a buyer clicks "Buy Now" on a product page, the API creates a Stripe Checkout Session with `payment_intent_data.application_fee_amount` set to `price * 0.12` (the 12% platform commission) and `payment_intent_data.transfer_data.destination` set to the creator's Stripe Connect account ID. Stripe automatically splits the payment: the creator receives 88% and LaudStack receives 12%. The webhook records the order, sets `downloadGranted = true`, increments the product's `salesCount` and `totalRevenue`, and sends email notifications to both the buyer (with download link) and the creator (with sale details).

**Offer Purchase (Make Offer flow):**

When an accepted or counter-accepted offer is ready for payment, the system creates a Stripe Checkout Session using the negotiated price instead of the listing price. The same 12% commission split applies to the negotiated amount. The webhook follows the same order recording flow as a standard purchase but also updates the offer status to `completed`.

### 6.2 Environment Variables Required

| Variable | Status | Purpose |
|----------|--------|---------|
| `STRIPE_SECRET_KEY` | Exists | Used for all Stripe operations |
| `STRIPE_WEBHOOK_SECRET` | Exists | Extend webhook handler with marketplace events |
| `STRIPE_CONNECT_CLIENT_ID` | **New** | Required for Connect account creation (from Stripe Dashboard, Connect, Settings) |

### 6.3 Finalized Commission Model

| Item | Value | Description |
|------|-------|-------------|
| **Platform commission** | **12%** of every sale | Automatically collected via Stripe Connect `application_fee_amount` |
| **Creator payout** | **88%** of every sale | Automatically transferred to creator's Connect account |
| **Creator onboarding fee** | **$39** one-time | Standard Stripe Checkout, 100% to LaudStack |
| **Stripe processing fee** | ~2.9% + $0.30 | Deducted by Stripe from the total before the 88/12 split |
| **All amounts** | Stored in cents | Integer storage, no floating point |

---

## 7. Make Offer Negotiation System

### 7.1 Eligible Categories

The Make Offer feature is **only enabled** for product categories where prices are higher and value is more subjective. This prevents low-value negotiation noise on commodity products.

| Category | Make Offer Enabled | Rationale |
|----------|--------------------|-----------|
| Templates | No | Low-price commodity, fixed pricing |
| SaaS Boilerplates | No | Low-price commodity, fixed pricing |
| Micro-SaaS | **Yes** | Higher value, subjective pricing |
| Full Apps | **Yes** | High value, significant negotiation potential |
| Automation Tools | No | Low-price commodity, fixed pricing |
| Startup Assets | **Yes** | High value, subjective pricing |

### 7.2 Offer Workflow

The complete offer lifecycle follows this sequence:

```
Buyer visits product page (eligible category)
  ↓
Product page shows "Buy Now" ($X) and "Make Offer" buttons side by side
  ↓
Buyer clicks "Make Offer" → MakeOfferModal opens
  ↓
Buyer enters offer price (must be >= minimumOfferPercent of listing price)
Buyer optionally adds a message explaining their offer
  ↓
Buyer submits offer → offer created with status "pending", expiresAt = now + 72h
  ↓
Creator receives notification (in-app + email)
  ↓
Creator views offer in Creator Dashboard → Offers tab
  ↓
Creator chooses one of three actions:
  ├── ACCEPT → offer status = "accepted"
  │     ↓
  │     Buyer notified (in-app + email) with "Pay Now" link
  │     ↓
  │     Buyer clicks "Pay Now" → Stripe Checkout at negotiated price (12% commission)
  │     ↓
  │     Payment completes → offer status = "completed", order created, download granted
  │
  ├── REJECT → offer status = "rejected"
  │     ↓
  │     Buyer notified (in-app) with optional rejection reason
  │     ↓
  │     Buyer can submit a new offer if desired
  │
  └── COUNTER → offer status = "countered", counterAmountCents set, expiresAt reset to now + 72h
        ↓
        Buyer notified (in-app + email) with counter details
        ↓
        Buyer views counter in Dashboard → My Offers tab
        ↓
        Buyer chooses:
        ├── ACCEPT COUNTER → Stripe Checkout at counter price (12% commission)
        │     ↓
        │     Payment completes → offer status = "completed", order created
        │
        └── DECLINE / LET EXPIRE → offer status = "expired" after 72h
              ↓
              Both parties notified (in-app)
```

### 7.3 Offer Rules and Constraints

| Rule | Value | Description |
|------|-------|-------------|
| Minimum offer | 60% of listing price (default, creator-adjustable) | Prevents insultingly low offers |
| Expiration | 72 hours from creation or last counter | Prevents stale offers cluttering the system |
| Max active offers per buyer per product | 1 | Prevents spam offers |
| Offer on own product | Blocked | Creator cannot make offers on their own products |
| Offer on free products | Blocked | No offers on $0 products |
| Counter limit | 1 counter per offer | Keeps negotiations simple (offer, counter, accept/decline) |
| Commission on negotiated price | 12% | Same commission rate applies regardless of negotiated amount |

### 7.4 Offer UI Placement

On the product detail page (`/marketplace/[slug]`), for eligible categories:

- **Desktop:** The sidebar purchase section shows "Buy Now — $X" as the primary button and "Make Offer" as a secondary outline button directly below it
- **Mobile:** The fixed bottom bar shows both buttons side by side, "Buy Now" on the left (primary) and "Make Offer" on the right (outline)
- The `MarketplaceProductCard` on the browse page shows a small "Offers Welcome" badge for eligible products

---

## 8. Creator Onboarding Flow

The creator onboarding page (`/marketplace/creator/onboarding`) guides users through a four-step process.

**Step 1 — Information:** The user sees a "Become a Creator" page explaining the benefits of selling on LaudStack, the one-time $39 fee, the 12% commission rate, what product categories they can sell, how payouts work through Stripe Connect, and the admin review process for listings.

**Step 2 — Payment:** The user clicks "Get Started" and is redirected to a Stripe Checkout session for the $39 one-time fee. On successful payment, the webhook sets `isMarketplaceCreator = true` and `creatorActivatedAt = now()` on the user record.

**Step 3 — Connect Setup:** After payment, the user is redirected to Stripe Connect Express onboarding where they enter their bank details and complete identity verification. This is required before they can receive payouts. On completion, the webhook sets `stripeConnectOnboarded = true` and stores the `stripeConnectAccountId`.

**Step 4 — Welcome:** The user is redirected to `/dashboard/creator` with a welcome message, a quick-start guide, and a prominent "Add Your First Product" button. The creator can immediately begin submitting products for review.

---

## 9. Creator Dashboard

The Creator Dashboard (`/dashboard/creator`) follows the same architecture as the Founder Dashboard but is focused on marketplace products.

| Tab | Features |
|-----|----------|
| **Overview** | Total sales count, total revenue, active products count, pending reviews count, recent orders list, quick stats cards |
| **Products** | List of creator's products with status badges (draft, pending, approved, rejected, paused), edit/pause/resume actions, "Add Product" button, search and filter |
| **Orders** | Paginated list of sales with buyer info (anonymized name), product name, amount, platform fee, creator payout, date, status |
| **Offers** | Paginated list of incoming offers with product name, buyer (anonymized), offer amount, listing price, status, accept/reject/counter actions |
| **Analytics** | Total views, conversion rate (views to sales), revenue chart (last 30/90 days), top products by revenue, top products by views |
| **Boost** | Purchase visibility boosts for products — same UI pattern as Founder Promote tab, with Boost ($29/7d), Spotlight ($79/30d), Dominate ($199/90d) plans |
| **Settings** | Stripe Connect Express dashboard link (opens Stripe-hosted dashboard for payout info, bank details, tax forms), notification preferences for marketplace events |

---

## 10. Product Moderation Flow

The moderation flow follows the exact same pattern as the existing tool submission moderation in `src/app/admin/submissions/page.tsx`.

When a creator submits a product, its status is set to `pending`. An in-app notification and email are sent to all admin users. Admins review the product in `/admin/marketplace` under the Submissions tab, where they can see the product details, screenshots, description, pricing, and creator info. The admin can approve the product (setting status to `approved` and making it visible in the marketplace) or reject it (setting status to `rejected` and saving review notes with the reason). The creator receives an in-app notification and email for both outcomes. If rejected, the creator can edit the product and resubmit, which returns the status to `pending` for another review cycle.

---

## 11. Marketplace UI Structure

### 11.1 Browse Page (`/marketplace`)

The browse page is converted from the current `/templates` page with the following structure:

- **PageHero** — "LaudStack Marketplace" with updated copy reflecting the broader product categories
- **Featured Products** section — staff picks (admin-featured) and boosted products (creator-purchased boosts)
- **Filter bar** — Search input, category pills (All, Templates, SaaS Boilerplates, Micro-SaaS, Full Apps, Automation Tools, Startup Assets), price filter (All/Free/Paid), sort options (Popular, Newest, Top Rated, Most Sales)
- **Product grid** — `MarketplaceProductCard` components with "Offers Welcome" badge on eligible categories
- **Trust strip** — Quality Vetted, Community Trusted, Ready to Ship
- **"Become a Creator" CTA** — replaces "Sell your templates" with information about the $39 onboarding fee and 12% commission

### 11.2 Product Detail Page (`/marketplace/[slug]`)

- **Hero section** — Product name, tagline, creator avatar and name, price, "Buy Now" button, "Make Offer" button (for eligible categories)
- **Screenshots gallery** — Carousel or grid of product screenshots with lightbox
- **Description** — Full markdown-formatted description with features list
- **Tech stack** — Tags showing technologies used
- **What's included** — List of deliverables the buyer receives
- **Demo link** — External link to live demo (if available)
- **Creator card** — Avatar, name, bio, total products, total sales, other products by this creator
- **Reviews section** — Only from verified purchasers, with star breakdown, creator replies
- **Purchase CTA** — Fixed bottom bar on mobile, sidebar on desktop, with both Buy Now and Make Offer (if eligible)

### 11.3 Removed from Current Templates Page

- Cart drawer — single-product checkout replaces the cart model
- Multi-step checkout modal — Stripe handles the entire checkout flow
- Viewport preview mode — keep only in preview modal if useful for template products

---

## 12. Implementation Phases

### Phase 1: Database and Core Backend (Est. 3-4 hours)

1. Add marketplace creator fields to `users` table in `src/drizzle/schema.ts`
2. Create `marketplace_products`, `marketplace_orders`, `marketplace_reviews`, and `marketplace_offers` tables
3. Create enums: `marketplace_category_enum`, `marketplace_product_status_enum`, `marketplace_offer_status_enum`
4. Run `pnpm db:push` migration
5. Create `src/app/actions/marketplace.ts` with all server actions (creator, public, admin, offer)
6. Extend `src/server/stripe.ts` with Connect functions and marketplace constants
7. Add new Stripe API routes for creator onboarding, marketplace purchase, offer purchase, boost, Connect onboarding, and Connect dashboard
8. Extend Stripe webhook handler with marketplace event handlers

### Phase 2: Creator Flow (Est. 3-4 hours)

1. Build creator onboarding page (`/marketplace/creator/onboarding`) with four-step flow
2. Build Creator Dashboard (`/dashboard/creator`) with all tabs: Overview, Products, Orders, Offers, Analytics, Boost, Settings
3. Build product submission form with category selection, pricing, file upload, screenshots, description
4. Wire Stripe Connect Express onboarding flow
5. Wire $39 creator onboarding fee checkout
6. Build offer management UI in Creator Dashboard (accept/reject/counter)

### Phase 3: Marketplace Browse and Product Pages (Est. 3-4 hours)

1. Rename `/templates` to `/marketplace`, update Navbar and Footer links
2. Refactor `TemplateCard` to `MarketplaceProductCard` (wire to DB, add "Offers Welcome" badge)
3. Update categories to the six marketplace categories, wire filters and sort to DB queries
4. Build product detail page (`/marketplace/[slug]`) with Buy Now + Make Offer buttons
5. Build `MakeOfferModal` with price validation (minimum offer percentage)
6. Wire Stripe Connect checkout for direct purchases
7. Wire Stripe Connect checkout for accepted/countered offers

### Phase 4: Admin Panel (Est. 2-3 hours)

1. Add "Marketplace" to admin sidebar
2. Build admin marketplace page with tabs: Submissions, Products, Orders, Creators, Offers, Revenue, Boosts
3. Wire moderation actions (approve/reject with notes)
4. Wire admin featuring/unfeaturing
5. Build marketplace revenue dashboard section

### Phase 5: Reviews, Notifications, User Dashboard, and Polish (Est. 2-3 hours)

1. Build marketplace review system (purchase-gated, with creator reply)
2. Add "Purchases" tab to user dashboard with download links
3. Add "My Offers" tab to user dashboard with status and actions
4. Wire all notifications (in-app + email via Resend)
5. Build offer expiration system (cron job or check-on-access to expire offers after 72 hours)
6. Add marketplace boost system (same pattern as existing featured placement)
7. Polish UI, mobile responsiveness, empty states, loading states, error handling
8. TypeScript check, commit, push to GitHub

---

## 13. File Changes Summary

| Action | Files |
|--------|-------|
| **Rename** | `src/app/templates/` to `src/app/marketplace/` |
| **Modify** | `src/drizzle/schema.ts` (add 4 tables, 3 enums, user fields) |
| **Modify** | `src/server/stripe.ts` (add Connect functions, marketplace constants) |
| **Modify** | `src/app/api/stripe/webhook/route.ts` (add 5 new event handlers) |
| **Modify** | `src/components/Navbar.tsx` (rename Templates to Marketplace) |
| **Modify** | `src/components/Footer.tsx` (rename Templates to Marketplace) |
| **Modify** | `src/app/admin/layout.tsx` (add Marketplace menu item) |
| **Modify** | `src/app/dashboard/page.tsx` (add Purchases and My Offers tabs) |
| **Modify** | `src/server/email.ts` (add 9 marketplace email templates) |
| **Modify** | `src/app/actions/notifications.ts` (add marketplace notification type and events) |
| **Create** | `src/app/marketplace/page.tsx` (evolved from templates page) |
| **Create** | `src/app/marketplace/[slug]/page.tsx` (product detail with Make Offer) |
| **Create** | `src/app/marketplace/creator/onboarding/page.tsx` (creator onboarding flow) |
| **Create** | `src/app/dashboard/creator/page.tsx` (Creator Dashboard with 7 tabs) |
| **Create** | `src/app/admin/marketplace/page.tsx` (admin management with 7 tabs) |
| **Create** | `src/app/actions/marketplace.ts` (all server actions including offers) |
| **Create** | `src/components/MakeOfferModal.tsx` (offer submission modal) |
| **Create** | `src/components/OfferResponseModal.tsx` (creator accept/reject/counter modal) |
| **Create** | `src/app/api/stripe/creator-onboarding/route.ts` |
| **Create** | `src/app/api/stripe/marketplace-purchase/route.ts` |
| **Create** | `src/app/api/stripe/marketplace-offer-purchase/route.ts` |
| **Create** | `src/app/api/stripe/marketplace-boost/route.ts` |
| **Create** | `src/app/api/stripe/connect-onboarding/route.ts` |
| **Create** | `src/app/api/stripe/connect-dashboard/route.ts` |
| **Create** | `src/app/api/marketplace/upload/route.ts` |

---

## 14. Environment Variables

| Variable | Status | Notes |
|----------|--------|-------|
| `STRIPE_SECRET_KEY` | Exists | No change |
| `STRIPE_WEBHOOK_SECRET` | Exists | No change |
| `STRIPE_CONNECT_CLIENT_ID` | **New** | From Stripe Dashboard, Connect, Settings |
| `NEXT_PUBLIC_SUPABASE_URL` | Exists | Used for file uploads |
| `SUPABASE_SERVICE_ROLE_KEY` | Exists | Used for file uploads |
| `RESEND_API_KEY` | Exists | Used for email notifications |

---

## 15. Revenue Model Summary

| Revenue Stream | Mechanism | Amount |
|----------------|-----------|--------|
| **Creator onboarding fee** | One-time Stripe Checkout payment | **$39** per creator |
| **Sales commission** | Automatic via Stripe Connect `application_fee_amount` | **12%** of every sale |
| **Product boosts** | Self-serve Stripe Checkout | **$29** (7d), **$79** (30d), **$199** (90d) |

---

## 16. Key Design Decisions

1. **No cart model.** Single-product Stripe checkout is simpler, reduces complexity, and matches how digital product marketplaces like Gumroad and Lemon Squeezy work.

2. **Stripe Connect Express** (not Standard or Custom). Express accounts minimize creator friction while giving LaudStack control over the checkout experience and automatic commission collection.

3. **Purchase-gated reviews.** Only buyers can review products, preventing fake reviews and maintaining trust. The `orderId` foreign key on reviews enforces this at the database level.

4. **Separate Creator Dashboard** (not merged into Founder Dashboard). A user can be both a founder (listing their SaaS tool for discovery) and a marketplace creator (selling digital products). Keeping dashboards separate avoids confusion and allows each to evolve independently.

5. **Digital delivery via Supabase Storage.** Product files stored in a private Supabase Storage bucket, with signed time-limited download URLs generated on-demand for verified purchasers only.

6. **Make Offer limited to high-value categories only.** Enabling negotiation on Templates, Boilerplates, and Automation Tools would create unnecessary friction on low-price commodity products. Restricting offers to Micro-SaaS, Full Apps, and Startup Assets focuses negotiation where it adds real value.

7. **Single counter limit.** Each offer allows one counter-offer from the creator, keeping negotiations simple and preventing endless back-and-forth. If the buyer declines the counter, they can submit a new offer.

8. **72-hour offer expiration.** Prevents stale offers from cluttering the system and creates urgency for both parties to respond.

9. **12% commission on negotiated prices.** The same commission rate applies whether the buyer pays the listing price or a negotiated price, keeping the revenue model simple and predictable.

10. **Reuse existing boost pattern.** The marketplace boost system mirrors the existing tool featured placement system, keeping the codebase consistent and reducing development time.

---

## 17. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Stripe Connect requires additional Stripe account setup | Document setup steps clearly; test with Stripe test mode first |
| Migration adds four new tables and three enums | Use `pnpm db:push` which handles incremental migrations cleanly |
| $39 creator onboarding adds friction | Clearly communicate value proposition; fee is low enough to not deter serious creators but high enough to filter spam |
| Product quality control burden on admins | Start with manual review; add automated checks later if volume grows |
| Digital delivery security | Use signed, time-limited download URLs from Supabase Storage private bucket |
| Offer spam from buyers | Enforce minimum offer percentage (60% default), limit to 1 active offer per buyer per product, 72-hour expiration |
| Negotiation complexity | Single counter limit keeps it simple; no endless back-and-forth |
| Offer expiration edge cases | Check-on-access pattern (check `expiresAt` when loading offers) plus optional cron job for cleanup |

---

## 18. What Is NOT Included (v1 Exclusions)

The following features are explicitly excluded from the initial marketplace version and can be added in future iterations based on marketplace traction:

- Subscription-based products (only one-time purchases for v1)
- Refund automation (refunds handled manually through Stripe Dashboard)
- Creator messaging or chat systems
- Product versioning systems (creators can update files, buyers get latest version)
- Affiliate or referral systems for marketplace
- Product bundles or discount codes
- Multi-round negotiation (limited to one counter per offer)
- Escrow or milestone-based payments
- Creator analytics export (CSV/PDF)

---

**Next step:** Review and approve this plan, then development begins following the phased approach in Section 12.
