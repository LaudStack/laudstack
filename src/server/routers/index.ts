import { z } from "zod";
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
import { sendWelcomeEmail } from "../email";
import { searchTools as typesenseSearch } from "../search";

// ─── Newsletter router ────────────────────────────────────────────────────────

const newsletterRouter = router({
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address"),
        firstName: z.string().max(80).optional(),
        source: z.string().max(40).optional(),
      })
    )
    .mutation(async ({ input }) => {
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
      // Try Typesense first, fall back to DB search
      const typesenseResult = await typesenseSearch(input.query, {
        category: input.category,
        pricingModel: input.pricingModel,
        isFeatured: input.isFeatured,
        page: input.page,
        perPage: input.perPage,
      });

      if (typesenseResult) {
        return { source: "typesense" as const, result: typesenseResult };
      }

      // Fallback to DB
      const dbResults = await dbSearchTools(input.query, input.perPage);
      return { source: "db" as const, result: dbResults };
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

// ─── App router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  newsletter: newsletterRouter,
  tools: toolsRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
