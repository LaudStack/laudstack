"use client";
/*
 * LaudStack Admin — Founders Management
 * List founder requests, verify or reject, view details
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search, UserCheck, CheckCircle, XCircle, RefreshCw,
  Clock, Globe, Linkedin, MapPin, Calendar, AlertTriangle,
} from "lucide-react";
import { getAdminFounders, verifyFounder } from "@/app/actions/admin";
import { toast } from "sonner";
import type { User } from "@/drizzle/schema";

const STATUS_TABS = [
  { value: "all",      label: "All" },
  { value: "pending",  label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  "bg-amber-100 text-amber-700 border-amber-200",
    verified: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    none:     "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status] ?? map.none}`}>
      {status}
    </span>
  );
}

function FounderCard({
  founder, onVerify, onReject,
}: {
  founder: User;
  onVerify: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayName = founder.name || `${founder.firstName ?? ""} ${founder.lastName ?? ""}`.trim() || "Anonymous";

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {founder.avatarUrl ? (
            <img src={founder.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-base font-bold text-slate-500 flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-800">{displayName}</h3>
              <StatusBadge status={founder.founderStatus} />
            </div>
            <p className="text-sm text-slate-500 mt-0.5 truncate">{founder.email}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {(founder.city || founder.country) && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" />
                  {[founder.city, founder.country].filter(Boolean).join(", ")}
                </span>
              )}
              {founder.linkedinUrl && (
                <a href={founder.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </a>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3 h-3" />
                Joined {new Date(founder.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {founder.founderStatus === "pending" && (
              <>
                <button
                  onClick={() => onVerify(founder.id)}
                  className="flex items-center gap-1.5 px-3 h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Verify
                </button>
                <button
                  onClick={() => onReject(founder.id)}
                  className="flex items-center gap-1.5 px-3 h-8 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </>
            )}
            {founder.founderStatus === "verified" && (
              <button
                onClick={() => onReject(founder.id)}
                className="flex items-center gap-1.5 px-3 h-8 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors"
              >
                Revoke
              </button>
            )}
            {founder.founderStatus === "rejected" && (
              <button
                onClick={() => onVerify(founder.id)}
                className="flex items-center gap-1.5 px-3 h-8 border border-green-200 text-green-600 hover:bg-green-50 rounded-lg text-xs font-medium transition-colors"
              >
                Re-verify
              </button>
            )}
          </div>
        </div>

        {/* Founder bio */}
        {founder.founderBio && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{founder.founderBio}</p>
          </div>
        )}

        {/* Verified at */}
        {founder.founderVerifiedAt && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" />
            Verified {new Date(founder.founderVerifiedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminFounders() {
  const [founders, setFounders] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    id: number; action: "verified" | "rejected"; name: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminFounders({ status, page });
      setFounders(res.founders);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load founders");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: number, action: "verified" | "rejected") => {
    try {
      await verifyFounder(id, action);
      toast.success(action === "verified" ? "Founder verified!" : "Founder rejected");
      setConfirmAction(null);
      load();
    } catch {
      toast.error("Failed to update founder status");
    }
  };

  const filteredFounders = search
    ? founders.filter(f =>
        (f.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (f.email || "").toLowerCase().includes(search.toLowerCase())
      )
    : founders;

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Founders</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage founder verification requests</p>
        </div>
        <button onClick={load} className="h-9 px-3 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Status tabs + search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
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
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name or email..."
            className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
          />
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-32" />
                  <div className="h-3 bg-slate-100 rounded w-48" />
                  <div className="h-3 bg-slate-100 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredFounders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <UserCheck className="w-10 h-10 mx-auto mb-3 text-slate-200" />
          <p className="text-slate-500 font-medium">No founders found</p>
          <p className="text-sm text-slate-400 mt-1">
            {status === "pending" ? "No pending verification requests" : `No ${status} founders`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFounders.map(founder => (
            <FounderCard
              key={founder.id}
              founder={founder}
              onVerify={(id) => {
                const name = founder.name || founder.email || "this founder";
                setConfirmAction({ id, action: "verified", name });
              }}
              onReject={(id) => {
                const name = founder.name || founder.email || "this founder";
                setConfirmAction({ id, action: "rejected", name });
              }}
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

      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmAction.action === "verified" ? "bg-green-100" : "bg-red-100"}`}>
                {confirmAction.action === "verified"
                  ? <CheckCircle className="w-5 h-5 text-green-600" />
                  : <XCircle className="w-5 h-5 text-red-600" />
                }
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {confirmAction.action === "verified" ? "Verify Founder" : "Reject Founder"}
                </h3>
                <p className="text-sm text-slate-500">Confirm this action</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              {confirmAction.action === "verified"
                ? `Verify ${confirmAction.name} as a founder? They will gain access to the Founder Dashboard.`
                : `Reject ${confirmAction.name}'s founder application?`
              }
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)}
                className="flex-1 h-9 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmAction.id, confirmAction.action)}
                className={`flex-1 h-9 rounded-lg text-sm font-bold transition-colors text-white ${
                  confirmAction.action === "verified" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmAction.action === "verified" ? "Verify" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
