import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api/http'

/**
 * Module-singleton QueryClient.
 *
 * It lives outside React so route loaders/actions (which run before render in
 * React Router data mode) can prefetch via `queryClient.ensureQueryData(...)`
 * against the exact same cache the components read with `useQuery`.
 *
 * Retry policy is driven by the typed errors from `@/lib/api/http`: 4xx are
 * caller errors (never retry); timeouts, 5xx, and network failures retry twice
 * with exponential backoff.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false
        }
        return failureCount < 2
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
    mutations: {
      // Never auto-retry mutations — the server-side effect may already be done.
      retry: false,
    },
  },
})
