# How FluxAI Is Made

FluxAI is a modern, privacy-first AI chat application that runs multiple AI models — from cloud-based Mistral models to fully local WebLLM inference in your browser — all wrapped in an Apple-inspired liquid glass UI.

## Architecture Overview

```
flux-ai/
├── apps/
│   └── web/              # Next.js 14 (App Router) — the main application
├── packages/
│   ├── ai/               # AI model providers (Mistral, BYOK workers)
│   ├── common/           # Shared React components, hooks, Zustand stores
│   ├── prisma/           # Database schema & migrations
│   ├── shared/           # Types, config, shared utilities
│   └── ui/               # Design system: Button, Dialog, Input, etc.
├── turbo.json            # Turborepo configuration
└── package.json          # Monorepo root
```

### Key Technologies

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, RSC) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS 3 + CSS custom properties |
| **State** | Zustand + immer + persist middleware |
| **UI Components** | Radix UI primitives + custom design system |
| **Animation** | Framer Motion |
| **AI — Server** | LangChain.js → Mistral AI API (server-side) |
| **AI — Local** | WebLLM (MLC-ai/web-llm) — runs in-browser via WebGPU |
| **AI — BYOK** | Web Worker running AI SDK for user-provided API keys |
| **Auth** | Clerk (multi-provider SSO) |
| **Database** | PostgreSQL (Drizzle ORM) |
| **Search** | cmdk (⌘K command palette) |
| **Drawer** | Vaul (mobile sidebar) |

## How Models Work

### 1. Mistral (Default, Server-Side)
The `/api/completion` route streams Mistral AI responses via Server-Sent Events (SSE). The client reads the stream using `ReadableStream` and updates thread items incrementally. Credits are enforced server-side with daily limits.

### 2. Local AI (Browser-Side, WebGPU)
Uses `@mlc-ai/web-llm` (`CreateMLCEngine`) to download and run quantized LLMs entirely in the browser via WebGPU. Model weights are cached in IndexedDB — no re-download on refresh.

- `use-local-llm.ts` — Singleton engine pattern: one engine per tab, shared across components
- Models load on-demand when the user selects Local AI from the chat mode dropdown
- Supports multiple models from 1.5B to 14B parameters
- Token counting uses `chars / 4` approximation for daily limits

### 3. BYOK (Bring Your Own Key)
User-provided API keys are stored in localStorage (never sent to the server). A Web Worker runs AI SDK calls directly from the browser to the provider's API.

## Liquid Glass UI System

The glass system is defined in `apps/web/app/globals.css`:

```css
.glass         — Subtle frost (transparent background, 24px blur)
.glass-strong  — Medium frost (40px blur, stronger border)
.glass-card    — Card frost (20px blur, card background)
.glass-ultra   — Maximum frost (56px blur, high-opacity)
```

Dark mode variants use lower opacity + higher blur for a deeper effect. All glass classes use `backdrop-filter` for the native frosted-glass look.

## State Management

Each store in `packages/common/store/` handles one domain:

| Store | Persistence | Purpose |
|---|---|---|
| `chat.store.ts` | localStorage + IndexedDB | Threads, messages, credits |
| `local-ai.store.ts` | localStorage (partial) | Model selection, download state |
| `api-keys.store.ts` | localStorage (encrypted) | BYOK API keys |
| `app.store.ts` | None | UI state (sidebar, settings modals) |
| `daily-token.store.ts` | localStorage | 5M token/day limit for unregistered users |
| `mcp-tools.store.ts` | localStorage | MCP tool configurations |

## Dark/Light Theme

Uses `next-themes` with `attribute="class"` — toggling `dark` class on `<html>`. CSS variables in `globals.css` define the full palette for both modes:

- Light: `--background: 199 20% 100%` → clean white
- Dark: `--background: 199 15% 8%` → deep charcoal

Users can also choose an accent color from 8 presets (Ocean, Emerald, Violet, Rose, Amber, Cyan, Lime, Pink), which sets CSS custom properties `--brand`, `--accent` at runtime.

## How to Clone & Run Locally

### Prerequisites
- **Node.js** ≥ 18 (tested on 22+)
- **Bun** (for Prisma generation)
- **WebGPU-capable browser** (Chrome 113+, Edge 113+) for Local AI

### Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/singhalsparsh/flux-ai.git
cd flux-ai

# 2. Install dependencies
bun install

# 3. Set up environment
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your keys:
#   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
#   - CLERK_SECRET_KEY=
#   - MISTRAL_API_KEY=

# 4. Set up database
cd packages/prisma
bun prisma generate
cd ../..

# 5. Run development server
bun run dev
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk auth publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk auth secret key |
| `MISTRAL_API_KEY` | Yes | Mistral AI API key |
| `SERPER_API_KEY` | Yes | Web search API |
| `UPSTASH_REDIS_REST_URL` | No | Rate limiting (Upstash, optional) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Rate limiting token |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Product analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog instance URL |
| `PLAUSIBLE_DOMAIN` | No | Analytics |

> **Vercel Hobby Plan**: No database needed. PostgreSQL/Prisma, Sentry, Supabase, and Drizzle have been removed — FluxAI runs fully on Vercel's free tier with just the env vars above.

### Build for Production

```bash
bun run build
```

The production build outputs to `apps/web/.next/`.

## GitHub Repository

**URL**: [https://github.com/singhalsparsh/flux-ai](https://github.com/singhalsparsh/flux-ai)

### Deployment

Recommended: [Vercel](https://vercel.com) (one-click from GitHub).

```bash
# Or deploy manually:
vercel --prod
```

---

*Built with passion by Sparsh Singhal*
