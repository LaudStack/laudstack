import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import superjson from "superjson";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { getUserBySupabaseId } from "./db";
import type { User } from "@/drizzle/schema";

// ─── Context ──────────────────────────────────────────────────────────────────

export async function createTRPCContext(opts: { req: NextRequest }) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return opts.req.cookies.getAll();
        },
        setAll() {
          // In API routes, we can't set cookies directly on the request
          // The middleware handles cookie refresh
        },
      },
    }
  );

  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  let user: User | null = null;
  if (supabaseUser) {
    user = (await getUserBySupabaseId(supabaseUser.id)) ?? null;
  }

  return {
    req: opts.req,
    user,
    supabaseUser,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// ─── tRPC init ────────────────────────────────────────────────────────────────

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// ─── Protected procedure ──────────────────────────────────────────────────────

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// ─── Admin procedure ──────────────────────────────────────────────────────────

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    });
  }
  return next({ ctx });
});
