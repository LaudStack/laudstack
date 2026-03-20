import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  real,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["user", "customer_rep", "moderator", "analyst", "manager", "admin", "super_admin"]);
export const founderStatusEnum = pgEnum("founder_status", ["none", "pending", "verified", "rejected"]);
export const toolStatusEnum = pgEnum("tool_status", [
  "pending",
  "approved",
  "rejected",
  "featured",
  "suspended",
  "unpublished",
]);
export const pricingModelEnum = pgEnum("pricing_model", [
  "Free",
  "Freemium",
  "Paid",
  "Free Trial",
  "Open Source",
]);
export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "basic",
  "pro",
  "featured",
]);

// ─── Marketplace Enums ──────────────────────────────────────────────────────

export const marketplaceCategoryEnum = pgEnum("marketplace_category", [
  "templates",
  "saas_boilerplates",
  "micro_saas",
  "full_apps",
  "automation_tools",
  "startup_assets",
]);

export const marketplaceProductStatusEnum = pgEnum("marketplace_product_status", [
  "draft",
  "pending",
  "approved",
  "rejected",
  "paused",
]);

export const marketplaceOfferStatusEnum = pgEnum("marketplace_offer_status", [
  "pending",
  "accepted",
  "rejected",
  "countered",
  "expired",
  "completed",
  "cancelled",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Supabase Auth user ID */
  supabaseId: varchar("supabase_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").default("user").notNull(),
  /** Stripe customer ID for billing */
  stripeCustomerId: varchar("stripe_customer_id", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
  /** Profile fields — populated from LinkedIn or user settings */
  firstName: varchar("first_name", { length: 128 }),
  lastName: varchar("last_name", { length: 128 }),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 128 }),
  country: varchar("country", { length: 128 }),
  linkedinId: varchar("linkedin_id", { length: 128 }),
  linkedinUrl: text("linkedin_url"),
  loginMethod: varchar("login_method", { length: 32 }).default("email"),
  emailVerified: boolean("email_verified").default(false),
  /** Founder verification status: none → pending (after tool submit) → verified/rejected */
  founderStatus: founderStatusEnum("founder_status").default("none").notNull(),
  founderVerifiedAt: timestamp("founder_verified_at"),
  founderBio: text("founder_bio"),
  founderWebsite: text("founder_website"),
  /** User profile fields */
  bio: text("bio"),
  headline: varchar("headline", { length: 256 }),
  website: text("website"),
  twitterHandle: varchar("twitter_handle", { length: 128 }),
  /** Founder subscription */
  founderPlanActive: boolean("founder_plan_active").default(false),
  founderPlanExpiresAt: timestamp("founder_plan_expires_at"),
  /** Onboarding */
  onboardingCompleted: boolean("onboarding_completed").default(false),
  /** Additional profile fields for onboarding */
  jobTitle: varchar("job_title", { length: 128 }),
  company: varchar("company", { length: 128 }),
  useCase: varchar("use_case", { length: 64 }),
  referralSource: varchar("referral_source", { length: 64 }),
  welcomeEmailSent: boolean("welcome_email_sent").default(false).notNull(),
  /** Marketplace creator fields */
  isMarketplaceCreator: boolean("is_marketplace_creator").default(false).notNull(),
  creatorActivatedAt: timestamp("creator_activated_at"),
  stripeConnectAccountId: varchar("stripe_connect_account_id", { length: 128 }),
  stripeConnectOnboarded: boolean("stripe_connect_onboarded").default(false).notNull(),
  creatorOnboardingStripeSessionId: varchar("creator_onboarding_stripe_session_id", { length: 256 }),
  /** Privacy & notification preferences */
  publicProfile: boolean("public_profile").default(true).notNull(),
  showReviewsPublicly: boolean("show_reviews_publicly").default(true).notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  /** Founder-specific notification preferences */
  reviewAlerts: boolean("review_alerts").default(true).notNull(),
  weeklyReport: boolean("weekly_report").default(true).notNull(),
}, (table) => [
  index("users_email_idx").on(table.email),
  index("users_created_at_idx").on(table.createdAt),
  index("users_role_idx").on(table.role),
  index("users_supabase_id_idx").on(table.supabaseId),
  index("users_founder_status_idx").on(table.founderStatus),
]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Tools ────────────────────────────────────────────────────────────────────

