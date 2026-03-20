"use client";
/**
 * Admin Stacks — Launches
 * Manage founder-submitted stacks (toolSubmissions table).
 * Tabs: Pending | Approved | Rejected | All
 */
import { useState, useEffect, useCallback } from "react";
import {
  Search, Rocket, Layers, ExternalLink, CheckCircle,
  XCircle, RefreshCw, Eye, Clock, Globe, User,
  Loader2, FileText, ChevronDown, ChevronUp,
  Image as ImageIcon, Tag,
} from "lucide-react";
import { getAdminLaunches, reviewSubmission } from "@/app/actions/admin";
import { toast } from "sonner";

type Launch = {
  id: number;
  userId: number;
  name: string;
  tagline: string;
  website: string;
  description: string | null;
  logoUrl: string | null;
  launchDate: Date | null;
  category: string;
  tags: string[];
  pricingModel: string;
  screenshots: string[];
  demoVideoUrl: string | null;
  verifyMethod: string | null;
  founderName: string;
  founderRole: string | null;
  founderBio: string | null;
  founderLinkedin: string | null;
  status: string;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
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

function LaunchCard({
  launch,
  onApprove,
  onReject,
}: {
  launch: Launch;
  onApprove: (id: number) => void;
  onReject: (id: number, notes: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Logo */}
        {launch.logoUrl ? (
          <img src={launch.logoUrl} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Rocket className="w-5 h-5 text-slate-400" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 truncate">{launch.name}</h3>
            <StatusBadge status={launch.status} />
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">{launch.tagline}</p>
        </div>

        {/* Founder */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {launch.userAvatar ? (
            <img src={launch.userAvatar} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
          <div className="text-right">
            <p className="text-xs font-medium text-slate-700">{launch.founderName || launch.userName || "Unknown"}</p>
            <p className="text-xs text-slate-500">{launch.founderRole || "Founder"}</p>
          </div>
        </div>

        {/* Date */}
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-slate-500">{new Date(launch.createdAt).toLocaleDateString()}</p>
          {launch.launchDate && (
            <p className="text-xs text-slate-500">
              Launch: {new Date(launch.launchDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {launch.status === "pending" && (
            <>
              <button onClick={() => onApprove(launch.id)}
                className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Approve">
                <CheckCircle className="w-4.5 h-4.5" />
              </button>
              <button onClick={() => setShowRejectForm(true)}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Reject">
                <XCircle className="w-4.5 h-4.5" />
              </button>
            </>
          )}
          <a href={launch.website} target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Visit website">
            <Globe className="w-4 h-4" />
          </a>
          <button onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors" title="Details">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-slate-600 leading-relaxed">{launch.description || "No description"}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-600">{launch.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Pricing:</span>
                  <span className="text-slate-600">{launch.pricingModel}</span>
                </div>
                {launch.verifyMethod && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Verify:</span>
                    <span className="text-slate-600">{launch.verifyMethod}</span>
                  </div>
                )}
              </div>
              {launch.tags && launch.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {launch.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Founder Info</p>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-700"><span className="text-slate-500">Name:</span> {launch.founderName}</p>
                  {launch.founderRole && <p className="text-slate-700"><span className="text-slate-500">Role:</span> {launch.founderRole}</p>}
                  {launch.founderBio && <p className="text-slate-600 text-xs">{launch.founderBio}</p>}
                  {launch.founderLinkedin && (
                    <a href={launch.founderLinkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:underline">
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
              {launch.userEmail && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Account</p>
                  <p className="text-xs text-slate-600">{launch.userEmail}</p>
                </div>
              )}
              {launch.demoVideoUrl && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Demo Video</p>
                  <a href={launch.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:underline">
                    Watch Demo
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Screenshots */}
          {launch.screenshots && launch.screenshots.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Media ({launch.screenshots.length})</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {launch.screenshots.map((url, i) => (
                  <img key={i} src={url} alt="" className="h-20 rounded-lg border border-slate-200 object-cover flex-shrink-0" />
                ))}
              </div>
            </div>
          )}

          {/* Review notes (if already reviewed) */}
          {launch.reviewNotes && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-bold text-slate-500 mb-1">Admin Notes</p>
              <p className="text-sm text-slate-600">{launch.reviewNotes}</p>
              {launch.reviewedAt && (
                <p className="text-xs text-slate-500 mt-1">Reviewed: {new Date(launch.reviewedAt).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reject form */}
      {showRejectForm && (
        <div className="px-5 pb-4 pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-600 mb-2">Rejection Notes (optional)</p>
          <textarea
            value={rejectNotes}
            onChange={e => setRejectNotes(e.target.value)}
            placeholder="Reason for rejection..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            rows={2}
          />
          <div className="flex gap-2 mt-2">
            <button onClick={() => setShowRejectForm(false)}
              className="px-3 h-8 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => { onReject(launch.id, rejectNotes); setShowRejectForm(false); }}
              className="px-3 h-8 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg">Reject</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AdminLaunches() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminLaunches({ status: activeTab, search, page });
      setLaunches(res.launches as unknown as Launch[]);
      setTotal(res.total);
      setCounts(res.counts);
    } catch {
      toast.error("Failed to load launches");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    try {
      await reviewSubmission(id, "approved", "");
      toast.success("Submission approved — stack created");
      load();
    } catch {
      toast.error("Failed to approve submission");
    }
  };

  const handleReject = async (id: number, notes: string) => {
    try {
      await reviewSubmission(id, "rejected", notes);
      toast.success("Submission rejected");
      load();
    } catch {
      toast.error("Failed to reject submission");
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Launches</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Founder-submitted stacks awaiting review and approval
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
            placeholder="Search launches..."
            className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
          />
        </div>
        <button onClick={load} className="h-9 px-3 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Launch Cards */}
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
        ) : launches.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <Rocket className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No {activeTab === "all" ? "" : activeTab} launches found</p>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === "pending" ? "All submissions have been reviewed" : "Try a different filter"}
            </p>
          </div>
        ) : (
          launches.map(launch => (
            <LaunchCard
              key={launch.id}
              launch={launch}
              onApprove={handleApprove}
              onReject={handleReject}
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
    </div>
  );
}
