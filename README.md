# LaudStack

> The trusted community platform where founders launch their AI and SaaS tools, users discover the best software, and the community curates quality through reviews and voting.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Routing** | Wouter |
| **Animations** | Framer Motion |
| **Backend / DB** | Supabase (PostgreSQL + Auth + Storage) |
| **Payments** | Stripe |
| **Email** | Resend |
| **Deployment** | Vercel |
| **Version Control** | GitHub |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/laudstack.git
cd laudstack
pnpm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here
```

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables in Vercel Project Settings → Environment Variables
4. Deploy — Vercel auto-deploys on every push to `main`

### Supabase Setup

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Run the database migrations from `/supabase/migrations/` (Phase 2)
3. Copy the Project URL and Anon Key into your environment variables
4. Enable Row Level Security (RLS) on all tables

## Project Structure

```
laudstack/
├── client/
│   ├── public/          # Static assets (favicon, logos)
│   └── src/
│       ├── components/  # Reusable UI components
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   └── ToolCard.tsx
│       ├── pages/       # Page-level components
│       │   └── Home.tsx
│       ├── lib/         # Utilities and helpers
│       │   ├── supabase.ts   # Supabase client
│       │   ├── types.ts      # TypeScript types
│       │   └── mockData.ts   # Development mock data
│       ├── App.tsx      # Routes
│       └── index.css    # Design tokens + global styles
└── README.md
```

## Build Phases

| Phase | Focus | Status |
|---|---|---|
| **Phase 1** | Foundation — scaffold, design system, homepage | ✅ Complete |
| **Phase 2** | Core Platform — tool pages, reviews, auth, Supabase | 🔜 Next |
| **Phase 3** | Monetization — Pro subscriptions, Stripe, analytics | 🔜 Planned |
| **Phase 4** | Growth — affiliate program, API, advanced features | 🔜 Planned |

## Brand Assets

All brand assets are located in `/client/public/`:
- `favicon.png` — Browser favicon
- `logo-light.png` — Logo for light backgrounds (transparent)
- `logo-dark.png` — Logo for dark backgrounds (transparent)

## Contributing

Please read the LaudStack Build Plan PDF for the full technical specification before contributing.
