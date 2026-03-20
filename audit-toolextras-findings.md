# toolExtras Fake Data Issue

## Problem
The `generateDefaultExtras()` function in `src/lib/toolExtras.ts` generates completely fabricated features and pricing tiers for tools that don't have real data in the database.

For example, it generates:
- "99.9% uptime SLA and sub-100ms response times" — fabricated claim
- "SOC 2 Type II certified, GDPR compliant" — fabricated security claim
- Pricing tiers like "$19/mo Starter", "$49/mo Pro" — completely made up prices
- "5GB storage", "Unlimited seats" — fabricated plan details

## Impact
- Tools without real features/pricing data show completely fake information
- Users could make purchasing decisions based on fabricated pricing
- Security/compliance claims are legally risky

## Solution
Replace `generateDefaultExtras()` with empty arrays so tools without real data show "No features listed" / "Visit website for pricing" instead of fake data.
