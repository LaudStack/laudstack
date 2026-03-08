// LaudStack — Founder Dashboard
// Design: Dark sidebar, amber accents, analytics-focused layout

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BarChart3, Star, MessageSquare, TrendingUp, Eye, ChevronRight,
  Settings, Zap, Bell, Shield, Edit3, ExternalLink, CheckCircle,
  AlertCircle, Clock, ArrowUpRight, ArrowDownRight, Users,
  Package, PlusCircle, Crown, Rocket
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_TOOLS, MOCK_REVIEWS } from '@/lib/mockData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Tab = 'overview' | 'tools' | 'reviews' | 'analytics' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',   label: 'Overview',     icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'tools',      label: 'My Tools',     icon: <Package className="w-4 h-4" /> },
  { id: 'reviews',    label: 'Reviews',      icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'analytics',  label: 'Analytics',    icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'settings',   label: 'Settings',     icon: <Settings className="w-4 h-4" /> },
];

// Mock founder tools — first 3 tools from mock data
const FOUNDER_TOOLS = MOCK_TOOLS.slice(0, 3);

function StatCard({ label, value, change, icon, positive }: { label: string; value: string | number; change?: string; icon: React.ReactNode; positive?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 text-sm">{label}</span>
        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">{icon}</div>
      </div>
      <div className="text-slate-900 font-black text-2xl mb-1">{value}</div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change} vs last month
        </div>
      )}
    </div>
  );
}

