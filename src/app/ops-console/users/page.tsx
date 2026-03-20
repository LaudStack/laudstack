"use client";
/*
 * LaudStack Admin — Users Management
 * List, search, filter by role, change role, delete
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search, Users, Shield, Trash2, RefreshCw, MoreHorizontal,
  AlertTriangle, Mail, Calendar, MapPin, Crown, UserX, UserCheck,
} from "lucide-react";
import { getAdminUsers, updateUserRole, deleteUser } from "@/app/actions/admin";
import { toast } from "sonner";
import type { User } from "@/drizzle/schema";

// ─── Role display config ────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  super_admin:  { label: "Super Admin",  bg: "bg-red-100",    text: "text-red-700",    border: "border-red-200" },
  admin:        { label: "Admin",        bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-200" },
  manager:      { label: "Manager",      bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  moderator:    { label: "Moderator",    bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200" },
  analyst:      { label: "Analyst",      bg: "bg-teal-100",   text: "text-teal-700",   border: "border-teal-200" },
  customer_rep: { label: "Customer Rep", bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  user:         { label: "User",         bg: "bg-slate-100",  text: "text-slate-600",  border: "border-slate-200" },
};

const ALL_ROLES = ["user", "customer_rep", "analyst", "moderator", "manager", "admin", "super_admin"] as const;

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.user;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      {role !== "user" && <Shield className="w-2.5 h-2.5" />}
      {cfg.label}
    </span>
  );
}

function FounderBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    none:     "bg-slate-100 text-slate-500",
    pending:  "bg-amber-100 text-amber-700",
    verified: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  if (status === "none") return null;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${map[status]}`}>
      Founder: {status}
    </span>
  );
}

function UserRow({
  user, onRoleChange, onDelete,
}: {
  user: User;
  onRoleChange: (id: number, role: string) => void;
  onDelete: (id: number, name: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = (user.firstName ? [user.firstName, user.lastName].filter(Boolean).join(' ') : null) || user.name || "Anonymous";

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">{displayName}</p>
            <p className="text-xs text-slate-400 truncate max-w-[140px]">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-4 py-3">
        <FounderBadge status={user.founderStatus} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="w-3 h-3" />
          {[user.city, user.country].filter(Boolean).join(", ") || "—"}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-slate-500 capitalize">{user.loginMethod || "email"}</span>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
      </td>
      <td className="px-4 py-3">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 z-10 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Role</p>
              </div>
              {ALL_ROLES.filter(r => r !== user.role).map(r => {
                const cfg = ROLE_CONFIG[r];
                return (
                  <button
                    key={r}
                    onClick={() => { onRoleChange(user.id, r); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.bg} ${cfg.border} border`} />
                    {cfg.label}
                  </button>
                );
              })}
              <button onClick={() => { onDelete(user.id, displayName); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100">
                <Trash2 className="w-3.5 h-3.5" /> Delete User
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ search, role, page });
      setUsers(res.users);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, role, page]);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      await updateUserRole(id, newRole as any);
      toast.success(`User role updated to ${ROLE_CONFIG[newRole]?.label ?? newRole}`);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update role");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      toast.success("User deleted");
      setDeleteConfirm(null);
      load();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-600 mt-0.5">{total.toLocaleString()} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 h-9 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
          />
        </div>
        <select
          value={role}
          onChange={e => { setRole(e.target.value); setPage(1); }}
          className="h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white"
        >
          <option value="all">All Roles</option>
          {ALL_ROLES.map(r => (
            <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
          ))}
        </select>
        <button onClick={load} className="h-9 px-3 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Founder</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Auth</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onRoleChange={handleRoleChange}
                    onDelete={(id, name) => setDeleteConfirm({ id, name })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delete User</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