export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  logoUrl: text("logo_url"),
  screenshotUrl: text("screenshot_url"),
  websiteUrl: text("website_url").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  pricingModel: pricingModelEnum("pricing_model").notNull().default("Freemium"),
  tags: jsonb("tags").$type<string[]>().default([]),
  badges: jsonb("badges").$type<string[]>().default([]),
  /** Submitted by which user */
  submittedBy: integer("submitted_by").references(() => users.id),
  status: toolStatusEnum("status").default("pending").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isPro: boolean("is_pro").default(false).notNull(),
  upvoteCount: integer("upvote_count").default(0).notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  averageRating: real("average_rating").default(0).notNull(),
  rankScore: real("rank_score").default(0).notNull(),
  weeklyRankChange: integer("weekly_rank_change").default(0),
  /** When the product was publicly launched */
  launchedAt: timestamp("launched_at").defaultNow().notNull(),
  /** Stripe product ID for Featured upgrades */
  stripeProductId: varchar("stripe_product_id", { length: 64 }),
  /** Typesense document ID */
  typesenseId: varchar("typesense_id", { length: 64 }),
  /** Affiliate link for monetization */
  affiliateUrl: text("affiliate_url"),
  /** Analytics counters */
  viewCount: integer("view_count").default(0).notNull(),
  outboundClickCount: integer("outbound_click_count").default(0).notNull(),
  saveCount: integer("save_count").default(0).notNull(),
  /** Visibility and moderation flags */
  isVisible: boolean("is_visible").default(true).notNull(),
  isSpotlighted: boolean("is_spotlighted").default(false).notNull(),
  isTrending: boolean("is_trending").default(false).notNull(),
  /** Founder who claimed this tool */
  claimedBy: integer("claimed_by").references(() => users.id),
  claimedAt: timestamp("claimed_at"),
  /** Admin-set scheduled launch date — when set to a future date, the tool appears on the Upcoming Launches page */
  scheduledLaunchAt: timestamp("scheduled_launch_at"),
  /** Short description for cards (max 200 chars) */
  shortDescription: text("short_description"),
  /** Full pricing details text */
  pricingDetails: text("pricing_details"),
  /** Structured features list — editable by admins and founders */
  features: jsonb("features").$type<{ icon: string; title: string; description: string }[]>().default([]),
  /** Structured pricing tiers — editable by admins and founders */
  pricingTiers: jsonb("pricing_tiers").$type<{ name: string; price: string; period?: string; description: string; features: string[]; cta: string; highlighted?: boolean; badge?: string }[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("tools_status_idx").on(table.status),
  index("tools_status_visible_idx").on(table.status, table.isVisible),
  index("tools_category_idx").on(table.category),
  index("tools_rank_score_idx").on(table.rankScore),
  index("tools_created_at_idx").on(table.createdAt),
  index("tools_launched_at_idx").on(table.launchedAt),
]);

export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;

// ─── Tool Screenshots ────────────────────────────────────────────────────────

export const toolScreenshots = pgTable("tool_screenshots", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: varchar("caption", { length: 256 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ToolScreenshot = typeof toolScreenshots.$inferSelect;
export type InsertToolScreenshot = typeof toolScreenshots.$inferInsert;

// ─── Moderation Logs ─────────────────────────────────────────────────────────

export const moderationLogs = pgTable("moderation_logs", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id, { onDelete: "cascade" }),
  adminId: integer("admin_id")
    .notNull()
    .references(() => users.id),
  action: varchar("action", { length: 64 }).notNull(), // approved, rejected, suspended, unpublished, featured, spotlighted, verified, unverified, claimed, unclaimed
  previousStatus: varchar("previous_status", { length: 32 }),
  newStatus: varchar("new_status", { length: 32 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ModerationLog = typeof moderationLogs.$inferSelect;
export type InsertModerationLog = typeof moderationLogs.$inferInsert;

// ─── Tool View Tracking ──────────────────────────────────────────────────────

export const toolViews = pgTable("tool_views", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id, { onDelete: "cascade" }),
  visitorIp: varchar("visitor_ip", { length: 64 }),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("tool_views_tool_id_idx").on(table.toolId),
  index("tool_views_created_at_idx").on(table.createdAt),
]);

export type ToolView = typeof toolViews.$inferSelect;

// ─── Outbound Click Tracking ─────────────────────────────────────────────────

export const outboundClicks = pgTable("outbound_clicks", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  linkType: varchar("link_type", { length: 32 }).notNull().default("website"), // website, affiliate
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("outbound_clicks_created_at_idx").on(table.createdAt),
]);

export type OutboundClick = typeof outboundClicks.$inferSelect;

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 256 }),
  body: text("body"),
  pros: text("pros"),
  cons: text("cons"),
  isVerified: boolean("is_verified").default(false).notNull(),
  helpfulCount: integer("helpful_count").default(0).notNull(),
  founderReply: text("founder_reply"),
  founderReplyAt: timestamp("founder_reply_at"),
  // Moderation fields
  status: text("status").default("published").notNull(), // published, hidden, removed, pending
  // Anti-fraud fields
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  // Flag fields (founder can flag for moderation)
  isFlagged: boolean("is_flagged").default(false).notNull(),
  flagReason: text("flag_reason"),
  flaggedBy: integer("flagged_by").references(() => users.id),
  flaggedAt: timestamp("flagged_at"),
  // Admin moderation
  moderationNote: text("moderation_note"),
  moderatedBy: integer("moderated_by").references(() => users.id),
  moderatedAt: timestamp("moderated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("reviews_tool_id_idx").on(table.toolId),
  index("reviews_user_id_idx").on(table.userId),
  index("reviews_status_idx").on(table.status),
  index("reviews_created_at_idx").on(table.createdAt),
]);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── Review Rate Limits ─────────────────────────────────────────────────────

