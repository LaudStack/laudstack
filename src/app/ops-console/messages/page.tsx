"use client";
export const dynamic = "force-dynamic";

/**
 * Admin Messages — Contact Submissions Management
 * View, filter, respond to, and manage all contact form submissions.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Search, Filter, ChevronDown, ChevronRight,
  Eye, Archive, Trash2, MessageSquare, Clock, CheckCircle,
  AlertCircle, ExternalLink, MailOpen, Loader2, RefreshCw,
  StickyNote, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getContactSubmissions,
  updateContactSubmissionStatus,
  addContactSubmissionNote,
  deleteContactSubmission,
} from "@/app/actions/admin";

// ─── Topic labels ────────────────────────────────────────────────────────────

const TOPIC_LABELS: Record<string, string> = {
  general: "General Inquiry",
  launch: "Launch / Update a Stack",
  trust: "Report a Listing or Review",
  partnership: "Partnership or Press",
  support: "Account Support",
  deals: "Deals & Promotions",
  templates: "Templates Marketplace",
  other: "Other",
};

const TOPIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  general: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
  launch: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  trust: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  partnership: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  support: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  deals: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  templates: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  other: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Mail; color: string; bg: string }> = {
  new: { label: "New", icon: Mail, color: "text-blue-600", bg: "bg-blue-50" },
  read: { label: "Read", icon: MailOpen, color: "text-amber-600", bg: "bg-amber-50" },
  replied: { label: "Replied", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  archived: { label: "Archived", icon: Archive, color: "text-slate-500", bg: "bg-slate-100" },
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  ipAddress: string | null;
  adminNotes: string | null;
  emailSent: boolean;
  createdAt: string;
  archivedAt: string | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminMessages() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getContactSubmissions({
        status: statusFilter,
        search: searchQuery || undefined,
        page,
      });
      setSubmissions(res.submissions as unknown as ContactSubmission[]);
      setTotal(res.total);
      setNewCount(res.newCount);
    } catch (err) {
      console.error("[AdminMessages] Failed to load:", err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, page]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  const handleStatusChange = async (id: number, newStatus: "new" | "read" | "replied" | "archived") => {
    setActionLoading(id);
    try {
      await updateContactSubmissionStatus(id, newStatus);
      toast.success(`Status updated to "${newStatus}"`);
      loadSubmissions();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveNote = async (id: number) => {
    setActionLoading(id);
    try {
      await addContactSubmissionNote(id, noteInput);
      toast.success("Note saved");
      setEditingNoteId(null);
      setNoteInput("");
      loadSubmissions();
    } catch {
      toast.error("Failed to save note");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this message?")) return;
    setActionLoading(id);
    try {
      await deleteContactSubmission(id);
      toast.success("Message deleted");
      loadSubmissions();
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExpand = async (sub: ContactSubmission) => {
    if (expandedId === sub.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(sub.id);
    // Auto-mark as read if new
    if (sub.status === "new") {
      try {
        await updateContactSubmissionStatus(sub.id, "read");
        setSubmissions(prev =>
          prev.map(s => (s.id === sub.id ? { ...s, status: "read" as const } : s))
        );
        setNewCount(prev => Math.max(0, prev - 1));
      } catch {
        // Silent fail for auto-read
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const timeAgo = (dateStr: string) => {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.max(0, now - then);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Messages
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Contact form submissions from users and visitors
          </p>
        </div>
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-blue-700">
              <Mail className="w-3.5 h-3.5" />
              {newCount} new
            </span>
          )}
          <button
            onClick={loadSubmissions}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status filter tabs */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
          {[
            { value: "all", label: "All" },
            { value: "new", label: "New" },
            { value: "read", label: "Read" },
            { value: "replied", label: "Replied" },
            { value: "archived", label: "Archived" },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                statusFilter === tab.value
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search by name, email, or message..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold text-xs rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Messages list ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(15,23,42,0.05)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">No messages found</p>
            <p className="text-xs text-slate-500">
              {searchQuery ? "Try adjusting your search query" : "Contact form submissions will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {submissions.map(sub => {
              const isExpanded = expandedId === sub.id;
              const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.new;
              const topicColor = TOPIC_COLORS[sub.topic] || TOPIC_COLORS.general;
              const StatusIcon = statusCfg.icon;

              return (
                <div key={sub.id} className={`transition-colors ${sub.status === "new" ? "bg-blue-50/30" : ""}`}>
                  {/* Row header */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => handleExpand(sub)}
                  >
                    {/* Status icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${statusCfg.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${statusCfg.color}`} />
                    </div>

                    {/* Name + email */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold truncate ${sub.status === "new" ? "text-slate-900" : "text-slate-700"}`}>
                          {sub.name}
                        </p>
                        {sub.status === "new" && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{sub.email}</p>
                    </div>

                    {/* Topic badge */}
                    <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${topicColor.bg} ${topicColor.text} ${topicColor.border}`}>
                      {TOPIC_LABELS[sub.topic] || sub.topic}
                    </span>

                    {/* Email sent indicator */}
                    {sub.emailSent && (
                      <span className="hidden md:inline-flex items-center gap-1 text-xs text-green-600 font-medium" title="Admin email was sent">
                        <CheckCircle className="w-3 h-3" /> Emailed
                      </span>
                    )}

                    {/* Time */}
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                      {timeAgo(sub.createdAt)}
                    </span>

                    {/* Expand chevron */}
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50/50">
                      <div className="grid md:grid-cols-3 gap-5 pt-4">
                        {/* Message content */}
                        <div className="md:col-span-2 space-y-4">
                          {/* Topic badge (mobile) */}
                          <div className="sm:hidden">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${topicColor.bg} ${topicColor.text} ${topicColor.border}`}>
                              {TOPIC_LABELS[sub.topic] || sub.topic}
                            </span>
                          </div>

                          {/* Message */}
                          <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Message</p>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{sub.message}</p>
                          </div>

                          {/* Admin notes */}
                          <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admin Notes</p>
                              {editingNoteId !== sub.id && (
                                <button
                                  onClick={() => {
                                    setEditingNoteId(sub.id);
                                    setNoteInput(sub.adminNotes || "");
                                  }}
                                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                                >
                                  {sub.adminNotes ? "Edit" : "Add note"}
                                </button>
                              )}
                            </div>
                            {editingNoteId === sub.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={noteInput}
                                  onChange={e => setNoteInput(e.target.value)}
                                  placeholder="Add internal notes about this message..."
                                  rows={3}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSaveNote(sub.id)}
                                    disabled={actionLoading === sub.id}
                                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    {actionLoading === sub.id ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    onClick={() => { setEditingNoteId(null); setNoteInput(""); }}
                                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : sub.adminNotes ? (
                              <p className="text-sm text-slate-600 whitespace-pre-wrap">{sub.adminNotes}</p>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No notes yet</p>
                            )}
                          </div>
                        </div>

                        {/* Sidebar info */}
                        <div className="space-y-4">
                          {/* Meta info */}
                          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Details</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Status</span>
                                <span className={`text-xs font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Received</span>
                                <span className="text-xs font-medium text-slate-700">{formatDate(sub.createdAt)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Email sent</span>
                                <span className={`text-xs font-medium ${sub.emailSent ? "text-green-600" : "text-red-500"}`}>
                                  {sub.emailSent ? "Yes" : "No"}
                                </span>
                              </div>
                              {sub.ipAddress && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-slate-500">IP</span>
                                  <span className="text-xs font-mono text-slate-600">{sub.ipAddress}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Actions</p>

                            {/* Reply via email */}
                            <a
                              href={`mailto:${sub.email}?subject=Re: ${encodeURIComponent(TOPIC_LABELS[sub.topic] || sub.topic)} — LaudStack&body=${encodeURIComponent(`Hi ${sub.name},\n\nThank you for reaching out to LaudStack.\n\n---\nOriginal message:\n${sub.message}\n`)}`}
                              onClick={() => {
                                // Mark as replied when clicking reply
                                handleStatusChange(sub.id, "replied");
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold text-xs rounded-lg transition-colors text-center justify-center no-underline"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Reply via Email
                            </a>

                            {/* Status changes */}
                            <div className="flex gap-1.5">
                              {sub.status !== "read" && (
                                <button
                                  onClick={() => handleStatusChange(sub.id, "read")}
                                  disabled={actionLoading === sub.id}
                                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Eye className="w-3 h-3" /> Read
                                </button>
                              )}
                              {sub.status !== "replied" && (
                                <button
                                  onClick={() => handleStatusChange(sub.id, "replied")}
                                  disabled={actionLoading === sub.id}
                                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-medium text-[11px] rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3 h-3" /> Replied
                                </button>
                              )}
                            </div>

                            {sub.status !== "archived" ? (
                              <button
                                onClick={() => handleStatusChange(sub.id, "archived")}
                                disabled={actionLoading === sub.id}
                                className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-[11px] rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Archive className="w-3 h-3" /> Archive
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(sub.id, "new")}
                                disabled={actionLoading === sub.id}
                                className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px] rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Mail className="w-3 h-3" /> Unarchive
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-[11px] rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs font-bold text-slate-700">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
