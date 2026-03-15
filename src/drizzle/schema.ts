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

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "super_admin"]);
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
});

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
});

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
});

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
});

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
});

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = typeof emailVerifications.$inferInsert;

// ─── Deals ───────────────────────────────────────────────────────────────────

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .notNull()
    .references(() => tools.id),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  discountPercent: integer("discount_percent"),
  couponCode: varchar("coupon_code", { length: 64 }),
  dealUrl: text("deal_url"),
  isActive: boolean("is_active").default(true).notNull(),
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  claimCount: integer("claim_count").default(0).notNull(),
  maxClaims: integer("max_claims"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

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