export const reviewRateLimits = pgTable("review_rate_limits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  ipAddress: text("ip_address"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export type ReviewRateLimit = typeof reviewRateLimits.$inferSelect;

// ─── Upvotes ──────────────────────────────────────────────────────────────────

export const upvotes = pgTable("upvotes", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("upvotes_tool_user_unique").on(table.toolId, table.userId)]);

export type Upvote = typeof upvotes.$inferSelect;
export type InsertUpvote = typeof upvotes.$inferInsert;

// ─── Laud Rate Limits ────────────────────────────────────────────────────────

export const laudRateLimits = pgTable("laud_rate_limits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  ipAddress: varchar("ip_address", { length: 45 }),
  actionType: varchar("action_type", { length: 20 }).notNull().default("laud"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Saved Products ──────────────────────────────────────────────────────────────

export const savedTools = pgTable("saved_tools", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Newsletter Subscribers ───────────────────────────────────────────────────

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("first_name", { length: 128 }),
  source: varchar("source", { length: 64 }).default("footer"),
  welcomeEmailSent: boolean("welcome_email_sent").default(false).notNull(),
  unsubscribed: boolean("unsubscribed").default(false).notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber =
  typeof newsletterSubscribers.$inferInsert;

// ─── Tool Upgrades (Stripe) ───────────────────────────────────────────────────

export const toolUpgrades = pgTable("tool_upgrades", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  tier: subscriptionTierEnum("tier").notNull().default("featured"),
  stripeSessionId: varchar("stripe_session_id", { length: 128 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 128 }),
  amountPaid: integer("amount_paid"), // in cents
  currency: varchar("currency", { length: 3 }).default("usd"),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  /** When the featured period expires */
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ToolUpgrade = typeof toolUpgrades.$inferSelect;
export type InsertToolUpgrade = typeof toolUpgrades.$inferInsert;

// ─── Tool Claims ──────────────────────────────────────────────────────────────

export const toolClaims = pgTable("tool_claims", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  verificationToken: varchar("verification_token", { length: 128 }),
  notes: text("notes"),
  verifyMethod: varchar("verify_method", { length: 32 }),
  proofUrl: text("proof_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ToolClaim = typeof toolClaims.$inferSelect;
export type InsertToolClaim = typeof toolClaims.$inferInsert;

// ─── Tool Submissions ─────────────────────────────────────────────────────────

export const toolSubmissions = pgTable("tool_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  // Tool details
  name: varchar("name", { length: 128 }).notNull(),
  tagline: varchar("tagline", { length: 200 }).notNull(),
  website: varchar("website", { length: 512 }).notNull(),
  description: text("description").notNull(),
  logoUrl: varchar("logo_url", { length: 512 }),
  launchDate: timestamp("launch_date"),
  category: varchar("category", { length: 64 }),
  tags: text("tags"), // JSON array stored as text
  pricingModel: varchar("pricing_model", { length: 32 }),
  pricingPlans: text("pricing_plans"), // JSON stored as text
  screenshots: text("screenshots"), // JSON array stored as text
  demoVideoUrl: varchar("demo_video_url", { length: 512 }),
  // Verification
  verifyMethod: varchar("verify_method", { length: 32 }).default("meta").notNull(),
  verifyEmail: varchar("verify_email", { length: 256 }),
  verificationToken: varchar("verification_token", { length: 128 }),
  // Founder profile
  founderName: varchar("founder_name", { length: 128 }),
  founderRole: varchar("founder_role", { length: 128 }),
  founderBio: text("founder_bio"),
  founderLinkedin: varchar("founder_linkedin", { length: 512 }),
  // Status
  status: varchar("status", { length: 32 }).default("pending").notNull(), // pending | approved | rejected
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ToolSubmission = typeof toolSubmissions.$inferSelect;
export type InsertToolSubmission = typeof toolSubmissions.$inferInsert;

// ─── Email Verifications (6-digit OTP via Resend) ────────────────────────────

export const emailVerifications = pgTable("email_verifications", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 256 }).notNull(),
  supabaseId: varchar("supabase_id", { length: 128 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  /** Number of failed verification attempts against this code */
  attempts: integer("attempts").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("ev_email_supabase_idx").on(table.email, table.supabaseId),
  index("ev_expires_at_idx").on(table.expiresAt),
]);

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = typeof emailVerifications.$inferInsert;

// ─── Deal Enums ──────────────────────────────────────────────────────────────

export const dealPlacementEnum = pgEnum("deal_placement", [
  "none",
  "pinned",
  "featured",
  "deal_of_day",
]);

export const dealTypeEnum = pgEnum("deal_type", [
  "discount",
  "lifetime",
  "free_trial",
  "exclusive",
]);

export const dealApprovalStatusEnum = pgEnum("deal_approval_status", [
  "pending",
  "approved",
  "rejected",
]);

// ─── Deals ───────────────────────────────────────────────────────────────────

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  dealType: dealTypeEnum("deal_type").default("discount").notNull(),
  discountPercent: integer("discount_percent"),
  originalPrice: varchar("original_price", { length: 32 }),
  dealPrice: varchar("deal_price", { length: 32 }),
  couponCode: varchar("coupon_code", { length: 64 }),
  dealUrl: text("deal_url"),
  placement: dealPlacementEnum("placement").default("none").notNull(),
  approvalStatus: dealApprovalStatusEnum("approval_status").default("pending").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  claimCount: integer("claim_count").default(0).notNull(),
  maxClaims: integer("max_claims"),
  placementExpiresAt: timestamp("placement_expires_at"),
  placementPlan: varchar("placement_plan", { length: 32 }),
  placementPaidAmount: integer("placement_paid_amount"),
  placementStripeSessionId: varchar("placement_stripe_session_id", { length: 256 }),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

// ─── Deal Claims ─────────────────────────────────────────────────────────────

export const dealClaims = pgTable(
  "deal_claims",
  {
    id: serial("id").primaryKey(),
    dealId: integer("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueClaim: uniqueIndex("deal_claims_unique_idx").on(table.dealId, table.userId),
  })
);

export type DealClaim = typeof dealClaims.$inferSelect;
export type InsertDealClaim = typeof dealClaims.$inferInsert;

// ─── Platform Settings ───────────────────────────────────────────────────────

export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;

// ─── Launch Notifications ───────────────────────────────────────────────────
// Stores email subscriptions for upcoming tool launches ("Notify Me" feature)

export const launchNotifications = pgTable("launch_notifications", {
  id: serial("id").primaryKey(),
  /** Email address to notify */
  email: varchar("email", { length: 320 }).notNull(),
  /** The tool this notification is for */
  toolId: integer("tool_id").references(() => tools.id, { onDelete: "cascade" }),
  /** Optional: submission ID if the tool hasn't been created yet */
  submissionId: integer("submission_id").references(() => toolSubmissions.id, { onDelete: "cascade" }),
  /** Optional: logged-in user who subscribed */
  userId: integer("user_id").references(() => users.id),
  /** Whether the notification email has been sent */
  notified: boolean("notified").default(false).notNull(),
  /** When the notification email was sent */
  notifiedAt: timestamp("notified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("launch_notif_email_tool_idx").on(table.email, table.toolId),
]);

export type LaunchNotification = typeof launchNotifications.$inferSelect;
export type InsertLaunchNotification = typeof launchNotifications.$inferInsert;

// ─── Comments ───────────────────────────────────────────────────────────────
// Product-level commenting system — comments exist only on individual stack pages.
// Supports single-level replies (parent_comment_id) for founder/user responses.

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  /** The stack/tool this comment belongs to */
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id, { onDelete: "cascade" }),
  /** The user who wrote this comment */
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Parent comment ID for single-level replies (null = top-level comment) */
  parentCommentId: integer("parent_comment_id"),
  /** Comment text content */
  content: text("content").notNull(),
  /** Soft delete flag */
  isDeleted: boolean("is_deleted").default(false).notNull(),
  /** Timestamp when the comment was soft-deleted (null = not deleted) */
  deletedAt: timestamp("deleted_at"),
  /** Whether this comment has been edited */
  isEdited: boolean("is_edited").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("comments_tool_id_idx").on(table.toolId),
  index("comments_parent_id_idx").on(table.parentCommentId),
]);

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// ─── Review Helpful Votes ───────────────────────────────────────────────────
// Tracks which users have voted a review as helpful — one vote per user per review.
export const reviewHelpfulVotes = pgTable("review_helpful_votes", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("review_helpful_votes_unique").on(table.reviewId, table.userId),
  index("review_helpful_votes_review_idx").on(table.reviewId),
]);


// ─── Notifications ──────────────────────────────────────────────────────────
// In-app notifications for users, founders, and admins.

export const notificationTypeEnum = pgEnum("notification_type", [
  "new_review",        // A new review was posted on your tool (→ founder)
  "founder_reply",     // A founder replied to your review (→ reviewer)
  "comment_reply",     // Someone replied to your comment (→ commenter)
  "claim_approved",    // Your claim request was approved (→ founder)
  "claim_rejected",    // Your claim request was rejected (→ founder)
  "submission_approved", // Your tool submission was approved (→ founder)
  "submission_rejected", // Your tool submission was rejected (→ founder)
  "tool_verified",     // Your tool was verified (→ founder)
  "tool_featured",     // Your tool was featured (→ founder)
  "new_submission",    // A new tool was submitted (→ admin)
  "new_claim",         // A new claim request was filed (→ admin)
  "system",            // System/platform notification
]);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  /** The user who receives this notification */
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Notification category */
  type: notificationTypeEnum("type").notNull(),
  /** Human-readable title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Human-readable message body */
  message: text("message").notNull(),
  /** Optional link to navigate to when clicked */
  link: varchar("link", { length: 500 }),
  /** Whether the notification has been read */
  isRead: boolean("is_read").default(false).notNull(),
  /** Optional: the actor who triggered this notification */
  actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
  /** Optional: related tool */
  toolId: integer("tool_id").references(() => tools.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("notifications_recipient_idx").on(table.recipientId),
  index("notifications_recipient_read_idx").on(table.recipientId, table.isRead),
]);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─── Contact Submissions ──────────────────────────────────────────────────
// Persists all contact form submissions for admin review and audit trail.

export const contactSubmissionStatusEnum = pgEnum("contact_submission_status", [
  "new",
  "read",
  "replied",
  "archived",
]);

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  /** Sender's name */
  name: varchar("name", { length: 200 }).notNull(),
  /** Sender's email address */
  email: varchar("email", { length: 320 }).notNull(),
  /** Topic/category of the message */
  topic: varchar("topic", { length: 64 }).notNull().default("general"),
  /** Message body */
  message: text("message").notNull(),
  /** Processing status */
  status: contactSubmissionStatusEnum("status").notNull().default("new"),
  /** IP address for anti-spam */
  ipAddress: varchar("ip_address", { length: 45 }),
  /** Admin notes */
  adminNotes: text("admin_notes"),
  /** Whether the admin email was sent successfully */
  emailSent: boolean("email_sent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  archivedAt: timestamp("archived_at"),
}, (table) => [
  index("contact_submissions_status_idx").on(table.status),
  index("contact_submissions_created_idx").on(table.createdAt),
]);

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;


// ─── User Follows ──────────────────────────────────────────────────────────
// Tracks user-to-user follow relationships.

export const userFollows = pgTable("user_follows", {
  id: serial("id").primaryKey(),
  /** The user who is following */
  followerId: integer("follower_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** The user being followed */
  followingId: integer("following_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("user_follows_unique_idx").on(table.followerId, table.followingId),
  index("user_follows_follower_idx").on(table.followerId),
  index("user_follows_following_idx").on(table.followingId),
]);

export type UserFollow = typeof userFollows.$inferSelect;
export type InsertUserFollow = typeof userFollows.$inferInsert;

// ─── Stack Follows ─────────────────────────────────────────────────────────
// Tracks user-to-stack (tool) follow relationships.
// Users who follow a stack receive notifications only for new deals.

export const stackFollows = pgTable("stack_follows", {
  id: serial("id").primaryKey(),
  /** The user who is following the stack */
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** The stack/tool being followed */
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("stack_follows_unique_idx").on(table.userId, table.toolId),
  index("stack_follows_user_idx").on(table.userId),
  index("stack_follows_tool_idx").on(table.toolId),
]);

export type StackFollow = typeof stackFollows.$inferSelect;
export type InsertStackFollow = typeof stackFollows.$inferInsert;

// ─── Marketplace Products ──────────────────────────────────────────────────

export const marketplaceProducts = pgTable("marketplace_products", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  tagline: varchar("tagline", { length: 200 }).notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  category: marketplaceCategoryEnum("category").notNull(),
  /** Price in cents (0 = free) */
  price: integer("price").notNull(),
  /** Original price in cents for showing discounts */
  compareAtPrice: integer("compare_at_price"),
  /** Whether Make Offer is enabled (auto-set based on category) */
  offersEnabled: boolean("offers_enabled").default(false).notNull(),
  /** Minimum offer as percentage of listing price (e.g., 60 = buyer must offer at least 60%) */
  minimumOfferPercent: integer("minimum_offer_percent").default(60).notNull(),
  previewImageUrl: text("preview_image_url"),
  screenshots: jsonb("screenshots").$type<string[]>().default([]),
  demoUrl: text("demo_url"),
  /** Storage key for the digital product file */
  downloadFileKey: text("download_file_key"),
  downloadFileName: varchar("download_file_name", { length: 256 }),
  downloadFileSize: integer("download_file_size"),
  techStack: jsonb("tech_stack").$type<string[]>().default([]),
  includes: jsonb("includes").$type<string[]>().default([]),
  features: jsonb("features").$type<{ title: string; description: string }[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  /** Listing status */
  status: marketplaceProductStatusEnum("status").default("draft").notNull(),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  /** Admin featuring */
  isFeatured: boolean("is_featured").default(false).notNull(),
  /** Creator-purchased boost */
  isBoosted: boolean("is_boosted").default(false).notNull(),
  boostExpiresAt: timestamp("boost_expires_at"),
  boostPlan: varchar("boost_plan", { length: 32 }),
  boostStripeSessionId: varchar("boost_stripe_session_id", { length: 256 }),
  /** Cached aggregates */
  averageRating: real("average_rating").default(0).notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  salesCount: integer("sales_count").default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  totalRevenue: integer("total_revenue").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("mp_creator_idx").on(table.creatorId),
  index("mp_category_idx").on(table.category),
  index("mp_status_idx").on(table.status),
]);

export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;
export type InsertMarketplaceProduct = typeof marketplaceProducts.$inferInsert;

// ─── Marketplace Orders ────────────────────────────────────────────────────

export const marketplaceOrders = pgTable("marketplace_orders", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => marketplaceProducts.id, { onDelete: "cascade" }),
  buyerId: integer("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** If this order originated from a negotiated offer */
  offerId: integer("offer_id"),
  stripeSessionId: varchar("stripe_session_id", { length: 256 }).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 256 }),
  /** Total charged in cents */
  amount: integer("amount").notNull(),
  /** LaudStack commission in cents (12% of amount) */
  platformFee: integer("platform_fee").notNull(),
  /** Creator receives in cents (88% of amount) */
  creatorPayout: integer("creator_payout").notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  /** Order status: pending, completed, refunded */
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  downloadGranted: boolean("download_granted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mo_buyer_idx").on(table.buyerId),
  index("mo_creator_idx").on(table.creatorId),
  index("mo_product_idx").on(table.productId),
]);

