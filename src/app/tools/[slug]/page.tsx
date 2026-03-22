"use client";
export const dynamic = "force-dynamic";

/**
 * ToolDetail — LaudStack Stack Detail Page
 *
 * Production-ready. All interactions wired. No mock/placeholder data.
 * Mobile-first responsive layout with true tab switching.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Star, ExternalLink, ShieldCheck, ArrowLeft,
  ThumbsUp, MessageSquare, ChevronRight,
  Globe, Tag, Calendar, Award, CheckCircle2, AlertCircle,
  Building2, GitCompareArrows, Bookmark, ArrowRight,
  TrendingUp, Users, Layers, Edit2, Trash2, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import WriteReviewModal from '@/components/WriteReviewModal';
import AuthGateModal from '@/components/AuthGateModal';
import { useAuth } from '@/hooks/useAuth';
import { editReview, deleteReview, getToolDetail, markReviewHelpful, getMyHelpfulVotes } from '@/app/actions/public';
// toggleLaud is called via useLaudedTools hook (toggle) — no direct import needed
import { useLaudedTools } from '@/hooks/useLaudedTools';
import { useToolsData, invalidateToolsCache } from '@/hooks/useToolsData';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useCompare } from '@/contexts/CompareContext';
import { useSavedTools } from '@/hooks/useSavedTools';
import { useDbUser } from '@/hooks/useDbUser';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import type { Tool, Review } from '@/lib/types';
import { getToolExtras } from '@/lib/toolExtras';
import CommentsSection from '@/components/CommentsSection';
import { getCommentCount } from '@/app/actions/comments';
import { getStackFollowerCount } from '@/app/actions/follows';
import ReviewShareButtons from '@/components/ReviewShareButtons';
import ReviewBadges from '@/components/ReviewBadges';
import FounderReplyForm from '@/components/FounderReplyForm';
import ReviewNudge from '@/components/ReviewNudge';
import FollowStackButton from '@/components/FollowStackButton';
import { useFollowedStacks } from '@/hooks/useFollowedStacks';
import FeaturedStacksSidebar from '@/components/FeaturedStacksSidebar';

// ─── Star Rating ───────────────────────────────────────────────────────────
function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} style={{
          width: size, height: size,
          fill: i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0',
          color: i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0',
        }} />
      ))}
    </div>
  );
}

// ─── Rating Bar ────────────────────────────────────────────────────────────
function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[13px] text-slate-600 font-semibold w-10 text-right shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded bg-slate-100 overflow-hidden">
        <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, background: pct > 60 ? '#F59E0B' : pct > 30 ? '#FBBF24' : '#FDE68A' }} />
      </div>
      <span className="text-xs text-slate-500 font-semibold w-7 shrink-0">{count}</span>
    </div>
  );
}

// ─── Server review shape returned by getToolDetail ─────────────────────────
interface ServerReview {
  id: number;
  userId: number | null;
  rating: number;
  title: string | null;
  body: string | null;
  pros: string | null;
  cons: string | null;
  isVerified: boolean | null;
  helpfulCount: number;
  founderReply: string | null;
  founderReplyAt: Date | null;
  createdAt: Date;
  userName: string;
  userFirstName: string | null;
  userLastName: string | null;
  userAvatar: string | null;
}

/** Convert server review to frontend Review type */
function toFrontendReview(r: ServerReview, toolId: string): Review {
  return {
    id: String(r.id),
    tool_id: toolId,
    user_id: String(r.userId ?? 0),
    rating: r.rating,
    title: r.title ?? '',
    body: r.body ?? '',
    pros: r.pros ?? undefined,
    cons: r.cons ?? undefined,
    is_verified_purchase: r.isVerified ?? false,
    helpful_count: r.helpfulCount ?? 0,
    created_at: new Date(r.createdAt).toISOString(),
    user: {
      id: String(r.userId ?? 0),
      name: r.userName ?? 'Anonymous',
      avatar_url: r.userAvatar ?? undefined,
    },
    founder_reply: r.founderReply ? {
      body: r.founderReply,
      created_at: r.founderReplyAt ? new Date(r.founderReplyAt).toISOString() : new Date().toISOString(),
    } : undefined,
  };
}

// ─── Share helpers ─────────────────────────────────────────────────────────
function ShareButton({ label, icon, hoverColor, hoverBg, onClick }: {
  label: string; icon: string; hoverColor: string; hoverBg: string; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} title={`Share on ${label}`}
      className="flex-1 py-2.5 px-1 rounded-lg flex flex-col items-center gap-1 transition-all text-[11px] font-bold cursor-pointer"
      style={{
        border: `1px solid ${hovered ? hoverColor : '#E2E8F0'}`,
        background: hovered ? hoverBg : '#F8FAFC',
        color: hovered ? hoverColor : '#475569',
      }}
    >
      <span className="text-[15px] leading-none">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      toast.error('Could not copy link');
    });
  };
  return (
    <button onClick={handleCopy} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} title="Copy link"
      className="flex-1 py-2.5 px-1 rounded-lg flex flex-col items-center gap-1 transition-all text-[11px] font-bold cursor-pointer"
      style={{
        border: `1px solid ${copied ? '#DCFCE7' : hovered ? '#F59E0B' : '#E2E8F0'}`,
        background: copied ? '#F0FDF4' : hovered ? '#FFFBEB' : '#F8FAFC',
        color: copied ? '#16A34A' : hovered ? '#B45309' : '#475569',
      }}
    >
      <span className="text-[15px] leading-none">{copied ? '✓' : '🔗'}</span>
      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
    </button>
  );
}

