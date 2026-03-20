# LaudStack Admin Panel — Comprehensive Audit & Recommendations

## Current State Summary

### What Exists Today

**Pages (29 routes):**
- Dashboard (stats, growth chart, recent activity)
- Analytics (platform analytics)
- Stacks: Listed, Launches, Claimed + tool detail view
- Deals (deal management)
- Marketplace (marketplace products)
- People: Users, Founders, Creators
- Moderation: Reviews, Lauds, Comments
- Promotions: Overview (with tabs for All/Stacks/Deals/Marketplace), Pricing & Plans, Deal of the Day
- Revenue (revenue stats)
- Marketing: Templates, Subscribers, Messages (contact form submissions)
- Settings (General, SEO, Email, Moderation, Features, Security)
- Gate (admin login)

**Backend Infrastructure:**
- Ranking algorithm (`src/lib/ranking.ts`) with `computeRankScore()` and `recalcAndPersistToolScore()`
- Full batch recalculation API (`/api/admin/recalculate-rankings`)
- 6 Vercel cron jobs (rankings, expire placements, transition launches, launch notifications, daily digest, expire offers)
- Role enum: `user`, `admin`, `super_admin`
- Moderation logs table exists
- Contact submissions management
- Platform settings table
- Notification system (bell icon with DB-backed notifications)

**Header Features:**
- Logo, search bar, notification bell dropdown, avatar dropdown (Settings, View Site, Sign Out)

---

## Gap Analysis — What's Missing

### 1. RANKINGS & ALGORITHM MANAGEMENT (HIGH PRIORITY)

**Problem:** The ranking algorithm runs via cron and API but there's NO admin UI to monitor, configure, or manually trigger it.

**What's needed:**

| Page/Feature | Description |
|---|---|
| **Rankings Dashboard** | View current tool rankings with rank position, score breakdown, weekly change. Sortable table showing all tools with their rankScore, avgRating, reviewCount, upvoteCount, viewCount, weeklyMomentum |
| **Algorithm Weights** | UI to view/adjust the scoring weights (currently hardcoded: avgRating×25, reviewCount×15, upvoteCount×10, saveCount×8, viewCount×0.1, clickCount×5, recencyBoost, weeklyMomentum×20) |
| **Manual Recalculation** | Button to trigger `/api/admin/recalculate-rankings` on demand instead of waiting for the daily cron |
| **Ranking History** | Track score changes over time per tool (requires new DB table) |
| **Recency Boost Config** | Configure the 30-day (50pts) and 90-day (25pts) recency boost thresholds |

---

### 2. STAFF & ROLE MANAGEMENT (HIGH PRIORITY)

**Problem:** The schema supports `user`, `admin`, `super_admin` roles, and the Users page has basic role toggling, but there's no dedicated Staff management page.

**What's needed:**

| Page/Feature | Description |
|---|---|
| **Staff Directory** | Dedicated page listing all admin and super_admin users with their roles, last active date, and permissions |
| **Invite Staff** | Form to invite new admin/staff members by email (creates account with admin role) |
| **Role Assignment** | Super-admin can promote/demote between user → admin → super_admin |
| **Permission Levels** | Define what each role can access (e.g., admin can moderate but not change settings; super_admin has full access) |
| **Activity Log per Staff** | See what actions each admin has taken (requires audit log table) |

---

### 3. SETTINGS EXPANSION (HIGH PRIORITY)

**Problem:** Settings page has 6 sections but many are shallow. Missing critical admin settings.

**What's needed:**

| Settings Section | Description |
|---|---|
| **Admin Profile** | Admin can edit their own name, email, avatar, password. Currently the avatar dropdown only shows "Settings" (platform settings) — no personal profile management |
| **Notification Preferences** | Configure which events trigger admin notifications (new submissions, new claims, flagged reviews, etc.) |
| **API Keys** | Manage API keys for external integrations (Stripe, Resend, etc.) — view status, rotate keys |
| **Cron Job Monitor** | View status of all 6 cron jobs — last run time, success/failure, next scheduled run |
| **Backup & Export** | Currently just a placeholder button. Should actually export DB data |
| **Danger Zone** | Maintenance mode toggle, clear cache, reset platform data (with confirmation) |

---

### 4. AUDIT LOG / ACTIVITY LOG (MEDIUM PRIORITY)

**Problem:** No audit trail for admin actions. The `moderation_logs` table exists but only tracks tool moderation, not all admin actions.

**What's needed:**

