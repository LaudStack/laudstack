/**
 * AdminDashboard — LaudStack Admin Panel
 * Full CRUD for stacks, moderation controls, stats overview
 */
import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, Package, Plus, Search, Shield, Star,
  TrendingUp, Users, Eye, MousePointer, ChevronRight,
  Edit, Trash2, CheckCircle, XCircle, Sparkles, Flame,
  BarChart3, RefreshCw, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'stacks' | 'add' | 'verifications' | 'users'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Sign in required</h2>
          <Button onClick={() => { window.location.href = getLoginUrl(); }}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-4">You need admin privileges to access this page.</p>
          <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col" style={{ minHeight: '100vh' }}>
        <div className="p-5 border-b border-gray-100">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to site
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-3">
          {[
            { id: 'overview' as const, icon: LayoutDashboard, label: 'Overview' },
            { id: 'stacks' as const, icon: Package, label: 'Manage Stacks' },
            { id: 'add' as const, icon: Plus, label: 'Add Stack' },
            { id: 'verifications' as const, icon: CheckCircle, label: 'Verifications' },
            { id: 'users' as const, icon: Users, label: 'Users' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setPage(0); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                activeTab === item.id
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-gray-400 text-xs">Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'stacks' && (
            <StacksTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              page={page}
              setPage={setPage}
              onEdit={(id) => navigate(`/admin/stacks/${id}`)}
            />
          )}
          {activeTab === 'add' && <AddStackTab onSuccess={() => { setActiveTab('stacks'); toast.success('Stack created!'); }} />}
          {activeTab === 'verifications' && <VerificationsTab />}
          {activeTab === 'users' && <UsersTab />}
        </div>
      </main>
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab() {
  const stats = trpc.admin.dashboardStats.useQuery();
  const recalc = trpc.admin.recalcRankings.useMutation({
    onSuccess: () => toast.success('Rankings recalculated!'),
    onError: (e) => toast.error(e.message),
  });

  const cards = [
    { label: 'Total Stacks', value: stats.data?.totalStacks ?? 0, icon: Package, color: '#F59E0B' },
    { label: 'Total Users', value: stats.data?.totalUsers ?? 0, icon: Users, color: '#3B82F6' },
    { label: 'Total Reviews', value: stats.data?.totalReviews ?? 0, icon: Star, color: '#22C55E' },
    { label: 'Total Lauds', value: stats.data?.totalLauds ?? 0, icon: TrendingUp, color: '#8B5CF6' },
    { label: 'Pending Verifications', value: stats.data?.pendingVerifications ?? 0, icon: CheckCircle, color: '#EF4444' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => recalc.mutate()}
          disabled={recalc.isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${recalc.isPending ? 'animate-spin' : ''}`} />
          Recalc Rankings
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: card.color + '15' }}>
              <card.icon className="w-6 h-6" style={{ color: card.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.isLoading ? '...' : card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stacks Management Tab ──────────────────────────────────────────────────

function StacksTab({
  searchQuery, setSearchQuery, statusFilter, setStatusFilter, page, setPage, onEdit,
}: {
  searchQuery: string; setSearchQuery: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  page: number; setPage: (v: number) => void;
  onEdit: (id: number) => void;
}) {
  const limit = 20;
  const stacksQuery = trpc.admin.listStacks.useQuery({
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    limit,
    offset: page * limit,
  });
  const utils = trpc.useUtils();

  const setStatus = trpc.admin.setStatus.useMutation({
    onSuccess: () => { utils.admin.listStacks.invalidate(); toast.success('Status updated'); },
    onError: (e) => toast.error(e.message),
  });
  const setFeatured = trpc.admin.setFeatured.useMutation({
    onSuccess: () => { utils.admin.listStacks.invalidate(); toast.success('Updated'); },
  });
  const setTrending = trpc.admin.setTrending.useMutation({
    onSuccess: () => { utils.admin.listStacks.invalidate(); toast.success('Updated'); },
  });
  const setVerified = trpc.admin.setVerified.useMutation({
    onSuccess: () => { utils.admin.listStacks.invalidate(); toast.success('Updated'); },
  });
  const deleteStack = trpc.admin.deleteStack.useMutation({
    onSuccess: () => { utils.admin.listStacks.invalidate(); toast.success('Stack deleted'); },
    onError: (e) => toast.error(e.message),
  });

  const stacks = stacksQuery.data?.items ?? [];
  const total = stacksQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Stacks</h2>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            placeholder="Search stacks..."
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="pending_review">Pending Review</option>
          <option value="draft">Draft</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stack</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Lauds</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reviews</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Views</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Flags</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stacksQuery.isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : stacks.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No stacks found</td></tr>
            ) : stacks.map(stack => (
              <tr key={stack.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={stack.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(stack.name)}&background=F59E0B&color=fff&size=40`}
                      alt={stack.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{stack.name}</div>
                      <div className="text-xs text-gray-400">{stack.category} · /{stack.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={stack.status} />
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">{stack.laudCount}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">{stack.reviewCount}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">{stack.viewCount}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {stack.isVerified && <Badge variant="outline" className="text-green-600 border-green-200 text-[10px] px-1.5">Verified</Badge>}
                    {stack.isFeatured && <Badge variant="outline" className="text-blue-600 border-blue-200 text-[10px] px-1.5">Featured</Badge>}
                    {stack.isTrending && <Badge variant="outline" className="text-orange-600 border-orange-200 text-[10px] px-1.5">Trending</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(stack.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {stack.status === 'published' ? (
                      <button
                        onClick={() => setStatus.mutate({ id: stack.id, status: 'suspended' })}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                        title="Suspend"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setStatus.mutate({ id: stack.id, status: 'published' })}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-500"
                        title="Publish"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setVerified.mutate({ id: stack.id, isVerified: !stack.isVerified })}
                      className={`p-1.5 rounded-lg hover:bg-green-50 ${stack.isVerified ? 'text-green-500' : 'text-gray-300'}`}
                      title="Toggle Verified"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setFeatured.mutate({ id: stack.id, isFeatured: !stack.isFeatured })}
                      className={`p-1.5 rounded-lg hover:bg-blue-50 ${stack.isFeatured ? 'text-blue-500' : 'text-gray-300'}`}
                      title="Toggle Featured"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTrending.mutate({ id: stack.id, isTrending: !stack.isTrending })}
                      className={`p-1.5 rounded-lg hover:bg-orange-50 ${stack.isTrending ? 'text-orange-500' : 'text-gray-300'}`}
                      title="Toggle Trending"
                    >
                      <Flame className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${stack.name}"? This cannot be undone.`)) {
                          deleteStack.mutate({ id: stack.id });
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Stack Tab ──────────────────────────────────────────────────────────

function AddStackTab({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: '', slug: '', tagline: '', description: '', websiteUrl: '', affiliateUrl: '',
    category: 'AI Productivity', pricingModel: 'Freemium', pricingDetails: '', tags: '',
    logoUrl: '', screenshotUrl: '',
  });
  const utils = trpc.useUtils();
  const createStack = trpc.admin.createStack.useMutation({
    onSuccess: () => { utils.admin.listStacks.invalidate(); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStack.mutate({
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      tagline: form.tagline,
      description: form.description,
      websiteUrl: form.websiteUrl || null,
      affiliateUrl: form.affiliateUrl || null,
      category: form.category,
      pricingModel: form.pricingModel,
      pricingDetails: form.pricingDetails || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      logoUrl: form.logoUrl || null,
      screenshotUrl: form.screenshotUrl || null,
      status: 'published',
    });
  };

  const categories = [
    'AI Productivity', 'AI Writing', 'AI Image', 'AI Video', 'AI Audio', 'AI Code', 'AI Analytics',
    'CRM', 'Marketing', 'Design', 'Developer Tools', 'Finance', 'HR & Recruiting',
    'Customer Support', 'Project Management', 'Sales', 'Security', 'E-commerce', 'Education',
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Stack</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <Input
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated from name"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tagline *</label>
          <Input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <Input value={form.websiteUrl} onChange={e => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate URL</label>
            <Input value={form.affiliateUrl} onChange={e => setForm({ ...form, affiliateUrl: e.target.value })} placeholder="https://..." />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <Input value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Screenshot URL</label>
            <Input value={form.screenshotUrl} onChange={e => setForm({ ...form, screenshotUrl: e.target.value })} placeholder="https://..." />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Model</label>
            <select
              value={form.pricingModel}
              onChange={e => setForm({ ...form, pricingModel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {['Free', 'Freemium', 'Paid', 'Free Trial', 'Open Source'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="AI, writing, productivity" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Details</label>
          <Input value={form.pricingDetails} onChange={e => setForm({ ...form, pricingDetails: e.target.value })} placeholder="Free tier available, Pro from $20/mo" />
        </div>
        <Button type="submit" disabled={createStack.isPending} className="bg-amber-500 hover:bg-amber-600 text-white">
          {createStack.isPending ? 'Creating...' : 'Create Stack'}
        </Button>
      </form>
    </div>
  );
}

// ─── Verifications Tab ──────────────────────────────────────────────────────

function VerificationsTab() {
  const verificationsQuery = trpc.admin.listVerifications.useQuery({});
  const utils = trpc.useUtils();
  const resolve = trpc.admin.resolveVerification.useMutation({
    onSuccess: () => { utils.admin.listVerifications.invalidate(); toast.success('Verification resolved'); },
    onError: (e) => toast.error(e.message),
  });

  const requests = verificationsQuery.data ?? [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Verification Requests</h2>
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          No verification requests
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Stack #{req.stackId}</div>
                <div className="text-sm text-gray-500">User #{req.userId} · {new Date(req.createdAt).toLocaleDateString()}</div>
                <StatusBadge status={req.status} />
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => resolve.mutate({ id: req.id, status: 'approved' })}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolve.mutate({ id: req.id, status: 'rejected', notes: 'Does not meet verification criteria' })}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ──────────────────────────────────────────────────────────────

function UsersTab() {
  const usersQuery = trpc.admin.listUsers.useQuery({});
  const usersList = usersQuery.data ?? [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Users</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.isLoading ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : usersList.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">No users yet</td></tr>
            ) : usersList.map(u => (
              <tr key={u.id} className="border-b border-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 text-sm">{u.name || 'Unnamed'}</div>
                  <div className="text-xs text-gray-400">{u.email || u.openId}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === 'admin' ? 'default' : 'outline'} className="text-xs">
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    published: { bg: 'bg-green-50', text: 'text-green-700', label: 'Published' },
    pending_review: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
    draft: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Draft' },
    suspended: { bg: 'bg-red-50', text: 'text-red-700', label: 'Suspended' },
    rejected: { bg: 'bg-red-50', text: 'text-red-600', label: 'Rejected' },
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
    approved: { bg: 'bg-green-50', text: 'text-green-700', label: 'Approved' },
  };
  const c = config[status] || { bg: 'bg-gray-50', text: 'text-gray-600', label: status };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
