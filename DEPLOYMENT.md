# LaudStack — Self-Hosting & Deployment Guide

This document covers everything you need to migrate LaudStack from the Manus development environment to your own production infrastructure. The application is a standard **Node.js + Express + React** stack — it runs on any host that supports Node.js 18+.

---

## Architecture Overview

```
client/ (React 19 + Vite)  →  builds to dist/client/
server/ (Express + tRPC)   →  builds to dist/index.js
```

The production build is a single Express server (`node dist/index.js`) that:
- Serves the compiled React frontend as static files
- Exposes the tRPC API at `/api/trpc`
- Handles OAuth callbacks at `/api/oauth/callback`

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| pnpm | 8+ | Package manager |
| MySQL 8 / PostgreSQL 15 / TiDB | — | Database |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/your-org/laudstack.git
cd laudstack
pnpm install
```

---

## Step 2 — Configure Environment Variables

Copy `env.example` to `.env` and fill in all required values:

```bash
cp env.example .env
```

See `env.example` for the full annotated list. The critical variables are:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL/Postgres connection string |
| `JWT_SECRET` | Yes | Session cookie signing secret (32+ chars) |
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Defaults to `3000` |

---

## Step 3 — Replace Manus-Specific Services

The following services are currently powered by the Manus Forge API. Each must be replaced before deploying to your own infrastructure.

### 3a. Database

**Current:** Manus-managed TiDB (MySQL-compatible).

**Self-hosted replacement:** Any MySQL 8+ or PostgreSQL 15+ database. [Supabase](https://supabase.com) (Postgres) and [PlanetScale](https://planetscale.com) (MySQL) are both excellent managed options with generous free tiers.

**Migration steps:**

1. Create a new database on your chosen provider.
2. Update `DATABASE_URL` in your `.env` file.
3. Run the schema migration:
   ```bash
   pnpm db:push
   ```
4. Verify the tables were created correctly in your database dashboard.

> **Note:** If switching from MySQL to PostgreSQL, update the Drizzle driver in `drizzle.config.ts` from `mysql2` to `pg` and update the schema column types accordingly (`mysqlTable` → `pgTable`).

---

### 3b. Authentication

**Current:** Manus OAuth (`OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`).

**Self-hosted replacement:** [Clerk](https://clerk.com) is the recommended path — it provides drop-in React components, handles sessions, and requires minimal backend changes. [Auth.js](https://authjs.dev) is the open-source alternative.

**Clerk migration steps:**

1. Create a Clerk application at [clerk.com](https://clerk.com).
2. Install the Clerk SDK:
   ```bash
   pnpm add @clerk/clerk-react @clerk/express
   ```
3. Add your Clerk keys to `.env`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   ```
4. Replace `useAuth()` calls in the frontend with Clerk's `useUser()` hook.
5. Replace `protectedProcedure` in `server/_core/trpc.ts` to validate Clerk session tokens instead of the Manus JWT cookie.

---

### 3c. Transactional Email

**Current:** Forge API `SendEmail` endpoint (called from `server/newsletter.ts`).

