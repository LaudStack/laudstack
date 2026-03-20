# LaudStack — Category & Tagging System Audit Report

**Date:** March 15, 2026
**Scope:** Full audit of all 44 stacks in the database — category assignments, tags, search propagation, and taxonomy consistency across all platform surfaces.

---

## Executive Summary

The category and tagging system had three systemic problems: **1 misclassified product**, **2 duplicate entries**, and **91% of stacks had zero tags** (40 out of 44). Search across 6 client-side pages and the server-side search action did not query the tags field at all. All issues have been corrected.

---

## Issues Found & Fixed

### 1. Category Misclassification

| Stack | Old Category | New Category | Rationale |
|-------|-------------|-------------|-----------|
| Descript | AI Audio | AI Video | Descript is primarily a video + podcast editor with AI-powered editing; its core product is video, not standalone audio |

All other stacks were reviewed and confirmed to be in the correct category. Notably:

- **Stripe** is correctly in "Finance" (not AI tools)
- **ChatGPT** and **Claude** are correctly in "AI Productivity" (no separate "AI Chatbot" category exists)
- **Amplitude** and **Mixpanel** are correctly in "AI Analytics" (the platform's analytics category covers both AI-powered and traditional analytics)
- **Notion** and **Notion AI** are correctly in "AI Productivity"

### 2. Duplicate Entries Hidden

| Duplicate | Original | Action |
|-----------|----------|--------|
| Jasper (id: 41, category: AI Writing) | Jasper AI (id: 1, category: AI Writing) | Set `is_visible = false` on id: 41 |
| HubSpot (id: 42, category: Marketing) | HubSpot CRM (id: 14, category: CRM) | Set `is_visible = false` on id: 42 |

Both duplicates were hidden rather than deleted to preserve referential integrity (reviews, lauds, saved items may reference them). The `is_visible = false` flag ensures they are excluded from all public-facing queries.

### 3. Tags Added to All 44 Stacks

Before this audit, only 4 out of 44 stacks had any tags. Now every stack has 7-12 accurate, specific tags based on its actual functionality, market type, and use case. Tags were chosen to be:

- **Specific** — "email campaigns" instead of "marketing"
- **Functional** — describing what the tool actually does ("video editing", "code completion")
- **Market-relevant** — including pricing signals ("freemium", "enterprise"), use cases ("startups", "collaboration"), and technology type ("ai-powered", "cloud-based")
- **Non-overlapping** — avoiding tags that merely repeat the category name

**Sample corrections:**

| Stack | Category | Tags Added |
|-------|----------|-----------|
| Stripe | Finance | payment processing, billing, subscriptions, invoicing, fintech, developer api, saas payments, online payments, payment gateway |
| ChatGPT | AI Productivity | ai chatbot, conversational ai, natural language processing, text generation, code assistant, research tool, openai, gpt, large language model |
| Figma | Design | ui design, prototyping, collaborative design, vector graphics, design system, wireframing, web design, interface design |
| Notion | AI Productivity | workspace, note-taking, project management, knowledge base, collaboration, wiki, documents, databases, productivity |
| Descript | AI Video | video editing, podcast editing, screen recording, transcription, ai-powered editing, content creation, audio editing |

### 4. Search Now Queries Tags

Before this audit, searching for "payment processing" would not find Stripe because search only checked `name`, `tagline`, and `description`. Now tags are included in search across all surfaces:

| Surface | File | Fix Applied |
|---------|------|-------------|
| Server-side search (`searchToolsAction`) | `src/app/actions/public.ts` | Added `sql\`tools.tags::text ILIKE ...\`` to the WHERE clause |
| Alternatives page search | `src/app/alternatives/page.tsx` | Added `(t.tags ?? []).some(...)` to filter |
| Community Picks search | `src/app/community-picks/page.tsx` | Added `(t.tags ?? []).some(...)` to filter |
| Community Voting search | `src/app/community-voting/page.tsx` | Added `(t.tags ?? []).some(...)` to filter |
| Comparisons page search | `src/app/comparisons/page.tsx` | Added `(t.tags ?? []).some(...)` to filter |
| Launch Archive search | `src/app/launch-archive/page.tsx` | Added `(t.tags ?? []).some(...)` to filter |
| Main search page | `src/app/search/page.tsx` | Already had tag matching (no change needed) |

---

## Propagation Verification

The corrected categories and tags propagate correctly across all platform surfaces:

| Surface | Propagation Status | Notes |
|---------|--------------------|-------|
| Homepage listings | Correct | Homepage API filters by `is_visible = true` and visible statuses |
| Tool detail pages | Correct | Tags displayed in tool metadata; alternatives filtered by category |
| Category pages (`/c/[slug]`) | Correct | Filters by exact category match |
| Alternatives pages (`/alt/[slug]`) | Correct | Queries by category, sorted by rank_score |
| Stack Finder comparison engine | Correct | Uses strict category matching (fixed in prior commit) |
| SEO pages (best, top-rated, trending) | Correct | All use `visibleToolConditions()` helper |
| Search results | Correct | Now includes tag matching |
| Sitemap | Correct | Hidden duplicates excluded by `is_visible` filter |
| Leaderboard / Launches | Correct | Hidden duplicates excluded |

---

## Files Changed

| File | Change |
|------|--------|
| `scripts/fix-categories-tags.mjs` | Migration script (new) — corrects categories, adds tags, hides duplicates |
| `scripts/audit-categories.mjs` | Diagnostic script (new) — dumps all stacks for review |
| `src/app/actions/public.ts` | Server-side search now queries tags field |
| `src/app/alternatives/page.tsx` | Client-side search includes tags |
| `src/app/community-picks/page.tsx` | Client-side search includes tags |
| `src/app/community-voting/page.tsx` | Client-side search includes tags |
| `src/app/comparisons/page.tsx` | Client-side search includes tags |
| `src/app/launch-archive/page.tsx` | Client-side search includes tags |

---

## Verification

- **TypeScript:** 0 errors
- **Next.js build:** All pages compiled successfully
- **Commit:** `8c4279f` pushed to `main`
- **Vercel deployment:** Production — Success
