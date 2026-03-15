"use client";

/**
 * ToolDetail.tsx — LaudStack Product Detail Page (v3 — Mobile-First Responsive)
 *
 * All layout uses Tailwind responsive classes for proper mobile/tablet/desktop behavior.
 * No fixed pixel widths that break on small screens.
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Star, ExternalLink, ChevronUp, ShieldCheck, ArrowLeft,
  ThumbsUp, MessageSquare, ChevronRight, Sparkles,
  Globe, Tag, Calendar, Award, CheckCircle2, AlertCircle,
  Building2, GitCompareArrows, Bookmark, ArrowRight,
  TrendingUp, Users, Layers, BarChart3, Edit2, Trash2, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import WriteReviewModal from '@/components/WriteReviewModal';
import AuthGateModal from '@/components/AuthGateModal';
import { useAuth } from '@/hooks/useAuth';
import { editReview, deleteReview, getToolDetail, markReviewHelpful } from '@/app/actions/public';
import { toggleLaud, getUserLaudedToolIds } from '@/app/actions/laud';
import { invalidateToolsCache } from '@/hooks/useToolsData';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useCompare } from '@/contexts/CompareContext';
import { useSavedTools } from '@/hooks/useSavedTools';
import { useDbUser } from '@/hooks/useDbUser';
import Footer from '@/components/Footer';
import { useToolsData } from '@/hooks/useToolsData';
import type { Tool, Review } from '@/lib/types';
import { getToolExtras } from '@/lib/toolExtras';
import CommentsSection from '@/components/CommentsSection';

// ─── Badge config ──────────────────────────────────────────────────────────
const BADGE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  top_rated:      { label: 'Top Rated',      bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
  featured:       { label: 'Spotlight',       bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  editors_pick:   { label: "Editor's Pick",  bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  trending:       { label: 'Rising',       bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  new_launch:     { label: 'New Launch',     bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
  community_pick: { label: 'Community Pick', bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
  best_value:     { label: 'Best Value',     bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' },
  laudstack_pick: { label: 'LaudStack Pick', bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  verified:       { label: 'Verified',       bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  pro_founder:    { label: 'Pro Founder',    bg: '#FDF4FF', color: '#7E22CE', border: '#E9D5FF' },
};

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
      <span className="text-[13px] text-slate-500 font-semibold w-10 text-right shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded bg-slate-100 overflow-hidden">
        <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, background: pct > 60 ? '#F59E0B' : pct > 30 ? '#FCD34D' : '#FDE68A' }} />
      </div>
      <span className="text-xs text-slate-400 font-semibold w-7 shrink-0">{count}</span>
    </div>
  );
}

// Review type from server (different from the frontend Review type)
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
    });
  };
  return (
    <button onClick={handleCopy} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} title="Copy link"
      className="flex-1 py-2.5 px-1 rounded-lg flex flex-col items-center gap-1 transition-all text-[11px] font-bold cursor-pointer"
      style={{
        border: `1px solid ${copied ? '#BBF7D0' : hovered ? '#F59E0B' : '#E2E8F0'}`,
        background: copied ? '#F0FDF4' : hovered ? '#FFFBEB' : '#F8FAFC',
        color: copied ? '#15803D' : hovered ? '#B45309' : '#475569',
      }}
    >
      <span className="text-[15px] leading-none">{copied ? '✓' : '🔗'}</span>
      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
    </button>
  );
}

// ─── Alternative Product Card (responsive) ────────────────────────────────
function AlternativeProductCard({ product, currentTool, rank }: { product: Tool; currentTool: Tool; rank: number }) {
  const router = useRouter();
  const [logoErr, setLogoErr] = useState(false);
  return (
    <div
      onClick={() => router.push(`/tools/${product.slug}`)}
      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 flex flex-col gap-3"
      style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
    >
      {/* Top: Logo + Name + Rating */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
          {logoErr ? (
            <span className="text-base font-extrabold text-slate-500">{product.name.charAt(0)}</span>
          ) : (
            <img src={product.logo_url} alt={product.name} className="w-full h-full object-contain"
              onError={() => setLogoErr(true)} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-[15px] font-extrabold text-gray-900 truncate tracking-tight">{product.name}</span>
            {product.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <StarRating rating={product.average_rating} size={11} />
            <span className="text-xs font-bold text-gray-900 ml-0.5">{product.average_rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400">({product.review_count})</span>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed line-clamp-2 m-0">{product.tagline}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 mt-auto" style={{ borderTop: '1px solid #F3F4F6' }}>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">{product.pricing_model}</span>
        <Link href={`/compare?tools=${currentTool.slug},${product.slug}`} onClick={e => e.stopPropagation()}
          className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors no-underline">
          Compare
        </Link>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function ToolDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { tools: allTools, reviews: allReviews } = useToolsData();
  const { isAuthenticated, user: authUser } = useAuth();
  const { dbUser } = useDbUser();
  const { recordVisit: addRecentlyViewed } = useRecentlyViewed();
  const { isSelected: isComparing, toggle: compareToggle, canAdd: canCompare } = useCompare();
  const { isSaved, toggle: toggleSave } = useSavedTools();

  const [activeSection, setActiveSection] = useState('about');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'features' | 'pricing' | 'reviews' | 'team' | 'discussion' | 'alternatives'>('overview');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [heroLogoErr, setHeroLogoErr] = useState(false);
  const [mediaErr, setMediaErr] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [laudCount, setLaudCount] = useState(0);
  const [laudCountInitialized, setLaudCountInitialized] = useState(false);
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
  const [toolReviews, setToolReviews] = useState<Review[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [realReviewCount, setRealReviewCount] = useState(0);
  const [realAvgRating, setRealAvgRating] = useState(0);

  // Fetch per-tool reviews from server action
  useEffect(() => {
    if (!slug) return;
    setReviewsLoading(true);
    getToolDetail(slug).then(data => {
      if (data) {
        const converted = (data.reviews ?? []).map((r: any) => toFrontendReview(r, String(data.tool.id)));
        setToolReviews(converted);
        setRatingDistribution(data.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        setRealReviewCount(converted.length);
        const avgR = converted.length > 0
          ? converted.reduce((sum: number, r: Review) => sum + r.rating, 0) / converted.length
          : 0;
        setRealAvgRating(avgR);
      }
    }).catch(() => {}).finally(() => setReviewsLoading(false));
  }, [slug]);

  // Refresh reviews after mutations
  const refreshReviews = () => {
    if (!slug) return;
    getToolDetail(slug).then(data => {
      if (data) {
        const converted = (data.reviews ?? []).map((r: any) => toFrontendReview(r, String(data.tool.id)));
        setToolReviews(converted);
        setRatingDistribution(data.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        setRealReviewCount(converted.length);
        const avgR = converted.length > 0
          ? converted.reduce((sum: number, r: Review) => sum + r.rating, 0) / converted.length
          : 0;
        setRealAvgRating(avgR);
      }
    }).catch(() => {});
    invalidateToolsCache();
  };

  // Track recently viewed + record view
  useEffect(() => {
    if (slug) {
      addRecentlyViewed(slug);
      // Fire-and-forget view tracking
      fetch(`/api/tools/${slug}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [slug]);

  // Track outbound clicks
  const trackOutboundClick = (type: 'website' | 'affiliate') => {
    fetch(`/api/tools/${slug}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    }).catch(() => {});
  };

  // Scroll spy — runs once after mount; sections are static DOM elements
  useEffect(() => {
    const ids = ['about', 'media', 'features', 'pricing', 'reviews', 'comments', 'alternatives'];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id.replace('section-', ''));
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    // Small delay to ensure DOM is rendered before observing
    const timer = setTimeout(() => {
      ids.forEach(id => {
        const el = document.getElementById(`section-${id}`);
        if (el) observer.observe(el);
      });
    }, 100);
    return () => { clearTimeout(timer); observer.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) { setAuthAction('review'); setShowAuthModal(true); return; }
    setReviewOpen(true);
  };

  // ALL hooks must be called before any early return (Rules of Hooks)
  // Memoized stable primitives — only recompute when slug or allTools reference changes
  const toolUpvoteCount = useMemo(
    () => allTools.find(t => t.slug === slug)?.upvote_count ?? 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, allTools]
  );
  const stableToolId = useMemo(
    () => allTools.find(t => t.slug === slug)?.id ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, allTools]
  );

  // Initialize laud count once tool data loads
  useEffect(() => {
    if (!laudCountInitialized && toolUpvoteCount > 0) {
      setLaudCount(toolUpvoteCount);
      setLaudCountInitialized(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, toolUpvoteCount]);

  // Initialize upvoted state from DB for authenticated users
  useEffect(() => {
    if (!isAuthenticated || !stableToolId) return;
    const toolIdNum = parseInt(stableToolId, 10);
    if (!Number.isFinite(toolIdNum)) return;
    getUserLaudedToolIds().then(ids => {
      setUpvoted(ids.includes(toolIdNum));
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, stableToolId]);

  const tool = allTools.find(t => t.slug === slug);

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="h-[72px]" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-20">
          <AlertCircle className="w-12 h-12 text-slate-400" />
          <h1 className="text-2xl font-extrabold text-gray-900">Product not found</h1>
          <p className="text-slate-500">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-500 no-underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to homepage
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const reviews = toolReviews;
  // Use DB-stored features/pricing if available, otherwise fall back to generated defaults
  const fallbackExtras = getToolExtras(tool.slug, tool.name, tool.pricing_model, tool.screenshot_url, tool.website_url);
  const toolFeatures = (tool.features && tool.features.length > 0) ? tool.features : fallbackExtras.features;
  const toolPricingTiers = (tool.pricing_tiers && tool.pricing_tiers.length > 0) ? tool.pricing_tiers : fallbackExtras.pricing_tiers;
  const toolScreenshots = fallbackExtras.screenshots; // screenshots still come from screenshot_url / microlink

  const alternatives = allTools
    .filter(t => t.category === tool.category && t.id !== tool.id)
    .sort((a, b) => b.average_rating - a.average_rating || b.review_count - a.review_count)
    .slice(0, 8);

  const similarProducts = allTools
    .filter(t => t.id !== tool.id && t.category !== tool.category)
    .map(t => ({ ...t, tagOverlap: t.tags.filter(tag => tool.tags.includes(tag)).length }))
    .filter(t => t.tagOverlap > 0)
    .sort((a, b) => b.tagOverlap - a.tagOverlap || b.average_rating - a.average_rating)
    .slice(0, 4);

  const totalReviews = reviews.length;
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => {
    const count = ratingDistribution[star] ?? 0;
    return { star, count };
  });

  const handleUpvote = async () => {
    if (!isAuthenticated) { setAuthAction('upvote'); setShowAuthModal(true); return; }
    const toolId = parseInt(tool.id, 10);
    const wasUpvoted = upvoted;
    setUpvoted(!wasUpvoted);
    setLaudCount(c => wasUpvoted ? Math.max(0, c - 1) : c + 1);
    if (!wasUpvoted) toast.success(`Lauded ${tool.name}!`);
    const result = await toggleLaud(toolId);
    if (!result.success) {
      setUpvoted(wasUpvoted);
      setLaudCount(c => wasUpvoted ? c + 1 : Math.max(0, c - 1));
      toast.error(result.error || 'Failed to laud');
    } else {
      if (result.newCount !== undefined) {
        setLaudCount(result.newCount);
      }
      invalidateToolsCache();
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (helpfulMap[reviewId]) return;
    setHelpfulMap(m => ({ ...m, [reviewId]: true }));
    const result = await markReviewHelpful(parseInt(reviewId, 10));
    if (!result.success) {
      setHelpfulMap(m => ({ ...m, [reviewId]: false }));
      toast.error('Failed to mark as helpful');
    }
  };

  const startEditReview = (review: Review) => {
    setEditingReview(review.id);
    setEditTitle(review.title || '');
    setEditBody(review.body || '');
    setEditRating(review.rating);
    setEditPros(review.pros || '');
    setEditCons(review.cons || '');
  };

  const handleSaveEdit = async (reviewId: string) => {
    setSavingEdit(true);
    try {
      const result = await editReview(parseInt(reviewId, 10), {
        title: editTitle,
        body: editBody,
        rating: editRating,
        pros: editPros || undefined,
        cons: editCons || undefined,
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
    if (!confirm('Are you sure you want to delete this review?')) return;
    setDeletingReview(reviewId);
    try {
      const result = await deleteReview(parseInt(reviewId, 10));
      if (result.success) {
        toast.success('Review deleted');
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" style={{ paddingTop: 72 }}>
      <Navbar />

      {/* ══ PRODUCT HEADER ═══════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-200">

        {/* Founder promotional banner */}
        {tool.promotional_banner && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center justify-center gap-3 flex-wrap text-center">
            <span className="text-[13px] font-semibold text-amber-800">{tool.promotional_banner}</span>
            {tool.promotional_cta && (
              <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                className="text-xs font-extrabold text-amber-700 bg-amber-100 border border-amber-200 px-3 py-0.5 rounded-full no-underline whitespace-nowrap">
                {tool.promotional_cta} →
              </a>
            )}
          </div>
        )}

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

          {/* Breadcrumb — hidden on very small screens */}
          <nav className="hidden sm:flex items-center gap-1.5 pt-4 text-xs text-slate-400 font-medium">
            <Link href="/" className="text-slate-400 no-underline hover:text-amber-500 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href="/tools" className="text-slate-400 no-underline hover:text-amber-500 transition-colors">All Stacks</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href={`/tools?category=${encodeURIComponent(tool.category)}`} className="text-slate-400 no-underline hover:text-amber-500 transition-colors">{tool.category}</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-gray-700 font-semibold truncate max-w-[120px]">{tool.name}</span>
          </nav>

          {/* Mobile back link */}
          <div className="sm:hidden pt-3">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-transparent border-none cursor-pointer p-0">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          {/* ── Hero Row ─────────────────────────────────────────────────── */}
          <div className="py-4 sm:py-5">

            {/* Top row: Logo + Name + Tagline + Actions */}
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">

              {/* Logo */}
              <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] rounded-2xl border-[1.5px] border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center"
                style={{ boxShadow: '0 2px 16px rgba(15,23,42,0.06)' }}>
                {heroLogoErr ? (
                  <span className="text-3xl font-extrabold text-slate-500">{tool.name.charAt(0)}</span>
                ) : (
                  <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-contain p-2"
                    onError={() => setHeroLogoErr(true)} />
                )}
              </div>

              {/* Name + Tagline + Actions */}
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                {/* Left: Name + Tagline */}
                <div className="flex-1 min-w-0">
                  {/* Name + inline verified badge */}
                  <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <h1 className="text-xl sm:text-[22px] lg:text-[26px] font-black text-slate-900 leading-[1.15] m-0" style={{ letterSpacing: '-0.02em' }}>
                      {tool.name}
                    </h1>
                    {tool.is_verified && (
                      <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" aria-label="Verified" />
                    )}
                  </div>

                  {/* Tagline */}
                  <p className="text-[14px] sm:text-[15px] text-slate-500 font-medium leading-relaxed max-w-[580px] m-0 mb-3">
                    {tool.tagline}
                  </p>

                  {/* Stats row — inline under tagline */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    {[
                      {
                        label: 'Rating',
                        value: (
                          <div className="flex items-center gap-1">
                            <StarRating rating={tool.average_rating} size={12} />
                            <span className="text-[13px] font-extrabold text-slate-900">{tool.average_rating.toFixed(1)}</span>
                            <span className="text-[11px] text-slate-400 font-medium">({tool.review_count.toLocaleString()})</span>
                          </div>
                        ),
                      },
                      { label: 'Lauds', value: <span className="text-[13px] font-extrabold text-slate-900">{laudCount.toLocaleString()}</span> },
                      { label: 'Pricing', value: <span className="text-[13px] font-extrabold text-slate-900">{tool.pricing_model}</span> },
                      { label: 'Launched', value: <span className="text-[13px] font-extrabold text-slate-900">{new Date(tool.launched_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span> },
                      { label: 'Category', value: <span className="text-[13px] font-extrabold text-slate-900">{tool.category}</span> },
                    ].map((stat, i, arr) => (
                      <div key={stat.label} className="flex items-center gap-3">
                        <div className="flex flex-col gap-0">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{stat.label}</span>
                          {stat.value}
                        </div>
                        {i < arr.length - 1 && (
                          <div className="w-px h-7 bg-slate-200 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Action buttons — stacks on mobile */}
                <div className="w-full sm:w-[210px] shrink-0 flex flex-col gap-2.5 sm:pt-1">

                  {/* Primary CTA */}
                  <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                    onClick={() => trackOutboundClick('website')}
                    className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-amber-400 text-gray-900 font-extrabold text-sm no-underline transition-all hover:bg-amber-500"
                    style={{ boxShadow: '0 2px 10px rgba(245,158,11,0.25)' }}>
                    Visit Website <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Laud + Review — prominent row */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleUpvote}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all border-none"
                      style={{
                        background: upvoted ? '#F59E0B' : '#1E293B',
                        color: upvoted ? '#0A0A0A' : '#FFFFFF',
                      }}>
                      <ChevronUp className="w-4 h-4" />
                      {upvoted ? 'Lauded' : 'Laud'}
                    </button>

                    <button onClick={handleWriteReview}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all border-none bg-slate-100 text-slate-700 hover:bg-slate-200">
                      <MessageSquare className="w-4 h-4" />
                      Review
                    </button>
                  </div>

                  {/* Save + Compare — subtle secondary row */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { toggleSave(tool.id); toast.success(isSaved(tool.id) ? 'Removed from saved' : `Saved ${tool.name}!`); }}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      style={{
                        border: isSaved(tool.id) ? '1.5px solid #F59E0B' : '1.5px solid #E2E8F0',
                        background: isSaved(tool.id) ? '#FFFBEB' : '#FFFFFF',
                        color: isSaved(tool.id) ? '#B45309' : '#475569',
                      }}>
                      <Bookmark className="w-3.5 h-3.5" style={{ fill: isSaved(tool.id) ? '#F59E0B' : 'none' }} />
                      {isSaved(tool.id) ? 'Saved' : 'Save'}
                    </button>

                    <button onClick={() => {
                      if (!isComparing(tool.id) && !canCompare) { toast.error('Compare up to 3 products at a time'); return; }
                      compareToggle(tool);
                      if (!isComparing(tool.id)) toast.success(`${tool.name} added to comparison`);
                    }}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      style={{
                        border: isComparing(tool.id) ? '1.5px solid #BFDBFE' : '1.5px solid #E2E8F0',
                        background: isComparing(tool.id) ? '#EFF6FF' : '#FFFFFF',
                        color: isComparing(tool.id) ? '#1D4ED8' : '#475569',
                      }}>
                      <GitCompareArrows className="w-3.5 h-3.5" />
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ══ STICKY TAB BAR ═══════════════════════════════════════════════════ */}
      <div className="sticky top-[72px] z-[39] bg-white border-b border-slate-200" style={{ boxShadow: '0 1px 6px rgba(15,23,42,0.05)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <nav className="flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {([
              { id: 'overview' as const, label: 'Overview' },
              { id: 'features' as const, label: 'Features' },
              { id: 'pricing' as const, label: 'Pricing' },
              { id: 'reviews' as const, label: 'Reviews' },
              { id: 'team' as const, label: 'Team' },
              { id: 'discussion' as const, label: 'Discussion' },
              { id: 'alternatives' as const, label: 'Alternatives' },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setSelectedTab(tab.id)}
                className="shrink-0 px-3 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-[13px] bg-transparent border-none cursor-pointer transition-colors whitespace-nowrap -mb-px"
                style={{
                  fontWeight: selectedTab === tab.id ? 700 : 500,
                  color: selectedTab === tab.id ? '#B45309' : '#64748B',
                  borderBottom: selectedTab === tab.id ? '2px solid #F59E0B' : '2px solid transparent',
                }}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ══ MAIN CONTENT — Tab-based Two Column Layout ═══════════════════════ */}
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-7 items-start">

          {/* ── LEFT COLUMN (tab content) ────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5 sm:gap-6 order-2 lg:order-1">

            {/* ── OVERVIEW TAB ──────────────────────────────────────────── */}
            {selectedTab === 'overview' && (
              <>
                {/* Description + tags */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                  <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-3 sm:mb-4" style={{ letterSpacing: '-0.02em' }}>Overview</h2>
                  <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed sm:leading-[1.75] mb-4 sm:mb-5">{tool.description}</p>
                  {tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.map(tag => (
                        <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                          className="text-xs font-semibold py-1 px-3 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 no-underline hover:border-amber-300 hover:text-amber-700 transition-colors">
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </section>

                {/* ProductHunt-style media gallery */}
                {toolScreenshots.length > 0 && (
                  <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                    {/* Main image */}
                    <div className="relative bg-slate-100 overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: 380 }}>
                      {mediaErr ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-slate-400 text-sm font-medium">Media unavailable</p>
                        </div>
                      ) : (
                        <img
                          src={toolScreenshots[mediaIndex]?.url ?? toolScreenshots[0]?.url}
                          alt={toolScreenshots[mediaIndex]?.caption ?? tool.name}
                          className="w-full h-full object-cover object-top transition-opacity duration-200"
                          onError={() => setMediaErr(true)}
                        />
                      )}
                      {/* Caption overlay */}
                      {toolScreenshots[mediaIndex]?.caption && (
                        <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-black/50 to-transparent">
                          <p className="text-xs text-white/90 font-medium m-0">{toolScreenshots[mediaIndex].caption}</p>
                        </div>
                      )}
                    </div>
                    {/* Thumbnail strip — only if multiple screenshots */}
                    {toolScreenshots.length > 1 && (
                      <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50 border-t border-slate-100" style={{ scrollbarWidth: 'none' }}>
                        {toolScreenshots.map((shot, i) => (
                          <button key={i} onClick={() => setMediaIndex(i)}
                            className="shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-transparent p-0"
                            style={{
                              width: 72, height: 48,
                              borderColor: mediaIndex === i ? '#F59E0B' : '#E2E8F0',
                              opacity: mediaIndex === i ? 1 : 0.65,
                            }}>
                            <img src={shot.url} alt={shot.caption} className="w-full h-full object-cover object-top" />
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Discussion / Comments */}
                <CommentsSection
                  toolId={parseInt(tool.id, 10)}
                  isAuthenticated={isAuthenticated}
                  currentUserId={dbUser?.id ?? null}
                  onAuthRequired={() => {
                    setAuthAction('comment');
                    setShowAuthModal(true);
                  }}
                />
              </>
            )}

            {/* ── FEATURES TAB ──────────────────────────────────────────── */}
            {selectedTab === 'features' && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-4 sm:mb-6" style={{ letterSpacing: '-0.02em' }}>Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {toolFeatures.map((feat, i) => (
                    <div key={i} className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 transition-all hover:border-amber-200 hover:shadow-sm">
                      <div className="text-2xl mb-2.5">{feat.icon}</div>
                      <h3 className="text-sm font-extrabold text-gray-900 mb-1">{feat.title}</h3>
                      <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed m-0">{feat.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── PRICING TAB ───────────────────────────────────────────── */}
            {selectedTab === 'pricing' && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <div className="flex items-center justify-between mb-5 sm:mb-6 flex-wrap gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Pricing</h2>
                  <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-700 no-underline inline-flex items-center gap-1">
                    View full pricing <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {toolPricingTiers.map((tier, i) => (
                    <div key={i} className="rounded-2xl p-5 sm:p-6 relative flex flex-col gap-3.5"
                      style={{
                        border: tier.highlighted ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                        background: tier.highlighted ? '#FFFBEB' : '#FAFBFC',
                        boxShadow: tier.highlighted ? '0 4px 20px rgba(245,158,11,0.12)' : 'none',
                      }}>
                      {tier.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-[11px] font-extrabold px-3.5 py-0.5 rounded-full whitespace-nowrap">
                          {tier.badge}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{tier.name}</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-gray-900" style={{ letterSpacing: '-0.03em' }}>{tier.price}</span>
                          {tier.period && <span className="text-xs text-slate-400 font-medium">{tier.period}</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 leading-snug">{tier.description}</p>
                      </div>
                      <div className="flex-1 flex flex-col gap-2.5">
                        {tier.features.map((f, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: tier.highlighted ? '#B45309' : '#15803D' }} />
                            <span className="text-[13px] text-gray-700 leading-snug">{f}</span>
                          </div>
                        ))}
                      </div>
                      <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center py-3 rounded-lg text-[13px] font-bold no-underline transition-all"
                        style={{
                          background: tier.highlighted ? '#F59E0B' : '#FFFFFF',
                          color: tier.highlighted ? '#0A0A0A' : '#374151',
                          border: tier.highlighted ? 'none' : '1.5px solid #E2E8F0',
                          boxShadow: tier.highlighted ? '0 3px 10px rgba(245,158,11,0.3)' : 'none',
                        }}>
                        {tier.cta}
                      </a>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-4 text-center">
                  Pricing shown is indicative. Visit {tool.name}&apos;s website for the latest pricing.
                </p>
              </section>
            )}

            {/* ── REVIEWS TAB ───────────────────────────────────────────── */}
            {selectedTab === 'reviews' && (
              <>
                {/* Ratings & Reviews Summary */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                  <div className="flex items-center justify-between gap-3 mb-6 sm:mb-7 flex-wrap">
                    <h2 className="text-base sm:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Ratings &amp; Reviews</h2>
                    <button onClick={handleWriteReview}
                      className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-lg bg-amber-400 text-gray-900 font-bold text-[13px] border-none cursor-pointer transition-all hover:shadow-md whitespace-nowrap"
                      style={{ boxShadow: '0 3px 10px rgba(245,158,11,0.25)' }}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center mb-7 sm:mb-8 p-5 sm:p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-center shrink-0">
                      <div className="text-4xl sm:text-5xl font-black text-gray-900 leading-none" style={{ letterSpacing: '-0.04em' }}>
                        {totalReviews > 0 ? realAvgRating.toFixed(1) : '0.0'}
                      </div>
                      <div className="mt-1.5"><StarRating rating={realAvgRating} size={16} /></div>
                      <div className="text-[13px] text-slate-500 mt-1.5 font-medium">{totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'}</div>
                    </div>
                    <div className="flex-1 w-full flex flex-col gap-2">
                      {ratingBreakdown.map(({ star, count }) => (
                        <RatingBar key={star} label={`${star} ★`} count={count} total={totalReviews} />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Individual Reviews */}
                <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                  <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100">
                    <h2 className="text-base sm:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Community Reviews</h2>
                  </div>
                  <div className="flex flex-col">
                    {reviews.length === 0 && (
                      <div className="px-5 sm:px-7 py-12 text-center">
                        <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No reviews yet</h3>
                        <p className="text-xs text-slate-500 mb-4">Be the first to share your experience with this tool.</p>
                        <button onClick={handleWriteReview}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-gray-900 font-bold text-xs border-none cursor-pointer transition-all hover:shadow-md"
                          style={{ boxShadow: '0 2px 8px rgba(245,158,11,0.2)' }}>
                          <MessageSquare className="w-3 h-3" />
                          {isAuthenticated ? 'Write the First Review' : 'Sign In to Review'}
                        </button>
                      </div>
                    )}
                    {reviews.map((review, i) => (
                      <div key={review.id} className="px-5 sm:px-7 py-5 sm:py-6" style={{ borderBottom: i < reviews.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-[42px] sm:h-[42px] rounded-full shrink-0 flex items-center justify-center"
                              style={{ background: `hsl(${(review.user?.name.charCodeAt(0) ?? 65) * 7}, 50%, 52%)` }}>
                              <span className="text-sm sm:text-base font-extrabold text-white">{review.user?.name.charAt(0) ?? '?'}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">{review.user?.name}</span>
                                {review.is_verified_purchase && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2 rounded-full bg-green-50 text-green-700 border border-green-200">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 font-medium mt-0.5">
                                {review.user?.role}{review.user?.company ? ` · ${review.user.company}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-1">
                            <StarRating rating={review.rating} size={13} />
                            <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
                          </div>
                        </div>
                        <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 mb-2 leading-snug">{review.title}</h3>
                        <p className="text-[13px] sm:text-sm text-gray-700 leading-relaxed sm:leading-[1.7] mb-4">{review.body}</p>
                        {(review.pros || review.cons) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {review.pros && (
                              <div className="p-3 sm:p-3.5 rounded-xl bg-green-50 border border-green-200">
                                <div className="text-[11px] font-bold text-green-700 uppercase tracking-wider mb-1.5">Pros</div>
                                <p className="text-xs sm:text-[13px] text-green-800 m-0 leading-snug">{review.pros}</p>
                              </div>
                            )}
                            {review.cons && (
                              <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                                <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1.5">Cons</div>
                                <p className="text-xs sm:text-[13px] text-rose-800 m-0 leading-snug">{review.cons}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {editingReview === review.id ? (
                          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                            <div>
                              <label className="text-xs font-bold text-slate-600 mb-1 block">Rating</label>
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(s => (
                                  <button key={s} onClick={() => setEditRating(s)} className="p-0 border-none bg-transparent cursor-pointer">
                                    <Star className="w-5 h-5" style={{ fill: s <= editRating ? '#FBBF24' : '#E2E8F0', color: s <= editRating ? '#FBBF24' : '#E2E8F0' }} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Review title" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                            <textarea value={editBody} onChange={e => setEditBody(e.target.value)} placeholder="Your review" rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none" />
                            <div className="grid grid-cols-2 gap-2">
                              <input value={editPros} onChange={e => setEditPros(e.target.value)} placeholder="Pros" className="px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                              <input value={editCons} onChange={e => setEditCons(e.target.value)} placeholder="Cons" className="px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleSaveEdit(review.id)} disabled={savingEdit}
                                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50">
                                {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                              </button>
                              <button onClick={() => setEditingReview(null)} className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => handleHelpful(review.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all"
                            style={{
                              color: helpfulMap[review.id] ? '#15803D' : '#64748B',
                              background: helpfulMap[review.id] ? '#F0FDF4' : 'transparent',
                              border: helpfulMap[review.id] ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                              cursor: helpfulMap[review.id] ? 'default' : 'pointer',
                            }}>
                            <ThumbsUp className="w-3 h-3" />
                            Helpful ({review.helpful_count + (helpfulMap[review.id] ? 1 : 0)})
                          </button>
                          {isOwnReview(review) && editingReview !== review.id && (
                            <>
                              <button onClick={() => startEditReview(review)}
                                className="inline-flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button onClick={() => handleDeleteReview(review.id)}
                                disabled={deletingReview === review.id}
                                className="inline-flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50">
                                {deletingReview === review.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
                              </button>
                            </>
                          )}
                        </div>
                        {review.founder_reply && (
                          <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 border-l-[3px] border-l-amber-400">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="w-3.5 h-3.5 text-amber-700" />
                              <span className="text-xs font-bold text-amber-700">Founder Reply</span>
                              <span className="text-[11px] text-amber-800">· {formatDate(review.founder_reply.created_at)}</span>
                            </div>
                            <p className="text-[13px] text-amber-900 leading-relaxed m-0">{review.founder_reply.body}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-5 sm:px-7 py-4 sm:py-5 bg-amber-50 border-t border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-0.5">Have experience with {tool.name}?</p>
                      <p className="text-[13px] text-slate-500 m-0">Share your honest review and help others make informed decisions.</p>
                    </div>
                    <button onClick={handleWriteReview}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 text-gray-900 font-bold text-[13px] border-none cursor-pointer transition-all hover:shadow-md whitespace-nowrap shrink-0"
                      style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* ── TEAM TAB ──────────────────────────────────────────────── */}
            {selectedTab === 'team' && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-5" style={{ letterSpacing: '-0.02em' }}>Team &amp; Founder</h2>
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
                          <img src={tool.founder.avatar_url} alt={tool.founder.name} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          <span className="text-xl font-black text-white">{tool.founder.name.charAt(0)}</span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-base font-extrabold text-gray-900">{tool.founder.name}</span>
                          {tool.founder.is_pro && (
                            <span className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-purple-50 text-purple-600 border border-purple-200">PRO</span>
                          )}
                          <span className="text-[11px] font-semibold py-0.5 px-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Founder</span>
                        </div>
                        {tool.founder.bio && (
                          <p className="text-sm text-slate-600 leading-relaxed mb-3">{tool.founder.bio}</p>
                        )}
                        {/* Social links */}
                        {(tool.founder.twitter_handle || tool.founder.linkedin_url) && (
                          <div className="flex gap-2 flex-wrap">
                            {tool.founder.twitter_handle && (
                              <a href={`https://twitter.com/${tool.founder.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 no-underline py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors">
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
                    {/* Built with */}
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
                    <p className="text-sm font-semibold text-slate-500 mb-1">No team information yet</p>
                    <p className="text-xs text-slate-400 mb-4">The founder hasn&apos;t added team details yet.</p>
                    <button onClick={() => router.push('/launchpad')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors border-none cursor-pointer">
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
              />
            )}

            {/* ── ALTERNATIVES TAB ──────────────────────────────────────── */}
            {selectedTab === 'alternatives' && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 mb-2.5">
                      <Layers className="w-3 h-3 text-blue-600" />
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Alternatives</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>
                      Top Alternatives to {tool.name}
                    </h2>
                    <p className="text-sm text-slate-500 m-0">
                      {alternatives.length > 0
                        ? `${alternatives.length} product${alternatives.length !== 1 ? 's' : ''} in ${tool.category} to consider`
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
                    {alternatives.map((alt, i) => (
                      <AlternativeProductCard key={alt.id} product={alt} currentTool={tool} rank={i + 1} />
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500 mb-1">No alternatives listed yet</p>
                    <p className="text-xs text-slate-400">Check back later or browse all tools in this category.</p>
                    <Link href={`/tools?category=${encodeURIComponent(tool.category)}`}
                      className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-amber-700 no-underline px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                      Browse {tool.category} tools <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </section>
            )}

          </div>

          {/* ── RIGHT SIDEBAR ────────────────────────────────────────────── */}
          <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4 order-1 lg:order-2 lg:sticky lg:top-[140px]">

            {/* Stack Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <h3 className="text-[11px] font-extrabold text-slate-400 mb-4 uppercase tracking-widest">Stack Details</h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Tag, label: 'Category', value: tool.category },
                  { icon: Globe, label: 'Pricing', value: tool.pricing_model },
                  { icon: Calendar, label: 'Launched', value: new Date(tool.launched_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                  { icon: Award, label: 'Rank Score', value: tool.rank_score.toLocaleString() },
                  { icon: TrendingUp, label: 'Weekly Change', value: tool.weekly_rank_change ? `+${tool.weekly_rank_change}` : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[13px] text-slate-500">{label}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              {/* Social links — founder's social profiles */}
              {tool.founder && (tool.founder.twitter_handle || tool.founder.linkedin_url) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Connect</p>
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
              <div className="mt-4 pt-4 border-t border-slate-100">
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackOutboundClick('website')}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-400 text-gray-900 font-extrabold text-[13px] no-underline transition-all hover:shadow-md"
                  style={{ boxShadow: '0 3px 10px rgba(245,158,11,0.3)' }}>
                  Visit Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Founder quick card — compact sidebar version */}
            {tool.founder && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <h3 className="text-[11px] font-extrabold text-slate-400 mb-3.5 uppercase tracking-widest">Built By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl shrink-0 border border-slate-200 flex items-center justify-center overflow-hidden"
                    style={{ background: `hsl(${(tool.founder.name.charCodeAt(0)) * 7}, 50%, 52%)` }}>
                    {tool.founder.avatar_url ? (
                      <img src={tool.founder.avatar_url} alt={tool.founder.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-extrabold text-white">{tool.founder.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900 truncate">{tool.founder.name}</span>
                      {tool.founder.is_pro && (
                        <span className="text-[10px] font-bold py-0.5 px-1.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">PRO</span>
                      )}
                    </div>
                    {tool.founder.bio && <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{tool.founder.bio}</p>}
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
              <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: '#0F1629', boxShadow: '0 4px 24px rgba(15,23,42,0.18)' }}>
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' }} />
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full mb-3" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <Building2 className="w-3 h-3 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">For Founders</span>
                </div>
                <h3 className="text-sm font-black text-white mb-1.5 leading-tight" style={{ letterSpacing: '-0.02em' }}>Is this your product?</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">Claim this listing to unlock founder features and grow faster.</p>
                <button onClick={() => router.push('/launchpad')}
                  className="w-full py-2.5 rounded-lg bg-amber-400 text-gray-900 font-extrabold text-[13px] border-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  style={{ boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
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

            {/* Share */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <h3 className="text-[11px] font-extrabold text-slate-400 mb-3.5 uppercase tracking-widest">Share</h3>
              <div className="flex gap-2">
                <ShareButton label="Twitter / X" icon="𝕏" hoverColor="#000" hoverBg="#F9FAFB"
                  onClick={() => {
                    const text = encodeURIComponent(`Check out ${tool.name} on @LaudStack — ${tool.tagline}`);
                    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=400');
                  }} />
                <ShareButton label="LinkedIn" icon="in" hoverColor="#0A66C2" hoverBg="#EFF6FF"
                  onClick={() => {
                    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer,width=600,height=500');
                  }} />
                <CopyLinkButton url={typeof window !== 'undefined' ? window.location.href : ''} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
      <WriteReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} onSuccess={refreshReviews} toolName={tool.name} toolLogo={tool.logo_url} toolId={parseInt(tool.id, 10)} />
      <AuthGateModal open={showAuthModal} onClose={() => setShowAuthModal(false)} action={authAction} />
    </div>
  );
}
