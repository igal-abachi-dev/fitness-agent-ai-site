import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/query-keys'
import { askCoach, generateCoachPlan, getHealth } from './api/coach.api'
import type {
  CoachAskRequest,
  CoachAskResponse,
  CoachPlanRequest,
  CoachPlanResponse,
  HealthResponse,
} from './types'

/**
 * TanStack Query hooks for the coach API — what components actually call.
 *
 * `/health` is a GET → `useQuery` (passes the query `signal` through so the
 * request is cancelled when the query goes inactive). `/plan` and `/ask` are
 * user-triggered generations → `useMutation` (no cache key for the result;
 * mutations don't auto-retry, which is what we want for expensive LLM calls).
 *
 * Errors surface as the typed errors from `@/lib/api/http` (`ApiError`,
 * `ApiTimeoutError`, `InvalidJsonError`); for `/plan` 502s, read the structured
 * body via `(error as ApiError).body` typed as `CoachPlanError`.
 */

type UseHealthOptions = Omit<
  UseQueryOptions<HealthResponse>,
  'queryKey' | 'queryFn'
>

export function useHealth(options?: UseHealthOptions) {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: ({ signal }) => getHealth(signal),
    ...options,
  })
}

type UseGenerateCoachPlanOptions = Omit<
  UseMutationOptions<CoachPlanResponse, Error, CoachPlanRequest>,
  'mutationFn' | 'mutationKey'
>

export function useGenerateCoachPlan(options?: UseGenerateCoachPlanOptions) {
  return useMutation({
    mutationKey: queryKeys.coach.plan(),
    mutationFn: (body: CoachPlanRequest) => generateCoachPlan(body),
    ...options,
  })
}

type UseAskCoachOptions = Omit<
  UseMutationOptions<CoachAskResponse, Error, CoachAskRequest>,
  'mutationFn' | 'mutationKey'
>

export function useAskCoach(options?: UseAskCoachOptions) {
  return useMutation({
    mutationKey: queryKeys.coach.ask(),
    mutationFn: (body: CoachAskRequest) => askCoach(body),
    ...options,
  })
}
