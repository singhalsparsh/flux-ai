# FluxAI Documentation

> Go Deeper with AI-Powered Research & Agentic Workflows

FluxAI is a full-stack AI chat application supporting Mistral AI, Local AI (browser-based WebLLM), and BYOK (Bring Your Own Key) models with multiple providers.

## Table of Contents

- [Architecture](#architecture)
- [Packages](#packages)
- [Features](#features)
- [Components](#components)
- [Stores](#stores)
- [AI Models](#ai-models)
- [API Routes](#api-routes)
- [Environment Variables](#environment-variables)
- [Development](#development)

---

## Architecture

FluxAI is a **Turborepo monorepo** with 6 packages:

```
flux-ai/
├── apps/web/                Next.js 14 App Router — main application
│   └── app/
│       ├── changelog/       Changelog page
│       ├── feedback/        Feedback page
│       ├── terms/           Terms & Conditions
│       ├── privacy/         Privacy Policy
│       ├── api/             API routes (completion, messages, etc.)
│       └── chat/            Main chat interface
├── packages/
│   ├── ai/                  AI model providers, workflow workers
│   ├── common/              Shared React components, hooks, Zustand stores
│   ├── prisma/              Database schema (Drizzle ORM)
│   ├── shared/              Shared types, config, utilities
│   ├── ui/                  Design system (Button, Dialog, Input, etc.)
│   └── typescript-config/   Shared TS configurations
└── turbo.json               Turborepo configuration
```

## Packages

### `@repo/ui` — Design System
Radix UI primitives wrapped with Tailwind CSS. Uses `class-variance-authority` for variants.

Key exports: `Button` (incl. `glass` variant), `Dialog`, `Input`, `Badge`, `Flex`, `DropdownMenu`, `Tooltip`, `CommandDialog`, `Kbd`, `Alert`, `Textarea`, `cn`

### `@repo/common` — Application Logic
React components, hooks, Zustand stores, and React context providers.

### `@repo/shared` — Shared Types & Config
- `ChatMode` enum — all supported model identifiers
- `ChatModeConfig` — per-mode flags (webSearch, imageUpload, retry, isAuthRequired, isNew)
- `CHAT_MODE_CREDIT_COSTS` — credit costs per mode
- Thread/ThreadItem types

### `@repo/ai` — AI Workers
Web Worker for BYOK API calls (OpenAI, Anthropic, Google, DeepSeek, Together).

## Features

| Feature | Description |
|---|---|
| **Multi-model Chat** | Mistral, Local AI (WebGPU), GPT-4o, Claude, Gemini, DeepSeek, Llama |
| **Local AI** | Runs entirely in-browser via WebLLM + WebGPU. No data leaves your machine. |
| **Web Search** | Toggle web search for real-time information |
| **Image Upload** | Attach images for multimodal models |
| **Streaming** | Real-time SSE streaming for AI responses |
| **Dark/Light Theme** | `next-themes` with 8 accent colors (Ocean, Emerald, Violet, Rose, Amber, Cyan, Lime, Pink) |
| **Daily Token Limits** | 5M tokens/day for unregistered users on Local AI |
| **Keyboard Shortcuts** | `⌘K` — command search palette |
| **Mobile Sidebar** | Vaul drawer triggered by floating glass button (top-left) |
| **Liquid Glass UI** | Apple-style frosted glass design system (4 tiers: glass, glass-strong, glass-card, glass-ultra) |
| **BYOK** | Bring your own API key — use any supported provider |
| **Grammar Check** | LanguageTool integration for AI responses |
| **Environmental Impact** | Shows energy/water/cost per AI response with animated counters |
| **Completion Sound** | Subtle pop sound (Web Audio API) when generation finishes |
| **Export Report** | Full PDF report of all conversations |
| **Storage Management** | Clear chat history, model cache, factory reset |
| **MCP Tools** | Model Context Protocol tool integration |

## Components

### Layout
| Component | File | Description |
|---|---|---|
| `RootLayout` | `layout/root.tsx` | Main layout — sidebar, mobile drawer, glass container |
| `SideDrawer` | `layout/root.tsx` | Animated side panel for thread details/steps |
| `Sidebar` | `side-bar.tsx` | Full sidebar with thread groups, user profile, search |

### Chat Input
| Component | File | Description |
|---|---|---|
| `ChatInput` | `chat-input/input.tsx` | Main input with editor, image upload, mode selector |
| `ChatEditor` | `chat-input/chat-editor.tsx` | Tiptap rich text editor |
| `ChatModeButton` | `chat-input/chat-actions.tsx` | Dropdown for Smart/BYOK/Local mode switching |
| `WebSearchButton` | `chat-input/chat-actions.tsx` | Toggle web search |
| `SendStopButton` | `chat-input/chat-actions.tsx` | Animated send/stop button |

### Thread
| Component | File | Description |
|---|---|---|
| `ThreadItem` | `thread/thread-item.tsx` | Single message with answer, sources, steps, followups |
| `MarkdownContent` | (internal) | Rendered markdown with Shiki syntax highlighting |

### Dialogs
| Component | File | Description |
|---|---|---|
| `SettingsModal` | `settings-modal.tsx` | Tabbed settings: Customize, Theme, Usage, API Keys, Local AI, Storage, Export |
| `CommandSearch` | `command-search.tsx` | `⌘K` palette — search threads, actions, navigate |
| `IntroDialog` | `intro-dialog.tsx` | First-time user onboarding |

## Stores

All stores use Zustand. `persist` middleware writes to localStorage where noted.

| Store | File | Persists | Purpose |
|---|---|---|---|
| `useChatStore` | `chat.store.ts` | localStorage + IndexedDB | Threads, messages, editor, credits |
| `useAppStore` | `app.store.ts` | — | UI state (sidebar, settings, active tab) |
| `useApiKeysStore` | `api-keys.store.ts` | localStorage | Provider API keys (multi-key per provider) |
| `useLocalAIStore` | `local-ai.store.ts` | localStorage(partial) | Model downloads, loaded model, RAM estimate |
| `useDailyTokenStore` | `daily-token.store.ts` | localStorage | 5M token/day counter for unregistered users |
| `useMcpToolsStore` | `mcp-tools.store.ts` | localStorage | MCP tool configurations |

## AI Models

### Chat Mode Matrix

| Mode | Type | Auth Required | Credits | Cost |
|---|---|---|---|---|
| Deep Research | Workflow | Yes | 10 | Server |
| Pro Search | Workflow | Yes | 5 | Server |
| Mistral Small | API | Yes | 2 | Server |
| Mistral Large | API | Yes | 4 | Server |
| Codestral | API | Yes | 3 | Server |
| **Local AI** | **Browser** | **No** | **0** | **Free** |
| GPT-4o Mini | BYOK | No | 0 | User key |
| GPT-4o | BYOK | No | 0 | User key |
| o4-mini | BYOK | No | 0 | User key |
| Claude 3.5 Sonnet | BYOK | No | 0 | User key |
| Claude 3.7 Sonnet | BYOK | No | 0 | User key |
| Gemini 2.0 Flash | BYOK | No | 0 | User key |
| DeepSeek R1/V3 | BYOK | No | 0 | User key |
| Llama 4 Scout | BYOK | No | 0 | User key |

### Local AI Tier Guide

| Tier | RAM | Example Models |
|---|---|---|
| **Small** | 1-2 GB | Qwen2 0.5B, Phi-3 Mini, Gemma 2 2B |
| **Medium** | 4-6 GB | Qwen2 7B, Mistral 7B, Llama 3.1 8B |
| **Large** | 6-12 GB | Qwen3 8B, Phi-4 Mini, Llama 3.1 70B (q3) |
| **Ultra** | 8-16 GB | Llama 3 70B (q3), Qwen3.5 9B |

### Chat Mode Dropdown
- **SMART** — Mistral models (always available, requires login)
- **BYOK** — Third-party models (requires API key in Settings, shown on `/chat` page)
- **Local** — Shows currently loaded model name; click to load/unload

## CSS Theming

CSS custom properties in `apps/web/app/globals.css`:

```
--background  / --foreground
--brand       / --brand-foreground
--accent      / --accent-foreground
--muted       / --muted-foreground
--border      / --hard / --soft
--ring        / --radius
```

### Glass Utility Classes

| Class | Blur | Opacity (light) | Use |
|---|---|---|---|
| `.glass` | 24px | 45% | Subtle frosted backgrounds |
| `.glass-strong` | 40px | 60% | Main containers, sidebar |
| `.glass-card` | 20px | 35% | Cards, answer areas |
| `.glass-ultra` | 56px | 75% | Dialogs, modals, floating buttons |

Dark mode classes are auto-applied via `.dark .glass-*` selectors.

### Accent Colors
8 presets in Settings → Theme: Ocean (default), Emerald, Violet, Rose, Amber, Cyan, Lime, Pink. Each sets `--brand`, `--accent` CSS custom properties at runtime.

## Mobile Support

- **Sidebar**: Vaul drawer (`direction="left"`) triggered by floating glass button in top-left corner
- **Button behavior**: Hidden when sidebar is open, reappears when closed (AnimatePresence)
- **Desktop**: Button hidden via `lg:hidden`

## Unregistered User Limits

| Mode | Limit |
|---|---|
| Local AI | 5M tokens/day (localStorage counter, resets daily) |
| Mistral / Workflows | Blocked (redirects to sign-in) |
| BYOK | Available (user provides own key) |

## API Routes

### `POST /api/completion`
SSE streaming for Mistral AI and workflow modes.

**Request:** `{ mode, prompt, threadId, messages, threadItemId, customInstructions?, webSearch?, showSuggestions?, mcpConfig? }`

**Response:** SSE stream with events: `steps`, `sources`, `answer`, `error`, `status`, `suggestions`, `done`

### `POST /api/feedback`
Anonymous feedback submission (`{ feedback: string }`).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk auth publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk auth secret key |
| `MISTRAL_API_KEY` | Yes | Mistral AI API key |
| `SERPER_API_KEY` | Yes | Web search API (Serper.dev) |
| `UPSTASH_REDIS_REST_URL` | No | Rate limiting (MCP sessions) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Rate limiting token |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Product analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog instance |
| `PLAUSIBLE_DOMAIN` | No | Analytics |

## Development

### Prerequisites
- **Node.js** ≥ 18 (tested on 22+)
- **Bun** (package manager)
- **WebGPU browser** (Chrome 113+, Edge 113+) for Local AI

### Quick Start

```bash
# Clone
git clone https://github.com/singhalsparsh/flux-ai.git
cd flux-ai

# Install
bun install

# Environment
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your keys

# Dev server
bun run dev

# Build
bun run build

# Type check
cd packages/common && bunx tsc --noEmit
```

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Monorepo**: Turborepo + Bun
- **Auth**: Clerk (multi-provider SSO)
- **State**: Zustand + immer + persist
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **Local AI**: `@mlc-ai/web-llm` v0.2.84
- **Icons**: Tabler Icons
- **Notifications**: Sonner

---

## Vercel Free Tier Hosting

FluxAI is designed to work on **Vercel's Hobby (free) plan** with zero-cost services.

### What Works on Free Tier

| Service | Cost | Notes |
|---|---|---|
| **Next.js hosting** | Free | All routes, SSR, SSG |
| **Local AI** (WebLLM) | Free | Runs entirely in-browser via WebGPU |
| **BYOK models** | Free | Web Worker calls provider APIs from browser |
| **Mistral API** | Free via API key | Server-side streaming (basic chat fits 10s timeout) |
| **Clerk auth** | Free (up to 10k users) | External service, just needs env vars |
| **Vercel KV** | Free | Credit tracking (30k req/day) |

### Removed Dependencies (no longer needed)

- **PostgreSQL / Prisma** — Removed. Feedback is stored client-side.
- **Sentry** — Removed. Errors are logged to console.
- **Supabase / PGlite / Drizzle** — Removed (unused).
- **DATABASE_URL** — No longer required.

### Environment Variables

Only these are needed for full functionality:

| Variable | Required | Source |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | [Clerk Dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Yes | Clerk Dashboard |
| `MISTRAL_API_KEY` | Yes | [Mistral AI Console](https://console.mistral.ai) |
| `SERPER_API_KEY` | Yes | [Serper.dev](https://serper.dev) (web search) |
| `JINA_API_KEY` | No | Jina AI (page reading, optional) |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog analytics |
| `KV_URL` / `KV_REST_API_URL` | No | Upstash Redis (MCP sessions, optional) |

### Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Set the required env vars above
4. Deploy — no build scripts or DB setup needed

---

*Built with passion by [Sparsh Singhal](https://github.com/singhalsparsh)*  
*FluxAI — MIT License*