// ─── Alternative Product Card ──────────────────────────────────────────────
function AlternativeProductCard({ product, currentTool }: { product: Tool; currentTool: Tool }) {
  const router = useRouter();
  const [logoErr, setLogoErr] = useState(false);
  return (
    <div
      onClick={() => router.push(`/tools/${product.slug}`)}
      className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 flex flex-col gap-3"
      style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
          {logoErr ? (
            <span className="text-base font-extrabold text-slate-500">{product.name.charAt(0)}</span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.logo_url} alt={product.name} className="w-full h-full object-contain"
              onError={() => setLogoErr(true)} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-[15px] font-extrabold text-slate-900 truncate tracking-tight">{product.name}</span>
            {product.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <StarRating rating={product.average_rating} size={11} />
            <span className="text-xs font-bold text-slate-900 ml-0.5">{product.average_rating.toFixed(1)}</span>
            <span className="text-xs text-slate-500">({product.review_count})</span>
          </div>
        </div>
      </div>
      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-2 m-0">{product.tagline}</p>
      <div className="flex items-center justify-between pt-2 mt-auto" style={{ borderTop: '1px solid #F1F5F9' }}>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{product.pricing_model}</span>
        <Link href={`/vs/${currentTool.slug}/${product.slug}`} onClick={e => e.stopPropagation()}
          className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors no-underline">
          Compare
        </Link>
      </div>
    </div>
  );
}

// ─── Page Skeleton ─────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-white pt-[60px] lg:pt-[64px]">
      <Navbar />
      <header className="relative border-b border-slate-200 overflow-hidden" style={{ background: '#F8FAFC' }}>
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 0.8px, transparent 0.8px)', backgroundSize: '24px 24px', opacity: 0.3, pointerEvents: 'none' }} />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-5 relative z-[1]">
          <div className="flex items-start gap-3.5 sm:gap-5">
            <div className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px] rounded-2xl bg-slate-100 animate-pulse shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-6 sm:h-7 w-36 sm:w-48 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-3.5 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-3.5 w-full max-w-[280px] bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex gap-3">
            <div className="h-3.5 w-16 bg-slate-100 rounded animate-pulse" />
            <div className="h-3.5 w-16 bg-slate-100 rounded animate-pulse" />
            <div className="h-3.5 w-16 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="mt-3 flex gap-2">
            <div className="h-10 flex-1 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-10 w-20 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-10 w-20 bg-slate-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </header>
      <div className="bg-white border-b border-slate-200 h-12" />
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-7">
          <div className="flex-1 min-w-0 flex flex-col gap-4 sm:gap-5">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-7 h-40 sm:h-48 animate-pulse" />
            <div className="bg-slate-50 rounded-2xl border border-slate-200 h-52 sm:h-64 animate-pulse" />
          </div>
          <div className="hidden lg:flex w-[320px] flex-col gap-4">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 h-48 animate-pulse" />
            <div className="bg-slate-50 rounded-2xl border border-slate-200 h-32 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Inline ─────────────────────────────────────────────────
