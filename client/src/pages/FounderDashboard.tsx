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
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { trpc } from '@/lib/trpc';
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



function StatCard({ label, value, change, icon, positive }: { label: string; value: string | number; change?: string; icon: React.ReactNode; positive?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 text-sm">{label}</span>
        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">{icon}</div>
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

function OverviewTab() {
  const { data: myStacks, isLoading } = trpc.founder.myStacks.useQuery();
  const stacks = myStacks ?? [];
  const totalReviews = stacks.reduce((s: number, t: any) => s + (t.reviewCount || 0), 0);
  const avgRating = stacks.length > 0 ? stacks.reduce((s: number, t: any) => s + parseFloat(t.averageRating || '0'), 0) / stacks.length : 0;
  const totalLauds = stacks.reduce((s: number, t: any) => s + (t.laudCount || 0), 0);
  const totalViews = stacks.reduce((s: number, t: any) => s + (t.viewCount || 0), 0);

  if (isLoading) return <div className="text-center py-12 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={<Eye className="w-4 h-4 text-sky-500" />} />
        <StatCard label="Total Reviews" value={totalReviews} icon={<MessageSquare className="w-4 h-4 text-amber-500" />} />
        <StatCard label="Avg Rating" value={avgRating.toFixed(1)} icon={<Star className="w-4 h-4 text-amber-400" />} />
        <StatCard label="Total Lauds" value={totalLauds.toLocaleString()} icon={<TrendingUp className="w-4 h-4 text-green-500" />} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-bold flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            Your Stacks ({stacks.length})
          </h3>
          <Link href="/launchpad">
            <button className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium">
              <PlusCircle className="w-3.5 h-3.5" />
              Add Stack
            </button>
          </Link>
        </div>
        {stacks.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No stacks yet. Submit your first tool on LaunchPad!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stacks.map((stack: any) => (
              <div key={stack.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <img src={stack.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(stack.name)}&background=f1f5f9&color=64748b&size=40`} alt={stack.name} className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-semibold text-sm truncate">{stack.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${stack.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {stack.status === 'published' ? 'Live' : stack.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-slate-500"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{parseFloat(stack.averageRating || '0').toFixed(1)}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500"><MessageSquare className="w-3 h-3" />{stack.reviewCount} reviews</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500"><TrendingUp className="w-3 h-3" />{stack.laudCount} lauds</span>
                  </div>
                </div>
                <Link href={`/tools/${stack.slug}`}>
                  <button className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolsTab() {
  const { data: myStacks } = trpc.founder.myStacks.useQuery();
  const stacks = myStacks ?? [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 font-bold">{stacks.length} Listings</h3>
        <Link href="/launchpad">
          <button className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-xl transition-colors text-sm">
            <PlusCircle className="w-4 h-4" />
            Submit New Tool
          </button>
        </Link>
      </div>
      {stacks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No stacks yet. Launch your first tool!</p>
        </div>
      ) : stacks.map((stack: any) => (
        <div key={stack.id} className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <img src={stack.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(stack.name)}&background=f1f5f9&color=64748b&size=56`} alt={stack.name} className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-slate-900 font-bold">{stack.name}</h4>
                    <span className={`text-xs border px-2 py-0.5 rounded-full ${stack.status === 'published' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                      {stack.status === 'published' ? 'Live' : stack.status}
                    </span>
                    {stack.isFeatured && (
                      <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" />Featured
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm">{stack.tagline}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/tools/${stack.slug}`}>
                    <button className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'Rating', value: parseFloat(stack.averageRating || '0').toFixed(1), icon: <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> },
                  { label: 'Reviews', value: stack.reviewCount, icon: <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> },
                  { label: 'Lauds', value: stack.laudCount, icon: <TrendingUp className="w-3.5 h-3.5 text-green-500" /> },
                  { label: 'Views', value: stack.viewCount, icon: <Eye className="w-3.5 h-3.5 text-sky-500" /> },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-50 rounded-lg p-2.5 text-center">
                    <div className="flex justify-center mb-1">{stat.icon}</div>
                    <div className="text-slate-900 font-bold text-sm">{stat.value}</div>
                    <div className="text-slate-500 text-xs">{stat.label}</div>
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
  const { data: myStacks } = trpc.founder.myStacks.useQuery();
  const stackIds = (myStacks ?? []).map((s: any) => s.id);
  // For now show a placeholder — reviews will be fetched per-stack
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 font-bold">Reviews on Your Stacks</h3>
      </div>
      {stackIds.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No stacks yet — reviews will appear here once you launch a tool.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No reviews yet. Share your stacks to get community feedback!</p>
        </div>
      )}
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
    { name: 'Browse', value: 18, color: '#22C55E' },
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
    count: 0,
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
          <MessageSquare className="w-4 h-4 text-green-500" />
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
            <Bar dataKey="positive" stackId="a" fill="#22C55E" name="Positive" radius={[0,0,0,0]} />
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
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
            <Area type="monotone" dataKey="upvotes" stroke="#22C55E" strokeWidth={2} fill="url(#upvoteGrad)" name="Upvotes" />
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
          <Rocket className="w-14 h-14 text-slate-600 mx-auto mb-4" />
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

      <div className="max-w-[1300px] mx-auto px-4 py-8">
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
