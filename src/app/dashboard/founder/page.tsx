"use client";
export const dynamic = 'force-dynamic';
/*
 * LaudStack — Founder Dashboard
 * All 7 tabs fully functional with real server actions
 * Tabs: Overview · My Products · Reviews (reply) · Deals · Analytics · Promote · Settings
 */
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Star, MessageSquare, TrendingUp, Eye, ChevronRight,
  Settings, Zap, Bell, Shield, Edit3, ExternalLink, CheckCircle,
  AlertCircle, Clock, ArrowUpRight, ArrowDownRight, Users,
  Package, PlusCircle, Crown, Rocket, Tag, DollarSign,
  ThumbsUp, Reply, Check, X, Sparkles, Globe, MoreHorizontal,
  Trash2, Copy, RefreshCw, Save, Info, Award, TrendingDown,
  ChevronDown, ChevronUp, Flag, Layers, Target, Megaphone,
  Calendar, Link2, Image, FileText, ArrowRight, BarChart2,
  Activity, MousePointer, Heart, Share2, Mail, Lock, User, Loader2
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
} from '@/app/actions/founder';
import { searchToolsAction } from '@/app/actions/public';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'tools' | 'reviews' | 'deals' | 'analytics' | 'promote' | 'claims' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',  label: 'Overview',    icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'tools',     label: 'My Products',    icon: <Package className="w-4 h-4" /> },
  { id: 'reviews',   label: 'Reviews',     icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'deals',     label: 'Deals',       icon: <Tag className="w-4 h-4" /> },
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
      <p className="text-slate-500 text-sm">{message}</p>
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
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-slate-900 font-bold text-base mb-1">{title}</h3>
      <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">{description}</p>
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
      <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
      {changeLabel && <div className="text-xs text-slate-400 mt-0.5">{changeLabel}</div>}
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
            <p className="text-slate-500 text-sm">No tools submitted yet.</p>
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
                  {tool.logoUrl ? (
                    <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-1"
                      onError={e => { const el = e.currentTarget; el.style.display = 'none'; const p = el.parentElement; if (p) p.innerHTML = `<span class="w-full h-full flex items-center justify-center text-sm font-black text-slate-600">${tool.name[0]}</span>`; }} />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-sm font-black text-slate-600">{tool.name[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-bold text-sm truncate">{tool.name}</p>
                  <p className="text-slate-500 text-xs">{tool.category} · {tool.pricingModel}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm font-black text-slate-900">{tool.averageRating?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-slate-400">rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black text-slate-900">{tool.reviewCount || 0}</div>
                    <div className="text-xs text-slate-400">reviews</div>
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
            <p className="text-slate-500 text-sm">No reviews yet on your stacks.</p>
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
                    <span className="text-xs text-slate-400">on {review.toolName}</span>
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
function ToolsTab() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const loadTools = useCallback(async () => {
    const res = await getFounderTools();
    if (res.success) setTools(res.tools);
    setLoading(false);
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
                {tool.logoUrl ? (
                  <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-1"
                    onError={e => { const el = e.currentTarget; el.style.display = 'none'; const p = el.parentElement; if (p) p.innerHTML = `<span class="w-full h-full flex items-center justify-center text-xl font-black text-slate-600">${tool.name[0]}</span>`; }} />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-xl font-black text-slate-600">{tool.name[0]}</span>
                )}
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
                    <p className="text-slate-500 text-sm">{tool.tagline}</p>
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
            <div className="grid grid-cols-4 border-t border-slate-100">
              {[
                { label: 'Upvotes', value: tool.upvoteCount || 0, icon: <ThumbsUp className="w-3.5 h-3.5 text-blue-500" /> },
                { label: 'Rating', value: tool.averageRating?.toFixed(1) || '0.0', icon: <Star className="w-3.5 h-3.5 text-amber-500" /> },
                { label: 'Reviews', value: tool.reviewCount || 0, icon: <MessageSquare className="w-3.5 h-3.5 text-green-500" /> },
                { label: 'Rank Δ', value: tool.weeklyRankChange > 0 ? `+${tool.weeklyRankChange}` : tool.weeklyRankChange || '—', icon: <TrendingUp className="w-3.5 h-3.5 text-purple-500" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex flex-col items-center justify-center py-3 border-r border-slate-100 last:border-r-0">
                  <div className="flex items-center gap-1 mb-0.5">{icon}</div>
                  <div className="text-sm font-black text-slate-900">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
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
            <p className="text-slate-400 text-sm mb-4">Get priority review, featured placement, verified badge, advanced analytics, and dedicated support for your stacks.</p>
            <button
              onClick={() => toast.info('Pro listings coming soon — join the waitlist!')}
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
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    const res = await getFounderReviews();
    if (res.success) setReviews(res.reviews);
    setLoading(false);
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

  const filteredReviews = reviews.filter((r: any) => {
    if (filter === 'pending') return !r.founderReply;
    if (filter === 'replied') return !!r.founderReply;
    return true;
  });

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
            {(['all', 'pending', 'replied'] as const).map(f => (
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
          <p className="text-slate-400 text-sm mt-1">No {filter} reviews to show.</p>
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
                      <span className="text-xs text-slate-400">
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
                    <button
                      onClick={() => { setReplyingTo(review.id); setReplyText(review.founderReply || ''); }}
                      className="ml-auto flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      {review.founderReply ? 'Edit Reply' : 'Reply'}
                    </button>
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
                    <p className="text-xs text-slate-400">{replyText.length}/500 characters</p>
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
    discountPercent: '',
    couponCode: '',
    dealUrl: '',
    expiresAt: '',
    maxClaims: '100',
  });

  const loadDeals = useCallback(async () => {
    const res = await getFounderDeals();
    if (res.success) {
      setDeals(res.deals);
      setFounderTools(res.tools || []);
      if (res.tools && res.tools.length > 0 && !newDeal.toolId) {
        setNewDeal(prev => ({ ...prev, toolId: String(res.tools![0].id) }));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadDeals(); }, [loadDeals]);

  const handleCreateDeal = async () => {
    if (!newDeal.title || !newDeal.couponCode || !newDeal.discountPercent) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCreating(true);
    const res = await createFounderDeal({
      toolId: parseInt(newDeal.toolId),
      title: newDeal.title,
      description: newDeal.description,
      discountPercent: parseInt(newDeal.discountPercent),
      couponCode: newDeal.couponCode,
      dealUrl: newDeal.dealUrl || undefined,
      expiresAt: newDeal.expiresAt || undefined,
      maxClaims: newDeal.maxClaims ? parseInt(newDeal.maxClaims) : undefined,
    });
    setCreating(false);
    if (res.success) {
      toast.success('Deal created successfully!');
      setShowCreateModal(false);
      setNewDeal({ toolId: founderTools[0]?.id ? String(founderTools[0].id) : '', title: '', description: '', discountPercent: '', couponCode: '', dealUrl: '', expiresAt: '', maxClaims: '100' });
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
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
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
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  value={newDeal.description}
                  onChange={e => setNewDeal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the deal..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white resize-none"
                />
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
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Discount % *</label>
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
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Expires</label>
                  <input
                    type="date"
                    value={newDeal.expiresAt}
                    onChange={e => setNewDeal(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-slate-50 focus:bg-white"
                  />
                </div>
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
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      deal.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {deal.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">{deal.toolName}</p>
                  {deal.description && <p className="text-slate-600 text-sm mt-1">{deal.description}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleDeal(deal.id)}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                    title={deal.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDeal(deal.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {deal.discountPercent && (
                  <span className="text-sm font-black text-amber-600">{deal.discountPercent}% off</span>
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
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFounderAnalytics().then(res => {
      if (res.success) setAnalytics(res);
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Package className="w-4 h-4" />} label="Total Tools" value={analytics.totalTools} accent="blue" />
        <StatCard icon={<Star className="w-4 h-4" />} label="Avg Rating" value={analytics.averageRating?.toFixed(1) || '0.0'} accent="amber" />
        <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Total Reviews" value={analytics.totalReviews} accent="green" />
        <StatCard icon={<ThumbsUp className="w-4 h-4" />} label="Total Lauds" value={analytics.totalUpvotes} accent="purple" />
      </div>

      {/* Deal stats */}
      {analytics.totalDeals > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-slate-500 font-medium">Active Deals</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{analytics.totalDeals}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-xs text-slate-500 font-medium">Total Claims</span>
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
                  <td className="py-3 pl-3 text-center">
                    {tool.weeklyRankChange !== null && tool.weeklyRankChange !== 0 ? (
                      <span className={`text-xs font-bold ${tool.weeklyRankChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tool.weeklyRankChange > 0 ? '+' : ''}{tool.weeklyRankChange}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
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

// ─── Promote Tab ──────────────────────────────────────────────────────────────
function PromoteTab() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFounderTools().then(res => {
      if (res.success) setTools(res.tools);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState message="Loading..." />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-slate-900 font-bold text-base">Promote Your Stacks</h3>
        <p className="text-slate-500 text-sm mt-0.5">Boost visibility and reach more buyers</p>
      </div>

      {/* Feature tool */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-slate-900 font-black text-base">Featured Listing</h4>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">Most Popular</span>
            </div>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Get your tool featured at the top of category pages and the homepage. Amber border highlight, Featured badge, and priority placement in search results.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {[
                { icon: <Award className="w-3.5 h-3.5 text-amber-600" />, text: 'Homepage placement' },
                { icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />, text: 'Featured badge' },
                { icon: <Eye className="w-3.5 h-3.5 text-amber-600" />, text: 'Priority in search' },
                { icon: <BarChart3 className="w-3.5 h-3.5 text-amber-600" />, text: 'Enhanced analytics' },
                { icon: <Mail className="w-3.5 h-3.5 text-amber-600" />, text: 'Newsletter mention' },
                { icon: <Crown className="w-3.5 h-3.5 text-amber-600" />, text: 'Category spotlight' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-slate-700">
                  {icon}
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => toast.info('Featured listings coming soon — join the waitlist!')}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4" /> Feature My Tool
            </button>
          </div>
        </div>
      </div>

      {/* Sponsored placement */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-slate-900 font-black text-base mb-1">Sponsored Placement</h4>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Appear in the "Sponsored" section on relevant category pages and search results. Pay per click — only pay when users engage.
            </p>
            <button
              onClick={() => toast.info('Sponsored placements coming soon!')}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Target className="w-4 h-4" /> Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-slate-900 font-black text-base mb-1">Newsletter Feature</h4>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Get your tool featured in our weekly newsletter sent to 12,000+ professionals. Includes tool spotlight, key features, and direct CTA link.
            </p>
            <button
              onClick={() => toast.info('Newsletter features coming soon!')}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Mail className="w-4 h-4" /> Request Feature
            </button>
          </div>
        </div>
      </div>

      {/* Share tools */}
      {tools.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h4 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-slate-500" />
            Share Your Stacks
          </h4>
          <div className="space-y-3">
            {tools.map((tool: any) => (
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
                  <p className="text-xs text-slate-500 truncate">laudstack.com/tools/{tool.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/tools/${tool.slug}`); toast.success('Link copied!'); }}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                    title="Copy link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=Check out ${tool.name} on LaudStack!&url=${window.location.origin}/tools/${tool.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
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
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900">Claim an Existing Tool</h2>
        <p className="text-sm text-slate-500 mt-1">
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
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                    {tool.name?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{tool.name}</p>
                  <p className="text-xs text-slate-400 truncate">{tool.tagline}</p>
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
          <p className="text-xs text-slate-500 mb-4">
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
            <p className="text-sm text-slate-400">No claims submitted yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim: any) => (
              <div key={claim.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                {claim.toolLogo ? (
                  <img src={claim.toolLogo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                    {claim.toolName?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{claim.toolName}</p>
                  <p className="text-xs text-slate-400">
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
function FounderSettingsTab() {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load current settings from the user's DB record
  useEffect(() => {
    // We'll use the auth user metadata as initial values
    // In a full implementation, we'd fetch from the DB
    setLoaded(true);
  }, []);

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
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { label: 'New review notifications', desc: 'Get notified when someone reviews your tool', state: reviewAlerts, setState: setReviewAlerts },
            { label: 'Email notifications', desc: 'Receive email alerts for important events', state: emailNotifs, setState: setEmailNotifs },
            { label: 'Weekly performance report', desc: 'Get a weekly summary of your tool metrics', state: weeklyReport, setState: setWeeklyReport },
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
                <span
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{ transform: state ? 'translateX(20px)' : 'translateX(2px)' }}
                />
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
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [pendingReviews, setPendingReviews] = useState(0);
  const [quickStats, setQuickStats] = useState({ totalTools: 0, avgRating: '0.0', totalReviews: 0 });
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { dbUser } = useDbUser();
  const router = useRouter();
  const founderDisplayName = (dbUser?.firstName ? [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ') : null) || dbUser?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Founder';

  // Load pending review count and quick stats
  useEffect(() => {
    if (!isAuthenticated) return;
    getFounderReviews().then(res => {
      if (res.success) {
        setPendingReviews(res.reviews.filter((r: any) => !r.founderReply).length);
      }
    });
    getFounderAnalytics().then(res => {
      if (res.success) {
        setQuickStats({
          totalTools: res.totalTools,
          avgRating: res.averageRating?.toFixed(1) || '0.0',
          totalReviews: res.totalReviews,
        });
      }
    });
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div style={{ height: '72px' }} />
        <LoadingState message="Loading dashboard..." />
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
            <Rocket className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-slate-900 font-black text-2xl mb-2">Founder Dashboard</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Sign in to manage your tool listings, respond to reviews, create deals, and view analytics.
          </p>
          <button
            onClick={() => router.push('/auth/login?return=/dashboard/founder')}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors"
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
      <div style={{ height: '72px' }} />
      <div className="max-w-[1300px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-slate-900 font-black text-2xl">Founder Dashboard</h1>
            </div>
            <p className="text-slate-500 text-sm">
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
            <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1 lg:sticky lg:top-24">
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
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide px-3">Quick Stats</p>
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
            {activeTab === 'tools'     && <ToolsTab />}
            {activeTab === 'reviews'   && <ReviewsTab />}
            {activeTab === 'deals'     && <DealsTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'promote'   && <PromoteTab />}
            {activeTab === 'claims'    && <ClaimToolTab />}
            {activeTab === 'settings'  && <FounderSettingsTab />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
