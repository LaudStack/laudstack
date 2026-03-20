"use client";
export const dynamic = 'force-dynamic';
/*
 * LaudStack — Founder Dashboard
 * All 7 tabs fully functional with real server actions
 * Tabs: Overview · My Products · Reviews (reply) · Deals · Analytics · Promote · Settings
 */
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import LogoWithFallback from '@/components/LogoWithFallback';
import {
  BarChart3, Star, MessageSquare, TrendingUp, Eye, ChevronRight,
  Settings, Zap, Bell, Shield, Edit3, ExternalLink, CheckCircle,
  AlertCircle, Clock, ArrowUpRight, ArrowDownRight, Users,
  Package, PlusCircle, Crown, Rocket, Tag, DollarSign,
  ThumbsUp, Reply, Check, X, Sparkles, Globe, MoreHorizontal,
  Trash2, Copy, RefreshCw, Save, Info, Award, TrendingDown,
  ChevronDown, ChevronUp, Flag, Layers, Target, Megaphone,
  Calendar, Link2, Image, FileText, ArrowRight, BarChart2,
  Activity, MousePointer, Heart, Share2, Mail, Lock, User, Loader2, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDbUser } from '@/hooks/useDbUser';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  getFounderTools,
  getFounderReviews,
  replyToReview,
  deleteReviewReply,
  getFounderDeals,
  createFounderDeal,
  toggleFounderDeal,
  deleteFounderDeal,
  getFounderAnalytics,
  updateFounderSettings,
  updateFounderTool,
  claimExistingTool,
  getFounderClaims,
  requestPromotion,
  requestToolVerification,
  flagReview,
} from '@/app/actions/founder';
import { searchToolsAction } from '@/app/actions/public';
import { getFounderLauds } from '@/app/actions/laud';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'tools' | 'reviews' | 'deals' | 'lauds' | 'analytics' | 'promote' | 'claims' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',  label: 'Overview',    icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'tools',     label: 'My Products',    icon: <Package className="w-4 h-4" /> },
  { id: 'reviews',   label: 'Reviews',     icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'deals',     label: 'Deals',       icon: <Tag className="w-4 h-4" /> },
  { id: 'lauds',     label: 'Lauds',       icon: <Heart className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics',   icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'promote',   label: 'Promote',     icon: <Megaphone className="w-4 h-4" /> },
  { id: 'claims',    label: 'Claim Tool',  icon: <Flag className="w-4 h-4" /> },
  { id: 'settings',  label: 'Settings',    icon: <Settings className="w-4 h-4" /> },
];

