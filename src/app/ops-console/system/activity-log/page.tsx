"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Filter, Calendar, User, Activity, ChevronLeft, ChevronRight,
  Loader2, Download, Clock, Shield, UserCog, Star, Zap, Settings,
  RefreshCw
} from "lucide-react";
import { getAuditLog, getAuditLogStaffList } from "@/app/actions/admin-system";
import { toast } from "sonner";

const ACTION_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  role_change: { label: "Role Change", color: "bg-purple-100 text-purple-700", icon: UserCog },
  staff_invite: { label: "Staff Invite", color: "bg-green-100 text-green-700", icon: User },
  ranking_recalc: { label: "Ranking Recalc", color: "bg-blue-100 text-blue-700", icon: RefreshCw },
  content_moderate: { label: "Moderation", color: "bg-amber-100 text-amber-700", icon: Shield },
  setting_change: { label: "Setting Change", color: "bg-gray-100 text-gray-700", icon: Settings },
  tool_update: { label: "Tool Update", color: "bg-cyan-100 text-cyan-700", icon: Star },
  promotion_action: { label: "Promotion", color: "bg-pink-100 text-pink-700", icon: Zap },
  other: { label: "Other", color: "bg-gray-100 text-gray-600", icon: Activity },
};

const ENTITY_TYPES = ["all", "user", "tool", "review", "deal", "promotion", "cron", "system", "setting"];

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [adminFilter, setAdminFilter] = useState<number | undefined>();
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAuditLog({
        adminId: adminFilter,
        action: actionFilter,
        entityType: entityFilter,
        search,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit,
      });
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load activity log");
    }
    setLoading(false);
  }, [search, adminFilter, actionFilter, entityFilter, startDate, endDate, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getAuditLogStaffList().then(setStaffList).catch(() => {});
  }, []);

  const totalPages = Math.ceil(total / limit);

  const formatTime = (d: Date) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const clearFilters = () => {
    setSearch("");
    setAdminFilter(undefined);
    setActionFilter("all");
    setEntityFilter("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters = search || adminFilter || actionFilter !== "all" || entityFilter !== "all" || startDate || endDate;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-sm text-gray-500 mt-1">Track all admin actions and system events</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
            showFilters || hasActiveFilters ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search descriptions..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Staff Member</label>
              <select
                value={adminFilter || ""}
                onChange={e => { setAdminFilter(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="">All staff</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.name || s.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Action Type</label>
              <select
                value={actionFilter}
                onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="all">All actions</option>
                {Object.entries(ACTION_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 text-xs text-amber-600 hover:text-amber-700 font-medium">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
        <span>{total} log entries</span>
        <span className="text-gray-300">|</span>
        <span>Page {page} of {totalPages || 1}</span>
      </div>

      {/* Log Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-sm text-gray-400">
                  {hasActiveFilters ? "No log entries match your filters" : "No activity logged yet. Actions will appear here as staff members perform operations."}
                </td></tr>
              ) : (
                logs.map(log => {
                  const actionMeta = ACTION_LABELS[log.action] || ACTION_LABELS.other;
                  const ActionIcon = actionMeta.icon;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {formatTime(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {log.adminAvatar ? (
                            <img src={log.adminAvatar} alt="" className="w-6 h-6 rounded-full" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                              {log.adminName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-gray-700">{log.adminName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${actionMeta.color}`}>
                          <ActionIcon className="w-3 h-3" />
                          {actionMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-md truncate">{log.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {log.entityType && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {log.entityType}{log.entityId ? ` #${log.entityId}` : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
