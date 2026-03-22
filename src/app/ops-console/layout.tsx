"use client";
/*
 * LaudStack Admin Panel — Layout Shell
 * Sidebar with collapsible dropdown sections (accordion: only 1 open at a time)
 * Header with logo, search, shortcuts, notification bell, avatar dropdown
 * Design: Dark sidebar (#0C1830), white content area, amber accent
 * Role-gated: redirects non-staff to /ops-console/gate
 * Permission-filtered: sidebar items hidden based on role permissions
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, UserCheck, FileText,
  Star, Settings, Bell, Search, ChevronDown, LogOut,
  Menu, ChevronRight, AlertCircle, CheckCircle, Clock,
  BarChart3, ExternalLink, Mail, BookOpen, Heart, MessageSquare,
  Store, Layers, Rocket, UserPlus, Tag, TrendingUp, Shield, Wrench, Megaphone,
  DollarSign, Calendar, ShoppingBag, Trophy, UserCog, Flag, Activity, Cog,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDbUser } from "@/hooks/useDbUser";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/app/actions/notifications";
import { getAdminBadgeCounts } from "@/app/actions/admin";
import {
  hasPermission,
  isStaffRole,
  ROUTE_PERMISSIONS,
  type Permission,
} from "@/lib/permissions";

// ─── Nav structure ───────────────────────────────────────────────────────────
// Each nav item carries a requiredPermission so we can filter by role

type NavLink = {
  type: "link";
  href: string;
  icon: any;
  label: string;
  badge?: string;
  requiredPermission: Permission;
};

type NavDropdown = {
  type: "dropdown";
  id: string;
  icon: any;
  label: string;
  children: {
    href: string;
    icon: any;
    label: string;
    badge?: string;
    requiredPermission: Permission;
  }[];
};

type NavSectionLabel = {
  type: "section";
  label: string;
};

type NavItem = NavLink | NavDropdown | NavSectionLabel;

const NAV_ITEMS: NavItem[] = [
  { type: "link", href: "/ops-console/dashboard", icon: LayoutDashboard, label: "Dashboard", requiredPermission: "dashboard.view" },
  { type: "link", href: "/ops-console/analytics", icon: BarChart3, label: "Analytics", requiredPermission: "analytics.view" },
  {
    type: "dropdown",
    id: "stacks",
    icon: Layers,
    label: "Stacks",
    children: [
      { href: "/ops-console/stacks/listed", icon: Layers, label: "Listed", requiredPermission: "stacks.view" },
      { href: "/ops-console/stacks/launches", icon: Rocket, label: "Launches", badge: "submissions", requiredPermission: "stacks.view" },
      { href: "/ops-console/stacks/claimed", icon: UserPlus, label: "Claimed", badge: "claims", requiredPermission: "stacks.view" },
    ],
  },
  { type: "link", href: "/ops-console/deals", icon: Tag, label: "Deals", requiredPermission: "deals.view" },
  { type: "link", href: "/ops-console/marketplace", icon: Store, label: "Marketplace", requiredPermission: "marketplace.view" },
  { type: "link", href: "/ops-console/rankings", icon: Trophy, label: "Rankings", requiredPermission: "rankings.view" },
  {
    type: "dropdown",
    id: "people",
    icon: Users,
    label: "People",
    children: [
      { href: "/ops-console/users", icon: Users, label: "Users", requiredPermission: "users.view" },
      { href: "/ops-console/founders", icon: UserCheck, label: "Founders", badge: "founders", requiredPermission: "founders.view" },
      { href: "/ops-console/creators", icon: Store, label: "Creators", requiredPermission: "creators.view" },
      { href: "/ops-console/staff", icon: UserCog, label: "Staff", requiredPermission: "staff.view" },
    ],
  },
  {
    type: "dropdown",
    id: "moderation",
    icon: Shield,
    label: "Moderation",
    children: [
      { href: "/ops-console/reviews", icon: Star, label: "Reviews", requiredPermission: "reviews.view" },
      { href: "/ops-console/lauds", icon: Heart, label: "Lauds", requiredPermission: "lauds.view" },
      { href: "/ops-console/comments", icon: MessageSquare, label: "Comments", requiredPermission: "comments.view" },
      { href: "/ops-console/reports", icon: Flag, label: "Reports", requiredPermission: "reports.view" },
    ],
  },
  {
    type: "dropdown",
    id: "promotions",
    icon: Megaphone,
    label: "Promotions",
    children: [
      { href: "/ops-console/promotions", icon: Megaphone, label: "Promotions", requiredPermission: "promotions.view" },
      { href: "/ops-console/promotions/pricing", icon: DollarSign, label: "Pricing & Plans", requiredPermission: "promotions.pricing" },
      { href: "/ops-console/promotions/dotd", icon: Calendar, label: "Deal of the Day", requiredPermission: "promotions.dotd" },
    ],
  },
  { type: "link", href: "/ops-console/revenue", icon: TrendingUp, label: "Revenue", requiredPermission: "revenue.view" },
  {
    type: "dropdown",
    id: "marketing",
    icon: Mail,
    label: "Marketing",
    children: [
      { href: "/ops-console/templates", icon: Mail, label: "Templates", requiredPermission: "templates.view" },
      { href: "/ops-console/subscribers", icon: BookOpen, label: "Subscribers", requiredPermission: "subscribers.view" },
      { href: "/ops-console/messages", icon: MessageSquare, label: "Messages", badge: "messages", requiredPermission: "messages.view" },
    ],
  },
  {
    type: "dropdown",
    id: "system",
    icon: Cog,
    label: "System",
    children: [
      { href: "/ops-console/settings", icon: Settings, label: "Settings", requiredPermission: "settings.view" },
      { href: "/ops-console/system/activity-log", icon: Activity, label: "Activity Log", requiredPermission: "activity_log.view" },
      { href: "/ops-console/system/cron-jobs", icon: Clock, label: "Cron Jobs", requiredPermission: "cron_jobs.view" },
    ],
  },
];

// ─── Role display labels ────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  analyst: "Analyst",
  moderator: "Moderator",
  customer_rep: "Support Rep",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "text-red-700 bg-red-100",
  admin: "text-amber-700 bg-amber-100",
  manager: "text-blue-700 bg-blue-100",
  analyst: "text-emerald-700 bg-emerald-100",
  moderator: "text-purple-700 bg-purple-100",
  customer_rep: "text-slate-700 bg-slate-100",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/** Determine which dropdown should be open based on the current path */
