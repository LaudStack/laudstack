"use server";

import { db } from "@/server/db";
import { requireAdmin } from "@/lib/admin-auth";
import {
  promotions,
  promotionPricing,
  dealOfDaySlots,
  tools,
  deals,
  marketplaceProducts,
  users,
} from "@/drizzle/schema";
import {
  eq,
  and,
  desc,
  asc,
  sql,
  lt,
  gte,
  isNotNull,
  inArray,
  count,
  like,
  ne,
} from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PromotionTarget = "stack" | "deal" | "marketplace";
export type PromotionType =
  | "stack_featured"
  | "stack_spotlight"
  | "stack_category_boost"
  | "deal_pinned"
  | "deal_featured"
  | "deal_of_day"
  | "marketplace_boost"
  | "marketplace_spotlight";
export type PromotionStatus =
  | "pending_payment"
  | "paid"
  | "scheduled"
  | "active"
  | "expired"
  | "cancelled"
  | "failed"
  | "paused";

// ─── Duration Rules ──────────────────────────────────────────────────────────

const ALLOWED_DURATIONS: Record<PromotionType, number[]> = {
  stack_featured: [3, 7, 14, 30],
  stack_spotlight: [3, 7, 14, 30],
  stack_category_boost: [3, 7, 14, 30],
  deal_pinned: [3, 7, 14, 30],
  deal_featured: [3, 7, 14, 30],
  deal_of_day: [1],
  marketplace_boost: [3, 7, 14, 30],
  marketplace_spotlight: [3, 7, 14, 30],
};

// Note: ALLOWED_DURATIONS is also exported from @/lib/promotion-constants for client use

function validateDuration(type: PromotionType, durationDays: number) {
  const allowed = ALLOWED_DURATIONS[type];
  if (!allowed || !allowed.includes(durationDays)) {
    throw new Error(
      `Invalid duration ${durationDays} days for ${type}. Allowed: ${allowed?.join(", ")} days.`
    );
  }
}

// ─── Pricing CRUD (Admin) ─────────────────────────────────────────────────────

export async function getPromotionPricing() {
  await requireAdmin();
  const rows = await db
    .select()
    .from(promotionPricing)
    .orderBy(asc(promotionPricing.promotionType), asc(promotionPricing.sortOrder));
  return rows;
}