export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = typeof marketplaceOrders.$inferInsert;

// ─── Marketplace Reviews ───────────────────────────────────────────────────

export const marketplaceReviews = pgTable("marketplace_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => marketplaceProducts.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Must have purchased to review */
  orderId: integer("order_id")
    .notNull()
    .references(() => marketplaceOrders.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 256 }).notNull(),
  body: text("body").notNull(),
  /** Creator's response */
  creatorReply: text("creator_reply"),
  creatorReplyAt: timestamp("creator_reply_at"),
  /** Status: published, hidden, removed */
  status: varchar("status", { length: 32 }).default("published").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("mr_product_idx").on(table.productId),
  index("mr_user_idx").on(table.userId),
]);

export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;
export type InsertMarketplaceReview = typeof marketplaceReviews.$inferInsert;

// ─── Marketplace Offers (Make Offer negotiation) ───────────────────────────

export const marketplaceOffers = pgTable("marketplace_offers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => marketplaceProducts.id, { onDelete: "cascade" }),
  buyerId: integer("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Buyer's proposed price in cents */
  offerAmountCents: integer("offer_amount_cents").notNull(),
  /** Optional message from buyer */
  message: text("message"),
  /** Current offer status */
  status: marketplaceOfferStatusEnum("status").default("pending").notNull(),
  /** Creator's counter-offer price in cents */
  counterAmountCents: integer("counter_amount_cents"),
  /** Creator's message with counter-offer */
  counterMessage: text("counter_message"),
  /** Creator's reason for rejection */
  rejectionReason: text("rejection_reason"),
  /** Stripe session for accepted/countered offer payment */
  stripeSessionId: varchar("stripe_session_id", { length: 256 }),
  /** Auto-expires 72 hours after creation or last counter */
  expiresAt: timestamp("expires_at").notNull(),
  /** When creator responded */
  respondedAt: timestamp("responded_at"),
  /** When payment was completed */
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mof_product_idx").on(table.productId),
  index("mof_buyer_idx").on(table.buyerId),
  index("mof_creator_idx").on(table.creatorId),
  index("mof_status_idx").on(table.status),
]);

