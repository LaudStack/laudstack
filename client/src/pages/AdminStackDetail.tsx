/**
 * AdminStackDetail — View and edit a single stack from the admin panel
 * Shows all details, founder info, claim status, stats, reviews, and edit form
 * Supports file upload for logos and screenshots (not just URLs)
 */
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Shield, Eye, MousePointer, Star, TrendingUp,
  Heart, Bookmark, Edit, Save, ExternalLink, User, CheckCircle,
  XCircle, Sparkles, Flame, Globe, Link2, Upload, Image, Trash2, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStackDetail() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute('/admin/stacks/:id');
  const stackId = params?.id ? parseInt(params.id) : 0;
  const [editing, setEditing] = useState(false);

  const stackQuery = trpc.admin.getStack.useQuery({ id: stackId }, { enabled: stackId > 0 });
  const utils = trpc.useUtils();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>;
  }
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const stack = stackQuery.data;

  if (stackQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading stack...</div></div>;
  }

  if (!stack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Stack not found</h2>
          <Button variant="outline" onClick={() => navigate('/admin')}>Back to Admin</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" /> Back to Admin
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-3">
              <img
                src={stack.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(stack.name)}&background=F59E0B&color=fff&size=40`}
                alt={stack.name}
                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">{stack.name}</h1>
                <div className="text-xs text-gray-400">/{stack.slug} · ID: {stack.id}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/tools/${stack.slug}`)}>
              <Eye className="w-4 h-4 mr-1" /> View Public
            </Button>
            <Button size="sm" onClick={() => setEditing(!editing)} className={editing ? 'bg-gray-500' : 'bg-amber-500 hover:bg-amber-600 text-white'}>
              <Edit className="w-4 h-4 mr-1" /> {editing ? 'Cancel Edit' : 'Edit Stack'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {editing ? (
          <EditForm stack={stack} onSave={() => { setEditing(false); stackQuery.refetch(); }} />
        ) : (
          <DetailView stack={stack} />
        )}
      </div>
    </div>
  );
}

