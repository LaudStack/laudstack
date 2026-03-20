"use client";
/*
 * LaudStack — User Dashboard / Panel
 * Design: Clean white sidebar layout, amber accents, data-rich profile view
 * Tabs: Profile · My Reviews · Saved Products · Deals · Notifications · Settings
 */
import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User, Star, Bookmark, Settings, Bell, Shield,
  Edit3, Camera, CheckCircle, TrendingUp, MessageSquare, Heart,
  ExternalLink, Trash2, LogOut, Eye, EyeOff, Save, AlertCircle,
  ChevronRight, Award, Zap, Clock, Package, Mail, Lock,
  Globe, Twitter, Linkedin, Github, ArrowRight, BarChart3,
  ThumbsUp, Flag, RefreshCw, Info, Check, X, Rocket,
  Tag, Copy, Calendar,
  Sparkles, ChevronLeft, Loader2, Users, BellRing, UserMinus,
  Briefcase, Building2, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDbUser } from '@/hooks/useDbUser';
import { useSavedTools } from '@/hooks/useSavedTools';
import { useToolsData } from '@/hooks/useToolsData';
import { getUserReviews, updateProfile, deleteAccount } from '@/app/actions/user';
import { getActiveDeals, editReview, deleteReview } from '@/app/actions/public';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/app/actions/notifications';
import {
  getFollowedStacks,
  getFollowing as getFollowingUsers,
  unfollowStack,
  unfollowUser,
} from '@/app/actions/follows';
import {
  getBuyerPurchases,
  getBuyerOffers,
  cancelOffer,
} from '@/app/actions/marketplace';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'reviews' | 'saved' | 'following' | 'purchases' | 'offers' | 'notifications' | 'settings' | 'deals';

const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: 'profile',       label: 'My Profile',    icon: <User className="w-4 h-4" /> },
  { id: 'reviews',       label: 'My Reviews',    icon: <Star className="w-4 h-4" /> },
  { id: 'saved',         label: 'Saved Products',   icon: <Bookmark className="w-4 h-4" /> },
  { id: 'following',     label: 'Following',      icon: <Users className="w-4 h-4" /> },
  { id: 'purchases',     label: 'My Purchases',  icon: <Package className="w-4 h-4" /> },
  { id: 'offers',        label: 'My Offers',     icon: <Sparkles className="w-4 h-4" /> },
  { id: 'deals',         label: 'My Deals',      icon: <Tag className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: 0 },
  { id: 'settings',      label: 'Settings',      icon: <Settings className="w-4 h-4" /> },
];

// ─── Star Row Helper ──────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