// ─── Loading spinner ─────────────────────────────────────────────────────────
function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-slate-500" />
      </div>
      <h3 className="text-slate-900 font-bold text-base mb-1">{title}</h3>
      <p className="text-slate-600 text-sm mb-5 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, change, changeLabel, accent = 'amber',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  accent?: 'amber' | 'blue' | 'green' | 'purple';
}) {
  const accentClasses = {
    amber: 'bg-amber-50 border-amber-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
  };
  const iconClasses = {
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className={`bg-white border rounded-2xl p-5 ${accentClasses[accent]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClasses[accent]}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-xs text-slate-600 font-medium mt-0.5">{label}</div>
      {changeLabel && <div className="text-xs text-slate-600 mt-0.5">{changeLabel}</div>}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ setActiveTab }: { setActiveTab: (tab: Tab) => void }) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFounderAnalytics(),
      getFounderReviews(),
      getFounderTools(),
    ]).then(([analyticsRes, reviewsRes, toolsRes]) => {
      if (analyticsRes.success) setAnalytics(analyticsRes);
      if (reviewsRes.success) setReviews(reviewsRes.reviews);
      if (toolsRes.success) setTools(toolsRes.tools);
    }).catch(err => {
      console.error('Failed to load overview:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState message="Loading overview..." />;

  const totalViews = tools.reduce((sum: number, t: any) => sum + (t.upvoteCount || 0) * 8, 0);
  const pendingReviews = reviews.filter((r: any) => !r.founderReply).length;

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Package className="w-4 h-4" />} label="Total Tools" value={analytics?.totalTools || 0} accent="blue" />
        <StatCard icon={<Star className="w-4 h-4" />} label="Avg Rating" value={analytics?.averageRating?.toFixed(1) || '0.0'} accent="amber" />
        <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Total Reviews" value={analytics?.totalReviews || 0} accent="green" />
        <StatCard icon={<ThumbsUp className="w-4 h-4" />} label="Total Lauds" value={analytics?.totalUpvotes || 0} accent="purple" />
      </div>

      {/* Tools summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-bold text-base">Your Stacks</h3>
          <Link href="/launchpad">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition-all">
              <PlusCircle className="w-3.5 h-3.5" />
              Add Product
            </button>
          </Link>
        </div>
        {tools.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 text-sm">No tools submitted yet.</p>
            <Link href="/launchpad">
              <button className="mt-3 text-xs font-bold text-amber-600 hover:text-amber-700">
                Launch your first tool →
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tools.slice(0, 5).map((tool: any) => (
              <div key={tool.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white overflow-hidden flex-shrink-0">
                  <LogoWithFallback src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-1" fallbackSize="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-bold text-sm truncate">{tool.name}</p>
                  <p className="text-slate-500 text-xs">{tool.category} · {tool.pricingModel}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm font-black text-slate-900">{tool.averageRating?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-slate-500">rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black text-slate-900">{tool.reviewCount || 0}</div>
                    <div className="text-xs text-slate-500">reviews</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    tool.status === 'approved' ? 'bg-green-100 text-green-700' :
                    tool.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {tool.status === 'approved' ? 'Live' : tool.status === 'pending' ? 'Pending' : 'Rejected'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent reviews */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-bold text-base">Recent Reviews</h3>
          <button
            onClick={() => setActiveTab('reviews')}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700"
          >
            View all →
          </button>
        </div>
        {reviews.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">No reviews yet on your stacks.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 3).map((review: any) => (
              <div key={review.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-600 flex-shrink-0">
                  {review.userName?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-slate-900">{review.userName || 'Anonymous'}</span>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">on {review.toolName}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{review.body}</p>
                </div>
                {!review.founderReply && (
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="flex-shrink-0 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    Reply
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deals summary */}
      {analytics && analytics.totalDeals > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold text-base">Deals Summary</h3>
            <button onClick={() => setActiveTab('deals')} className="text-xs font-semibold text-amber-600 hover:text-amber-700">
              Manage →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-slate-900">{analytics.totalDeals}</div>
              <div className="text-xs text-slate-500">Active Deals</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-slate-900">{analytics.totalDealClaims}</div>
              <div className="text-xs text-slate-500">Total Claims</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tools Tab ────────────────────────────────────────────────────────────────
function ToolsTab({ setActiveTab }: { setActiveTab: (tab: Tab) => void }) {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const loadTools = useCallback(async () => {
    try {
      const res = await getFounderTools();
      if (res.success) setTools(res.tools);
    } catch (err) {
      console.error('Failed to load tools:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTools(); }, [loadTools]);

  const handleSaveEdit = async (toolId: number) => {
    setSaving(true);
    const res = await updateFounderTool(toolId, editData);
    setSaving(false);
    if (res.success) {
      toast.success('Tool updated successfully!');
      setEditingTool(null);
      setEditData({});
      loadTools();
    } else {
      toast.error(res.error || 'Failed to update tool');
    }
  };

  if (loading) return <LoadingState message="Loading your stacks..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 font-bold text-base">My Products</h3>
          <p className="text-slate-500 text-xs mt-0.5">{tools.length} tool{tools.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Link href="/launchpad">
          <button className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
            <PlusCircle className="w-4 h-4" />
            Launch New Tool
          </button>
        </Link>
      </div>

      {tools.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No tools yet"
          description="Launch your first tool on LaudStack and start building your presence."
          action={
            <Link href="/launchpad">
              <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
                <Rocket className="w-4 h-4" /> Launch Product
              </button>
            </Link>
          }
        />
      ) : (
        tools.map((tool: any) => (
          <div key={tool.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-all">
            {/* Tool header */}
            <div className="flex items-start gap-4 p-5">
              <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0">
                <LogoWithFallback src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-1" fallbackSize="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-slate-900 font-black text-base">{tool.name}</h4>
                      {tool.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {tool.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      )}
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        tool.status === 'approved' ? 'bg-green-100 text-green-700' :
                        tool.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {tool.status === 'approved' ? 'Live' : tool.status === 'pending' ? 'Pending Review' : 'Rejected'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm">{tool.tagline}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{tool.category}</span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{tool.pricingModel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        if (editingTool === tool.id) {
                          setEditingTool(null);
                          setEditData({});
                        } else {
                          setEditingTool(tool.id);
                          setEditData({
                            tagline: tool.tagline,
                            description: tool.description,
                            websiteUrl: tool.websiteUrl,
                            features: tool.features ?? [],
                            pricingTiers: tool.pricingTiers ?? [],
                          });
                        }
                      }}
                      className={`p-2 rounded-lg transition-all ${editingTool === tool.id ? 'text-amber-600 bg-amber-50' : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'}`}
                      title="Edit tool"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Visit site"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit form */}
            {editingTool === tool.id && (
              <div className="px-5 pb-4 space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Tagline</label>
                    <input
                      type="text"
                      value={editData.tagline || ''}
                      onChange={e => setEditData((prev: any) => ({ ...prev, tagline: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Description</label>
                    <textarea
                      value={editData.description || ''}
                      onChange={e => setEditData((prev: any) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Website URL</label>
                    <input
                      type="url"
                      value={editData.websiteUrl || ''}
                      onChange={e => setEditData((prev: any) => ({ ...prev, websiteUrl: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                    />
                  </div>

                  {/* Features Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Key Features</label>
                      <button
                        type="button"
                        onClick={() => setEditData((prev: any) => ({ ...prev, features: [...(prev.features || []), { icon: '\u26a1', title: '', description: '' }] }))}
                        className="text-[11px] font-semibold text-amber-700 hover:text-amber-800"
                      >
                        + Add Feature
                      </button>
                    </div>
                    {(editData.features || []).map((feat: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 mb-2 bg-white border border-slate-200 rounded-lg p-2">
                        <input
                          value={feat.icon}
                          onChange={e => {
                            const updated = [...(editData.features || [])];
                            updated[i] = { ...updated[i], icon: e.target.value };
                            setEditData((prev: any) => ({ ...prev, features: updated }));
                          }}
                          className="w-10 text-center border border-slate-200 rounded px-1 py-1 text-sm"
                          placeholder="\u26a1"
                        />
                        <input
                          value={feat.title}
                          onChange={e => {
                            const updated = [...(editData.features || [])];
                            updated[i] = { ...updated[i], title: e.target.value };
                            setEditData((prev: any) => ({ ...prev, features: updated }));
                          }}
                          className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm"
                          placeholder="Feature title"
                        />
                        <input
                          value={feat.description}
                          onChange={e => {
                            const updated = [...(editData.features || [])];
                            updated[i] = { ...updated[i], description: e.target.value };
                            setEditData((prev: any) => ({ ...prev, features: updated }));
                          }}
                          className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm"
                          placeholder="Description"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editData.features || []).filter((_: any, j: number) => j !== i);
                            setEditData((prev: any) => ({ ...prev, features: updated }));
                          }}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(editData.features || []).length === 0 && (
                      <p className="text-xs text-slate-500 py-2">No features defined yet. Add features to showcase your tool.</p>
                    )}
                  </div>

                  {/* Pricing Tiers Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Pricing Tiers</label>
                      <button
                        type="button"
                        onClick={() => setEditData((prev: any) => ({ ...prev, pricingTiers: [...(prev.pricingTiers || []), { name: '', price: '', description: '', features: [], cta: 'Get Started' }] }))}
                        className="text-[11px] font-semibold text-amber-700 hover:text-amber-800"
                      >
                        + Add Tier
                      </button>
                    </div>
                    {(editData.pricingTiers || []).map((tier: any, i: number) => (
                      <div key={i} className="mb-2 bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <input
                            value={tier.name}
                            onChange={e => {
                              const updated = [...(editData.pricingTiers || [])];
                              updated[i] = { ...updated[i], name: e.target.value };
                              setEditData((prev: any) => ({ ...prev, pricingTiers: updated }));
                            }}
                            className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm"
                            placeholder="Tier name (e.g. Pro)"
                          />
                          <input
                            value={tier.price}
                            onChange={e => {
                              const updated = [...(editData.pricingTiers || [])];
                              updated[i] = { ...updated[i], price: e.target.value };
                              setEditData((prev: any) => ({ ...prev, pricingTiers: updated }));
                            }}
                            className="w-28 border border-slate-200 rounded px-2 py-1 text-sm"
                            placeholder="$29/mo"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (editData.pricingTiers || []).filter((_: any, j: number) => j !== i);
                              setEditData((prev: any) => ({ ...prev, pricingTiers: updated }));
                            }}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          value={tier.description}
                          onChange={e => {
                            const updated = [...(editData.pricingTiers || [])];
                            updated[i] = { ...updated[i], description: e.target.value };
                            setEditData((prev: any) => ({ ...prev, pricingTiers: updated }));
                          }}
                          className="w-full border border-slate-200 rounded px-2 py-1 text-sm"
                          placeholder="Tier description"
                        />
                        <textarea
                          value={(tier.features || []).join('\n')}
                          onChange={e => {
                            const updated = [...(editData.pricingTiers || [])];
                            updated[i] = { ...updated[i], features: e.target.value.split('\n').filter((f: string) => f.trim()) };
                            setEditData((prev: any) => ({ ...prev, pricingTiers: updated }));
                          }}
                          rows={3}
                          className="w-full border border-slate-200 rounded px-2 py-1 text-sm resize-none font-mono"
                          placeholder="Feature 1\nFeature 2\nFeature 3"
                        />
                        <label className="flex items-center gap-2 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={tier.highlighted ?? false}
                            onChange={e => {
                              const updated = [...(editData.pricingTiers || [])];
                              updated[i] = { ...updated[i], highlighted: e.target.checked };
                              setEditData((prev: any) => ({ ...prev, pricingTiers: updated }));
                            }}
                            className="rounded border-slate-300"
                          />
                          Highlight as recommended
                        </label>
                      </div>
                    ))}
                    {(editData.pricingTiers || []).length === 0 && (
                      <p className="text-xs text-slate-500 py-2">No pricing tiers defined yet. Add tiers to display pricing on your tool page.</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSaveEdit(tool.id)}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-xl transition-all"
                    >
                      {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
                    </button>
                    <button
                      onClick={() => { setEditingTool(null); setEditData({}); }}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-100">
              {[
                { label: 'Upvotes', value: tool.upvoteCount || 0, icon: <ThumbsUp className="w-3.5 h-3.5 text-blue-500" /> },
                { label: 'Rating', value: tool.averageRating?.toFixed(1) || '0.0', icon: <Star className="w-3.5 h-3.5 text-amber-500" /> },
                { label: 'Reviews', value: tool.reviewCount || 0, icon: <MessageSquare className="w-3.5 h-3.5 text-green-500" /> },
                { label: 'Rank Δ', value: tool.weeklyRankChange > 0 ? `+${tool.weeklyRankChange}` : tool.weeklyRankChange || '—', icon: <TrendingUp className="w-3.5 h-3.5 text-purple-500" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex flex-col items-center justify-center py-3 border-r border-slate-100 last:border-r-0">
                  <div className="flex items-center gap-1 mb-0.5">{icon}</div>
                  <div className="text-sm font-black text-slate-900">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-t border-slate-100">
              <Link href={`/tools/${tool.slug}`} className="flex-1">
                <button className="w-full text-xs font-semibold text-slate-600 hover:text-amber-600 py-2 rounded-lg hover:bg-amber-50 transition-all">
                  View Public Page
                </button>
              </Link>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/tools/${tool.slug}`);
                  toast.success('Link copied!');
                }}
                className="flex-1 text-xs font-semibold text-slate-600 hover:text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy Link
              </button>
            </div>
          </div>
        ))
      )}

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 text-slate-900" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">Upgrade to Pro Listing</h3>
            <p className="text-slate-600 text-sm mb-4">Get priority review, featured placement, verified badge, advanced analytics, and dedicated support for your stacks.</p>
            <button
              onClick={() => setActiveTab('promote')}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Rocket className="w-4 h-4" /> Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reviews Tab (with real reply feature) ──────────────────────────────────
function ReviewsTab() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied' | 'flagged'>('all');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      const res = await getFounderReviews();
      if (res.success) setReviews(res.reviews);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const pendingCount = reviews.filter((r: any) => !r.founderReply).length;

  const handleSubmitReply = async (reviewId: number) => {
    if (!replyText.trim()) { toast.error('Please write a reply'); return; }
    setSubmitting(true);
    const res = await replyToReview(reviewId, replyText);
    setSubmitting(false);
    if (res.success) {
      toast.success('Reply posted successfully!');
      setReplyingTo(null);
      setReplyText('');
      loadReviews();
    } else {
      toast.error(res.error || 'Failed to post reply');
    }
  };

  const handleDeleteReply = async (reviewId: number) => {
    const res = await deleteReviewReply(reviewId);
    if (res.success) {
      toast.success('Reply deleted');
      loadReviews();
    } else {
      toast.error(res.error || 'Failed to delete reply');
    }
  };

  const [flaggingId, setFlaggingId] = useState<number | null>(null);
  const [flagReason, setFlagReason] = useState('');

  const handleFlagReview = async (reviewId: number) => {
    if (!flagReason.trim()) { toast.error('Please provide a reason for flagging'); return; }
    const res = await flagReview(reviewId, flagReason.trim());
    if (res.success) {
      toast.success('Review flagged for moderation');
      setFlaggingId(null);
      setFlagReason('');
      loadReviews();
    } else {
      toast.error(res.error || 'Failed to flag review');
    }
  };

  const filteredReviews = reviews.filter((r: any) => {
    if (filter === 'pending') return !r.founderReply;
    if (filter === 'replied') return !!r.founderReply;
    if (filter === 'flagged') return r.isFlagged;
    return true;
  });

  const flaggedCount = reviews.filter((r: any) => r.isFlagged).length;

  if (loading) return <LoadingState message="Loading reviews..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 font-bold text-base">Reviews</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {reviews.length === 0 ? 'No reviews yet' : pendingCount > 0 ? (
              <span className="text-amber-600 font-semibold">{pendingCount} awaiting reply</span>
            ) : 'All reviews replied to'}
          </p>
        </div>
        {reviews.length > 0 && (
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {(['all', 'pending', 'replied', 'flagged'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                  filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f}
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-400 text-slate-900 text-xs font-black px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
                {f === 'flagged' && flaggedCount > 0 && (
                  <span className="ml-1.5 bg-red-400 text-white text-xs font-black px-1.5 py-0.5 rounded-full">
                    {flaggedCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="Once users review your stacks, they'll appear here for you to respond to."
        />
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">All caught up!</p>
          <p className="text-slate-500 text-sm mt-1">No {filter} reviews to show.</p>
        </div>
      ) : (
        filteredReviews.map((review: any) => {
          const isReplying = replyingTo === review.id;

          return (
            <div key={review.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-all">
              <div className="p-5">
                {/* Review header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-black text-slate-600 flex-shrink-0">
                    {review.userAvatar ? (
                      <img src={review.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      review.userName?.[0] || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{review.userName || 'Anonymous'}</span>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-slate-500">on <strong>{review.toolName}</strong></span>
                    </div>
                  </div>
                </div>

                {review.title && <h4 className="text-slate-900 font-semibold text-sm mb-1">{review.title}</h4>}
                <p className="text-slate-600 text-sm leading-relaxed">{review.body}</p>

                {review.pros && (
                  <div className="mt-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <strong>Pros:</strong> {review.pros}
                  </div>
                )}
                {review.cons && (
                  <div className="mt-1 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
                    <strong>Cons:</strong> {review.cons}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {review.helpfulCount || 0} helpful
                  </div>
                  {!isReplying && (
                    <div className="ml-auto flex items-center gap-2">
                      {!review.isFlagged && (
                        <button
                          onClick={() => { setFlaggingId(review.id); setFlagReason(''); }}
                          className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          Flag
                        </button>
                      )}
                      {review.isFlagged && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                          <Flag className="w-3.5 h-3.5" /> Flagged
                        </span>
                      )}
                      <button
                        onClick={() => { setReplyingTo(review.id); setReplyText(review.founderReply || ''); }}
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        {review.founderReply ? 'Edit Reply' : 'Reply'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Existing reply */}
              {review.founderReply && !isReplying && (
                <div className="mx-5 mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" /> Your Response
                    </p>
                    <button
                      onClick={() => handleDeleteReply(review.id)}
                      className="text-xs text-blue-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">{review.founderReply}</p>
                  {review.founderReplyAt && (
                    <p className="text-xs text-blue-400 mt-1">
                      Replied {new Date(review.founderReplyAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Flag form */}
              {flaggingId === review.id && (
                <div className="mx-5 mb-5 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1.5">
                    <Flag className="w-3 h-3" /> Flag this review for moderation
                  </p>
                  <textarea
                    value={flagReason}
                    onChange={e => setFlagReason(e.target.value)}
                    placeholder="Describe why this review should be flagged (spam, fake, abusive, etc.)..."
                    rows={3}
                    className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all resize-none bg-white"
                  />
                  <div className="flex items-center justify-end mt-3 gap-2">
                    <button
                      onClick={() => { setFlaggingId(null); setFlagReason(''); }}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleFlagReview(review.id)}
                      disabled={!flagReason.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition-all"
                    >
                      <Flag className="w-3.5 h-3.5" /> Submit Flag
                    </button>
                  </div>
                </div>
              )}

              {/* Reply form */}
              {isReplying && (
                <div className="mx-5 mb-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                    <Reply className="w-3 h-3" /> Write your response
                  </p>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Thank the reviewer, address their feedback, or share updates..."
                    rows={4}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none bg-white"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-slate-500">{replyText.length}/500 characters</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                        className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReply(review.id)}
                        disabled={submitting || !replyText.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-xl transition-all"
                      >
                        {submitting ? (
                          <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Posting…</>
                        ) : (
                          <><Check className="w-3.5 h-3.5" /> Post Reply</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Deals Tab ────────────────────────────────────────────────────────────────
function DealsTab() {
  const [deals, setDeals] = useState<any[]>([]);
  const [founderTools, setFounderTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newDeal, setNewDeal] = useState({
    toolId: '',
    title: '',
    description: '',
    dealType: 'discount' as string,
    discountPercent: '',
    originalPrice: '',
    dealPrice: '',
    couponCode: '',
    dealUrl: '',
    expiresAt: '',
    maxClaims: '100',
  });

  const loadDeals = useCallback(async () => {
    try {
      const res = await getFounderDeals();
      if (res.success) {
        setDeals(res.deals);
        setFounderTools(res.tools || []);
        if (res.tools && res.tools.length > 0 && !newDeal.toolId) {
          setNewDeal(prev => ({ ...prev, toolId: String(res.tools![0].id) }));
        }
      }
    } catch (err) {
      console.error('Failed to load deals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDeals(); }, [loadDeals]);

  const handleCreateDeal = async () => {
    if (!newDeal.title || !newDeal.couponCode) {
      toast.error('Please fill in title and coupon code');
      return;
    }
    setCreating(true);
    const res = await createFounderDeal({
      toolId: parseInt(newDeal.toolId),
      title: newDeal.title,
      description: newDeal.description,
      dealType: newDeal.dealType as "discount" | "lifetime" | "free_trial" | "exclusive",
      discountPercent: newDeal.discountPercent ? parseInt(newDeal.discountPercent) : undefined,
      originalPrice: newDeal.originalPrice || undefined,
      dealPrice: newDeal.dealPrice || undefined,
      couponCode: newDeal.couponCode,
      dealUrl: newDeal.dealUrl || undefined,
      expiresAt: newDeal.expiresAt || undefined,
      maxClaims: newDeal.maxClaims ? parseInt(newDeal.maxClaims) : undefined,
    });
    setCreating(false);
    if (res.success) {
      toast.success('Deal submitted for review! It will go live once approved by the LaudStack team.');
      setShowCreateModal(false);
      setNewDeal({ toolId: founderTools[0]?.id ? String(founderTools[0].id) : '', title: '', description: '', dealType: 'discount', discountPercent: '', originalPrice: '', dealPrice: '', couponCode: '', dealUrl: '', expiresAt: '', maxClaims: '100' });
      loadDeals();
    } else {
      toast.error(res.error || 'Failed to create deal');
    }
  };

  const handleToggleDeal = async (dealId: number) => {
    const res = await toggleFounderDeal(dealId);
    if (res.success) {
      toast.success(`Deal ${res.isActive ? 'activated' : 'deactivated'}`);
      loadDeals();
    } else {
      toast.error(res.error || 'Failed to update deal');
    }
  };

  const handleDeleteDeal = async (dealId: number) => {
    const res = await deleteFounderDeal(dealId);
    if (res.success) {
      toast.success('Deal deleted');
      loadDeals();
    } else {
      toast.error(res.error || 'Failed to delete deal');
    }
  };

  if (loading) return <LoadingState message="Loading deals..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 font-bold text-base">Deals & Offers</h3>
          <p className="text-slate-500 text-xs mt-0.5">{deals.filter((d: any) => d.isActive).length} active deal{deals.filter((d: any) => d.isActive).length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => {
            if (founderTools.length === 0) {
              toast.error('Launch a product first before creating deals');
              return;
            }
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" /> Create Deal
        </button>
      </div>

      {/* Create deal modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-slate-900 font-bold text-base">Create New Deal</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-500 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Approval notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Deals are submitted for review. Once approved by the LaudStack team, they will go live automatically.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Tool</label>
                <select
                  value={newDeal.toolId}
                  onChange={e => setNewDeal(prev => ({ ...prev, toolId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
                >
                  {founderTools.map((t: any) => (
                    <option key={t.id} value={String(t.id)}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Deal Title *</label>
                  <input
                    type="text"
                    value={newDeal.title}
                    onChange={e => setNewDeal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. 40% off Annual Plan"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Deal Type</label>
                  <select
                    value={newDeal.dealType}
                    onChange={e => setNewDeal(prev => ({ ...prev, dealType: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
                  >
                    <option value="discount">Discount</option>
                    <option value="lifetime">Lifetime Deal</option>
                    <option value="free_trial">Free Trial</option>
                    <option value="exclusive">Exclusive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  value={newDeal.description}
                  onChange={e => setNewDeal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the deal..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newDeal.discountPercent}
                    onChange={e => setNewDeal(prev => ({ ...prev, discountPercent: e.target.value }))}
                    placeholder="40"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Original Price</label>
                  <input
                    type="text"
                    value={newDeal.originalPrice}
                    onChange={e => setNewDeal(prev => ({ ...prev, originalPrice: e.target.value }))}
                    placeholder="$99/mo"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Deal Price</label>
                  <input
                    type="text"
                    value={newDeal.dealPrice}
                    onChange={e => setNewDeal(prev => ({ ...prev, dealPrice: e.target.value }))}
                    placeholder="$49/mo"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Coupon Code *</label>
                  <input
                    type="text"
                    value={newDeal.couponCode}
                    onChange={e => setNewDeal(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                    placeholder="SAVE40"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Deal URL</label>
                  <input
                    type="url"
                    value={newDeal.dealUrl}
                    onChange={e => setNewDeal(prev => ({ ...prev, dealUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Expires</label>
                  <input
                    type="date"
                    value={newDeal.expiresAt}
                    onChange={e => setNewDeal(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Max Claims</label>
                  <input
                    type="number"
                    min="1"
                    value={newDeal.maxClaims}
                    onChange={e => setNewDeal(prev => ({ ...prev, maxClaims: e.target.value }))}
                    placeholder="100"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeal}
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-xl transition-all"
              >
                {creating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating…</> : <><Check className="w-4 h-4" /> Create Deal</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {deals.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No deals yet"
          description="Create exclusive deals and discounts for your stacks to attract more users."
          action={founderTools.length > 0 ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <PlusCircle className="w-4 h-4" /> Create Your First Deal
            </button>
          ) : (
            <Link href="/launchpad">
              <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
                <Rocket className="w-4 h-4" /> Launch a Product First
              </button>
            </Link>
          )}
        />
      ) : (
        deals.map((deal: any) => (
          <div key={deal.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-all">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-slate-900 font-bold text-sm">{deal.title}</h4>
                    {/* Approval status badge */}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      deal.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                      deal.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {deal.approvalStatus === 'approved' ? (deal.isActive ? 'Live' : 'Approved (Inactive)') :
                       deal.approvalStatus === 'pending' ? 'Pending Review' : 'Rejected'}
                    </span>
                    {/* Deal type badge */}
                    {deal.dealType && deal.dealType !== 'discount' && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        deal.dealType === 'lifetime' ? 'bg-purple-100 text-purple-700' :
                        deal.dealType === 'free_trial' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {deal.dealType === 'lifetime' ? 'Lifetime' : deal.dealType === 'free_trial' ? 'Free Trial' : 'Exclusive'}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs">{deal.toolName}</p>
                  {deal.description && <p className="text-slate-600 text-sm mt-1">{deal.description}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleDeal(deal.id)}
                    className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                    title={deal.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDeal(deal.id)}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete deal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Deal details */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {deal.couponCode && (
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
                    <span className="text-xs font-mono font-bold text-slate-700">{deal.couponCode}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(deal.couponCode); toast.success('Code copied!'); }}
                      className="text-slate-500 hover:text-slate-600 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {deal.discountPercent && (
                  <span className="text-sm font-black text-amber-600">{deal.discountPercent}% off</span>
                )}
                {deal.originalPrice && deal.dealPrice && (
                  <span className="text-sm font-semibold text-green-600">
                    <span className="line-through text-slate-500 mr-1">{deal.originalPrice}</span>
                    {deal.dealPrice}
                  </span>
                )}
                {deal.expiresAt && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    Expires {new Date(deal.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              {/* Usage bar */}
              {deal.maxClaims && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">{deal.claimCount || 0} / {deal.maxClaims} claims</span>
                    <span className="text-xs font-bold text-slate-700">{Math.round(((deal.claimCount || 0) / deal.maxClaims) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${Math.min(((deal.claimCount || 0) / deal.maxClaims) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Placement upgrade section — only for approved deals */}
              {deal.approvalStatus === 'approved' && (
                <DealPlacementUpgrade deal={deal} />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Deal Placement Upgrade Component ─────────────────────────────────────────────────────
const DEAL_PROMO_TYPE_ICONS: Record<string, React.ElementType> = {
  deal_pinned: TrendingUp,
  deal_featured: Star,
  deal_of_day: Crown,
};

function DealPlacementUpgrade({ deal }: { deal: any }) {
  const [expanded, setExpanded] = useState(false);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [dealPricingPlans, setDealPricingPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [slotDate, setSlotDate] = useState('');

  const hasActivePlacement = deal.placement && deal.placement !== 'none' && deal.placementExpiresAt && new Date(deal.placementExpiresAt) > new Date();

  // Load dynamic pricing from DB when expanded
  useEffect(() => {
    if (expanded && dealPricingPlans.length === 0) {
      setLoadingPlans(true);
      import('@/app/actions/promotions').then(mod => {
        mod.getActivePricingForTarget('deal').then(plans => {
          setDealPricingPlans(plans);
        }).catch(err => console.error('Failed to load deal pricing:', err))
        .finally(() => setLoadingPlans(false));
      });
    }
  }, [expanded, dealPricingPlans.length]);

  const handlePurchase = async (pricingId: number, promoType: string) => {
    if (promoType === 'deal_of_day' && !slotDate) {
      toast.error('Please select a date for Deal of the Day');
      return;
    }
    setPurchasing(pricingId);
    try {
      const res = await fetch('/api/stripe/promotion-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricingId,
          entityId: deal.id,
          ...(promoType === 'deal_of_day' && slotDate ? { slotDate } : {}),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to create checkout session');
      }
    } catch {
      toast.error('Failed to initiate payment');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      {hasActivePlacement ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <Crown className="w-4 h-4 text-green-600" />
          <span className="text-xs font-bold text-green-700">
            Active: {deal.placement === 'deal_of_day' ? 'Deal of the Day' : deal.placement === 'featured' ? 'Featured' : 'Pinned'}
          </span>
          <span className="text-xs text-green-600 ml-auto">
            Expires {new Date(deal.placementExpiresAt).toLocaleDateString()}
          </span>
        </div>
      ) : (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <Megaphone className="w-3.5 h-3.5" />
            {expanded ? 'Hide' : 'Boost'} Deal Visibility
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {expanded && (
            <div className="mt-3">
              {loadingPlans ? (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span className="text-xs text-slate-500">Loading promotion plans...</span>
                </div>
              ) : dealPricingPlans.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-500">Deal promotion plans coming soon. Check back shortly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dealPricingPlans.map(plan => {
                    const Icon = DEAL_PROMO_TYPE_ICONS[plan.promotionType] || Star;
                    const isActive = purchasing === plan.id;
                    const isDotd = plan.promotionType === 'deal_of_day';
                    return (
                      <div key={plan.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 hover:border-amber-300 transition-all">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs font-bold text-slate-900">{plan.displayName}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                          {plan.description || `${plan.durationDays} days of ${plan.promotionType.replace(/_/g, ' ')} visibility`}
                        </p>
                        {isDotd && (
                          <div className="mb-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Date</label>
                            <input
                              type="date"
                              value={slotDate}
                              onChange={(e) => setSlotDate(e.target.value)}
                              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-black text-slate-900">${(plan.priceInCents / 100).toFixed(0)}</span>
                            <span className="text-xs text-slate-500 ml-1">/ {plan.durationDays}d</span>
                          </div>
                          <button
                            onClick={() => handlePurchase(plan.id, plan.promotionType)}
                            disabled={!!purchasing}
                            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 transition-all disabled:opacity-60"
                          >
                            {isActive ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Upgrade'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────────
function AnalyticsTab() {  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFounderAnalytics().then(res => {
      if (res.success) setAnalytics(res);
    }).catch(err => {
      console.error('Failed to load analytics:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState message="Loading analytics..." />;

  if (!analytics || analytics.totalTools === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No analytics data"
        description="Launch your first tool to start tracking performance metrics."
        action={
          <Link href="/launchpad">
            <button className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <Rocket className="w-4 h-4" /> Launch Product
            </button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Package className="w-4 h-4" />} label="Total Tools" value={analytics.totalTools} accent="blue" />
        <StatCard icon={<Star className="w-4 h-4" />} label="Avg Rating" value={analytics.averageRating?.toFixed(1) || '0.0'} accent="amber" />
        <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Total Reviews" value={analytics.totalReviews} accent="green" />
        <StatCard icon={<ThumbsUp className="w-4 h-4" />} label="Total Lauds" value={analytics.totalUpvotes} accent="purple" />
        <StatCard icon={<Eye className="w-4 h-4" />} label="Total Views" value={analytics.totalViews || 0} accent="blue" />
        <StatCard icon={<MousePointer className="w-4 h-4" />} label="Outbound Clicks" value={analytics.totalClicks || 0} accent="green" />
      </div>

      {/* Deal stats */}
      {analytics.totalDeals > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-slate-600 font-medium">Active Deals</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{analytics.totalDeals}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-xs text-slate-600 font-medium">Total Claims</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{analytics.totalDealClaims}</div>
          </div>
        </div>
      )}

      {/* Per-tool breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold text-base mb-4">Tool Performance Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide pb-3 pr-4">Tool</th>
                <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide pb-3 px-3">Status</th>
                <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide pb-3 px-3">Rating</th>
                <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide pb-3 px-3">Reviews</th>
                <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide pb-3 px-3">Lauds</th>
                <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide pb-3 px-3">Views</th>
                <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide pb-3 px-3">Clicks</th>
                <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wide pb-3 pl-3">Rank Δ</th>
              </tr>
            </thead>
            <tbody>
              {analytics.tools.map((tool: any) => (
                <tr key={tool.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white overflow-hidden flex-shrink-0">
                        {tool.logoUrl ? (
                          <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-0.5" />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-xs font-black text-slate-600">{tool.name[0]}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/tools/${tool.slug}`} className="text-sm font-bold text-slate-900 hover:text-amber-600 truncate block">
                          {tool.name}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      tool.status === 'approved' ? 'bg-green-100 text-green-700' :
                      tool.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {tool.status === 'approved' ? 'Live' : tool.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900">{tool.averageRating?.toFixed(1) || '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">{tool.reviewCount || 0}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">{tool.upvoteCount || 0}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">{tool.viewCount || 0}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">{tool.outboundClickCount || 0}</td>
                  <td className="py-3 pl-3 text-center">
                    {tool.weeklyRankChange !== null && tool.weeklyRankChange !== 0 ? (
                      <span className={`text-xs font-bold ${tool.weeklyRankChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tool.weeklyRankChange > 0 ? '+' : ''}{tool.weeklyRankChange}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Promote Tab (Dynamic Pricing from DB) ─────────────────────────────────
const PROMO_TYPE_ICONS: Record<string, React.ElementType> = {
  stack_featured: Sparkles,
  stack_spotlight: Crown,
  stack_category_boost: TrendingUp,
  deal_pinned: Target,
  deal_featured: Star,
  deal_of_day: Calendar,
  marketplace_boost: Zap,
  marketplace_spotlight: Crown,
};
const PROMO_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active:          { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  scheduled:       { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  paid:            { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  pending_payment: { bg: 'bg-slate-50',   text: 'text-slate-600',   dot: 'bg-slate-400' },
  expired:         { bg: 'bg-slate-50',   text: 'text-slate-500',   dot: 'bg-slate-300' },
  cancelled:       { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400' },
  paused:          { bg: 'bg-orange-50',  text: 'text-orange-600',  dot: 'bg-orange-400' },
  failed:          { bg: 'bg-red-50',     text: 'text-red-500',     dot: 'bg-red-400' },
};

function PromoteTab() {
  const [founderTools, setFounderTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<number | null>(null);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [myPromotions, setMyPromotions] = useState<any[]>([]);
  const [promoMessage, setPromoMessage] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [requestedTypes, setRequestedTypes] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const { dbUser } = useDbUser();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams?.get('payment') ?? null;

  useEffect(() => {
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Your promotion is now being activated.');
    } else if (paymentStatus === 'cancelled') {
      toast.info('Payment was cancelled. You can try again anytime.');
    }
  }, [paymentStatus]);

  // Load founder tools
  useEffect(() => {
    getFounderTools().then(res => {
      if (res.success) {
        setFounderTools(res.tools);
        if (res.tools.length > 0) setSelectedTool(res.tools[0].id);
      }
    }).catch(err => {
      console.error('Failed to load tools for promote:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Load dynamic pricing from DB
  useEffect(() => {
    import('@/app/actions/promotions').then(mod => {
      mod.getActivePricingForTarget('stack').then(plans => {
        setPricingPlans(plans);
      }).catch(err => console.error('Failed to load pricing:', err));
    });
  }, []);

  // Load user's promotions
  useEffect(() => {
    if (dbUser?.id) {
      import('@/app/actions/promotions').then(mod => {
        mod.getMyPromotions(dbUser.id).then(promos => {
          setMyPromotions(promos);
        }).catch(err => console.error('Failed to load promotions:', err));
      });
    }
  }, [dbUser?.id, paymentStatus]);

  const handlePurchasePromotion = async (pricingId: number) => {
    if (!selectedTool) { toast.error('Please select a tool first'); return; }
    setPurchasing(pricingId);
    try {
      const res = await fetch('/api/stripe/promotion-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricingId, entityId: selectedTool }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to create checkout session');
      }
    } catch {
      toast.error('Failed to initiate payment');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRequestPromotion = async (type: 'sponsored' | 'newsletter') => {
    if (!selectedTool) { toast.error('Please select a tool first'); return; }
    setSubmitting(type);
    try {
      const result = await requestPromotion({ toolId: selectedTool, promotionType: type, message: promoMessage || `Requesting ${type} promotion` });
      if (result.success) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} promotion request submitted! Our team will review it within 24-48 hours.`);
        setRequestedTypes(prev => new Set([...prev, type]));
        setPromoMessage('');
      } else {
        toast.error(result.error || 'Failed to submit request');
      }
    } catch { toast.error('Something went wrong'); }
    finally { setSubmitting(null); }
  };

  if (loading) return <LoadingState message="Loading..." />;
  if (founderTools.length === 0) {
    return (
      <div className="text-center py-16">
        <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">No tools to promote yet</p>
        <p className="text-xs text-slate-600 mt-1">Submit or claim a tool first, then come back to promote it.</p>
      </div>
    );
  }
  const selectedToolObj = founderTools.find((t: any) => t.id === selectedTool);
  const activePromos = myPromotions.filter(p => ['active', 'scheduled', 'paid'].includes(p.status));
  const pastPromos = myPromotions.filter(p => ['expired', 'cancelled', 'failed'].includes(p.status));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-slate-900 font-bold text-base">Promote Your Stacks</h3>
        <p className="text-slate-500 text-sm mt-0.5">Boost visibility with self-serve promotions powered by dynamic pricing</p>
      </div>

      {/* Active Promotions */}
      {activePromos.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <h4 className="text-slate-900 font-bold text-sm">Active Promotions</h4>
            <span className="ml-auto text-xs text-slate-500">{activePromos.length} active</span>
          </div>
          <div className="space-y-3">
            {activePromos.map(promo => {
              const statusStyle = PROMO_STATUS_COLORS[promo.status] || PROMO_STATUS_COLORS.pending_payment;
              const Icon = PROMO_TYPE_ICONS[promo.type] || Sparkles;
              return (
                <div key={promo.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{promo.entityName}</p>
                    <p className="text-xs text-slate-500">
                      {promo.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} · {promo.durationDays}d
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                    {promo.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </div>
                  {promo.expiresAt && (
                    <span className="text-xs text-slate-500 hidden sm:block">
                      Expires {new Date(promo.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tool selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <label className="text-xs font-semibold text-slate-600 mb-2 block">Select a tool to promote</label>
        <select
          value={selectedTool ?? ''}
          onChange={(e) => setSelectedTool(Number(e.target.value))}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white"
        >
          {founderTools.map((t: any) => (
            <option key={t.id} value={t.id}>{t.name}{t.isFeatured ? ' ★ Featured' : ''}</option>
          ))}
        </select>
        {selectedToolObj?.isFeatured && (
          <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
            <Sparkles className="w-3.5 h-3.5" />
            This tool is currently featured. You can extend or upgrade the placement.
          </div>
        )}
      </div>

      {/* Dynamic Pricing Plans from DB */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h4 className="text-slate-900 font-bold text-sm">Promotion Plans — Instant Checkout</h4>
        </div>
        {pricingPlans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">Promotion plans coming soon</p>
            <p className="text-xs text-slate-500 mt-1">Our team is setting up pricing. Check back shortly.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricingPlans.map((plan, idx) => {
                const Icon = PROMO_TYPE_ICONS[plan.promotionType] || Sparkles;
                const isPopular = plan.isPopular || idx === 1;
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl p-5 flex flex-col transition-all ${
                      isPopular
                        ? 'border-2 border-amber-400 shadow-lg shadow-amber-100'
                        : 'border border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-amber-500" />
                      <h5 className="text-slate-900 font-black text-base">{plan.displayName}</h5>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-black text-slate-900">${(plan.priceInCents / 100).toFixed(0)}</span>
                      <span className="text-slate-500 text-xs">one-time</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed mb-3">{plan.durationDays} days of {plan.promotionType.replace(/_/g, ' ')} visibility</p>
                    <p className="text-slate-600 text-xs leading-relaxed mb-4 flex-1">{plan.description || `Boost your tool with ${plan.displayName} promotion`}</p>
                    <button
                      onClick={() => handlePurchasePromotion(plan.id)}
                      disabled={purchasing !== null}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                        isPopular
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                      } disabled:opacity-50`}
                    >
                      {purchasing === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      {purchasing === plan.id ? 'Redirecting...' : `Get ${plan.displayName}`}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-600 mt-3 text-center">Secure payment via Stripe. One-time payment, no recurring charges.</p>
          </>
        )}
      </div>

      {/* Custom Promotions */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4 text-blue-500" />
          <h4 className="text-slate-900 font-bold text-sm">Custom Promotions</h4>
        </div>
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Message to our team (optional)</label>
          <textarea
            value={promoMessage}
            onChange={(e) => setPromoMessage(e.target.value)}
            placeholder="Tell us about your goals, timing, or specific requirements..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sponsored placement */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h5 className="text-slate-900 font-black text-sm mb-1">Sponsored Placement</h5>
                <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                  Category page and search result sponsorship. Custom pricing based on category and duration.
                </p>
                <button
                  onClick={() => handleRequestPromotion('sponsored')}
                  disabled={submitting === 'sponsored' || requestedTypes.has('sponsored')}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-xl transition-colors text-xs disabled:opacity-50"
                >
                  {submitting === 'sponsored' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
                  {requestedTypes.has('sponsored') ? 'Submitted' : 'Request Quote'}
                </button>
              </div>
            </div>
          </div>
          {/* Newsletter */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h5 className="text-slate-900 font-black text-sm mb-1">Newsletter Feature</h5>
                <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                  Featured in our weekly newsletter to LaudStack subscribers. Includes spotlight and CTA.
                </p>
                <button
                  onClick={() => handleRequestPromotion('newsletter')}
                  disabled={submitting === 'newsletter' || requestedTypes.has('newsletter')}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-xl transition-colors text-xs disabled:opacity-50"
                >
                  {submitting === 'newsletter' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  {requestedTypes.has('newsletter') ? 'Submitted' : 'Request Quote'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion History */}
      {pastPromos.length > 0 && (
        <div className="border-t border-slate-200 pt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Promotion History ({pastPromos.length})
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showHistory && (
            <div className="mt-3 space-y-2">
              {pastPromos.map(promo => {
                const statusStyle = PROMO_STATUS_COLORS[promo.status] || PROMO_STATUS_COLORS.expired;
                const Icon = PROMO_TYPE_ICONS[promo.type] || Sparkles;
                return (
                  <div key={promo.id} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl opacity-70">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{promo.entityName}</p>
                      <p className="text-xs text-slate-500">
                        {promo.type.replace(/_/g, ' ')} · ${(promo.amountPaid / 100).toFixed(0)} · {promo.durationDays}d
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      {promo.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Share tools */}
      {founderTools.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h4 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-slate-500" />
            Share Your Stacks
          </h4>
          <div className="space-y-3">
            {founderTools.map((tool: any) => (
              <div key={tool.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white overflow-hidden flex-shrink-0">
                  {tool.logoUrl ? (
                    <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-xs font-black text-slate-600">{tool.name[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{tool.name}</p>
                  <p className="text-xs text-slate-600 truncate">laudstack.com/tools/{tool.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/tools/${tool.slug}`); toast.success('Link copied!'); }}
                    className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                    title="Copy link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=Check out ${tool.name} on LaudStack!&url=${window.location.origin}/tools/${tool.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="Share on Twitter"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
// ─── Lauds Tab ──────────────────────────────────────────────────────────────
function LaudsTab() {
  const [laudData, setLaudData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFounderLauds().then(data => {
      setLaudData(data);
    }).catch(err => {
      console.error('Failed to load lauds:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState message="Loading laud activity..." />;

  if (!laudData?.success || laudData.totalLauds === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No lauds yet"
        description="Once users start lauding your tools, you'll see detailed activity and analytics here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Heart className="w-4 h-4" />} label="Total Lauds" value={laudData.totalLauds} accent="purple" />
        <StatCard icon={<Package className="w-4 h-4" />} label="Tools Lauded" value={laudData.tools.filter((t: any) => t.laudCount > 0).length} accent="blue" />
        <StatCard icon={<Users className="w-4 h-4" />} label="Recent Activity" value={laudData.recentLauds.length} accent="green" />
      </div>

      {/* Per-tool laud breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold text-base mb-4">Lauds by Product</h3>
        <div className="space-y-3">
          {laudData.tools.sort((a: any, b: any) => b.laudCount - a.laudCount).map((tool: any) => (
            <div key={tool.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white overflow-hidden flex-shrink-0">
                <LogoWithFallback src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-1" fallbackSize="text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/tools/${tool.slug}`} className="text-sm font-bold text-slate-900 hover:text-amber-600 truncate block no-underline">
                  {tool.name}
                </Link>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-purple-500" fill="#5178FF" />
                <span className="text-lg font-black text-slate-900">{tool.laudCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent laud activity feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold text-base mb-4">Recent Laud Activity</h3>
        {laudData.recentLauds.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No recent lauds.</p>
        ) : (
          <div className="space-y-2">
            {laudData.recentLauds.slice(0, 30).map((laud: any) => (
              <div key={laud.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  {laud.userAvatar ? (
                    <img src={laud.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-purple-600">{(laud.userName || 'A')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-bold text-slate-900">{laud.userName}</span>
                    {' lauded '}
                    <Link href={`/tools/${laud.toolSlug}`} className="font-bold text-amber-600 hover:text-amber-700 no-underline">
                      {laud.toolName}
                    </Link>
                  </p>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">
                  {new Date(laud.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Claim Tool Tab ──────────────────────────────────────────────────────────
function ClaimToolTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [claims, setClaims] = useState<any[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [claimDialog, setClaimDialog] = useState<{ toolId: number; toolName: string } | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoadingClaims(true);
    const result = await getFounderClaims();
    if (result.success) setClaims(result.claims);
    setLoadingClaims(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await searchToolsAction(searchQuery, { limit: 10 });
      setSearchResults(Array.isArray(result) ? result : []);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!claimDialog) return;
    setSubmitting(true);
    try {
      const result = await claimExistingTool(claimDialog.toolId, {
        proofUrl: proofUrl || undefined,
        message: claimMessage || undefined,
      });
      if (result.success) {
        toast.success('Claim submitted! Our team will review it shortly.');
        setClaimDialog(null);
        setProofUrl('');
        setClaimMessage('');
        loadClaims();
      } else {
        toast.error(result.error || 'Failed to submit claim');
      }
    } catch {
      toast.error('Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900">Claim an Existing Tool</h2>
        <p className="text-sm text-slate-600 mt-1">
          If your product is already listed on LaudStack, you can claim ownership to manage its listing, reply to reviews, and access analytics.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Search for Your Tool</h3>
        <div className="flex gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by tool name..."
            className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-5 py-2.5 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((tool: any) => (
              <div key={tool.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                {tool.logoUrl ? (
                  <img src={tool.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    {tool.name?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{tool.name}</p>
                  <p className="text-xs text-slate-600 truncate">{tool.tagline}</p>
                </div>
                <button
                  onClick={() => setClaimDialog({ toolId: tool.id, toolName: tool.name })}
                  className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  Claim This
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim Dialog */}
      {claimDialog && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Claim: {claimDialog.toolName}</h3>
          <p className="text-xs text-slate-600 mb-4">
            Provide proof of ownership (e.g., a link to your company page, LinkedIn, or domain verification). Our team will review your claim within 24-48 hours.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Proof URL (optional)</label>
              <input
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://yourcompany.com/about or LinkedIn profile"
                className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Message to Admin (optional)</label>
              <textarea
                value={claimMessage}
                onChange={(e) => setClaimMessage(e.target.value)}
                placeholder="Explain your relationship to this tool..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmitClaim}
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Submit Claim'}
              </button>
              <button
                onClick={() => { setClaimDialog(null); setProofUrl(''); setClaimMessage(''); }}
                className="px-5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Claims */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">My Claims</h3>
        {loadingClaims ? (
          <LoadingState message="Loading claims..." />
        ) : claims.length === 0 ? (
          <div className="text-center py-8">
            <Flag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600">No claims submitted yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim: any) => (
              <div key={claim.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                {claim.toolLogo ? (
                  <img src={claim.toolLogo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    {claim.toolName?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{claim.toolName}</p>
                  <p className="text-xs text-slate-500">
                    Submitted {new Date(claim.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {statusBadge(claim.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function FounderSettingsTab({ dbUser }: { dbUser: any }) {
  const [name, setName] = useState(dbUser?.name || '');
  const [website, setWebsite] = useState(dbUser?.founderWebsite || '');
  const [bio, setBio] = useState(dbUser?.founderBio || '');
  const [twitter, setTwitter] = useState(dbUser?.twitterHandle || '');
  const [linkedin, setLinkedin] = useState(dbUser?.linkedinUrl || '');
  const [emailNotifs, setEmailNotifs] = useState(dbUser?.emailNotifications ?? true);
  const [reviewAlerts, setReviewAlerts] = useState(dbUser?.reviewAlerts ?? true);
  const [weeklyReport, setWeeklyReport] = useState(dbUser?.weeklyReport ?? true);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(true);

  // Sync state when dbUser changes
  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name || '');
      setWebsite(dbUser.founderWebsite || '');
      setBio(dbUser.founderBio || '');
      setTwitter(dbUser.twitterHandle || '');
      setLinkedin(dbUser.linkedinUrl || '');
      setEmailNotifs(dbUser.emailNotifications ?? true);
      setReviewAlerts(dbUser.reviewAlerts ?? true);
      setWeeklyReport(dbUser.weeklyReport ?? true);
    }
  }, [dbUser]);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateFounderSettings({
      name: name || undefined,
      founderBio: bio || undefined,
      founderWebsite: website || undefined,
      twitterHandle: twitter || undefined,
      linkedinUrl: linkedin || undefined,
    });
    setSaving(false);
    if (res.success) {
      toast.success('Founder profile updated successfully');
    } else {
      toast.error(res.error || 'Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      {/* Founder profile */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold text-base mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-amber-500" />
          Founder Profile
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Company / Brand Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Acme Corp"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Company Website</label>
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://yourcompany.com"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Founder Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              placeholder="Tell users about yourself and your stack..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Twitter / X</label>
              <input
                type="text"
                value={twitter}
                onChange={e => setTwitter(e.target.value)}
                placeholder="@yourhandle"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">LinkedIn</label>
              <input
                type="text"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            {saving ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save Profile</>
            )}
          </button>
        </div>
      </div>

      {/* Notification preferences */}
      <div className="bg-gradient-to-br from-white to-amber-50/30 border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 sm:px-6 py-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notification Preferences
          </h3>
          <p className="text-amber-100 text-xs mt-0.5">Stay informed about your tools and reviews</p>
        </div>
        <div className="p-4 space-y-2">
          {[
            { label: 'New review notifications', desc: 'Get notified when someone reviews your tool', icon: Star, state: reviewAlerts, setState: setReviewAlerts, dbKey: 'reviewAlerts' as const },
            { label: 'Email notifications', desc: 'Receive email alerts for important events', icon: Mail, state: emailNotifs, setState: setEmailNotifs, dbKey: 'emailNotifications' as const },
            { label: 'Weekly performance report', desc: 'Get a weekly summary of your tool metrics', icon: BarChart3, state: weeklyReport, setState: setWeeklyReport, dbKey: 'weeklyReport' as const },
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
                    await updateFounderSettings({ [dbKey]: newVal });
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

      {/* Verification */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          Tool Verification
        </h3>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              Verified tools get a blue checkmark badge, priority in search results, and increased trust from users. Verification requires proof of ownership.
            </p>
          </div>
        </div>
        <Link href="/claim">
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
            <Shield className="w-4 h-4" /> Claim & Verify Your Tool
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── Main Founder Dashboard ───────────────────────────────────────────────────
export default function FounderDashboard() {
  const searchParams = useSearchParams();
  const tabParam = (searchParams?.get('tab') ?? null) as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam && ['overview','tools','reviews','deals','lauds','analytics','promote','claims','settings'].includes(tabParam) ? tabParam : 'overview');
  const [pendingReviews, setPendingReviews] = useState(0);
  const [quickStats, setQuickStats] = useState({ totalTools: 0, avgRating: '0.0', totalReviews: 0 });
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { dbUser, loading: dbLoading } = useDbUser();
  const router = useRouter();
  const founderDisplayName = (dbUser?.firstName ? [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ') : null) || dbUser?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Founder';

  // Load pending review count and quick stats
  useEffect(() => {
    if (!isAuthenticated) return;
    getFounderReviews().then(res => {
      if (res.success) {
        setPendingReviews(res.reviews.filter((r: any) => !r.founderReply).length);
      }
    }).catch(() => {});
    getFounderAnalytics().then(res => {
      if (res.success) {
        setQuickStats({
          totalTools: res.totalTools,
          avgRating: res.averageRating?.toFixed(1) || '0.0',
          totalReviews: res.totalReviews,
        });
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="h-[60px] lg:h-[64px]" />
        <LoadingState message="Loading dashboard..." />
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
            <Rocket className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-slate-900 font-black text-2xl mb-2">Founder Dashboard</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Sign in to manage your tool listings, respond to reviews, create deals, and view analytics.
          </p>
          <button
            onClick={() => router.push('/auth/login?return=/dashboard/founder')}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 sm:px-6 py-3 rounded-xl transition-colors"
          >
            Sign In <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="h-[60px] lg:h-[64px]" />
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-slate-900 font-black text-2xl">Founder Dashboard</h1>
            </div>
            <p className="text-slate-600 text-sm">
              Manage listings, respond to reviews, and track performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl transition-all">
                <User className="w-4 h-4" /> User Panel
              </button>
            </Link>
            <Link href="/launchpad">
              <button className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
                <PlusCircle className="w-4 h-4" /> Launch Product
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1 lg:sticky lg:top-20">
              {/* Founder info */}
              <div className="px-3 py-3 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-slate-900 font-black text-sm flex-shrink-0">
                    {founderDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-900 font-bold text-sm truncate">
                      {founderDisplayName}
                    </p>
                    <p className="text-amber-600 text-xs font-semibold">Founder</p>
                  </div>
                </div>
              </div>

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
                    {tab.id === 'reviews' && pendingReviews > 0 && (
                      <span className="bg-amber-400 text-slate-900 text-xs font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {pendingReviews}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Desktop sidebar */}
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
                    {tab.id === 'reviews' && pendingReviews > 0 && (
                      <span className="bg-amber-400 text-slate-900 text-xs font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {pendingReviews}
                      </span>
                    )}
                    {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                ))}
              </div>

              {/* Quick stats */}
              <div className="pt-3 mt-2 border-t border-slate-100 space-y-2 px-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-3">Quick Stats</p>
                {[
                  { label: 'Total Tools', value: String(quickStats.totalTools) },
                  { label: 'Avg Rating', value: `${quickStats.avgRating} ★` },
                  { label: 'Reviews', value: String(quickStats.totalReviews) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-1">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-xs font-bold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview'  && <OverviewTab setActiveTab={setActiveTab} />}
            {activeTab === 'tools'     && <ToolsTab setActiveTab={setActiveTab} />}
            {activeTab === 'reviews'   && <ReviewsTab />}
            {activeTab === 'deals'     && <DealsTab />}
            {activeTab === 'lauds'     && <LaudsTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'promote'   && <PromoteTab />}
            {activeTab === 'claims'    && <ClaimToolTab />}
            {activeTab === 'settings'  && <FounderSettingsTab dbUser={dbUser} />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
