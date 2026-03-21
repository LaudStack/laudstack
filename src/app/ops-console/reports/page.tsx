"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import {
  Flag, AlertTriangle, MessageSquare, Star, Eye, Loader2,
  ChevronLeft, ChevronRight, ExternalLink, Shield, Check, X,
  Filter
} from "lucide-react";
import { getFlaggedContent, getReportsSummary } from "@/app/actions/admin-system";
import { hideReview, rejectFlag } from "@/app/actions/admin";
import { toast } from "sonner";
import Link from "next/link";

export default function ReportsPage() {
  const [summary, setSummary] = useState({ flaggedReviews: 0, flaggedComments: 0, total: 0 });
  const [flaggedReviews, setFlaggedReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, contentData] = await Promise.all([
        getReportsSummary(),
        getFlaggedContent({ type: filter, page }),
      ]);
      setSummary(summaryData);
      setFlaggedReviews(contentData.flaggedReviews);
    } catch {
      toast.error("Failed to load reports");
    }
    setLoading(false);
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const handleHideReview = async (reviewId: number) => {
    setActionLoading(reviewId);
    try {
      await hideReview(reviewId, "Flagged content removed by admin");
      toast.success("Review hidden");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to hide review");
    }
    setActionLoading(null);
  };

  const handleDismissFlag = async (reviewId: number) => {
    setActionLoading(reviewId);
    try {
      await rejectFlag(reviewId, "Flag dismissed by admin — content is appropriate");
      toast.success("Flag dismissed");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to dismiss flag");
    }
    setActionLoading(null);
  };

  const formatDate = (d: Date | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Review flagged content and take moderation actions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flag className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-500">Total Flags</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-500">Flagged Reviews</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.flaggedReviews}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-500">Flagged Comments</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.flaggedComments}</div>
          <div className="text-xs text-gray-400 mt-0.5">Based on user reports</div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Flagged Reviews</h2>
          <span className="text-xs text-gray-400">{flaggedReviews.length} items</span>
        </div>

        {loading ? (
          <div className="py-16 text-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" /></div>
        ) : flaggedReviews.length === 0 ? (
          <div className="py-16 text-center">
            <Shield className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No flagged content to review</p>
            <p className="text-xs text-gray-300 mt-1">Flagged reviews will appear here when users report them</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {flaggedReviews.map(review => (
              <div key={review.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Flag className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{review.title || "Untitled Review"}</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                        {review.rating}/5
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{review.content}</p>

                    {/* Flag reason */}
                    <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2">
                      <div className="text-xs font-medium text-red-600 mb-0.5">Flag Reason</div>
                      <p className="text-xs text-red-500">{review.flagReason}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>By: {review.userName}</span>
                      <span>Tool: {review.toolName}</span>
                      <span>Flagged: {formatDate(review.flaggedAt)}</span>
                      <span>Posted: {formatDate(review.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDismissFlag(review.id)}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50"
                      title="Dismiss flag — content is OK"
                    >
                      <Check className="w-3 h-3" />
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleHideReview(review.id)}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                      title="Hide review — violates guidelines"
                    >
                      <X className="w-3 h-3" />
                      Hide
                    </button>
                    <Link
                      href={`/ops-console/stacks/listed`}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
                      title="View tool"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
