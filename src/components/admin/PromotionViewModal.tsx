"use client";
/**
 * PromotionViewModal — Full-detail admin promotion management modal
 *
 * Design: Slide-in overlay panel with comprehensive promotion data,
 * entity info, payment details, timeline, and admin actions
 * (pause/resume, force-expire, cancel, extend, edit notes).
 */
import { useState, useEffect, useCallback } from "react";
import {
  X, Clock, Calendar, DollarSign, User, Hash, ExternalLink,
  Megaphone, Pause, Play, XCircle, Timer, AlertTriangle,
  CheckCircle, Zap, Crown, Target, Star, TrendingUp,
  Shield, FileText, RefreshCw, Trash2, Edit3, Save,
  Package, ShoppingBag, Tag,
} from "lucide-react";
import {
  getAdminPromotionDetails,
  adminForceExpirePromotion,
  adminChangePromotionStatus,
  adminUpdatePromotionNotes,
  getPromotionsForEntity,
} from "@/app/actions/promotions";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────── */

type PromotionDetail = Awaited<ReturnType<typeof getAdminPromotionDetails>>;

/* ─── Status Config ─────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  pending_payment: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending Payment", icon: <Clock className="w-3.5 h-3.5" /> },
  paid: { bg: "bg-blue-100", text: "text-blue-700", label: "Paid", icon: <DollarSign className="w-3.5 h-3.5" /> },
  scheduled: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Scheduled", icon: <Calendar className="w-3.5 h-3.5" /> },
  active: { bg: "bg-green-100", text: "text-green-700", label: "Active", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  expired: { bg: "bg-slate-100", text: "text-slate-600", label: "Expired", icon: <Timer className="w-3.5 h-3.5" /> },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled", icon: <XCircle className="w-3.5 h-3.5" /> },
  failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  paused: { bg: "bg-amber-100", text: "text-amber-700", label: "Paused", icon: <Pause className="w-3.5 h-3.5" /> },
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  stack_featured: { label: "Stack Featured", icon: <Star className="w-4 h-4" />, color: "text-amber-600" },
  stack_spotlight: { label: "Stack Spotlight", icon: <Crown className="w-4 h-4" />, color: "text-purple-600" },
  stack_category_boost: { label: "Category Boost", icon: <TrendingUp className="w-4 h-4" />, color: "text-blue-600" },
  deal_pinned: { label: "Deal Pinned", icon: <Target className="w-4 h-4" />, color: "text-emerald-600" },
  deal_featured: { label: "Deal Featured", icon: <Star className="w-4 h-4" />, color: "text-amber-600" },
  deal_of_day: { label: "Deal of the Day", icon: <Zap className="w-4 h-4" />, color: "text-red-600" },
  marketplace_boost: { label: "Marketplace Boost", icon: <TrendingUp className="w-4 h-4" />, color: "text-blue-600" },
  marketplace_spotlight: { label: "Marketplace Spotlight", icon: <Crown className="w-4 h-4" />, color: "text-purple-600" },
};

const TARGET_ICONS: Record<string, React.ReactNode> = {
  stack: <Package className="w-4 h-4" />,
  deal: <Tag className="w-4 h-4" />,
  marketplace: <ShoppingBag className="w-4 h-4" />,
};

/* ─── Helper ────────────────────────────────────────────── */

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtMoney(cents: number | null | undefined) {
  if (!cents && cents !== 0) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function timeRemaining(expiresAt: Date | string | null | undefined): string {
  if (!expiresAt) return "—";
  const exp = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const diff = exp.getTime() - now.getTime();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m remaining`;
}

/* ─── Component ─────────────────────────────────────────── */

export default function PromotionViewModal({
  promotionId,
  onClose,
  onRefresh,
}: {
  promotionId: number;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [data, setData] = useState<PromotionDetail | null>(null);
  const [entityHistory, setEntityHistory] = useState<Awaited<ReturnType<typeof getPromotionsForEntity>>>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "history" | "actions">("details");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAdminPromotionDetails(promotionId);
      setData(result);
      setNotesValue(result.promotion.adminNotes ?? "");
      // Load entity history
      const history = await getPromotionsForEntity(
        result.promotion.target as "stack" | "deal" | "marketplace",
        result.promotion.targetEntityId
      );
      setEntityHistory(history);
    } catch (e) {
      toast.error("Failed to load promotion details");
    } finally {
      setLoading(false);
    }
  }, [promotionId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (action: string) => {
    if (!data) return;
    setActionLoading(true);
    try {
      switch (action) {
        case "pause":
          await adminChangePromotionStatus(promotionId, "paused", "Paused by admin");
          toast.success("Promotion paused");
          break;
        case "resume":
          await adminChangePromotionStatus(promotionId, "active", "Resumed by admin");
          toast.success("Promotion resumed");
          break;
        case "force_expire":
          await adminForceExpirePromotion(promotionId, "Force expired by admin");
          toast.success("Promotion force-expired");
          break;
        case "cancel":
          await adminChangePromotionStatus(promotionId, "cancelled", "Cancelled by admin");
          toast.success("Promotion cancelled");
          break;
        case "activate":
          await adminChangePromotionStatus(promotionId, "active", "Manually activated by admin");
          toast.success("Promotion activated");
          break;
      }
      setConfirmAction(null);
      onRefresh();
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await adminUpdatePromotionNotes(promotionId, notesValue);
      toast.success("Notes updated");
      setEditingNotes(false);
      await loadData();
    } catch {
      toast.error("Failed to save notes");
    }
  };

  if (loading || !data) {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
        <div className="fixed top-0 right-0 h-full w-full max-w-[680px] bg-white z-[61] shadow-2xl flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      </>
    );
  }

  const { promotion: promo, user, entity, admin } = data;
  const status = STATUS_CONFIG[promo.status] ?? STATUS_CONFIG.pending_payment;
  const typeInfo = TYPE_CONFIG[promo.type] ?? { label: promo.type, icon: <Megaphone className="w-4 h-4" />, color: "text-slate-600" };
  const isActive = promo.status === "active";
  const isPaused = promo.status === "paused";
  const canPause = isActive;
  const canResume = isPaused;
  const canForceExpire = isActive || isPaused;
  const canCancel = ["pending_payment", "paid", "scheduled"].includes(promo.status);
  const canActivate = ["paid", "scheduled", "paused"].includes(promo.status);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[680px] bg-white z-[61] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-100 ${typeInfo.color}`}>
              {typeInfo.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Promotion #{promo.id}</h2>
              <p className="text-xs text-slate-500">{typeInfo.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
              {status.icon} {status.label}
            </span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6">
          {(["details", "history", "actions"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-amber-500 text-amber-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "details" ? "Details" : tab === "history" ? "Entity History" : "Actions"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "details" && (
            <>
              {/* Time Remaining Banner */}
              {(isActive || isPaused) && promo.expiresAt && (
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isActive ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                  <Timer className={`w-5 h-5 ${isActive ? "text-green-600" : "text-amber-600"}`} />
                  <div>
                    <p className={`text-sm font-semibold ${isActive ? "text-green-700" : "text-amber-700"}`}>
                      {timeRemaining(promo.expiresAt)}
                    </p>
                    <p className="text-xs text-slate-500">Expires: {fmtDate(promo.expiresAt)}</p>
                  </div>
                </div>
              )}

              {/* Entity Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  {TARGET_ICONS[promo.target]}
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    {promo.target === "stack" ? "Stack" : promo.target === "deal" ? "Deal" : "Marketplace Product"}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  {entity.extra && (entity.extra as any).logoUrl && (
                    <img src={(entity.extra as any).logoUrl} alt="" className="w-10 h-10 rounded-lg border border-slate-200" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{entity.name}</p>
                    <p className="text-xs text-slate-500">ID: {promo.targetEntityId}</p>
                  </div>
                </div>
                {/* Current visibility flags */}
                {entity.extra && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(entity.extra as any).isFeatured && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Featured</span>
                    )}
                    {(entity.extra as any).isSpotlighted && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">Spotlighted</span>
                    )}
                    {(entity.extra as any).isBoosted && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Boosted</span>
                    )}
                    {(entity.extra as any).placement && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                        Placement: {(entity.extra as any).placement}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Purchaser</h3>
                </div>
                <div className="flex items-center gap-3">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full border border-slate-200" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                      {(user?.name ?? "?")[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{user?.name ?? "Unknown"}</p>
                    <p className="text-xs text-slate-500">{user?.email ?? "—"}</p>
                  </div>
                </div>
              </div>

              {/* Promotion Details Grid */}
              <div className="bg-slate-50 rounded-xl border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700">Promotion Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-px bg-slate-100">
                  {[
                    { label: "Type", value: typeInfo.label },
                    { label: "Target", value: promo.target.charAt(0).toUpperCase() + promo.target.slice(1) },
                    { label: "Duration", value: `${promo.durationDays} day${promo.durationDays !== 1 ? "s" : ""}` },
                    { label: "Amount Paid", value: fmtMoney(promo.amountPaid) },
                    { label: "Currency", value: (promo.currency ?? "usd").toUpperCase() },
                    { label: "Manual", value: promo.isManual ? "Yes (Admin-granted)" : "No (Paid)" },
                    { label: "Starts At", value: fmtDate(promo.startsAt) },
                    { label: "Expires At", value: fmtDate(promo.expiresAt) },
                    { label: "Slot Date", value: promo.slotDate ?? "—" },
                    { label: "Created", value: fmtDate(promo.createdAt) },
                    { label: "Updated", value: fmtDate(promo.updatedAt) },
                    { label: "Promotion ID", value: `#${promo.id}` },
                  ].map((item, i) => (
                    <div key={i} className="bg-white px-4 py-3">
                      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-slate-50 rounded-xl border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Payment Details
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-px bg-slate-100">
                  {[
                    { label: "Stripe Session ID", value: promo.stripeSessionId ?? "—" },
                    { label: "Stripe Payment Intent", value: promo.stripePaymentIntentId ?? "—" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white px-4 py-3">
                      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-mono text-slate-700 mt-0.5 break-all">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Info */}
              {(admin || promo.isManual) && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Admin Action</h3>
                  </div>
                  {admin && (
                    <p className="text-sm text-slate-700">
                      Assigned by <span className="font-semibold">{admin.name}</span> ({admin.email})
                    </p>
                  )}
                </div>
              )}

              {/* Admin Notes */}
              <div className="bg-slate-50 rounded-xl border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Admin Notes
                  </h3>
                  {!editingNotes ? (
                    <button onClick={() => setEditingNotes(true)} className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingNotes(false); setNotesValue(promo.adminNotes ?? ""); }} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                      <button onClick={handleSaveNotes} className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                        <Save className="w-3 h-3" /> Save
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {editingNotes ? (
                    <textarea
                      value={notesValue}
                      onChange={e => setNotesValue(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none resize-none"
                      placeholder="Add admin notes..."
                    />
                  ) : (
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {promo.adminNotes || "No notes yet."}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "history" && (
            <>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
                <h3 className="text-sm font-bold text-slate-700 mb-1">Promotion History for {entity.name}</h3>
                <p className="text-xs text-slate-500">All promotions ever created for this entity, newest first.</p>
              </div>
              {entityHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No promotion history found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entityHistory.map(h => {
                    const hStatus = STATUS_CONFIG[h.status] ?? STATUS_CONFIG.pending_payment;
                    const hType = TYPE_CONFIG[h.type] ?? { label: h.type, icon: null, color: "text-slate-600" };
                    const isCurrent = h.id === promo.id;
                    return (
                      <div key={h.id} className={`p-4 rounded-lg border ${isCurrent ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${hType.color}`}>{hType.label}</span>
                            {isCurrent && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-800 rounded">CURRENT</span>}
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${hStatus.bg} ${hStatus.text}`}>
                            {hStatus.icon} {hStatus.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs text-slate-500">
                          <div>
                            <span className="font-medium text-slate-500">Duration:</span> {h.durationDays}d
                          </div>
                          <div>
                            <span className="font-medium text-slate-500">Paid:</span> {fmtMoney(h.amountPaid)}
                          </div>
                          <div>
                            <span className="font-medium text-slate-500">Created:</span> {fmtDate(h.createdAt)}
                          </div>
                        </div>
                        {h.startsAt && h.expiresAt && (
                          <div className="mt-1 text-xs text-slate-500">
                            {fmtDate(h.startsAt)} → {fmtDate(h.expiresAt)}
                            {h.isManual && <span className="ml-2 text-purple-500 font-medium">(Manual)</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "actions" && (
            <>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
                <h3 className="text-sm font-bold text-slate-700 mb-1">Admin Actions</h3>
                <p className="text-xs text-slate-500">Manage this promotion. Actions take effect immediately.</p>
              </div>

              <div className="space-y-3">
                {/* Pause */}
                {canPause && (
                  <ActionCard
                    icon={<Pause className="w-5 h-5 text-amber-600" />}
                    title="Pause Promotion"
                    description="Temporarily pause this promotion. The entity will lose its visibility boost until resumed."
                    buttonLabel="Pause"
                    buttonColor="bg-amber-500 hover:bg-amber-600"
                    confirmAction={confirmAction}
                    actionKey="pause"
                    onConfirm={() => setConfirmAction("pause")}
                    onExecute={() => handleAction("pause")}
                    onCancel={() => setConfirmAction(null)}
                    loading={actionLoading}
                  />
                )}

                {/* Resume */}
                {canResume && (
                  <ActionCard
                    icon={<Play className="w-5 h-5 text-green-600" />}
                    title="Resume Promotion"
                    description="Resume this paused promotion. Visibility effects will be re-applied."
                    buttonLabel="Resume"
                    buttonColor="bg-green-500 hover:bg-green-600"
                    confirmAction={confirmAction}
                    actionKey="resume"
                    onConfirm={() => setConfirmAction("resume")}
                    onExecute={() => handleAction("resume")}
                    onCancel={() => setConfirmAction(null)}
                    loading={actionLoading}
                  />
                )}

                {/* Activate */}
                {canActivate && (
                  <ActionCard
                    icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                    title="Activate Promotion"
                    description="Manually activate this promotion. Visibility effects will be applied immediately."
                    buttonLabel="Activate"
                    buttonColor="bg-green-500 hover:bg-green-600"
                    confirmAction={confirmAction}
                    actionKey="activate"
                    onConfirm={() => setConfirmAction("activate")}
                    onExecute={() => handleAction("activate")}
                    onCancel={() => setConfirmAction(null)}
                    loading={actionLoading}
                  />
                )}

                {/* Force Expire */}
                {canForceExpire && (
                  <ActionCard
                    icon={<Timer className="w-5 h-5 text-red-600" />}
                    title="Force Expire"
                    description="Immediately expire this promotion. Visibility effects will be removed. This cannot be undone."
                    buttonLabel="Force Expire"
                    buttonColor="bg-red-500 hover:bg-red-600"
                    confirmAction={confirmAction}
                    actionKey="force_expire"
                    onConfirm={() => setConfirmAction("force_expire")}
                    onExecute={() => handleAction("force_expire")}
                    onCancel={() => setConfirmAction(null)}
                    loading={actionLoading}
                    destructive
                  />
                )}

                {/* Cancel */}
                {canCancel && (
                  <ActionCard
                    icon={<XCircle className="w-5 h-5 text-red-600" />}
                    title="Cancel Promotion"
                    description="Cancel this promotion entirely. If it was pending payment, the checkout session will be voided."
                    buttonLabel="Cancel"
                    buttonColor="bg-red-500 hover:bg-red-600"
                    confirmAction={confirmAction}
                    actionKey="cancel"
                    onConfirm={() => setConfirmAction("cancel")}
                    onExecute={() => handleAction("cancel")}
                    onCancel={() => setConfirmAction(null)}
                    loading={actionLoading}
                    destructive
                  />
                )}

                {/* No actions available */}
                {!canPause && !canResume && !canForceExpire && !canCancel && !canActivate && (
                  <div className="text-center py-12 text-slate-500">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No actions available for this promotion status.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Action Card Sub-component ─────────────────────────── */

function ActionCard({
  icon,
  title,
  description,
  buttonLabel,
  buttonColor,
  confirmAction,
  actionKey,
  onConfirm,
  onExecute,
  onCancel,
  loading,
  destructive = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  buttonColor: string;
  confirmAction: string | null;
  actionKey: string;
  onConfirm: () => void;
  onExecute: () => void;
  onCancel: () => void;
  loading: boolean;
  destructive?: boolean;
}) {
  const isConfirming = confirmAction === actionKey;
  return (
    <div className={`p-4 rounded-xl border ${destructive ? "border-red-200 bg-red-50/50" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          {!isConfirming ? (
            <button
              onClick={onConfirm}
              className={`mt-3 px-4 py-1.5 text-xs font-semibold text-white rounded-lg ${buttonColor} transition-colors`}
            >
              {buttonLabel}
            </button>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={onExecute}
                disabled={loading}
                className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg ${buttonColor} transition-colors disabled:opacity-50`}
              >
                {loading ? "Processing..." : `Confirm ${buttonLabel}`}
              </button>
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
