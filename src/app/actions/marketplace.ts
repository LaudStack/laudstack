"use server";
import { db } from "@/server/db";
import {
  users,
  marketplaceProducts,
  marketplaceOrders,
  marketplaceReviews,
  marketplaceOffers,
} from "@/drizzle/schema";
import { eq, and, desc, asc, sql, ilike, or, count, inArray } from "drizzle-orm";
import {
  notifyNewOffer,
  notifyOfferAccepted,
  notifyOfferRejected,
  notifyOfferCountered,
  notifyNewProductReview,
  notifyProductApproved,
  notifyProductRejected,
} from "@/lib/marketplaceNotifications";
import { requireAuth, requireAdmin } from "@/lib/admin-auth";

async function requireCreator() {
  const user = await requireAuth();
  if (!user.isMarketplaceCreator) throw new Error("NOT_A_CREATOR");
  if (!user.stripeConnectAccountId) throw new Error("STRIPE_CONNECT_NOT_SET_UP");
  return user;
}

// ─── Slug helper ──────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
    + "-" + Math.random().toString(36).slice(2, 8);
}

// ─── Categories that support Make Offer ───────────────────────────────────────

const OFFER_ELIGIBLE_CATEGORIES = ["micro_saas", "full_apps", "startup_assets"] as const;

function isOfferEligible(category: string): boolean {
  return (OFFER_ELIGIBLE_CATEGORIES as readonly string[]).includes(category);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATOR ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Create a new marketplace product (draft) */
export async function createProduct(data: {
  name: string;
  tagline: string;
  description: string;
  longDescription?: string;
  category: "templates" | "saas_boilerplates" | "micro_saas" | "full_apps" | "automation_tools" | "startup_assets";
  price: number; // cents
  compareAtPrice?: number;
  previewImageUrl?: string;
  screenshots?: string[];
  demoUrl?: string;
  downloadFileKey?: string;
  downloadFileName?: string;
  downloadFileSize?: number;
  techStack?: string[];
  includes?: string[];
  features?: { title: string; description: string }[];
  tags?: string[];
}) {
  try {
    const user = await requireCreator();
    const slug = generateSlug(data.name);
    const offersEnabled = isOfferEligible(data.category);

    const [product] = await db.insert(marketplaceProducts).values({
      creatorId: user.id,
      slug,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      longDescription: data.longDescription || null,
      category: data.category,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      offersEnabled,
      minimumOfferPercent: 60,
      previewImageUrl: data.previewImageUrl || null,
      screenshots: data.screenshots || [],
      demoUrl: data.demoUrl || null,
      downloadFileKey: data.downloadFileKey || null,
      downloadFileName: data.downloadFileName || null,
      downloadFileSize: data.downloadFileSize || null,
      techStack: data.techStack || [],
      includes: data.includes || [],
      features: data.features || [],
      tags: data.tags || [],
      status: "draft",
    }).returning();

    return { success: true, product };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create product";
    return { success: false, error: msg };
  }
}

/** Submit a product for review (draft/rejected → pending) */
export async function submitProductForReview(productId: number) {
  try {
    const user = await requireCreator();
    const [product] = await db.select().from(marketplaceProducts).where(eq(marketplaceProducts.id, productId));
    if (!product) return { success: false, error: "Product not found" };
    if (product.creatorId !== user.id) return { success: false, error: "Not your product" };
    if (product.status !== "draft" && product.status !== "rejected") {
      return { success: false, error: "Product can only be submitted from draft or rejected status" };
    }
    // Validate required fields
    if (!product.name || !product.tagline || !product.description || product.price === null) {
      return { success: false, error: "Please fill in all required fields before submitting" };
    }

    await db.update(marketplaceProducts)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(marketplaceProducts.id, productId));

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to submit product";
    return { success: false, error: msg };
  }
}

/** Pause/unpause a product (approved ↔ paused) */
export async function toggleProductPause(productId: number) {
  try {
    const user = await requireCreator();
    const [product] = await db.select().from(marketplaceProducts).where(eq(marketplaceProducts.id, productId));
    if (!product) return { success: false, error: "Product not found" };
    if (product.creatorId !== user.id) return { success: false, error: "Not your product" };

    if (product.status === "approved") {
      await db.update(marketplaceProducts)
        .set({ status: "paused", updatedAt: new Date() })
        .where(eq(marketplaceProducts.id, productId));
      return { success: true, newStatus: "paused" as const };
    } else if (product.status === "paused") {
      await db.update(marketplaceProducts)
        .set({ status: "approved", updatedAt: new Date() })
        .where(eq(marketplaceProducts.id, productId));
      return { success: true, newStatus: "approved" as const };
    }

    return { success: false, error: "Product must be approved or paused to toggle" };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to toggle product status";
    return { success: false, error: msg };
  }
}