// ─── Recommended Products Component ──────────────────────────────────────────────
function RecommendedTools() {
  const [featuredTools, setFeaturedTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch('/api/featured-tools')
      .then(res => res.json())
      .then(data => { setFeaturedTools(data.tools || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-slate-900 font-bold text-base">Recommended for You</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (featuredTools.length === 0) return null;

  // Show 3 at a time, rotate
  const perPage = 3;
  const totalPages = Math.ceil(featuredTools.length / perPage);
  const visible = featuredTools.slice(page * perPage, page * perPage + perPage);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-slate-900 font-bold text-base">Recommended for You</h3>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">Sponsored</span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => (p - 1 + totalPages) % totalPages)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-600 font-medium">{page + 1}/{totalPages}</span>
            <button
              onClick={() => setPage(p => (p + 1) % totalPages)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {visible.map((tool: any) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="group flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white overflow-hidden flex-shrink-0">
              {tool.logo_url ? (
                <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-black text-amber-500">
                  {tool.name?.[0]}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                {tool.name}
              </p>
              <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{tool.tagline}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-slate-700">{(tool.average_rating || 0).toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-500">{tool.review_count || 0} reviews</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({
  user,
  dbUser,
  onEditProfile,
}: {
  user: { email?: string; user_metadata?: Record<string, string> };
  dbUser: any;
  onEditProfile: () => void;
}) {
  const { savedIds } = useSavedTools();
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    getUserReviews()
      .then(r => { setUserReviews(r); setReviewsLoading(false); })
      .catch(() => setReviewsLoading(false));
  }, []);

  const displayName = (dbUser?.firstName ? [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ') : null)
    || dbUser?.name
    || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarUrl = dbUser?.avatarUrl;
  const bio = dbUser?.bio || '';
  const headline = dbUser?.headline || '';
  const website = dbUser?.website || '';
  const twitterHandle = dbUser?.twitterHandle || '';
  const memberSince = dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

  const STATS = [
    { icon: <Star className="w-4 h-4 text-amber-500" />, label: 'Reviews Written', value: userReviews.length },
    { icon: <Bookmark className="w-4 h-4 text-blue-500" />, label: 'Tools Saved', value: savedIds.length },
    { icon: <ThumbsUp className="w-4 h-4 text-green-500" />, label: 'Helpful Votes', value: 0 },
    { icon: <Award className="w-4 h-4 text-purple-500" />, label: 'Member Since', value: memberSince },
  ];

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        {/* Avatar + basic info */}
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-900 border-4 border-white flex items-center justify-center text-white font-black text-xl shadow-lg">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              {dbUser?.founderStatus === 'verified' && (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full">
                  <Rocket className="w-3 h-3" />
                  Founder
                </span>
              )}
              {user?.email && (
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
              <button
                onClick={onEditProfile}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-all"
              >
                <Edit3 className="w-3 h-3" />
                Edit Profile
              </button>
            </div>
          </div>
          <h2 className="text-slate-900 font-black text-xl">{displayName}</h2>
          {headline && <p className="text-amber-600 text-sm font-semibold mt-0.5">{headline}</p>}
          {/* Job title & company */}
          {(dbUser?.jobTitle || dbUser?.company) && (
            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-600">
              {dbUser?.jobTitle && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> {dbUser.jobTitle}
                </span>
              )}
              {dbUser?.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {dbUser.company}
                </span>
              )}
            </div>
          )}
          {/* Location */}
          {(dbUser?.city || dbUser?.state || dbUser?.country) && (
            <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              {[dbUser.city, dbUser.state, dbUser.country].filter(Boolean).join(', ')}
            </div>
          )}
          {bio && <p className="text-slate-500 text-sm mt-1 leading-relaxed">{bio}</p>}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {website && (
              <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-600 transition-colors">
                <Globe className="w-3 h-3" /> {website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {twitterHandle && (
              <a href={`https://twitter.com/${twitterHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-600 transition-colors">
                <Twitter className="w-3 h-3" /> {twitterHandle}
              </a>
            )}
            {dbUser?.linkedinUrl && (
              <a href={dbUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-600 transition-colors">
                <Linkedin className="w-3 h-3" /> LinkedIn
              </a>
            )}
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" /> Joined {memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(({ icon, label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <div className="flex justify-center mb-2">{icon}</div>
            <div className="text-2xl font-black text-slate-900">{typeof value === 'number' ? value : ''}</div>
            {typeof value === 'string' && <div className="text-sm font-bold text-slate-700">{value}</div>}
            <div className="text-xs text-slate-600 font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Recommended Products */}
      <RecommendedTools />

      {/* Badges */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Badges & Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: '⭐', label: 'Top Reviewer', desc: '10+ reviews written', earned: userReviews.length >= 10 },
            { icon: '🔥', label: 'Trending Taste', desc: 'Reviewed a product before it trended', earned: userReviews.length > 0 },
            { icon: '🛡️', label: 'Trusted Reviewer', desc: '5+ helpful votes received', earned: false },
            { icon: '🚀', label: 'Early Adopter', desc: 'Joined in the first month', earned: true },
            { icon: '💎', label: 'Power User', desc: '50+ tools saved', earned: savedIds.length >= 50 },
            { icon: '🏆', label: 'Community Leader', desc: '100+ helpful votes', earned: false },
          ].map(({ icon, label, desc, earned }) => (
            <div
              key={label}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                earned ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-50'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <p className={`text-sm font-bold ${earned ? 'text-slate-900' : 'text-slate-500'}`}>{label}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Public profile link */}
      {dbUser?.id && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Public Profile</p>
              <p className="text-xs text-slate-500">Share your profile with others</p>
            </div>
          </div>
          <Link href={`/profile/${dbUser.id}`} className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            View Profile <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab() {
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editPros, setEditPros] = useState('');
  const [editCons, setEditCons] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadReviews = useCallback(() => {
    setLoading(true);
    getUserReviews()
      .then(r => { setUserReviews(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const startEdit = (review: any) => {
    setEditingId(review.id);
    setEditTitle(review.title ?? '');
    setEditBody(review.body ?? '');
    setEditRating(review.rating);
    setEditPros(review.pros ?? '');
    setEditCons(review.cons ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (editBody.trim().length < 30) {
      toast.error('Review must be at least 30 characters');
      return;
    }
    setSaving(true);
    try {
      const result = await editReview(editingId, {
        rating: editRating,
        title: editTitle.trim(),
        body: editBody.trim(),
        pros: editPros.trim() || undefined,
        cons: editCons.trim() || undefined,
      });
      if (result.success) {
        toast.success('Review updated');
        setEditingId(null);
        loadReviews();
      } else {
        toast.error(result.error || 'Failed to update review');
      }
    } catch {
      toast.error('Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    setDeletingId(reviewId);
    try {
      const result = await deleteReview(reviewId);
      if (result.success) {
        toast.success('Review deleted');
        loadReviews();
      } else {
        toast.error(result.error || 'Failed to delete review');
      }
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5"><CheckCircle className="w-2.5 h-2.5" />Published</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"><Clock className="w-2.5 h-2.5" />Pending</span>;
      case 'hidden':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5"><EyeOff className="w-2.5 h-2.5" />Hidden</span>;
      case 'removed':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5"><X className="w-2.5 h-2.5" />Removed</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-slate-100 rounded-2xl h-20" />
        <div className="animate-pulse bg-slate-100 rounded-2xl h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 font-bold text-base">My Reviews</h3>
          <p className="text-slate-500 text-xs mt-0.5">{userReviews.length} reviews written</p>
        </div>
        <Link href="/categories">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition-all">
            <Star className="w-3.5 h-3.5" />
            Write a Review
          </button>
        </Link>
      </div>

      {userReviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-slate-700 font-bold mb-1">No reviews yet</h4>
          <p className="text-slate-600 text-sm mb-4">Share your experience with tools you&apos;ve used.</p>
          <Link href="/categories">
            <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm transition-colors">
              Browse Products <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      ) : (
        userReviews.map((review: any) => {
          const isEditing = editingId === review.id;
          const isDeleting = deletingId === review.id;
          return (
            <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0">
                    {review.toolLogo ? (
                      <img src={review.toolLogo} alt={review.toolName || 'Tool'} className="w-full h-full object-contain" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-sm font-black text-slate-600">
                        {(review.toolName || 'T')[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <Link href={`/tools/${review.toolSlug || ''}`} className="text-slate-900 font-bold text-sm hover:text-amber-600 transition-colors">
                      {review.toolName || 'Unknown Tool'}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRow rating={review.rating} />
                      <span className="text-xs text-slate-500">{review.rating}/5</span>
                      {review.status && statusBadge(review.status)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                  {!isEditing && (
                    <>
                      <button
                        onClick={() => startEdit(review)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        title="Edit review"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-3 mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {/* Star rating editor */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button key={i} onClick={() => setEditRating(i)} className="focus:outline-none">
                          <Star className={`w-5 h-5 ${i <= editRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Title</label>
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                      placeholder="Review title"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Review <span className="text-slate-600">(min 30 chars)</span></label>
                    <textarea
                      value={editBody}
                      onChange={e => setEditBody(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
                      placeholder="Your review..."
                    />
                    <span className="text-xs text-slate-500">{editBody.length}/30 min</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">Pros</label>
                      <input
                        value={editPros}
                        onChange={e => setEditPros(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                        placeholder="What you liked"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">Cons</label>
                      <input
                        value={editCons}
                        onChange={e => setEditCons(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                        placeholder="What could improve"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-900 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {review.title && <h4 className="text-slate-900 font-semibold text-sm mb-1">{review.title}</h4>}
                  {review.body && <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{review.body}</p>}
                  {(review.pros || review.cons) && (
                    <div className="flex gap-4 mt-2">
                      {review.pros && (
                        <div className="flex items-start gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{review.pros}</span>
                        </div>
                      )}
                      {review.cons && (
                        <div className="flex items-start gap-1 text-xs text-red-500">
                          <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{review.cons}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Founder reply */}
                  {review.founderReply && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-3 w-3 text-amber-600" />
                        <span className="text-xs font-bold text-amber-800">Founder Reply</span>
                        {review.founderReplyAt && (
                          <span className="text-xs text-amber-600 ml-auto">{new Date(review.founderReplyAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">{review.founderReply}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Saved Products Tab ──────────────────────────────────────────────────────────
function SavedTab() {
  const { tools: allTools } = useToolsData();
  const { savedIds, toggle } = useSavedTools();
  const tools = allTools.filter((t: any) => savedIds.includes(t.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 font-bold text-base">Saved Products</h3>
          <p className="text-slate-500 text-xs mt-0.5">{tools.length} tools in your library</p>
        </div>
        <Link href="/categories">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition-all">
            <Package className="w-3.5 h-3.5" />
            Browse Products
          </button>
        </Link>
      </div>

      {tools.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-slate-700 font-bold mb-1">No saved products yet</h4>
          <p className="text-slate-600 text-sm mb-4">Save tools you like to access them quickly later.</p>
          <Link href="/categories">
            <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm transition-colors">
              Explore Products <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool: any) => (
            <div key={tool.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-amber-200 hover:shadow-sm transition-all group">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0">
                  {tool.logo_url ? (
                    <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-base font-black text-slate-600">{tool.name[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/tools/${tool.slug}`} className="text-slate-900 font-bold text-sm hover:text-amber-600 transition-colors truncate">
                      {tool.name}
                    </Link>
                    <button onClick={async () => { const r = await toggle(tool.id); if (r.saved === false) toast.success('Removed from saved'); }} className="flex-shrink-0 p-1 text-amber-400 hover:text-slate-500 transition-colors" title="Remove from saved">
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">{tool.tagline}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-700">{(tool.average_rating || 0).toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-slate-500">{tool.review_count || 0} reviews</span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{tool.pricing_model}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <Link href={`/tools/${tool.slug}`} className="flex-1 text-center text-xs font-semibold text-slate-600 hover:text-amber-600 py-1.5 rounded-lg hover:bg-amber-50 transition-all">
                  View Details
                </Link>
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs font-semibold text-slate-600 hover:text-blue-600 py-1.5 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-1">
                  Visit Site <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Following Tab ───────────────────────────────────────────────────────────
function FollowingTab() {
  const { dbUser } = useDbUser();
  const [subTab, setSubTab] = useState<'stacks' | 'users'>('stacks');
  const [followedStacks, setFollowedStacks] = useState<any[]>([]);
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [stacksLoading, setStacksLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [unfollowingIds, setUnfollowingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!dbUser) {
      setStacksLoading(false);
      setUsersLoading(false);
      return;
    }
    setStacksLoading(true);
    setUsersLoading(true);
    getFollowedStacks(dbUser.id)
      .then(r => setFollowedStacks(r.stacks))
      .catch(() => {})
      .finally(() => setStacksLoading(false));
    getFollowingUsers(dbUser.id)
      .then(r => setFollowedUsers(r.users))
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, [dbUser]);

  const handleUnfollowStack = async (toolId: number, toolName: string) => {
    if (unfollowingIds.has(toolId)) return;
    setUnfollowingIds(prev => new Set(prev).add(toolId));
    try {
      const result = await unfollowStack(toolId);
      if (result.success) {
        setFollowedStacks(prev => prev.filter(s => s.id !== toolId));
        toast.success(`Unfollowed ${toolName}`);
      } else {
        toast.error(result.error || 'Failed to unfollow stack');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setUnfollowingIds(prev => { const next = new Set(prev); next.delete(toolId); return next; });
    }
  };

  const handleUnfollowUser = async (targetUserId: number, userName: string) => {
    if (unfollowingIds.has(targetUserId)) return;
    setUnfollowingIds(prev => new Set(prev).add(targetUserId));
    try {
      const result = await unfollowUser(targetUserId);
      if (result.success) {
        setFollowedUsers(prev => prev.filter(u => u.id !== targetUserId));
        toast.success(`Unfollowed ${userName}`);
      } else {
        toast.error(result.error || 'Failed to unfollow user');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setUnfollowingIds(prev => { const next = new Set(prev); next.delete(targetUserId); return next; });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-slate-900 font-bold text-base">Following</h3>
        <p className="text-slate-500 text-xs mt-0.5">Stacks and users you follow. Follow stacks to get notified about new deals.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setSubTab('stacks')}
          className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-all ${
            subTab === 'stacks'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Stacks ({followedStacks.length})
        </button>
        <button
          onClick={() => setSubTab('users')}
          className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-all ${
            subTab === 'users'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Users ({followedUsers.length})
        </button>
      </div>

      {/* Stacks sub-tab */}
      {subTab === 'stacks' && (
        <>
          {stacksLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : followedStacks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <BellRing className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-slate-700 font-bold mb-1">No followed stacks</h4>
              <p className="text-slate-600 text-sm mb-4">Follow stacks to get notified about new deals and updates.</p>
              <Link href="/tools">
                <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                  Browse Stacks <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {followedStacks.map((stack: any) => (
                <div key={stack.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-purple-200 hover:shadow-sm transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0">
                      {stack.logoUrl ? (
                        <img src={stack.logoUrl} alt={stack.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-base font-black text-slate-600">{stack.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/tools/${stack.slug}`} className="text-slate-900 font-bold text-sm hover:text-amber-600 transition-colors truncate">
                          {stack.name}
                        </Link>
                        <button
                          onClick={() => handleUnfollowStack(stack.id, stack.name)}
                          disabled={unfollowingIds.has(stack.id)}
                          className="flex-shrink-0 p-1 text-purple-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Unfollow"
                        >
                          {unfollowingIds.has(stack.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">{stack.tagline}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-slate-700">{(stack.averageRating || 0).toFixed(1)}</span>
                        </div>
                        {stack.category && (
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{stack.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <Link href={`/tools/${stack.slug}`} className="flex-1 text-center text-xs font-semibold text-slate-600 hover:text-amber-600 py-1.5 rounded-lg hover:bg-amber-50 transition-all">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Users sub-tab */}
      {subTab === 'users' && (
        <>
          {usersLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : followedUsers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-slate-700 font-bold mb-1">Not following anyone</h4>
              <p className="text-slate-600 text-sm">Follow users to stay connected with the community.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followedUsers.map((user: any) => (
                <div key={user.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 hover:border-purple-200 transition-all">
                  <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0 no-underline">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
                        {(user.name || 'U')[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-500">Followed {new Date(user.followedAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleUnfollowUser(user.id, user.name || 'User')}
                    disabled={unfollowingIds.has(user.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-500 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {unfollowingIds.has(user.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserMinus className="w-3 h-3" />} Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const LIMIT = 15;

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const res = await getNotifications({ limit: LIMIT, offset: p * LIMIT });
      setNotifs(res.notifications);
      setUnreadCount(res.unreadCount);
      setTotal(res.total);
    } catch (e) {
      console.error('[NotificationsTab] load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsAsRead();
    if (res.success) {
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    }
  };

  const handleClick = async (n: any) => {
    if (!n.isRead) {
      await markNotificationAsRead(n.id);
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (n.link) router.push(n.link);
  };

  const timeAgo = (date: Date | string) => {
    const diff = Math.max(0, Date.now() - new Date(date).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const notifIcon = (type: string) => {
    if (type === 'new_review') return <Star className="w-4 h-4 text-amber-500" />;
    if (type === 'founder_reply') return <MessageSquare className="w-4 h-4 text-blue-500" />;
    if (type === 'comment_reply') return <MessageSquare className="w-4 h-4 text-indigo-500" />;
    if (type === 'claim_approved' || type === 'submission_approved') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (type === 'claim_rejected' || type === 'submission_rejected') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (type === 'tool_verified') return <Shield className="w-4 h-4 text-emerald-500" />;
    if (type === 'tool_featured') return <Award className="w-4 h-4 text-amber-500" />;
    return <Bell className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 font-bold text-base">Notifications</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && notifs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-slate-700 font-bold mb-1">No notifications</h4>
          <p className="text-slate-600 text-sm">You&apos;re all caught up! We&apos;ll notify you when something happens.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {notifs.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex items-start gap-3 px-5 py-4 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors ${
                !n.isRead ? 'bg-amber-50/40' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                !n.isRead ? 'bg-amber-100' : 'bg-slate-100'
              }`}>
                {notifIcon(n.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {page + 1} of {Math.ceil(total / LIMIT)}
          </span>
          <button
            disabled={(page + 1) * LIMIT >= total}
            onClick={() => setPage(p => p + 1)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Notification preferences — persisted to DB */}
      <NotificationPreferences />
    </div>
  );
}

function NotificationPreferences() {
  const { dbUser } = useDbUser();
  const [emailNotifs, setEmailNotifs] = useState(dbUser?.emailNotifications ?? true);
  const [reviewAlerts, setReviewAlerts] = useState(dbUser?.reviewAlerts ?? true);
  const [weeklyReport, setWeeklyReport] = useState(dbUser?.weeklyReport ?? true);

  useEffect(() => {
    if (dbUser) {
      setEmailNotifs(dbUser.emailNotifications ?? true);
      setReviewAlerts(dbUser.reviewAlerts ?? true);
      setWeeklyReport(dbUser.weeklyReport ?? true);
    }
  }, [dbUser]);

  const prefs = [
    { label: 'Email notifications', desc: 'Receive updates and digests via email', icon: Mail, state: emailNotifs, setState: setEmailNotifs, dbKey: 'emailNotifications' as const },
    { label: 'Review alerts', desc: 'Get notified when founders respond to your reviews', icon: MessageSquare, state: reviewAlerts, setState: setReviewAlerts, dbKey: 'reviewAlerts' as const },
    { label: 'Weekly digest', desc: 'A curated summary of platform activity every week', icon: Tag, state: weeklyReport, setState: setWeeklyReport, dbKey: 'weeklyReport' as const },
  ];

  return (
    <div className="bg-gradient-to-br from-white to-amber-50/30 border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 sm:px-6 py-4">
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notification Preferences
        </h4>
        <p className="text-amber-100 text-xs mt-0.5">Choose what updates you want to receive</p>
      </div>
      <div className="p-4 space-y-2">
        {prefs.map(({ label, desc, icon: Icon, state, setState, dbKey }) => (
          <div
            key={label}
            className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border transition-all duration-200 ${
              state
                ? 'bg-amber-50/60 border-amber-200/80 shadow-sm'
                : 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                state ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold transition-colors ${state ? 'text-slate-900' : 'text-slate-600'}`}>{label}</p>
                <p className="text-xs text-slate-600 mt-0.5 truncate">{desc}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                const newVal = !state;
                setState(newVal);
                try {
                  await updateProfile({ [dbKey]: newVal });
                  toast.success(`${label} ${newVal ? 'enabled' : 'disabled'}`);
                } catch {
                  setState(state);
                  toast.error(`Failed to update ${label.toLowerCase()}`);
                }
              }}
              className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 ${
                state ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-inner' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={state}
              aria-label={label}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                state ? 'left-6 shadow-amber-200' : 'left-1'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Tab (now includes Edit Profile) ─────────────────────────────────
function SettingsTab({
  user,
  dbUser,
  onProfileSaved,
}: {
  user: { email?: string; user_metadata?: Record<string, string> };
  dbUser: any;
  onProfileSaved: () => void;
}) {
  const { signOut } = useAuth();
  const router = useRouter();

  // Edit Profile state
  const [editFirstName, setEditFirstName] = useState(dbUser?.firstName || (dbUser?.name ? dbUser.name.split(' ')[0] : '') || user?.user_metadata?.first_name || (user?.user_metadata?.full_name ? user.user_metadata.full_name.split(' ')[0] : '') || '');
  const [editLastName, setEditLastName] = useState(dbUser?.lastName || (dbUser?.name ? dbUser.name.split(' ').slice(1).join(' ') : '') || user?.user_metadata?.last_name || (user?.user_metadata?.full_name ? user.user_metadata.full_name.split(' ').slice(1).join(' ') : '') || '');
  const [editBio, setEditBio] = useState(dbUser?.bio || '');
  const [editHeadline, setEditHeadline] = useState(dbUser?.headline || '');
  const [editWebsite, setEditWebsite] = useState(dbUser?.website || '');
  const [editTwitter, setEditTwitter] = useState(dbUser?.twitterHandle || '');
  const [editLinkedin, setEditLinkedin] = useState(dbUser?.linkedinUrl || '');
  const [editJobTitle, setEditJobTitle] = useState(dbUser?.jobTitle || '');
  const [editCompany, setEditCompany] = useState(dbUser?.company || '');
  const [editCity, setEditCity] = useState(dbUser?.city || '');
  const [editState, setEditState] = useState(dbUser?.state || '');
  const [editCountry, setEditCountry] = useState(dbUser?.country || '');
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(dbUser?.avatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Privacy toggles — initialized from DB
  const [publicProfile, setPublicProfile] = useState(dbUser?.publicProfile ?? true);
  const [showReviews, setShowReviews] = useState(dbUser?.showReviewsPublicly ?? true);
  const [emailNotifs, setEmailNotifs] = useState(dbUser?.emailNotifications ?? true);
  const [reviewAlerts, setReviewAlerts] = useState(dbUser?.reviewAlerts ?? true);
  const [weeklyReport, setWeeklyReport] = useState(dbUser?.weeklyReport ?? true);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Determine if user signed up via OAuth (hide password section for OAuth users)
  const isOAuthUser = dbUser?.loginMethod === 'linkedin' || dbUser?.loginMethod === 'google';

  // Sync state when dbUser changes
  useEffect(() => {
    if (dbUser) {
      setEditFirstName(dbUser.firstName || (dbUser.name ? dbUser.name.split(' ')[0] : '') || '');
      setEditLastName(dbUser.lastName || (dbUser.name ? dbUser.name.split(' ').slice(1).join(' ') : '') || '');
      setEditBio(dbUser.bio || '');
      setEditHeadline(dbUser.headline || '');
      setEditWebsite(dbUser.website || '');
      setEditTwitter(dbUser.twitterHandle || '');
      setEditLinkedin(dbUser.linkedinUrl || '');
      setEditJobTitle(dbUser.jobTitle || '');
      setEditCompany(dbUser.company || '');
      setEditCity(dbUser.city || '');
      setEditState(dbUser.state || '');
      setEditCountry(dbUser.country || '');
      setAvatarUrl(dbUser.avatarUrl || '');
      setPublicProfile(dbUser.publicProfile ?? true);
      setShowReviews(dbUser.showReviewsPublicly ?? true);
      setEmailNotifs(dbUser.emailNotifications ?? true);
      setReviewAlerts(dbUser.reviewAlerts ?? true);
      setWeeklyReport(dbUser.weeklyReport ?? true);
    }
  }, [dbUser]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large. Maximum 5MB.'); return; }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type. Use JPEG, PNG, GIF, or WebP.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setAvatarUrl(data.url);
      // Save to profile immediately
      await updateProfile({ avatarUrl: data.url });
      onProfileSaved();
      toast.success('Profile photo updated!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName: editFirstName,
        lastName: editLastName,
        name: [editFirstName, editLastName].filter(Boolean).join(' '),
        bio: editBio,
        headline: editHeadline,
        website: editWebsite,
        twitterHandle: editTwitter,
        linkedinUrl: editLinkedin || undefined,
        avatarUrl: avatarUrl || undefined,
        jobTitle: editJobTitle || undefined,
        company: editCompany || undefined,
        city: editCity || undefined,
        state: editState || undefined,
        country: editCountry || undefined,
      });
      onProfileSaved();
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPw || !newPw || !confirmPw) { toast.error('Please fill in all password fields'); return; }
    if (newPw !== confirmPw) { toast.error('New passwords do not match'); return; }
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSavingPw(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      toast.success('Password updated successfully');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  };

  const editDisplayName = [editFirstName, editLastName].filter(Boolean).join(' ');
  const initials = editDisplayName ? editDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className="space-y-6">
      {/* Edit Profile */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold text-base mb-5 flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-amber-500" />
          Edit Profile
        </h3>

        {/* Avatar upload */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg border-2 border-slate-200">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center shadow-md hover:bg-amber-300 transition-colors disabled:opacity-50"
            >
              {uploading ? <RefreshCw className="w-3.5 h-3.5 text-slate-900 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-slate-900" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Profile Photo</p>
            <p className="text-xs text-slate-500">JPEG, PNG, GIF, or WebP. Max 5MB.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">First Name</label>
              <input
                type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Last Name</label>
              <input
                type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)}
                placeholder="Smith"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Headline</label>
              <input
                type="text" value={editHeadline} onChange={e => setEditHeadline(e.target.value)}
                placeholder="e.g. Product Designer at Acme"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Job Title
              </label>
              <input
                type="text" value={editJobTitle} onChange={e => setEditJobTitle(e.target.value)}
                placeholder="e.g. Senior Product Manager"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Company
              </label>
              <input
                type="text" value={editCompany} onChange={e => setEditCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> City
              </label>
              <input
                type="text" value={editCity} onChange={e => setEditCity(e.target.value)}
                placeholder="e.g. San Francisco"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">State / Province</label>
              <input
                type="text" value={editState} onChange={e => setEditState(e.target.value)}
                placeholder="e.g. California"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Country</label>
              <input
                type="text" value={editCountry} onChange={e => setEditCountry(e.target.value)}
                placeholder="e.g. United States"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Bio</label>
            <textarea
              value={editBio} onChange={e => setEditBio(e.target.value)} rows={3}
              placeholder="Tell others about yourself..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Website
              </label>
              <input type="url" value={editWebsite} onChange={e => setEditWebsite(e.target.value)} placeholder="https://yoursite.com"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Twitter className="w-3 h-3" /> Twitter / X
              </label>
              <input type="text" value={editTwitter} onChange={e => setEditTwitter(e.target.value)} placeholder="@handle"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Linkedin className="w-3 h-3" /> LinkedIn
              </label>
              <input type="text" value={editLinkedin} onChange={e => setEditLinkedin(e.target.value)} placeholder="linkedin.com/in/..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
          <button onClick={handleSaveProfile} disabled={saving}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-amber-500" />
          Account Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Account Type</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">
                {dbUser?.founderPlanActive ? 'Founder Plan ($49/mo)' : 'Free Account'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Login Method</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5 capitalize">
                {dbUser?.loginMethod === 'linkedin' ? 'LinkedIn' : dbUser?.loginMethod === 'google' ? 'Google' : dbUser?.loginMethod || 'Email'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Member Since</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">
                {dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy settings */}
      <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 sm:px-6 py-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy & Visibility
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Control how others see your activity</p>
        </div>
        <div className="p-4 space-y-2">
          {[
            { label: 'Public profile', desc: 'Allow others to view your profile page', icon: Globe, state: publicProfile, setState: setPublicProfile, dbKey: 'publicProfile' as const },
            { label: 'Show my reviews publicly', desc: 'Display your reviews on tool pages', icon: Eye, state: showReviews, setState: setShowReviews, dbKey: 'showReviewsPublicly' as const },
            { label: 'Email notifications', desc: 'Receive updates and digests via email', icon: Mail, state: emailNotifs, setState: setEmailNotifs, dbKey: 'emailNotifications' as const },
            { label: 'Review alerts', desc: 'Get notified when someone replies to your reviews', icon: BellRing, state: reviewAlerts, setState: setReviewAlerts, dbKey: 'reviewAlerts' as const },
            { label: 'Weekly report', desc: 'Receive a weekly summary of platform activity', icon: BarChart3, state: weeklyReport, setState: setWeeklyReport, dbKey: 'weeklyReport' as const },
          ].map(({ label, desc, icon: Icon, state, setState, dbKey }) => (
            <div
              key={label}
              className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border transition-all duration-200 ${
                state
                  ? 'bg-amber-50/60 border-amber-200/80 shadow-sm'
                  : 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  state ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold transition-colors ${state ? 'text-slate-900' : 'text-slate-600'}`}>{label}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const newVal = !state;
                  setState(newVal);
                  try {
                    await updateProfile({ [dbKey]: newVal });
                    toast.success(`${label} ${newVal ? 'enabled' : 'disabled'}`);
                  } catch {
                    setState(state);
                    toast.error(`Failed to update ${label.toLowerCase()}`);
                  }
                }}
                className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 ${
                  state ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-inner' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={state}
                aria-label={label}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                  state ? 'left-6 shadow-amber-200' : 'left-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Password change — hidden for OAuth users */}
      {!isOAuthUser && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            Change Password
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Current Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all pr-10 bg-slate-50 focus:bg-white"
                />
                <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">New Password</label>
              <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Confirm New Password</label>
              <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <button onClick={handlePasswordUpdate} disabled={savingPw}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              {savingPw ? <><RefreshCw className="w-4 h-4 animate-spin" /> Updating…</> : <><Save className="w-4 h-4" /> Update Password</>}
            </button>
          </div>
        </div>
      )}

      {/* Connected accounts — show for OAuth users */}
      {isOAuthUser && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            Connected Accounts
          </h3>
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            {dbUser?.loginMethod === 'linkedin' ? (
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <Linkedin className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900 capitalize">{dbUser?.loginMethod || 'OAuth'}</p>
              <p className="text-xs text-slate-500">Connected &middot; {user?.email}</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" /> Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-3">You signed in with {dbUser?.loginMethod || 'an external provider'}. Password management is handled by your identity provider.</p>
        </div>
      )}


      {/* Danger zone */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6">
        <h3 className="text-rose-600 font-bold text-base mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Danger Zone
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-slate-900 text-sm font-semibold">Sign out of LaudStack</p>
              <p className="text-slate-500 text-xs">You can sign back in at any time</p>
            </div>
            <button onClick={() => { signOut(); router.push('/'); toast.success('Signed out successfully'); }}
              className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold px-4 py-2 rounded-xl transition-colors text-sm border border-rose-200"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-900 text-sm font-semibold">Delete account</p>
                <p className="text-slate-500 text-xs">Permanently remove your account and all data</p>
              </div>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold px-4 py-2 rounded-xl transition-colors text-sm border border-rose-200"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={deletingAccount}
                    onClick={async () => {
                      setDeletingAccount(true);
                      try {
                        const result = await deleteAccount();
                        if (result.success) {
                          toast.success('Account deleted. Goodbye!');
                          router.push('/');
                        } else {
                          toast.error(result.error || 'Failed to delete account');
                        }
                      } catch {
                        toast.error('Failed to delete account. Please try again.');
                      } finally {
                        setDeletingAccount(false);
                        setShowDeleteConfirm(false);
                      }
                    }}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm disabled:opacity-50"
                  >
                    {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {deletingAccount ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              )}
            </div>
            {showDeleteConfirm && (
              <p className="text-xs text-rose-600 mt-2 font-medium">This action is irreversible. All your reviews, saved tools, and profile data will be permanently deleted.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Purchases Tab (Marketplace) ─────────────────────────────────────────────
function PurchasesTab() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBuyerPurchases(page, 10);
      if (res.success) {
        setPurchases(res.orders || []);
        setTotal(res.total || 0);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { loadPurchases(); }, [loadPurchases]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading purchases...</span>
        </div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">No purchases yet</h3>
        <p className="text-sm text-slate-600 mb-6">Browse the marketplace to find SaaS products, boilerplates, and digital tools.</p>
        <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 transition">
          Browse Marketplace <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">My Purchases</h2>
        <span className="text-sm text-slate-600">{total} total</span>
      </div>

      {purchases.map((item: any) => (
        <div key={item.order.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/marketplace/${item.product?.slug || ''}`} className="text-sm font-bold text-slate-800 hover:text-amber-600 transition truncate">
                  {item.product?.name || 'Product'}
                </Link>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
                  {item.order.status}
                </span>
                {item.product?.category && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                    {item.product.category.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Purchased {new Date(item.order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {item.creator?.name && <> &middot; by {item.creator.name}</>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-800">${(item.order.amount / 100).toFixed(2)}</p>
              {item.product?.downloadFileKey && (
                <Link
                  href={`/marketplace/${item.product.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Package className="w-3 h-3" /> Access
                </Link>
              )}
              <Link
                href={`/marketplace/${item.product?.slug || ''}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition"
              >
                <Star className="w-3 h-3" /> Review
              </Link>
            </div>
          </div>
        </div>
      ))}

      {total > 10 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">Page {page} of {Math.ceil(total / 10)}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 10)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Offers Tab (Marketplace) ────────────────────────────────────────────────
function OffersTab() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBuyerOffers(page, 10);
      if (res.success) {
        setOffers(res.offers || []);
        setTotal(res.total || 0);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  const handleCancel = async (offerId: number) => {
    setCancellingId(offerId);
    try {
      const res = await cancelOffer(offerId);
      if (res.success) {
        toast.success('Offer cancelled');
        loadOffers();
      } else {
        toast.error(res.error || 'Failed to cancel offer');
      }
    } catch {
      toast.error('Failed to cancel offer');
    }
    setCancellingId(null);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    countered: 'bg-blue-50 text-blue-700 border-blue-200',
    expired: 'bg-slate-50 text-slate-500 border-slate-200',
    cancelled: 'bg-slate-50 text-slate-400 border-slate-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading offers...</span>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">No offers yet</h3>
        <p className="text-sm text-slate-600 mb-6">Make an offer on eligible marketplace products to negotiate a price.</p>
        <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 transition">
          Browse Marketplace <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">My Offers</h2>
        <span className="text-sm text-slate-600">{total} total</span>
      </div>

      {offers.map((item: any) => (
        <div key={item.offer.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/marketplace/${item.product?.slug || ''}`} className="text-sm font-bold text-slate-800 hover:text-amber-600 transition truncate">
                  {item.product?.name || 'Product'}
                </Link>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${statusColors[item.offer.status] || statusColors.pending}`}>
                  {item.offer.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                <span>Your offer: <strong className="text-slate-700">${(item.offer.offerAmountCents / 100).toFixed(2)}</strong></span>
                {item.offer.counterAmountCents && (
                  <span>Counter: <strong className="text-blue-600">${(item.offer.counterAmountCents / 100).toFixed(2)}</strong></span>
                )}
                <span>{new Date(item.offer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              {item.offer.rejectionReason && (
                <p className="text-xs text-red-500 mt-1">Reason: {item.offer.rejectionReason}</p>
              )}
              {item.offer.counterMessage && (
                <p className="text-xs text-blue-500 mt-1">Creator message: {item.offer.counterMessage}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {item.offer.status === 'accepted' && (
                <Link
                  href={`/api/stripe/marketplace-purchase?product_id=${item.offer.productId}&offer_id=${item.offer.id}`}
                  className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Pay Now
                </Link>
              )}
              {item.offer.status === 'countered' && (
                <Link
                  href={`/api/stripe/marketplace-purchase?product_id=${item.offer.productId}&offer_id=${item.offer.id}`}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Accept & Pay ${(item.offer.counterAmountCents / 100).toFixed(2)}
                </Link>
              )}
              {(item.offer.status === 'pending' || item.offer.status === 'countered') && (
                <button
                  onClick={() => handleCancel(item.offer.id)}
                  disabled={cancellingId === item.offer.id}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {cancellingId === item.offer.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {total > 10 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">Page {page} of {Math.ceil(total / 10)}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 10)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Deals Tab (wired to real DB) ─────────────────────────────────────────────
function DealsTab() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    getActiveDeals()
      .then((d: any) => { setDeals(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-slate-100 rounded-2xl h-20" />
        <div className="animate-pulse bg-slate-100 rounded-2xl h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 font-bold text-base">Available Deals</h3>
          <p className="text-slate-500 text-sm mt-0.5">{deals.length} active deals</p>
        </div>
        <Link href="/deals">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition-all">
            <Tag className="w-3.5 h-3.5" /> Browse All Deals
          </button>
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-sm">No active deals right now</p>
          <p className="text-slate-500 text-xs mt-1">Check back soon for exclusive offers from top SaaS tools.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map((deal: any) => (
            <div key={deal.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-amber-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-slate-900 font-bold text-sm">{deal.title}</h4>
                  {deal.description && <p className="text-slate-500 text-xs mt-1 leading-relaxed">{deal.description}</p>}
                </div>
                {deal.discountPercent && (
                  <span className="text-xl font-black text-amber-500 flex-shrink-0">{deal.discountPercent}% OFF</span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {deal.couponCode && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-xs font-mono font-black text-slate-700 tracking-widest">{deal.couponCode}</span>
                    <button onClick={() => handleCopy(deal.couponCode)} className="p-1 rounded-lg hover:bg-amber-100 transition-colors">
                      {copiedCode === deal.couponCode ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>
                )}
                {deal.expiresAt && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Expires {new Date(deal.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                {deal.dealUrl && (
                  <a href={deal.dealUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                    Claim Deal <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">Discover more exclusive deals</p>
          <p className="text-white/60 text-xs mt-0.5">New deals added every week from top SaaS tools</p>
        </div>
        <Link href="/deals" className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm shrink-0">
          <Tag className="w-4 h-4" /> Browse Deals
        </Link>
      </div>
    </div>
  );
}


// ─── Main Dashboard ───────────────────────────────────────────────────────────
function DashboardContent() {
  const { tools: allTools, reviews: allReviews, loading: toolsLoading } = useToolsData();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') as Tab | null;
  const VALID_TABS: Tab[] = ['profile', 'reviews', 'saved', 'following', 'purchases', 'offers', 'deals', 'notifications', 'settings'];
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'profile'
  );
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { dbUser, loading: dbLoading, refetch: refetchDbUser } = useDbUser();
  const router = useRouter();

  // Sync tab with URL param changes (e.g. when Navbar pushes ?tab=notifications)
  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  const founderStatus = dbUser?.founderStatus ?? 'none';
  const isVerifiedFounder = founderStatus === 'verified';
  const isPendingFounder = founderStatus === 'pending';

  // Redirect staff/admin users to admin panel — they should not access user dashboard
  const userRole = dbUser?.role ?? 'user';
  const isStaffUser = ['customer_rep', 'moderator', 'analyst', 'manager', 'admin', 'super_admin'].includes(userRole);
  useEffect(() => {
    if (dbUser && isStaffUser) {
      router.push('/ops-console/dashboard');
    }
  }, [dbUser, isStaffUser, router]);

  const handleEditProfile = useCallback(() => setActiveTab('settings'), []);

  // Show loading skeleton while auth is resolving to prevent flashing
  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="h-[60px] lg:h-[64px]" />
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="h-7 w-48 bg-slate-200 rounded-lg" />
                <div className="h-4 w-32 bg-slate-100 rounded-lg mt-2" />
              </div>
              <div className="h-10 w-40 bg-slate-200 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl h-64" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="bg-white border border-slate-200 rounded-2xl h-24" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="h-[60px] lg:h-[64px]" />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
            <User className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-slate-900 font-black text-2xl mb-2">Sign in to your dashboard</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Track your reviews, saved products, notifications, and account settings.
          </p>
          <button onClick={() => router.push('/auth/login?return=/dashboard')}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 sm:px-6 py-3 rounded-xl transition-colors"
          >
            Sign In <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-slate-500 text-xs mt-4">
            Don&apos;t have an account?{' '}
            <button onClick={() => router.push('/auth/login')} className="text-amber-600 font-semibold hover:underline">Create one free</button>
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = (dbUser?.firstName ? [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ') : null) || dbUser?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarUrl = dbUser?.avatarUrl;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="h-[60px] lg:h-[64px]" />
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-slate-900 font-black text-xl sm:text-2xl">My Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back, <strong className="text-slate-700">{displayName.split(' ')[0]}</strong>
            </p>
          </div>
          {isVerifiedFounder ? (
            <Link href="/dashboard/founder">
              <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
                <BarChart3 className="w-4 h-4" /> Founder Dashboard
              </button>
            </Link>
          ) : isPendingFounder ? (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 font-semibold px-4 py-2.5 rounded-xl text-sm">
              <Clock className="w-4 h-4" /> Verification Pending
            </div>
          ) : (
            <Link href="/launchpad">
              <button className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
                <Rocket className="w-4 h-4" /> Launch Your Tool
              </button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1 lg:sticky lg:top-20">
              {/* Mobile: horizontal scroll tabs */}
              <div className="flex lg:hidden overflow-x-auto gap-1 pb-1" style={{ scrollbarWidth: 'none' }}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Desktop sidebar - hidden on mobile */}
              <div className="hidden lg:block px-3 py-3 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-slate-900 font-bold text-sm truncate">{displayName}</p>
                    <p className="text-slate-500 text-xs truncate">{dbUser?.headline || 'LaudStack Member'}</p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block space-y-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span className="flex-1">{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </button>
              ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile'       && <ProfileTab user={user} dbUser={dbUser} onEditProfile={handleEditProfile} />}
            {activeTab === 'reviews'       && <ReviewsTab />}
            {activeTab === 'saved'         && <SavedTab />}
            {activeTab === 'following'     && <FollowingTab />}
            {activeTab === 'purchases'     && <PurchasesTab />}
            {activeTab === 'offers'        && <OffersTab />}
            {activeTab === 'deals'         && <DealsTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'settings'      && <SettingsTab user={user} dbUser={dbUser} onProfileSaved={refetchDbUser} />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── Suspense wrapper required for useSearchParams ────────────────────────────
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
