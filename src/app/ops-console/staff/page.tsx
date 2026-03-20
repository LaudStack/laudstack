"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Shield, ShieldCheck, UserPlus, Users,
  ChevronDown, X, Loader2, Crown, Headset,
  Briefcase, AlertTriangle, Check, Mail, Send,
  Clock, CheckCircle2, XCircle, RotateCcw, Trash2,
} from "lucide-react";
import {
  getStaffMembers, updateStaffRole, removeFromStaff,
} from "@/app/actions/admin-system";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/role-constants";
import {
  createAdminInvite, getAdminInvites, resendAdminInvite, revokeAdminInvite,
} from "@/app/actions/admin-invites";
import { toast } from "sonner";

type StaffMember = {
  id: number;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
  createdAt: Date;
  lastSignedIn: Date | null;
};

type Invite = {
  id: number;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt: Date | null;
  inviterName: string;
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  super_admin: Crown,
  admin: ShieldCheck,
  manager: Briefcase,
  customer_rep: Headset,
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700 border-purple-200",
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  manager: "bg-amber-100 text-amber-700 border-amber-200",
  customer_rep: "bg-green-100 text-green-700 border-green-200",
  user: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_STYLES: Record<string, { icon: React.ElementType; color: string }> = {
  pending: { icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  accepted: { icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-200" },
  expired: { icon: XCircle, color: "text-gray-500 bg-gray-50 border-gray-200" },
  revoked: { icon: Trash2, color: "text-red-500 bg-red-50 border-red-200" },
};

export default function StaffPage() {
  const [tab, setTab] = useState<"staff" | "invites">("staff");

  // Staff state
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffTotal, setStaffTotal] = useState(0);
  const [staffLoading, setStaffLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [staffPage, setStaffPage] = useState(1);

  // Invite list state
  const [invites, setInvites] = useState<Invite[]>([]);
  const [invitesTotal, setInvitesTotal] = useState(0);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [inviteStatusFilter, setInviteStatusFilter] = useState("all");
  const [invitesPage, setInvitesPage] = useState(1);

  // Create invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("customer_rep");
  const [inviteMessage, setInviteMessage] = useState("");
  const [creating, setCreating] = useState(false);

  // Role change modal
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [newRole, setNewRole] = useState("");
  const [changingRole, setChangingRole] = useState(false);

  // Remove confirmation
  const [removingMember, setRemovingMember] = useState<StaffMember | null>(null);
  const [removing, setRemoving] = useState(false);

  // ── Load staff ──
  const loadStaff = useCallback(async () => {
    setStaffLoading(true);
    try {
      const data = await getStaffMembers({ search, role: roleFilter, page: staffPage });
      setStaff(data.staff as StaffMember[]);
      setStaffTotal(data.total);
    } catch (e: any) {
      toast.error(e.message || "Failed to load staff");
    }
    setStaffLoading(false);
  }, [search, roleFilter, staffPage]);

  // ── Load invites ──
  const loadInvites = useCallback(async () => {
    setInvitesLoading(true);
    try {
      const data = await getAdminInvites({ status: inviteStatusFilter, page: invitesPage });
      setInvites(data.invites as Invite[]);
      setInvitesTotal(data.total);
    } catch (e: any) {
      toast.error(e.message || "Failed to load invites");
    }
    setInvitesLoading(false);
  }, [inviteStatusFilter, invitesPage]);

  useEffect(() => { loadStaff(); }, [loadStaff]);
  useEffect(() => { if (tab === "invites") loadInvites(); }, [tab, loadInvites]);

  // ── Create invite ──
  const handleCreateInvite = async () => {
    if (!inviteEmail.trim() || !inviteRole) return;
    setCreating(true);
    try {
      const result = await createAdminInvite({
        email: inviteEmail.trim(),
        role: inviteRole,
        message: inviteMessage.trim() || undefined,
      });
      if (result.emailSent) {
        toast.success(`Invite sent to ${inviteEmail}`);
      } else {
        toast.warning("Invite created but email failed to send. You can resend it.");
      }
      setShowInvite(false);
      setInviteEmail("");
      setInviteMessage("");
      setInviteRole("customer_rep");
      loadInvites();
    } catch (e: any) {
      toast.error(e.message || "Failed to create invite");
    }
    setCreating(false);
  };

  // ── Resend invite ──
  const handleResend = async (inviteId: number) => {
    try {
      const result = await resendAdminInvite(inviteId);
      if (result.emailSent) {
        toast.success("Invite resent successfully");
      } else {
        toast.error("Failed to resend invite email");
      }
      loadInvites();
    } catch (e: any) {
      toast.error(e.message || "Failed to resend invite");
    }
  };

  // ── Revoke invite ──
  const handleRevoke = async (inviteId: number) => {
    try {
      await revokeAdminInvite(inviteId);
      toast.success("Invite revoked");
      loadInvites();
    } catch (e: any) {
      toast.error(e.message || "Failed to revoke invite");
    }
  };

  // ── Role change ──
  const handleRoleChange = async () => {
    if (!editingMember || !newRole) return;
    setChangingRole(true);
    try {
      await updateStaffRole(editingMember.id, newRole as any);
      toast.success(`${editingMember.name || editingMember.email} role changed to ${ROLE_LABELS[newRole]}`);
      setEditingMember(null);
      loadStaff();
    } catch (e: any) {
      toast.error(e.message || "Failed to change role");
    }
    setChangingRole(false);
  };

  // ── Remove staff ──
  const handleRemove = async () => {
    if (!removingMember) return;
    setRemoving(true);
    try {
      await removeFromStaff(removingMember.id);
      toast.success(`${removingMember.name || removingMember.email} removed from staff`);
      setRemovingMember(null);
      loadStaff();
    } catch (e: any) {
      toast.error(e.message || "Failed to remove staff member");
    }
    setRemoving(false);
  };

  const formatDate = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never";

  const formatDateTime = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage admin team members and send secure invites</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Send Invite
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("staff")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            tab === "staff" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4" />
          Staff Members ({staffTotal})
        </button>
        <button
          onClick={() => setTab("invites")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            tab === "invites" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Send className="w-4 h-4" />
          Invites ({invitesTotal})
        </button>
      </div>

      {/* ══════════════ STAFF TAB ══════════════ */}
      {tab === "staff" && (
        <>
          {/* Role Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {(["super_admin", "admin", "manager", "customer_rep"] as const).map(role => {
              const Icon = ROLE_ICONS[role];
              const roleCount = staff.filter(s => s.role === role).length;
              return (
                <div
                  key={role}
                  onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    roleFilter === role ? "border-amber-400 bg-amber-50 ring-1 ring-amber-200" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-900">{ROLE_LABELS[role]}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{roleCount}</div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ROLE_DESCRIPTIONS[role]}</p>
                </div>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setStaffPage(1); }}
                placeholder="Search staff by name or email..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last Active</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffLoading ? (
                  <tr><td colSpan={5} className="py-16 text-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" /></td></tr>
                ) : staff.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center text-sm text-gray-400">No staff members found</td></tr>
                ) : (
                  staff.map(member => {
                    const RoleIcon = ROLE_ICONS[member.role] || Shield;
                    return (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                                {(member.name || member.email)?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{member.name || "—"}</div>
                              <div className="text-xs text-gray-400">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[member.role]}`}>
                            <RoleIcon className="w-3 h-3" />
                            {ROLE_LABELS[member.role] || member.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(member.createdAt)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(member.lastSignedIn)}</td>
                        <td className="px-4 py-3 text-right">
                          {member.role !== "super_admin" && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => { setEditingMember(member); setNewRole(member.role); }}
                                className="text-xs text-gray-500 hover:text-amber-600 font-medium"
                              >
                                Change Role
                              </button>
                              <button
                                onClick={() => setRemovingMember(member)}
                                className="text-xs text-gray-400 hover:text-red-600 font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════════════ INVITES TAB ══════════════ */}
      {tab === "invites" && (
        <>
          {/* Status filter */}
          <div className="flex items-center gap-2 mb-4">
            {["all", "pending", "accepted", "expired", "revoked"].map(status => (
              <button
                key={status}
                onClick={() => { setInviteStatusFilter(status); setInvitesPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  inviteStatusFilter === status
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Invites Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invited By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expires</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invitesLoading ? (
                  <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" /></td></tr>
                ) : invites.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-sm text-gray-400">No invites found</td></tr>
                ) : (
                  invites.map(inv => {
                    const RoleIcon = ROLE_ICONS[inv.role] || Shield;
                    const statusStyle = STATUS_STYLES[inv.status] || STATUS_STYLES.pending;
                    const StatusIcon = statusStyle.icon;
                    const isExpired = new Date() > new Date(inv.expiresAt);
                    const isPending = inv.status === "pending" && !isExpired;
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{inv.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[inv.role]}`}>
                            <RoleIcon className="w-3 h-3" />
                            {ROLE_LABELS[inv.role] || inv.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {isExpired && inv.status === "pending" ? "Expired" : inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{inv.inviterName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(inv.createdAt)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(inv.expiresAt)}</td>
                        <td className="px-4 py-3 text-right">
                          {isPending && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleResend(inv.id)}
                                className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" /> Resend
                              </button>
                              <button
                                onClick={() => handleRevoke(inv.id)}
                                className="text-xs text-red-500 hover:text-red-600 font-medium"
                              >
                                Revoke
                              </button>
                            </div>
                          )}
                          {isExpired && inv.status === "pending" && (
                            <button
                              onClick={() => handleResend(inv.id)}
                              className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Resend
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════════════ CREATE INVITE MODAL ══════════════ */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Send Admin Invite</h2>
                <p className="text-sm text-gray-500 mt-0.5">Invite a new team member via email</p>
              </div>
              <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            {/* Email */}
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            {/* Role selection */}
            <label className="text-sm font-medium text-gray-700 mb-2 block">Assign Role</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(["customer_rep", "manager", "admin"] as const).map(role => {
                const Icon = ROLE_ICONS[role];
                return (
                  <button
                    key={role}
                    onClick={() => setInviteRole(role)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                      inviteRole === role
                        ? "border-amber-400 bg-amber-50 ring-1 ring-amber-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{ROLE_LABELS[role]}</div>
                      <div className="text-[10px] text-gray-400 line-clamp-1">{ROLE_DESCRIPTIONS[role]}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Personal message */}
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Personal Message (optional)</label>
            <textarea
              value={inviteMessage}
              onChange={e => setInviteMessage(e.target.value)}
              placeholder="Welcome to the team! Looking forward to working with you."
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none mb-4"
            />

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
              <p className="text-xs text-blue-700">
                <strong>Secure invite:</strong> The recipient will receive an email with a unique, time-limited link (24 hours).
                They will create their own password — no credentials are shared via email.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button
                onClick={handleCreateInvite}
                disabled={!inviteEmail.trim() || creating}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50"
              >
                {creating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Invite</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Role Change Modal ── */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingMember(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Change Role</h2>
            <p className="text-sm text-gray-500 mb-4">Update role for {editingMember.name || editingMember.email}</p>

            <div className="space-y-2 mb-5">
              {(["customer_rep", "manager", "admin"] as const).map(role => {
                const Icon = ROLE_ICONS[role];
                return (
                  <button
                    key={role}
                    onClick={() => setNewRole(role)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      newRole === role ? "border-amber-400 bg-amber-50 ring-1 ring-amber-200" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{ROLE_LABELS[role]}</div>
                      <div className="text-xs text-gray-400">{ROLE_DESCRIPTIONS[role]}</div>
                    </div>
                    {newRole === role && <Check className="w-4 h-4 text-amber-500" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingMember(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                onClick={handleRoleChange}
                disabled={changingRole || newRole === editingMember.role}
                className="px-5 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50"
              >
                {changingRole ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove Confirmation ── */}
      {removingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setRemovingMember(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Remove Staff Member</h2>
                <p className="text-sm text-gray-500">This will revoke all admin access</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to remove <strong>{removingMember.name || removingMember.email}</strong> ({ROLE_LABELS[removingMember.role]}) from the staff team? They will be demoted to a regular user.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRemovingMember(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {removing ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