/** Get all products for the current creator */
export async function getCreatorProducts() {
  try {
    const user = await requireCreator();
    const products = await db.select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.creatorId, user.id))
      .orderBy(desc(marketplaceProducts.createdAt));
    return { success: true, products };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get products";
    return { success: false, error: msg, products: [] };
  }
}

/** Get creator's orders (sales) */
export async function getCreatorOrders(page = 1, limit = 20) {
  try {
    const user = await requireCreator();
    const offset = (page - 1) * limit;

    const orders = await db.select({
      order: marketplaceOrders,
      product: marketplaceProducts,
      buyer: { id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl },
    })
      .from(marketplaceOrders)
      .innerJoin(marketplaceProducts, eq(marketplaceOrders.productId, marketplaceProducts.id))
      .innerJoin(users, eq(marketplaceOrders.buyerId, users.id))
      .where(eq(marketplaceOrders.creatorId, user.id))
      .orderBy(desc(marketplaceOrders.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(marketplaceOrders)
      .where(eq(marketplaceOrders.creatorId, user.id));

    return { success: true, orders, total };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get orders";
    return { success: false, error: msg, orders: [], total: 0 };
  }
}

/** Get creator analytics summary */
export async function getCreatorAnalytics() {
  try {
    const user = await requireCreator();

    const products = await db.select()
      .from(marketplaceProducts)
      .where(eq(marketplaceProducts.creatorId, user.id));

    const totalProducts = products.length;
    const totalViews = products.reduce((sum, p) => sum + p.viewCount, 0);
    const totalSales = products.reduce((sum, p) => sum + p.salesCount, 0);
    const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
    const avgRating = totalProducts > 0
      ? products.reduce((sum, p) => sum + p.averageRating, 0) / totalProducts
      : 0;

    return {
      success: true,
      analytics: { totalProducts, totalViews, totalSales, totalRevenue, avgRating },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get analytics";
    return { success: false, error: msg };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ACTIONS (Browse / Detail)
// ═══════════════════════════════════════════════════════════════════════════════

/** Browse marketplace products with filters */
export async function browseProducts({
  category,
  search,
  sort = "popular",
  priceFilter = "all",
  page = 1,
  limit = 24,
}: {
  category?: string;
  search?: string;
  sort?: "popular" | "newest" | "top_rated" | "most_sales" | "price_low" | "price_high";
  priceFilter?: "all" | "free" | "paid";
  page?: number;
  limit?: number;
} = {}) {
  try {
    const offset = (page - 1) * limit;
    const conditions = [eq(marketplaceProducts.status, "approved")];

    if (category && category !== "all") {
      conditions.push(eq(marketplaceProducts.category, category as any));
    }
    if (search) {
      conditions.push(
        or(
          ilike(marketplaceProducts.name, `%${search}%`),
          ilike(marketplaceProducts.tagline, `%${search}%`),
          ilike(marketplaceProducts.description, `%${search}%`),
        )!
      );
    }
    if (priceFilter === "free") {
      conditions.push(eq(marketplaceProducts.price, 0));
    } else if (priceFilter === "paid") {
      conditions.push(sql`${marketplaceProducts.price} > 0`);
    }

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    let orderBy;
    switch (sort) {
      case "newest": orderBy = desc(marketplaceProducts.createdAt); break;
      case "top_rated": orderBy = desc(marketplaceProducts.averageRating); break;
      case "most_sales": orderBy = desc(marketplaceProducts.salesCount); break;
      case "price_low": orderBy = asc(marketplaceProducts.price); break;
      case "price_high": orderBy = desc(marketplaceProducts.price); break;
      default: orderBy = desc(marketplaceProducts.salesCount); break; // popular
    }

    const products = await db.select({
      product: marketplaceProducts,
      creator: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
      .from(marketplaceProducts)
      .innerJoin(users, eq(marketplaceProducts.creatorId, users.id))
      .where(whereClause)
      .orderBy(
        desc(marketplaceProducts.isBoosted), // boosted first
        desc(marketplaceProducts.isFeatured), // featured second
        orderBy
      )
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(marketplaceProducts)
      .where(whereClause);

    return { success: true, products, total };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to browse products";
    return { success: false, error: msg, products: [], total: 0 };
  }
}

/** Get a single product by slug (public) */
export async function getProductBySlug(slug: string) {
  try {
    const [result] = await db.select({
      product: marketplaceProducts,
      creator: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        headline: users.headline,
      },
    })
      .from(marketplaceProducts)
      .innerJoin(users, eq(marketplaceProducts.creatorId, users.id))
      .where(eq(marketplaceProducts.slug, slug));

    if (!result) return { success: false, error: "Product not found" };

    // Increment view count (fire-and-forget)
    db.update(marketplaceProducts)
      .set({ viewCount: sql`${marketplaceProducts.viewCount} + 1` })
      .where(eq(marketplaceProducts.slug, slug))
      .then(() => {})
      .catch(() => {});

    return { success: true, ...result };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get product";
    return { success: false, error: msg };
  }
}

/** Get featured products for the marketplace homepage */
export async function getFeaturedProducts(limit = 8) {
  try {
    const products = await db.select({
      product: marketplaceProducts,
      creator: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
      .from(marketplaceProducts)
      .innerJoin(users, eq(marketplaceProducts.creatorId, users.id))
      .where(
        and(
          eq(marketplaceProducts.status, "approved"),
          or(
            eq(marketplaceProducts.isFeatured, true),
            eq(marketplaceProducts.isBoosted, true),
          ),
        )
      )
      .orderBy(desc(marketplaceProducts.isFeatured), desc(marketplaceProducts.salesCount))
      .limit(limit);

    return { success: true, products };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get featured products";
    return { success: false, error: msg, products: [] };
  }
}

/** Check if the current user has purchased a product */
export async function hasUserPurchased(productId: number) {
  try {
    const user = await requireAuth();
    const [order] = await db.select()
      .from(marketplaceOrders)
      .where(
        and(
          eq(marketplaceOrders.productId, productId),
          eq(marketplaceOrders.buyerId, user.id),
          eq(marketplaceOrders.status, "completed"),
        )
      )
      .limit(1);
    return { success: true, purchased: !!order, order: order || null };
  } catch {
    return { success: true, purchased: false, order: null };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUYER ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Get buyer's purchases */
export async function getBuyerPurchases(page = 1, limit = 20) {
  try {
    const user = await requireAuth();
    const offset = (page - 1) * limit;

    const orders = await db.select({
      order: marketplaceOrders,
      product: marketplaceProducts,
      creator: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
      .from(marketplaceOrders)
      .innerJoin(marketplaceProducts, eq(marketplaceOrders.productId, marketplaceProducts.id))
      .innerJoin(users, eq(marketplaceOrders.creatorId, users.id))
      .where(
        and(
          eq(marketplaceOrders.buyerId, user.id),
          eq(marketplaceOrders.status, "completed"),
        )
      )
      .orderBy(desc(marketplaceOrders.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(marketplaceOrders)
      .where(
        and(
          eq(marketplaceOrders.buyerId, user.id),
          eq(marketplaceOrders.status, "completed"),
        )
      );

    return { success: true, orders, total };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get purchases";
    return { success: false, error: msg, orders: [], total: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OFFER ACTIONS (Make Offer negotiation)
// ═══════════════════════════════════════════════════════════════════════════════

/** Submit a Make Offer on a product */
export async function submitOffer(data: {
  productId: number;
  offerAmountCents: number;
  message?: string;
}) {
  try {
    const user = await requireAuth();

    // Get the product
    const [product] = await db.select().from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, data.productId));
    if (!product) return { success: false, error: "Product not found" };
    if (product.status !== "approved") return { success: false, error: "Product is not available" };
    if (!product.offersEnabled) return { success: false, error: "This product does not accept offers" };
    if (product.creatorId === user.id) return { success: false, error: "You cannot make an offer on your own product" };

    // Validate minimum offer
    const minOffer = Math.ceil(product.price * (product.minimumOfferPercent / 100));
    if (data.offerAmountCents < minOffer) {
      return { success: false, error: `Minimum offer is $${(minOffer / 100).toFixed(2)} (${product.minimumOfferPercent}% of listing price)` };
    }

    // Check for existing active offer from this buyer on this product
    const [existingOffer] = await db.select().from(marketplaceOffers)
      .where(
        and(
          eq(marketplaceOffers.productId, data.productId),
          eq(marketplaceOffers.buyerId, user.id),
          inArray(marketplaceOffers.status, ["pending", "countered"]),
        )
      )
      .limit(1);
    if (existingOffer) {
      return { success: false, error: "You already have an active offer on this product" };
    }

    // Create the offer with 72-hour expiration
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const [offer] = await db.insert(marketplaceOffers).values({
      productId: data.productId,
      buyerId: user.id,
      creatorId: product.creatorId,
      offerAmountCents: data.offerAmountCents,
      message: data.message || null,
      status: "pending",
      expiresAt,
    }).returning();

    // Notify creator about the new offer
    notifyNewOffer({
      creatorId: product.creatorId,
      buyerId: user.id,
      productName: product.name,
      offerAmount: data.offerAmountCents,
    });

    return { success: true, offer };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to submit offer";
    return { success: false, error: msg };
  }
}

/** Creator accepts an offer */
export async function acceptOffer(offerId: number) {
  try {
    const user = await requireCreator();

    const [offer] = await db.select().from(marketplaceOffers)
      .where(eq(marketplaceOffers.id, offerId));
    if (!offer) return { success: false, error: "Offer not found" };
    if (offer.creatorId !== user.id) return { success: false, error: "Not your offer to respond to" };
    if (offer.status !== "pending") return { success: false, error: "Offer is no longer pending" };
    if (new Date() > offer.expiresAt) {
      await db.update(marketplaceOffers)
        .set({ status: "expired" })
        .where(eq(marketplaceOffers.id, offerId));
      return { success: false, error: "Offer has expired" };
    }

    await db.update(marketplaceOffers)
      .set({ status: "accepted", respondedAt: new Date() })
      .where(eq(marketplaceOffers.id, offerId));

    // Notify buyer that their offer was accepted
    const [product] = await db.select().from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, offer.productId));
    if (product) {
      notifyOfferAccepted({
        buyerId: offer.buyerId,
        creatorId: user.id,
        productName: product.name,
        productSlug: product.slug,
        amount: offer.offerAmountCents,
      });
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to accept offer";
    return { success: false, error: msg };
  }
}

/** Creator rejects an offer */
export async function rejectOffer(offerId: number, reason?: string) {
  try {
    const user = await requireCreator();

    const [offer] = await db.select().from(marketplaceOffers)
      .where(eq(marketplaceOffers.id, offerId));
    if (!offer) return { success: false, error: "Offer not found" };
    if (offer.creatorId !== user.id) return { success: false, error: "Not your offer to respond to" };
    if (offer.status !== "pending") return { success: false, error: "Offer is no longer pending" };

    await db.update(marketplaceOffers)
      .set({ status: "rejected", rejectionReason: reason || null, respondedAt: new Date() })
      .where(eq(marketplaceOffers.id, offerId));

    // Notify buyer that their offer was rejected
    const [product] = await db.select().from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, offer.productId));
    if (product) {
      notifyOfferRejected({
        buyerId: offer.buyerId,
        creatorId: user.id,
        productName: product.name,
        reason,
      });
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to reject offer";
    return { success: false, error: msg };
  }
}

/** Creator counters an offer (single counter allowed) */
export async function counterOffer(offerId: number, counterAmountCents: number, counterMessage?: string) {
  try {
    const user = await requireCreator();

    const [offer] = await db.select().from(marketplaceOffers)
      .where(eq(marketplaceOffers.id, offerId));
    if (!offer) return { success: false, error: "Offer not found" };
    if (offer.creatorId !== user.id) return { success: false, error: "Not your offer to respond to" };
    if (offer.status !== "pending") return { success: false, error: "Offer is no longer pending" };
    if (offer.counterAmountCents !== null) return { success: false, error: "Already countered once" };
    if (new Date() > offer.expiresAt) {
      await db.update(marketplaceOffers)
        .set({ status: "expired" })
        .where(eq(marketplaceOffers.id, offerId));
      return { success: false, error: "Offer has expired" };
    }

    // Counter must be between the offer and listing price
    const [product] = await db.select().from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, offer.productId));
    if (!product) return { success: false, error: "Product not found" };

    if (counterAmountCents <= offer.offerAmountCents) {
      return { success: false, error: "Counter must be higher than the original offer" };
    }
    if (counterAmountCents > product.price) {
      return { success: false, error: "Counter cannot exceed the listing price" };
    }

    // Reset expiration to 72 hours from now
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await db.update(marketplaceOffers)
      .set({
        status: "countered",
        counterAmountCents,
        counterMessage: counterMessage || null,
        respondedAt: new Date(),
        expiresAt,
      })
      .where(eq(marketplaceOffers.id, offerId));

    // Notify buyer about the counter-offer
    notifyOfferCountered({
      buyerId: offer.buyerId,
      creatorId: user.id,
      productName: product.name,
      productSlug: product.slug,
      counterAmount: counterAmountCents,
    });

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to counter offer";
    return { success: false, error: msg };
  }
}

/** Buyer cancels their offer */
export async function cancelOffer(offerId: number) {
  try {
    const user = await requireAuth();

    const [offer] = await db.select().from(marketplaceOffers)
      .where(eq(marketplaceOffers.id, offerId));
    if (!offer) return { success: false, error: "Offer not found" };
    if (offer.buyerId !== user.id) return { success: false, error: "Not your offer" };
    if (offer.status !== "pending" && offer.status !== "countered") {
      return { success: false, error: "Offer cannot be cancelled in its current state" };
    }

    await db.update(marketplaceOffers)
      .set({ status: "cancelled" })
      .where(eq(marketplaceOffers.id, offerId));

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to cancel offer";
    return { success: false, error: msg };
  }
}

/** Get offers for a creator (incoming offers) */
export async function getCreatorOffers(page = 1, limit = 20) {
  try {
    const user = await requireCreator();
    const offset = (page - 1) * limit;

    const offers = await db.select({
      offer: marketplaceOffers,
      product: { id: marketplaceProducts.id, name: marketplaceProducts.name, slug: marketplaceProducts.slug, price: marketplaceProducts.price, previewImageUrl: marketplaceProducts.previewImageUrl },
      buyer: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
      .from(marketplaceOffers)
      .innerJoin(marketplaceProducts, eq(marketplaceOffers.productId, marketplaceProducts.id))
      .innerJoin(users, eq(marketplaceOffers.buyerId, users.id))
      .where(eq(marketplaceOffers.creatorId, user.id))
      .orderBy(desc(marketplaceOffers.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(marketplaceOffers)
      .where(eq(marketplaceOffers.creatorId, user.id));

    return { success: true, offers, total };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get offers";
    return { success: false, error: msg, offers: [], total: 0 };
  }
}

/** Get offers for a buyer (my offers) */
export async function getBuyerOffers(page = 1, limit = 20) {
  try {
    const user = await requireAuth();
    const offset = (page - 1) * limit;

    const offers = await db.select({
      offer: marketplaceOffers,
      product: { id: marketplaceProducts.id, name: marketplaceProducts.name, slug: marketplaceProducts.slug, price: marketplaceProducts.price, previewImageUrl: marketplaceProducts.previewImageUrl },
      creator: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
      .from(marketplaceOffers)
      .innerJoin(marketplaceProducts, eq(marketplaceOffers.productId, marketplaceProducts.id))
      .innerJoin(users, eq(marketplaceOffers.creatorId, users.id))
      .where(eq(marketplaceOffers.buyerId, user.id))
      .orderBy(desc(marketplaceOffers.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(marketplaceOffers)
      .where(eq(marketplaceOffers.buyerId, user.id));

    return { success: true, offers, total };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get offers";
    return { success: false, error: msg, offers: [], total: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEW ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Submit a review (purchase-gated) */
export async function submitReview(data: {
  productId: number;
  rating: number;
  title: string;
  body: string;
}) {
  try {
    const user = await requireAuth();

    // Progressive verification: require email verification to leave a review
    if (!user.emailVerified) {
      return { success: false, error: "EMAIL_NOT_VERIFIED", message: "Please verify your email to leave a review." };
    }

    // Must have purchased
    const [order] = await db.select().from(marketplaceOrders)
      .where(
        and(
          eq(marketplaceOrders.productId, data.productId),
          eq(marketplaceOrders.buyerId, user.id),
          eq(marketplaceOrders.status, "completed"),
        )
      )
      .limit(1);
    if (!order) return { success: false, error: "You must purchase this product before reviewing" };

    // Check for existing review
    const [existingReview] = await db.select().from(marketplaceReviews)
      .where(
        and(
          eq(marketplaceReviews.productId, data.productId),
          eq(marketplaceReviews.userId, user.id),
        )
      )
      .limit(1);
    if (existingReview) return { success: false, error: "You have already reviewed this product" };

    // Validate rating
    if (data.rating < 1 || data.rating > 5) return { success: false, error: "Rating must be 1-5" };

    const [review] = await db.insert(marketplaceReviews).values({
      productId: data.productId,
      userId: user.id,
      orderId: order.id,
      rating: data.rating,
      title: data.title,
      body: data.body,
    }).returning();

    // Notify creator about the new review
    const [reviewedProduct] = await db.select().from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, data.productId));
    if (reviewedProduct) {
      notifyNewProductReview({
        creatorId: reviewedProduct.creatorId,
        reviewerId: user.id,
        productName: reviewedProduct.name,
        productSlug: reviewedProduct.slug,
        rating: data.rating,
      });
    }

    // Update product average rating
    const allReviews = await db.select({ rating: marketplaceReviews.rating })
      .from(marketplaceReviews)
      .where(
        and(
          eq(marketplaceReviews.productId, data.productId),
          eq(marketplaceReviews.status, "published"),
        )
      );
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await db.update(marketplaceProducts)
      .set({ averageRating: avgRating, reviewCount: allReviews.length })
      .where(eq(marketplaceProducts.id, data.productId));

    return { success: true, review };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to submit review";
    return { success: false, error: msg };
  }
}

/** Get reviews for a product */
export async function getProductReviews(productId: number, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;

    const reviews = await db.select({
      review: marketplaceReviews,
      user: { id: users.id, name: users.name, avatarUrl: users.avatarUrl },
    })
      .from(marketplaceReviews)
      .innerJoin(users, eq(marketplaceReviews.userId, users.id))
      .where(
        and(
          eq(marketplaceReviews.productId, productId),
          eq(marketplaceReviews.status, "published"),
        )
      )
      .orderBy(desc(marketplaceReviews.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(marketplaceReviews)
      .where(
        and(
          eq(marketplaceReviews.productId, productId),
          eq(marketplaceReviews.status, "published"),
        )
      );

    return { success: true, reviews, total };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get reviews";
    return { success: false, error: msg, reviews: [], total: 0 };
  }
}

/** Creator replies to a review */
export async function replyToReview(reviewId: number, reply: string) {
  try {
    const user = await requireCreator();

    const [review] = await db.select().from(marketplaceReviews)
      .where(eq(marketplaceReviews.id, reviewId));
    if (!review) return { success: false, error: "Review not found" };

    // Verify the creator owns the product
    const [product] = await db.select().from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, review.productId));
    if (!product || product.creatorId !== user.id) {
      return { success: false, error: "Not your product" };
    }

    await db.update(marketplaceReviews)
      .set({ creatorReply: reply, creatorReplyAt: new Date(), updatedAt: new Date() })
      .where(eq(marketplaceReviews.id, reviewId));

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to reply to review";
    return { success: false, error: msg };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Admin: get all products with filters */
export async function adminGetProducts({
  status,
  page = 1,
  limit = 20,
}: {
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  try {
    await requireAdmin();
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(marketplaceProducts.status, status as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const products = await db.select({
      product: marketplaceProducts,
      creator: { id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl },
    })
      .from(marketplaceProducts)
      .innerJoin(users, eq(marketplaceProducts.creatorId, users.id))
      .where(whereClause)
      .orderBy(desc(marketplaceProducts.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(marketplaceProducts)
      .where(whereClause);

    return { success: true, products, total };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get products";
    return { success: false, error: msg, products: [], total: 0 };
  }
}

/** Admin: approve a product */
export async function adminApproveProduct(productId: number) {
  try {
    const admin = await requireAdmin();

    const [product] = await db.select().from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, productId));
    if (!product) return { success: false, error: "Product not found" };
    if (product.status !== "pending") return { success: false, error: "Product is not pending review" };

    await db.update(marketplaceProducts)
      .set({
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(marketplaceProducts.id, productId));

    // Notify creator that their product was approved
    notifyProductApproved({
      creatorId: product.creatorId,
      productName: product.name,
      productSlug: product.slug,
    });

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to approve product";
    return { success: false, error: msg };
  }
}

/** Admin: reject a product */
export async function adminRejectProduct(productId: number, reviewNotes: string) {
  try {
    const admin = await requireAdmin();

    const [product] = await db.select().from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, productId));
    if (!product) return { success: false, error: "Product not found" };
    if (product.status !== "pending") return { success: false, error: "Product is not pending review" };

    await db.update(marketplaceProducts)
      .set({
        status: "rejected",
        reviewNotes,
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(marketplaceProducts.id, productId));

    // Notify creator that their product was rejected
    notifyProductRejected({
      creatorId: product.creatorId,
      productName: product.name,
      reason: reviewNotes,
    });

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to reject product";
    return { success: false, error: msg };
  }
}

/** Admin: toggle featured status */
export async function adminToggleFeatured(productId: number) {
  try {
    await requireAdmin();

    const [product] = await db.select().from(marketplaceProducts)
      .where(eq(marketplaceProducts.id, productId));
    if (!product) return { success: false, error: "Product not found" };

    await db.update(marketplaceProducts)
      .set({ isFeatured: !product.isFeatured, updatedAt: new Date() })
      .where(eq(marketplaceProducts.id, productId));

    return { success: true, isFeatured: !product.isFeatured };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to toggle featured";
    return { success: false, error: msg };
  }
}

/** Admin: get all orders */
export async function adminGetOrders(page = 1, limit = 20) {
  try {
    await requireAdmin();
    const offset = (page - 1) * limit;

    const orders = await db.select({
      order: marketplaceOrders,
      product: { id: marketplaceProducts.id, name: marketplaceProducts.name, slug: marketplaceProducts.slug },
      buyer: { id: users.id, name: users.name, email: users.email },
    })
      .from(marketplaceOrders)
      .innerJoin(marketplaceProducts, eq(marketplaceOrders.productId, marketplaceProducts.id))
      .innerJoin(users, eq(marketplaceOrders.buyerId, users.id))
      .orderBy(desc(marketplaceOrders.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() }).from(marketplaceOrders);

    // Revenue summary
    const [revenue] = await db.select({
      totalRevenue: sql<number>`COALESCE(SUM(${marketplaceOrders.amount}), 0)`,
      totalFees: sql<number>`COALESCE(SUM(${marketplaceOrders.platformFee}), 0)`,
      totalPayouts: sql<number>`COALESCE(SUM(${marketplaceOrders.creatorPayout}), 0)`,
      orderCount: count(),
    }).from(marketplaceOrders).where(eq(marketplaceOrders.status, "completed"));

    return { success: true, orders, total, revenue };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get orders";
    return { success: false, error: msg, orders: [], total: 0 };
  }
}

/** Admin: get all creators */
export async function adminGetCreators(page = 1, limit = 20) {
  try {
    await requireAdmin();
    const offset = (page - 1) * limit;

    const creators = await db.select()
      .from(users)
      .where(eq(users.isMarketplaceCreator, true))
      .orderBy(desc(users.creatorActivatedAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(users)
      .where(eq(users.isMarketplaceCreator, true));

    return { success: true, creators, total };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get creators";
    return { success: false, error: msg, creators: [], total: 0 };
  }
}

/** Admin: get marketplace revenue summary */
export async function adminGetRevenueSummary() {
  try {
    await requireAdmin();

    const [revenue] = await db.select({
      totalRevenue: sql<number>`COALESCE(SUM(${marketplaceOrders.amount}), 0)`,
      totalFees: sql<number>`COALESCE(SUM(${marketplaceOrders.platformFee}), 0)`,
      totalPayouts: sql<number>`COALESCE(SUM(${marketplaceOrders.creatorPayout}), 0)`,
      orderCount: count(),
    }).from(marketplaceOrders).where(eq(marketplaceOrders.status, "completed"));

    const [productStats] = await db.select({
      totalProducts: count(),
    }).from(marketplaceProducts);

    const [creatorStats] = await db.select({
      totalCreators: count(),
    }).from(users).where(eq(users.isMarketplaceCreator, true));

    return {
      success: true,
      revenue: {
        ...revenue,
        totalProducts: productStats.totalProducts,
        totalCreators: creatorStats.totalCreators,
      },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to get revenue summary";
    return { success: false, error: msg };
  }
}
