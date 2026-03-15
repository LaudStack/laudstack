"use client";

/*
 * LaudStack Reviews Page — /reviews
 * Design: Clean white, enterprise-grade
 * Lists ALL published community reviews across all tools
 * Fetches from getAllPublishedReviews server action (not limited to 5)
 * Filter by: rating, category, verified only
 * Sort by: most recent, most helpful, highest rated, lowest rated
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star, ThumbsUp, Shield, ChevronDown,
  MessageSquare, Search, SlidersHorizontal, ArrowRight,
  CheckCircle2, Building2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';
import { getAllPublishedReviews, markReviewHelpful } from '@/app/actions/public';
import { toast } from 'sonner';

const SORT_OPTIONS = [
  { value: 'recent',   label: 'Most Recent' },
  { value: 'helpful',  label: 'Most Helpful' },
  { value: 'highest',  label: 'Highest Rated' },
  { value: 'lowest',   label: 'Lowest Rated' },
];

const RATING_OPTIONS = [
  { value: 'all', label: 'All Ratings' },
  { value: '5',   label: '5 Stars' },
  { value: '4',   label: '4 Stars' },
  { value: '3',   label: '3 Stars' },
  { value: '2',   label: '2 Stars' },
  { value: '1',   label: '1 Star' },
];

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const px = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${px} ${i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </div>
  );
}

// ─── Skeleton Components ─────────────────────────────────────────────────────

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className ?? ''}`} />;
}

function ReviewCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <SkeletonPulse className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <SkeletonPulse className="h-3.5 w-28 rounded-md" />
            <SkeletonPulse className="h-2.5 w-20 rounded-md" />
          </div>
        </div>
        <SkeletonPulse className="h-8 w-28 rounded-xl" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonPulse key={i} className="w-4 h-4 rounded-sm" />
          ))}
        </div>
        <SkeletonPulse className="h-4 w-48 rounded-md" />
      </div>
      <div className="space-y-2 mb-4">
        <SkeletonPulse className="h-3 w-full rounded-md" />
        <SkeletonPulse className="h-3 w-full rounded-md" />
        <SkeletonPulse className="h-3 w-3/4 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <SkeletonPulse className="h-16 rounded-xl" />
        <SkeletonPulse className="h-16 rounded-xl" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <SkeletonPulse className="h-3 w-24 rounded-md" />
        <SkeletonPulse className="h-7 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px', flexShrink: 0 }}>
      {[5, 4, 3, 2, 1].map(star => (
        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SkeletonPulse className="h-3 w-3" />
          <SkeletonPulse className="h-1.5 w-3" />
          <div style={{ flex: 1, height: '6px', background: '#F3F4F6', borderRadius: '3px' }} />
          <SkeletonPulse className="h-3 w-7" />
        </div>
      ))}
      <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <SkeletonPulse className="h-6 w-10 rounded-md" />
        <div className="space-y-1">
          <SkeletonPulse className="h-3 w-16 rounded-md" />
          <SkeletonPulse className="h-2.5 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// ─── Review Card ─────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: any }) {
  const router = useRouter();
  const [helpful, setHelpful] = useState(review.helpful_count ?? 0);
  const [voted, setVoted] = useState(false);

  const initials = review.user?.name
    ? review.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const avatarColors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ];
  const colorIdx = (review.user?.id?.charCodeAt?.(1) ?? 0) % avatarColors.length;

  const handleHelpful = async () => {
    if (voted) return;
    setVoted(true);
    setHelpful((h: number) => h + 1);
    const result = await markReviewHelpful(parseInt(review.id, 10));
    if (!result.success) {
      setVoted(false);
      setHelpful((h: number) => h - 1);
      toast.error(result.error || 'Failed to mark as helpful');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColors[colorIdx]}`}>
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{review.user?.name ?? 'Anonymous'}</span>
              {review.is_verified_purchase && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tool chip */}
        {review.tool && (
          <button
            onClick={() => router.push(`/tools/${review.tool.slug}`)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all shrink-0"
          >
            {review.tool.logo_url && (
              <img
                src={review.tool.logo_url}
                alt={review.tool.name}
                className="w-5 h-5 rounded object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <span className="text-xs font-semibold text-slate-700">{review.tool.name}</span>
            <ArrowRight className="h-3 w-3 text-slate-500" />
          </button>
        )}
      </div>

      {/* Rating + title */}
      <div className="flex items-center gap-3 mb-2">
        <StarRow rating={review.rating} size="md" />
        {review.title && <span className="text-sm font-bold text-slate-900">{review.title}</span>}
      </div>

      {/* Body */}
      {review.body && <p className="text-sm text-slate-600 leading-relaxed mb-4">{review.body}</p>}

      {/* Pros / Cons */}
      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {review.pros && (
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Pros</div>
              <p className="text-xs text-emerald-800 leading-relaxed">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
              <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1">Cons</div>
              <p className="text-xs text-rose-800 leading-relaxed">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        <button
          onClick={handleHelpful}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
            voted
              ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-default'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent cursor-pointer'
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Helpful ({helpful})
        </button>
      </div>

      {/* Founder reply */}
      {review.founder_reply && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Founder Reply</span>
            <span className="text-xs text-amber-600 ml-auto">{new Date(review.founder_reply.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">{review.founder_reply.body}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy]             = useState('recent');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [showFilters, setShowFilters]   = useState(false);

  // Fetch ALL published reviews from server action
  useEffect(() => {
    setLoading(true);
    getAllPublishedReviews({ limit: 500 })
      .then(data => {
        setAllReviews(data.reviews);
        setTotalCount(data.total);
      })
      .catch(() => {
        setAllReviews([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, []);

  // Show loading skeleton while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <PageHero
          eyebrow="Community Reviews"
          title="Real reviews from real users"
          subtitle="Every review on LaudStack is from a verified user. No fake ratings, no paid placements — just honest opinions from the community."
          accent="amber"
          layout="split"
          size="md"
        >
          <HeroSkeleton />
        </PageHero>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <SkeletonPulse className="flex-1 h-10 rounded-xl" />
              <SkeletonPulse className="h-10 w-36 rounded-xl" />
              <SkeletonPulse className="h-10 w-24 rounded-xl" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-500 animate-pulse">Loading reviews...</span>
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <ReviewCardSkeleton key={i} delay={i * 80} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const filtered = (() => {
    let list = [...allReviews];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        (r.title ?? '').toLowerCase().includes(q) ||
        (r.body ?? '').toLowerCase().includes(q) ||
        (r.tool?.name ?? '').toLowerCase().includes(q) ||
        (r.user?.name ?? '').toLowerCase().includes(q)
      );
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      list = list.filter(r => r.rating === parseInt(ratingFilter));
    }

    // Verified only
    if (verifiedOnly) {
      list = list.filter(r => r.is_verified_purchase);
    }

    // Sort
    switch (sortBy) {
      case 'helpful':  list.sort((a, b) => (b.helpful_count ?? 0) - (a.helpful_count ?? 0)); break;
      case 'highest':  list.sort((a, b) => b.rating - a.rating); break;
      case 'lowest':   list.sort((a, b) => a.rating - b.rating); break;
      case 'recent':
      default:         list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
    }

    return list;
  })();

  // Stats
  const totalReviews   = allReviews.length;
  const avgRating      = totalReviews > 0 ? (allReviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1) : '0.0';
  const verifiedCount  = allReviews.filter(r => r.is_verified_purchase).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <PageHero
        eyebrow="Community Reviews"
        title="Real reviews from real users"
        subtitle="Every review on LaudStack is from a verified user. No fake ratings, no paid placements — just honest opinions from the community."
        accent="amber"
        layout="split"
        size="md"
      >
        {/* Rating distribution snapshot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px', flexShrink: 0 }}>
          {[5, 4, 3, 2, 1].map(star => {
            const count = allReviews.filter(r => r.rating === star).length;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', width: '14px', textAlign: 'right' }}>{star}</span>
                <span style={{ fontSize: '11px', color: '#F59E0B' }}>★</span>
                <div style={{ flex: 1, height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: star >= 4 ? '#F59E0B' : star === 3 ? '#D97706' : '#EF4444', borderRadius: '3px', transition: 'width 0.4s' }} />
                </div>
                <span style={{ fontSize: '11px', color: '#9CA3AF', width: '28px' }}>{pct}%</span>
              </div>
            );
          })}
          <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#D97706' }}>{avgRating}</span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>avg rating</div>
              <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{totalReviews.toLocaleString()} reviews{totalReviews > 0 ? ` · ${Math.round((verifiedCount / totalReviews) * 100)}% verified` : ''}</div>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Main content */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10">

        {/* Controls bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search reviews by product, keyword, or reviewer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                showFilters
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {(ratingFilter !== 'all' || verifiedOnly) && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {(ratingFilter !== 'all' ? 1 : 0) + (verifiedOnly ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Rating</span>
                <div className="flex gap-1.5">
                  {RATING_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => setRatingFilter(o.value)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        ratingFilter === o.value
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setVerifiedOnly(v => !v)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${verifiedOnly ? 'bg-amber-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${verifiedOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs font-semibold text-slate-700">Verified only</span>
              </label>

              {(ratingFilter !== 'all' || verifiedOnly) && (
                <button
                  onClick={() => { setRatingFilter('all'); setVerifiedOnly(false); }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-600 font-medium">
            Showing <span className="font-bold text-slate-900">{filtered.length}</span> of{' '}
            <span className="font-bold text-slate-900">{totalCount}</span> reviews
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Reviews list */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No reviews found</h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchQuery
                ? `No reviews match "${searchQuery}". Try a different search term.`
                : totalCount === 0
                  ? 'No reviews have been submitted yet. Be the first to share your experience!'
                  : 'No reviews match the selected filters.'}
            </p>
            {(searchQuery || ratingFilter !== 'all' || verifiedOnly) && (
              <button
                onClick={() => { setSearchQuery(''); setRatingFilter('all'); setVerifiedOnly(false); }}
                className="text-sm font-semibold text-amber-600 hover:text-amber-700 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