function getActiveDropdownId(pathname: string, items: NavItem[]): string | null {
  for (const item of items) {
    if (item.type === "dropdown") {
      for (const child of item.children) {
        if (pathname === child.href || pathname.startsWith(child.href + "/")) {
          return item.id;
        }
      }
    }
  }
  return null;
}

/** Filter nav items based on user's role permissions */
function filterNavByRole(items: NavItem[], role: string): NavItem[] {
  return items
    .map((item) => {
      if (item.type === "section") return item;
      if (item.type === "link") {
        return hasPermission(role, item.requiredPermission) ? item : null;
      }
      if (item.type === "dropdown") {
        const visibleChildren = item.children.filter((child) =>
          hasPermission(role, child.requiredPermission)
        );
        if (visibleChildren.length === 0) return null;
        return { ...item, children: visibleChildren };
      }
      return null;
    })
    .filter(Boolean) as NavItem[];
}

// ─── Component ───────────────────────────────────────────────────────────────

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

  // Filter nav items based on user's role
  const filteredNavItems = useMemo(() => {
    if (!dbUser) return [];
    return filterNavByRole(NAV_ITEMS, dbUser.role);
  }, [dbUser]);

  // Accordion: only one dropdown open at a time
  const [openDropdown, setOpenDropdown] = useState<string | null>(() =>
    getActiveDropdownId(pathname ?? "", NAV_ITEMS)
  );

  // Update open dropdown when pathname changes
  useEffect(() => {
    const activeId = getActiveDropdownId(pathname ?? "", filteredNavItems);
    if (activeId) setOpenDropdown(activeId);
  }, [pathname, filteredNavItems]);

  const toggleDropdown = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  // ─── Real notifications from DB ─────────────────────────────────────────────
  const [adminNotifs, setAdminNotifs] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  const loadNotifications = useCallback(async () => {
    try {
      setNotifsLoading(true);
      const res = await getNotifications({ limit: 10 });
      setAdminNotifs(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (e) {
      console.error("[AdminLayout] Failed to load notifications:", e);
    } finally {
      setNotifsLoading(false);
    }
  }, []);

  const loadBadgeCounts = useCallback(async () => {
    try {
      const counts = await getAdminBadgeCounts();
      setBadgeCounts(counts);
    } catch (e) {
      console.error("[AdminLayout] Failed to load badge counts:", e);
    }
  }, []);

  useEffect(() => {
    if (dbUser && isStaffRole(dbUser.role)) {
      loadNotifications();
      loadBadgeCounts();
      const interval = setInterval(() => {
        loadNotifications();
        loadBadgeCounts();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [dbUser, loadNotifications, loadBadgeCounts]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auth guard — allow any staff role, redirect non-staff
  useEffect(() => {
    if (pathname === "/ops-console/gate") return;
    if (!authLoading && !dbLoading) {
      if (!user) {
        router.push("/ops-console/gate");
        return;
      }
      if (dbUser && !isStaffRole(dbUser.role)) {
        toast.error("Access denied. Staff privileges required.");
        router.push("/");
        return;
      }
      // Permission-based route guard: check if user has permission for this specific route
      if (dbUser) {
        const routePermission = ROUTE_PERMISSIONS[pathname ?? ""];
        if (routePermission && !hasPermission(dbUser.role, routePermission)) {
          toast.error("You don't have permission to access this page.");
          router.push("/ops-console/dashboard");
        }
      }
    }
  }, [authLoading, dbLoading, user, dbUser, pathname, router]);

  if (pathname === "/ops-console/gate") return <>{children}</>;

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

  if (!user || (dbUser && !isStaffRole(dbUser.role))) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/ops-console/gate");
  };

  const notifIcon = (type: string) => {
    if (type === "new_submission") return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    if (type === "new_claim") return <Shield className="w-3.5 h-3.5 text-green-400" />;
    if (type === "new_review") return <Star className="w-3.5 h-3.5 text-amber-400" />;
    if (type === "system") return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    return <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
  };

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsAsRead();
    if (res.success) {
      setAdminNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    }
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
      setAdminNotifs((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (notif.link) {
      router.push(notif.link);
      setNotifOpen(false);
    }
  };

  const displayName = dbUser?.name || dbUser?.firstName || user?.email?.split("@")[0] || "Admin";
  const initials = getInitials(displayName);
  const roleLabel = ROLE_LABELS[dbUser?.role ?? ""] || dbUser?.role || "Staff";
  const roleColor = ROLE_COLORS[dbUser?.role ?? ""] || "text-slate-700 bg-slate-100";

  // ─── Check if a path is active ──────────────────────────────────────────────
  const isActive = (href: string) => pathname === href || (pathname ?? "").startsWith(href + "/");

  // ─── Check if any child of a dropdown is active ─────────────────────────────
  const isDropdownActive = (item: NavDropdown) => item.children.some((c) => isActive(c.href));

  // ─── Render a single nav link ───────────────────────────────────────────────
  const renderNavLink = (href: string, icon: any, label: string, badge?: string, isChild = false) => {
    const Icon = icon;
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        className={`
          flex items-center gap-3 rounded-lg transition-all duration-150
          ${isChild ? "py-2 px-3 ml-4 pl-7" : "py-2.5 px-3"}
          ${active
            ? "bg-amber-400/15 text-amber-400 font-semibold"
            : "text-slate-300 hover:text-white hover:bg-slate-700/60"
          }
          ${!sidebarOpen ? "justify-center px-2" : ""}
        `}
        title={!sidebarOpen ? label : undefined}
        onClick={() => setMobileSidebarOpen(false)}
      >
        <Icon className={`flex-shrink-0 ${isChild ? "w-4 h-4" : "w-5 h-5"} ${active ? "text-amber-400" : "text-slate-400"}`} />
        {sidebarOpen && (
          <span className={`${isChild ? "text-[13.5px]" : "text-[15px]"} ${active ? 'font-semibold' : 'font-medium'} leading-tight`}>{label}</span>
        )}
        {sidebarOpen && badge && badgeCounts[badge] > 0 && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-400 min-w-[22px] text-center">
            {badgeCounts[badge]}
          </span>
        )}
        {sidebarOpen && active && !(badge && badgeCounts[badge] > 0) && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
        )}
      </Link>
    );
  };

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
          SIDEBAR — expanded: w-64 (256px), collapsed: w-[68px]
      ════════════════════════════════════════════════════════ */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-slate-950 border-r border-slate-800
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-64" : "w-[68px]"}
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 flex-shrink-0">
          <Link href="/ops-console/dashboard" className="flex items-center gap-3 min-w-0">
            {sidebarOpen ? (
              <img src="/logo-dark-transparent.png" alt="LaudStack" className="h-8 w-auto" />
            ) : (
              <img src="/laudstack-favicon.png" alt="LaudStack" className="h-8 w-8 object-contain" />
            )}
          </Link>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>

        {/* Nav — permission-filtered with accordion dropdowns */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {filteredNavItems.map((item, idx) => {
            // Section label divider
            if (item.type === "section") {
              if (!sidebarOpen) {
                return idx === 0 ? null : (
                  <div key={`section-${item.label}`} className="my-2 mx-1 border-t border-slate-800" />
                );
              }
              return (
                <div key={`section-${item.label}`} className={`${idx === 0 ? "pt-0.5 pb-1" : "pt-4 pb-1"}`}>
                  <span className="px-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400 select-none">
                    {item.label}
                  </span>
                </div>
              );
            }

            if (item.type === "link") {
              return renderNavLink(item.href, item.icon, item.label, item.badge);
            }

            // Dropdown item
            const isOpen = openDropdown === item.id;
            const hasActiveChild = isDropdownActive(item);

            // Collapsed sidebar: show only parent icon, tooltip with label
            if (!sidebarOpen) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      router.push(item.children[0].href);
                    }}
                    className={`
                      flex items-center justify-center w-full py-2.5 px-2 rounded-lg transition-all duration-150
                      ${hasActiveChild
                        ? "bg-amber-400/15 text-amber-400"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                      }
                    `}
                    title={item.label}
                  >
                    <item.icon className={`w-5 h-5 ${hasActiveChild ? "text-amber-400" : ""}`} />
                  </button>
                </div>
              );
            }

            // Expanded sidebar: collapsible dropdown
            return (
              <div key={item.id}>
                {/* Dropdown trigger */}
                <button
                  onClick={() => toggleDropdown(item.id)}
                  className={`
                    flex items-center gap-3 w-full py-2.5 px-3 rounded-lg transition-all duration-150
                    ${hasActiveChild
                      ? "bg-amber-400/15 text-amber-400"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${hasActiveChild ? "text-amber-400" : ""}`} />
                  <span className={`text-[15px] ${hasActiveChild ? 'font-semibold' : 'font-medium'} leading-tight ${hasActiveChild ? "text-amber-400" : ""}`}>
                    {item.label}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 ml-auto transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${hasActiveChild ? "text-amber-400" : "text-slate-400"}`}
                  />
                </button>

                {/* Dropdown children — animated */}
                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? "max-h-60 opacity-100 mt-0.5" : "max-h-0 opacity-0"}`}
                >
                  <div className="space-y-0.5 relative">
                    {/* Vertical line connector */}
                    <div className="absolute left-[22px] top-0 bottom-0 w-px bg-slate-800" />
                    {item.children.map((child) =>
                      renderNavLink(child.href, child.icon, child.label, child.badge, true)
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop, when collapsed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center h-10 mx-2 mb-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Bottom user strip */}
        <div className="border-t border-slate-800 p-3 flex-shrink-0">
          <div className={`flex items-center gap-3 ${!sidebarOpen ? "justify-center" : ""}`}>
            <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs flex-shrink-0">
              {dbUser?.avatarUrl ? (
                <img src={dbUser.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                <p className="text-slate-400 text-xs truncate">{roleLabel}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ════════════════════════════════════════════════════════ */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-[68px]"}`}>
        {/* ── HEADER ── */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search — centered */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      router.push(`/ops-console/stacks/listed?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchQuery("");
                    }
                  }}
                  placeholder="Search stacks, users, launches..."
                  className="w-full pl-10 pr-4 h-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Shortcuts + bell + avatar */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="hidden md:flex items-center gap-1 mr-2">
              <Link
                href="/ops-console/stacks/launches"
                className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                Pending
              </Link>
              <Link
                href="/ops-console/stacks/listed"
                className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Wrench className="w-4 h-4 text-blue-500" />
                Stacks
              </Link>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                View Site
              </Link>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setAvatarOpen(false);
                }}
                className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-slate-800 text-sm">Notifications</p>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifsLoading && adminNotifs.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      </div>
                    ) : adminNotifs.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No notifications yet</p>
                      </div>
                    ) : (
                      adminNotifs.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 ${!n.isRead ? "bg-amber-50/30" : ""}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.isRead ? "bg-amber-100" : "bg-slate-100"}`}>
                            {notifIcon(n.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{n.message}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />}
                        </div>
                      ))
                    )}
                  </div>
                  {adminNotifs.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Avatar dropdown */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => {
                  setAvatarOpen((o) => !o);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs overflow-hidden">
                  {dbUser?.avatarUrl ? (
                    <img src={dbUser.avatarUrl} alt="" className="w-8 h-8 object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <span className={`inline-flex items-center gap-1 mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${roleColor}`}>
                      <Shield className="w-2.5 h-2.5" /> {roleLabel}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/ops-console/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setAvatarOpen(false)}
                    >
                      <UserCog className="w-4 h-4" />
                      My Profile
                    </Link>
                    {hasPermission(dbUser?.role ?? "", "settings.view") && (
                      <Link
                        href="/ops-console/settings"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        onClick={() => setAvatarOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    )}
                    <Link
                      href="/"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      onClick={() => setAvatarOpen(false)}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Site
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
