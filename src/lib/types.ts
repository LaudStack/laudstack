// ─────────────────────────────────────────────
// LaudStack Platform Types
// ─────────────────────────────────────────────

export type Category =
  | 'AI Writing'
  | 'AI Image'
  | 'AI Video'
  | 'AI Audio'
  | 'AI Code'
  | 'AI Analytics'
  | 'AI Productivity'
  | 'CRM'
  | 'Marketing'
  | 'Design'
  | 'Developer Tools'
  | 'Finance'
  | 'HR & Recruiting'
  | 'Customer Support'
  | 'Project Management'
  | 'Sales'
  | 'Security'
  | 'E-commerce'
  | 'Education'
  | 'Other';

export type PricingModel = 'Free' | 'Freemium' | 'Paid' | 'Free Trial' | 'Open Source';

export type BadgeType =
  | 'top_rated'
  | 'featured'
  | 'verified'
  | 'new_launch'
  | 'editors_pick'
  | 'trending'
  | 'pro_founder'
  | 'community_pick'
  | 'best_value'
  | 'laudstack_pick';

export interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logo_url: string;
  website_url: string;
  category: Category;
  pricing_model: PricingModel;
  pricing_details?: string;
  tags: string[];
  badges: BadgeType[];
  upvote_count: number;
  review_count: number;
  average_rating: number;
  rank_score: number;
  weekly_rank_change?: number; // positive = moved up in rank this week
  is_featured: boolean;
  is_verified: boolean;
  is_pro: boolean;
  promotional_banner?: string;
  promotional_cta?: string;
  screenshot_url?: string;  // Platform homepage screenshot — uploaded by founder
  launched_at: string;
  created_at: string;
  updated_at: string;
  founder?: Founder;
}

export interface Founder {
  id: string;
  name: string;
  avatar_url?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  bio?: string;
  is_pro: boolean;
}

export interface Review {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  pros?: string;
  cons?: string;
  use_case?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
    role?: string;
    company?: string;
  };
  founder_reply?: {
    body: string;
    created_at: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  tool: Tool;
  rank_change: number; // positive = moved up, negative = moved down, 0 = same
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

export interface ComparisonItem {
  tool: Tool;
  features: Record<string, string | boolean | number>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'user' | 'founder' | 'admin';
  is_pro: boolean;
  created_at: string;
}

export interface PricingTier {
  name: string;
  price: string;         // e.g. "$0", "$29/mo", "Custom"
  period?: string;       // e.g. "per month", "per year"
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean; // true = most popular
  badge?: string;        // e.g. "Most Popular"
}

export interface ToolFeature {
  title: string;
  description: string;
  icon: string;          // emoji or icon name hint
}

export interface ToolExtras {
  screenshots: { url: string; caption: string }[];
  features: ToolFeature[];
  pricing_tiers: PricingTier[];
}

export interface AnalyticsSummary {
  tool_id: string;
  period: 'day' | 'week' | 'month';
  page_views: number;
  unique_visitors: number;
  outbound_clicks: number;
  upvotes: number;
  reviews: number;
  rank_position: number;
}
