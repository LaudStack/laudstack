import Stripe from "stripe";

// Lazy singleton — only instantiated at runtime, not during build
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

// Keep named export for backwards compat — but as a getter so it's lazy
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ─── Featured badge pricing ───────────────────────────────────────────────────

export const FEATURED_PLANS = {
  /** 30-day Featured badge — $49 */
  featured_30: {
    name: "Featured Badge — 30 Days",
    description:
      "Amber border, gold badge, and Featured First sorting for 30 days",
    amount: 4900, // cents
    currency: "usd",
    duration_days: 30,
  },
  /** 90-day Featured badge — $99 */
  featured_90: {
    name: "Featured Badge — 90 Days",
    description:
      "Amber border, gold badge, and Featured First sorting for 90 days",
    amount: 9900,
    currency: "usd",
    duration_days: 90,
  },
  /** LaunchPad Pro — $29 one-time */
  launchpad_pro: {
    name: "LaunchPad Pro",
    description:
      "Priority review, founder analytics dashboard, and review reply feature",
    amount: 2900,
    currency: "usd",
    duration_days: null, // lifetime
  },
} as const;

export type FeaturedPlan = keyof typeof FEATURED_PLANS;

// ─── Create Checkout Session ──────────────────────────────────────────────────

export async function createFeaturedCheckoutSession({
  toolId,
  toolName,
  toolSlug,
  plan,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  toolId: number;
  toolName: string;
  toolSlug: string;
  plan: FeaturedPlan;
  userId: number;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const planDetails = FEATURED_PLANS[plan];

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: planDetails.currency,
          product_data: {
            name: planDetails.name,
            description: `${planDetails.description} — ${toolName}`,
            metadata: {
              tool_id: toolId.toString(),
              tool_slug: toolSlug,
              plan,
            },
          },
          unit_amount: planDetails.amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      tool_id: toolId.toString(),
      tool_slug: toolSlug,
      user_id: userId.toString(),
      plan,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

// ─── Verify webhook signature ─────────────────────────────────────────────────

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
