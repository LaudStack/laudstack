# LaudStack Comparison Engine — Build Plan

## Overview

A guided, multi-step comparison engine at `/stack-finder` that helps users discover the best AI & SaaS tools for their specific needs. Users answer 4 steps of questions, and the system queries the real database to return ranked, scored results.

## URL & Navigation

- **Route**: `/stack-finder` (new page)
- **Nav item**: Add "Stack Finder" to the Discover mega-menu in Navbar
- **Icon**: `Compass` from lucide-react

## Multi-Step Form (4 Steps)

### Step 1: What do you need?
- **Primary use case** — select one or more categories from the existing 20 categories
- Displayed as a grid of clickable cards with icons (from CATEGORY_META)
- Multi-select allowed (e.g., "Marketing" + "AI Writing")

### Step 2: Tell us about your team
- **Business type** — radio select: Startup, Small Business, Mid-Market, Enterprise, Freelancer/Solo, Agency, Non-Profit
- **Team size** — radio select: Just me, 2-10, 11-50, 51-200, 200+

### Step 3: Budget & Pricing
- **Budget preference** — radio select: Free only, Under $50/mo, $50-200/mo, $200-500/mo, $500+/mo, No budget limit
- **Pricing model preference** — multi-select chips: Free, Freemium, Free Trial, Paid, Open Source (maps to DB enum)

### Step 4: Priorities (optional)
- **What matters most?** — rank/select up to 3 from: Community Trust (high ratings), Popularity (most lauded), New & Innovative, Verified & Established, Best Value, Feature-Rich
- This step is optional — users can skip to see results

## Matching Algorithm (Server Action)

```
matchScore = categoryWeight(0.40) + pricingWeight(0.25) + qualityWeight(0.20) + priorityWeight(0.15)
```

1. **Category match (40%)**: Tools whose category matches any selected category get full score. Tag overlap gives partial credit.
2. **Pricing match (25%)**: Tools whose pricing_model matches selected preferences get full score. Budget range compatibility adds partial credit.
3. **Quality signal (20%)**: Normalized rank_score from the database (already combines rating, reviews, engagement).
4. **Priority alignment (15%)**: If user selected "Community Trust" → weight average_rating. "Popularity" → weight upvote_count. "New & Innovative" → weight recency. Etc.

Results are sorted by matchScore DESC, limited to top 20.

## Results Page (inline, same route)

After form submission, the form collapses and results appear:

### Results Header
- Summary: "We found X stacks matching your needs"
- Filters: Re-sort by Match Score, Rating, Most Lauded, Newest
- "Refine Search" button to go back to form

### Result Cards (enterprise-grade)
Each card shows:
- **Match percentage badge** (e.g., "96% Match")
- Logo, name, tagline
- Category pill, pricing model pill
- Star rating + review count
- Laud count
- Tags (top 3)
- "Why this matches" — 2-3 bullet points explaining the match (e.g., "Matches your Marketing category", "Free plan available", "4.8★ community rating")
- CTA: "View Stack" → links to /tools/[slug]
- Secondary CTA: "Compare" → adds to compare bar

### Empty State
If no tools match, show helpful message with suggestions to broaden criteria.

## Design Principles
- Light theme, white background, consistent with platform
- No gradients
- Amber (#F59E0B) accent for active states, match badges, CTAs
- Clean card-based layout with subtle shadows
- Smooth step transitions (slide animation)
- Progress bar at top showing current step
- Mobile-responsive (stacked layout on mobile)
- Max width 1300px for content

## Files to Create/Modify
1. `src/app/stack-finder/page.tsx` — Main page with form + results
2. `src/app/actions/stack-finder.ts` — Server action for matching algorithm
3. `src/components/Navbar.tsx` — Add Stack Finder to Discover mega-menu
