import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  bigint,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

// ─── Users ──────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Stacks (the core listing) ──────────────────────────────────────────────
export const stacks = mysqlTable(
  "stacks",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    tagline: varchar("tagline", { length: 500 }).notNull(),
    description: text("description").notNull(),
    logoUrl: text("logoUrl"),
    screenshotUrl: text("screenshotUrl"),
    websiteUrl: text("websiteUrl"),
    affiliateUrl: text("affiliateUrl"),

    // Classification
    category: varchar("category", { length: 100 }).notNull(),
    pricingModel: varchar("pricingModel", { length: 50 }).notNull().default("Freemium"),
    pricingDetails: text("pricingDetails"),
    tags: json("tags").$type<string[]>(),

    // Ownership & claiming
    founderId: int("founderId"), // FK to users.id — null = unclaimed
    claimedAt: timestamp("claimedAt"),

    // Moderation & visibility
    status: mysqlEnum("status", [
      "draft",
      "pending_review",
      "published",
      "suspended",
      "rejected",
    ])
      .default("published")
      .notNull(),
    isVerified: boolean("isVerified").default(false).notNull(),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    isTrending: boolean("isTrending").default(false).notNull(),
    isSpotlighted: boolean("isSpotlighted").default(false).notNull(),

    // Denormalized counters (updated via triggers/procedures)
    laudCount: int("laudCount").default(0).notNull(),
    saveCount: int("saveCount").default(0).notNull(),
    reviewCount: int("reviewCount").default(0).notNull(),
    averageRating: decimal("averageRating", { precision: 3, scale: 2 })
      .default("0.00")
      .notNull(),
    viewCount: int("viewCount").default(0).notNull(),
    clickCount: int("clickCount").default(0).notNull(),

    // Ranking
    rankScore: int("rankScore").default(0).notNull(),
    weeklyRankChange: int("weeklyRankChange").default(0).notNull(),

    // Metadata
    launchedAt: timestamp("launchedAt"),
    addedBy: mysqlEnum("addedBy", ["admin", "founder"])
      .default("admin")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_stacks_category").on(table.category),
    index("idx_stacks_status").on(table.status),
    index("idx_stacks_founderId").on(table.founderId),
    index("idx_stacks_rankScore").on(table.rankScore),
  ]
);

export type Stack = typeof stacks.$inferSelect;
export type InsertStack = typeof stacks.$inferInsert;

// ─── Stack Screenshots (multiple per stack) ─────────────────────────────────
export const stackScreenshots = mysqlTable(
  "stack_screenshots",
  {
    id: int("id").autoincrement().primaryKey(),
    stackId: int("stackId").notNull(),
    url: text("url").notNull(),
    caption: varchar("caption", { length: 255 }),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("idx_screenshots_stackId").on(table.stackId)]
);

export type StackScreenshot = typeof stackScreenshots.$inferSelect;

// ─── Reviews ────────────────────────────────────────────────────────────────
export const reviews = mysqlTable(
  "reviews",
  {
    id: int("id").autoincrement().primaryKey(),
    stackId: int("stackId").notNull(),
    userId: int("userId").notNull(),
    rating: int("rating").notNull(), // 1-5
    title: varchar("title", { length: 255 }).notNull(),
    body: text("body").notNull(),
    pros: json("pros").$type<string[]>(),
    cons: json("cons").$type<string[]>(),
    helpfulCount: int("helpfulCount").default(0).notNull(),

    // Founder reply
    founderReply: text("founderReply"),
    founderReplyAt: timestamp("founderReplyAt"),

    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_reviews_stackId").on(table.stackId),
    index("idx_reviews_userId").on(table.userId),
    uniqueIndex("idx_reviews_unique").on(table.stackId, table.userId),
  ]
);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── Lauds (upvotes) ───────────────────────────────────────────────────────
export const lauds = mysqlTable(
  "lauds",
  {
    id: int("id").autoincrement().primaryKey(),
    stackId: int("stackId").notNull(),
    userId: int("userId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_lauds_unique").on(table.stackId, table.userId),
    index("idx_lauds_stackId").on(table.stackId),
  ]
);

export type Laud = typeof lauds.$inferSelect;

// ─── Saves (bookmarks) ─────────────────────────────────────────────────────
export const saves = mysqlTable(
  "saves",
  {
    id: int("id").autoincrement().primaryKey(),
    stackId: int("stackId").notNull(),
    userId: int("userId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_saves_unique").on(table.stackId, table.userId),
    index("idx_saves_stackId").on(table.stackId),
  ]
);

export type Save = typeof saves.$inferSelect;

// ─── Click Tracking ─────────────────────────────────────────────────────────
export const clicks = mysqlTable(
  "clicks",
  {
    id: int("id").autoincrement().primaryKey(),
    stackId: int("stackId").notNull(),
    userId: int("userId"), // nullable for anonymous
    type: mysqlEnum("type", ["website", "affiliate"]).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("idx_clicks_stackId").on(table.stackId)]
);

export type Click = typeof clicks.$inferSelect;

// ─── View Tracking ──────────────────────────────────────────────────────────
export const views = mysqlTable(
  "views",
  {
    id: int("id").autoincrement().primaryKey(),
    stackId: int("stackId").notNull(),
    userId: int("userId"), // nullable for anonymous
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("idx_views_stackId").on(table.stackId)]
);

export type View = typeof views.$inferSelect;

// ─── Verification Requests ──────────────────────────────────────────────────
export const verificationRequests = mysqlTable(
  "verification_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    stackId: int("stackId").notNull(),
    userId: int("userId").notNull(), // founder requesting
    status: mysqlEnum("status", ["pending", "approved", "rejected"])
      .default("pending")
      .notNull(),
    notes: text("notes"), // admin notes
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("idx_verification_stackId").on(table.stackId)]
);

export type VerificationRequest = typeof verificationRequests.$inferSelect;

// ─── Newsletter Subscribers ─────────────────────────────────────────────────
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("firstName", { length: 128 }),
  source: varchar("source", { length: 64 }).default("footer"),
  welcomeEmailSent: boolean("welcomeEmailSent").default(false).notNull(),
  unsubscribed: boolean("unsubscribed").default(false).notNull(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber =
  typeof newsletterSubscribers.$inferInsert;
