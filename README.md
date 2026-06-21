# Fitness Agent AI

Client-only SPA for a fitness / health / nutrition AI coach. It talks to the
[**AI Fitness Coach API**](https://github.com/igal-abachi-dev/ai-fitness-expert-coach) (Fastify + Vercel AI SDK backend) over three endpoints:
a structured plan generator, a one-shot ask, and a streaming chat.

The app frame (collapsible sidebar shell), routing, networking seam, typed API
layer, state architecture, the **user profile** (collected once via a modal,
persisted in `localStorage` as an interim measure — see
[Planned user profiles](#planned-user-profiles)), and the **Ask / Plan** form
pages are all in place. The streaming **chat UI** is the next layer to build.

---

## Getting started

### Prerequisites

- Node.js 20+ and **npm** (see [Build tool & app shape](#build-tool--app-shape))
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
assessment is stored in `localStorage` for now and reused for API calls. Edit it
anytime from the sidebar footer. Production persistence moves server-side — see
[Planned user profiles](#planned-user-profiles).

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

See [Build tool & app shape](#build-tool--app-shape) for why we use Vite + Router
data mode instead of Next.js or the React Router framework scaffold.

---

## Build tool & app shape

This repo follows React’s [**build from scratch**](https://react.dev/learn/build-a-react-app-from-scratch)
path — Vite as the bundler, React Router as the router library, and hand-picked
tools for data fetching and UI — rather than a [**full-stack framework**](https://react.dev/learn/creating-a-react-app#full-stack-frameworks)
scaffold.

That is a deliberate fit for this product: a **client-only SPA** whose API lives in a
[separate Fastify repo on Render](https://github.com/igal-abachi-dev/ai-fitness-expert-coach).
The frontend deploys as static files on Vercel. We do not run a Node server for HTML,
RSC, or SSR in this repo.

### Scaffold we used (and still recommend)

```bash
npm create vite@latest my-app -- --template react-ts
```

Then add React Router **as a library** in [data mode](https://reactrouter.com/start/data/installation)
(`createBrowserRouter` + `RouterProvider`), not via the framework CLI.

| Layer | Choice | Role |
| ----- | ------ | ---- |
| Build / dev | **Vite** | Fast HMR, ES modules, production bundle → `dist/` |
| Routing | **React Router** (data APIs) | Route tree, lazy pages, loaders/actions, errors |
| Rendering | **SPA, SSR off** | Single `index.html`, client mounts `#root` — implicit with this setup |

Vite starts as a client-only SPA. React Router data mode adds loaders, actions,
`useFetcher`, and error boundaries **without** turning the project into a full-stack
app. There is no server entry, no streaming HTML, no React Server Components — which
matches `root-layout` safely using `document`, `localStorage`, and theme classes.

The React docs note that full-stack frameworks can opt into SSR/SSG/RSC **per route**
later; we simply do not need that here. Cross-origin API calls, SSE chat streaming,
and static hosting are simpler when the browser owns the whole UI lifecycle.

### Why not Next.js (`create-next-app`)?

```bash
# not used for this project
npx create-next-app@latest
```

Next.js App Router is React’s flagship [**full-stack framework**](https://react.dev/learn/creating-a-react-app#full-stack-frameworks)
(RSC, SSR, streaming, server actions, file-based routing). Strong choice when UI and
API share one deployment and you want server rendering.

For **this** repo it adds weight without payoff:

- API is already **Fastify on Render** — not Next Route Handlers or Server Actions.
- Deploy target is **static `dist/` on Vercel** — no Node runtime required for pages.
- Features like RSC, SSR, and middleware auth belong on the server we already have
  (or will add via Better Auth on the API), not duplicated in the frontend framework.
- SEO needs are met with static meta in `index.html` + per-route titles; we are not
  building a content site that requires SSR for crawlers.

Use Next when the app *is* the backend. Here the SPA is a thin client over a remote API.

### Why not React Router framework mode (`create-react-router`)?

```bash
# not used for this project
npx create-react-router@latest
```

The React team lists [**React Router as a full-stack framework**](https://react.dev/learn/creating-a-react-app#react-router-v7)
when paired with its official scaffold — Vite-based, but opinionated toward SSR,
loaders that run on the server, and deploy templates with a server runtime.

We want **only the router library**:

- `createBrowserRouter` + lazy route modules under `src/routes/`
- Client-side loaders that call `queryClient.ensureQueryData` (browser + TanStack Query)
- No server bundle, no hydration mismatch concerns, no framework directory conventions
  layered on top of an otherwise simple Vite SPA

Same router, fewer moving parts — data mode without the full-stack wrapper.

### Why not TanStack Start?

[TanStack Start](https://tanstack.com/start/) is an up-and-coming full-stack React
framework (SSR, server functions, Nitro). React’s docs list it under
[other frameworks](https://react.dev/learn/creating-a-react-app#other-frameworks) — still **beta**.

For routing alone, **React Router** is the mature default (widest adoption, data mode
APIs we already use, integrates cleanly with Vite as a library). TanStack Start is
compelling if you commit to the whole TanStack stack and server rendering; it is not
the right default for a static SPA talking to an external API.

### npm (not pnpm, yarn, or bun)

This repo standardizes on **npm**:

```bash
npm install
npm run dev
```

| Package manager | Why we skip it as the default |
| --------------- | ----------------------------- |
| **pnpm** | Fast and strict, but extra setup (`corepack`, isolated store) — friction on Windows/corporate machines and for contributors who only have Node + npm |
| **yarn** | Classic vs Berry split; lockfile and Plug'n'Play behavior differ from npm — unnecessary variance for a small template repo |
| **bun** | Fast runtime/installer, but not bundled with Node; toolchain differences (test runner, native deps) add “works on my machine” risk |

**npm** ships with Node, works the same on every OS, matches Vercel’s default install,
and keeps onboarding to “install Node 20+, clone, `npm install`”. No Corepack, no
alternate lockfile story. Individual devs can use pnpm locally if they want; the
documented path and CI assume npm.

---

## UI & styling

**Tailwind CSS v4** + **[shadcn/ui](https://ui.shadcn.com/docs)** on top of
**[Radix UI](https://www.radix-ui.com/primitives/docs/overview/getting-started)**
primitives. Styling lives in utility classes and theme tokens in `src/index.css`;
components live as **your source code** under `src/components/ui/`, not as an opaque
npm package.

### Why Tailwind (not MUI, Ant Design, Chakra, …)

Traditional component libraries (MUI, Ant Design, Chakra, Mantine, Blueprint, …)
ship as **closed npm packages**: you import `<Button>`, then fight the library when
you need a different look, a missing variant, or a mix of APIs from two libraries.
Overrides mean `sx` props, theme overrides, CSS specificity wars, or wrapper
components.

**Tailwind** inverts that: styling is **class names in JSX** — predictable,
greppable, and easy to change in place. Tailwind v4 integrates with Vite via
`@tailwindcss/vite`, uses CSS-first theme tokens (`@theme` in `index.css`), and
covers layout, spacing, typography, responsive breakpoints, dark mode, and states
without a separate styling system.

| Approach | Tradeoff for this project |
| -------- | ------------------------- |
| **MUI / Ant Design / Chakra** | Strong defaults, but heavy runtime/theming, harder to diverge from the library's look, bundle size, and vendor lock-in on component APIs |
| **React Aria / React Spectrum** | Excellent accessibility primitives, but you still build and style every surface yourself — no shared visual system out of the box |
| **Headless UI + hand-rolled CSS** | Flexible, but repeats work shadcn already solved (composition + Tailwind recipes) |
| **Tailwind + shadcn/ui** | Utilities for all layout/visual concerns; copied components you own; Radix handles a11y behavior |

We do **not** add SCSS modules, Panda CSS, Vanilla Extract, Styled Components, or
Emotion on top. Tailwind already gives atomic utilities, design tokens, dark mode,
and co-location of styles with markup. A second CSS-in-JS or compile-to-CSS layer
adds tooling and mental overhead without buying much here.

### Why Tailwind pairs well with AI-assisted UI work

Most LLMs and coding agents are trained heavily on **Tailwind class strings**.
Asking for “a responsive card with a muted header and primary CTA” tends to produce
working `className` output directly — no prop API to learn, no theme object to
reverse-engineer. That matters for a fitness-coach product where chat, forms, and
dashboard surfaces evolve quickly: you iterate in JSX, not across wrapper layers.

Contrast: generating correct MUI `sx`/`slotProps` or Ant Design `token` overrides
is slower and more error-prone in AI workflows. Tailwind keeps the feedback loop
**read class → tweak class**.

### shadcn/ui — open code, not a closed library

[shadcn/ui](https://ui.shadcn.com/docs) is **not** a traditional component library
you install from npm and import unchanged. From the docs:

> **This is not a component library. It is how you build your component library.**

Core ideas:

| Principle | What it means here |
| --------- | ------------------ |
| **Open code** | CLI **copies** component source into `src/components/ui/`. You see and edit every line — no black-box `node_modules` UI. |
| **Composition** | Shared patterns (`Button`, `Dialog`, `Form`) so new screens and AI-generated UI stay consistent. |
| **Distribution** | `components.json` + `npx shadcn@latest add <name>` — add only what you need. |
| **Beautiful defaults** | **radix-nova** style in this repo; tokens in `index.css`. |
| **AI-ready** | Open files are easy for humans and agents to read, extend, and regenerate consistently. |

If a button needs a new variant, you **edit** `src/components/ui/button.tsx` — you
do not wrap a package export or override with `!important`.

Upstream updates: when shadcn publishes fixes, you diff and merge into your copy
(or re-add and re-apply local edits). You trade automatic semver bumps for **full
ownership** of the UI layer — the right trade for a long-lived product template.

### Headless primitives → accessibility without reinventing behavior

shadcn/ui builds on **headless** libraries — **[Radix UI](https://www.radix-ui.com/primitives)** in this project (Base UI is supported in newer shadcn stacks).
Radix owns the hard parts:

- focus management and focus traps in dialogs/sheets
- keyboard navigation (menus, combobox, tabs)
- ARIA roles, labels, and `aria-*` wiring
- pointer vs keyboard interaction patterns
- portal layering and scroll locking

Tailwind + shadcn only **skin** those primitives. You get accessible behavior by
default and still control visuals via classes and CSS variables (`--background`,
`--primary`, … in `src/index.css`).

Do not swap Radix behavior for raw `<div onClick>` overlays — keep using the
shadcn/Radix building blocks for anything interactive (dialogs, dropdowns, tooltips,
command palette, sidebar).

### Practical layout in this repo

```
src/index.css           # Tailwind v4 + @theme tokens + .dark variables
src/components/ui/      # shadcn copies (CLI-managed, you may edit)
src/lib/utils.ts        # cn() — clsx + tailwind-merge
components.json         # shadcn CLI config (radix-nova, paths, icons)
```

Theme toggling (light / dark / system) is client state in Zustand; `root-layout`
applies the `.dark` class on `<html>`. See [State management](#state-management).

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

See [UI & styling](#ui--styling) for why we use Tailwind + open-code shadcn instead
of closed UI libraries.

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

## User profile (today)

The coach needs an assessment (age, goal, equipment, …). Collected **once** via
modal and stored in **`localStorage`** until server-side profiles land (see
[Planned user profiles](#planned-user-profiles)).

- Schema: `src/features/profile/profile.schema.ts` (Zod → `CoachPlanRequest`)
- State: `stores/slices/profile.slice.ts` (persisted via Zustand `partialize`)
- UI: `ProfileForm` + `ProfileModal` (blocking on first visit; editable from sidebar)

```tsx
import { useProfile, useOpenProfileModal } from '@/features/profile'
```

---

## Planned user profiles

Health-adjacent profile data does not belong in `localStorage`. Any XSS can read
the entire store. `sessionStorage` is not a fix — same exposure, shorter lifetime.

### Target design

```
Browser                          Server (Render API + Neon Postgres)
────────                         ────────────────────────────────────
HttpOnly Secure cookie    →      encrypted fitness profile JSON
(opaque profile / session id)    keyed by that id (Drizzle)
```

- **Browser** stores only an **HttpOnly, Secure** cookie with an opaque profile or
  session id — nothing sensitive in JS-accessible storage.
- **Server** stores the **encrypted fitness profile JSON** in Postgres.

That gives persistence without re-prompting every visit, without putting assessment
data where XSS can scrape it. This is exactly why the API scaffold includes
**Neon Postgres + Drizzle** — the profile row is the first real table, not auth
plumbing for its own sake.

### Cross-site deployment (Vercel + Render)

The frontend (`*.vercel.app`) and API (`*.onrender.com`) are **different
registrable domains**. Every SPA call to the API is **cross-site**, not a classic
same-origin BFF.

That cross-site constraint also drives **auth provider** choice: anything with a
redirect-based OAuth2 dance must round-trip back to the **API's domain**, not the
SPA's.

### Auth: Better Auth (recommended)

For a free-tier side project, a **managed auth library backed by your existing
database** is the higher-leverage path than rolling cookies by hand.

[**Better Auth**](https://better-auth.com) fits this stack:

- User / session / account tables live in the **same Neon database** via the
  [**Drizzle adapter**](https://www.better-auth.com/docs/adapters/drizzle) (actively
  maintained — native joins support landed recently).
- A `profiles` row becomes a **foreign key to `user.id`** — one database, one
  ownership model.
- Fastify integration:
  [Better Auth + Fastify](https://better-auth.com/docs/integrations/fastify).
- The [**anonymous plugin**](https://www.better-auth.com/docs/plugins/anonymous) is
  the **guest-cookie pattern** above, with a built-in **upgrade path** when the
  user signs in — no throwaway local profile to migrate later.

Sequencing: wire anonymous sessions + server-side profile storage first; add
email/OAuth providers when you need accounts.

### Auth alternatives (and why not)

| Provider | Free tier | Fit for this repo |
| -------- | --------- | ----------------- |
| [**Clerk**](https://clerk.com) | 50K MAU (Feb 2026) | Best React SPA DX (`<SignIn />`, `useUser()`), but the user record lives in **Clerk**, not Neon. Profile rows key off a Clerk id; you run **two systems** with a webhook sync seam — fights the single-database design. Worth it if shipping speed beats data ownership; here it does not. |
| **Auth0** | ~25K MAU | Heavier; Okta has a habit of tightening limits. |
| **Supabase Auth** | ~50K MAU | Built for Supabase Postgres + RLS. Bolting onto Neon + Fastify is against the grain. |


## State management

For a modern React app in 2026, the clean default is **TanStack Query for server
state + Zustand for client/UI state**. React Router owns URL and route lifecycle;
local `useState` stays for tiny component-only bits.

| State type | Use |
| ---------- | --- |
| Data from API / database | **TanStack Query** (`useQuery`, `useMutation`, cache, invalidation) |
| Loading / error / retry for API data | **TanStack Query** |
| Shareable filters, page, sort, tab | **React Router** search params |
| Route loaders, actions, fetchers | **React Router** Data Mode |
| Global UI (theme, sidebar, modals, drafts) | **Zustand** |
| Durable preferences | **Zustand** + `persist` (`partialize` whitelist only) |
| Component-only UI | **`useState` / `useReducer`** |
| Complex forms | **React Hook Form** + Zod |
| Strict finite-state workflows | **XState** (optional, feature-local only) |

TanStack Query is explicitly a **server-state** library — caching, dedupe, stale
data, retries, background refetch, mutations. After moving async/server data into
Query, the remaining global client state is usually small. Do not duplicate fetched
data into Zustand.

### Why Zustand (not Jotai, Redux Toolkit, …)

**Zustand vs Jotai**

Both are small, TypeScript-friendly client-state libraries. The architectural fork
is how they integrate with React:

| | Zustand | Jotai |
| - | ------- | ----- |
| Model | Explicit external store (`getState`, `setState`, `subscribe`) | Atomic dependency graph (`atom`, derived atoms) |
| React binding | `React.useSyncExternalStore` directly | `useReducer` + `store.sub` + `React.use` — **no** `useSyncExternalStore` |
| Tearing under concurrency | Anti-tearing guarantee from React's official external-store primitive | Relies on Jotai's own atom propagation (works well in practice, not the same guarantee) |
| Best for | Flat UI flags, feature-scoped stores, reads/writes outside React (loaders, actions) | Heavily derived/composed client state (spreadsheet-style atom graphs) |

`useSyncExternalStore` is React's hook for subscribing to external stores in a way
compatible with concurrent rendering. Zustand's vanilla store + thin React adapter
is boring, explicit, and greppable — one store with typed slices beats dozens of
scattered `fooAtom` files for team onboarding and review.

Jotai is a strong #2 when client state is mostly **derived** (atoms depending on
atoms). With TanStack Query already covering async/Suspense-heavy work, that need
is rare in this app — so we install only Zustand.

**Zustand slices vs Redux Toolkit**

Redux Toolkit is excellent for strict action history, audit replay, and large-team
conventions. Its React bindings also use `useSyncExternalStoreWithSelector` and are
React 19–safe.

But **RTK Query overlaps TanStack Query** — both solve server/cache state. If Query
already owns fetching, caching, and invalidation, Redux mostly becomes ceremony for
UI flags (`sidebarOpen`, `theme`, `selectedId`). Zustand slices give ~80–90% of the
value with far less boilerplate: no providers, no action types, no root reducer.

Use Redux Toolkit instead of Zustand only if you need centralized event architecture,
time-travel debugging across the whole app, or a normalized client-side domain graph
— not the default for React Router + TanStack Query + shadcn.

**What we skip as defaults**

- **Valtio** — proxy ergonomics (`state.theme = "dark"`) vs explicit actions; snapshot/proxy caveats.
- **Preact Signals (React)** — fine-grained reactivity but adds another model on top of React + Query + Router.
- **XState** — correct for real state machines (auth refresh, upload pipelines, multi-step wizards), not for `sidebarOpen` or table filters. Add `@xstate/react` only when a feature needs it.

### Boundaries in this repo

```
Server data     →  TanStack Query     (coach ask/plan, future lists)
Client UI       →  Zustand slices     (theme, sidebar, chat draft, profile modal)
Route data      →  React Router       (params, loaders, errors)
Shareable UI    →  URL search params  (when you add filters/pagination)
Local only      →  useState           (one-off toggles inside a component)
```

**Never overlap Query and Zustand:**

```tsx
// ❌ wrong — duplicates server state, causes sync bugs
const { data: users } = useUsersQuery()
useEffect(() => {
  useAppStore.getState().setUsers(users)
}, [users])

// ✅ Zustand holds query *inputs*; Query holds *results*
const search = useAppStore((s) => s.userSearch)
const usersQuery = useUsersQuery({ search })
```

Profile assessment lives in Zustand + `localStorage` **interim only** — it moves
server-side; see [Planned user profiles](#planned-user-profiles). Store client flags
(`sessionStatus`, `selectedTenantId`), not fetched user objects.

Loaders and actions can read/write the store via `useAppStore.getState()` (no hook)
— e.g. read filter inputs, fetch via `queryClient.ensureQueryData`. Do not
subscribe inside loaders; reactivity belongs in components.

### How we use Zustand (v5 slices)

Layout matches [Zustand's slices pattern](https://zustand.docs.pmnd.rs/learn/guides/slices-pattern):

```
src/stores/
  types.ts              # RootState = intersection of all slices
  useAppStore.ts        # combined store + atomic selector hooks
  slices/
    ui.slice.ts         # theme, sidebar
    chat-draft.slice.ts # ephemeral composer draft
    profile.slice.ts    # assessment + modal (persisted until server profiles)
```

Each slice is a `StateCreator<RootState, [], [], ThisSlice>`. The combined store
forwards `(set, get, store)` to every slice. **Middleware only on the combined
store** — not inside individual slices.

Persist uses `partialize` to whitelist durable fields only (`theme`, `profile`
today). Never persist tokens, ephemeral UI, or server-fetched data.

**Selector rules (v5-specific):**

- Select **one primitive** per hook — re-render only when that field changes.
- Actions are stable references; selecting `toggleSidebar` does not cause extra renders.
- Multi-field object selectors need **`useShallow`** — v5 removed the built-in
  equality fn; `{ a, b }` without shallow compare re-renders on every store change.
- Never `const state = useAppStore()` with no selector — subscribes to the whole store.

```tsx
// ✅ atomic
const sidebarOpen = useSidebarOpen()
const toggleSidebar = useToggleSidebar()

// ✅ multi-field
import { useShallow } from 'zustand/react/shallow'
const { openModal, closeModal } = useAppStore(
  useShallow((s) => ({ openModal: s.openModal, closeModal: s.closeModal })),
)
```

**`set` shallow-merges top-level keys only** (`Object.assign({}, state, partial)`).
Nested updates must spread manually:

```tsx
set((s) => ({ filters: { ...s.filters, sort: 'desc' } })) // ✅
set({ filters: { sort: 'desc' } })                         // ❌ wipes sibling keys
```

Use the curried form `create<RootState>()(...)` when combining slices with
middleware — required for correct TypeScript inference.

Outside React:

```tsx
useAppStore.getState().setTheme('dark')
useAppStore.subscribe((s) => s.theme, (theme) => { /* … */ }) // needs subscribeWithSelector if added
```

Default to plain immutable updates in slices; reach for **immer middleware** only
when a slice has genuinely deep nesting (editor/canvas state).

### Checklist

- ✅ Typed slices, explicit actions, small selector hooks
- ✅ `useShallow` for object/array selector results
- ✅ `partialize` for persist whitelist
- ✅ Server data in Query only
- ❌ Whole-store subscriptions
- ❌ Copying `useQuery` data into Zustand
- ❌ Persisting sensitive or ephemeral state

---

## Networking

```
component → TanStack Query hook → feature api fn → http<T>() → fetch()
```

- Typed errors: `ApiError`, `ApiTimeoutError`, `InvalidJsonError`
- Query `retry` skips 4xx; pass `signal` from `queryFn` for cancellation
- Streaming chat bypasses `http<T>()` — uses AI SDK `useChat` + SSE

Regenerate types: `npm run gen:api` (backend on `:3000`). See
[Why not a monorepo?](#why-not-a-monorepo) for the full Zod → OpenAPI → client
type pipeline and the tradeoff with a shared contract package.

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

The bigger structural issue is two repos **without a shared contract package**.
Deploy simplicity is the main reason we kept them separate; type sharing is what
a monorepo would actually buy you.

**Current pipeline (two repos):**

```
server:  Zod schemas → Fastify Swagger → OpenAPI JSON (/documentation/json)
client:  openapi-typescript (npm run gen:api) → src/lib/api/v1.d.ts
         → src/features/coach/types.ts (domain types)
form:    src/features/profile/profile.schema.ts (second Zod — synced by hand)
```

OpenAPI codegen helps — it keeps **wire types** aligned with the server — but
Zod validation rules live only on the API. The client re-derives types from the
generated `.d.ts` and maintains its own form schema; constraints, enums, and
optional fields can drift between those layers.

In a monorepo, a shared `@coach/contract` package exporting Zod schemas (e.g.
`userAssessmentSchema`, response schemas) is the more rigorous end-state:

- **Server** validates requests with it and still emits Swagger via
  `fastify-type-provider-zod`
- **Web** uses the same schema for React Hook Form + `z.infer` types
- **No drift** — one definition, not types + a second Zod copy
- Drop `openapi-typescript` and `v1.d.ts`; optionally `safeParse` plan responses
  on the client too

Some teams keep a generated-types boundary for looser coupling (client depends on
HTTP contract only, not server Zod). That pays off with separate frontend/backend
ownership at scale — less so on a solo project where you control both sides.

For a solo project, **deploy simplicity** (Vercel + Render, one repo each) is a
reasonable tradeoff. **Clean end-state if consolidated:** `@coach/contract` holds
Zod (source of truth), server imports it for validation + OpenAPI, web imports it
for forms + types. That is where a monorepo earns its setup cost — not deploy,
the contract.

---

## Planned (not yet wired)

- **Chat UI**: message list, Markdown rendering, composer, virtualization
- **Server-side profiles + auth**: Better Auth anonymous sessions, encrypted
  profile in Neon, HttpOnly cookie — see
  [Planned user profiles](#planned-user-profiles)
- **Chat persistence**: sidebar "Recent" is placeholder (no conversations API yet)
- **CI + Prettier**: add typecheck → lint → test → build gate on PRs
