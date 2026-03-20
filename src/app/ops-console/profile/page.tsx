"use client";

import { useState, useEffect } from "react";
import { Mail, Shield, Calendar, Clock, Save, Loader2 } from "lucide-react";
import { getAdminProfile, updateAdminProfile } from "@/app/actions/admin-system";
import { ROLE_LABELS } from "@/lib/role-constants";
import { toast } from "sonner";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", firstName: "", lastName: "" });

  useEffect(() => {
    getAdminProfile()
      .then(p => {
        setProfile(p);
        setForm({ name: p.name || "", firstName: p.firstName || "", lastName: p.lastName || "" });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAdminProfile(form);
      toast.success("Profile updated");
      setProfile((prev: any) => ({ ...prev, ...form }));
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Failed to load profile</p>
      </div>
    );
  }

  const ROLE_COLORS: Record<string, string> = {
    super_admin: "bg-purple-100 text-purple-700",
    admin: "bg-blue-100 text-blue-700",
    manager: "bg-amber-100 text-amber-700",
    customer_rep: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
      <p className="text-sm text-gray-500 mb-8">Manage your admin account details</p>

      {/* Avatar & Role Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400">
                {(profile.name || profile.email)?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profile.name || "—"}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[profile.role] || "bg-gray-100 text-gray-600"}`}>
              <Shield className="w-3 h-3" />
              {ROLE_LABELS[profile.role] || profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Edit Details</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Display Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
              <input
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
              <input
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Account Info (read-only) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Account Info</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 w-28">Email</span>
            <span className="text-gray-900">{profile.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 w-28">Role</span>
            <span className="text-gray-900">{ROLE_LABELS[profile.role] || profile.role}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 w-28">Joined</span>
            <span className="text-gray-900">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 w-28">Last Active</span>
            <span className="text-gray-900">{profile.lastSignedIn ? new Date(profile.lastSignedIn).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