export type MarketplaceOffer = typeof marketplaceOffers.$inferSelect;
export type InsertMarketplaceOffer = typeof marketplaceOffers.$inferInsert;

// ─── Email Templates ────────────────────────────────────────────────────────

export const emailTemplateRecipientEnum = pgEnum("email_template_recipient", [
  "user", "founder", "admin",
]);

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  subject: varchar("subject", { length: 512 }).notNull(),
  trigger: varchar("trigger", { length: 256 }).notNull(),
  recipient: emailTemplateRecipientEnum("recipient").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  bodyHtml: text("body_html"),
  bodyText: text("body_text"),
  preview: text("preview"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;


// ─── Promotions System ───────────────────────────────────────────────────────

export const promotionTargetEnum = pgEnum("promotion_target", [
  "stack",          // Tool/stack featured placement
  "deal",           // Deal placement (pinned, featured, deal_of_day)
  "marketplace",    // Marketplace product boost
]);

export const promotionTypeEnum = pgEnum("promotion_type", [
  // Stack promotions
  "stack_featured",
  "stack_spotlight",
  "stack_category_boost",
  // Deal promotions
  "deal_pinned",
  "deal_featured",
  "deal_of_day",
  // Marketplace promotions
  "marketplace_boost",
  "marketplace_spotlight",
]);

export const promotionStatusEnum = pgEnum("promotion_status", [
  "pending_payment",
  "paid",
  "scheduled",
  "active",
  "expired",
  "cancelled",
  "failed",
  "paused",
]);

/**
 * Unified promotions table — single source of truth for all paid promotions
 * across stacks, deals, and marketplace products.
 */
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  /** Who purchased this promotion */
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  /** What type of entity is being promoted */
  target: promotionTargetEnum("target").notNull(),
  /** Specific promotion type */
  type: promotionTypeEnum("type").notNull(),
  /** The promoted entity ID — toolId for stacks, dealId for deals, productId for marketplace */
  targetEntityId: integer("target_entity_id").notNull(),
  /** Duration in days (1 for deal_of_day, 3/7/14/30 for others) */
  durationDays: integer("duration_days").notNull(),
  /** Price paid in cents */
  amountPaid: integer("amount_paid").notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  /** Promotion lifecycle status */
  status: promotionStatusEnum("status").default("pending_payment").notNull(),
  /** Stripe checkout session ID */
  stripeSessionId: varchar("stripe_session_id", { length: 256 }),
  /** Stripe payment intent ID */
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 256 }),
  /** When the promotion should start (after payment) */
  startsAt: timestamp("starts_at"),
  /** When the promotion expires (startsAt + durationDays) */
  expiresAt: timestamp("expires_at"),
  /** For Deal of the Day: the specific date slot booked */
  slotDate: varchar("slot_date", { length: 10 }),  // YYYY-MM-DD format
  /** Admin who manually created/modified this promotion (null = self-serve) */
  adminId: integer("admin_id").references(() => users.id),
  /** Admin notes for manual overrides */
  adminNotes: text("admin_notes"),
  /** Whether this was manually assigned by admin (bypasses payment) */
  isManual: boolean("is_manual").default(false).notNull(),
  /** Whether admin has paused this promotion */
  isPaused: boolean("is_paused").default(false).notNull(),
  /** Number of times this promotion was displayed to users */
  impressionCount: integer("impression_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("promo_user_idx").on(table.userId),
  index("promo_target_entity_idx").on(table.target, table.targetEntityId),
  index("promo_status_idx").on(table.status),
  index("promo_expires_idx").on(table.expiresAt),
  index("promo_slot_date_idx").on(table.slotDate),
]);
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;

