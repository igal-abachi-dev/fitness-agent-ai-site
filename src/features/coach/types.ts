import type { paths } from '@/lib/api/v1'

/**
 * Domain types for the coach feature, derived from the generated OpenAPI file
 * (`@/lib/api/v1`). These are the single source of truth: regenerate the schema
 * (`npm run gen:api`) and any drift breaks at the call sites that use them.
 *
 * Streaming `/v1/coach/chat` is intentionally absent here — it's an SSE/UI
 * message stream consumed later via the AI SDK (`useChat`), not `http<T>()`.
 */

type PlanPost = paths['/v1/coach/plan']['post']
type AskPost = paths['/v1/coach/ask']['post']
type HealthGet = paths['/health']['get']

/** Request body for `POST /v1/coach/plan` — the full user assessment. */
export type CoachPlanRequest =
  PlanPost['requestBody']['content']['application/json']

/** 200 response: the structured, validated training + nutrition plan. */
export type CoachPlanResponse =
  PlanPost['responses']['200']['content']['application/json']

/** 502 body when the agent can't produce a domain-valid plan. */
export type CoachPlanError =
  PlanPost['responses']['502']['content']['application/json']

/** Request body for `POST /v1/coach/ask` — a prompt plus optional profile. */
export type CoachAskRequest =
  AskPost['requestBody']['content']['application/json']

/** 200 response: free-text answer plus token usage / step count. */
export type CoachAskResponse =
  AskPost['responses']['200']['content']['application/json']

/** 200 response for `GET /health`. */
export type HealthResponse =
  HealthGet['responses']['200']['content']['application/json']

/** Convenience aliases for forms/UI. */
export type UserAssessment = CoachPlanRequest
export type CoachProfile = NonNullable<CoachAskRequest['profile']>
export type PrimaryGoal = CoachPlanRequest['primaryGoal']
export type ExperienceLevel = CoachPlanRequest['experienceLevel']
export type Equipment = CoachPlanRequest['equipment'][number]
