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
  /** Boost — $149 for 30 days */
  boost_30: {
    name: "Boost — 30 Days",
    description:
      "Featured badge, amber highlight border, and priority placement in category and search results for 30 days",
    amount: 14900, // cents
    currency: "usd",
    duration_days: 30,
  },
  /** Spotlight — $349 for 90 days */
  spotlight_90: {
    name: "Spotlight — 90 Days",
    description:
      "Everything in Boost plus homepage featured carousel, dedicated newsletter feature, and priority in trending for 90 days",
    amount: 34900,
    currency: "usd",
    duration_days: 90,
  },
  /** Dominate — $699 for 180 days */
  dominate_180: {
    name: "Dominate — 180 Days",
    description:
      "Everything in Spotlight plus category page takeover banner, competitor comparison placement, and dedicated editorial review for 180 days",
    amount: 69900,
    currency: "usd",
    duration_days: 180,
  },
} as const;

export type FeaturedPlan = keyof typeof FEATURED_PLANS;

// ─── Deal Placement Pricing ─────────────────────────────────────────────────────────────────

export const DEAL_PLACEMENT_PLANS = {
  /** Deal of the Day — $99 for 1 day */
  deal_of_day: {
    name: "Deal of the Day",
    description: "Top spotlight position on the deals page for 24 hours. Maximum visibility with countdown timer and exclusive badge.",
    amount: 9900, // cents
    currency: "usd",
    duration_days: 1,
    placement: "deal_of_day" as const,
  },
  /** Featured Deal — $49 for 7 days */
  featured_7: {
    name: "Featured Deal — 7 Days",
    description: "Featured section placement with amber highlight and 'Featured' badge for 7 days.",
    amount: 4900,
    currency: "usd",
    duration_days: 7,
    placement: "featured" as const,
  },
  /** Featured Deal — $79 for 14 days */
  featured_14: {
    name: "Featured Deal — 14 Days",
    description: "Featured section placement with amber highlight and 'Featured' badge for 14 days.",
    amount: 7900,
    currency: "usd",
    duration_days: 14,
    placement: "featured" as const,
  },
  /** Pinned Deal — $19 for 7 days */
  pinned_7: {
    name: "Pinned Deal — 7 Days",
    description: "Pinned position in the deals grid with 'Promoted' badge for 7 days.",
    amount: 1900,
    currency: "usd",
    duration_days: 7,
    placement: "pinned" as const,
  },
  /** Pinned Deal — $29 for 14 days */
  pinned_14: {
    name: "Pinned Deal — 14 Days",
    description: "Pinned position in the deals grid with 'Promoted' badge for 14 days.",
    amount: 2900,
    currency: "usd",
    duration_days: 14,
    placement: "pinned" as const,
  },
} as const;

export type DealPlacementPlan = keyof typeof DEAL_PLACEMENT_PLANS;

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

// ─── Create Deal Placement Checkout Session ──────────────────────────────────────────

