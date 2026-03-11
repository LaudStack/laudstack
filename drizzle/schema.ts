import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /**
   * Manus OAuth identifier (openId) returned from the OAuth callback.
   * For LinkedIn users this is set to "linkedin:<linkedinId>".
   * For email/password users this is set to "email:<email>".
   * Unique per user.
   */
  openId: varchar("openId", { length: 128 }).notNull().unique(),
  /** Full display name */
  name: text("name"),
  /** First name extracted from OAuth profile (Google, LinkedIn) */
  firstName: varchar("firstName", { length: 128 }),
  /** Last name extracted from OAuth profile (Google, LinkedIn) */
  lastName: varchar("lastName", { length: 128 }),
  email: varchar("email", { length: 320 }),
  /** URL to the user's profile photo from OAuth provider */
  avatarUrl: text("avatarUrl"),
  /** City extracted from LinkedIn profile */
  city: varchar("city", { length: 128 }),
  /** State/region extracted from LinkedIn profile */
  state: varchar("state", { length: 128 }),
  /** Country extracted from LinkedIn profile */
  country: varchar("country", { length: 128 }),
  /** LinkedIn profile URL */
  linkedinUrl: text("linkedinUrl"),
  /** LinkedIn member ID for deduplication */
  linkedinId: varchar("linkedinId", { length: 64 }).unique(),
  /** Hashed password for email/password auth (bcrypt) */
  passwordHash: text("passwordHash"),
  /** Whether the email has been verified */
  emailVerified: boolean("emailVerified").default(false).notNull(),
  /** Email verification token (short-lived) */
  emailVerifyToken: varchar("emailVerifyToken", { length: 128 }),
  /** Password reset token (short-lived) */
  passwordResetToken: varchar("passwordResetToken", { length: 128 }),
  /** When the password reset token expires */
  passwordResetExpires: timestamp("passwordResetExpires"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Newsletter subscribers table.
 * Stores email addresses of users who have signed up for the LaudStack newsletter.
 */
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Optional first name for personalised welcome emails */
  firstName: varchar("firstName", { length: 128 }),
  /** Source of the subscription: footer, blog_sidebar, deals_page, etc. */
  source: varchar("source", { length: 64 }).default("footer"),
  /** Whether the welcome email was successfully sent */
  welcomeEmailSent: boolean("welcomeEmailSent").default(false).notNull(),
  /** Whether the subscriber has unsubscribed */
  unsubscribed: boolean("unsubscribed").default(false).notNull(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
