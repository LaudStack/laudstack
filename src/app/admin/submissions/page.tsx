"use client";
/*
 * LaudStack Admin — Product Submissions Review
 * Review pending product submissions, approve or reject with notes
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search, FileText, CheckCircle, XCircle, RefreshCw,
  Globe, Calendar, User, Tag, DollarSign, Eye, ChevronDown,
  ChevronUp, AlertTriangle, Sparkles,
} from "lucide-react";
import { getAdminSubmissions, reviewSubmission } from "@/app/actions/admin";
import { toast } from "sonner";
import type { ToolSubmission } from "@/drizzle/schema";

const STATUS_TABS = [
  { value: "pending",  label: "Pending",  color: "text-amber-600" },
  { value: "approved", label: "Approved", color: "text-green-600" },
  { value: "rejected", label: "Rejected", color: "text-red-600" },
  { value: "all",      label: "All",      color: "text-slate-600" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
}

function SubmissionCard({
  submission, onApprove, onReject,
}: {
  submission: ToolSubmission;
  onApprove: (id: number) => void;
  onReject: (id: number, notes: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const tags = (() => {
    try { return JSON.parse(submission.tags ?? "[]") as string[]; }
    catch { return []; }
  })();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {submission.logoUrl ? (
            <img src={submission.logoUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900">{submission.name}</h3>
              <StatusBadge status={submission.status} />
            </div>
            <p className="text-sm text-slate-600 mt-0.5">{submission.tagline}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <a href={submission.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors">
                <Globe className="w-3 h-3" /> {submission.website}
              </a>
              {submission.category && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Tag className="w-3 h-3" /> {submission.category}
                </span>
              )}
              {submission.pricingModel && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <DollarSign className="w-3 h-3" /> {submission.pricingModel}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3 h-3" /> {new Date(submission.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {submission.status === "pending" && (
              <>
                <button
                  onClick={() => onApprove(submission.id)}
                  className="flex items-center gap-1.5 px-3 h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => setShowRejectForm(o => !o)}
                  className="flex items-center gap-1.5 px-3 h-8 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </>
            )}
            <button
              onClick={() => setExpanded(o => !o)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Reject form */}
        {showRejectForm && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rejection reason (optional)</label>
            <textarea
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 resize-none"
              rows={2}
              placeholder="Explain why this submission is being rejected..."
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setShowRejectForm(false)}
                className="px-3 h-7 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => { onReject(submission.id, rejectNotes); setShowRejectForm(false); }}
                className="px-3 h-7 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors">
                Confirm Reject
              </button>
            </div>
          </div>
        )}

        {/* Review notes if rejected */}
        {submission.reviewNotes && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1">Review Notes:</p>
            <p className="text-xs text-slate-600">{submission.reviewNotes}</p>
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
          {submission.description && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed">{submission.description}</p>
            </div>
          )}
          {tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <span key={tag} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}
          {(submission.founderName || submission.founderRole) && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Founder</p>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm text-slate-700">{submission.founderName}</span>
                {submission.founderRole && <span className="text-xs text-slate-400">— {submission.founderRole}</span>}
              </div>
              {submission.founderLinkedin && (
                <a href={submission.founderLinkedin} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:text-blue-700 mt-1 block">
                  LinkedIn Profile →
                </a>
              )}
            </div>
          )}
          {submission.verifyMethod && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Verification Method</p>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{submission.verifyMethod}</span>
            </div>
          )}
          {submission.demoVideoUrl && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Demo Video</p>
              <a href={submission.demoVideoUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-700">
                Watch Demo →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<ToolSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSubmissions({ status, page });
      setSubmissions(res.submissions);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    try {
      await reviewSubmission(id, "approved");
      toast.success("Submission approved! Founder status updated to verified.");
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
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Submissions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and approve product submissions from founders</p>
        </div>
        <button onClick={load} className="h-9 px-3 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Status tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatus(tab.value); setPage(1); }}
              className={`px-3 h-7 rounded-md text-xs font-semibold transition-colors ${
                status === tab.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-32" />
                  <div className="h-3 bg-slate-100 rounded w-64" />
                  <div className="h-3 bg-slate-100 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-slate-200" />
          <p className="text-slate-500 font-medium">No {status === "all" ? "" : status} submissions</p>
          <p className="text-sm text-slate-400 mt-1">
            {status === "pending" ? "All caught up! No pending submissions." : `No ${status} submissions found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(submission => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}</p>
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