export async function createDealPlacementCheckoutSession({
  dealId,
  dealTitle,
  plan,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  dealId: number;
  dealTitle: string;
  plan: DealPlacementPlan;
  userId: number;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const planDetails = DEAL_PLACEMENT_PLANS[plan];

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: planDetails.currency,
          product_data: {
            name: planDetails.name,
            description: `${planDetails.description} — ${dealTitle}`,
            metadata: {
              deal_id: dealId.toString(),
              plan,
              type: "deal_placement",
            },
          },
          unit_amount: planDetails.amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      deal_id: dealId.toString(),
      user_id: userId.toString(),
      plan,
      type: "deal_placement",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

// ─── Marketplace Constants ──────────────────────────────────────────────────

/** Creator onboarding fee: $39 one-time */
export const CREATOR_ONBOARDING_FEE = {
  amount: 3900,
  currency: "usd" as const,
  name: "LaudStack Marketplace — Creator Onboarding",
  description: "One-time fee to become a verified marketplace creator. Includes product listing, Stripe Connect payouts, and creator dashboard access.",
};

/** Platform commission rate: 12% */
export const MARKETPLACE_COMMISSION_RATE = 0.12;

/** Marketplace Boost Plans */
export const MARKETPLACE_BOOST_PLANS = {
  boost_7: {
    name: "Boost — 7 Days",
    description: "Priority placement in marketplace search and category pages for 7 days.",
    amount: 2900,
    currency: "usd" as const,
    duration_days: 7,
  },
  spotlight_30: {
    name: "Spotlight — 30 Days",
    description: "Featured carousel placement, priority in search, and 'Spotlight' badge for 30 days.",
    amount: 7900,
    currency: "usd" as const,
    duration_days: 30,
  },
  dominate_90: {
    name: "Dominate — 90 Days",
    description: "Top placement everywhere, featured carousel, category takeover, and 'Dominate' badge for 90 days.",
    amount: 19900,
    currency: "usd" as const,
    duration_days: 90,
  },
} as const;

export type MarketplaceBoostPlan = keyof typeof MARKETPLACE_BOOST_PLANS;

// ─── Marketplace Stripe Functions ───────────────────────────────────────────

/**
 * Create a Stripe Connect Express account for a marketplace creator.
 */
export async function createConnectAccount({
  userId,
  email,
}: {
  userId: number;
  email: string;
}): Promise<Stripe.Account> {
  return getStripe().accounts.create({
    type: "express",
    email,
    metadata: {
      laudstack_user_id: userId.toString(),
      type: "marketplace_creator",
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
}

/**
 * Generate a Stripe Connect onboarding link for the creator.
 */
export async function createConnectOnboardingLink({
  accountId,
  refreshUrl,
  returnUrl,
}: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<Stripe.AccountLink> {
  return getStripe().accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
}

/**
 * Generate a Stripe Connect Express dashboard link.
 */
export async function createConnectDashboardLink(
  accountId: string
): Promise<Stripe.LoginLink> {
  return getStripe().accounts.createLoginLink(accountId);
}

/**
 * Create a checkout session for the $39 creator onboarding fee.
 */
export async function createCreatorOnboardingCheckoutSession({
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  userId: number;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: CREATOR_ONBOARDING_FEE.currency,
          product_data: {
            name: CREATOR_ONBOARDING_FEE.name,
            description: CREATOR_ONBOARDING_FEE.description,
          },
          unit_amount: CREATOR_ONBOARDING_FEE.amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId.toString(),
      type: "creator_onboarding",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

/**
 * Create a marketplace purchase checkout session using Stripe Connect.
 * The payment goes to the creator's Connect account with the platform fee deducted.
 */
export async function createMarketplacePurchaseSession({
  productId,
  productName,
  productSlug,
  buyerId,
  buyerEmail,
  creatorConnectAccountId,
  amountCents,
  successUrl,
  cancelUrl,
  offerId,
}: {
  productId: number;
  productName: string;
  productSlug: string;
  buyerId: number;
  buyerEmail: string;
  creatorConnectAccountId: string;
  amountCents: number;
  successUrl: string;
  cancelUrl: string;
  offerId?: number;
}) {
  const platformFeeCents = Math.round(amountCents * MARKETPLACE_COMMISSION_RATE);

  return getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: buyerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: productName,
            metadata: {
              product_id: productId.toString(),
              product_slug: productSlug,
              type: "marketplace_purchase",
            },
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: creatorConnectAccountId,
      },
    },
    metadata: {
      product_id: productId.toString(),
      product_slug: productSlug,
      buyer_id: buyerId.toString(),
      type: "marketplace_purchase",
      ...(offerId ? { offer_id: offerId.toString() } : {}),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

/**
 * Create a marketplace boost checkout session.
 */
export async function createMarketplaceBoostCheckoutSession({
  productId,
  productName,
  plan,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  productId: number;
  productName: string;
  plan: MarketplaceBoostPlan;
  userId: number;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const planDetails = MARKETPLACE_BOOST_PLANS[plan];

  return getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: planDetails.currency,
          product_data: {
            name: planDetails.name,
            description: `${planDetails.description} — ${productName}`,
            metadata: {
              product_id: productId.toString(),
              plan,
              type: "marketplace_boost",
            },
          },
          unit_amount: planDetails.amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      product_id: productId.toString(),
      user_id: userId.toString(),
      plan,
      type: "marketplace_boost",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

/**
 * Retrieve a Connect account to check onboarding status.
 */
export async function getConnectAccount(
  accountId: string
): Promise<Stripe.Account> {
  return getStripe().accounts.retrieve(accountId);
}

// ─── Verify webhook signature ─────────────────────────────────────────────────────────────

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
