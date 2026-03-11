/*
 * LaudStack — Founder Dashboard (/dashboard/founder)
 * Design: Clean white sidebar, amber accents, analytics-focused
 * Tabs: Overview · My Tools · Reviews · Deals · Analytics · Promote · Settings
 * Auth: Uses real Manus OAuth via AuthContext
 */

import { useState } from 'react';
import { Link } from 'wouter';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  BarChart3, Star, MessageSquare, TrendingUp, Eye, ChevronRight,
  Settings, Zap, Bell, Shield, Edit3, ExternalLink, CheckCircle,
  AlertCircle, Clock, ArrowUpRight, ArrowDownRight, Users,
  Package, PlusCircle, Crown, Rocket, Reply, X, Check, Save,
  Tag, Percent, Calendar, Globe, Twitter, Linkedin, Mail,
  ThumbsUp, ChevronDown, ChevronUp, MoreHorizontal, Megaphone,
  Target, Award, Info, Sparkles, Lock, ArrowRight, Trash2,
  ToggleLeft, ToggleRight, DollarSign, Image, FileText, Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, getInitials } from '@/contexts/AuthContext';
import { MOCK_TOOLS, MOCK_REVIEWS } from '@/lib/mockData';
import { type Review } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'tools' | 'reviews' | 'deals' | 'analytics' | 'promote' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: 'overview',  label: 'Overview',   icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'tools',     label: 'My Tools',   icon: <Package className="w-4 h-4" /> },
  { id: 'reviews',   label: 'Reviews',    icon: <MessageSquare className="w-4 h-4" />, badge: 4 },
  { id: 'deals',     label: 'Deals',      icon: <Tag className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics',  icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'promote',   label: 'Promote',    icon: <Megaphone className="w-4 h-4" /> },
  { id: 'settings',  label: 'Settings',   icon: <Settings className="w-4 h-4" /> },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const FOUNDER_TOOLS = MOCK_TOOLS.slice(0, 3);

const CHART_VIEWS = [
  { month: 'Oct', views: 3200, clicks: 890, reviews: 12 },
  { month: 'Nov', views: 4100, clicks: 1120, reviews: 18 },
  { month: 'Dec', views: 3800, clicks: 980, reviews: 14 },
  { month: 'Jan', views: 5200, clicks: 1450, reviews: 23 },
  { month: 'Feb', views: 6100, clicks: 1780, reviews: 31 },
  { month: 'Mar', views: 7400, clicks: 2100, reviews: 38 },
];

const MOCK_DEALS = [
  { id: 'd1', toolId: '1', title: '40% off annual plan', code: 'LAUD40', discount: '40%', type: 'Percentage', expires: '2026-06-30', uses: 142, maxUses: 500, active: true },
  { id: 'd2', toolId: '2', title: '3 months free trial', code: 'LAUD3MO', discount: '3 months', type: 'Free Trial', expires: '2026-04-15', uses: 67, maxUses: 200, active: true },
  { id: 'd3', toolId: '3', title: '$50 off first year', code: 'LAUD50', discount: '$50', type: 'Fixed Amount', expires: '2026-03-31', uses: 89, maxUses: 100, active: false },
];

// ─── Helper components ────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0 ${value ? 'bg-amber-400' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function StatCard({ label, value, change, icon, positive, color = '#F59E0B' }: {
  label: string; value: string | number; change?: string; icon: React.ReactNode; positive?: boolean; color?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + '15', color }}>
          {icon}
        </div>
      </div>
      <div className="text-slate-900 font-black text-2xl mb-1">{value}</div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-green-600' : 'text-rose-500'}`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change} vs last month
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const totalReviews = FOUNDER_TOOLS.reduce((s, t) => s + t.review_count, 0);
  const avgRating = FOUNDER_TOOLS.reduce((s, t) => s + t.average_rating, 0) / FOUNDER_TOOLS.length;
  const totalUpvotes = FOUNDER_TOOLS.reduce((s, t) => s + t.upvote_count, 0);
  const totalViews = FOUNDER_TOOLS.reduce((s, t) => s + Math.round(t.rank_score * 7.4), 0);

  const pendingReplies = MOCK_REVIEWS.filter(r => !r.founder_reply).slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Views" value={totalViews.toLocaleString()} change="+18%" positive icon={<Eye className="w-4 h-4" />} color="#3B82F6" />
        <StatCard label="Total Reviews" value={totalReviews.toLocaleString()} change="+24%" positive icon={<MessageSquare className="w-4 h-4" />} color="#F59E0B" />
        <StatCard label="Avg Rating" value={avgRating.toFixed(1)} change="+0.2" positive icon={<Star className="w-4 h-4" />} color="#22C55E" />
        <StatCard label="Total Upvotes" value={totalUpvotes.toLocaleString()} change="+12%" positive icon={<ThumbsUp className="w-4 h-4" />} color="#8B5CF6" />
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-slate-900 font-bold">Performance Overview</h3>
            <p className="text-slate-500 text-xs mt-0.5">Views, clicks, and reviews over the last 6 months</p>
          </div>
          <select className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white focus:outline-none cursor-pointer">
            <option>Last 6 months</option>
            <option>Last 3 months</option>
            <option>Last year</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={CHART_VIEWS} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: '12px' }} />
            <Area type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} fill="url(#viewsGrad)" name="Views" />
            <Area type="monotone" dataKey="clicks" stroke="#F59E0B" strokeWidth={2} fill="url(#clicksGrad)" name="Clicks" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tools summary + Pending replies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tools */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold">My Tools</h3>
            <button onClick={() => onTabChange('tools')} className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              Manage <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {FOUNDER_TOOLS.map(tool => (
              <div key={tool.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <img src={tool.logo_url} alt={tool.name} className="w-9 h-9 rounded-lg object-cover bg-slate-200 flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=f1f5f9&color=64748b&size=36`; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-semibold text-sm truncate">{tool.name}</p>
                  <div className="flex items-center gap-2">
                    <StarRow rating={Math.round(tool.average_rating)} />
                    <span className="text-xs text-slate-500">{tool.average_rating.toFixed(1)} ({tool.review_count})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {tool.is_verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {tool.is_featured && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onTabChange('tools')} className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-amber-400 hover:text-amber-600 transition-colors text-sm font-medium">
            <PlusCircle className="w-4 h-4" /> Submit New Tool
          </button>
        </div>

        {/* Pending replies */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-900 font-bold">Pending Replies</h3>
              <p className="text-slate-500 text-xs mt-0.5">{pendingReplies.length} reviews awaiting your response</p>
            </div>
            <button onClick={() => onTabChange('reviews')} className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {pendingReplies.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">All caught up!</p>
              <p className="text-slate-400 text-xs mt-1">No pending replies.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReplies.map(review => {
                const tool = MOCK_TOOLS.find(t => t.id === review.tool_id);
                return (
                  <div key={review.id} className="p-3 rounded-xl border border-amber-100 bg-amber-50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <img src={tool?.logo_url || ''} alt={tool?.name || ''} className="w-6 h-6 rounded-lg object-cover bg-slate-200"
                        onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=T&background=f1f5f9&color=64748b&size=24`; }} />
                      <span className="text-xs font-bold text-slate-800">{tool?.name}</span>
                      <StarRow rating={review.rating} />
                      <span className="ml-auto text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{review.body}</p>
                    <button onClick={() => onTabChange('reviews')} className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700">
                      <Reply className="w-3 h-3" /> Reply to this review
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Reply, label: 'Reply to Reviews', tab: 'reviews' as Tab, color: '#3B82F6', bg: '#EFF6FF' },
            { icon: Tag, label: 'Create a Deal', tab: 'deals' as Tab, color: '#22C55E', bg: '#F0FDF4' },
            { icon: Megaphone, label: 'Promote Tool', tab: 'promote' as Tab, color: '#F59E0B', bg: '#FFFBEB' },
            { icon: TrendingUp, label: 'View Analytics', tab: 'analytics' as Tab, color: '#8B5CF6', bg: '#F5F3FF' },
          ].map(({ icon: Icon, label, tab, color, bg }) => (
            <button key={label} onClick={() => onTabChange(tab)} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-center group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-xs font-semibold text-slate-700">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── My Tools Tab ─────────────────────────────────────────────────────────────
function ToolsTab() {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-900 font-bold text-lg">My Tools</h3>
            <p className="text-slate-500 text-sm">{FOUNDER_TOOLS.length} tools listed on LaudStack</p>
          </div>
          <button
            onClick={() => toast.info('Tool submission form coming soon!')}
            className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl transition-colors"
            style={{ background: '#F59E0B' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#D97706')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}
          >
            <PlusCircle className="w-4 h-4" /> Submit Tool
          </button>
        </div>
      </div>

      {FOUNDER_TOOLS.map(tool => (
        <div key={tool.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Tool header */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <img src={tool.logo_url} alt={tool.name} className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=f1f5f9&color=64748b&size=56`; }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-slate-900 font-bold text-lg">{tool.name}</h3>
                  {tool.is_verified && (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {tool.is_featured && (
                    <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                      <Star className="w-3 h-3 fill-amber-500" /> Featured
                    </span>
                  )}
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{tool.category}</span>
                </div>
                <p className="text-slate-500 text-sm">{tool.tagline}</p>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <StarRow rating={Math.round(tool.average_rating)} />
                    <span className="text-sm font-bold text-slate-800">{tool.average_rating.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">({tool.review_count} reviews)</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <ThumbsUp className="w-3.5 h-3.5" /> {tool.upvote_count.toLocaleString()} upvotes
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Eye className="w-3.5 h-3.5" /> {Math.round(tool.rank_score * 7.4).toLocaleString()} views
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                  <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </a>
                <button
                  onClick={() => setEditingId(editingId === tool.id ? null : tool.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors ${
                    editingId === tool.id ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {editingId === tool.id ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>
          </div>

          {/* Edit form (expandable) */}
          {editingId === tool.id && (
            <div className="p-5 bg-slate-50 border-b border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1.5">Tool Name</label>
                  <input defaultValue={tool.name} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1.5">Tagline</label>
                  <input defaultValue={tool.tagline} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1.5">Website URL</label>
                  <input defaultValue={tool.website_url} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1.5">Pricing Model</label>
                  <select defaultValue={tool.pricing_model} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:border-amber-400 cursor-pointer">
                    {['Free', 'Freemium', 'Paid', 'Free Trial', 'Open Source'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1.5">Description</label>
                <textarea defaultValue={tool.description} rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setEditingId(null); toast.success(`${tool.name} updated successfully`); }}
                  className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl transition-colors"
                  style={{ background: '#F59E0B' }}
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
                <button onClick={() => setEditingId(null)} className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Tool stats row */}
          <div className="grid grid-cols-4 divide-x divide-slate-100">
            {[
              { label: 'This Month Views', value: Math.round(tool.rank_score * 1.2).toLocaleString(), icon: Eye, color: '#3B82F6' },
              { label: 'Outbound Clicks', value: Math.round(tool.rank_score * 0.3).toLocaleString(), icon: ExternalLink, color: '#22C55E' },
              { label: 'New Reviews', value: Math.round(tool.review_count * 0.08), icon: MessageSquare, color: '#F59E0B' },
              { label: 'Rank Position', value: `#${MOCK_TOOLS.indexOf(tool) + 1}`, icon: TrendingUp, color: '#8B5CF6' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-4 text-center">
                <div className="text-lg font-black text-slate-900">{value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab() {
  const allReviews = MOCK_REVIEWS.slice(0, 12);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

  const filtered = allReviews.filter(r => {
    const hasReply = !!r.founder_reply || !!replies[r.id];
    if (filter === 'pending' && hasReply) return false;
    if (filter === 'replied' && !hasReply) return false;
    if (ratingFilter !== 'all' && r.rating !== Number(ratingFilter)) return false;
    return true;
  });

  const pendingCount = allReviews.filter(r => !r.founder_reply && !replies[r.id]).length;

  const submitReply = (reviewId: string) => {
    const text = replyTexts[reviewId]?.trim();
    if (!text) { toast.error('Please write a reply first'); return; }
    setReplies(prev => ({ ...prev, [reviewId]: text }));
    setReplyingTo(null);
    setReplyTexts(prev => ({ ...prev, [reviewId]: '' }));
    toast.success('Reply posted successfully!');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="text-slate-900 font-bold text-lg">Reviews</h3>
            <p className="text-slate-500 text-sm">{allReviews.length} total · <span className="text-amber-600 font-semibold">{pendingCount} awaiting reply</span></p>
          </div>
          <div className="flex items-center gap-2">
            <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-amber-400 cursor-pointer">
              <option value="all">All Reviews</option>
              <option value="pending">Pending Reply</option>
              <option value="replied">Replied</option>
            </select>
            <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value as typeof ratingFilter)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-amber-400 cursor-pointer">
              <option value="all">All Ratings</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
            </select>
          </div>
        </div>

        {/* Rating distribution */}
        <div className="space-y-1.5">
          {[5,4,3,2,1].map(rating => {
            const count = allReviews.filter(r => r.rating === rating).length;
            const pct = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-600">{rating}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews list */}
      {filtered.map(review => {
        const tool = MOCK_TOOLS.find(t => t.id === review.tool_id);
        const existingReply = review.founder_reply?.body || replies[review.id];
        const isReplying = replyingTo === review.id;

        return (
          <div key={review.id} className={`bg-white border rounded-2xl overflow-hidden transition-all ${!existingReply ? 'border-amber-200' : 'border-slate-200'}`}>
            {/* Review header */}
            <div className="p-5">
              <div className="flex items-start gap-3 mb-3">
                {/* Reviewer avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: '#64748B' }}>
                  {review.user?.name ? review.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 font-bold text-sm">{review.user?.name || 'Anonymous'}</span>
                    {review.user?.role && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{review.user.role}</span>}
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <StarRow rating={review.rating} />
                    <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Tool badge */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    <img src={tool?.logo_url || ''} alt={tool?.name || ''} className="w-4 h-4 rounded object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=T&background=f1f5f9&color=64748b&size=16`; }} />
                    {tool?.name}
                  </div>
                  {!existingReply && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Needs Reply
                    </span>
                  )}
                </div>
              </div>

              <h4 className="text-slate-900 font-semibold text-sm mb-1.5">{review.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">{review.body}</p>

              {(review.pros || review.cons) && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {review.pros && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-green-700 mb-1">Pros</p>
                      <p className="text-xs text-green-700 leading-relaxed">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-red-700 mb-1">Cons</p>
                      <p className="text-xs text-red-700 leading-relaxed">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-slate-400">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{review.helpful_count} people found this helpful</span>
              </div>
            </div>

            {/* Existing reply */}
            {existingReply && (
              <div className="px-5 pb-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#F59E0B' }}>
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold text-blue-800">Your Reply</span>
                    <span className="text-xs text-blue-400 ml-auto">
                      {review.founder_reply ? new Date(review.founder_reply.created_at).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">{existingReply}</p>
                  <button
                    onClick={() => { setReplyingTo(review.id); setReplyTexts(prev => ({ ...prev, [review.id]: existingReply })); }}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Edit3 className="w-3 h-3" /> Edit reply
                  </button>
                </div>
              </div>
            )}

            {/* Reply form */}
            {!existingReply || isReplying ? (
              <div className="px-5 pb-5">
                {!isReplying ? (
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 py-2 px-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
                  >
                    <Reply className="w-4 h-4" /> Reply to this review
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-slate-800">Write your reply</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
                      <p className="text-xs text-amber-700 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        Tip: Thank the reviewer, address their concerns professionally, and mention any improvements you've made. Replies are public and visible to all users.
                      </p>
                    </div>
                    <textarea
                      value={replyTexts[review.id] || ''}
                      onChange={e => setReplyTexts(prev => ({ ...prev, [review.id]: e.target.value }))}
                      placeholder="Thank you for your review! We appreciate your feedback..."
                      rows={4}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none bg-white"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => submitReply(review.id)}
                        className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl transition-colors"
                        style={{ background: '#F59E0B' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#D97706')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}
                      >
                        <Check className="w-3.5 h-3.5" /> Post Reply
                      </button>
                      <button onClick={() => setReplyingTo(null)} className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
                        Cancel
                      </button>
                      <span className="ml-auto text-xs text-slate-400">{(replyTexts[review.id] || '').length} chars</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ─── Deals Tab ────────────────────────────────────────────────────────────────
function DealsTab() {
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [showCreate, setShowCreate] = useState(false);
  const [newDeal, setNewDeal] = useState({ title: '', code: '', discount: '', type: 'Percentage', expires: '', maxUses: '' });

  const toggleDeal = (id: string) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d));
    const deal = deals.find(d => d.id === id);
    toast.success(`Deal "${deal?.title}" ${deal?.active ? 'deactivated' : 'activated'}`);
  };

  const deleteDeal = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
    toast.success('Deal deleted');
  };

  const createDeal = () => {
    if (!newDeal.title || !newDeal.code || !newDeal.discount) {
      toast.error('Please fill in all required fields');
      return;
    }
    const deal = {
      id: `d${Date.now()}`,
      toolId: '1',
      title: newDeal.title,
      code: newDeal.code.toUpperCase(),
      discount: newDeal.discount,
      type: newDeal.type,
      expires: newDeal.expires,
      uses: 0,
      maxUses: Number(newDeal.maxUses) || 999,
      active: true,
    };
    setDeals(prev => [deal, ...prev]);
    setShowCreate(false);
    setNewDeal({ title: '', code: '', discount: '', type: 'Percentage', expires: '', maxUses: '' });
    toast.success('Deal created successfully!');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-900 font-bold text-lg">Deals & Offers</h3>
            <p className="text-slate-500 text-sm">{deals.filter(d => d.active).length} active deals · {deals.reduce((s, d) => s + d.uses, 0)} total redemptions</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl transition-colors"
            style={{ background: '#F59E0B' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#D97706')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F59E0B')}
          >
            <PlusCircle className="w-4 h-4" /> Create Deal
          </button>
        </div>
      </div>

      {/* Create deal form */}
      {showCreate && (
        <div className="bg-white border border-amber-200 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF 100%)' }}>
          <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-500" /> Create New Deal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {[
              { label: 'Deal Title *', key: 'title', placeholder: 'e.g. 40% off annual plan' },
              { label: 'Promo Code *', key: 'code', placeholder: 'e.g. LAUD40' },
              { label: 'Discount Value *', key: 'discount', placeholder: 'e.g. 40% or $50' },
              { label: 'Max Uses', key: 'maxUses', placeholder: 'e.g. 500 (leave blank for unlimited)' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1.5">{label}</label>
                <input
                  value={newDeal[key as keyof typeof newDeal]}
                  onChange={e => setNewDeal(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1.5">Deal Type</label>
              <select value={newDeal.type} onChange={e => setNewDeal(prev => ({ ...prev, type: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:border-amber-400 cursor-pointer">
                {['Percentage', 'Fixed Amount', 'Free Trial', 'Extended Trial', 'Free Plan'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1.5">Expiry Date</label>
              <input type="date" value={newDeal.expires} onChange={e => setNewDeal(prev => ({ ...prev, expires: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={createDeal} className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl" style={{ background: '#F59E0B' }}>
              <Check className="w-3.5 h-3.5" /> Create Deal
            </button>
            <button onClick={() => setShowCreate(false)} className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Deals list */}
      {deals.map(deal => {
        const tool = MOCK_TOOLS.find(t => t.id === deal.toolId);
        const usePct = deal.maxUses > 0 ? (deal.uses / deal.maxUses) * 100 : 0;
        const isExpired = deal.expires && new Date(deal.expires) < new Date();

        return (
          <div key={deal.id} className={`bg-white border rounded-2xl p-5 transition-all ${deal.active && !isExpired ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: deal.active && !isExpired ? '#FFFBEB' : '#F8FAFC', border: '1px solid', borderColor: deal.active && !isExpired ? '#FDE68A' : '#E2E8F0' }}>
                <Tag className="w-5 h-5" style={{ color: deal.active && !isExpired ? '#F59E0B' : '#94A3B8' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="text-slate-900 font-bold text-sm">{deal.title}</h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${deal.active && !isExpired ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isExpired ? 'Expired' : deal.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{deal.type}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg">
                    {deal.code}
                  </div>
                  <span className="text-sm font-bold text-amber-600">{deal.discount} off</span>
                  {deal.expires && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" /> Expires {new Date(deal.expires).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
                {/* Usage bar */}
                <div className="mb-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">{deal.uses} / {deal.maxUses} uses</span>
                    <span className="text-xs font-semibold text-slate-700">{Math.round(usePct)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(usePct, 100)}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleDeal(deal.id)} className={`p-2 rounded-xl transition-colors ${deal.active ? 'text-green-500 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-50'}`}>
                  {deal.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => deleteDeal(deal.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const TOOL_BREAKDOWN = FOUNDER_TOOLS.map((tool, i) => ({
    name: tool.name,
    views: Math.round(tool.rank_score * (7.4 - i * 1.2)),
    clicks: Math.round(tool.rank_score * (1.8 - i * 0.3)),
    reviews: tool.review_count,
    rating: tool.average_rating,
    color: ['#3B82F6', '#F59E0B', '#22C55E'][i],
  }));

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-slate-900 font-bold text-lg">Analytics</h3>
            <p className="text-slate-500 text-sm">Performance data across all your tools</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {(['week', 'month', 'quarter'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {p === 'quarter' ? '3 Months' : `This ${p.charAt(0).toUpperCase() + p.slice(1)}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Page Views" value="74,200" change="+18%" positive icon={<Eye className="w-4 h-4" />} color="#3B82F6" />
        <StatCard label="Outbound Clicks" value="21,000" change="+31%" positive icon={<ExternalLink className="w-4 h-4" />} color="#22C55E" />
        <StatCard label="Click-Through Rate" value="28.3%" change="+3.1%" positive icon={<Target className="w-4 h-4" />} color="#F59E0B" />
        <StatCard label="Deal Redemptions" value="298" change="+45%" positive icon={<Tag className="w-4 h-4" />} color="#8B5CF6" />
      </div>

      {/* Views chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-5">Views & Clicks Over Time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={CHART_VIEWS} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="analyticsViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="analyticsClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: '12px' }} />
            <Area type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} fill="url(#analyticsViews)" name="Views" />
            <Area type="monotone" dataKey="clicks" stroke="#F59E0B" strokeWidth={2} fill="url(#analyticsClicks)" name="Clicks" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-tool breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-4">Per-Tool Breakdown</h3>
        <div className="space-y-4">
          {TOOL_BREAKDOWN.map(tool => (
            <div key={tool.name} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: tool.color }} />
                <span className="text-slate-900 font-bold text-sm">{tool.name}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-slate-700">{tool.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Views', value: tool.views.toLocaleString() },
                  { label: 'Clicks', value: tool.clicks.toLocaleString() },
                  { label: 'Reviews', value: tool.reviews.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center bg-white rounded-xl p-2 border border-slate-100">
                    <div className="text-sm font-black text-slate-900">{value}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-5">New Reviews Per Month</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={CHART_VIEWS} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: '12px' }} />
            <Bar dataKey="reviews" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Reviews" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Promote Tab ──────────────────────────────────────────────────────────────
function PromoteTab() {
  const PROMO_OPTIONS = [
    {
      id: 'featured',
      icon: Star,
      title: 'Featured Listing',
      desc: 'Get your tool pinned at the top of the homepage and category pages for maximum visibility.',
      price: '$99/month',
      features: ['Homepage spotlight', 'Category page pin', 'Featured badge', 'Priority in search'],
      color: '#F59E0B',
      bg: '#FFFBEB',
      border: '#FDE68A',
      popular: true,
    },
    {
      id: 'newsletter',
      icon: Mail,
      title: 'Newsletter Feature',
      desc: 'Get featured in our weekly newsletter sent to 12,000+ professionals and founders.',
      price: '$149/issue',
      features: ['12,000+ subscribers', 'Dedicated section', 'Custom copy', 'Click tracking'],
      color: '#3B82F6',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      popular: false,
    },
    {
      id: 'social',
      icon: Twitter,
      title: 'Social Spotlight',
      desc: 'We\'ll feature your tool in our social media posts across Twitter, LinkedIn, and Product Hunt.',
      price: '$79/post',
      features: ['Twitter + LinkedIn', 'Custom graphics', 'Founder interview', 'Engagement boost'],
      color: '#8B5CF6',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      popular: false,
    },
    {
      id: 'badge',
      icon: Award,
      title: 'LaudStack Pick Badge',
      desc: 'Earn the coveted LaudStack Pick badge for your tool — a trust signal that converts.',
      price: 'Apply Free',
      features: ['Editorial review', 'Permanent badge', 'Press kit assets', 'Blog feature'],
      color: '#22C55E',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      popular: false,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold text-lg">Promote Your Tools</h3>
        <p className="text-slate-500 text-sm mt-1">Reach more buyers and grow your user base with LaudStack's promotion options.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-slate-900">12K+</div>
          <div className="text-xs text-slate-500 mt-0.5">Monthly Visitors</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-slate-900">95+</div>
          <div className="text-xs text-slate-500 mt-0.5">Tools Listed</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-slate-900">4.8★</div>
          <div className="text-xs text-slate-500 mt-0.5">Platform Rating</div>
        </div>
      </div>

      {/* Promotion options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROMO_OPTIONS.map(opt => {
          const Icon = opt.icon;
          return (
            <div key={opt.id} className={`bg-white border rounded-2xl p-5 relative ${opt.popular ? 'border-amber-300 shadow-sm' : 'border-slate-200'}`}>
              {opt.popular && (
                <div className="absolute -top-3 left-5">
                  <span className="text-xs font-bold text-white bg-amber-500 px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: opt.bg, border: `1px solid ${opt.border}` }}>
                  <Icon className="w-5 h-5" style={{ color: opt.color }} />
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold">{opt.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{opt.desc}</p>
                </div>
              </div>
              <ul className="space-y-1.5 mb-4">
                {opt.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: opt.color }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-slate-900">{opt.price}</span>
                <button
                  onClick={() => toast.info(`${opt.title} — contact us at founders@laudstack.com`)}
                  className="text-sm font-bold text-white px-4 py-2 rounded-xl transition-colors"
                  style={{ background: opt.color }}
                >
                  Get Started
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom CTA */}
      <div className="rounded-2xl p-5 border border-slate-200" style={{ background: 'linear-gradient(135deg, #171717 0%, #1e293b 100%)' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F59E0B' }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">Need a custom promotion?</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">We offer custom partnership packages for high-growth tools. Let's talk about what works best for your goals.</p>
            <button
              onClick={() => toast.info('Email us at founders@laudstack.com for custom packages')}
              className="flex items-center gap-2 text-sm font-bold text-slate-900 px-4 py-2 rounded-xl transition-all"
              style={{ background: '#F59E0B' }}
            >
              Contact Us <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function FounderSettingsTab({ user }: { user: { name: string; email: string } }) {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [newReviews, setNewReviews] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [dealAlerts, setDealAlerts] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  const [founderName, setFounderName] = useState(user.name);
  const [founderBio, setFounderBio] = useState('Building tools that help teams work smarter. Founder of multiple SaaS products.');
  const [founderTwitter, setFounderTwitter] = useState('@founder');
  const [founderLinkedin, setFounderLinkedin] = useState('');
  const [founderWebsite, setFounderWebsite] = useState('');

  const handleSave = () => toast.success('Founder profile saved successfully');

  return (
    <div className="space-y-5">
      {/* Founder profile */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" /> Founder Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {[
            { label: 'Display Name', value: founderName, onChange: setFounderName, placeholder: 'Your name' },
            { label: 'Twitter / X', value: founderTwitter, onChange: setFounderTwitter, placeholder: '@handle' },
            { label: 'LinkedIn URL', value: founderLinkedin, onChange: setFounderLinkedin, placeholder: 'linkedin.com/in/...' },
            { label: 'Personal Website', value: founderWebsite, onChange: setFounderWebsite, placeholder: 'https://yoursite.com' },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1.5">{label}</label>
              <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1.5">Founder Bio</label>
          <textarea value={founderBio} onChange={e => setFounderBio(e.target.value)} rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none" />
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-xl" style={{ background: '#F59E0B' }}>
          <Save className="w-3.5 h-3.5" /> Save Profile
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" /> Founder Notifications
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Email notifications', desc: 'Receive all notifications via email', value: emailNotifs, onChange: setEmailNotifs },
            { label: 'New reviews', desc: 'When someone reviews one of your tools', value: newReviews, onChange: setNewReviews },
            { label: 'Weekly performance report', desc: 'Summary of views, clicks, and reviews', value: weeklyReport, onChange: setWeeklyReport },
            { label: 'Deal alerts', desc: 'When your deals are running low on uses', value: dealAlerts, onChange: setDealAlerts },
          ].map(({ label, desc, value, onChange }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-500" /> Privacy
        </h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-semibold text-slate-800">Public founder profile</p>
            <p className="text-xs text-slate-500 mt-0.5">Show your name and bio on tool listings</p>
          </div>
          <Toggle value={publicProfile} onChange={setPublicProfile} />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-100 rounded-2xl p-5">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" /> Danger Zone
        </h3>
        <button
          onClick={() => toast.error('Please contact support to remove your tools.')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left w-full border border-transparent hover:border-red-100"
        >
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Remove All Tools</p>
            <p className="text-xs text-slate-400">Permanently remove all your tools from LaudStack</p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FounderDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { isAuthenticated, user, loading, signIn } = useAuth();
  const pendingReplies = MOCK_REVIEWS.filter(r => !r.founder_reply).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div style={{ height: '72px' }} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-amber-400 border-t-transparent animate-spin mx-auto mb-3" style={{ borderWidth: '3px', borderStyle: 'solid', borderTopColor: 'transparent' }} />
            <p className="text-slate-500 text-sm font-medium">Loading Founder Dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div style={{ height: '72px' }} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-slate-900 font-black text-2xl mb-2">Founder Dashboard</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Sign in to manage your tools, reply to reviews, create deals, and access analytics.</p>
            <button
              onClick={signIn}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all"
              style={{ background: '#F59E0B', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}
            >
              Sign In with Manus <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ height: '72px' }} />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* ── Sidebar ── */}
          <aside className="w-64 flex-shrink-0 hidden md:block">
            {/* Founder card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-black text-slate-900 flex-shrink-0" style={{ background: '#F59E0B' }}>
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 font-bold text-sm truncate">{user.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-amber-600 font-bold">Founder</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-3 border-t border-slate-100">
                <div className="text-center">
                  <div className="text-sm font-black text-slate-900">{FOUNDER_TOOLS.length}</div>
                  <div className="text-xs text-slate-400">Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-black text-slate-900">{MOCK_REVIEWS.slice(0, 12).length}</div>
                  <div className="text-xs text-slate-400">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-black text-amber-500">{pendingReplies}</div>
                  <div className="text-xs text-slate-400">Pending</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white border border-slate-200 rounded-2xl p-2 mb-4">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group mb-0.5 last:mb-0 ${
                    activeTab === tab.id ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={`${activeTab === tab.id ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
                    {tab.icon}
                  </span>
                  <span className="text-sm font-semibold flex-1">{tab.label}</span>
                  {tab.id === 'reviews' && pendingReplies > 0 && (
                    <span className="text-xs font-bold text-white bg-amber-400 rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingReplies}
                    </span>
                  )}
                  {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </nav>

            {/* User Dashboard link */}
            <div className="rounded-2xl p-4 border border-slate-200 bg-white">
              <User2 className="w-5 h-5 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700 mb-1">User Dashboard</p>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">View your reviews, saved tools, and profile.</p>
              <Link href="/dashboard">
                <button className="w-full text-xs font-semibold text-slate-600 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                  Go to User Dashboard
                </button>
              </Link>
            </div>
          </aside>

          {/* ── Mobile tab bar ── */}
          <div className="md:hidden w-full mb-4 self-start">
            <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    activeTab === tab.id ? 'bg-amber-400 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.id === 'reviews' && pendingReplies > 0 && (
                    <span className="text-xs font-bold bg-white text-amber-600 rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingReplies}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            <div className="mb-5">
              <h1 className="text-slate-900 font-black text-xl flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                {TABS.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {activeTab === 'overview' && 'Your founder performance at a glance'}
                {activeTab === 'tools' && 'Manage your listed tools and their details'}
                {activeTab === 'reviews' && 'Respond to reviews and engage with your users'}
                {activeTab === 'deals' && 'Create and manage exclusive deals for LaudStack users'}
                {activeTab === 'analytics' && 'Deep dive into your tools\' performance data'}
                {activeTab === 'promote' && 'Boost your tools\' visibility on LaudStack'}
                {activeTab === 'settings' && 'Manage your founder profile and preferences'}
              </p>
            </div>

            {activeTab === 'overview'  && <OverviewTab onTabChange={setActiveTab} />}
            {activeTab === 'tools'     && <ToolsTab />}
            {activeTab === 'reviews'   && <ReviewsTab />}
            {activeTab === 'deals'     && <DealsTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'promote'   && <PromoteTab />}
            {activeTab === 'settings'  && <FounderSettingsTab user={user} />}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ─── Inline icon (not in lucide-react) ───────────────────────────────────────
function User2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