export async function upsertPromotionPricing(data: {
  id?: number;
  promotionType: PromotionType;
  durationDays: number;
  priceInCents: number;
  displayName: string;
  description?: string;
  isActive?: boolean;
  isRecommended?: boolean;
  sortOrder?: number;
}) {
  await requireAdmin();
  const now = new Date();

  if (data.id) {
    // Update existing
    const [updated] = await db
      .update(promotionPricing)
      .set({
        promotionType: data.promotionType,
        durationDays: data.durationDays,
        priceInCents: data.priceInCents,
        displayName: data.displayName,
        description: data.description ?? null,
        isActive: data.isActive ?? true,
        isRecommended: data.isRecommended ?? false,
        sortOrder: data.sortOrder ?? 0,
        updatedAt: now,
      })
      .where(eq(promotionPricing.id, data.id))
      .returning();
    return updated;
  } else {
    // Insert new
    const [inserted] = await db
      .insert(promotionPricing)
      .values({
        promotionType: data.promotionType,
        durationDays: data.durationDays,
        priceInCents: data.priceInCents,
        displayName: data.displayName,
        description: data.description ?? null,
        isActive: data.isActive ?? true,
        isRecommended: data.isRecommended ?? false,
        sortOrder: data.sortOrder ?? 0,
        currency: "usd",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return inserted;
  }
}

export async function deletePromotionPricing(id: number) {
  await requireAdmin();
  await db.delete(promotionPricing).where(eq(promotionPricing.id, id));
  return { success: true };
}

// ─── Public Pricing (for purchase UI) ─────────────────────────────────────────

export async function getActivePricingForTarget(target: PromotionTarget) {
  // Map target to promotion types
  const typeMap: Record<PromotionTarget, PromotionType[]> = {
    stack: ["stack_featured", "stack_spotlight", "stack_category_boost"],
    deal: ["deal_pinned", "deal_featured", "deal_of_day"],
    marketplace: ["marketplace_boost", "marketplace_spotlight"],
  };
  const types = typeMap[target];

  const rows = await db
    .select()
    .from(promotionPricing)
    .where(
      and(
        eq(promotionPricing.isActive, true),
        inArray(promotionPricing.promotionType, types)
      )
    )
    .orderBy(asc(promotionPricing.sortOrder), asc(promotionPricing.priceInCents));

  return rows;
}

// ─── Promotion Purchase Flow ──────────────────────────────────────────────────

/**
 * Create a pending promotion record before Stripe checkout.
 * Returns the promotion ID to be passed to the checkout session metadata.
 */
export async function createPendingPromotion(data: {
  userId: number;
  target: PromotionTarget;
  type: PromotionType;
  targetEntityId: number;
  durationDays: number;
  amountPaid: number;
  slotDate?: string; // for deal_of_day
}) {
  // Enforce duration rules
  validateDuration(data.type, data.durationDays);
  const now = new Date();

  // For deal_of_day, check slot availability
  if (data.type === "deal_of_day" && data.slotDate) {
    const existingSlot = await db
      .select()
      .from(dealOfDaySlots)
      .where(eq(dealOfDaySlots.slotDate, data.slotDate))
      .limit(1);

    if (existingSlot.length > 0) {
      // Check if the hold has expired
      const slot = existingSlot[0];
      if (slot.isConfirmed) {
        throw new Error("This date is already booked for Deal of the Day");
      }
      if (slot.holdExpiresAt && new Date(slot.holdExpiresAt) > now) {
        throw new Error("This date is currently held by another user. Please try a different date.");
      }
      // Hold expired, delete the old slot
      await db.delete(dealOfDaySlots).where(eq(dealOfDaySlots.id, slot.id));
    }
  }

  const [promo] = await db
    .insert(promotions)
    .values({
      userId: data.userId,
      target: data.target,
      type: data.type,
      targetEntityId: data.targetEntityId,
      durationDays: data.durationDays,
      amountPaid: data.amountPaid,
      currency: "usd",
      status: "pending_payment",
      slotDate: data.slotDate ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // For deal_of_day, create a hold on the slot
  if (data.type === "deal_of_day" && data.slotDate) {
    const holdExpires = new Date(now.getTime() + 30 * 60 * 1000); // 30 min hold
    await db.insert(dealOfDaySlots).values({
      slotDate: data.slotDate,
      promotionId: promo.id,
      dealId: data.targetEntityId,
      userId: data.userId,
      isConfirmed: false,
      holdExpiresAt: holdExpires,
      createdAt: now,
    });
  }

  return promo;
}

/**
 * Called by webhook after successful payment.
 * Activates the promotion and sets start/expiry dates.
 */
export async function activatePromotion(
  promotionId: number,
  stripeSessionId: string,
  stripePaymentIntentId: string
) {
  const now = new Date();

  const [promo] = await db
    .select()
    .from(promotions)
    .where(eq(promotions.id, promotionId))
    .limit(1);

  if (!promo) throw new Error(`Promotion ${promotionId} not found`);
  if (promo.status !== "pending_payment") {
    console.warn(`[Promotions] Promotion ${promotionId} already processed (status: ${promo.status})`);
    return promo;
  }

  let startsAt = now;
  let expiresAt = new Date(now.getTime() + promo.durationDays * 24 * 60 * 60 * 1000);

  // For deal_of_day, the start/end is based on the slot date
  if (promo.type === "deal_of_day" && promo.slotDate) {
    startsAt = new Date(promo.slotDate + "T00:00:00Z");
    expiresAt = new Date(promo.slotDate + "T23:59:59Z");

    // Confirm the slot
    await db
      .update(dealOfDaySlots)
      .set({ isConfirmed: true, holdExpiresAt: null })
      .where(eq(dealOfDaySlots.promotionId, promotionId));
  }

  // Determine if it should be active now or scheduled
  const status: PromotionStatus = startsAt <= now ? "active" : "scheduled";

  const [updated] = await db
    .update(promotions)
    .set({
      status,
      stripeSessionId,
      stripePaymentIntentId,
      startsAt,
      expiresAt,
      updatedAt: now,
    })
    .where(eq(promotions.id, promotionId))
    .returning();

  // If active now, apply the promotion effects
  if (status === "active") {
    await applyPromotionEffects(updated);
  }

  return updated;
}

/**
 * Apply the visual/placement effects of a promotion to the target entity.
 */
async function applyPromotionEffects(promo: typeof promotions.$inferSelect) {
  const now = new Date();

  switch (promo.type) {
    case "stack_featured":
      await db
        .update(tools)
        .set({ isFeatured: true, updatedAt: now })
        .where(eq(tools.id, promo.targetEntityId));
      break;

    case "stack_spotlight":
      await db
        .update(tools)
        .set({ isSpotlighted: true, updatedAt: now })
        .where(eq(tools.id, promo.targetEntityId));
      break;

    case "stack_category_boost":
      // Category boost is handled by query-time logic (checking active promotions)
      break;

    case "deal_pinned":
      await db
        .update(deals)
        .set({ placement: "pinned", placementExpiresAt: promo.expiresAt, updatedAt: now })
        .where(eq(deals.id, promo.targetEntityId));
      break;

    case "deal_featured":
      await db
        .update(deals)
        .set({ placement: "featured", placementExpiresAt: promo.expiresAt, updatedAt: now })
        .where(eq(deals.id, promo.targetEntityId));
      break;

    case "deal_of_day":
      await db
        .update(deals)
        .set({ placement: "deal_of_day", placementExpiresAt: promo.expiresAt, updatedAt: now })
        .where(eq(deals.id, promo.targetEntityId));
      break;

    case "marketplace_boost":
      await db
        .update(marketplaceProducts)
        .set({ isBoosted: true, boostExpiresAt: promo.expiresAt, updatedAt: now })
        .where(eq(marketplaceProducts.id, promo.targetEntityId));
      break;

    case "marketplace_spotlight":
      await db
        .update(marketplaceProducts)
        .set({ isFeatured: true, updatedAt: now })
        .where(eq(marketplaceProducts.id, promo.targetEntityId));
      break;
  }
}

/**
 * Remove the visual/placement effects when a promotion expires.
 */
export async function removePromotionEffects(promo: typeof promotions.$inferSelect) {
  const now = new Date();

  switch (promo.type) {
    case "stack_featured": {
      // Only un-feature if no other active featured promotion exists
      const otherActive = await db
        .select({ id: promotions.id })
        .from(promotions)
        .where(
          and(
            eq(promotions.targetEntityId, promo.targetEntityId),
            eq(promotions.type, "stack_featured"),
            eq(promotions.status, "active"),
            ne(promotions.id, promo.id)
          )
        )
        .limit(1);
      if (otherActive.length === 0) {
        await db.update(tools).set({ isFeatured: false, updatedAt: now }).where(eq(tools.id, promo.targetEntityId));
      }
      break;
    }

    case "stack_spotlight": {
      const otherActive = await db
        .select({ id: promotions.id })
        .from(promotions)
        .where(
          and(
            eq(promotions.targetEntityId, promo.targetEntityId),
            eq(promotions.type, "stack_spotlight"),
            eq(promotions.status, "active"),
            ne(promotions.id, promo.id)
          )
        )
        .limit(1);
      if (otherActive.length === 0) {
        await db.update(tools).set({ isSpotlighted: false, updatedAt: now }).where(eq(tools.id, promo.targetEntityId));
      }
      break;
    }

    case "deal_pinned":
    case "deal_featured":
    case "deal_of_day": {
      const otherActive = await db
        .select({ id: promotions.id })
        .from(promotions)
        .where(
          and(
            eq(promotions.targetEntityId, promo.targetEntityId),
            inArray(promotions.type, ["deal_pinned", "deal_featured", "deal_of_day"]),
            eq(promotions.status, "active"),
            ne(promotions.id, promo.id)
          )
        )
        .limit(1);
      if (otherActive.length === 0) {
        await db.update(deals).set({ placement: "none", placementExpiresAt: null, updatedAt: now }).where(eq(deals.id, promo.targetEntityId));
      }
      break;
    }

    case "marketplace_boost": {
      const otherActive = await db
        .select({ id: promotions.id })
        .from(promotions)
        .where(
          and(
            eq(promotions.targetEntityId, promo.targetEntityId),
            eq(promotions.type, "marketplace_boost"),
            eq(promotions.status, "active"),
            ne(promotions.id, promo.id)
          )
        )
        .limit(1);
      if (otherActive.length === 0) {
        await db.update(marketplaceProducts).set({ isBoosted: false, boostExpiresAt: null, updatedAt: now }).where(eq(marketplaceProducts.id, promo.targetEntityId));
      }
      break;
    }

    case "marketplace_spotlight": {
      const otherActive = await db
        .select({ id: promotions.id })
        .from(promotions)
        .where(
          and(
            eq(promotions.targetEntityId, promo.targetEntityId),
            eq(promotions.type, "marketplace_spotlight"),
            eq(promotions.status, "active"),
            ne(promotions.id, promo.id)
          )
        )
        .limit(1);
      if (otherActive.length === 0) {
        await db.update(marketplaceProducts).set({ isFeatured: false, updatedAt: now }).where(eq(marketplaceProducts.id, promo.targetEntityId));
      }
      break;
    }
  }
}

// ─── Admin: List & Manage Promotions ──────────────────────────────────────────

export async function getAdminPromotions(opts: {
  status?: string;
  target?: string;
  type?: string;
  search?: string;
  page?: number;
} = {}) {
  await requireAdmin();
  const { status, target, type, search, page = 1 } = opts;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [];
  if (status && status !== "all") {
    conditions.push(eq(promotions.status, status as PromotionStatus));
  }
  if (target && target !== "all") {
    conditions.push(eq(promotions.target, target as PromotionTarget));
  }
  if (type && type !== "all") {
    conditions.push(eq(promotions.type, type as PromotionType));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalResult, statsResult] = await Promise.all([
    db
      .select({
        id: promotions.id,
        userId: promotions.userId,
        target: promotions.target,
        type: promotions.type,
        targetEntityId: promotions.targetEntityId,
        durationDays: promotions.durationDays,
        amountPaid: promotions.amountPaid,
        currency: promotions.currency,
        status: promotions.status,
        startsAt: promotions.startsAt,
        expiresAt: promotions.expiresAt,
        slotDate: promotions.slotDate,
        isManual: promotions.isManual,
        isPaused: promotions.isPaused,
        adminNotes: promotions.adminNotes,
        createdAt: promotions.createdAt,
        userName: users.name,
        userEmail: users.email,
        userAvatar: users.avatarUrl,
      })
      .from(promotions)
      .leftJoin(users, eq(promotions.userId, users.id))
      .where(whereClause)
      .orderBy(desc(promotions.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(promotions).where(whereClause),
    db
      .select({
        total: count(),
        totalRevenue: sql<number>`COALESCE(SUM(${promotions.amountPaid}), 0)`,
        activeCount: sql<number>`COUNT(CASE WHEN ${promotions.status} = 'active' THEN 1 END)`,
        pendingCount: sql<number>`COUNT(CASE WHEN ${promotions.status} = 'pending_payment' THEN 1 END)`,
        expiredCount: sql<number>`COUNT(CASE WHEN ${promotions.status} = 'expired' THEN 1 END)`,
      })
      .from(promotions),
  ]);

  // Resolve entity names
  const enrichedRows = await Promise.all(
    rows.map(async (row) => {
      let entityName = `#${row.targetEntityId}`;
      let entitySlug = "";
      try {
        if (row.target === "stack") {
          const [tool] = await db.select({ name: tools.name, slug: tools.slug }).from(tools).where(eq(tools.id, row.targetEntityId)).limit(1);
          if (tool) { entityName = tool.name; entitySlug = tool.slug; }
        } else if (row.target === "deal") {
          const [deal] = await db.select({ title: deals.title, toolId: deals.toolId }).from(deals).where(eq(deals.id, row.targetEntityId)).limit(1);
          if (deal) { entityName = deal.title; entitySlug = `deal-${row.targetEntityId}`; }
        } else if (row.target === "marketplace") {
          const [product] = await db.select({ name: marketplaceProducts.name, slug: marketplaceProducts.slug }).from(marketplaceProducts).where(eq(marketplaceProducts.id, row.targetEntityId)).limit(1);
          if (product) { entityName = product.name; entitySlug = product.slug; }
        }
      } catch {}
      return { ...row, entityName, entitySlug };
    })
  );

  return {
    promotions: enrichedRows,
    total: totalResult[0]?.count ?? 0,
    stats: statsResult[0] ?? { total: 0, totalRevenue: 0, activeCount: 0, pendingCount: 0, expiredCount: 0 },
    page,
    pageSize: limit,
  };
}

export async function getAdminPromotionDetails(id: number) {
  await requireAdmin();

  const [promo] = await db
    .select()
    .from(promotions)
    .where(eq(promotions.id, id))
    .limit(1);

  if (!promo) throw new Error("Promotion not found");

  // Get user info
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, promo.userId))
    .limit(1);

  // Get entity info
  let entity: { name: string; slug: string; extra?: Record<string, unknown> } = { name: `#${promo.targetEntityId}`, slug: "" };
  if (promo.target === "stack") {
    const [tool] = await db.select({ name: tools.name, slug: tools.slug, logoUrl: tools.logoUrl, isFeatured: tools.isFeatured, isSpotlighted: tools.isSpotlighted }).from(tools).where(eq(tools.id, promo.targetEntityId)).limit(1);
    if (tool) entity = { name: tool.name, slug: tool.slug, extra: { logoUrl: tool.logoUrl, isFeatured: tool.isFeatured, isSpotlighted: tool.isSpotlighted } };
  } else if (promo.target === "deal") {
    const [deal] = await db.select({ title: deals.title, toolId: deals.toolId, placement: deals.placement }).from(deals).where(eq(deals.id, promo.targetEntityId)).limit(1);
    if (deal) entity = { name: deal.title, slug: `deal-${promo.targetEntityId}`, extra: { placement: deal.placement } };
  } else if (promo.target === "marketplace") {
    const [product] = await db.select({ name: marketplaceProducts.name, slug: marketplaceProducts.slug, isBoosted: marketplaceProducts.isBoosted, isFeatured: marketplaceProducts.isFeatured }).from(marketplaceProducts).where(eq(marketplaceProducts.id, promo.targetEntityId)).limit(1);
    if (product) entity = { name: product.name, slug: product.slug, extra: { isBoosted: product.isBoosted, isFeatured: product.isFeatured } };
  }

  // Get admin who actioned (if manual)
  let admin = null;
  if (promo.adminId) {
    const [a] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, promo.adminId)).limit(1);
    admin = a ?? null;
  }

  return { promotion: promo, user, entity, admin };
}

// ─── Admin Actions ────────────────────────────────────────────────────────────


export async function adminCreateManualPromotion(data: {
  userId?: number;
  target: PromotionTarget;
  type: PromotionType;
  targetEntityId: number;
  durationDays: number;
  notes?: string;
  slotDate?: string;
  adminId?: number;
}) {
  const adminUser = await requireAdmin();
  // Enforce duration rules
  validateDuration(data.type, data.durationDays);
  const now = new Date();

  // Resolve entity owner if userId not provided
  let resolvedUserId = data.userId ?? adminUser.id;
  if (!data.userId) {
    try {
      if (data.target === "stack") {
        const [tool] = await db.select({ claimedBy: tools.claimedBy }).from(tools).where(eq(tools.id, data.targetEntityId)).limit(1);
        if (tool?.claimedBy) resolvedUserId = tool.claimedBy;
      } else if (data.target === "deal") {
        const [deal] = await db.select({ createdBy: deals.createdBy }).from(deals).where(eq(deals.id, data.targetEntityId)).limit(1);
        if (deal?.createdBy) resolvedUserId = deal.createdBy;
      } else if (data.target === "marketplace") {
        const [product] = await db.select({ creatorId: marketplaceProducts.creatorId }).from(marketplaceProducts).where(eq(marketplaceProducts.id, data.targetEntityId)).limit(1);
        if (product?.creatorId) resolvedUserId = product.creatorId;
      }
    } catch {}
  }

  const startsAt = now;
  const expiresAt = new Date(now.getTime() + data.durationDays * 24 * 60 * 60 * 1000);

  const [promo] = await db
    .insert(promotions)
    .values({
      userId: resolvedUserId,
      target: data.target,
      type: data.type,
      targetEntityId: data.targetEntityId,
      durationDays: data.durationDays,
      amountPaid: 0, // Free — admin-granted
      currency: "usd",
      status: "active",
      isManual: true,
      adminId: data.adminId ?? adminUser.id,
      adminNotes: data.notes ?? null,
      startsAt,
      expiresAt,
      slotDate: data.slotDate ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Apply effects immediately
  await applyPromotionEffects(promo);

  return promo;
}

export async function adminUpdatePromotionNotes(id: number, notes: string) {
  await requireAdmin();
  await db
    .update(promotions)
    .set({ adminNotes: notes, updatedAt: new Date() })
    .where(eq(promotions.id, id));
  return { success: true };
}


// ─── User-facing: My Promotions ───────────────────────────────────────────────

export async function getMyPromotions(userId: number) {
  const rows = await db
    .select()
    .from(promotions)
    .where(eq(promotions.userId, userId))
    .orderBy(desc(promotions.createdAt));

  // Enrich with entity names
  const enriched = await Promise.all(
    rows.map(async (row) => {
      let entityName = `#${row.targetEntityId}`;
      try {
        if (row.target === "stack") {
          const [tool] = await db.select({ name: tools.name }).from(tools).where(eq(tools.id, row.targetEntityId)).limit(1);
          if (tool) entityName = tool.name;
        } else if (row.target === "deal") {
          const [deal] = await db.select({ title: deals.title }).from(deals).where(eq(deals.id, row.targetEntityId)).limit(1);
          if (deal) entityName = deal.title;
        } else if (row.target === "marketplace") {
          const [product] = await db.select({ name: marketplaceProducts.name }).from(marketplaceProducts).where(eq(marketplaceProducts.id, row.targetEntityId)).limit(1);
          if (product) entityName = product.name;
        }
      } catch {}
      return { ...row, entityName };
    })
  );

  return enriched;
}

// ─── Cron: Expire & Activate Promotions ───────────────────────────────────────

export async function processPromotionLifecycle() {
  const now = new Date();
  let expired = 0;
  let activated = 0;

  // 1. Expire active promotions past their expiresAt
  const expiredPromos = await db
    .select()
    .from(promotions)
    .where(
      and(
        eq(promotions.status, "active"),
        isNotNull(promotions.expiresAt),
        lt(promotions.expiresAt, now)
      )
    );

  for (const promo of expiredPromos) {
    await db
      .update(promotions)
      .set({ status: "expired", updatedAt: now })
      .where(eq(promotions.id, promo.id));
    await removePromotionEffects(promo);
    expired++;
  }

  // 2. Activate scheduled promotions whose startsAt has arrived
  const scheduledPromos = await db
    .select()
    .from(promotions)
    .where(
      and(
        eq(promotions.status, "scheduled"),
        isNotNull(promotions.startsAt),
        lt(promotions.startsAt, now)
      )
    );

  for (const promo of scheduledPromos) {
    await db
      .update(promotions)
      .set({ status: "active", updatedAt: now })
      .where(eq(promotions.id, promo.id));
    await applyPromotionEffects({ ...promo, status: "active" });
    activated++;
  }

  // 3. Clean up expired holds on deal_of_day slots
  await db
    .delete(dealOfDaySlots)
    .where(
      and(
        eq(dealOfDaySlots.isConfirmed, false),
        isNotNull(dealOfDaySlots.holdExpiresAt),
        lt(dealOfDaySlots.holdExpiresAt, now)
      )
    );

  // 4. Cancel stale pending_payment promotions (older than 2 hours)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  await db
    .update(promotions)
    .set({ status: "failed", updatedAt: now })
    .where(
      and(
        eq(promotions.status, "pending_payment"),
        lt(promotions.createdAt, twoHoursAgo)
      )
    );

  return { expired, activated, timestamp: now.toISOString() };
}

// ─── Admin: Deal of the Day Slot Management ──────────────────────────────────

export async function adminGetDOTDSlots(opts: {
  startDate: string;
  endDate: string;
}) {
  await requireAdmin();
  const slots = await db
    .select({
      id: dealOfDaySlots.id,
      slotDate: dealOfDaySlots.slotDate,
      promotionId: dealOfDaySlots.promotionId,
      dealId: dealOfDaySlots.dealId,
      userId: dealOfDaySlots.userId,
      isConfirmed: dealOfDaySlots.isConfirmed,
      holdExpiresAt: dealOfDaySlots.holdExpiresAt,
      createdAt: dealOfDaySlots.createdAt,
    })
    .from(dealOfDaySlots)
    .where(
      and(
        gte(dealOfDaySlots.slotDate, opts.startDate),
        sql`${dealOfDaySlots.slotDate} <= ${opts.endDate}`
      )
    )
    .orderBy(asc(dealOfDaySlots.slotDate));

  // Enrich with deal and user info
  const enriched = await Promise.all(
    slots.map(async (slot) => {
      let dealTitle = `Deal #${slot.dealId}`;
      let userName = `User #${slot.userId}`;
      let userEmail = "";
      try {
        const [deal] = await db.select({ title: deals.title }).from(deals).where(eq(deals.id, slot.dealId)).limit(1);
        if (deal) dealTitle = deal.title;
        const [user] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, slot.userId)).limit(1);
        if (user) { userName = user.name ?? userName; userEmail = user.email ?? ""; }
      } catch {}
      return { ...slot, dealTitle, userName, userEmail };
    })
  );

  return enriched;
}

export async function adminOverrideDOTDSlot(data: {
  slotDate: string;
  dealId: number;
  userId?: number;
  adminId?: number;
  notes?: string;
}) {
  const adminUser = await requireAdmin();
  const now = new Date();
  const expiresAt = new Date(new Date(data.slotDate + "T23:59:59Z").getTime());

  // Remove any existing slot for this date
  await db.delete(dealOfDaySlots).where(eq(dealOfDaySlots.slotDate, data.slotDate));

  // Cancel any existing promotion for this date
  const existingPromos = await db
    .select()
    .from(promotions)
    .where(
      and(
        eq(promotions.type, "deal_of_day"),
        eq(promotions.slotDate, data.slotDate),
        inArray(promotions.status, ["active", "scheduled", "paid"])
      )
    );
  for (const p of existingPromos) {
    await db.update(promotions).set({ status: "cancelled", adminNotes: `Overridden by admin on ${now.toISOString()}`, updatedAt: now }).where(eq(promotions.id, p.id));
    await removePromotionEffects(p);
  }

  // Create manual promotion
  const [promo] = await db
    .insert(promotions)
    .values({
      userId: data.userId ?? adminUser.id,
      target: "deal",
      type: "deal_of_day",
      targetEntityId: data.dealId,
      durationDays: 1,
      amountPaid: 0,
      currency: "usd",
      status: "scheduled",
      isManual: true,
      adminId: data.adminId ?? adminUser.id,
      adminNotes: data.notes ?? "Admin override",
      startsAt: new Date(data.slotDate + "T00:00:00Z"),
      expiresAt,
      slotDate: data.slotDate,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Book the slot
  await db.insert(dealOfDaySlots).values({
    slotDate: data.slotDate,
    promotionId: promo.id,
    dealId: data.dealId,
    userId: data.userId ?? adminUser.id,
    isConfirmed: true,
    holdExpiresAt: null,
    createdAt: now,
  });

  return promo;
}

export async function adminRemoveDOTDSlot(slotDate: string) {
  await requireAdmin();
  const now = new Date();

  // Cancel any promotion for this slot
  const promos = await db
    .select()
    .from(promotions)
    .where(
      and(
        eq(promotions.type, "deal_of_day"),
        eq(promotions.slotDate, slotDate),
        inArray(promotions.status, ["active", "scheduled", "paid", "pending_payment"])
      )
    );
  for (const p of promos) {
    await db.update(promotions).set({ status: "cancelled", adminNotes: `Slot removed by admin on ${now.toISOString()}`, updatedAt: now }).where(eq(promotions.id, p.id));
    await removePromotionEffects(p);
  }

  // Delete the slot
  await db.delete(dealOfDaySlots).where(eq(dealOfDaySlots.slotDate, slotDate));

  return { success: true };
}

// ─── Admin: Per-Target Stats ─────────────────────────────────────────────────

export async function getAdminPromotionStatsByTarget() {
  await requireAdmin();

  const [stackStats] = await db
    .select({
      total: count(),
      active: sql<number>`COUNT(CASE WHEN ${promotions.status} = 'active' THEN 1 END)`,
      revenue: sql<number>`COALESCE(SUM(${promotions.amountPaid}), 0)`,
    })
    .from(promotions)
    .where(eq(promotions.target, "stack"));

  const [dealStats] = await db
    .select({
      total: count(),
      active: sql<number>`COUNT(CASE WHEN ${promotions.status} = 'active' THEN 1 END)`,
      revenue: sql<number>`COALESCE(SUM(${promotions.amountPaid}), 0)`,
    })
    .from(promotions)
    .where(eq(promotions.target, "deal"));

  const [marketplaceStats] = await db
    .select({
      total: count(),
      active: sql<number>`COUNT(CASE WHEN ${promotions.status} = 'active' THEN 1 END)`,
      revenue: sql<number>`COALESCE(SUM(${promotions.amountPaid}), 0)`,
    })
    .from(promotions)
    .where(eq(promotions.target, "marketplace"));

  const [overallStats] = await db
    .select({
      total: count(),
      active: sql<number>`COUNT(CASE WHEN ${promotions.status} = 'active' THEN 1 END)`,
      pending: sql<number>`COUNT(CASE WHEN ${promotions.status} = 'pending_payment' THEN 1 END)`,
      expired: sql<number>`COUNT(CASE WHEN ${promotions.status} = 'expired' THEN 1 END)`,
      cancelled: sql<number>`COUNT(CASE WHEN ${promotions.status} = 'cancelled' THEN 1 END)`,
      totalRevenue: sql<number>`COALESCE(SUM(${promotions.amountPaid}), 0)`,
      manualCount: sql<number>`COUNT(CASE WHEN ${promotions.isManual} = true THEN 1 END)`,
      thisMonth: sql<number>`COUNT(CASE WHEN ${promotions.createdAt} >= date_trunc('month', CURRENT_DATE) THEN 1 END)`,
      thisMonthRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${promotions.createdAt} >= date_trunc('month', CURRENT_DATE) THEN ${promotions.amountPaid} ELSE 0 END), 0)`,
    })
    .from(promotions);

  return {
    overall: overallStats ?? { total: 0, active: 0, pending: 0, expired: 0, cancelled: 0, totalRevenue: 0, manualCount: 0, thisMonth: 0, thisMonthRevenue: 0 },
    stack: stackStats ?? { total: 0, active: 0, revenue: 0 },
    deal: dealStats ?? { total: 0, active: 0, revenue: 0 },
    marketplace: marketplaceStats ?? { total: 0, active: 0, revenue: 0 },
  };
}

// ─── Admin: Force Expire a Promotion ─────────────────────────────────────────

export async function adminForceExpirePromotion(id: number, notes?: string) {
  await requireAdmin();
  const now = new Date();
  const [promo] = await db.select().from(promotions).where(eq(promotions.id, id)).limit(1);
  if (!promo) throw new Error("Promotion not found");
  if (promo.status !== "active" && promo.status !== "paused") {
    throw new Error("Can only force-expire active or paused promotions");
  }
  await db
    .update(promotions)
    .set({
      status: "expired",
      expiresAt: now,
      adminNotes: notes ? `${promo.adminNotes ?? ""}\n[Force expired] ${notes}`.trim() : promo.adminNotes,
      updatedAt: now,
    })
    .where(eq(promotions.id, id));
  await removePromotionEffects(promo);
  return { success: true };
}

// ─── Admin: Change Promotion Status ──────────────────────────────────────────

export async function adminChangePromotionStatus(id: number, newStatus: PromotionStatus, notes?: string) {
  await requireAdmin();
  const now = new Date();
  const [promo] = await db.select().from(promotions).where(eq(promotions.id, id)).limit(1);
  if (!promo) throw new Error("Promotion not found");

  await db
    .update(promotions)
    .set({
      status: newStatus,
      adminNotes: notes ? `${promo.adminNotes ?? ""}\n[Status → ${newStatus}] ${notes}`.trim() : promo.adminNotes,
      updatedAt: now,
    })
    .where(eq(promotions.id, id));

  // Apply or remove effects based on new status
  if (newStatus === "active") {
    await applyPromotionEffects({ ...promo, status: "active" });
  } else if (["expired", "cancelled", "failed"].includes(newStatus)) {
    await removePromotionEffects(promo);
  }

  return { success: true };
}

// ─── Admin: Get Promotions for a Specific Entity ─────────────────────────────

export async function getPromotionsForEntity(target: PromotionTarget, entityId: number) {
  await requireAdmin();
  const rows = await db
    .select({
      id: promotions.id,
      type: promotions.type,
      status: promotions.status,
      durationDays: promotions.durationDays,
      amountPaid: promotions.amountPaid,
      startsAt: promotions.startsAt,
      expiresAt: promotions.expiresAt,
      isManual: promotions.isManual,
      createdAt: promotions.createdAt,
    })
    .from(promotions)
    .where(
      and(
        eq(promotions.target, target),
        eq(promotions.targetEntityId, entityId)
      )
    )
    .orderBy(desc(promotions.createdAt));
  return rows;
}
