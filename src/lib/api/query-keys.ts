/**
 * Central TanStack Query key factory. Every query/mutation key comes from here
 * so loaders (`queryClient.ensureQueryData`) and components (`useQuery`) share
 * the exact same key, and invalidations stay consistent.
 *
 * Keys are `as const` tuples — keep them serializable and hierarchical so
 * partial invalidation (e.g. everything under `coach`) works.
 */
export const queryKeys = {
  /** `GET /health` */
  health: () => ['health'] as const,

  /**
   * Coach endpoints are POSTs that generate output, so these are used as
   * `mutationKey`s (handy for devtools and `useMutationState`), not queries.
   */
  coach: {
    plan: () => ['coach', 'plan'] as const,
    ask: () => ['coach', 'ask'] as const,
    chat: () => ['coach', 'chat'] as const,
  },
} as const
