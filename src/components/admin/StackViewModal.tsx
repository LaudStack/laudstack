"use client";
/**
 * StackViewModal — Premium admin stack management modal
 * 
 * Design: Full-width overlay panel (max-w-5xl), 6 tabs, comprehensive data display.
 * Tabs: Overview | Details & Media | Reviews | Moderation | Settings | Danger Zone
 */
import { useState, useEffect, useCallback } from "react";
import {
  X, ExternalLink, Star, Eye, EyeOff, Sparkles, Shield,
  CheckCircle, XCircle, Globe, BarChart3, MousePointer,
  TrendingUp, Clock, Edit3, Ban, Crown, User, Layers,
  Loader2, AlertTriangle, RefreshCw, Copy, Tag, Heart,
  Image as ImageIcon, MessageSquare, Settings, Trash2,
  Link2, Calendar, Hash, ArrowUpRight, Zap, Award,
} from "lucide-react";
import {
  getAdminToolDetail, adminUpdateTool, adminSuspendTool,
  adminUnsuspendTool, adminToggleSpotlight, adminToggleVisibility,
  updateToolStatus, updateToolFeatured, deleteTool,
} from "@/app/actions/admin";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────── */

type StackData = {
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
  isVerified: boolean;
  isPro: boolean;
  averageRating: number;
  reviewCount: number;
  upvoteCount: number;
  viewCount: number;
  outboundClickCount: number;
  saveCount: number;
  rankScore: number;
  tags: string[];
  claimedBy: number | null;
  submittedBy: number | null;
  scheduledLaunchAt: Date | null;
  launchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type ReviewData = {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  pros: string | null;
  cons: string | null;
  isVerified: boolean;
  status: string;
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

type FounderInfo = {
  id: number;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  founderStatus: string;
  founderBio: string | null;
  founderWebsite: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

/* ─── Constants ─────────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  pending:     { label: "Pending",     bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200", dot: "bg-amber-400" },
  approved:    { label: "Approved",    bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
  rejected:    { label: "Rejected",    bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200", dot: "bg-red-400" },
  featured:    { label: "Featured",    bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-400" },
  suspended:   { label: "Suspended",   bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200", dot: "bg-red-500" },
  unpublished: { label: "Unpublished", bg: "bg-slate-100", text: "text-slate-600",  border: "border-slate-200", dot: "bg-slate-400" },
};

type Tab = "overview" | "details" | "reviews" | "moderation" | "settings" | "danger";

/* ─── Sub-components ────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, subtext, color }: {
  icon: React.ElementType; label: string; value: string | number; subtext?: string; color: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subtext && <p className="text-xs text-slate-500 mt-0.5">{subtext}</p>}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-200 last:border-0">
      <span className="text-sm text-slate-500 flex-shrink-0 w-32">{label}</span>
      <div className="text-sm font-medium text-slate-800 text-right">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, enabled, icon: Icon, color, loading, onToggle }: {
  label: string; description: string; enabled: boolean; icon: React.ElementType;
  color: string; loading: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-200 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${enabled ? color : "bg-slate-100"}`}>
          <Icon className={`w-4.5 h-4.5 ${enabled ? "text-white" : "text-slate-400"}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-emerald-500" : "bg-slate-300"} ${loading ? "opacity-50" : ""}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */

export default function StackViewModal({
  toolId,
  onClose,
  onRefresh,
}: {
  toolId: number;
  onClose: () => void;
  onRefresh?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [stack, setStack] = useState<StackData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [modLogs, setModLogs] = useState<ModLog[]>([]);
  const [founderInfo, setFounderInfo] = useState<FounderInfo | null>(null);
  const [screenshots, setScreenshots] = useState<{ id: number; url: string; caption: string | null }[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminToolDetail(toolId);
      if (!data) { toast.error("Stack not found"); onClose(); return; }
      setStack(data.tool as unknown as StackData);
      setReviews(data.reviews as unknown as ReviewData[]);
      setModLogs(data.modLogs as unknown as ModLog[]);
      setFounderInfo(data.founderInfo as unknown as FounderInfo);
      setScreenshots(data.screenshots as any);
    } catch {
      toast.error("Failed to load stack");
    } finally {
      setLoading(false);
    }
  }, [toolId, onClose]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (key: string, fn: () => Promise<any>, successMsg: string) => {
    setActionLoading(key);
    try {
      await fn();
      toast.success(successMsg);
      load();
      onRefresh?.();
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = (newStatus: "pending" | "approved" | "rejected" | "featured") =>
    doAction(`status-${newStatus}`, () => updateToolStatus(toolId, newStatus), `Status changed to ${newStatus}`);

  const handleToggleFeature = () =>
    doAction("feature", () => updateToolFeatured(toolId, !stack?.isFeatured), stack?.isFeatured ? "Removed from featured" : "Marked as featured");

  const handleToggleSpotlight = () =>
    doAction("spotlight", () => adminToggleSpotlight(toolId), "Spotlight toggled");

  const handleToggleVisibility = () =>
    doAction("visibility", () => adminToggleVisibility(toolId), stack?.isVisible ? "Stack hidden" : "Stack visible");

  const handleSuspend = () => {
    if (!suspendReason.trim()) { toast.error("Please provide a reason"); return; }
    doAction("suspend", () => adminSuspendTool(toolId, suspendReason), "Stack suspended");
    setSuspendDialogOpen(false);
    setSuspendReason("");
  };

  const handleUnsuspend = () =>
    doAction("unsuspend", () => adminUnsuspendTool(toolId), "Stack reinstated");

  const handleDelete = () =>
    doAction("delete", async () => { await deleteTool(toolId); onClose(); }, "Stack deleted");

  const handleVerifyToggle = () =>
    doAction("verify", () => adminUpdateTool(toolId, { isVerified: !stack?.isVerified }), stack?.isVerified ? "Verification removed" : "Stack verified");

  const handleTrendingToggle = () =>
    doAction("trending", () => adminUpdateTool(toolId, { isTrending: !stack?.isTrending }), stack?.isTrending ? "Removed from rising" : "Marked as rising");

  const handleProToggle = () =>
    doAction("pro", () => adminUpdateTool(toolId, { isPro: !stack?.isPro }), stack?.isPro ? "Pro removed" : "Marked as pro");

  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "details", label: "Details & Media", icon: Layers },
    { key: "reviews", label: "Reviews", icon: MessageSquare, count: reviews.length },
    { key: "moderation", label: "Moderation", icon: Shield, count: modLogs.length },
    { key: "settings", label: "Settings", icon: Settings },
    { key: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-16 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading stack details...</p>
        </div>
      </div>
    );
  }

  if (!stack) return null;

  const founderDisplayName = founderInfo
    ? (founderInfo.firstName ? [founderInfo.firstName, founderInfo.lastName].filter(Boolean).join(" ") : founderInfo.name) ?? "Unknown"
    : null;

  const ownerSource = stack.claimedBy ? "Claimed" : stack.submittedBy ? "Launched" : "Admin-listed";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* ═══ Header ═══ */}
          <div className="bg-white border-b border-slate-200 px-6 py-5 flex-shrink-0">
            <div className="flex items-start gap-4">
              {/* Logo */}
              {stack.logoUrl ? (
                <img src={stack.logoUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-sm" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-7 h-7 text-slate-500" />
                </div>
              )}

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900">{stack.name}</h2>
                  {stack.isVerified && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {stack.isFeatured && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}
                  {stack.isSpotlighted && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      <Crown className="w-3 h-3" /> Spotlighted
                    </span>
                  )}
                  {stack.isPro && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      <Zap className="w-3 h-3" /> Pro
                    </span>
                  )}
                  <StatusBadge status={stack.status} />
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{stack.tagline}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> ID: {stack.id}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {stack.category}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {stack.pricingModel}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Added {new Date(stack.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={stack.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
                <a
                  href={`/tools/${stack.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View on Site
                </a>
                <a
                  href={`/ops-console/stacks/${stack.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ═══ Tab Bar ═══ */}
          <div className="bg-white border-b border-slate-200 px-6 flex-shrink-0">
            <div className="flex gap-0.5 -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "text-amber-700 border-amber-500"
                      : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ═══ Tab Content ═══ */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* ── Overview Tab ── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <MetricCard icon={Star} label="Rating" value={stack.averageRating.toFixed(1)} subtext={`${stack.reviewCount} reviews`} color="bg-amber-100 text-amber-600" />
                  <MetricCard icon={Heart} label="Lauds" value={stack.upvoteCount.toLocaleString()} color="bg-pink-100 text-pink-600" />
                  <MetricCard icon={Eye} label="Views" value={stack.viewCount.toLocaleString()} color="bg-blue-100 text-blue-600" />
                  <MetricCard icon={MousePointer} label="Clicks" value={stack.outboundClickCount.toLocaleString()} subtext="outbound" color="bg-emerald-100 text-emerald-600" />
                  <MetricCard icon={BarChart3} label="Rank" value={stack.rankScore.toFixed(1)} subtext="score" color="bg-purple-100 text-purple-600" />
                  <MetricCard icon={Award} label="Saves" value={stack.saveCount.toLocaleString()} color="bg-indigo-100 text-indigo-600" />
                </div>

                {/* Two-column: Stack Info + Founder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Stack Info */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-500" /> Stack Information
                    </h3>
                    <div>
                      <InfoRow label="Category">{stack.category}</InfoRow>
                      <InfoRow label="Pricing">{stack.pricingModel}</InfoRow>
                      <InfoRow label="Website">
                        <a href={stack.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline inline-flex items-center gap-1">
                          {stack.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </InfoRow>
                      {stack.affiliateUrl && (
                        <InfoRow label="Affiliate">
                          <a href={stack.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline inline-flex items-center gap-1 truncate max-w-[220px]">
                            {stack.affiliateUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </InfoRow>
                      )}
                      <InfoRow label="Launched">{new Date(stack.launchedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</InfoRow>
                      <InfoRow label="Added">{new Date(stack.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</InfoRow>
                      <InfoRow label="Last Updated">{new Date(stack.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</InfoRow>
                      <InfoRow label="Source">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          ownerSource === "Claimed" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          ownerSource === "Launched" ? "bg-green-50 text-green-700 border border-green-200" :
                          "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {ownerSource}
                        </span>
                      </InfoRow>
                      <InfoRow label="Slug">
                        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{stack.slug}</code>
                      </InfoRow>
                    </div>
                    {/* Tags */}
                    {stack.tags && stack.tags.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {stack.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Founder / Owner */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" /> Founder / Owner
                    </h3>
                    {founderInfo ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                          {founderInfo.avatarUrl ? (
                            <img src={founderInfo.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                              <User className="w-6 h-6 text-slate-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900">{founderDisplayName}</p>
                            <p className="text-xs text-slate-500 truncate">{founderInfo.email}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            founderInfo.founderStatus === "verified"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : founderInfo.founderStatus === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {founderInfo.founderStatus}
                          </span>
                        </div>
                        <div>
                          <InfoRow label="User ID">#{founderInfo.id}</InfoRow>
                          {founderInfo.founderWebsite && (
                            <InfoRow label="Website">
                              <a href={founderInfo.founderWebsite} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline inline-flex items-center gap-1">
                                {founderInfo.founderWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                                <ArrowUpRight className="w-3 h-3" />
                              </a>
                            </InfoRow>
                          )}
                        </div>
                        {founderInfo.founderBio && (
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-xs text-slate-500 mb-1">Bio</p>
                            <p className="text-sm text-slate-600 leading-relaxed">{founderInfo.founderBio}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                          <User className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">No founder assigned</p>
                        <p className="text-xs text-slate-500 mt-0.5">This is an admin-listed stack</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Description */}
                {stack.description && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-500" /> Description
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{stack.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Details & Media Tab ── */}
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Full Description */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Full Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {stack.description || "No description provided."}
                  </p>
                </div>

                {stack.shortDescription && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Short Description</h3>
                    <p className="text-sm text-slate-600">{stack.shortDescription}</p>
                  </div>
                )}

                {stack.pricingDetails && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Pricing Details</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{stack.pricingDetails}</p>
                  </div>
                )}

                {/* Media Gallery */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" /> Media Gallery
                    <span className="text-xs text-slate-600 font-normal">({screenshots.length + (stack.screenshotUrl ? 1 : 0)} items)</span>
                  </h3>
                  {screenshots.length === 0 && !stack.screenshotUrl ? (
                    <div className="flex flex-col items-center py-8 text-slate-500">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm">No media uploaded</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {stack.screenshotUrl && (
                        <button
                          onClick={() => setSelectedImage(stack.screenshotUrl!)}
                          className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video hover:shadow-md transition-shadow"
                        >
                          <img src={stack.screenshotUrl} alt="Primary screenshot" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="absolute top-2 left-2 text-xs font-semibold bg-white/90 text-slate-700 px-2 py-0.5 rounded-md">Primary</span>
                        </button>
                      )}
                      {screenshots.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedImage(s.url)}
                          className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video hover:shadow-md transition-shadow"
                        >
                          <img src={s.url} alt={s.caption ?? ""} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {s.caption && (
                            <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-xs text-white truncate">{s.caption}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Technical Details */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Technical Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <InfoRow label="Stack ID">#{stack.id}</InfoRow>
                    <InfoRow label="Slug"><code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{stack.slug}</code></InfoRow>
                    <InfoRow label="Created">{new Date(stack.createdAt).toLocaleString()}</InfoRow>
                    <InfoRow label="Updated">{new Date(stack.updatedAt).toLocaleString()}</InfoRow>
                    <InfoRow label="Launched">{new Date(stack.launchedAt).toLocaleString()}</InfoRow>
                    {stack.scheduledLaunchAt && (
                      <InfoRow label="Scheduled">{new Date(stack.scheduledLaunchAt).toLocaleString()}</InfoRow>
                    )}
                    {stack.affiliateUrl && (
                      <InfoRow label="Affiliate URL">
                        <a href={stack.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline text-xs break-all">
                          {stack.affiliateUrl}
                        </a>
                      </InfoRow>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Reviews Tab ── */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                {/* Review summary */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-slate-900">{stack.averageRating.toFixed(1)}</p>
                    <div className="flex items-center gap-0.5 mt-1 justify-center">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= Math.round(stack.averageRating) ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{stack.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = reviews.filter(r => r.rating === rating).length;
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-3">{rating}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review list */}
                {reviews.length === 0 ? (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-10 text-center">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">No reviews yet</p>
                    <p className="text-xs text-slate-500 mt-1">Reviews will appear here when users submit them</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800">{review.userName ?? "Anonymous"}</span>
                              {review.isVerified && (
                                <span className="flex items-center gap-0.5 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                                  <Shield className="w-2.5 h-2.5" /> Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map(i => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                                ))}
                              </div>
                              <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          review.status === "published" ? "bg-emerald-50 text-emerald-700" :
                          review.status === "hidden" ? "bg-slate-100 text-slate-600" :
                          "bg-red-50 text-red-600"
                        }`}>{review.status}</span>
                      </div>
                      {review.title && <p className="text-sm font-bold text-slate-800 mb-1">{review.title}</p>}
                      {review.body && <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>}
                      {(review.pros || review.cons) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
                          {review.pros && (
                            <div className="flex gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-emerald-700 mb-0.5">Pros</p>
                                <p className="text-xs text-slate-600">{review.pros}</p>
                              </div>
                            </div>
                          )}
                          {review.cons && (
                            <div className="flex gap-2">
                              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-red-600 mb-0.5">Cons</p>
                                <p className="text-xs text-slate-600">{review.cons}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {review.userEmail && (
                        <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                          Email: {review.userEmail}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Moderation Tab ── */}
            {activeTab === "moderation" && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-500" /> Moderation History
                    <span className="text-xs text-slate-600 font-normal">({modLogs.length} entries)</span>
                  </h3>
                  {modLogs.length === 0 ? (
                    <div className="flex flex-col items-center py-10 text-slate-500">
                      <Shield className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm font-medium text-slate-500">No moderation history</p>
                      <p className="text-xs text-slate-500 mt-0.5">Admin actions will be logged here</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                      <div className="space-y-0">
                        {modLogs.map((log, idx) => (
                          <div key={log.id} className="relative flex gap-4 py-3">
                            <div className="relative z-10 w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center flex-shrink-0">
                              <Shield className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0 pb-3 border-b border-slate-200 last:border-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-700">
                                  <span className="font-semibold">{log.adminName ?? "System"}</span>
                                  <span className="text-slate-400 mx-1.5">·</span>
                                  <span className="text-slate-600 font-medium">{log.action.replace(/_/g, " ")}</span>
                                </p>
                                <span className="text-xs text-slate-500 flex-shrink-0">
                                  {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              </div>
                              {log.notes && (
                                <p className="text-xs text-slate-500 mt-1 bg-slate-50 rounded-lg px-3 py-2">{log.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Settings Tab ── */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Status Management */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Status Management</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-slate-600">Current status:</span>
                    <StatusBadge status={stack.status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["pending", "approved", "rejected", "featured"] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={!!actionLoading || stack.status === status}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-40 ${
                          stack.status === status
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            : status === "approved" ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                            : status === "rejected" ? "text-red-700 bg-red-50 border-red-200 hover:bg-red-100"
                            : status === "featured" ? "text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100"
                            : "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        {status === "approved" && <CheckCircle className="w-4 h-4" />}
                        {status === "rejected" && <XCircle className="w-4 h-4" />}
                        {status === "featured" && <Sparkles className="w-4 h-4" />}
                        {status === "pending" && <Clock className="w-4 h-4" />}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flags & Toggles */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Flags & Visibility</h3>
                  <ToggleRow
                    label="Visible"
                    description="Stack appears in search results and listings"
                    enabled={stack.isVisible}
                    icon={Eye}
                    color="bg-emerald-500"
                    loading={actionLoading === "visibility"}
                    onToggle={handleToggleVisibility}
                  />
                  <ToggleRow
                    label="Featured"
                    description="Highlighted in featured sections on homepage"
                    enabled={stack.isFeatured}
                    icon={Sparkles}
                    color="bg-amber-500"
                    loading={actionLoading === "feature"}
                    onToggle={handleToggleFeature}
                  />
                  <ToggleRow
                    label="Spotlighted"
                    description="Premium spotlight placement with editorial badge"
                    enabled={stack.isSpotlighted}
                    icon={Crown}
                    color="bg-purple-500"
                    loading={actionLoading === "spotlight"}
                    onToggle={handleToggleSpotlight}
                  />
                  <ToggleRow
                    label="Verified"
                    description="Blue verified badge shown on stack profile"
                    enabled={stack.isVerified}
                    icon={Shield}
                    color="bg-blue-500"
                    loading={actionLoading === "verify"}
                    onToggle={handleVerifyToggle}
                  />
                  <ToggleRow
                    label="Rising"
                    description="Appears in the Rising section on homepage"
                    enabled={stack.isTrending}
                    icon={TrendingUp}
                    color="bg-green-500"
                    loading={actionLoading === "trending"}
                    onToggle={handleTrendingToggle}
                  />
                  <ToggleRow
                    label="Pro"
                    description="Pro badge and premium listing benefits"
                    enabled={stack.isPro}
                    icon={Zap}
                    color="bg-indigo-500"
                    loading={actionLoading === "pro"}
                    onToggle={handleProToggle}
                  />
                </div>
              </div>
            )}

            {/* ── Danger Zone Tab ── */}
            {activeTab === "danger" && (
              <div className="space-y-4">
                {/* Suspend */}
                <div className="bg-slate-50 rounded-xl border border-orange-200 p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Ban className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-800">Suspend Stack</h3>
                      <p className="text-xs text-slate-500 mt-0.5 mb-3">
                        Temporarily remove this stack from all public listings. The founder will be notified. This can be reversed.
                      </p>
                      {stack.status === "suspended" ? (
                        <button
                          onClick={handleUnsuspend}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className="w-4 h-4" /> Reinstate Stack
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            value={suspendReason}
                            onChange={e => setSuspendReason(e.target.value)}
                            placeholder="Reason for suspension (required)..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-300"
                            rows={2}
                          />
                          <button
                            onClick={handleSuspend}
                            disabled={!!actionLoading || !suspendReason.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
                          >
                            <Ban className="w-4 h-4" /> Suspend Stack
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete */}
                <div className="bg-slate-50 rounded-xl border border-red-200 p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-800">Delete Stack Permanently</h3>
                      <p className="text-xs text-slate-500 mt-0.5 mb-3">
                        Permanently delete this stack and all associated data including reviews, screenshots, votes, and moderation history. This action <strong>cannot be undone</strong>.
                      </p>
                      {!deleteConfirmOpen ? (
                        <button
                          onClick={() => setDeleteConfirmOpen(true)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Stack
                        </button>
                      ) : (
                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                          <p className="text-sm text-red-700 font-semibold mb-3">
                            Are you sure you want to delete <strong>{stack.name}</strong>?
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setDeleteConfirmOpen(false)}
                              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDelete}
                              disabled={!!actionLoading}
                              className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === "delete" ? "Deleting..." : "Yes, Delete Permanently"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Image Lightbox ═══ */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-8" onClick={() => setSelectedImage(null)}>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={selectedImage} alt="" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
