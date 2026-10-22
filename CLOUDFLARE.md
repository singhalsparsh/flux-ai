# ☁️ Deploying FluxAI on Cloudflare (Free Tier)

This guide explains how to deploy FluxAI on **Cloudflare Pages** using **Cloudflare Workers** for API routes — all within the **free tier**.

> **Free tier limits:** 100,000 requests/day (Workers), 500 builds/month (Pages), unlimited bandwidth, 1 GB storage.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Install Cloudflare Tools](#step-1-install-cloudflare-tools)
4. [Step 2: Create Cloudflare Resources](#step-2-create-cloudflare-resources)
5. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
6. [Step 4: Build for Cloudflare](#step-4-build-for-cloudflare)
7. [Step 5: Deploy to Cloudflare Pages](#step-5-deploy-to-cloudflare-pages)
8. [Step 6: Speed & Performance Optimizations](#step-6-speed--performance-optimizations)
9. [CI/CD: GitHub Actions Auto-Deploy](#step-7-cicd-github-actions-auto-deploy)
10. [Known Limitations](#known-limitations)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌───────────────┐     ┌─────────────────────────────────────────┐
│   Browser     │────▶│  Cloudflare Pages (Static Assets + SSR) │
└───────────────┘     └─────────────────────────────────────────┘
                               │
                               ▼
                      ┌──────────────────┐      ┌────────────────┐
                      │  Pages Functions │─────▶│  Cloudflare KV  │
                      │  (Workers)       │      │  (Credit State) │
                      └──────────────────┘      └────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │  External APIs    │
                      │  (Mistral, Clerk, │
                      │   OpenAI, etc.)   │
                      └──────────────────┘
```

FluxAI runs on Cloudflare Pages with:

- **Static pages** (`/chat`, `/sign-in`, etc.) — served directly from Cloudflare's edge
- **API routes** (`/api/completion`, `/api/feedback`, etc.) — run as Pages Functions (powered by Cloudflare Workers)
- **KV** — optional, for credit tracking (or use Upstash Redis via REST)
- **AI models** — proxied to external providers (Mistral, OpenAI, Anthropic, etc.)

---

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- Node.js 18+ and `bun` installed locally
- Your API keys: Mistral, Clerk publishable/secret (or other providers)

---

## Step 1: Install Cloudflare Tools

```bash
# Install Wrangler CLI (Cloudflare's deployment tool)
npm install -g wrangler

# Or install locally in the project (preferred)
cd apps/web
bun add -D wrangler @cloudflare/next-on-pages
```

**Verify installation:**

```bash
wrangler --version
# Should output: ⚡️ wrangler X.X.X
```

### Authenticate Wrangler

```bash
# Log in to your Cloudflare account
wrangler login
# This opens a browser window — authorize the CLI.
```

---

## Step 2: Create Cloudflare Resources

### 2a. Cloudflare Pages Project

```bash
# Option A: Create via Wrangler (then connect git in dashboard)
wrangler pages project create flux-ai --production-branch main

# Option B: Create via dashboard
# 1. Go to https://dash.cloudflare.com → Workers & Pages
# 2. Click "Create application" → "Pages" → "Connect to Git"
# 3. Authorize GitHub and select your repo
# 4. Set framework preset to "None" (we'll use custom build)
```

### 2b. KV Namespace (Optional — for Credit Tracking)

If you want per-IP credit tracking without Upstash:

```bash
# Create the KV namespace
wrangler kv:namespace create FLUXAI_KV

# This outputs an ID like:  abc123def456...
# Add this ID to your wrangler.toml:
# [[kv_namespaces]]
# binding = "FLUXAI_KV"
# id = "abc123def456..."
```

For the **free alternative** to Vercel KV / Upstash, you can also:

1. Use `@upstash/redis` with Upstash's free tier (10,000 requests/day)
   - Sign up at https://console.upstash.com
   - Create a Redis database (free tier)
   - Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
2. Or use the Cloudflare-native KV binding
   - Higher latency for credit checks
   - No Lua scripting support (eval-based scripts won't work)

---

## Step 3: Configure Environment Variables

Set all secrets via `wrangler pages secret put`:

```bash
# API Keys
wrangler pages secret put MISTRAL_API_KEY
wrangler pages secret put MISTRAL_API_KEY_2
wrangler pages secret put MISTRAL_API_KEY_3

# Clerk Authentication
wrangler pages secret put CLERK_SECRET_KEY
wrangler pages secret put NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
wrangler pages secret put NEXT_PUBLIC_CLERK_SIGN_IN_URL
wrangler pages secret put NEXT_PUBLIC_CLERK_SIGN_UP_URL
wrangler pages secret put NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
wrangler pages secret put NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
wrangler pages secret put NEXT_PUBLIC_APP_URL

# Analytics (optional — skip if not using PostHog)
wrangler pages secret put NEXT_PUBLIC_POSTHOG_KEY
wrangler pages secret put NEXT_PUBLIC_POSTHOG_HOST

# KV / Redis
wrangler pages secret put KV_REST_API_URL
wrangler pages secret put KV_REST_API_TOKEN
# Or if using Upstash:
wrangler pages secret put UPSTASH_REDIS_REST_URL
wrangler pages secret put UPSTASH_REDIS_REST_TOKEN

# Public variables (not secrets — set in dashboard under Pages → Settings → Environment variables)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY — must be public for client-side use
# FREE_CREDITS_LIMIT_REQUESTS_AUTH=0
# FREE_CREDITS_LIMIT_REQUESTS_IP=20
```

**Important:** `NEXT_PUBLIC_*` variables are bundled at build time. For Cloudflare Pages, set these both as **Preview** and **Production** environment variables in the dashboard.

---

## Step 4: Build for Cloudflare

### 4a. Build Configuration

The project includes a `wrangler.toml` template at `apps/web/wrangler.toml.example`.
Copy and customize it for your deployment:

```bash
cp apps/web/wrangler.toml.example apps/web/wrangler.toml
# Edit apps/web/wrangler.toml with your KV namespace IDs
```

### 4b. Build Command

```bash
# From the apps/web directory:
cd apps/web

# Build with @cloudflare/next-on-pages:
DEPLOY_TARGET=cloudflare npx @cloudflare/next-on-pages

# Or using the npm script:
bun run pages:build
```

This generates the output in `.vercel/output/static/` — ready for Cloudflare Pages.

### 4c. Local Development

To test your Cloudflare build locally:

```bash
# From apps/web:
npx wrangler pages dev .vercel/output/static --compatibility-flags="nodejs_compat"

# Or:
bun run pages:dev
```

---

## Step 5: Deploy to Cloudflare Pages

### Option A: Direct Deploy

```bash
# From apps/web after building:
npx wrangler pages deploy .vercel/output/static --branch=main

# Or preview deployment:
npx wrangler pages deploy .vercel/output/static --branch=preview
```

### Option B: Git-Integrated Deploy (Recommended)

Set up in Cloudflare Dashboard:

1. Go to **Cloudflare Dashboard → Workers & Pages → Your App → Settings → Build configuration**
2. Set:
   - **Build command:** `cd apps/web && npm run pages:build`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** (leave blank — use repo root)
3. Cloudflare will auto-deploy on every push to the production branch

### Option C: GitHub Actions (CI/CD)

Create `.github/workflows/cloudflare.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build for Cloudflare
        working-directory: apps/web
        run: DEPLOY_TARGET=cloudflare npx @cloudflare/next-on-pages
        env:
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          workingDirectory: apps/web
          command: pages deploy .vercel/output/static --project-name=flux-ai --branch=main
```

> **Get your CF_API_TOKEN:** Cloudflare Dashboard → My Profile → API Tokens → Create Token → "Cloudflare Pages" template.

---

## Step 6: Speed & Performance Optimizations

### 6a. Edge Caching

Add cache-control headers to static assets. Cloudflare Pages automatically caches:

- `_next/static/*` → 1 year (immutable)
- Static assets (images, fonts) → 1 year
- HTML pages → no cache (dynamic)

For API routes, add the following to your responses:

```typescript
// Add to API route responses
new Response(body, {
  headers: {
    'Cache-Control': 'no-cache, no-transform',
    // ...
  },
})
```

### 6b. Reduce Cold Starts

Workers cold start on first request. To mitigate:

1. **Minimize dependencies** — large packages increase cold start time
2. **Use `nodejs_compat` flag** — enables Node.js API compatibility but can increase size
3. **Split functionality** — keep heavy Node.js packages (langchain, pdf-parse) in separate bundles using dynamic imports:

```typescript
// Instead of:
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
// Use dynamic import in API routes:
const { PDFLoader } = await import('@langchain/community/document_loaders/fs/pdf')
```

### 6c. Regional Routing

Cloudflare Pages automatically routes users to the nearest edge location.
No additional configuration needed.

---

## Step 7: CI/CD — GitHub Actions Auto-Deploy

Create `.github/workflows/cloudflare.yml` at the repo root:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: cloudflare-${{ github.ref }}
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.1.19

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build for Cloudflare
        working-directory: apps/web
        run: npx @cloudflare/next-on-pages
        env:
          DEPLOY_TARGET: cloudflare
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
          NEXT_PUBLIC_CLERK_SIGN_IN_URL: /sign-in
          NEXT_PUBLIC_CLERK_SIGN_UP_URL: /sign-up
          NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: /chat
          NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: /chat
          NEXT_PUBLIC_APP_URL: ${{ vars.NEXT_PUBLIC_APP_URL }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          workingDirectory: apps/web
          command: pages deploy .vercel/output/static --project-name=flux-ai --branch=${{ github.head_ref || github.ref_name }}
```

**Required GitHub secrets:**
- `CF_API_TOKEN` — Cloudflare API token with Pages permissions
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `NEXT_PUBLIC_APP_URL` — Your Pages URL (set as variable or secret)

---

## Known Limitations

FluxAI uses several dependencies that may have limited Cloudflare Workers support:

### ✅ Works on Cloudflare Workers
| Component | Notes |
|-----------|-------|
| Static pages (Next.js) | Handled by Cloudflare Pages |
| Clerk authentication | Works with Edge Runtime |
| Mistral / OpenAI / Anthropic API calls | Native `fetch` supported |
| PostHog analytics | Works with Edge Runtime |
| **@vercel/functions** | **Polyfill provided** at `lib/cloudflare/vercel-compat.ts` |

### ⚠️ Partial / Conditional Support
| Component | Issue | Workaround |
|-----------|-------|------------|
| **@vercel/kv** | Vercel-specific | Use **Upstash Redis** (free tier) with `UPSTASH_REDIS_REST_URL` env vars. The app already uses `@upstash/ratelimit` — just add `@upstash/redis` for KV operations. |
| **langchain / @langchain/core** | Heavy Node.js deps | Works with `nodejs_compat` flag. Some document loaders (PDF, file system) won't work. Mark as external in config. |
| **pdf-parse / pdfjs-dist** | Requires Node.js Buffer | Works with `nodejs_compat` flag. |
| **jsdom** | Requires Node.js APIs | Works with `nodejs_compat` flag. |
| **ReadableStream** patterns | Already compatible | ✅ Native Web Streams alignment. |
| **crypto (randomUUID)** | Node.js crypto | Use `crypto.randomUUID()` (available via `nodejs_compat`) or web `crypto.randomUUID()`. |

### ❌ Won't Work
| Component | Reason |
|-----------|--------|
| **duck-duck-scrape** | Requires Node.js HTTP agents |
| **pg** (postgres driver) | Direct PostgreSQL connections not supported — use D1 or HTTP-based DB |
| **node-fetch** | Unnecessary — Workers have native `fetch`. Remove the import. |
| **fs / path / os** modules | Filesystem access not available |

---

## Troubleshooting

### Build Fails with "Module not found"

```bash
✘ [ERROR] Could not resolve "crypto"
```
**Fix:** Ensure `wrangler.toml` has `compatibility_flags = ["nodejs_compat"]`

---

### "Cannot find module '@vercel/kv'"

The project uses `@vercel/kv` for credit tracking. On Cloudflare:

1. **Switch to Upstash Redis** (free tier works):
   - Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   - The `@vercel/kv` client will use Upstash's REST API automatically
2. **Or use Cloudflare KV** — see `lib/cloudflare/kv-compat.ts` for an adapter

---

### Authentication (Clerk) Not Working

Clerk needs to be configured for your Cloudflare domain:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Sessions → Domains**
3. Add `https://your-app.pages.dev` as an allowed domain
4. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in Cloudflare Pages env vars

---

### "Script exceeded CPU time limit"

Cloudflare Workers free plan has a **10ms CPU time limit** per request.
Heavy Node.js packages (langchain, pdf-parse) can exceed this.

**Solutions:**
1. Upgrade to Workers Paid ($5+/month) — gets you 30s CPU time
2. Optimize API routes — defer heavy imports to dynamic imports
3. Split the workload — edge function calls external services, heavy processing elsewhere

---

### API Routes Return 404

If API routes aren't resolving:

```bash
# Check the output directory
ls -la .vercel/output/static/
# Ensure functions are compiled:
ls -la .vercel/output/static/_worker.js  # should exist after build
```

Re-run: `npx @cloudflare/next-on-pages`

---

## Quick Deploy Checklist

- [ ] Cloudflare account created
- [ ] Wrangler installed and authenticated (`wrangler login`)
- [ ] Project created in Cloudflare Pages dashboard
- [ ] Environment variables set (secrets + build-time variables)
- [ ] Clerk domain configured for `.pages.dev`
- [ ] API keys set as secrets
- [ ] `wrangler.toml` configured with your KV namespace IDs
- [ ] Build succeeded: `bun run pages:build`
- [ ] Preview deployment: `bun run pages:preview`
- [ ] Production deployment: `bun run pages:deploy`
- [ ] GitHub Actions workflow created (optional)

---

## Resources

- [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
- [Clerk + Cloudflare Pages](https://clerk.com/docs/deployments/cloudflare-pages)
- [Upstash Redis free tier](https://upstash.com/)
- [Wrangler CLI reference](https://developers.cloudflare.com/workers/wrangler/commands/)