| Page/Feature | Description |
|---|---|
| **Admin Activity Log** | Centralized log of all admin actions: user role changes, tool approvals/rejections, deal management, settings changes, promotion assignments |
| **Filterable by Admin** | Filter by which admin performed the action |
| **Filterable by Action Type** | Filter by action category (moderation, user management, content, settings) |
| **Export** | Export activity log as CSV |

*Requires new `admin_audit_log` table in schema.*

---

### 5. REPORTS & FLAGGED CONTENT (MEDIUM PRIORITY)

**Problem:** Flagged reviews are handled within the Reviews page, but there's no centralized reports/flags dashboard.

**What's needed:**

| Page/Feature | Description |
|---|---|
| **Reports Dashboard** | Centralized view of all flagged/reported content across reviews, comments, tools, and marketplace products |
| **Report Queue** | Prioritized queue showing unresolved reports with severity indicators |
| **Bulk Actions** | Dismiss multiple reports, ban users with multiple flags |

---

### 6. SYSTEM HEALTH & MONITORING (MEDIUM PRIORITY)

**Problem:** No visibility into platform health, cron job status, or error rates.

**What's needed:**

| Page/Feature | Description |
|---|---|
| **System Status** | Overview of cron jobs, API health, database connection status, Stripe webhook status |
| **Error Log** | Recent server errors, failed cron runs, failed email sends |
| **Performance Metrics** | Page load times, API response times, database query performance |

---

### 7. CATEGORIES & TAXONOMY MANAGEMENT (LOW PRIORITY)

**Problem:** Tool categories are defined as an enum in the schema. No admin UI to manage them.

**What's needed:**

| Page/Feature | Description |
|---|---|
| **Category Manager** | View, reorder, add, rename, merge categories |
| **Category Stats** | How many tools per category, growth trends |

---

### 8. NEWSLETTER & EMAIL CAMPAIGNS (LOW PRIORITY)

**Problem:** Templates and Subscribers pages exist, but no campaign sending/scheduling UI.

**What's needed:**

| Page/Feature | Description |
|---|---|
| **Campaign Composer** | Create and send email campaigns to subscriber segments |
| **Send History** | View past campaigns with open rates, click rates |
| **Scheduled Sends** | Schedule campaigns for future delivery |

---

## Recommended New Sidebar Structure

Based on the gap analysis, here's the recommended sidebar with new items marked:

```
Dashboard
Analytics
Stacks ▾
  ├─ Listed
  ├─ Launches
  └─ Claimed
Deals
Marketplace
Rankings              ← NEW
People ▾
  ├─ Users
  ├─ Founders
  ├─ Creators
  └─ Staff            ← NEW
Moderation ▾
  ├─ Reviews
  ├─ Lauds
  ├─ Comments
  └─ Reports          ← NEW (optional, could be tab in Moderation)
Promotions ▾
  ├─ Promotions
  ├─ Pricing & Plans
  └─ Deal of the Day
Revenue
Marketing ▾
  ├─ Templates
  ├─ Subscribers
  └─ Messages
System ▾              ← NEW (replaces standalone Settings)
  ├─ Settings
  ├─ Activity Log     ← NEW
  ├─ Cron Jobs        ← NEW
  └─ System Health    ← NEW
```

---

## Priority Recommendation

**Phase 1 — Must Have (build now):**
1. Rankings page (monitor + manual trigger + weight display)
2. Staff page (directory + invite + role assignment)
3. Admin Profile (in avatar dropdown or Settings)

**Phase 2 — Should Have (build next):**
4. Activity/Audit Log
5. Cron Job Monitor
6. Reports Dashboard
7. Settings expansion (notification prefs, API keys)

**Phase 3 — Nice to Have (build later):**
8. Category Manager
9. Campaign Composer
10. System Health dashboard
11. Ranking History with charts

---

## Answer to Your Questions

### "Do we need a Rankings page in Admin?"
**Yes.** The ranking algorithm is the core of how tools are displayed to users. Without admin visibility:
- You can't verify rankings are fair
- You can't spot gaming or anomalies
- You can't manually trigger recalculation after bulk data changes
- You can't adjust weights without code changes

A Rankings page with a sortable table, score breakdown, and a "Recalculate Now" button is essential for platform integrity.

### "Settings is missing many pages"
**Correct.** Current Settings has 6 tabs but they're mostly shallow. The biggest gaps are:
- No admin profile management (name, avatar, password)
- No cron job monitoring
- No API key management
- No real backup/export functionality
- No notification preference configuration

### "Staff page is missing"
**Correct.** The schema supports `super_admin` and `admin` roles, but there's no dedicated page to:
- View all staff members
- Invite new admins
- Assign granular permissions
- See staff activity

The Users page has basic role toggling but it's mixed in with regular users and lacks the features a proper Staff management page needs.
