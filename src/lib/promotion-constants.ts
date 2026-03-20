/**
 * Shared promotion constants — safe for both client and server use.
 * The "use server" file cannot export non-async values, so we keep them here.
 */

export type PromotionType =
  | "stack_featured"
  | "stack_spotlight"
  | "stack_category_boost"
  | "deal_pinned"
  | "deal_featured"
  | "deal_of_day"
  | "marketplace_boost"
  | "marketplace_spotlight";

export type PromotionTarget = "stack" | "deal" | "marketplace";

export const ALLOWED_DURATIONS: Record<PromotionType, number[]> = {
  stack_featured: [3, 7, 14, 30],
  stack_spotlight: [3, 7, 14, 30],
  stack_category_boost: [3, 7, 14, 30],
  deal_pinned: [3, 7, 14, 30],
  deal_featured: [3, 7, 14, 30],
  deal_of_day: [1],
  marketplace_boost: [3, 7, 14, 30],
  marketplace_spotlight: [3, 7, 14, 30],
};
