# LaudStack Color Theme Specs (from Build Plan v2.1)

## 3.1 Color Palette

| Token        | Hex     | Usage                                  |
|--------------|---------|----------------------------------------|
| brand-500    | #F59E0B | Primary Amber: Buttons, links, accents |
| brand-600    | #D97706 | Hover state for primary elements       |
| neutral-950  | #0A0A0A | Primary background (Dark Mode)         |
| neutral-900  | #171717 | Card backgrounds (Dark Mode)           |
| neutral-50   | #FAFAFA | Primary background (Light Mode)        |
| white        | #FFFFFF | Card backgrounds (Light Mode)          |
| success      | #22C55E | Positive states, verified badges       |
| error        | #EF4444 | Error states, destructive actions      |

## 3.2 Typography
- Font: Inter (variable font)
- H1: 700 Bold, 48px, 1.1 line-height
- H2: 600 Semibold, 36px, 1.2 line-height
- H3: 600 Semibold, 24px, 1.3 line-height
- Body: 400 Regular, 16px, 1.6 line-height
- Caption: 500 Medium, 12px, 1.4 line-height

## 3.3 Spacing & Layout
- 8px grid system
- max-width: 1280px for content
- Padding: 24px desktop, 16px mobile
- Border radius: 12px cards, 8px buttons

## Current Implementation Notes
- Light theme throughout all pages (neutral-50 #FAFAFA backgrounds)
- Amber #F59E0B as primary brand color
- Footer: dark slate-950 (#0A0A0A) background - exception to light theme
- Header/Footer: 1400px max-width
- Page content: 1300px max-width
