# Fitness Agent AI

Client-only SPA for a fitness / health / nutrition AI coach. It talks to the
[**AI Fitness Coach API**](https://github.com/igal-abachi-dev/ai-fitness-expert-coach) (Fastify + Vercel AI SDK backend) over three endpoints:
a structured plan generator, a one-shot ask, and a streaming chat.

The app frame (collapsible sidebar shell), routing, networking seam, typed API
layer, state architecture, the **user profile** (collected once via a modal,
persisted in `localStorage`), and the **Ask / Plan** form pages are all in
place. The streaming **chat UI** is the next layer to build.

---

## Getting started

### Prerequisites

- Node.js 20+ and npm
- Backend API running locally (default `http://localhost:3000`) for `/ask`, `/plan`,
  and `/chat` — optional for UI-only work

### First-time setup

```bash
git clone <repo-url>
cd fitness-agent-ai-site
npm install
cp .env.example .env.local   # set VITE_API_BASE_URL=http://localhost:3000
npm run dev                  # → http://localhost:5173
```

On first visit the **profile modal** opens (blocking until you save). Your
assessment is stored in `localStorage` and reused for API calls. Edit it anytime
from the sidebar footer.

### Day-to-day commands

```bash
npm run dev           # dev server (unminified — fast HMR, not for Lighthouse)
npm run build         # typecheck + production build → dist/
npm run preview:prod  # build + serve prod build → http://localhost:4173
npm run test          # Vitest (MSW-mocked API)
npm run typecheck     # tsc only
npm run lint          # eslint
npm run gen:api       # regenerate OpenAPI types (backend must be on :3000)
```

| Script | URL | Use for |
| ------ | --- | ------- |
| `npm run dev` | `:5173` | Daily development |
| `npm run preview:prod` | `:4173` | Lighthouse, prod-like checks, nginx dry-run |
| `npm run build` | — | Vercel deploy artifact (`dist/`) |

### Where to start coding

| Goal | Start here |
| ---- | ---------- |
| New page / route | `src/routes/<name>.tsx` + register in `src/app/router.tsx` |
| API call + cache | `src/features/<feature>/api/` → `queries.ts` → route component |
| Client-only state | `src/stores/slices/` + selector hooks in `useAppStore.ts` |
| Reusable UI | `src/components/` or shadcn: `npx shadcn@latest add <name>` |
| Forms | React Hook Form + Zod (see `src/features/profile/`) |

Import from feature barrels (`@/features/coach`, `@/features/profile`, …) rather
than deep paths.

---

## How the app boots

Four files wire the entire SPA. Read these first when onboarding:

```
index.html          HTML shell, SEO meta, #root mount point
    ↓
src/main.tsx        React entry — providers + CSS
    ↓
src/app/router.tsx  Route tree (lazy pages, error boundary, 404)
    ↓
src/app/root-layout.tsx   Global shell — theme, title, toasts, tooltips
    ↓
src/components/layout/app-shell.tsx   Sidebar frame + ProfileModal
    ↓
src/routes/*.tsx    Page components (home, chat, ask, plan, not-found)
```

### `index.html`

- Valid HTML5 shell: `lang`, viewport, favicon
- **SEO**: `<title>`, `meta description`, `robots`, Open Graph, Twitter cards
- Loads `/src/main.tsx` as an ES module (Vite dev + build)
- Static files in `public/` (e.g. `robots.txt`, `favicon.svg`) copy to `dist/` as-is

### `src/main.tsx`

- **`QueryClientProvider` wraps `RouterProvider`** — route loaders may need the
  query client before React renders child routes
- `ReactQueryDevtools` only in dev (`import.meta.env.DEV`)
- Imports global CSS once (`@/index.css`)

### `src/app/router.tsx`

- **`createBrowserRouter`** — client-only SPA (no SSR)
- **Layering**: `RootLayout` → `AppShell` → lazy page routes
- **`errorElement`** — `RouteError` catches render/loader failures
- **`path: '*'`** — 404 inside the shell (keeps sidebar)
- Pages code-split via `lazy: () => import('@/routes/…')`

### `src/app/root-layout.tsx`

- Cross-cutting UI only: **theme** (`.dark` on `<html>`), **document title**
  (`usePageTitle`), **scroll restoration**, **toasts** (Sonner), **tooltips**
- Renders `<Outlet />` — children are `AppShell` and pages
- Safe to touch `document` / `matchMedia` (no SSR)

---

## Stack

| Concern            | Choice                                                                 |
| ------------------ | ---------------------------------------------------------------------- |
| Framework          | [React 19](https://react.dev/learn/build-a-react-app-from-scratch)   |
| Build / dev        | [Vite 8](https://vite.dev/guide/) + [TypeScript 6](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) (strict) |
| Routing            | [React Router v8](https://reactrouter.com/start/data/installation) (data mode, client-only — no SSR) |
| Server state       | [TanStack Query v5](https://tanstack.com/query/latest/docs/framework/react/overview)                 |
| Client / UI state  | [Zustand v5](https://zustand.docs.pmnd.rs/learn/guides/slices-pattern) (slices pattern)           |
| UI                 | [shadcn/ui](https://ui.shadcn.com/docs/installation#use-cli) ([Radix UI](https://www.radix-ui.com/primitives/docs/overview/getting-started)) + [Tailwind CSS v4](https://tailwindcss.com/docs/installation/using-vite) |
| Forms              | [React Hook Form](https://react-hook-form.com/get-started) + [Zod](https://zod.dev/) ([`@hookform/resolvers`](https://github.com/react-hook-form/resolvers#zod)) |
| AI / streaming     | [Vercel AI SDK](https://ai-sdk.dev/docs/ai-sdk-ui/overview) (`ai`) + [`@ai-sdk/react`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) (`useChat`) |
| Icons / toasts     | [lucide-react](https://lucide.dev/guide/installation#react) · [sonner](https://sonner.emilkowal.ski/) |
| Testing            | [Vitest](https://vitest.dev/guide/) + [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [MSW](https://mswjs.io/docs/quick-start) (jsdom) |

> `react-router` v8 uses the same data-mode API as v7 (`createBrowserRouter` +
> route objects). which is like ssr:false

---

## Routes

All pages render inside the app shell (sidebar + main pane).

| Path     | Page          | Backend endpoint        | Status                          |
| -------- | ------------- | ----------------------- | ------------------------------- |
| `/`      | Home          | —                       | landing / dev sandbox           |
| `/chat`  | Coach chat    | `POST /v1/coach/chat`   | transport wired; UI next        |
| `/ask`   | Ask the coach | `POST /v1/coach/ask`    | prompt form (RHF+Zod) + answer  |
| `/plan`  | Build a plan  | `POST /v1/coach/plan`   | generates from saved profile    |
| `*`      | 404           | —                       | not found (inside shell)        |

Sidebar uses `NavLink` with active state styling.

---

## Project structure

```
fitness-agent-ai-site/
  index.html              # HTML shell + SEO meta
  public/
    robots.txt            # crawlers (copied to dist/)
    favicon.svg
  components.json         # shadcn CLI config (radix-nova)
  vite.config.ts          # Vite + Vitest + @ alias
  tsconfig.json           # project refs + paths (for shadcn CLI on Windows)
  tsconfig.app.json       # app TS strict config + @/* paths

src/
  main.tsx                # React entry (Query → Router)
  index.css               # Tailwind v4 + theme tokens
  app/
    router.tsx            # route tree
    root-layout.tsx       # global shell (theme, title, toasts)
  components/
    layout/               # app-shell, app-sidebar
    ui/                   # shadcn primitives (CLI-managed)
    shared/               # route-error, etc.
  features/               # feature-first slices
    coach/                # /plan + /ask over http<T>()
    chat/                 # /chat SSE via AI SDK
    profile/              # assessment modal + Zod schema
  routes/                 # lazy page modules (export Component)
  hooks/                  # use-media-query, use-page-title, …
  lib/
    api/http.ts           # typed fetch seam
    api/v1.d.ts           # GENERATED OpenAPI types
    env.ts                # VITE_* access
    query-client.ts
  stores/
    useAppStore.ts        # Zustand + persist + selector hooks
    slices/               # ui, chat-draft, profile
  test/                   # Vitest setup + MSW handlers
```

### shadcn/ui (`src/components/ui/`)

**radix-nova** style. Add components:

```bash
npx shadcn@latest add <name>
```

**Windows quirk:** the CLI reads path aliases from root `tsconfig.json`. If files
land in a stray `@/components/ui/` folder, move them to `src/components/ui/`.
Both `tsconfig.json` and `tsconfig.app.json` must keep `"@/*": ["./src/*"]`.

| Group | Components |
| ----- | ---------- |
| Forms | `button`, `input`, `textarea`, `label`, `select`, `checkbox`, `switch`, `form`, `input-group` |
| Layout | `card`, `separator`, `scroll-area`, `tabs`, `collapsible` |
| Overlays | `dialog`, `dropdown-menu`, `tooltip`, `command` |
| Feedback | `alert`, `sonner`, `skeleton` |
| Display | `avatar`, `badge` |

---

## User profile

The coach needs an assessment (age, goal, equipment, …). Collected **once** via
modal, stored in **`localStorage`** (no auth / backend user yet).

- Schema: `src/features/profile/profile.schema.ts` (Zod → `CoachPlanRequest`)
- State: `stores/slices/profile.slice.ts` (persisted via Zustand `partialize`)
- UI: `ProfileForm` + `ProfileModal` (blocking on first visit; editable from sidebar)

```tsx
import { useProfile, useOpenProfileModal } from '@/features/profile'
```

---

## State boundaries

- **TanStack Query** — server state (fetch, cache, mutations). Never copy into Zustand.
- **Zustand** — client/UI state (theme, sidebar, drafts, profile). Only `theme` +
  `profile` persisted to `localStorage`.
- **React Router** — route state (params, loaders, errors).
- **URL search params** — shareable filters/pagination.
- **`useState`** — tiny local UI state.

Zustand v5: `set` shallow-merges; select primitives atomically; use `useShallow`
for object selectors.

---

## Networking

```
component → TanStack Query hook → feature api fn → http<T>() → fetch()
```

- Typed errors: `ApiError`, `ApiTimeoutError`, `InvalidJsonError`
- Query `retry` skips 4xx; pass `signal` from `queryFn` for cancellation
- Streaming chat bypasses `http<T>()` — uses AI SDK `useChat` + SSE

Regenerate types: `npm run gen:api` (backend on `:3000`).

---

## SEO & Lighthouse

### Dev vs production

**Do not run Lighthouse on `npm run dev` (`:5173`).** Dev serves unminified JS,
HMR, and source maps (~5 MB payloads, Performance ~55–62).

Use the production build:

```bash
npm run preview:prod   # → http://localhost:4173
```

Typical prod scores (desktop): **Performance ~98**, Accessibility **100**, SEO **95+**.

### What's in place

| Item | Location |
| ---- | -------- |
| Title + meta description | `index.html` |
| Open Graph + Twitter cards | `index.html` |
| `robots.txt` | `public/robots.txt` |
| Per-route tab titles | `src/hooks/use-page-title.ts` (via `root-layout`) |

### After Vercel deploy

Add when you know the production URL:

- `og:url` and `<link rel="canonical">` in `index.html`
- `og:image` + file in `public/`
- `Sitemap:` line in `robots.txt` + `public/sitemap.xml`
- Set `VITE_API_BASE_URL` to your Render API origin in Vercel env vars

HSTS / CSP / COOP headers come from the host (Vercel sets most automatically).

---

## Testing

Vitest + Testing Library + **MSW** at the `fetch` layer (real `http<T>()` runs;
responses are stubbed).

- Setup: `src/test/setup.ts`
- Handlers: `src/test/msw/{handlers,server}.ts`
- Colocated: `*.test.ts(x)`

```bash
npm run test
npm run test:watch
```

---

## Environment

Copy `.env.example` → `.env.local`. Only `VITE_*` vars reach the browser — no
secrets. All access via `@/lib/env`.

```bash
VITE_API_BASE_URL=http://localhost:3000   # API origin; paths include /v1/...
```

Empty `VITE_API_BASE_URL` = same origin (useful behind nginx reverse proxy).

### Planned deployment

| Piece | Host | Notes |
| ----- | ---- | ----- |
| Frontend | **Vercel** (GitHub) | `npm run build` → static `dist/` |
| API | **Render** | Fastify + Vercel AI SDK + Neon Postgres |
| Local prod test | nginx | Static `dist/` + proxy API to Render/local |

---

## Why not a monorepo?

This repo is the **frontend only**; the API lives in a
[separate repo](https://github.com/igal-abachi-dev/ai-fitness-expert-coach).
That split is deliberate: **Vercel for the UI, Render for the API** — each repo
maps to one host with minimal one-time config and no workspace wiring.

Deploy capability is a wash (both layouts work fine from one repo), but two repos
genuinely mean less initial setup. A monorepo is not harder to maintain — maybe
~10 minutes of one-time settings — but it is not literally zero either.

### If you ever consolidated (deploy notes)

**Render (API)** — leave Root Directory empty (repo root); build with workspace flags:

```
Root Directory:  (empty — repo root)
Build Command:   npm ci && npm run build -w apps/api
Start Command:   npm run start -w apps/api
Build Filters → Included Paths:
  apps/api/**
  packages/contract/**
  package-lock.json
```

Build filters stop a frontend-only push from rebuilding the backend. Paths are
relative to the repo root regardless of Root Directory.

**Vercel (web)** — monorepos are first-class:

```
Root Directory:  apps/web
Ignored Build Step:  npx turbo-ignore   # or git diff apps/web + packages/contract
```

Root Directory is the only required setting; Ignored Build Step is optional
(don't rebuild when only the backend changed).

So: two extra-ish settings on Render, one on Vercel. The deploy story alone is
not a reason to avoid a monorepo — but it was not zero either, and separate repos
kept day-one setup simpler.

### The real reason: shared types

The split is not really about deploy — it is about **where the contract lives**.

Today the client keeps generated OpenAPI types in `src/lib/api/v1.d.ts`
(`npm run gen:api`) because two repos cannot share source. That codegen gives
**types only**. Form validation re-implements the same rules in
`src/features/profile/profile.schema.ts` — those two can drift.

In a monorepo, a `packages/contract` exporting Zod schemas (e.g.
`userAssessmentSchema`, response schemas) is the better end-state:

- **Server** validates requests with it and still emits Swagger via
  `fastify-type-provider-zod`
- **Web** uses the same schema for React Hook Form + `z.infer` types
- **No drift** — one definition, not types + a second Zod copy
- Drop `openapi-typescript` and `v1.d.ts`; optionally `safeParse` plan responses
  on the client too

Some teams keep a generated-types boundary for looser coupling (client depends on
HTTP contract only, not server Zod). That pays off with separate frontend/backend
ownership at scale — less so on a solo project where you control both sides.

**Clean end-state if consolidated:** `packages/contract` holds Zod (source of
truth), server imports it for validation + OpenAPI, web imports it for forms +
types. That is where a monorepo earns its setup cost — not deploy, the contract.

---

## Planned (not yet wired)

- **Chat UI**: message list, Markdown rendering, composer, virtualization
- **Backend user record**: profile seeds server-side user when auth lands
- **Chat persistence**: sidebar "Recent" is placeholder (no conversations API yet)
- **CI + Prettier**: add typecheck → lint → test → build gate on PRs