function DetailView({ stack }: { stack: any }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main info */}
      <div className="col-span-2 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Views', value: stack.viewCount, icon: Eye, color: '#3B82F6' },
            { label: 'Clicks', value: stack.clickCount, icon: MousePointer, color: '#22C55E' },
            { label: 'Lauds', value: stack.laudCount, icon: Heart, color: '#EF4444' },
            { label: 'Reviews', value: stack.reviewCount, icon: Star, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Logo & Screenshot Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Media</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-500 block mb-2">Logo</span>
              {stack.logoUrl ? (
                <img src={stack.logoUrl} alt="Logo" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No logo</div>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-2">Screenshot</span>
              {stack.screenshotUrl ? (
                <img src={stack.screenshotUrl} alt="Screenshot" className="w-full max-w-[300px] rounded-lg border border-gray-200 object-cover" />
              ) : (
                <div className="w-full max-w-[300px] h-32 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No screenshot</div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{stack.description}</p>
        </div>

        {/* Tags */}
        {stack.tags && stack.tags.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {stack.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* URLs */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Links</h3>
          <div className="space-y-2">
            {stack.websiteUrl && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-gray-400" />
                <a href={stack.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{stack.websiteUrl}</a>
              </div>
            )}
            {stack.affiliateUrl && (
              <div className="flex items-center gap-2 text-sm">
                <Link2 className="w-4 h-4 text-gray-400" />
                <a href={stack.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{stack.affiliateUrl}</a>
                <Badge className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">Affiliate</Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Status card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <StatusBadge status={stack.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Verified</span>
              {stack.isVerified ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Featured</span>
              {stack.isFeatured ? <Sparkles className="w-4 h-4 text-blue-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Trending</span>
              {stack.isTrending ? <Flame className="w-4 h-4 text-orange-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Rating</span>
              <span className="text-sm font-medium">{parseFloat(stack.averageRating).toFixed(1)} / 5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Rank Score</span>
              <span className="text-sm font-medium">{stack.rankScore}</span>
            </div>
          </div>
        </div>

        {/* Claim info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Claim Status</h3>
          {stack.founderId ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-700 font-medium">Claimed</span>
              </div>
              <div className="text-xs text-gray-500">Founder ID: {stack.founderId}</div>
              {stack.claimedAt && <div className="text-xs text-gray-500">Claimed: {new Date(stack.claimedAt).toLocaleDateString()}</div>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-gray-500">Unclaimed</span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Meta</h3>
          <div className="space-y-2 text-xs text-gray-500">
            <div>Category: <span className="text-gray-700 font-medium">{stack.category}</span></div>
            <div>Pricing: <span className="text-gray-700 font-medium">{stack.pricingModel}</span></div>
            <div>Added by: <span className="text-gray-700 font-medium">{stack.addedBy}</span></div>
            <div>Created: {new Date(stack.createdAt).toLocaleDateString()}</div>
            <div>Updated: {new Date(stack.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Image Upload Component ────────────────────────────────────────────────
function ImageUploadField({
  label,
  currentUrl,
  urlValue,
  onUrlChange,
  onUploadComplete,
}: {
  label: string;
  currentUrl?: string;
  urlValue: string;
  onUrlChange: (url: string) => void;
  onUploadComplete: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const uploadImage = trpc.admin.uploadImage.useMutation();

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { url } = await uploadImage.mutateAsync({
        base64,
        filename: file.name,
        contentType: file.type,
      });

      onUrlChange(url);
      onUploadComplete(url);
      toast.success(`${label} uploaded successfully`);
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [label, onUrlChange, onUploadComplete, uploadImage]);

  const displayUrl = preview || currentUrl || urlValue;
  const isLogo = label.toLowerCase().includes('logo');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Preview */}
      {displayUrl && (
        <div className="relative inline-block">
          <img
            src={displayUrl}
            alt={label}
            className={`${isLogo ? 'w-20 h-20' : 'w-full max-w-[320px] h-auto max-h-[180px]'} rounded-lg object-cover border border-gray-200`}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Upload button + URL input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={urlValue}
            onChange={e => onUrlChange(e.target.value)}
            placeholder={`Enter ${label.toLowerCase()} URL or upload a file`}
            className="text-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 shrink-0"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      <p className="text-xs text-gray-400">Paste a URL or click Upload to select an image file (max 5MB)</p>
    </div>
  );
}

// ─── Edit Form ─────────────────────────────────────────────────────────────
function EditForm({ stack, onSave }: { stack: any; onSave: () => void }) {
  const [form, setForm] = useState({
    name: stack.name || '',
    slug: stack.slug || '',
    tagline: stack.tagline || '',
    description: stack.description || '',
    websiteUrl: stack.websiteUrl || '',
    affiliateUrl: stack.affiliateUrl || '',
    category: stack.category || 'AI Productivity',
    pricingModel: stack.pricingModel || 'Freemium',
    pricingDetails: stack.pricingDetails || '',
    tags: (stack.tags || []).join(', '),
    logoUrl: stack.logoUrl || '',
    screenshotUrl: stack.screenshotUrl || '',
  });

  const updateStack = trpc.admin.updateStack.useMutation({
    onSuccess: () => { toast.success('Stack updated!'); onSave(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStack.mutate({
      id: stack.id,
      name: form.name,
      slug: form.slug,
      tagline: form.tagline,
      description: form.description,
      websiteUrl: form.websiteUrl || null,
      affiliateUrl: form.affiliateUrl || null,
      category: form.category,
      pricingModel: form.pricingModel,
      pricingDetails: form.pricingDetails || null,
      tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      logoUrl: form.logoUrl || null,
      screenshotUrl: form.screenshotUrl || null,
    });
  };

  const categories = [
    'AI Productivity', 'AI Writing', 'AI Image', 'AI Video', 'AI Audio', 'AI Code', 'AI Analytics',
    'CRM', 'Marketing', 'Design', 'Developer Tools', 'Finance', 'HR & Recruiting',
    'Customer Support', 'Project Management', 'Sales', 'Security', 'E-commerce', 'Education',
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 max-w-3xl">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Edit Stack</h3>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <Input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        />
      </div>

      {/* URLs */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
          <Input value={form.websiteUrl} onChange={e => setForm({ ...form, websiteUrl: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate URL</label>
          <Input value={form.affiliateUrl} onChange={e => setForm({ ...form, affiliateUrl: e.target.value })} />
        </div>
      </div>

      {/* Logo Upload */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <ImageUploadField
          label="Logo"
          currentUrl={stack.logoUrl}
          urlValue={form.logoUrl}
          onUrlChange={(url) => setForm({ ...form, logoUrl: url })}
          onUploadComplete={(url) => setForm(prev => ({ ...prev, logoUrl: url }))}
        />
      </div>

      {/* Screenshot Upload */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <ImageUploadField
          label="Screenshot"
          currentUrl={stack.screenshotUrl}
          urlValue={form.screenshotUrl}
          onUrlChange={(url) => setForm({ ...form, screenshotUrl: url })}
          onUploadComplete={(url) => setForm(prev => ({ ...prev, screenshotUrl: url }))}
        />
      </div>

      {/* Category & Pricing */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Model</label>
          <select value={form.pricingModel} onChange={e => setForm({ ...form, pricingModel: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            {['Free', 'Freemium', 'Paid', 'Free Trial', 'Open Source'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
        <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Details</label>
        <Input value={form.pricingDetails} onChange={e => setForm({ ...form, pricingDetails: e.target.value })} />
      </div>
      <Button type="submit" disabled={updateStack.isPending} className="bg-amber-500 hover:bg-amber-600 text-white">
        <Save className="w-4 h-4 mr-2" />
        {updateStack.isPending ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    published: { bg: 'bg-green-50', text: 'text-green-700', label: 'Published' },
    pending_review: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
    draft: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Draft' },
    suspended: { bg: 'bg-red-50', text: 'text-red-700', label: 'Suspended' },
    rejected: { bg: 'bg-red-50', text: 'text-red-600', label: 'Rejected' },
  };
  const c = config[status] || { bg: 'bg-gray-50', text: 'text-gray-600', label: status };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
}
