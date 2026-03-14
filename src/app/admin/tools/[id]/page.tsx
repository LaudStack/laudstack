"use client";
/*
 * LaudStack Admin — Tool Detail / Edit Page
 * Full edit: name, tagline, description, category, pricing, logo, screenshots, affiliate URL
 * Moderation: status, visibility, spotlight, suspend
 * File upload: drag-and-drop for logo and screenshots (uploads to Supabase Storage)
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Loader2, Upload, Trash2, ExternalLink,
  Image as ImageIcon, Star, Eye, EyeOff, Sparkles, Shield,
  AlertTriangle, CheckCircle, XCircle, Link2, Globe,
  BarChart3, MousePointer, TrendingUp, Clock, Edit3,
  ChevronDown, RefreshCw, Ban, MoreHorizontal, Copy, Crown, User,
} from "lucide-react";
import {
  getAdminToolDetail, adminUpdateTool, adminSuspendTool,
  adminUnsuspendTool, adminToggleSpotlight, adminToggleVisibility,
  adminAddScreenshot, adminDeleteScreenshot, adminDeleteReview,
  getAdminModerationLog,
} from "@/app/actions/admin";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

type ToolData = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string | null;
  shortDescription: string | null;
  websiteUrl: string;
  category: string;
  pricingModel: string;
  pricingDetails: string | null;
  logoUrl: string | null;
  screenshotUrl: string | null;
  affiliateUrl: string | null;
  status: string;
  isFeatured: boolean;
  isSpotlighted: boolean;
  isVisible: boolean;
  isTrending: boolean;
  averageRating: number;
  reviewCount: number;
  upvoteCount: number;
  viewCount: number;
  outboundClickCount: number;
  saveCount: number;
  rankScore: number;
  createdAt: Date;
  updatedAt: Date;
};

type Screenshot = {
  id: number;
  url: string;
  caption: string | null;
  sortOrder: number;
};

type Review = {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  pros: string | null;
  cons: string | null;
  isVerified: boolean;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
};

type ModLog = {
  id: number;
  action: string;
  notes: string | null;
  createdAt: Date;
  adminName: string | null;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "featured", label: "Featured", color: "bg-purple-100 text-purple-700" },
  { value: "suspended", label: "Suspended", color: "bg-red-100 text-red-700" },
  { value: "unpublished", label: "Unpublished", color: "bg-slate-100 text-slate-700" },
];

const CATEGORIES = [
  "AI Writing", "AI Coding", "AI Design", "AI Analytics",
  "AI Marketing", "AI Sales", "AI Productivity", "AI Research",
  "AI Customer Support", "AI Finance", "AI HR", "AI Legal",
  "Project Management", "CRM", "Design", "Development", "Analytics",
  "Marketing", "Sales", "Productivity", "Communication", "Finance",
];

const PRICING_MODELS = ["Free", "Freemium", "Paid", "Free Trial", "Open Source"];

// ─── File Upload Component ──────────────────────────────────────────────────

function FileUploadZone({
  label,
  accept = "image/*",
  currentUrl,
  onUpload,
  type,
  toolSlug,
}: {
  label: string;
  accept?: string;
  currentUrl: string | null;
  onUpload: (url: string) => void;
  type: "logo" | "screenshot";
  toolSlug: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    const maxSize = type === "screenshot" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${type === "screenshot" ? "10MB" : "5MB"}`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("toolSlug", toolSlug);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await res.json();
      onUpload(url);
      toast.success(`${label} uploaded successfully`);
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{label}</label>
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer
          ${dragOver ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300 bg-white"}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            <p className="text-xs text-slate-500">Uploading...</p>
          </div>
        ) : currentUrl ? (
          <div className="flex items-center gap-3">
            <img
              src={currentUrl}
              alt=""
              className={`${type === "logo" ? "w-12 h-12 rounded-lg" : "w-20 h-14 rounded-lg"} object-cover border border-slate-200`}
            />
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs text-slate-700 font-medium truncate">{currentUrl.split("/").pop()}</p>
              <p className="text-[10px] text-slate-400">Click or drag to replace</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <Upload className="w-6 h-6 text-slate-400" />
            <p className="text-xs text-slate-500">Click or drag to upload {label.toLowerCase()}</p>
            <p className="text-[10px] text-slate-400">JPEG, PNG, WebP, GIF, SVG — Max {type === "screenshot" ? "10MB" : "5MB"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AdminToolDetail() {
  const params = useParams();
  const router = useRouter();
  const toolId = Number(params?.id ?? 0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tool, setTool] = useState<ToolData | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [toolReviews, setToolReviews] = useState<Review[]>([]);
  const [modLogs, setModLogs] = useState<ModLog[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "media" | "reviews" | "moderation" | "analytics">("details");

  // Form state
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    shortDescription: "",
    websiteUrl: "",
    category: "",
    pricingModel: "",
    pricingDetails: "",
    logoUrl: "",
    screenshotUrl: "",
    affiliateUrl: "",
    status: "",
    isFeatured: false,
    isSpotlighted: false,
    isVisible: true,
    isTrending: false,
    isVerified: false,
    isPro: false,
  });

  // Founder info
  const [founderInfo, setFounderInfo] = useState<{ id: number; name: string | null; email: string | null; avatarUrl: string | null; founderStatus: string; founderBio: string | null; founderWebsite: string | null } | null>(null);

  // Suspend dialog
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const loadTool = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminToolDetail(toolId);
      if (!data) {
        toast.error("Tool not found");
        router.push("/admin/tools");
        return;
      }
      setTool(data.tool as unknown as ToolData);
      setScreenshots(data.screenshots as unknown as Screenshot[]);
      setToolReviews(data.reviews as unknown as Review[]);
      setFounderInfo(data.founderInfo as any);
      setForm({
        name: data.tool.name || "",
        tagline: data.tool.tagline || "",
        description: data.tool.description || "",
        shortDescription: (data.tool as any).shortDescription || "",
        websiteUrl: data.tool.websiteUrl || "",
        category: data.tool.category || "",
        pricingModel: data.tool.pricingModel || "",
        pricingDetails: (data.tool as any).pricingDetails || "",
        logoUrl: data.tool.logoUrl || "",
        screenshotUrl: data.tool.screenshotUrl || "",
        affiliateUrl: (data.tool as any).affiliateUrl || "",
        status: data.tool.status || "pending",
        isFeatured: data.tool.isFeatured ?? false,
        isSpotlighted: (data.tool as any).isSpotlighted ?? false,
        isVisible: (data.tool as any).isVisible ?? true,
        isTrending: (data.tool as any).isTrending ?? false,
        isVerified: (data.tool as any).isVerified ?? false,
        isPro: (data.tool as any).isPro ?? false,
      });

      // Load moderation logs
      const logs = await getAdminModerationLog(toolId);
      setModLogs(logs as unknown as ModLog[]);
    } catch (err) {
      toast.error("Failed to load tool");
    } finally {
      setLoading(false);
    }
  }, [toolId, router]);

  useEffect(() => { loadTool(); }, [loadTool]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await adminUpdateTool(toolId, {
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        shortDescription: form.shortDescription,
        websiteUrl: form.websiteUrl,
        category: form.category,
        pricingModel: form.pricingModel,
        pricingDetails: form.pricingDetails,
        logoUrl: form.logoUrl,
        screenshotUrl: form.screenshotUrl,
        affiliateUrl: form.affiliateUrl,
        status: form.status,
        isFeatured: form.isFeatured,
        isSpotlighted: form.isSpotlighted,
        isVisible: form.isVisible,
        isTrending: form.isTrending,
        isVerified: form.isVerified,
        isPro: form.isPro,
      });
      if (result.success) {
        toast.success("Tool updated successfully");
        loadTool();
      } else {
        toast.error("Failed to update tool");
      }
    } catch (err) {
      toast.error("Failed to update tool");
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }
    const result = await adminSuspendTool(toolId, suspendReason);
    if (result.success) {
      toast.success("Tool suspended");
      setSuspendDialogOpen(false);
      setSuspendReason("");
      loadTool();
    }
  };

  const handleUnsuspend = async () => {
    const result = await adminUnsuspendTool(toolId);
    if (result.success) {
      toast.success("Tool unsuspended");
      loadTool();
    }
  };

  const handleToggleSpotlight = async () => {
    const result = await adminToggleSpotlight(toolId);
    if (result.success) {
      toast.success(result.isSpotlighted ? "Tool spotlighted" : "Spotlight removed");
      loadTool();
    }
  };

  const handleToggleVisibility = async () => {
    const result = await adminToggleVisibility(toolId);
    if (result.success) {
      toast.success(result.isVisible ? "Tool now visible" : "Tool hidden");
      loadTool();
    }
  };

  const handleAddScreenshot = async (url: string) => {
    const result = await adminAddScreenshot(toolId, url);
    if (result.success) {
      toast.success("Screenshot added");
      loadTool();
    }
  };

  const handleDeleteScreenshot = async (id: number) => {
    if (!confirm("Delete this screenshot?")) return;
    const result = await adminDeleteScreenshot(id);
    if (result.success) {
      toast.success("Screenshot deleted");
      loadTool();
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Delete this review? This action cannot be undone.")) return;
    const result = await adminDeleteReview(reviewId);
    if (result.success) {
      toast.success("Review deleted");
      loadTool();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!tool) return null;

  const TABS = [
    { id: "details" as const, label: "Details", icon: Edit3 },
    { id: "media" as const, label: "Media", icon: ImageIcon },
    { id: "reviews" as const, label: `Reviews (${toolReviews.length})`, icon: Star },
    { id: "moderation" as const, label: "Moderation", icon: Shield },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/admin/tools")}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {tool.logoUrl ? (
            <img src={tool.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{tool.name}</h1>
            <p className="text-xs text-slate-400">ID: {tool.id} · Slug: {tool.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/tools/${tool.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View on Site
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Views", value: tool.viewCount ?? 0, icon: Eye, color: "text-blue-600" },
          { label: "Clicks", value: tool.outboundClickCount ?? 0, icon: MousePointer, color: "text-green-600" },
          { label: "Upvotes", value: tool.upvoteCount ?? 0, icon: TrendingUp, color: "text-amber-600" },
          { label: "Reviews", value: tool.reviewCount ?? 0, icon: Star, color: "text-purple-600" },
          { label: "Rating", value: (tool.averageRating ?? 0).toFixed(1), icon: Star, color: "text-amber-500" },
          { label: "Rank Score", value: tool.rankScore ?? 0, icon: BarChart3, color: "text-slate-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className="text-[10px] font-semibold text-slate-400 uppercase">{stat.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TAB: Details
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "details" && (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Website URL</label>
                <input
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Tagline</label>
                <input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Short Description</label>
                <textarea
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Pricing Model</label>
                <select
                  value={form.pricingModel}
                  onChange={(e) => setForm({ ...form, pricingModel: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white"
                >
                  {PRICING_MODELS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Pricing Details</label>
                <textarea
                  value={form.pricingDetails}
                  onChange={(e) => setForm({ ...form, pricingDetails: e.target.value })}
                  rows={2}
                  placeholder="e.g., Free plan available. Pro starts at $10/mo."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Affiliate Link */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-amber-500" />
              Affiliate / Monetization
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Affiliate URL</label>
              <input
                value={form.affiliateUrl}
                onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })}
                placeholder="https://example.com/?ref=laudstack"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                When set, outbound clicks will use this URL instead of the tool&apos;s website. Click tracking is automatic.
              </p>
            </div>
          </div>

          {/* Founder / Owner Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              Founder / Owner
            </h3>
            {founderInfo ? (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {founderInfo.avatarUrl ? (
                    <img src={founderInfo.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{founderInfo.name || 'Unknown'}</span>
                    {founderInfo.founderStatus === 'verified' && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Verified</span>
                    )}
                    {founderInfo.founderStatus === 'pending' && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{founderInfo.email || 'No email'}</p>
                  {founderInfo.founderBio && <p className="text-xs text-slate-600 mt-1">{founderInfo.founderBio}</p>}
                  {founderInfo.founderWebsite && (
                    <a href={founderInfo.founderWebsite} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {founderInfo.founderWebsite}
                    </a>
                  )}

                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No founder has claimed this tool</p>
            )}
          </div>

          {/* Status & Flags */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Status & Flags</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3 pt-5">
                {[
                  { key: "isVerified", label: "Verified", icon: Shield, color: "text-blue-600" },
                  { key: "isPro", label: "Pro", icon: Crown, color: "text-amber-600" },
                  { key: "isFeatured", label: "Featured", icon: Sparkles, color: "text-amber-500" },
                  { key: "isSpotlighted", label: "Spotlighted", icon: Star, color: "text-purple-500" },
                  { key: "isVisible", label: "Visible", icon: Eye, color: "text-green-500" },
                  { key: "isTrending", label: "Trending", icon: TrendingUp, color: "text-blue-500" },
                ].map((flag) => (
                  <label key={flag.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(form as any)[flag.key]}
                      onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                    />
                    <flag.icon className={`w-3.5 h-3.5 ${flag.color}`} />
                    <span className="text-xs font-medium text-slate-700">{flag.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: Media
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "media" && (
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Logo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUploadZone
                label="Upload Logo"
                currentUrl={form.logoUrl}
                onUpload={(url) => setForm({ ...form, logoUrl: url })}
                type="logo"
                toolSlug={tool.slug}
              />
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Or enter URL directly</label>
                <input
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Main Screenshot */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Main Screenshot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUploadZone
                label="Upload Screenshot"
                currentUrl={form.screenshotUrl}
                onUpload={(url) => setForm({ ...form, screenshotUrl: url })}
                type="screenshot"
                toolSlug={tool.slug}
              />
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Or enter URL directly</label>
                <input
                  value={form.screenshotUrl}
                  onChange={(e) => setForm({ ...form, screenshotUrl: e.target.value })}
                  placeholder="https://example.com/screenshot.png"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Additional Screenshots */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Additional Screenshots</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {screenshots.map((ss) => (
                <div key={ss.id} className="relative group">
                  <img src={ss.url} alt={ss.caption || ""} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                  <button
                    onClick={() => handleDeleteScreenshot(ss.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {ss.caption && (
                    <p className="text-[10px] text-slate-500 mt-1 truncate">{ss.caption}</p>
                  )}
                </div>
              ))}
            </div>
            <FileUploadZone
              label="Add Screenshot"
              currentUrl={null}
              onUpload={handleAddScreenshot}
              type="screenshot"
              toolSlug={tool.slug}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: Reviews
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "reviews" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Reviews</h3>
          {toolReviews.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {toolReviews.map((review) => (
                <div key={review.id} className="border border-slate-100 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800">{review.userName || "Anonymous"}</span>
                        <span className="text-[10px] text-slate-400">{review.userEmail}</span>
                        {review.isVerified && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Verified</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                          />
                        ))}
                        <span className="text-xs text-slate-400 ml-1">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {review.title && <p className="text-sm font-semibold text-slate-800 mb-1">{review.title}</p>}
                  {review.body && <p className="text-sm text-slate-600 mb-2">{review.body}</p>}
                  {(review.pros || review.cons) && (
                    <div className="flex gap-4 text-xs">
                      {review.pros && (
                        <div>
                          <span className="font-semibold text-green-600">Pros:</span>
                          <span className="text-slate-500 ml-1">{review.pros}</span>
                        </div>
                      )}
                      {review.cons && (
                        <div>
                          <span className="font-semibold text-red-500">Cons:</span>
                          <span className="text-slate-500 ml-1">{review.cons}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: Moderation
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "moderation" && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              {tool.status === "suspended" ? (
                <button
                  onClick={handleUnsuspend}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Unsuspend Tool
                </button>
              ) : (
                <button
                  onClick={() => setSuspendDialogOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" /> Suspend Tool
                </button>
              )}
              <button
                onClick={handleToggleVisibility}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {(tool as any).isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {(tool as any).isVisible ? "Hide from Listings" : "Show in Listings"}
              </button>
              <button
                onClick={handleToggleSpotlight}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {(tool as any).isSpotlighted ? "Remove Spotlight" : "Add Spotlight"}
              </button>
            </div>
          </div>

          {/* Suspend Dialog */}
          {suspendDialogOpen && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Suspend Tool
              </h3>
              <p className="text-xs text-red-600 mb-3">
                This will hide the tool from all listings and notify the founder (if claimed).
              </p>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Reason for suspension..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400/30 resize-none mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSuspend}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm Suspension
                </button>
                <button
                  onClick={() => { setSuspendDialogOpen(false); setSuspendReason(""); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Moderation Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Moderation History</h3>
            {modLogs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No moderation actions yet</p>
            ) : (
              <div className="space-y-3">
                {modLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Shield className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{log.action.replace(/_/g, " ")}</p>
                      {log.notes && <p className="text-xs text-slate-500 mt-0.5">{log.notes}</p>}
                      <p className="text-[10px] text-slate-400 mt-1">
                        by {log.adminName || "System"} · {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: Analytics
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Total Views", value: tool.viewCount ?? 0, icon: Eye },
                { label: "Outbound Clicks", value: tool.outboundClickCount ?? 0, icon: MousePointer },
                { label: "Click-Through Rate", value: tool.viewCount ? `${((tool.outboundClickCount ?? 0) / tool.viewCount * 100).toFixed(1)}%` : "0%", icon: TrendingUp },
                { label: "Total Upvotes", value: tool.upvoteCount ?? 0, icon: TrendingUp },
                { label: "Total Reviews", value: tool.reviewCount ?? 0, icon: Star },
                { label: "Average Rating", value: (tool.averageRating ?? 0).toFixed(1), icon: Star },
              ].map((m) => (
                <div key={m.label} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-2">
                    <m.icon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">{m.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> Detailed analytics with time-series charts will be available in a future update.
              View and click tracking is already active for this tool.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