**Self-hosted replacement:** [Resend](https://resend.com) — simple REST API, excellent deliverability, 3,000 free emails/month.

**Resend migration steps:**

1. Sign up at [resend.com](https://resend.com) and verify your sending domain.
2. Install the Resend SDK:
   ```bash
   pnpm add resend
   ```
3. Add your Resend key to `.env`:
   ```
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=newsletter@yourdomain.com
   ```
4. In `server/newsletter.ts`, replace the `sendEmailViaForge` call with:
   ```typescript
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);
   await resend.emails.send({
     from: process.env.RESEND_FROM_EMAIL,
     to: email,
     subject,
     html: htmlBody,
     text: textBody,
   });
   ```

---

### 3d. File Storage

**Current:** Forge API storage proxy (called from `server/storage.ts`).

**Self-hosted replacement:** AWS S3 or Supabase Storage (S3-compatible). The `server/storage.ts` helpers already use the AWS SDK internally — only the credentials need to change.

**AWS S3 migration steps:**

1. Create an S3 bucket in your AWS account.
2. Create an IAM user with `s3:PutObject` and `s3:GetObject` permissions.
3. Add credentials to `.env`:
   ```
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=laudstack-assets
   ```
4. Rewrite `server/storage.ts` to use the `@aws-sdk/client-s3` package directly (already installed) instead of the Forge proxy.

---

### 3e. LLM / AI

**Current:** Forge API (Gemini Flash) used in `server/newsletter.ts` for welcome email generation.

**Self-hosted replacement:** OpenAI API or any provider supported by the `@ai-sdk` package.

**OpenAI migration steps:**

1. Get an API key at [platform.openai.com](https://platform.openai.com/api-keys).
2. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. In `server/newsletter.ts`, replace the `getOpenAI()` call (which points to Forge) with:
   ```typescript
   import { openai } from '@ai-sdk/openai';
   const model = openai('gpt-4o-mini');
   ```

---

### 3f. Remove the Manus Debug Plugin

The `vite-plugin-manus-runtime` plugin in `vite.config.ts` is only used for sandbox debugging and has no effect in production. Remove it before deploying:

```typescript
// vite.config.ts — remove these two lines:
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
// ...
vitePluginManusRuntime(),
```

---

## Step 4 — Build the Application

```bash
pnpm build
```

This produces:
- `dist/index.js` — the Express server bundle
- `dist/client/` — the compiled React frontend

---

## Step 5 — Deploy

### Option A: Railway (Recommended — zero config)

Railway detects the `railway.toml` file automatically. Simply:

1. Go to [railway.app](https://railway.app) and create a new project.
2. Connect your GitHub repository.
3. Add all environment variables from `env.example` in the Railway dashboard under **Variables**.
4. Railway will build and deploy automatically on every push to `main`.

**Custom domain:** In the Railway project settings, go to **Networking → Custom Domain** and add your domain. Railway provides automatic SSL via Let's Encrypt.

---

### Option B: Render

Render detects the `render.yaml` file automatically:

1. Go to [render.com](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Add all environment variables in the Render dashboard under **Environment**.
4. Render will build and deploy automatically.

---

### Option C: Vercel

Vercel requires wrapping the Express server as a serverless function. Add a `vercel.json` at the project root:

```json
{
  "version": 2,
  "builds": [
    { "src": "dist/index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "dist/index.js" }
  ]
}
```

> **Warning:** Vercel serverless functions have a 10-second execution timeout on the free plan. Long-running operations (LLM calls, file uploads) may time out. Railway or Render are better suited for this architecture.

---

### Option D: VPS / Docker

For full control, deploy to any VPS (DigitalOcean, Hetzner, Linode):

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t laudstack .
docker run -p 3000:3000 --env-file .env laudstack
```

---

## Step 6 — Database Migrations

After deploying, run schema migrations against your production database:

```bash
DATABASE_URL=your-production-url pnpm db:push
```

For ongoing schema changes, always run `pnpm db:push` after updating `drizzle/schema.ts`.

---

## Step 7 — Stripe (Payments)

When you are ready to enable paid tiers (Featured badge upgrades, LaunchPad Pro):

1. Create a Stripe account at [stripe.com](https://stripe.com).
2. Add Stripe to the project:
   ```bash
   # This scaffolds Stripe Checkout + webhook handling automatically
   ```
3. Add keys to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
4. Configure a webhook endpoint in the Stripe dashboard pointing to `https://yourdomain.com/api/stripe/webhook`.

---

## Recommended Production Stack

| Layer | Service | Notes |
|---|---|---|
| Hosting | Railway | Zero-config Express hosting |
| Database | Supabase (Postgres) | Generous free tier, built-in dashboard |
| Auth | Clerk | Drop-in React components |
| Email | Resend | 3,000 free emails/month |
| Storage | Supabase Storage | S3-compatible, same project as DB |
| LLM | OpenAI (gpt-4o-mini) | Cost-effective for email generation |
| Payments | Stripe | Industry standard |
| Analytics | PostHog | Open-source, self-hostable |
| Error monitoring | Sentry | Free tier covers most needs |
| Search (future) | Algolia or Typesense | When tool count exceeds 200 |

---

## Stale References to Clean Up

The following packages and env vars are no longer used and can be removed:

| Item | Location | Action |
|---|---|---|
| `@supabase/supabase-js` | `package.json` | Remove (was from an earlier scaffold) |
| `@supabase/auth-helpers-react` | `package.json` | Remove |
| `VITE_SUPABASE_URL` | `client/src/` | Remove references |
| `VITE_SUPABASE_ANON_KEY` | `client/src/` | Remove references |
| `vite-plugin-manus-runtime` | `vite.config.ts` | Remove import and usage |

---

## Health Check

Once deployed, verify the application is running correctly:

```bash
curl https://yourdomain.com/api/trpc/auth.me
# Expected: {"result":{"data":null}} (unauthenticated, but server is responding)
```

---

*Last updated: March 2026*