function OverviewTab() {
  const totalReviews = FOUNDER_TOOLS.reduce((s, t) => s + t.review_count, 0);
  const avgRating = FOUNDER_TOOLS.reduce((s, t) => s + t.average_rating, 0) / FOUNDER_TOOLS.length;
  const totalUpvotes = FOUNDER_TOOLS.reduce((s, t) => s + t.upvote_count, 0);
  const totalViews = FOUNDER_TOOLS.reduce((s, t) => s + t.rank_score * 10, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Profile Views" value={Math.round(totalViews).toLocaleString()} change="+12%" positive icon={<Eye className="w-4 h-4 text-sky-500" />} />
        <StatCard label="Total Reviews" value={totalReviews} change="+8%" positive icon={<MessageSquare className="w-4 h-4 text-amber-500" />} />
        <StatCard label="Avg Rating" value={avgRating.toFixed(1)} change="+0.2" positive icon={<Star className="w-4 h-4 text-amber-400" />} />
        <StatCard label="Total Upvotes" value={totalUpvotes.toLocaleString()} change="+23%" positive icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
      </div>

      {/* Tools summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-bold flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            Your Tools
          </h3>
          <Link href="/launchpad">
            <button className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium">
              <PlusCircle className="w-3.5 h-3.5" />
              Add Tool
            </button>
          </Link>
        </div>
        <div className="space-y-3">
          {FOUNDER_TOOLS.map(tool => (
            <div key={tool.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <img src={tool.logo_url} alt={tool.name} className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=f1f5f9&color=64748b&size=40`; }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 font-semibold text-sm truncate">{tool.name}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex-shrink-0">Live</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{tool.average_rating.toFixed(1)}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><MessageSquare className="w-3 h-3" />{tool.review_count} reviews</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><TrendingUp className="w-3 h-3" />{tool.upvote_count} upvotes</span>
                </div>
              </div>
              <Link href={`/tools/${tool.slug}`}>
                <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent reviews */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            Recent Reviews
          </h3>
          <button onClick={() => toast.info('View all reviews coming soon')} className="text-sm text-amber-600 hover:text-amber-700 font-medium">View all →</button>
        </div>
        <div className="space-y-4">
          {MOCK_REVIEWS.slice(0, 3).map(review => {
            const tool = MOCK_TOOLS.find(t => t.id === review.tool_id);
            return (
              <div key={review.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-semibold text-sm">{review.user?.name}</span>
                    <span className="text-slate-400 text-xs">on {tool?.name}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                  </div>
                </div>
                <p className="text-slate-600 text-sm">{review.body.slice(0, 120)}...</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => toast.success('Reply feature coming soon')} className="text-xs text-amber-600 hover:text-amber-700 font-medium">Reply as Founder</button>
                  <span className="text-slate-400 text-xs">{review.created_at}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ToolsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 font-bold">{FOUNDER_TOOLS.length} Active Listings</h3>
        <Link href="/launchpad">
          <button className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-xl transition-colors text-sm">
            <PlusCircle className="w-4 h-4" />
            Submit New Tool
          </button>
        </Link>
      </div>
      {FOUNDER_TOOLS.map(tool => (
        <div key={tool.id} className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <img src={tool.logo_url} alt={tool.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200"
              onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=f1f5f9&color=64748b&size=56`; }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-slate-900 font-bold">{tool.name}</h4>
                    <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Live</span>
                    {tool.badges.includes('featured') && (
                      <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" />Featured
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm">{tool.tagline}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toast.info('Edit listing coming soon')} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <Link href={`/tools/${tool.slug}`}>
                    <button className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'Rating', value: tool.average_rating.toFixed(1), icon: <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> },
                  { label: 'Reviews', value: tool.review_count, icon: <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> },
                  { label: 'Upvotes', value: tool.upvote_count, icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> },
                  { label: 'Rank', value: `#${MOCK_TOOLS.findIndex(t => t.id === tool.id) + 1}`, icon: <BarChart3 className="w-3.5 h-3.5 text-sky-500" /> },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-50 rounded-lg p-2.5 text-center">
                    <div className="flex justify-center mb-1">{stat.icon}</div>
                    <div className="text-slate-900 font-bold text-sm">{stat.value}</div>
                    <div className="text-slate-400 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewsTab() {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 font-bold">{MOCK_REVIEWS.length} Reviews Across All Tools</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
            {MOCK_REVIEWS.filter(r => !r.is_verified_purchase).length} need response
          </span>
        </div>
      </div>
      {MOCK_REVIEWS.slice(0, 5).map(review => {
        const tool = MOCK_TOOLS.find(t => t.id === review.tool_id);
        return (
          <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                  {review.user?.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-semibold text-sm">{review.user?.name}</span>
                    {review.is_verified_purchase && <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">Verified</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                    </div>
                    <span className="text-slate-400 text-xs">on {tool?.name}</span>
                    <span className="text-slate-400 text-xs">· {review.created_at}</span>
                  </div>
                </div>
              </div>
            </div>
            <h4 className="text-slate-900 font-semibold text-sm mb-1">{review.title}</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">{review.body}</p>
            {replyingTo === review.id ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
                <p className="text-amber-700 text-xs font-semibold mb-2">Reply as Founder</p>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a professional, helpful response..."
                  rows={3}
                  className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-400 resize-none"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => { toast.success('Reply submitted'); setReplyingTo(null); setReplyText(''); }}
                    className="text-sm bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-1.5 rounded-lg transition-colors">
                    Submit Reply
                  </button>
                  <button onClick={() => { setReplyingTo(null); setReplyText(''); }}
                    className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setReplyingTo(review.id)}
                className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium mt-1">
                <MessageSquare className="w-3.5 h-3.5" />
                Reply as Founder
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AnalyticsTab() {
  const viewsData = [
    { month: 'Oct', views: 1200, clicks: 340, upvotes: 28 },
    { month: 'Nov', views: 1850, clicks: 520, upvotes: 45 },
    { month: 'Dec', views: 2100, clicks: 610, upvotes: 52 },
    { month: 'Jan', views: 1900, clicks: 490, upvotes: 41 },
    { month: 'Feb', views: 2800, clicks: 780, upvotes: 67 },
    { month: 'Mar', views: 3400, clicks: 940, upvotes: 89 },
  ];

  const trafficData = [
    { name: 'Search', value: 42, color: '#F59E0B' },
    { name: 'Direct', value: 28, color: '#6366F1' },
    { name: 'Browse', value: 18, color: '#10B981' },
    { name: 'Leaderboard', value: 12, color: '#3B82F6' },
  ];

  const sentimentData = [
    { month: 'Oct', positive: 72, neutral: 18, negative: 10 },
    { month: 'Nov', positive: 68, neutral: 22, negative: 10 },
    { month: 'Dec', positive: 75, neutral: 17, negative: 8 },
    { month: 'Jan', positive: 70, neutral: 20, negative: 10 },
    { month: 'Feb', positive: 78, neutral: 15, negative: 7 },
    { month: 'Mar', positive: 82, neutral: 12, negative: 6 },
  ];

  const ratingDist = [5,4,3,2,1].map(stars => ({
    stars: `${stars}★`,
    count: MOCK_REVIEWS.filter(r => r.rating === stars).length,
    fill: stars >= 4 ? '#F59E0B' : stars === 3 ? '#94A3B8' : '#EF4444',
  }));

  return (
    <div className="space-y-6">
      {/* Views + Clicks Area Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold mb-1 flex items-center gap-2">
          <Eye className="w-4 h-4 text-sky-500" />
          Profile Views & Click-throughs (Last 6 Months)
        </h3>
        <p className="text-slate-500 text-sm mb-4">Combined across all your tool listings</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={viewsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="views" stroke="#F59E0B" strokeWidth={2} fill="url(#viewsGrad)" name="Views" />
            <Area type="monotone" dataKey="clicks" stroke="#6366F1" strokeWidth={2} fill="url(#clicksGrad)" name="Clicks" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traffic Sources Pie */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Traffic Sources
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={trafficData} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={3}>
                  {trafficData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {trafficData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-slate-600 text-xs">{item.name}</span>
                  </div>
                  <span className="text-slate-900 font-bold text-xs">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rating Distribution Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Rating Distribution
          </h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={ratingDist} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="stars" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Reviews">
                {ratingDist.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Review Sentiment Stacked Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold mb-1 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          Review Sentiment Trend
        </h3>
        <p className="text-slate-500 text-sm mb-4">Positive, neutral, and negative review breakdown over time</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={sentimentData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="positive" stackId="a" fill="#10B981" name="Positive" radius={[0,0,0,0]} />
            <Bar dataKey="neutral" stackId="a" fill="#94A3B8" name="Neutral" />
            <Bar dataKey="negative" stackId="a" fill="#EF4444" name="Negative" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Upvote trend */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          Upvote Trend
        </h3>
        <p className="text-slate-500 text-sm mb-4">Monthly upvotes across all your tools</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={viewsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="upvoteGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
            <Area type="monotone" dataKey="upvotes" stroke="#10B981" strokeWidth={2} fill="url(#upvoteGrad)" name="Upvotes" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FounderSettingsTab() {
  return (
    <div className="space-y-6">
      {/* Listing settings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-400" />
          Listing Preferences
        </h3>
        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-slate-900 font-medium">Review notifications</p>
              <p className="text-slate-500 text-xs">Get notified when you receive a new review</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Enabled</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-slate-900 font-medium">Weekly analytics digest</p>
              <p className="text-slate-500 text-xs">Summary of views, reviews, and rankings every Monday</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Enabled</span>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-400/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Crown className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-slate-900 font-bold mb-1">Upgrade to Pro Listing</h3>
            <p className="text-slate-600 text-sm mb-4">Get priority review, featured placement, verified badge, and advanced analytics for your tools.</p>
            <button onClick={() => toast.info('Pro listings coming soon — join the waitlist!')}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <Rocket className="w-4 h-4" />
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FounderDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div style={{ height: '72px' }} />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <Rocket className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h2 className="text-slate-900 font-black text-2xl mb-2">Founder Dashboard</h2>
          <p className="text-slate-500 mb-6">Sign in to manage your tool listings, respond to reviews, and view analytics.</p>
          <button onClick={() => navigate('/signin?return=/dashboard/founder')}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors">
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-slate-900 font-black text-2xl">Founder Dashboard</h1>
              <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">Beta</span>
            </div>
            <p className="text-slate-500 text-sm">Manage your listings, respond to reviews, and track performance</p>
          </div>
          <Link href="/launchpad">
            <button className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
              <PlusCircle className="w-4 h-4" />
              Submit Tool
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1 sticky top-24">
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
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </button>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2">
                <Link href="/dashboard">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all text-left">
                    <Users className="w-4 h-4" />
                    User Dashboard
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview'  && <OverviewTab />}
            {activeTab === 'tools'     && <ToolsTab />}
            {activeTab === 'reviews'   && <ReviewsTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'settings'  && <FounderSettingsTab />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
