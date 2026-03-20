import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import {
  subscribeToNewsletter,
  markWelcomeEmailSent,
  getTools,
  getToolBySlug,
  getTrendingTools,
  getRecentLaunches,
  searchTools as dbSearchTools,
  getUserBySupabaseId,
  upsertUser,
} from "../db";
import { sendWelcomeEmail, sendContactFormEmail } from "../email";
import { contactSubmissions } from "@/drizzle/schema";
import { notifyAdmins } from "@/app/actions/notifications";
import { searchToolsPg } from "../search";

// ─── Rate limiter (in-memory, per-IP) ─────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 subscribe attempts per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

// Periodic cleanup of stale entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 300_000);

// ─── Newsletter router ────────────────────────────────────────────────────────

const newsletterRouter = router({
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address"),
        firstName: z
          .string()
          .max(80)
          .optional()
          .transform((v) => v?.trim().replace(/[<>]/g, "") || undefined),
        source: z.string().max(40).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limiting by IP
      const ip =
        ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        ctx.req.headers.get("x-real-ip") ||
        "unknown";
      if (!checkRateLimit(ip)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again in a minute.",
        });
      }

      const { isNew, alreadyUnsubscribed } = await subscribeToNewsletter({
        email: input.email,
        firstName: input.firstName ?? null,
        source: input.source ?? "website",
      });

      if (!isNew && !alreadyUnsubscribed) {
        return {
          success: true,
          alreadySubscribed: true,
          welcomeEmailSent: false,
        };
      }

      // Fire welcome email asynchronously
      sendWelcomeEmail(input.email, input.firstName ?? null)
        .then((sent) => {
          if (sent) {
            markWelcomeEmailSent(input.email).catch(console.error);
          }
        })
        .catch(console.error);

      return {
        success: true,
        alreadySubscribed: false,
        welcomeEmailSent: true,
        reSubscribed: alreadyUnsubscribed,
      };
    }),
});

// ─── Tools router ─────────────────────────────────────────────────────────────

const toolsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        pricingModel: z.string().optional(),
        isFeatured: z.boolean().optional(),
        sort: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return getTools(input);
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return getToolBySlug(input.slug);
    }),

  trending: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(4) }))
    .query(async ({ input }) => {
      return getTrendingTools(input.limit);
    }),

  recentLaunches: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(4) }))
    .query(async ({ input }) => {
      return getRecentLaunches(input.limit);
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        category: z.string().optional(),
        pricingModel: z.string().optional(),
        isFeatured: z.boolean().optional(),
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const result = await searchToolsPg(input.query, {
        category: input.category,
        pricingModel: input.pricingModel,
        isFeatured: input.isFeatured,
        page: input.page,
        perPage: input.perPage,
      });
      return {
        source: "pg" as const,
        tools: result.results.map(r => r.tool),
        total: result.total,
        page: result.page,
        perPage: result.perPage,
      };
    }),
});

// ─── Auth router ──────────────────────────────────────────────────────────────

const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user),

  syncUser: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        avatarUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.supabaseUser) return null;
      return upsertUser({
        supabaseId: ctx.supabaseUser.id,
        email: ctx.supabaseUser.email,
        name: input.name ?? ctx.supabaseUser.user_metadata?.full_name,
        avatarUrl:
          input.avatarUrl ?? ctx.supabaseUser.user_metadata?.avatar_url,
      });
    }),
});

// ─── Contact rate limiter (separate from newsletter) ────────────────────────

const contactRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const CONTACT_RATE_WINDOW_MS = 300_000; // 5 minutes
const CONTACT_RATE_MAX = 3; // max 3 contact submissions per 5 minutes per IP

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = contactRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    contactRateLimitMap.set(ip, { count: 1, resetAt: now + CONTACT_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= CONTACT_RATE_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

// Periodic cleanup of stale contact rate limit entries (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of contactRateLimitMap) {
    if (now > entry.resetAt) contactRateLimitMap.delete(key);
  }
}, 600_000);

// ─── Contact router ──────────────────────────────────────────────────────────

const contactRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(200),
        email: z.string().email("Please enter a valid email"),
        topic: z.string().max(64).default("general"),
        message: z.string().min(10, "Message must be at least 10 characters").max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limiting by IP
      const ip =
        ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        ctx.req.headers.get("x-real-ip") ||
        "unknown";
      if (!checkContactRateLimit(ip)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many messages. Please try again in a few minutes.",
        });
      }

      // Basic spam detection: reject if message is all caps or contains too many URLs
      const urlCount = (input.message.match(/https?:\/\//gi) || []).length;
      if (urlCount > 5) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Message contains too many links and was flagged as spam.",
        });
      }

      // 1. Persist to database
      const { db: dbInstance } = await import("@/server/db");
      let submissionId: number | null = null;
      try {
        const [inserted] = await dbInstance
          .insert(contactSubmissions)
          .values({
            name: input.name,
            email: input.email,
            topic: input.topic,
            message: input.message,
            ipAddress: ip,
            status: "new",
            emailSent: false,
          })
          .returning({ id: contactSubmissions.id });
        submissionId = inserted?.id ?? null;
      } catch (dbErr) {
        console.error("[Contact] Failed to persist submission to DB:", dbErr);
        // Continue — we still want to send the email even if DB fails
      }

      // 2. Send admin email notification (non-blocking)
      sendContactFormEmail(input)
        .then(async (sent) => {
          // Update emailSent flag in DB
          if (submissionId && sent) {
            try {
              const { db: dbInner } = await import("@/server/db");
              const { eq } = await import("drizzle-orm");
              await dbInner
                .update(contactSubmissions)
                .set({ emailSent: true })
                .where(eq(contactSubmissions.id, submissionId));
            } catch (e) {
              console.error("[Contact] Failed to update emailSent flag:", e);
            }
          }
        })
        .catch((err) => console.error("[Contact] Email send failed:", err));

      // 3. In-app notification for admins (non-blocking)
      const topicLabels: Record<string, string> = {
        general: "General Inquiry",
        launch: "Launch / Update a Stack",
        trust: "Report a Listing or Review",
        partnership: "Partnership or Press",
        support: "Account Support",
        deals: "Deals & Promotions",
        marketplace: "Marketplace",
        other: "Other",
      };
      const topicLabel = topicLabels[input.topic] || input.topic;
      notifyAdmins({
        type: "system",
        title: "New Contact Message",
        message: `${input.name} (${input.email}) \u2014 ${topicLabel}: ${input.message.slice(0, 100)}${input.message.length > 100 ? "..." : ""}`,
        link: "/ops-console/messages",
      }).catch((err) => console.error("[Contact] In-app notification failed:", err));

      return { success: true };
    }),
});

// ─── App router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  newsletter: newsletterRouter,
  tools: toolsRouter,
  auth: authRouter,
  contact: contactRouter,
});

export type AppRouter = typeof appRouter;
