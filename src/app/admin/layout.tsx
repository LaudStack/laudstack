"use client";
/*
 * LaudStack Admin Panel — Layout Shell
 * Sidebar + Header with logo, search, shortcuts, notification bell, avatar dropdown
 * Design: Dark sidebar (#0F172A), white content area, amber accent
 * Role-gated: redirects non-admins to /auth/login
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Wrench, Users, UserCheck, FileText,
  Star, Settings, Bell, Search, ChevronDown, LogOut,
  Menu, X, Zap, TrendingUp, Shield, Package, Tag,
  ChevronRight, AlertCircle, CheckCircle, Clock, Sparkles,
  BarChart3, ExternalLink, Mail, BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDbUser } from "@/hooks/useDbUser";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/tools", icon: Wrench, label: "Tools", badge: "tools" },
      { href: "/admin/submissions", icon: FileText, label: "Submissions", badge: "submissions" },
      { href: "/admin/reviews", icon: Star, label: "Reviews" },
      { href: "/admin/deals", icon: Tag, label: "Deals" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users", icon: Users, label: "Users" },
      { href: "/admin/founders", icon: UserCheck, label: "Founders", badge: "founders" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/templates", icon: Mail, label: "Email Templates" },
      { href: "/admin/subscribers", icon: BookOpen, label: "Subscribers" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/revenue", icon: TrendingUp, label: "Revenue" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

// ─── Notification mock ────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "submission", message: "New tool submission: 'AI Writer Pro'", time: "2m ago", read: false },
  { id: 2, type: "founder", message: "Founder verification request from John Doe", time: "15m ago", read: false },
  { id: 3, type: "review", message: "New 1-star review flagged for moderation", time: "1h ago", read: false },
  { id: 4, type: "system", message: "Database backup completed successfully", time: "3h ago", read: true },
  { id: 5, type: "user", message: "New admin user created: sarah@example.com", time: "1d ago", read: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { dbUser, loading: dbLoading } = useDbUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auth guard — skip for login page
  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!authLoading && !dbLoading) {
      if (!user) {
        router.push("/admin/login");
        return;
      }
      if (dbUser && dbUser.role !== "admin" && dbUser.role !== "super_admin") {
        toast.error("Access denied. Admin privileges required.");
        router.push("/");
      }
    }
  }, [authLoading, dbLoading, user, dbUser, pathname, router]);

  // Don't render layout for login page
  if (pathname === "/admin/login") return <>{children}</>;

  // Loading state
  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Not admin
  if (!user || (dbUser && dbUser.role !== "admin" && dbUser.role !== "super_admin")) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const notifIcon = (type: string) => {
    if (type === "submission") return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    if (type === "founder") return <UserCheck className="w-3.5 h-3.5 text-green-400" />;
    if (type === "review") return <Star className="w-3.5 h-3.5 text-amber-400" />;
    if (type === "system") return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    return <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
  };

  const displayName = dbUser?.name || dbUser?.firstName || user?.email?.split("@")[0] || "Admin";
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Mobile overlay ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════════════════════ */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-slate-950 border-r border-slate-800
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-60" : "w-16"}
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-slate-800 flex-shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">LaudStack</p>
                <p className="text-amber-400 text-[10px] font-semibold tracking-wider uppercase">Admin Panel</p>
              </div>
            )}
          </Link>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden lg:flex"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5">
              {sidebarOpen && (
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1.5">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const active = pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-2 py-2 rounded-lg mb-0.5 transition-all duration-150
                      ${active
                        ? "bg-amber-400/10 text-amber-400 font-semibold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }
                      ${!sidebarOpen ? "justify-center" : ""}
                    `}
                    title={!sidebarOpen ? item.label : undefined}
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-amber-400" : ""}`} />
                    {sidebarOpen && (
                      <span className="text-sm truncate">{item.label}</span>
                    )}
                    {sidebarOpen && active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center h-10 mx-2 mb-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Bottom user strip */}
        <div className="border-t border-slate-800 p-3 flex-shrink-0">
          <div className={`flex items-center gap-2.5 ${!sidebarOpen ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs flex-shrink-0">
              {dbUser?.avatarUrl ? (
                <img src={dbUser.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : initials}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold truncate">{displayName}</p>
                <p className="text-slate-500 text-[10px] truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ════════════════════════════════════════════════════════ */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? "lg:ml-60" : "lg:ml-16"}`}>

        {/* ── HEADER ── */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search users, tools, submissions..."
                className="w-full pl-9 pr-4 h-9 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Shortcuts */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/admin/submissions"
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Pending
            </Link>
            <Link
              href="/admin/tools"
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-blue-500" />
              Tools
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              View Site
            </Link>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); setAvatarOpen(false); }}
                className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-slate-800 text-sm">Notifications</p>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {MOCK_NOTIFICATIONS.map(n => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 ${!n.read ? "bg-amber-50/30" : ""}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.read ? "bg-amber-100" : "bg-slate-100"}`}>
                          {notifIcon(n.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                    <button className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar dropdown */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => { setAvatarOpen(o => !o); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs overflow-hidden">
                  {dbUser?.avatarUrl
                    ? <img src={dbUser.avatarUrl} alt="" className="w-7 h-7 object-cover" />
                    : initials
                  }
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[100px] truncate">{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <Shield className="w-2.5 h-2.5" /> Admin
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setAvatarOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <Link
                      href="/"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setAvatarOpen(false)}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Site
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
