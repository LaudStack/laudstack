"use server";
/*
 * Marketplace Notification Helpers
 * Sends notifications for marketplace events: purchases, offers, product moderation
 * Uses the existing createNotification system with "system" type
 */
import { createNotification } from "@/app/actions/notifications";

type NotifyParams = {
  recipientId: number;
  title: string;
  message: string;
  link?: string;
  actorId?: number;
};

async function notify(params: NotifyParams) {
  try {
    await createNotification({
      recipientId: params.recipientId,
      type: "system",
      title: params.title,
      message: params.message,
      link: params.link,
      actorId: params.actorId,
    });
  } catch (error) {
    console.error("[MarketplaceNotify] Failed:", error);
  }
}

// ─── Purchase notifications ────────────────────────────────────────────────

/** Notify buyer that their purchase was successful */
export async function notifyPurchaseConfirmation({
  buyerId,
  productName,
  productSlug,
  amount,
}: {
  buyerId: number;
  productName: string;
  productSlug: string;
  amount: number;
}) {
  await notify({
    recipientId: buyerId,
    title: "Purchase Confirmed",
    message: `Your purchase of "${productName}" for $${(amount / 100).toFixed(2)} was successful. You can access your purchase from your dashboard.`,
    link: `/dashboard?tab=purchases`,
  });
}

/** Notify creator that a sale was made */
export async function notifySaleReceived({
  creatorId,
  buyerId,
  productName,
  productSlug,
  amount,
  payout,
}: {
  creatorId: number;
  buyerId: number;
  productName: string;
  productSlug: string;
  amount: number;
  payout: number;
}) {
  await notify({
    recipientId: creatorId,
    title: "New Sale!",
    message: `Someone purchased "${productName}" for $${(amount / 100).toFixed(2)}. Your payout: $${(payout / 100).toFixed(2)}.`,
    link: `/dashboard/creator?tab=orders`,
    actorId: buyerId,
  });
}

// ─── Offer notifications ───────────────────────────────────────────────────

/** Notify creator about a new offer */
export async function notifyNewOffer({
  creatorId,
  buyerId,
  productName,
  offerAmount,
}: {
  creatorId: number;
  buyerId: number;
  productName: string;
  offerAmount: number;
}) {
  await notify({
    recipientId: creatorId,
    title: "New Offer Received",
    message: `You received a $${(offerAmount / 100).toFixed(2)} offer on "${productName}". Review it in your creator dashboard.`,
    link: `/dashboard/creator?tab=offers`,
    actorId: buyerId,
  });
}

/** Notify buyer that their offer was accepted */
export async function notifyOfferAccepted({
  buyerId,
  creatorId,
  productName,
  productSlug,
  amount,
}: {
  buyerId: number;
  creatorId: number;
  productName: string;
  productSlug: string;
  amount: number;
}) {
  await notify({
    recipientId: buyerId,
    title: "Offer Accepted!",
    message: `Your $${(amount / 100).toFixed(2)} offer on "${productName}" was accepted. Complete your purchase now.`,
    link: `/marketplace/${productSlug}`,
    actorId: creatorId,
  });
}

/** Notify buyer that their offer was rejected */
export async function notifyOfferRejected({
  buyerId,
  creatorId,
  productName,
  reason,
}: {
  buyerId: number;
  creatorId: number;
  productName: string;
  reason?: string;
}) {
  await notify({
    recipientId: buyerId,
    title: "Offer Declined",
    message: `Your offer on "${productName}" was declined.${reason ? ` Reason: ${reason}` : ""}`,
    link: `/dashboard?tab=offers`,
    actorId: creatorId,
  });
}

/** Notify buyer about a counter-offer */
export async function notifyOfferCountered({
  buyerId,
  creatorId,
  productName,
  productSlug,
  counterAmount,
}: {
  buyerId: number;
  creatorId: number;
  productName: string;
  productSlug: string;
  counterAmount: number;
}) {
  await notify({
    recipientId: buyerId,
    title: "Counter-Offer Received",
    message: `The creator of "${productName}" countered with $${(counterAmount / 100).toFixed(2)}. Review and respond in your dashboard.`,
    link: `/dashboard?tab=offers`,
    actorId: creatorId,
  });
}

/** Notify buyer that their offer expired */
export async function notifyOfferExpired({
  buyerId,
  productName,
}: {
  buyerId: number;
  productName: string;
}) {
  await notify({
    recipientId: buyerId,
    title: "Offer Expired",
    message: `Your offer on "${productName}" has expired after 72 hours without a response.`,
    link: `/dashboard?tab=offers`,
  });
}

// ─── Product moderation notifications ──────────────────────────────────────

/** Notify creator that their product was approved */
export async function notifyProductApproved({
  creatorId,
  productName,
  productSlug,
}: {
  creatorId: number;
  productName: string;
  productSlug: string;
}) {
  await notify({
    recipientId: creatorId,
    title: "Product Approved!",
    message: `Your product "${productName}" has been approved and is now live on the marketplace.`,
    link: `/marketplace/${productSlug}`,
  });
}

/** Notify creator that their product was rejected */
export async function notifyProductRejected({
  creatorId,
  productName,
  reason,
}: {
  creatorId: number;
  productName: string;
  reason: string;
}) {
  await notify({
    recipientId: creatorId,
    title: "Product Needs Changes",
    message: `Your product "${productName}" was not approved. Reason: ${reason}. You can update and resubmit.`,
    link: `/dashboard/creator?tab=products`,
  });
}

/** Notify creator about a new review on their product */
export async function notifyNewProductReview({
  creatorId,
  reviewerId,
  productName,
  productSlug,
  rating,
}: {
  creatorId: number;
  reviewerId: number;
  productName: string;
  productSlug: string;
  rating: number;
}) {
  await notify({
    recipientId: creatorId,
    title: "New Product Review",
    message: `Someone left a ${rating}-star review on "${productName}".`,
    link: `/marketplace/${productSlug}`,
    actorId: reviewerId,
  });
}
