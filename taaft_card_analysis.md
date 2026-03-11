# TAAFT Card Design Analysis

## Card Structure (from screenshot study)
- **Dark background**: `#1E1F2E` / `#252636` — deep dark navy/charcoal
- **Card**: slightly lighter dark bg, rounded corners (~12px), no visible border — uses subtle shadow/bg contrast
- **Layout**: 2-column grid on desktop, full-width cards

## Card Anatomy (top to bottom)
1. **Header row**: 
   - Large circular logo (48px, dark bg, rounded)
   - Tool name (bold, white, ~16px) + verified checkmark (blue)
   - Category tag (small pill, muted color, icon + label)
   - Bell/notify icon (right side)

2. **Screenshot image**: 
   - Full-width, ~200-220px tall
   - Shows actual platform UI screenshot
   - Has a small stats overlay (bar chart icon + view count, website URL) at top of image
   - Rounded corners on image

3. **Founder info row**:
   - Small founder avatar + name + verified badge + "N tools" + karma
   - Upvote/downvote buttons (thumbs up/down with count)

4. **Description text**: 
   - 2-3 lines of gray text, smaller font

5. **Footer row**:
   - "Released Xh ago" (left, muted)
   - View count (bar chart icon + number, right)
   - Pricing (e.g. "Free + from $2")
   - Save count + rating

## Key Design Characteristics
- **Dark theme** throughout
- **No card borders** — uses background color contrast
- **Large screenshot** is the visual anchor
- **Compact but info-dense** — lots of metadata without feeling cluttered
- **Upvote interaction** is prominent (thumbs up with count)
- **Category as small pill** with icon, not just text
- **Founder attribution** is a first-class element
- **Time since launch** prominently shown
- **View count** shown as a metric

## Adaptation for LaudStack (light theme)
Since LaudStack uses a light/white theme, we adapt:
- White card bg with subtle border/shadow
- Logo in rounded container (white bg, subtle border)
- Screenshot full-width below header
- Category pill + "New" badge
- Stats footer: time since launch, upvotes, rating, pricing
- Upvote button prominent
- Founder name if available
