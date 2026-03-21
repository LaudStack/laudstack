"use client";
export const dynamic = "force-dynamic";
/**
 * Admin Stacks — Claimed
 * Manage founder ownership claims (toolClaims table).
 * Tabs: Pending | Approved | Rejected | All
 */
import { useState, useEffect, useCallback } from "react";
import {
  Search, Shield, Layers, ExternalLink, CheckCircle,
  XCircle, RefreshCw, Eye, User, Globe, Clock,
  ChevronDown, ChevronUp, FileText, Link2,
} from "lucide-react";
import { getAdminClaimedStacks, reviewClaim } from "@/app/actions/admin";
import { toast } from "sonner";
import StackViewModal from "@/components/admin/StackViewModal";

type Claim = {
  id: number;
  toolId: number;
  userId: number;
  status: string;
  notes: string | null;
  proofUrl: string | null;
  verifyMethod: string | null;
  createdAt: Date;
  updatedAt: Date;
  toolName: string | null;
  toolSlug: string | null;
  toolLogoUrl: string | null;
  toolCategory: string | null;
  toolStatus: string | null;
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
  userFounderStatus: string | null;
};

type TabKey = "all" | "pending" | "approved" | "rejected";

const TABS: { key: TabKey; label: string; color: string }[] = [
  { key: "pending",  label: "Pending",  color: "text-amber-600 border-amber-500 bg-amber-50/50" },
  { key: "approved", label: "Approved", color: "text-green-600 border-green-500 bg-green-50/50" },
  { key: "rejected", label: "Rejected", color: "text-red-600 border-red-500 bg-red-50/50" },
  { key: "all",      label: "All",      color: "text-slate-600 border-slate-500 bg-slate-50/50" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
}

function ClaimCard({
  claim,
  onApprove,
  onReject,
  onViewStack,
}: {
  claim: Claim;
  onApprove: (id: number) => void;
  onReject: (id: number, notes: string) => void;
  onViewStack: (toolId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Stack logo */}
        <button onClick={() => onViewStack(claim.toolId)} className="flex-shrink-0 hover:opacity-80 transition-opacity">
          {claim.toolLogoUrl ? (
            <img src={claim.toolLogoUrl} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-slate-400" />
            </div>
          )}
        </button>

        {/* Stack info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button onClick={() => onViewStack(claim.toolId)} className="text-sm font-bold text-slate-800 truncate hover:text-amber-600 transition-colors">
              {claim.toolName || "Unknown Stack"}
            </button>
            <StatusBadge status={claim.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {claim.toolCategory} · Claim #{claim.id}
          </p>
        </div>

        {/* Claimant */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {claim.userAvatar ? (
            <img src={claim.userAvatar} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
          <div className="text-right">
            <p className="text-xs font-medium text-slate-700">{claim.userName || "Unknown"}</p>
            <p className="text-xs text-slate-500">{claim.userEmail}</p>
          </div>
        </div>

        {/* Founder status */}
        <div className="flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            claim.userFounderStatus === "verified"
              ? "bg-green-100 text-green-700"
              : claim.userFounderStatus === "pending"
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-600"
          }`}>
            {claim.userFounderStatus || "none"}
          </span>
        </div>

        {/* Date */}
        <div className="flex-shrink-0">
          <p className="text-xs text-slate-500">{new Date(claim.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {claim.status === "pending" && (
            <>
              <button onClick={() => onApprove(claim.id)}
                className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Approve claim">
                <CheckCircle className="w-4.5 h-4.5" />
              </button>
              <button onClick={() => setShowRejectForm(true)}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Reject claim">
                <XCircle className="w-4.5 h-4.5" />
              </button>
            </>
          )}
          <button onClick={() => onViewStack(claim.toolId)}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="View stack">
            <Eye className="w-4 h-4" />
          </button>
          {claim.toolSlug && (
            <a href={`/tools/${claim.toolSlug}`} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View on site">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors" title="Details">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Verification Method</p>
                <p className="text-sm text-slate-600">{claim.verifyMethod || "Not specified"}</p>
              </div>
              {claim.notes && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Claim Notes</p>
                  <p className="text-sm text-slate-600">{claim.notes}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {claim.proofUrl && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Proof URL</p>
                  <a href={claim.proofUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-amber-600 hover:underline flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> View Proof
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Stack Status</p>
                <StatusBadge status={claim.toolStatus || "unknown"} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject form */}
      {showRejectForm && (
        <div className="px-5 pb-4 pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-600 mb-2">Rejection Notes (optional)</p>
          <textarea
            value={rejectNotes}
            onChange={e => setRejectNotes(e.target.value)}
            placeholder="Reason for rejecting this claim..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            rows={2}
          />
          <div className="flex gap-2 mt-2">
            <button onClick={() => setShowRejectForm(false)}
              className="px-3 h-8 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => { onReject(claim.id, rejectNotes); setShowRejectForm(false); }}
              className="px-3 h-8 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg">Reject</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AdminClaimedStacks() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [viewToolId, setViewToolId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminClaimedStacks({ status: activeTab, search, page });
      setClaims(res.claims as unknown as Claim[]);
      setTotal(res.total);
      setCounts(res.counts);
    } catch {
      toast.error("Failed to load claims");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    try {
      await reviewClaim(id, "approved");
      toast.success("Claim approved — ownership transferred");
      load();
    } catch {
      toast.error("Failed to approve claim");
    }
  };

  const handleReject = async (id: number, notes: string) => {
    try {
      await reviewClaim(id, "rejected");
      toast.success("Claim rejected");
      load();
    } catch {
      toast.error("Failed to reject claim");
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Claimed Stacks</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Founder ownership claims — verify and manage stack ownership
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
              activeTab === tab.key ? tab.color : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs font-bold opacity-70">
              ({counts[tab.key]})
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by stack name, user name, or email..."
            className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
          />
        </div>
        <button onClick={load} className="h-9 px-3 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Claim Cards */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-72 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))
        ) : claims.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No {activeTab === "all" ? "" : activeTab} claims found</p>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === "pending" ? "All claims have been reviewed" : "Try a different filter"}
            </p>
          </div>
        ) : (
          claims.map(claim => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewStack={(toolId) => setViewToolId(toolId)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-500">
            Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 h-7 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition-colors">Prev</button>
            <span className="px-3 h-7 flex items-center text-xs text-slate-600 font-medium">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 h-7 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100 transition-colors">Next</button>
          </div>
        </div>
      )}

      {/* Stack View Modal */}
      {viewToolId && (
        <StackViewModal toolId={viewToolId} onClose={() => setViewToolId(null)} onRefresh={load} />
      )}
    </div>
  );
}