/**
 * Admin-managed pricing rules for promotions.
 * Database-driven pricing — no hardcoded constants.
 */
export const promotionPricing = pgTable("promotion_pricing", {
  id: serial("id").primaryKey(),
  /** Which promotion type this pricing applies to */
  promotionType: promotionTypeEnum("promotion_type").notNull(),
  /** Duration in days */
  durationDays: integer("duration_days").notNull(),
  /** Price in cents */
  priceInCents: integer("price_in_cents").notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  /** Display name shown to users */
  displayName: varchar("display_name", { length: 128 }).notNull(),
  /** Description shown to users */
  description: text("description"),
  /** Whether this pricing option is currently available for purchase */
  isActive: boolean("is_active").default(true).notNull(),
  /** Whether to show "Recommended" badge in UI */
  isRecommended: boolean("is_recommended").default(false).notNull(),
  /** Sort order for display */
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("pricing_type_duration_idx").on(table.promotionType, table.durationDays),
]);
export type PromotionPricing = typeof promotionPricing.$inferSelect;
export type InsertPromotionPricing = typeof promotionPricing.$inferInsert;

/**
 * Deal of the Day exclusive slot reservations.
 * Prevents double-booking and handles race conditions.
 */
export const dealOfDaySlots = pgTable("deal_of_day_slots", {
  id: serial("id").primaryKey(),
  /** The date this slot is for (YYYY-MM-DD) */
  slotDate: varchar("slot_date", { length: 10 }).notNull().unique(),
  /** The promotion that booked this slot */
  promotionId: integer("promotion_id")
    .notNull()
    .references(() => promotions.id),
  /** The deal being promoted */
  dealId: integer("deal_id")
    .notNull()
    .references(() => deals.id),
  /** Who booked it */
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  /** Whether this slot is confirmed (payment completed) */
  isConfirmed: boolean("is_confirmed").default(false).notNull(),
  /** Temporary hold expiry — slot is released if payment not completed by this time */
  holdExpiresAt: timestamp("hold_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("dotd_slot_date_idx").on(table.slotDate),
  index("dotd_promotion_idx").on(table.promotionId),
]);
export type DealOfDaySlot = typeof dealOfDaySlots.$inferSelect;
export type InsertDealOfDaySlot = typeof dealOfDaySlots.$inferInsert;

// ─── Admin Audit Log ──────────────────────────────────────────────────────────

export const auditActionEnum = pgEnum("audit_action", [
  "role_change",
  "user_delete",
  "tool_approve",
  "tool_reject",
  "tool_suspend",
  "tool_delete",
  "tool_feature",
  "tool_edit",
  "review_approve",
  "review_hide",
  "review_remove",
  "review_delete",
  "deal_approve",
  "deal_reject",
  "deal_delete",
  "promotion_assign",
  "promotion_cancel",
  "founder_verify",
  "founder_reject",
  "claim_approve",
  "claim_reject",
  "settings_update",
  "staff_invite",
  "ranking_recalc",
  "comment_delete",
  "marketplace_approve",
  "marketplace_reject",
  "other",
]);

export const adminAuditLog = pgTable("admin_audit_log", {
  id: serial("id").primaryKey(),
  /** The admin who performed the action */
  adminId: integer("admin_id")
    .notNull()
    .references(() => users.id),
  /** What action was performed */
  action: auditActionEnum("action").notNull(),
  /** Human-readable description of the action */
  description: text("description").notNull(),
  /** The entity type affected (user, tool, review, deal, etc.) */
  entityType: varchar("entity_type", { length: 64 }),
  /** The ID of the affected entity */
  entityId: integer("entity_id"),
  /** Additional metadata as JSON (old values, new values, etc.) */
  metadata: jsonb("metadata"),
  /** IP address of the admin */
  ipAddress: varchar("ip_address", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("audit_admin_idx").on(table.adminId),
  index("audit_action_idx").on(table.action),
  index("audit_created_idx").on(table.createdAt),
  index("audit_entity_idx").on(table.entityType, table.entityId),
]);
export type AdminAuditLog = typeof adminAuditLog.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLog.$inferInsert;

// ─── Cron Job Runs ────────────────────────────────────────────────────────────

export const cronJobRuns = pgTable("cron_job_runs", {
  id: serial("id").primaryKey(),
  /** The cron job name/path */
  jobName: varchar("job_name", { length: 128 }).notNull(),
  /** Whether the run was successful */
  success: boolean("success").notNull(),
  /** Duration in milliseconds */
  durationMs: integer("duration_ms"),
  /** Number of items processed (e.g., tools recalculated, promotions expired) */
  itemsProcessed: integer("items_processed"),
  /** Error message if failed */
  errorMessage: text("error_message"),
  /** Additional result metadata */
  metadata: jsonb("metadata"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("cron_job_name_idx").on(table.jobName),
  index("cron_started_idx").on(table.startedAt),
]);
export type CronJobRun = typeof cronJobRuns.$inferSelect;
export type InsertCronJobRun = typeof cronJobRuns.$inferInsert;

// ─── Ranking Algorithm Weights ────────────────────────────────────────────────

export const rankingWeights = pgTable("ranking_weights", {
  id: serial("id").primaryKey(),
  /** Weight name (e.g., avg_rating, review_count, etc.) */
  weightName: varchar("weight_name", { length: 64 }).notNull().unique(),
  /** Display label for the admin UI */
  displayLabel: varchar("display_label", { length: 128 }).notNull(),
  /** The multiplier value */
  weightValue: real("weight_value").notNull(),
  /** Description of what this weight affects */
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
});
export type RankingWeight = typeof rankingWeights.$inferSelect;
export type InsertRankingWeight = typeof rankingWeights.$inferInsert;

// ─── Admin Invites ────────────────────────────────────────────────────────────

export const adminInviteStatusEnum = pgEnum("admin_invite_status", [
  "pending",
  "accepted",
  "expired",
  "revoked",
]);

export const adminInvites = pgTable("admin_invites", {
  id: serial("id").primaryKey(),
  /** Email address of the invited person */
  email: varchar("email", { length: 256 }).notNull(),
  /** Role to assign upon acceptance */
  role: userRoleEnum("role").notNull(),
  /** Secure random token for the invite link */
  token: varchar("token", { length: 128 }).notNull().unique(),
  /** Token expiration (24 hours from creation) */
  expiresAt: timestamp("expires_at").notNull(),
  /** Current status of the invite */
  status: adminInviteStatusEnum("status").default("pending").notNull(),
  /** Super Admin who created the invite */
  invitedBy: integer("invited_by")
    .notNull()
    .references(() => users.id),
  /** Optional personal message included in the invite email */
  message: text("message"),
  /** When the invite was accepted */
  acceptedAt: timestamp("accepted_at"),
  /** The user account created from this invite */
  acceptedUserId: integer("accepted_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("admin_invites_email_idx").on(table.email),
  index("admin_invites_token_idx").on(table.token),
  index("admin_invites_status_idx").on(table.status),
]);

export type AdminInvite = typeof adminInvites.$inferSelect;
export type InsertAdminInvite = typeof adminInvites.$inferInsert;
