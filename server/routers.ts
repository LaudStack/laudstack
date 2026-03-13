import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import {
  subscribeToNewsletter,
  markWelcomeEmailSent,
  createStack,
  updateStack,
  getStackById,
  getStackBySlug,
  listStacks,
  deleteStack,
  getStacksByFounder,
  createReview,
  getReviewsByStackWithUsers,
  getUserReviewForStack,
  updateFounderReply,
  incrementHelpful,
  toggleLaud,
  hasUserLauded,
  getUserLauds,
  toggleSave,
  hasUserSaved,
  getUserSaves,
  getSavedStacks,
  recordClick,
  recordView,
  getClickStats,
  createVerificationRequest,
  updateVerificationRequest,
  getVerificationRequests,
  addScreenshot,
  getScreenshots,
  deleteScreenshot,
  getAdminDashboardStats,
  recalcRankScores,
  getAllUsers,
} from "./db";
import { sendWelcomeEmail } from "./newsletter";
import { storagePut } from "./storage";

// ─── Shared Zod schemas ────────────────────────────────────────────────────

const stackCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  tagline: z.string().min(1).max(500),
  description: z.string().min(1),
  logoUrl: z.string().nullable().optional(),
  screenshotUrl: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  affiliateUrl: z.string().nullable().optional(),
  category: z.string().min(1).max(100),
  pricingModel: z.string().max(50).default("Freemium"),
  pricingDetails: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "pending_review", "published", "suspended", "rejected"]).optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isSpotlighted: z.boolean().optional(),
  launchedAt: z.date().nullable().optional(),
});

const stackUpdateSchema = stackCreateSchema.partial().extend({
  id: z.number(),
});

