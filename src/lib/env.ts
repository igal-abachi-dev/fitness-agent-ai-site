/**
 * Centralized, typed access to runtime env. Read every env var through this
 * module so the rest of the app never touches `import.meta.env` directly and
 * defaults live in one place.
 *
 * Reminder: only `VITE_`-prefixed vars reach the client bundle, and everything
 * here is public — keep secrets on the server.
 */
export const env = {
  /**
   * Origin/root of the REST API. Empty = same origin as the app. Endpoint paths
   * carry their own prefix (e.g. `/api/conversations`), so set this to just the
   * server origin in dev (e.g. `https://localhost:5001`). Consumed by
   * `@/lib/api/http`.
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
