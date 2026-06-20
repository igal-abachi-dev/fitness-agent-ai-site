import { http } from '@/lib/api/http'
import type {
  CoachAskRequest,
  CoachAskResponse,
  CoachPlanRequest,
  CoachPlanResponse,
  HealthResponse,
} from '../types'

/**
 * Coach feature API — thin, typed wrappers over the endpoints. Components never
 * call these directly; they go through the TanStack Query hooks in `queries.ts`.
 *
 *   component → useQuery/useMutation → these fns → http<T>() → fetch()
 *
 * Plan/ask drive an LLM tool-loop on the server, so they get generous timeouts
 * (the default 30s would cut off a real plan generation).
 */

/** `GET /health` — liveness probe. */
export function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return http<HealthResponse>('/health', { signal })
}

/** `POST /v1/coach/plan` — assessment → structured plan. May 502 (see CoachPlanError). */
export function generateCoachPlan(
  body: CoachPlanRequest,
): Promise<CoachPlanResponse> {
  return http<CoachPlanResponse, CoachPlanRequest>('/v1/coach/plan', {
    method: 'POST',
    body,
    timeoutMs: 120_000,
  })
}

/** `POST /v1/coach/ask` — one-shot question, optional profile context. */
export function askCoach(body: CoachAskRequest): Promise<CoachAskResponse> {
  return http<CoachAskResponse, CoachAskRequest>('/v1/coach/ask', {
    method: 'POST',
    body,
    timeoutMs: 60_000,
  })
}