// ─── App Router ─────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Public Stack endpoints ─────────────────────────────────────────────
  stacks: router({
    list: publicProcedure
      .input(
        z.object({
          status: z.string().optional(),
          category: z.string().optional(),
          pricingModel: z.string().optional(),
          search: z.string().optional(),
          sort: z.enum(["rank", "newest", "top_rated", "most_reviewed", "most_lauded", "trending"]).optional(),
          isFeatured: z.boolean().optional(),
          isTrending: z.boolean().optional(),
          isVerified: z.boolean().optional(),
          limit: z.number().min(1).max(100).optional(),
          offset: z.number().min(0).optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const opts = input ?? {};
        // Default to published stacks for public
        if (!opts.status) opts.status = "published";
        return listStacks(opts);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const stack = await getStackBySlug(input.slug);
        if (!stack) return null;
        const screenshots = await getScreenshots(stack.id);
        return { ...stack, screenshots };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getStackById(input.id);
      }),

    recordView: publicProcedure
      .input(z.object({ stackId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await recordView(input.stackId, ctx.user?.id);
        return { success: true };
      }),

    recordClick: publicProcedure
      .input(z.object({ stackId: z.number(), type: z.enum(["website", "affiliate"]) }))
      .mutation(async ({ input, ctx }) => {
        await recordClick(input.stackId, input.type, ctx.user?.id);
        return { success: true };
      }),
  }),

  // ─── Reviews ────────────────────────────────────────────────────────────
  reviews: router({
    listByStack: publicProcedure
      .input(z.object({ stackId: z.number(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return getReviewsByStackWithUsers(input.stackId, input.limit ?? 50, input.offset ?? 0);
      }),

    myReview: protectedProcedure
      .input(z.object({ stackId: z.number() }))
      .query(async ({ input, ctx }) => {
        return getUserReviewForStack(ctx.user.id, input.stackId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          stackId: z.number(),
          rating: z.number().min(1).max(5),
          title: z.string().min(1).max(255),
          body: z.string().min(30),
          pros: z.array(z.string()).optional(),
          cons: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existing = await getUserReviewForStack(ctx.user.id, input.stackId);
        if (existing) throw new Error("You have already reviewed this stack");
        await createReview({
          stackId: input.stackId,
          userId: ctx.user.id,
          rating: input.rating,
          title: input.title,
          body: input.body,
          pros: input.pros?.filter(Boolean) ?? null,
          cons: input.cons?.filter(Boolean) ?? null,
        });
        return { success: true };
      }),

    markHelpful: publicProcedure
      .input(z.object({ reviewId: z.number() }))
      .mutation(async ({ input }) => {
        await incrementHelpful(input.reviewId);
        return { success: true };
      }),

    founderReply: protectedProcedure
      .input(z.object({ reviewId: z.number(), reply: z.string().min(1) }))
      .mutation(async ({ input }) => {
        await updateFounderReply(input.reviewId, input.reply);
        return { success: true };
      }),
  }),

  // ─── Lauds (upvotes) ───────────────────────────────────────────────────
  lauds: router({
    toggle: protectedProcedure
      .input(z.object({ stackId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const lauded = await toggleLaud(input.stackId, ctx.user.id);
        return { lauded };
      }),

    check: protectedProcedure
      .input(z.object({ stackId: z.number() }))
      .query(async ({ input, ctx }) => {
        return { lauded: await hasUserLauded(input.stackId, ctx.user.id) };
      }),

    myLauds: protectedProcedure.query(async ({ ctx }) => {
      return getUserLauds(ctx.user.id);
    }),
  }),

  // ─── Saves (bookmarks) ─────────────────────────────────────────────────
  saves: router({
    toggle: protectedProcedure
      .input(z.object({ stackId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const saved = await toggleSave(input.stackId, ctx.user.id);
        return { saved };
      }),

    check: protectedProcedure
      .input(z.object({ stackId: z.number() }))
      .query(async ({ input, ctx }) => {
        return { saved: await hasUserSaved(input.stackId, ctx.user.id) };
      }),

    mySaves: protectedProcedure.query(async ({ ctx }) => {
      return getUserSaves(ctx.user.id);
    }),

    mySavedStacks: protectedProcedure.query(async ({ ctx }) => {
      return getSavedStacks(ctx.user.id);
    }),
  }),

  // ─── Founder endpoints ──────────────────────────────────────────────────
  founder: router({
    myStacks: protectedProcedure.query(async ({ ctx }) => {
      return getStacksByFounder(ctx.user.id);
    }),

    launch: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          slug: z.string().min(1).max(255),
          tagline: z.string().min(1).max(500),
          description: z.string().min(1),
          logoUrl: z.string().nullable().optional(),
          screenshotUrl: z.string().nullable().optional(),
          websiteUrl: z.string().nullable().optional(),
          category: z.string().min(1).max(100),
          pricingModel: z.string().max(50).default("Freemium"),
          pricingDetails: z.string().nullable().optional(),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existing = await getStackBySlug(input.slug);
        if (existing) throw new Error("A stack with this slug already exists");
        const stack = await createStack({
          ...input,
          tags: input.tags ?? null,
          logoUrl: input.logoUrl ?? null,
          screenshotUrl: input.screenshotUrl ?? null,
          websiteUrl: input.websiteUrl ?? null,
          pricingDetails: input.pricingDetails ?? null,
          founderId: ctx.user.id,
          claimedAt: new Date(),
          status: "pending_review",
          addedBy: "founder",
          launchedAt: new Date(),
          isVerified: false,
          isFeatured: false,
          isTrending: false,
          isSpotlighted: false,
        });
        return stack;
      }),

    updateStack: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          tagline: z.string().min(1).max(500).optional(),
          description: z.string().min(1).optional(),
          logoUrl: z.string().nullable().optional(),
          screenshotUrl: z.string().nullable().optional(),
          websiteUrl: z.string().nullable().optional(),
          category: z.string().optional(),
          pricingModel: z.string().optional(),
          pricingDetails: z.string().nullable().optional(),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const stack = await getStackById(input.id);
        if (!stack) throw new Error("Stack not found");
        if (stack.founderId !== ctx.user.id) throw new Error("You can only edit your own stacks");
        const { id, ...data } = input;
        return updateStack(id, data as any);
      }),

    claim: protectedProcedure
      .input(z.object({ stackId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const stack = await getStackById(input.stackId);
        if (!stack) throw new Error("Stack not found");
        if (stack.founderId) throw new Error("This stack is already claimed");
        await updateStack(input.stackId, { founderId: ctx.user.id, claimedAt: new Date() });
        return { success: true };
      }),

    requestVerification: protectedProcedure
      .input(z.object({ stackId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const stack = await getStackById(input.stackId);
        if (!stack) throw new Error("Stack not found");
        if (stack.founderId !== ctx.user.id) throw new Error("You must claim this stack first");
        if (stack.isVerified) throw new Error("This stack is already verified");
        return createVerificationRequest(input.stackId, ctx.user.id);
      }),

    stackStats: protectedProcedure
      .input(z.object({ stackId: z.number() }))
      .query(async ({ input, ctx }) => {
        const stack = await getStackById(input.stackId);
        if (!stack) throw new Error("Stack not found");
        if (stack.founderId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Access denied");
        const clickStats = await getClickStats(input.stackId);
        return {
          views: stack.viewCount,
          clicks: clickStats,
          lauds: stack.laudCount,
          saves: stack.saveCount,
          reviews: stack.reviewCount,
          averageRating: stack.averageRating,
          rankScore: stack.rankScore,
        };
      }),
  }),

  // ─── Admin endpoints ───────────────────────────────────────────────────
  admin: router({
    dashboardStats: adminProcedure.query(async () => {
      return getAdminDashboardStats();
    }),

    listStacks: adminProcedure
      .input(
        z.object({
          status: z.string().optional(),
          category: z.string().optional(),
          search: z.string().optional(),
          sort: z.enum(["rank", "newest", "top_rated", "most_reviewed", "most_lauded", "trending"]).optional(),
          limit: z.number().min(1).max(100).optional(),
          offset: z.number().min(0).optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return listStacks(input ?? {});
      }),

    getStack: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const stack = await getStackById(input.id);
        if (!stack) return null;
        const screenshots = await getScreenshots(stack.id);
        const clickStats = await getClickStats(stack.id);
        let founder = null;
        if (stack.founderId) {
          const { getUserById } = await import("./db");
          founder = await getUserById(stack.founderId);
        }
        return { ...stack, screenshots, clickStats, founder };
      }),

    createStack: adminProcedure
      .input(stackCreateSchema)
      .mutation(async ({ input }) => {
        return createStack({
          ...input,
          tags: input.tags ?? null,
          logoUrl: input.logoUrl ?? null,
          screenshotUrl: input.screenshotUrl ?? null,
          websiteUrl: input.websiteUrl ?? null,
          affiliateUrl: input.affiliateUrl ?? null,
          pricingDetails: input.pricingDetails ?? null,
          launchedAt: input.launchedAt ?? null,
          addedBy: "admin",
        });
      }),

    updateStack: adminProcedure
      .input(stackUpdateSchema)
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateStack(id, data as any);
      }),

    deleteStack: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteStack(input.id);
        return { success: true };
      }),

    // Moderation actions
    setStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["draft", "pending_review", "published", "suspended", "rejected"]) }))
      .mutation(async ({ input }) => {
        return updateStack(input.id, { status: input.status });
      }),

    setVerified: adminProcedure
      .input(z.object({ id: z.number(), isVerified: z.boolean() }))
      .mutation(async ({ input }) => {
        return updateStack(input.id, { isVerified: input.isVerified });
      }),

    setFeatured: adminProcedure
      .input(z.object({ id: z.number(), isFeatured: z.boolean() }))
      .mutation(async ({ input }) => {
        return updateStack(input.id, { isFeatured: input.isFeatured });
      }),

    setTrending: adminProcedure
      .input(z.object({ id: z.number(), isTrending: z.boolean() }))
      .mutation(async ({ input }) => {
        return updateStack(input.id, { isTrending: input.isTrending });
      }),

    setSpotlighted: adminProcedure
      .input(z.object({ id: z.number(), isSpotlighted: z.boolean() }))
      .mutation(async ({ input }) => {
        return updateStack(input.id, { isSpotlighted: input.isSpotlighted });
      }),

    // Screenshots
    addScreenshot: adminProcedure
      .input(z.object({ stackId: z.number(), url: z.string(), caption: z.string().optional() }))
      .mutation(async ({ input }) => {
        await addScreenshot(input.stackId, input.url, input.caption);
        return { success: true };
      }),

    deleteScreenshot: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteScreenshot(input.id);
        return { success: true };
      }),

    // Verification requests
    listVerifications: adminProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getVerificationRequests(input?.status);
      }),

    resolveVerification: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["approved", "rejected"]), notes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await updateVerificationRequest(input.id, input.status, input.notes);
        return { success: true };
      }),

    // Recalc rankings
    recalcRankings: adminProcedure.mutation(async () => {
      await recalcRankScores();
      return { success: true };
    }),

    // Users management
    listUsers: adminProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getAllUsers(input?.limit ?? 100, input?.offset ?? 0);
      }),

    // Upload helper
    uploadImage: adminProcedure
      .input(z.object({ base64: z.string(), filename: z.string(), contentType: z.string() }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `stacks/${Date.now()}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.contentType);
        return { url };
      }),
  }),

  // ─── Newsletter ─────────────────────────────────────────────────────────
  newsletter: router({
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
        if (!isNew) return { success: true, alreadySubscribed: true, welcomeEmailSent: false };
        sendWelcomeEmail(input.email, input.firstName ?? null)
          .then((sent) => { if (sent) markWelcomeEmailSent(input.email).catch(console.error); })
          .catch(console.error);
        return { success: true, alreadySubscribed: false, welcomeEmailSent: true, reSubscribed: alreadyUnsubscribed };
      }),
  }),
});

export type AppRouter = typeof appRouter;
