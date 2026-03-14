"use client";
export const dynamic = 'force-dynamic';
/*
 * LaudStack — User Dashboard / Panel
 * Design: Clean white sidebar layout, amber accents, data-rich profile view
 * Tabs: Profile · My Reviews · Saved Products · Deals · Notifications · Settings
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Star, Bookmark, Settings, Bell, Shield,
  Edit3, Camera, CheckCircle, TrendingUp, MessageSquare, Heart,
  ExternalLink, Trash2, LogOut, Eye, EyeOff, Save, AlertCircle,
  ChevronRight, Award, Zap, Clock, Package, Mail, Lock,
  Globe, Twitter, Linkedin, Github, ArrowRight, BarChart3,
  ThumbsUp, Flag, RefreshCw, Info, Check, X, Rocket,
  Tag, ShoppingCart, FileText, Copy, Percent, Calendar,
  CreditCard, Gift, ChevronDown, Minus, Plus, Sparkles,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDbUser } from '@/hooks/useDbUser';
import { useSavedTools } from '@/hooks/useSavedTools';
import { useToolsData } from '@/hooks/useToolsData';
import { getUserReviews, updateProfile, getActiveDeals } from '@/app/actions/user';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'reviews' | 'saved' | 'notifications' | 'settings' | 'deals';

const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: 'profile',       label: 'My Profile',    icon: <User className="w-4 h-4" /> },
  { id: 'reviews',       label: 'My Reviews',    icon: <Star className="w-4 h-4" /> },
  { id: 'saved',         label: 'Saved Products',   icon: <Bookmark className="w-4 h-4" /> },
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

// ─── Mock data for tabs without DB tables yet ─────────────────────────────────
const MOCK_USER_TEMPLATES = [
  {
    id: 't1', name: 'SaaS Metrics Dashboard',
    description: 'Track MRR, churn, LTV, and growth metrics in one Notion workspace.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    category: 'Analytics', tool: 'Notion', purchasedAt: '2026-01-10', price: '$29',
    downloadUrl: '#', version: '2.1', lastUpdated: '2026-02-15',
  },
  {
    id: 't2', name: 'Content Calendar Pro',
    description: 'Plan, schedule, and track all your content across channels.',
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=250&fit=crop',
    category: 'Marketing', tool: 'Airtable', purchasedAt: '2026-02-05', price: '$19',
    downloadUrl: '#', version: '1.4', lastUpdated: '2026-01-28',
  },
  {
    id: 't3', name: 'Startup Fundraising Tracker',
    description: 'Manage investors, track conversations, and monitor your pipeline.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
    category: 'Finance', tool: 'Notion', purchasedAt: '2026-02-20', price: '$39',
    downloadUrl: '#', version: '3.0', lastUpdated: '2026-03-01',
  },
];

const MOCK_CART_ITEMS = [
  {
    id: 'c1', type: 'template' as const, name: 'Investor CRM Template',
    description: 'Track investor relationships, meetings, and follow-ups.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    category: 'CRM', tool: 'Notion', price: 29, originalPrice: 49, quantity: 1,
  },
  {
    id: 'c2', type: 'template' as const, name: 'Product Roadmap Planner',
    description: 'Plan sprints, features, and releases with a visual roadmap.',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
    category: 'Product', tool: 'Figma', price: 19, originalPrice: 19, quantity: 1,
  },
];

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
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">Sponsored</span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => (p - 1 + totalPages) % totalPages)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-medium">{page + 1}/{totalPages}</span>
            <button
              onClick={() => setPage(p => (p + 1) % totalPages)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
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
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{tool.tagline}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-slate-700">{(tool.average_rating || 0).toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-slate-400">{tool.review_count || 0} reviews</span>
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
        <div className="px-6 pb-6">
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
            <span className="flex items-center gap-1 text-xs text-slate-400">
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
            <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
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
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Public profile link */}
      {dbUser?.id && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-400" />
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
  const { tools: allTools } = useToolsData();
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserReviews()
      .then(r => { setUserReviews(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
        <Link href="/tools">
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
          <p className="text-slate-500 text-sm mb-4">Share your experience with tools you&apos;ve used.</p>
          <Link href="/tools">
            <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm transition-colors">
              Browse Products <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      ) : (
        userReviews.map((review: any) => {
          const tool = allTools.find((t: any) => t.id === review.toolId);
          return (
            <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0">
                    {tool?.logo_url ? (
                      <img src={tool.logo_url} alt={tool?.name || 'Tool'} className="w-full h-full object-contain" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-sm font-black text-slate-600">
                        {(tool?.name || 'T')[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <Link href={`/tools/${tool?.slug || ''}`} className="text-slate-900 font-bold text-sm hover:text-amber-600 transition-colors">
                      {tool?.name || 'Unknown Tool'}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRow rating={review.rating} />
                      <span className="text-xs text-slate-400">{review.rating}/5</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
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
        <Link href="/tools">
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
          <p className="text-slate-500 text-sm mb-4">Save tools you like to access them quickly later.</p>
          <Link href="/tools">
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
                    <button onClick={() => toggle(tool.id)} className="flex-shrink-0 p-1 text-amber-400 hover:text-slate-400 transition-colors" title="Remove from saved">
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">{tool.tagline}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-700">{(tool.average_rating || 0).toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-slate-400">{tool.review_count || 0} reviews</span>
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

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  // For now, notifications are empty until we wire a notifications table
  const [notifications, setNotifications] = useState<any[]>([]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 font-bold text-base">Notifications</h3>
          <p className="text-slate-500 text-xs mt-0.5">All caught up</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-slate-700 font-bold mb-1">No notifications</h4>
        <p className="text-slate-500 text-sm">You&apos;re all caught up! We&apos;ll notify you when something happens.</p>
      </div>

      {/* Notification preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h4 className="text-slate-900 font-bold text-sm mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500" />
          Notification Preferences
        </h4>
        <div className="space-y-3">
          {[
            { label: 'Founder replies to my reviews', defaultOn: true },
            { label: 'Saved tools go trending', defaultOn: true },
            { label: 'New deals on saved products', defaultOn: true },
            { label: 'Weekly digest email', defaultOn: true },
          ].map(({ label, defaultOn }) => (
            <NotifToggle key={label} label={label} defaultOn={defaultOn} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NotifToggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        onClick={() => { setOn(v => !v); toast.success(`${label} ${!on ? 'enabled' : 'disabled'}`); }}
        className="relative w-10 rounded-full transition-colors"
        style={{ height: '22px', backgroundColor: on ? '#F59E0B' : '#E2E8F0' }}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
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

  // Privacy toggles
  const [publicProfile, setPublicProfile] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

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
      setAvatarUrl(dbUser.avatarUrl || '');
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
        avatarUrl: avatarUrl || undefined,
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          Privacy & Visibility
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Public profile', desc: 'Allow others to view your profile page', state: publicProfile, setState: setPublicProfile },
            { label: 'Show my reviews publicly', desc: 'Display your reviews on tool pages', state: showReviews, setState: setShowReviews },
            { label: 'Email notifications', desc: 'Receive updates and digests via email', state: emailNotifs, setState: setEmailNotifs },
          ].map(({ label, desc, state, setState }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => { setState((v: boolean) => !v); toast.success(`${label} ${!state ? 'enabled' : 'disabled'}`); }}
                className="relative flex-shrink-0 w-10 rounded-full transition-colors mt-0.5"
                style={{ height: '22px', backgroundColor: state ? '#F59E0B' : '#E2E8F0' }}
              >
                <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{ transform: state ? 'translateX(20px)' : 'translateX(2px)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Password change */}
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
              <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-slate-900 text-sm font-semibold">Delete account</p>
              <p className="text-slate-500 text-xs">Permanently remove your account and all data</p>
            </div>
            <button onClick={() => toast.error('Account deletion requires contacting support')}
              className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold px-4 py-2 rounded-xl transition-colors text-sm border border-rose-200"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
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
      .then(d => { setDeals(d); setLoading(false); })
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
          <p className="text-slate-400 text-xs mt-1">Check back soon for exclusive offers from top SaaS tools.</p>
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

// ─── Templates Tab ─────────────────────────────────────────────────────────────
function TemplatesTab() {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-slate-900 font-bold text-base">My Templates</h3>
            <p className="text-slate-500 text-sm mt-0.5">Templates you&apos;ve purchased from LaudStack</p>
          </div>
          <a href="/templates" className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
            Browse More <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Templates Owned', value: MOCK_USER_TEMPLATES.length, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Total Spent', value: '$87', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Downloads Available', value: MOCK_USER_TEMPLATES.length, icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3 flex items-center gap-3`}>
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-slate-900 font-black text-lg leading-none">{value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_USER_TEMPLATES.map(template => (
          <div key={template.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-amber-200 hover:shadow-sm transition-all group">
            <div className="relative h-36 bg-slate-100 overflow-hidden">
              <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-bold bg-white/90 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">{template.category}</span>
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">v{template.version}</span>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-slate-900 font-bold text-sm">{template.name}</h4>
              <p className="text-slate-500 text-xs leading-relaxed mb-3">{template.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{template.tool}</span>
                  <span className="text-[10px] text-slate-400">Updated {new Date(template.lastUpdated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <button onClick={() => toast.info('Download coming soon — Stripe integration pending')}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Package className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">Explore more templates</p>
          <p className="text-white/60 text-xs mt-0.5">Notion, Airtable, Figma, and more</p>
        </div>
        <a href="/templates" className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm shrink-0">
          <FileText className="w-4 h-4" /> Browse Templates
        </a>
      </div>
    </div>
  );
}

// ─── Cart Tab ─────────────────────────────────────────────────────────────────
function CartTab() {
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item removed from cart');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoApplied(true);
      toast.success('Promo code applied! 10% off your order.');
    } else {
      toast.error('Invalid promo code. Try SAVE10 for 10% off.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 font-bold text-base">My Cart</h3>
          <p className="text-slate-500 text-sm mt-0.5">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
        </div>
        {cartItems.length > 0 && (
          <button onClick={() => { setCartItems([]); toast.success('Cart cleared'); }} className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-sm">Your cart is empty</p>
          <p className="text-slate-400 text-xs mt-1 mb-5">Browse templates and add them to your cart</p>
          <a href="/templates" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
            <FileText className="w-4 h-4" /> Browse Templates
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-4 hover:border-amber-200 transition-colors">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                  <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-slate-900 font-bold text-sm leading-tight">{item.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{item.description}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {item.originalPrice > item.price && <span className="text-xs text-slate-400 line-through">${item.originalPrice}</span>}
                      <span className="text-sm font-black text-slate-900">${item.price}</span>
                      {item.originalPrice > item.price && (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">Save ${item.originalPrice - item.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-24">
              <h4 className="text-slate-900 font-bold text-sm mb-4">Order Summary</h4>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-900 font-semibold">${subtotal}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-semibold flex items-center gap-1"><Gift className="w-3.5 h-3.5" /> Promo (SAVE10)</span>
                    <span className="text-green-600 font-bold">-${discount}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-2 flex justify-between">
                  <span className="text-slate-900 font-bold text-sm">Total</span>
                  <span className="text-slate-900 font-black text-base">${total}</span>
                </div>
              </div>
              {!promoApplied && (
                <div className="flex gap-2 mb-4">
                  <input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Promo code"
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-400 transition-colors"
                  />
                  <button onClick={handleApplyPromo} className="text-xs font-bold bg-slate-900 text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors">Apply</button>
                </div>
              )}
              <button onClick={() => toast.info('Checkout coming soon — Stripe integration pending')}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Checkout
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { tools: allTools, reviews: allReviews, loading: toolsLoading } = useToolsData();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { dbUser, loading: dbLoading, refetch: refetchDbUser } = useDbUser();
  const router = useRouter();

  const founderStatus = dbUser?.founderStatus ?? 'none';
  const isVerifiedFounder = founderStatus === 'verified';
  const isPendingFounder = founderStatus === 'pending';

  const handleEditProfile = useCallback(() => setActiveTab('settings'), []);

  // Show loading skeleton while auth is resolving to prevent flashing
  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div style={{ height: '72px' }} />
        <div className="max-w-[1300px] mx-auto px-4 py-8">
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
        <div style={{ height: '72px' }} />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
            <User className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-slate-900 font-black text-2xl mb-2">Sign in to your dashboard</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Track your reviews, saved products, notifications, and account settings.
          </p>
          <button onClick={() => router.push('/auth/login?return=/dashboard')}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Sign In <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-slate-400 text-xs mt-4">
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
      <div style={{ height: '72px' }} />
      <div className="max-w-[1300px] mx-auto px-4 py-8">
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
            <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1 lg:sticky lg:top-24">
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
