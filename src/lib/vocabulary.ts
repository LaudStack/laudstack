/**
 * LaudStack Custom Vocabulary
 *
 * Centralized source of truth for all branded terminology.
 * Use these constants in user-facing UI copy.
 *
 * RULES:
 * - URLs, slugs, and route paths stay standard (e.g., /tools/, /trending/)
 * - SEO metadata (title, meta description) stays standard
 * - Accessibility labels (aria-label, alt text) stay standard
 * - Code-level identifiers (variable names, function names) stay standard
 * - Only user-facing visible text uses custom vocabulary
 */

export const V = {
  // ─── Core Terms ────────────────────────────────────────────
  product: 'Stack',
  products: 'Stacks',
  productLower: 'stack',
  productsLower: 'stacks',

  upvote: 'Laud',
  upvoted: 'Lauded',
  upvotes: 'Lauds',
  upvoteLower: 'laud',
  upvotedLower: 'lauded',

  featured: 'Spotlight',
  featuredLower: 'spotlight',

  trending: 'Rising',
  trendingLower: 'rising',

  // ─── Action Phrases ────────────────────────────────────────
  upvoteAction: 'Give a Laud',
  upvoteTooltip: 'Laud = Upvote. Support stacks you love.',
  launchAction: 'Launch your Stack',

  // ─── Section Titles ────────────────────────────────────────
  trendingTitle: 'Rising This Week',
  trendingSubtitle: 'The most lauded and discussed stacks right now.',
  featuredTitle: 'In the Spotlight',
  featuredSubtitle: 'Stacks selected by our editorial team.',
  freshLaunchesTitle: 'Newly Launched Stacks',
  freshLaunchesSubtitle: 'The latest SaaS and AI stacks launched by builders.',
  mostUpvotedTitle: 'Most Lauded',
  browseAllTitle: 'Browse All Stacks',

  // ─── Badge Labels ─────────────────────────────────────────
  badgeFeatured: 'Spotlight',
  badgeTopRated: 'Top Rated',
  badgeEditorsPick: "Editor's Pick",
  badgeRising: 'Rising',
  badgeVerified: 'Verified',

  // ─── SEO-safe versions (standard terms for metadata) ──────
  seo: {
    product: 'tool',
    products: 'tools',
    upvote: 'upvote',
    trending: 'trending',
    featured: 'featured',
  },
} as const;
