import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { subscribeToNewsletter, markWelcomeEmailSent } from "./db";
import { sendWelcomeEmail } from "./newsletter";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts,
  // all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

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

        if (!isNew) {
          return { success: true, alreadySubscribed: true, welcomeEmailSent: false };
        }

        // Fire welcome email asynchronously — do not block the response
        sendWelcomeEmail(input.email, input.firstName ?? null)
          .then(sent => {
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
  }),
});

export type AppRouter = typeof appRouter;
