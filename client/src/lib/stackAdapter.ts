/**
 * stackAdapter.ts — Converts database Stack rows to the frontend Tool type
 * This adapter allows all existing components (ToolCard, Navbar, etc.)
 * to work with real database data without modification.
 */
import type { Tool, BadgeType, Category } from './types';

// The shape returned by tRPC stacks.list / stacks.getBySlug
export interface StackRow {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl: string | null;
  screenshotUrl: string | null;
  websiteUrl: string | null;
  affiliateUrl: string | null;
  category: string;
  pricingModel: string;
  pricingDetails: string | null;
  tags: string[] | null;
  founderId: number | null;
  claimedAt: Date | string | null;
  status: string;
  isVerified: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isSpotlighted: boolean;
  laudCount: number;
  saveCount: number;
  reviewCount: number;
  averageRating: string | number;
  viewCount: number;
  clickCount: number;
  rankScore: number;
  weeklyRankChange: number;
  launchedAt: Date | string | null;
  addedBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  screenshots?: { id: number; url: string; caption: string | null; sortOrder: number }[];
}

/**
 * Convert a database Stack row to the frontend Tool type
 */
export function stackToTool(stack: StackRow): Tool {
  const badges: BadgeType[] = [];
  if (stack.isFeatured) badges.push('featured');
  if (stack.isVerified) badges.push('verified');
  if (stack.isTrending) badges.push('trending');
  if (stack.isSpotlighted) badges.push('editors_pick');
  if (parseFloat(String(stack.averageRating)) >= 4.5 && stack.reviewCount >= 5) badges.push('top_rated');
  if (stack.launchedAt) {
    const launchDate = new Date(stack.launchedAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (launchDate > thirtyDaysAgo) badges.push('new_launch');
  }

  return {
    id: String(stack.id),
    slug: stack.slug,
    name: stack.name,
    tagline: stack.tagline,
    description: stack.description,
    logo_url: stack.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(stack.name)}&background=F59E0B&color=fff&size=128&bold=true`,
    website_url: stack.websiteUrl || '',
    category: stack.category as Category,
    pricing_model: stack.pricingModel as Tool['pricing_model'],
    pricing_details: stack.pricingDetails ?? undefined,
    tags: stack.tags ?? [],
    badges,
    upvote_count: stack.laudCount,
    review_count: stack.reviewCount,
    average_rating: parseFloat(String(stack.averageRating)),
    rank_score: stack.rankScore,
    weekly_rank_change: stack.weeklyRankChange,
    is_featured: stack.isFeatured,
    is_verified: stack.isVerified,
    is_pro: false,
    screenshot_url: stack.screenshotUrl ?? undefined,
    launched_at: stack.launchedAt ? new Date(stack.launchedAt).toISOString() : new Date(stack.createdAt).toISOString(),
    created_at: new Date(stack.createdAt).toISOString(),
    updated_at: new Date(stack.updatedAt).toISOString(),
  };
}

export function stacksToTools(stacks: StackRow[]): Tool[] {
  return stacks.map(stackToTool);
}

export const CATEGORY_LIST = [
  'All',
  'AI Productivity',
  'AI Writing',
  'AI Image',
  'AI Video',
  'AI Audio',
  'AI Code',
  'AI Analytics',
  'CRM',
  'Marketing',
  'Design',
  'Developer Tools',
  'Finance',
  'HR & Recruiting',
  'Customer Support',
  'Project Management',
  'Sales',
  'Security',
  'E-commerce',
  'Education',
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  'All': '🌐',
  'AI Productivity': '⚡',
  'AI Writing': '✍️',
  'AI Image': '🎨',
  'AI Video': '🎬',
  'AI Audio': '🎵',
  'AI Code': '💻',
  'AI Analytics': '📊',
  'CRM': '🤝',
  'Marketing': '📣',
  'Design': '🖌️',
  'Developer Tools': '🔧',
  'Finance': '💰',
  'HR & Recruiting': '👥',
  'Customer Support': '🎧',
  'Project Management': '📋',
  'Sales': '💰',
  'Security': '🔒',
  'E-commerce': '🛒',
  'Education': '📚',
};

export const PRICING_MODELS = ['All', 'Free', 'Freemium', 'Paid', 'Free Trial', 'Open Source'] as const;