function DeleteConfirm({ onConfirm, onCancel, loading }: { onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
      <span className="text-xs font-semibold text-red-700">Delete this review?</span>
      <button onClick={onConfirm} disabled={loading}
        className="text-xs font-bold text-white bg-red-500 px-2.5 py-1 rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, delete'}
      </button>
      <button onClick={onCancel} className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md hover:bg-slate-50 transition-colors">
        Cancel
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function ToolDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { tools: allTools, loading: toolsLoading } = useToolsData();
  const { isAuthenticated } = useAuth();
  const { dbUser } = useDbUser();
  const { recordVisit: addRecentlyViewed } = useRecentlyViewed();
  const { isSelected: isComparing, toggle: compareToggle, canAdd: canCompare } = useCompare();
  const { isSaved, toggle: toggleSave } = useSavedTools();
  const { isLauded, toggle: toggleLaudGlobal } = useLaudedTools();
  const { isFollowing: isFollowingStack, loading: stacksLoading } = useFollowedStacks();

  const [selectedTab, setSelectedTab] = useState<'overview' | 'features' | 'pricing' | 'reviews' | 'team' | 'discussion' | 'alternatives'>('overview');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [heroLogoErr, setHeroLogoErr] = useState(false);
  const [mediaErr, setMediaErr] = useState(false);
  // upvoted state is now derived from the global useLaudedTools hook
  const [laudCount, setLaudCount] = useState(0);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState<'review' | 'upvote' | 'save' | 'claim' | 'comment' | 'general'>('upvote');
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editPros, setEditPros] = useState('');
  const [editCons, setEditCons] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toolReviews, setToolReviews] = useState<Review[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [realAvgRating, setRealAvgRating] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);

  // Stable ref to addRecentlyViewed to avoid effect re-runs
  const addRecentlyViewedRef = useRef(addRecentlyViewed);
  useEffect(() => { addRecentlyViewedRef.current = addRecentlyViewed; }, [addRecentlyViewed]);

  // Fetch comment count for the Discussion tab label
  useEffect(() => {
    if (!slug || toolsLoading) return;
    const tool = allTools.find(t => t.slug === slug);
    if (!tool) return;
    const toolId = parseInt(tool.id, 10);
    if (isNaN(toolId) || toolId <= 0) return;
    getCommentCount(toolId).then(c => setCommentCount(c)).catch(() => {});
    getStackFollowerCount(toolId).then(c => setFollowerCount(c)).catch(() => {});
  }, [slug, toolsLoading, allTools]);

  // Fetch per-tool reviews from server action
  useEffect(() => {
    if (!slug) return;
    setReviewsLoading(true);
    Promise.all([
      getToolDetail(slug),
      getMyHelpfulVotes(),
    ]).then(([data, myVotes]) => {
      if (data) {
        const converted = (data.reviews ?? []).map((r: ServerReview) => toFrontendReview(r, String(data.tool.id)));
        setToolReviews(converted);
        setRatingDistribution(data.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        const avgR = converted.length > 0
          ? converted.reduce((sum: number, r: Review) => sum + r.rating, 0) / converted.length
          : 0;
        setRealAvgRating(avgR);
      }
      // Pre-populate helpful votes so already-voted reviews show as voted
      if (myVotes.length > 0) {
        const votedMap: Record<string, boolean> = {};
        myVotes.forEach(id => { votedMap[String(id)] = true; });
        setHelpfulMap(prev => ({ ...prev, ...votedMap }));
      }
    }).catch(() => {}).finally(() => setReviewsLoading(false));
  }, [slug]);

  // Refresh reviews after mutations
  const refreshReviews = useCallback(() => {
    if (!slug) return;
    getToolDetail(slug).then(data => {
      if (data) {
        const converted = (data.reviews ?? []).map((r: ServerReview) => toFrontendReview(r, String(data.tool.id)));
        setToolReviews(converted);
        setRatingDistribution(data.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        const avgR = converted.length > 0
          ? converted.reduce((sum: number, r: Review) => sum + r.rating, 0) / converted.length
          : 0;
        setRealAvgRating(avgR);
      }
    }).catch(() => {});
    invalidateToolsCache();
  }, [slug]);

  // Track recently viewed + record view
  useEffect(() => {
    if (!slug) return;
    addRecentlyViewedRef.current(slug);
    fetch(`/api/tools/${slug}/view`, { method: 'POST' }).catch(() => {});
  }, [slug]);

  // Track outbound clicks
  const trackOutboundClick = useCallback((type: 'website' | 'affiliate') => {
    fetch(`/api/tools/${slug}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    }).catch(() => {});
  }, [slug]);

  const handleWriteReview = useCallback(() => {
    if (!isAuthenticated) { setAuthAction('review'); setShowAuthModal(true); return; }
    setReviewOpen(true);
  }, [isAuthenticated]);

  // Stable memoized values — only recompute when slug or allTools changes
  const toolUpvoteCount = useMemo(
    () => allTools.find(t => t.slug === slug)?.upvote_count ?? 0,
    [slug, allTools]
  );
  const stableToolId = useMemo(
    () => allTools.find(t => t.slug === slug)?.id ?? null,
    [slug, allTools]
  );

  // Sync laudCount whenever toolUpvoteCount changes (slug navigation or cache refetch).
  // We always accept the server value here; handleUpvote sets the count directly
  // from result.newCount after each toggle so there is no risk of overwriting a
  // pending optimistic update.
  useEffect(() => {
    if (toolUpvoteCount !== undefined) {
      setLaudCount(toolUpvoteCount);
    }
  }, [slug, toolUpvoteCount]);

  // upvoted state is now derived from the global useLaudedTools hook
  const upvoted = stableToolId ? isLauded(stableToolId) : false;

  // Reset mediaIndex when slug changes
  useEffect(() => { setMediaIndex(0); setMediaErr(false); setHeroLogoErr(false); }, [slug]);

  const tool = allTools.find(t => t.slug === slug);

  // Show skeleton while tools are loading from the API
  if (toolsLoading && !tool) {
    return <PageSkeleton />;
  }

  // Tool not found after load completes
  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="h-[60px] lg:h-[64px]" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 sm:px-6 py-20">
          <AlertCircle className="w-12 h-12 text-slate-500" />
          <h1 className="text-2xl font-black text-slate-900">Stack not found</h1>
          <p className="text-slate-600">The stack you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-500 no-underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to homepage
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const reviews = toolReviews;
  // Use affiliate URL when available, otherwise fall back to website URL
  const outboundUrl = tool.affiliate_url || tool.website_url;
  const outboundClickType = tool.affiliate_url ? 'affiliate' : 'website';
  const fallbackExtras = getToolExtras(tool.slug, tool.name, tool.pricing_model, tool.screenshot_url, tool.website_url);
  const toolFeatures = (tool.features && tool.features.length > 0) ? tool.features : fallbackExtras.features;
  const toolPricingTiers = (tool.pricing_tiers && tool.pricing_tiers.length > 0) ? tool.pricing_tiers : fallbackExtras.pricing_tiers;
  const toolScreenshots = fallbackExtras.screenshots;

  const alternatives = allTools
    .filter(t => t.category === tool.category && t.id !== tool.id)
    .sort((a, b) => b.rank_score - a.rank_score)
    .slice(0, 8);

  const totalReviews = reviews.length;
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => {
    const count = ratingDistribution[star] ?? 0;
    return { star, count };
  });

  const handleUpvote = async () => {
    if (!isAuthenticated) { setAuthAction('upvote'); setShowAuthModal(true); return; }
    const wasUpvoted = upvoted;
    // Optimistic count update (global hook handles the ID set)
    setLaudCount(c => wasUpvoted ? Math.max(0, c - 1) : c + 1);
    if (!wasUpvoted) toast.success(`Lauded ${tool.name}!`);
    const result = await toggleLaudGlobal(tool.id);
    if (result.requiresAuth) {
      setLaudCount(c => wasUpvoted ? c + 1 : Math.max(0, c - 1));
      setAuthAction('upvote'); setShowAuthModal(true);
      return;
    }
    if (result.newCount !== undefined) {
      setLaudCount(result.newCount);
    } else if (result.lauded === wasUpvoted) {
      // Toggle failed — revert count
      setLaudCount(c => wasUpvoted ? c + 1 : Math.max(0, c - 1));
      toast.error('Failed to laud');
    }
    invalidateToolsCache();
  };

  const handleHelpful = async (reviewId: string) => {
    if (!isAuthenticated) { setAuthAction('general'); setShowAuthModal(true); return; }
    if (helpfulMap[reviewId]) return;
    setHelpfulMap(m => ({ ...m, [reviewId]: true }));
    const result = await markReviewHelpful(parseInt(reviewId, 10));
    if (!result.success) {
      setHelpfulMap(m => ({ ...m, [reviewId]: false }));
      toast.error(result.error || 'Failed to mark as helpful');
    }
  };

  // Check if the current user already has a review on this tool
  const userHasReview = dbUser ? reviews.some(r => r.user_id === String(dbUser.id)) : false;

  const startEditReview = (review: Review) => {
    setEditingReview(review.id);
    setEditTitle(review.title || '');
    setEditBody(review.body || '');
    setEditRating(review.rating);
    setEditPros(review.pros || '');
    setEditCons(review.cons || '');
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = async (reviewId: string) => {
    if (!editTitle.trim() || !editBody.trim()) {
      toast.error('Title and review body are required');
      return;
    }
    if (editBody.trim().length < 30) {
      toast.error('Review body must be at least 30 characters');
      return;
    }
    setSavingEdit(true);
    try {
      const result = await editReview(parseInt(reviewId, 10), {
        title: editTitle.trim(),
        body: editBody.trim(),
        rating: editRating,
        pros: editPros.trim() || undefined,
        cons: editCons.trim() || undefined,
      });
      if (result.success) {
        toast.success(result.message || 'Review updated!');
        setEditingReview(null);
        refreshReviews();
      } else {
        toast.error(result.error || 'Failed to update review');
      }
    } catch {
      toast.error('Failed to update review');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setDeletingReview(reviewId);
    try {
      const result = await deleteReview(parseInt(reviewId, 10));
      if (result.success) {
        toast.success('Review deleted');
        setConfirmDeleteId(null);
        refreshReviews();
      } else {
        toast.error(result.error || 'Failed to delete review');
      }
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeletingReview(null);
    }
  };

  const isOwnReview = (review: Review) => {
    if (!dbUser) return false;
    return review.user_id === String(dbUser.id);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://laudstack.com/tools/${slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-white pt-[60px] lg:pt-[64px]">
      <Navbar />

      {/* ══ PRODUCT HEADER — Social media-style profile ═══════════════════════════════ */}
      <header className="relative border-b border-slate-200 overflow-hidden" style={{ background: '#F8FAFC' }}>
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 0.8px, transparent 0.8px)', backgroundSize: '24px 24px', opacity: 0.3, pointerEvents: 'none' }} />
        <div aria-hidden className="absolute" style={{ top: '-20%', right: '-5%', width: '500px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Founder promotional banner */}
        {tool.promotional_banner && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center justify-center gap-3 flex-wrap text-center">
            <span className="text-[13px] font-semibold text-amber-800">{tool.promotional_banner}</span>
            {tool.promotional_cta && (
              <a href={outboundUrl} target="_blank" rel="noopener noreferrer"
                onClick={() => trackOutboundClick(outboundClickType)}
                className="text-xs font-extrabold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-0.5 rounded-full no-underline whitespace-nowrap">
                {tool.promotional_cta} →
              </a>
            )}
          </div>
        )}

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-[30px] relative z-[1]">
          {/* Breadcrumb */}
          <Breadcrumbs
            items={[
              { label: 'All Stacks', href: '/tools' },
              { label: tool.category, href: `/c/${tool.category.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-tools` },
              { label: tool.name },
            ]}
            className="mb-3 sm:mb-4"
          />

            {/* ── Hero Row — Social media profile style ───────────────────── */}
          <div className="py-4 sm:py-5">

            {/* Row 1: Logo + Info + Stats */}
            <div className="flex items-start gap-4 sm:gap-6">
              {/* Large Logo */}
              <div className="w-[64px] h-[64px] sm:w-[96px] sm:h-[96px] rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center"
                style={{ boxShadow: '0 4px 20px rgba(15,23,42,0.08)' }}>
                {heroLogoErr ? (
                  <span className="text-2xl sm:text-4xl font-extrabold text-slate-500">{tool.name.charAt(0)}</span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tool.logo_url} alt={`${tool.name} logo`} className="w-full h-full object-contain p-2 sm:p-2.5"
                    onError={() => setHeroLogoErr(true)} />
                )}
              </div>

              {/* Name + Tagline + Metrics */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-[26px] lg:text-[30px] font-black text-slate-900 leading-[1.1] m-0 truncate" style={{ letterSpacing: '-0.02em' }}>
                    {tool.name}
                  </h1>
                  {tool.is_verified && (
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 shrink-0" aria-label="Verified stack" />
                  )}
                </div>

                <p className="text-[13px] sm:text-[15px] text-slate-600 font-medium leading-snug max-w-[580px] m-0 mb-3 line-clamp-2 sm:line-clamp-none">
                  {tool.tagline}
                </p>

                {/* Social-style metric pills */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <StarRating rating={tool.average_rating} size={12} />
                    <span className="text-[13px] font-extrabold text-slate-900">{tool.average_rating.toFixed(1)}</span>
                    <span className="text-xs text-slate-500">({tool.review_count})</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1.5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <ThumbsUp className="w-3 h-3 text-amber-500" />
                    <span className="text-[13px] font-bold text-slate-700">{laudCount.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">lauds</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1.5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <Users className="w-3 h-3 text-blue-500" />
                    <span className="text-[13px] font-bold text-slate-700">{followerCount.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">followers</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1.5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">{tool.pricing_model}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1.5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <Layers className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">{tool.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Action buttons — compact row on mobile, column on desktop right ── */}
            <div className="mt-3.5 sm:mt-4 flex flex-col gap-2.5">
              {/* Desktop: side-by-side layout */}
              <div className="hidden sm:flex sm:items-center sm:gap-3">
                <a href={outboundUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackOutboundClick(outboundClickType)}
                  className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-amber-400 text-slate-900 font-extrabold text-sm no-underline transition-all hover:bg-amber-500"
                  style={{ boxShadow: '0 2px 10px rgba(245,158,11,0.25)' }}>
                  Visit Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button onClick={handleUpvote}
                  className="flex flex-col items-center justify-center cursor-pointer transition-all"
                  style={{
                    padding: '10px 16px',
                    borderRadius: 12,
                    border: '1.5px solid',
                    background: upvoted ? '#FEF3C7' : '#F8FAFC',
                    borderColor: upvoted ? '#FBBF24' : '#E2E8F0',
                    color: upvoted ? '#B45309' : '#64748B',
                    minWidth: 56,
                    gap: 2,
                  }}
                  onMouseEnter={(e) => {
                    if (!upvoted) {
                      e.currentTarget.style.borderColor = '#FBBF24';
                      e.currentTarget.style.background = '#FFFBEB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!upvoted) {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.background = '#F8FAFC';
                    }
                  }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" d="M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z" />
                  </svg>
                  <span className="tabular-nums" style={{ fontSize: 14, fontWeight: 800 }}>{laudCount}</span>
                </button>
                <button onClick={handleWriteReview}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl text-sm font-bold cursor-pointer transition-all border-none bg-slate-100 text-slate-700 hover:bg-slate-200">
                  <MessageSquare className="w-4 h-4" />
                  Review
                </button>
                <button
                  onClick={async () => {
                    const result = await toggleSave(tool.id);
                    if (result.requiresAuth) { setAuthAction('save'); setShowAuthModal(true); return; }
                    if (result.saved !== undefined) {
                      toast.success(result.saved ? `Saved ${tool.name}!` : 'Removed from saved');
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  style={{
                    border: isSaved(tool.id) ? '1.5px solid #F59E0B' : '1.5px solid #E2E8F0',
                    background: isSaved(tool.id) ? '#FFFBEB' : '#FFFFFF',
                    color: isSaved(tool.id) ? '#B45309' : '#475569',
                  }}>
                  <Bookmark className="w-3.5 h-3.5" style={{ fill: isSaved(tool.id) ? '#F59E0B' : 'none' }} />
                  {isSaved(tool.id) ? 'Saved' : 'Save'}
                </button>
                <button onClick={() => {
                  if (!isComparing(tool.id) && !canCompare) { toast.error('Compare up to 3 stacks at a time'); return; }
                  compareToggle(tool);
                  if (!isComparing(tool.id)) toast.success(`${tool.name} added to comparison`);
                }}
                  className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  style={{
                    border: isComparing(tool.id) ? '1.5px solid #D6E2FF' : '1.5px solid #E2E8F0',
                    background: isComparing(tool.id) ? '#ECF2FF' : '#FFFFFF',
                    color: isComparing(tool.id) ? '#3D64EB' : '#475569',
                  }}>
                  <GitCompareArrows className="w-3.5 h-3.5" />
                  Compare
                </button>
                {!stacksLoading && (
                  <FollowStackButton
                    toolId={parseInt(tool.id, 10)}
                    toolName={tool.name}
                    initialFollowing={isFollowingStack(tool.id)}
                    onAuthRequired={() => { setAuthAction('general'); setShowAuthModal(true); }}
                    onToggle={(following) => setFollowerCount(prev => following ? prev + 1 : Math.max(0, prev - 1))}
                  />
                )}
              </div>

              {/* Mobile: stacked compact buttons */}
              <div className="sm:hidden flex flex-col gap-2">
                <a href={outboundUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackOutboundClick(outboundClickType)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 text-slate-900 font-extrabold text-[13px] no-underline transition-all hover:bg-amber-500"
                  style={{ boxShadow: '0 2px 10px rgba(245,158,11,0.25)' }}>
                  Visit Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <div className="grid grid-cols-5 gap-1.5">
                  <button onClick={handleUpvote}
                    className="flex flex-col items-center justify-center cursor-pointer transition-all"
                    style={{
                      padding: '8px 4px',
                      borderRadius: 12,
                      border: '1.5px solid',
                      background: upvoted ? '#FEF3C7' : '#F8FAFC',
                      borderColor: upvoted ? '#FBBF24' : '#E2E8F0',
                      color: upvoted ? '#B45309' : '#64748B',
                      gap: 2,
                    }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 16 16">
                      <path fill="#FFFFFF" stroke="currentColor" strokeWidth="1.5" d="M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z" />
                    </svg>
                    <span className="tabular-nums" style={{ fontSize: 11, fontWeight: 800 }}>{laudCount}</span>
                  </button>
                  <button onClick={handleWriteReview}
                    className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all border-none bg-slate-100 text-slate-700">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Review
                  </button>
                  <button
                    onClick={async () => {
                      const result = await toggleSave(tool.id);
                      if (result.requiresAuth) { setAuthAction('save'); setShowAuthModal(true); return; }
                      if (result.saved !== undefined) {
                        toast.success(result.saved ? `Saved ${tool.name}!` : 'Removed from saved');
                      }
                    }}
                    className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all"
                    style={{
                      border: isSaved(tool.id) ? '1.5px solid #F59E0B' : '1.5px solid #E2E8F0',
                      background: isSaved(tool.id) ? '#FFFBEB' : '#FFFFFF',
                      color: isSaved(tool.id) ? '#B45309' : '#475569',
                    }}>
                    <Bookmark className="w-3.5 h-3.5" style={{ fill: isSaved(tool.id) ? '#F59E0B' : 'none' }} />
                    Save
                  </button>
                  <button onClick={() => {
                    if (!isComparing(tool.id) && !canCompare) { toast.error('Compare up to 3 stacks at a time'); return; }
                    compareToggle(tool);
                    if (!isComparing(tool.id)) toast.success(`${tool.name} added to comparison`);
                  }}
                    className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all"
                    style={{
                      border: isComparing(tool.id) ? '1.5px solid #D6E2FF' : '1.5px solid #E2E8F0',
                      background: isComparing(tool.id) ? '#ECF2FF' : '#FFFFFF',
                      color: isComparing(tool.id) ? '#3D64EB' : '#475569',
                    }}>
                    <GitCompareArrows className="w-3.5 h-3.5" />
                    Compare
                  </button>
                  {!stacksLoading && (
                    <FollowStackButton
                      toolId={parseInt(tool.id, 10)}
                      toolName={tool.name}
                      initialFollowing={isFollowingStack(tool.id)}
                      variant="compact"
                      onAuthRequired={() => { setAuthAction('general'); setShowAuthModal(true); }}
                      onToggle={(following) => setFollowerCount(prev => following ? prev + 1 : Math.max(0, prev - 1))}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══ STICKY TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="sticky top-[56px] sm:top-[64px] z-[39] bg-white border-b border-slate-200" style={{ boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <nav className="flex items-center overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
            aria-label="Stack detail tabs">
            {([
              { id: 'overview' as const, label: 'Overview' },
              { id: 'features' as const, label: 'Features' },
              { id: 'pricing' as const, label: 'Pricing' },
              { id: 'reviews' as const, label: `Reviews${totalReviews > 0 ? ` (${totalReviews})` : ''}` },
              { id: 'team' as const, label: 'Team' },
              { id: 'discussion' as const, label: `Discussion${commentCount > 0 ? ` (${commentCount})` : ''}` },
              { id: 'alternatives' as const, label: `Alternatives${alternatives.length > 0 ? ` (${alternatives.length})` : ''}` },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
                role="tab"
                aria-selected={selectedTab === tab.id}
                className="shrink-0 px-4 sm:px-6 py-4 sm:py-4.5 text-sm sm:text-[15px] bg-transparent border-none cursor-pointer transition-colors whitespace-nowrap -mb-px"
                style={{
                  fontWeight: selectedTab === tab.id ? 800 : 500,
                  color: selectedTab === tab.id ? '#B45309' : '#64748B',
                  borderBottom: selectedTab === tab.id ? '3px solid #F59E0B' : '3px solid transparent',
                  letterSpacing: '-0.01em',
                }}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ══ MAIN CONTENT ═════════════════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-7 items-start">

          {/* ── LEFT COLUMN (main content — shown first on mobile) ──── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5 sm:gap-6 order-1">

            {/* ── OVERVIEW TAB ──────────────────────────────────────────── */}
            {selectedTab === 'overview' && (
              <>
                {/* Description + tags */}
                <section className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-3 sm:mb-4 section-title">Overview</h2>
                  <p className="text-[15px] sm:text-base text-slate-700 leading-relaxed sm:leading-[1.75] mb-4 sm:mb-5">{tool.description}</p>
                  {tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.map(tag => (
                        <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                          className="text-xs font-semibold py-1 px-3 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 no-underline hover:border-amber-300 hover:text-amber-700 transition-colors">
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </section>

                {/* ProductHunt-style media gallery */}
                {toolScreenshots.length > 0 && (
                  <section className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                    <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-3">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 section-title">Media</h2>
                    </div>
                    {/* Main image */}
                    <div className="relative bg-slate-100 overflow-hidden mx-5 sm:mx-7 mb-3 rounded-xl" style={{ aspectRatio: '16/9', maxHeight: 380 }}>
                      {mediaErr ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <Globe className="w-8 h-8 text-slate-300" />
                          <p className="text-slate-600 text-sm font-medium">Media unavailable</p>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={toolScreenshots[mediaIndex]?.url}
                          src={toolScreenshots[mediaIndex]?.url ?? toolScreenshots[0]?.url}
                          alt={toolScreenshots[mediaIndex]?.caption ?? `${tool.name} screenshot`}
                          className="w-full h-full object-cover object-top"
                          onError={() => setMediaErr(true)}
                        />
                      )}
                      {/* Caption overlay */}
                      {!mediaErr && toolScreenshots[mediaIndex]?.caption && (
                        <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-black/50 to-transparent">
                          <p className="text-xs text-white/90 font-medium m-0">{toolScreenshots[mediaIndex].caption}</p>
                        </div>
                      )}
                    </div>
                    {/* Thumbnail strip — only if multiple screenshots */}
                    {toolScreenshots.length > 1 && (
                      <div className="flex gap-2 px-5 sm:px-7 pb-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {toolScreenshots.map((shot, i) => (
                          <button key={i} onClick={() => { setMediaIndex(i); setMediaErr(false); }}
                            className="shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-transparent p-0"
                            aria-label={`View screenshot ${i + 1}`}
                            style={{
                              width: 72, height: 48,
                              borderColor: mediaIndex === i ? '#F59E0B' : '#E2E8F0',
                              opacity: mediaIndex === i ? 1 : 0.65,
                            }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={shot.url} alt={shot.caption || `Screenshot ${i + 1}`} className="w-full h-full object-cover object-top" />
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Discussion preview — directs to Discussion tab */}
                <section className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 m-0 section-title">Discussion</h2>
                      {commentCount > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">{commentCount}</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTab('discussion');
                        // Scroll to the tab bar so the Discussion section is visible
                        setTimeout(() => {
                          document.getElementById('section-comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-transparent border-none cursor-pointer transition-colors"
                    >
                      {commentCount > 0 ? 'View all' : 'Start a discussion'} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  {commentCount === 0 && (
                    <p className="text-sm text-slate-600 mt-2 mb-0">Be the first to share your thoughts about this stack.</p>
                  )}
                </section>
              </>
            )}

            {/* ── FEATURES TAB ──────────────────────────────────────────── */}
            {selectedTab === 'features' && (
              <section className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-4 sm:mb-6 section-title">Key Features</h2>
                {toolFeatures.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {toolFeatures.map((feat, i) => (
                      <div key={i} className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 transition-all hover:border-amber-200 hover:shadow-sm">
                        <div className="text-2xl mb-2.5">{feat.icon}</div>
                        <h3 className="text-sm font-black text-slate-900 mb-1">{feat.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed m-0">{feat.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 mb-1">No features listed yet</p>
                    <p className="text-xs text-slate-500">The founder hasn&apos;t added feature details yet.</p>
                  </div>
                )}
              </section>
            )}

            {/* ── PRICING TAB ───────────────────────────────────────────── */}
            {selectedTab === 'pricing' && (
              <section className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <div className="flex items-center justify-between mb-5 sm:mb-6 flex-wrap gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 section-title">Pricing</h2>
                  <a href={outboundUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackOutboundClick(outboundClickType)} className="text-xs font-bold text-amber-700 no-underline inline-flex items-center gap-1 hover:underline">
                    View full pricing <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {toolPricingTiers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {toolPricingTiers.map((tier, i) => (
                      <div key={i} className="rounded-2xl p-5 sm:p-6 relative flex flex-col gap-3.5"
                        style={{
                          border: tier.highlighted ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                          background: tier.highlighted ? '#FFFBEB' : '#F8FAFC',
                          boxShadow: tier.highlighted ? '0 4px 20px rgba(245,158,11,0.12)' : 'none',
                        }}>
                        {tier.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[11px] font-extrabold px-3.5 py-0.5 rounded-full whitespace-nowrap">
                            {tier.badge}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{tier.name}</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900" style={{ letterSpacing: '-0.03em' }}>{tier.price}</span>
                            {tier.period && <span className="text-xs text-slate-500 font-medium">{tier.period}</span>}
                          </div>
                          <p className="text-sm text-slate-600 mt-2 leading-snug">{tier.description}</p>
                        </div>
                        <div className="flex-1 flex flex-col gap-2.5">
                          {tier.features.map((f, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: tier.highlighted ? '#B45309' : '#16A34A' }} />
                              <span className="text-[13px] text-slate-700 leading-snug">{f}</span>
                            </div>
                          ))}
                        </div>
                        <a href={outboundUrl} target="_blank" rel="noopener noreferrer"
                          onClick={() => trackOutboundClick(outboundClickType)}
                          className="flex items-center justify-center py-3 rounded-lg text-[13px] font-bold no-underline transition-all"
                          style={{
                            background: tier.highlighted ? '#F59E0B' : '#FFFFFF',
                            color: tier.highlighted ? '#0C1830' : '#334155',
                            border: tier.highlighted ? '2px solid #F59E0B' : '1.5px solid #E2E8F0',
                            boxShadow: tier.highlighted ? '0 3px 10px rgba(245,158,11,0.3)' : 'none',
                          }}>
                          {tier.cta}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 mb-1">No pricing tiers listed</p>
                    <a href={outboundUrl} target="_blank" rel="noopener noreferrer"
                      onClick={() => trackOutboundClick(outboundClickType)}
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-700 no-underline px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                      View pricing on {tool.name} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-4 text-center">
                  Pricing shown is indicative. Visit {tool.name}&apos;s website for the latest pricing.
                </p>
              </section>
            )}

            {/* ── REVIEWS TAB ───────────────────────────────────────────── */}
            {selectedTab === 'reviews' && (
              <>
                {/* Ratings Summary */}
                <section className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                  <div className="flex items-center justify-between gap-3 mb-6 sm:mb-7 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 section-title">Ratings &amp; Reviews</h2>
                    {!userHasReview && (
                      <button onClick={handleWriteReview}
                        className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-lg bg-amber-400 text-slate-900 font-bold text-[13px] border-none cursor-pointer transition-all hover:shadow-md whitespace-nowrap"
                        style={{ boxShadow: '0 3px 10px rgba(245,158,11,0.25)' }}>
                        <MessageSquare className="w-3.5 h-3.5" />
                        {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center mb-7 sm:mb-8 p-5 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-center shrink-0">
                      <div className="text-4xl sm:text-5xl font-black text-slate-900 leading-none" style={{ letterSpacing: '-0.04em' }}>
                        {totalReviews > 0 ? realAvgRating.toFixed(1) : '—'}
                      </div>
                      <div className="mt-1.5"><StarRating rating={realAvgRating} size={16} /></div>
                      <div className="text-sm text-slate-600 mt-1.5 font-medium">
                        {reviewsLoading ? (
                          <span className="inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</span>
                        ) : (
                          `${totalReviews.toLocaleString()} ${totalReviews === 1 ? 'review' : 'reviews'}`
                        )}
                      </div>
                    </div>
                    <div className="flex-1 w-full flex flex-col gap-2">
                      {ratingBreakdown.map(({ star, count }) => (
                        <RatingBar key={star} label={`${star} ★`} count={count} total={totalReviews} />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Individual Reviews */}
                <section className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                  <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-200">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 section-title">Community Reviews</h2>
                  </div>
                  <div className="flex flex-col">
                    {reviewsLoading ? (
                      <div className="px-5 sm:px-7 py-12 flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Loading reviews…</p>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="px-5 sm:px-7 py-12 text-center">
                        <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No reviews yet</h3>
                        <p className="text-sm text-slate-600 mb-4">Be the first to share your experience with this stack.</p>
                        <button onClick={handleWriteReview}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-slate-900 font-bold text-xs border-none cursor-pointer transition-all hover:shadow-md"
                          style={{ boxShadow: '0 2px 8px rgba(245,158,11,0.2)' }}>
                          <MessageSquare className="w-3 h-3" />
                          {isAuthenticated ? 'Write the First Review' : 'Sign In to Review'}
                        </button>
                      </div>
                    ) : (
                      reviews.map((review, i) => (
                        <div key={review.id} id={`review-${review.id}`} className="px-5 sm:px-7 py-5 sm:py-6" style={{ borderBottom: i < reviews.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                          <div className="flex flex-col gap-3 mb-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 sm:w-[42px] sm:h-[42px] rounded-full shrink-0 flex items-center justify-center overflow-hidden"
                                  style={{ background: `hsl(${(review.user?.name.charCodeAt(0) ?? 65) * 7}, 50%, 52%)` }}>
                                  {review.user?.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={review.user.avatar_url} alt={review.user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-sm sm:text-base font-extrabold text-white">{review.user?.name.charAt(0) ?? '?'}</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-sm font-bold text-slate-900">{review.user?.name}</span>
                                    {review.is_verified_purchase && (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold py-0.5 px-2 rounded-full bg-green-50 text-green-700 border border-green-200">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                      </span>
                                    )}
                                  </div>
                                  {(review.user?.role || review.user?.company) && (
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                                      {review.user.role}{review.user.company ? ` · ${review.user.company}` : ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <StarRating rating={review.rating} size={14} />
                                <span className="text-xs text-slate-500">{formatDate(review.created_at)}</span>
                              </div>
                            </div>
                            {/* Badges row — separate line on mobile for clean layout */}
                            <div className="flex items-center gap-1.5 -mt-1">
                              <ReviewBadges reviewCount={review.user?.review_count ?? 0} />
                            </div>
                          </div>
                          {review.title && (
                            <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 mb-2 leading-snug">{review.title}</h3>
                          )}
                          {review.body && (
                            <p className="text-sm text-slate-700 leading-relaxed sm:leading-[1.7] mb-4">{review.body}</p>
                          )}
                          {(review.pros || review.cons) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                              {review.pros && (
                                <div className="p-3.5 rounded-xl bg-green-50 border border-green-200">
                                  <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1.5">Pros</div>
                                  <p className="text-sm text-green-800 m-0 leading-snug">{review.pros}</p>
                                </div>
                              )}
                              {review.cons && (
                                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                                  <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1.5">Cons</div>
                                  <p className="text-sm text-rose-800 m-0 leading-snug">{review.cons}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Edit form */}
                          {editingReview === review.id && (
                            <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                              <div>
                                <label className="text-xs font-bold text-slate-600 mb-1 block">Rating</label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => setEditRating(s)} className="p-0 border-none bg-transparent cursor-pointer">
                                      <Star className="w-5 h-5" style={{ fill: s <= editRating ? '#FBBF24' : '#E2E8F0', color: s <= editRating ? '#FBBF24' : '#E2E8F0' }} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                placeholder="Review title" maxLength={120}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400" />
                              <textarea value={editBody} onChange={e => setEditBody(e.target.value)}
                                placeholder="Your review" rows={3} maxLength={2000}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:border-amber-400" />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input value={editPros} onChange={e => setEditPros(e.target.value)}
                                  placeholder="Pros (optional)" maxLength={300}
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400" />
                                <input value={editCons} onChange={e => setEditCons(e.target.value)}
                                  placeholder="Cons (optional)" maxLength={300}
                                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400" />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleSaveEdit(review.id)} disabled={savingEdit}
                                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5">
                                  {savingEdit ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</> : 'Save changes'}
                                </button>
                                <button onClick={() => setEditingReview(null)}
                                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Actions row */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <button onClick={() => handleHelpful(review.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all"
                              disabled={!!helpfulMap[review.id]}
                              style={{
                                color: helpfulMap[review.id] ? '#16A34A' : '#64748B',
                                background: helpfulMap[review.id] ? '#F0FDF4' : 'transparent',
                                border: helpfulMap[review.id] ? '1px solid #DCFCE7' : '1px solid #E2E8F0',
                                cursor: helpfulMap[review.id] ? 'default' : 'pointer',
                              }}>
                              <ThumbsUp className="w-3 h-3" />
                              Helpful ({review.helpful_count + (helpfulMap[review.id] ? 1 : 0)})
                            </button>

                            {isOwnReview(review) && editingReview !== review.id && confirmDeleteId !== review.id && (
                              <>
                                <button onClick={() => startEditReview(review)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                                  <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button onClick={() => setConfirmDeleteId(review.id)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              </>
                            )}

                            {/* Inline delete confirmation — no native browser dialogs */}
                            {confirmDeleteId === review.id && (
                              <DeleteConfirm
                                onConfirm={() => handleDeleteReview(review.id)}
                                onCancel={() => setConfirmDeleteId(null)}
                                loading={deletingReview === review.id}
                              />
                            )}

                            {/* Share buttons */}
                            <ReviewShareButtons
                              toolName={tool?.name || ''}
                              toolSlug={tool?.slug || ''}
                              reviewId={review.id}
                              reviewSnippet={review.body?.slice(0, 100) || review.title || ''}
                              rating={review.rating}
                            />
                          </div>

                          {/* Founder reply */}
                          {review.founder_reply && (
                            <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 border-l-[3px] border-l-amber-400">
                              <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-3.5 h-3.5 text-amber-700" />
                                <span className="text-xs font-bold text-amber-700">Founder Reply</span>
                                <span className="text-[11px] text-amber-600">· {formatDate(review.founder_reply.created_at)}</span>
                              </div>
                              <p className="text-[13px] text-amber-900 leading-relaxed m-0">{review.founder_reply.body}</p>
                            </div>
                          )}

                          {/* Founder reply form — only show if no reply exists and user is the tool founder */}
                          {tool?.founder?.id && dbUser?.id && String(tool.founder.id) === String(dbUser.id) && (
                            <FounderReplyForm
                              reviewId={parseInt(review.id, 10)}
                              isFounder={true}
                              hasExistingReply={!!review.founder_reply}
                              onReplySuccess={refreshReviews}
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* CTA footer */}
                  {!reviewsLoading && (
                    <div className="px-5 sm:px-7 py-4 sm:py-5 bg-amber-50 border-t border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-0.5">Have experience with {tool.name}?</p>
                        <p className="text-sm text-slate-600 m-0">Share your honest review and help others make informed decisions.</p>
                      </div>
                      {!userHasReview && (
                        <button onClick={handleWriteReview}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 text-slate-900 font-bold text-[13px] border-none cursor-pointer transition-all hover:shadow-md whitespace-nowrap shrink-0"
                          style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                          <MessageSquare className="w-3.5 h-3.5" />
                          {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
                        </button>
                      )}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* ── TEAM TAB ──────────────────────────────────────────────── */}
            {selectedTab === 'team' && (
              <section className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-5 section-title">Team &amp; Founder</h2>
                {tool.founder ? (
                  <div className="flex flex-col gap-4">
                    {/* Founder card */}
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      {/* Avatar */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0 border-2 border-white flex items-center justify-center overflow-hidden"
                        style={{
                          background: `hsl(${(tool.founder.name.charCodeAt(0)) * 7}, 50%, 52%)`,
                          boxShadow: '0 2px 12px rgba(15,23,42,0.1)',
                        }}>
                        {tool.founder.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={tool.founder.avatar_url} alt={tool.founder.name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          <span className="text-xl font-black text-white">{tool.founder.name.charAt(0)}</span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-base font-extrabold text-slate-900">{tool.founder.name}</span>
                          {tool.founder.is_pro && (
                            <span className="text-xs font-bold py-0.5 px-2 rounded-full bg-purple-50 text-purple-600 border border-purple-200">PRO</span>
                          )}
                          <span className="text-[11px] font-semibold py-0.5 px-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Founder</span>
                        </div>
                        {tool.founder.bio && (
                          <p className="text-sm text-slate-600 leading-relaxed mb-3">{tool.founder.bio}</p>
                        )}
                        {(tool.founder.twitter_handle || tool.founder.linkedin_url) && (
                          <div className="flex gap-2 flex-wrap">
                            {tool.founder.twitter_handle && (
                              <a href={`https://twitter.com/${tool.founder.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 no-underline py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                                <span className="font-black">𝕏</span> @{tool.founder.twitter_handle}
                              </a>
                            )}
                            {tool.founder.linkedin_url && (
                              <a href={tool.founder.linkedin_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 no-underline py-1.5 px-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                                <span className="font-black text-[11px]">in</span> LinkedIn
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Built with note */}
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-900 mb-0.5">Built by the {tool.founder.name} team</p>
                        <p className="text-xs text-amber-700 m-0">
                          {tool.is_verified
                            ? 'This listing has been claimed and verified by the founder.'
                            : 'Want to claim this listing? Visit the LaunchPad to get started.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 mb-1">No team information yet</p>
                    <p className="text-xs text-slate-500 mb-4">The founder hasn&apos;t added team details yet.</p>
                    <button onClick={() => router.push('/launchpad')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer">
                      Claim this listing <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* ── DISCUSSION TAB ────────────────────────────────────────── */}
            {selectedTab === 'discussion' && (
              <CommentsSection
                toolId={parseInt(tool.id, 10)}
                isAuthenticated={isAuthenticated}
                currentUserId={dbUser?.id ?? null}
                onAuthRequired={() => {
                  setAuthAction('comment');
                  setShowAuthModal(true);
                }}
                onCountChange={setCommentCount}
              />
            )}

            {/* ── ALTERNATIVES TAB ──────────────────────────────────────── */}
            {selectedTab === 'alternatives' && (
              <section className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 mb-2.5">
                      <Layers className="w-3 h-3 text-blue-600" />
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Alternatives</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1 section-title">
                      Top Alternatives to {tool.name}
                    </h2>
                    <p className="text-sm text-slate-600 m-0">
                      {alternatives.length > 0
                        ? `${alternatives.length} stack${alternatives.length !== 1 ? 's' : ''} in ${tool.category} to consider`
                        : `No alternatives found in ${tool.category} yet`}
                    </p>
                  </div>
                  {alternatives.length > 0 && (
                    <Link href={`/alternatives?product=${tool.slug}`}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-600 no-underline px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shrink-0 self-start sm:self-auto">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                {alternatives.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {alternatives.map((alt) => (
                      <AlternativeProductCard key={alt.id} product={alt} currentTool={tool} />
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 mb-1">No alternatives listed yet</p>
                    <p className="text-xs text-slate-500">Check back later or browse all stacks in this category.</p>
                    <Link href={`/c/${tool.category.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-tools`}
                      className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-amber-700 no-underline px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                      Browse {tool.category} stacks <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </section>
            )}

          </div>

          {/* ── RIGHT SIDEBAR (shown after content on mobile) ──────── */}
          <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4 order-2 lg:sticky lg:top-[140px]">

            {/* Stack Details */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <h3 className="text-xs font-black text-slate-500 mb-4 uppercase tracking-widest">Stack Details</h3>
              <div className="flex flex-col gap-3.5">
                {[
                  { icon: Tag, label: 'Category', value: tool.category },
                  { icon: Globe, label: 'Pricing', value: tool.pricing_model },
                  { icon: Calendar, label: 'Launched', value: new Date(tool.launched_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                  { icon: Award, label: 'Rank Score', value: tool.rank_score.toLocaleString() },
                  { icon: TrendingUp, label: 'Weekly Change', value: tool.weekly_rank_change ? (tool.weekly_rank_change > 0 ? `+${tool.weekly_rank_change}` : String(tool.weekly_rank_change)) : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-600 font-medium">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>

              {/* Social links */}
              {tool.founder && (tool.founder.twitter_handle || tool.founder.linkedin_url) && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">Connect</p>
                  <div className="flex gap-2 flex-wrap">
                    {tool.founder.twitter_handle && (
                      <a href={`https://twitter.com/${tool.founder.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 no-underline py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                        <span className="font-black text-[11px]">𝕏</span> Twitter
                      </a>
                    )}
                    {tool.founder.linkedin_url && (
                      <a href={tool.founder.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 no-underline py-1.5 px-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                        <span className="font-black text-[11px]">in</span> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-200">
                <a href={outboundUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackOutboundClick(outboundClickType)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-400 text-slate-900 font-extrabold text-[13px] no-underline transition-all hover:shadow-md"
                  style={{ boxShadow: '0 3px 10px rgba(245,158,11,0.3)' }}>
                  Visit Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Founder quick card */}
            {tool.founder && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <h3 className="text-xs font-black text-slate-500 mb-3.5 uppercase tracking-widest">Built By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl shrink-0 border border-slate-200 flex items-center justify-center overflow-hidden"
                    style={{ background: `hsl(${(tool.founder.name.charCodeAt(0)) * 7}, 50%, 52%)` }}>
                    {tool.founder.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tool.founder.avatar_url} alt={tool.founder.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-extrabold text-white">{tool.founder.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 truncate">{tool.founder.name}</span>
                      {tool.founder.is_pro && (
                        <span className="text-xs font-bold py-0.5 px-1.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">PRO</span>
                      )}
                    </div>
                    {tool.founder.bio && <p className="text-sm text-slate-600 mt-0.5 leading-snug line-clamp-2">{tool.founder.bio}</p>}
                  </div>
                </div>
                <button onClick={() => setSelectedTab('team')}
                  className="mt-3 w-full py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer">
                  View full profile →
                </button>
              </div>
            )}

            {/* Claim / Verified */}
            {!tool.is_verified ? (
              <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: '#0C1830', boxShadow: '0 4px 24px rgba(15,23,42,0.18)' }}>
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' }} />
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full mb-3" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <Building2 className="w-3 h-3 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">For Founders</span>
                </div>
                <h3 className="text-sm font-black text-white mb-1.5 leading-tight" style={{ letterSpacing: '-0.02em' }}>Is this your product?</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">Claim this listing to unlock founder features and grow faster.</p>
                <button onClick={() => router.push('/launchpad')}
                  className="w-full py-2.5 rounded-lg bg-amber-400 text-slate-900 font-extrabold text-[13px] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  style={{ border: 'none', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
                  <Building2 className="w-3.5 h-3.5" /> Claim This Listing
                </button>
              </div>
            ) : (
              <div className="bg-green-50 rounded-2xl border-[1.5px] border-green-200 p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <p className="text-[13px] font-extrabold text-green-800 mb-0.5">Verified Listing</p>
                  <p className="text-xs text-green-700 m-0 leading-snug">Claimed and verified by its founder.</p>
                </div>
              </div>
            )}

            {/* Featured Stacks */}
            <FeaturedStacksSidebar limit={3} title="Featured" />

            {/* Share */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <h3 className="text-xs font-black text-slate-500 mb-3.5 uppercase tracking-widest">Share</h3>
              <div className="flex gap-2">
                <ShareButton label="Twitter / X" icon="𝕏" hoverColor="#000" hoverBg="#F8FAFC"
                  onClick={() => {
                    const text = encodeURIComponent(`Check out ${tool.name} on @LaudStack — ${tool.tagline}`);
                    const url = encodeURIComponent(pageUrl);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=400');
                  }} />
                <ShareButton label="LinkedIn" icon="in" hoverColor="#5178FF" hoverBg="#ECF2FF"
                  onClick={() => {
                    const url = encodeURIComponent(pageUrl);
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=500');
                  }} />
                <CopyLinkButton url={pageUrl} />
              </div>
            </div>

          </aside>
        </div>
      </div>

      <Footer />

      <WriteReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSuccess={refreshReviews}
        toolName={tool.name}
        toolLogo={tool.logo_url}
        toolId={parseInt(tool.id, 10)}
      />
      <AuthGateModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action={authAction}
      />
      <ReviewNudge
        toolName={tool?.name || ''}
        isAuthenticated={!!dbUser}
        hasReviewed={userHasReview}
        onWriteReview={() => {
          if (!dbUser) {
            setAuthAction('review');
            setShowAuthModal(true);
          } else {
            setReviewOpen(true);
          }
        }}
      />
    </div>
  );
}
