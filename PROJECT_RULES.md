# LaudStack Project Rules

## ⚠️ CRITICAL: Canonical Codebase

**ALL development MUST happen in `/home/ubuntu/laudstack-next` (Next.js).**

- This is the only project that deploys to Vercel at `laudstack.vercel.app`
- The `/home/ubuntu/laudstack` (Express + Vite) project is DEPRECATED for deployment
- Every feature, fix, and improvement goes into `laudstack-next`
- Every push to GitHub triggers an automatic Vercel deployment

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth (Google, LinkedIn, email/password)
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel (auto-deploy on push to main)
- **Repo:** github.com/LaudStack/laudstack

## Development Workflow
1. Build features in `/home/ubuntu/laudstack-next`
2. Test locally
3. `git add -A && git commit -m "feat: ..."` 
4. `git push` → Vercel auto-deploys

## Design Principles
- Light theme throughout (no dark backgrounds except footer)
- Consistent width: header/footer 1400px, content 1300px
- Amber (#F59E0B / #D97706) as primary accent color
- No gradients — clean, professional, G2-inspired aesthetic
- Inter font for headings
