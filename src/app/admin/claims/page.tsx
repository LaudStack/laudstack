'use client';

// Admin Claims Management Page
// Allows admin to view, filter, approve, and reject tool ownership claims

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield, CheckCircle, XCircle, Clock, ExternalLink,
  ChevronLeft, ChevronRight, Loader2, User, Wrench,
  Globe, FileText, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getAdminClaims, reviewClaim } from '@/app/actions/admin';

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
  userName: string | null;
  userEmail: string | null;
};

const STATUS_TABS = [
  { value: 'all', label: 'All Claims' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_BADGE: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
  pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
  approved: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: CheckCircle },
  rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle },
};

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminClaims({ status: statusFilter, page });
      setClaims(result.claims as Claim[]);
      setTotal(result.total);
      setLimit(result.limit);
    } catch {
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const handleReview = async (claimId: number, action: 'approved' | 'rejected') => {
    setProcessing(claimId);
    try {
      const result = await reviewClaim(claimId, action);
      if (result.success) {
        toast.success(`Claim ${action} successfully`);
        fetchClaims();
      } else {
        toast.error(result.error || `Failed to ${action} claim`);
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setProcessing(null);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const pendingCount = claims.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tool Claims</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage founder ownership claims for listed tools
          </p>
        </div>
        {statusFilter === 'all' && pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">{pendingCount} pending</span>
          </div>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              statusFilter === tab.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Claims List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : claims.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No claims found</p>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter === 'pending' ? 'No pending claims to review' : 'No claims match this filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map(claim => {
            const badge = STATUS_BADGE[claim.status] || STATUS_BADGE.pending;
            const BadgeIcon = badge.icon;
            return (
              <div key={claim.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Tool Logo */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {claim.toolLogoUrl ? (
                      <img src={claim.toolLogoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Wrench className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Claim Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Link href={`/admin/tools/${claim.toolId}`} className="text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors">
                        {claim.toolName || `Tool #${claim.toolId}`}
                      </Link>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${badge.bg} ${badge.text}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {claim.status}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {claim.userName || 'Unknown'} ({claim.userEmail || 'no email'})
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(claim.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Notes / Message */}
                    {claim.notes && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-slate-600 whitespace-pre-wrap">{claim.notes}</p>
                      </div>
                    )}

                    {/* Proof URL */}
                    {claim.proofUrl && (
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <a href={claim.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          {claim.proofUrl.length > 60 ? claim.proofUrl.slice(0, 60) + '...' : claim.proofUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Verify Method */}
                    {claim.verifyMethod && (
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          Verification method: <strong className="text-slate-700">{claim.verifyMethod}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {claim.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleReview(claim.id, 'approved')}
                        disabled={processing === claim.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        {processing === claim.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(claim.id, 'rejected')}
                        disabled={processing === claim.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {processing === claim.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
