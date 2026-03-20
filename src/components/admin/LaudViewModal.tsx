"use client";
/**
 * LaudViewModal — Full-detail admin laud activity modal
 * 
 * Design: Slide-in overlay panel showing laud details,
 * user info, tool info, metadata, and remove action.
 */
import { useState } from "react";
import {
  X, Heart, Trash2, AlertTriangle, RefreshCw,
  User, Calendar, Hash, ExternalLink, Clock, Globe,
} from "lucide-react";
import { adminRemoveLauds } from "@/app/actions/laud";
import { toast } from "sonner";

type LaudData = {
  id: number;
  userId: number;
  toolId: number;
  ipAddress: string | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
  userAvatar?: string | null;
  toolName: string | null;
  toolSlug: string | null;
  toolLogo?: string | null;
};

export default function LaudViewModal({
  laud,
  onClose,
  onRefresh,
}: {
  laud: LaudData;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRemove = async () => {
    setActionLoading(true);
    try {
      const res = await adminRemoveLauds({ laudIds: [laud.id] });
      if (res.success) {
        toast.success("Laud removed");
        onRefresh();
        onClose();
      } else {
        toast.error(res.error || "Failed to remove laud");
      }
    } catch {
      toast.error("Failed to remove laud");
    } finally {
      setActionLoading(false);
      setConfirmDelete(false);
    }
  };

  const displayName = laud.userName || "Anonymous";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Laud Details</h2>
                <p className="text-xs text-slate-500">ID #{laud.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lauded By</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-black text-slate-600 flex-shrink-0 overflow-hidden">
                {laud.userAvatar ? (
                  <img src={laud.userAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  displayName[0]?.toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{displayName}</p>
                {laud.userEmail && (
                  <p className="text-xs text-slate-500">{laud.userEmail}</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">User ID: #{laud.userId}</p>
              </div>
            </div>
          </div>

          {/* Tool Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lauded Stack</p>
            <div className="flex items-center gap-3">
              {laud.toolLogo ? (
                <img src={laud.toolLogo} alt="" className="w-10 h-10 rounded-xl border border-slate-200" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
                  {laud.toolName?.[0] || "?"}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-900">{laud.toolName || `Tool #${laud.toolId}`}</p>
                {laud.toolSlug && (
                  <a href={`/tools/${laud.toolSlug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                    View product page <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Metadata</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Laud ID
                </p>
                <p className="text-slate-700 font-mono">#{laud.id}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> IP Address
                </p>
                <p className="text-slate-700 font-mono">{laud.ipAddress || "Not captured"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Created
                </p>
                <p className="text-slate-700">{new Date(laud.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                  <User className="w-3 h-3" /> User ID
                </p>
                <p className="text-slate-700 font-mono">#{laud.userId}</p>
              </div>
            </div>
          </div>

          {/* Moderation Actions */}
          <div className="border-t border-slate-200 pt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Moderation Actions</p>

            {/* Confirmation panel */}
            {confirmDelete && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-bold text-slate-800">Remove this laud?</p>
                </div>
                <p className="text-xs text-slate-600 mb-3">This will remove the laud and decrease the tool&apos;s laud count.</p>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemove}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-60 text-white bg-red-500 hover:bg-red-600"
                  >
                    {actionLoading ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                    ) : (
                      "Confirm Remove"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Laud
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
