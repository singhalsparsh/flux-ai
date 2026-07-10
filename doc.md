# FluxAI Documentation

## Overview

FluxAI is an AI-powered research & chat application built as a Turborepo monorepo. It supports cloud-based AI models via Mistral AI API and local models running in-browser via WebGPU (WebLLM).

## Project Structure

```
fluxai/
├── apps/
│   └── web/                  # Next.js 14 web application
│       └── app/
│           ├── changelog/    # Changelog page
│           ├── feedback/     # Feedback page
│           ├── terms/        # Terms & Conditions page
│           ├── privacy/      # Privacy Policy page
│           ├── api/          # API routes (completion, messages, etc.)
│           └── chat/         # Main chat interface
├── packages/
│   ├── ai/                   # AI models, providers, workflow engine
│   ├── common/               # Shared React components, hooks, stores
│   ├── orchestrator/         # Workflow orchestration engine
│   ├── shared/               # Shared config, types, utilities
│   ├── ui/                   # UI component library
│   └── …                     # Other packages
└── doc.md                    # This file
```

## Available Pages

### `/changelog` — Changelog
Lists all releases, features, and changes in FluxAI.

**Source:**
- Page: `apps/web/app/changelog/page.tsx`
- Content: `packages/shared/config/changelog.ts`

### `/feedback` — Send Feedback
Instructions on how to submit feedback, feature requests, and bug reports.

**Source:**
- Page: `apps/web/app/feedback/page.tsx`
- Content: `packages/shared/config/feedback.ts`

### `/terms` — Terms & Conditions
Legal terms governing use of FluxAI — age requirements, privacy, AI output disclaimers, liability limits.

**Source:**
- Page: `apps/web/app/terms/page.tsx`
- Content: `packages/shared/config/terms.ts`

### `/privacy` — Privacy Policy
Data handling practices — local storage, third-party services, cookies, contact information.

**Source:**
- Page: `apps/web/app/privacy/page.tsx`
- Content: `packages/shared/config/privacy.ts`

## AI Models

### Cloud API Models (Mistral AI)
- **Mistral Small** — Fast, lightweight for everyday tasks
- **Mistral Large** — Powerful, complex reasoning
- **Codestral** — Code generation & programming tasks

### Local Models (WebGPU / WebLLM)
Local models run entirely in the browser using WebGPU. No data leaves your machine.

**Small Tier** (1-2 GB RAM):
| Model | RAM | Use Case |
|-------|-----|----------|
| Qwen2 0.5B | 1 GB | Quick Q&A, basic chat |
| Qwen2 1.5B | 1.5 GB | Light chat, summarization |
| Phi-3 Mini | 2 GB | Code, reasoning |
| Gemma 2 2B | 1.5 GB | Creative writing |
| StableLM 2 1.6B | 1.5 GB | Conversational AI |
| Qwen2.5-1.5B | 1.5 GB | General chat |

**Medium Tier** (4-6 GB RAM):
| Model | RAM | Use Case |
|-------|-----|----------|
| Qwen2 7B | 4 GB | Complex reasoning |
| Mistral 7B v0.3 | 4 GB | General chat, coding |
| Hermes 2 Pro Mistral 7B | 4 GB | Function calling |
| Gemma 2 9B | 5 GB | Technical tasks |
| Llama 3.1 8B | 5 GB | Instruction following |
| Qwen2.5-7B | 4 GB | Advanced reasoning |

**Large Tier** (6-24 GB RAM):
| Model | RAM | Use Case |
|-------|-----|----------|
| Qwen3 8B | 6 GB | Advanced coding |
| Phi-4 Mini | 6 GB | Complex reasoning |
| Llama 3.1 70B | 24 GB | Expert-level tasks |

**Ultra Tier** (8+ GB RAM):
| Model | RAM | Use Case |
|-------|-----|----------|
| Llama 3 70B | 28 GB | Ultra-demanding tasks |
| Qwen3.5-9B | 8 GB | Near-top-tier results |

## Key Features

- **Multi-mode chat**: Deep Research, Pro Search, Mistral models, Local AI
- **Local AI inference**: Run models offline via WebGPU
- **API key management**: Bring your own Mistral API key
- **Web search**: Optional web augmentation for responses
- **Streaming responses**: Real-time streaming of AI responses
- **Chat history**: IndexedDB-based local storage
- **Credit system**: Daily usage limits for unauthenticated users

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MISTRAL_API_KEY` | Mistral AI API key for server-side requests |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth publishable key |
| `CLERK_SECRET_KEY` | Clerk auth secret key |
| `KV_URL` / `KV_TOKEN` | Vercel KV for credit tracking |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: AI SDK (`ai`), `@ai-sdk/openai` (Mistral-compatible)
- **State**: Zustand + Immer + Persist
- **UI**: Tailwind CSS, Radix UI, Framer Motion
- **Local AI**: `@mlc-ai/web-llm` (WebGPU inference)
- **Auth**: Clerk
- **Database**: Dexie (IndexedDB), Prisma (server)
- **Storage**: Vercel KV (credit tracking)
- **Monorepo**: Turborepo / Bun
