import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/app/root-layout'
import { AppShell } from '@/components/layout/app-shell'
import { RouteError } from '@/components/shared/route-error'

/**
 * React Router data mode (client-only SPA). Routes are plain objects; child
 * routes use `lazy` for per-route code-splitting. Each lazy module exports
 * route props (`Component`, optional `loader`, `action`, `ErrorBoundary`).
 *
 * Layering: RootLayout = global concerns (theme, scroll, toasts); AppShell =
 * the visual app frame (sidebar + main). Pages render into AppShell's outlet.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    ),
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            lazy: () => import('@/routes/home'),
          },
          {
            path: 'chat',
            lazy: () => import('@/routes/chat'),
          },
          {
            path: 'ask',
            lazy: () => import('@/routes/ask'),
          },
          {
            path: 'plan',
            lazy: () => import('@/routes/plan'),
          },
          {
            path: '*',
            lazy: () => import('@/routes/not-found'),
          },
        ],
      },
    ],
  },
])
