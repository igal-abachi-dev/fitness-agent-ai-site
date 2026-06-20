import { http, HttpResponse } from 'msw'

import type {
  CoachAskResponse,
  CoachPlanError,
  HealthResponse,
} from '@/features/coach'

/**
 * Default MSW handlers for tests. Paths are wildcarded on the origin so they
 * match regardless of `VITE_API_BASE_URL` (empty base → same-origin in jsdom).
 * Override per-test with `server.use(...)` for error/edge cases.
 */

const health: HealthResponse = { status: 'ok', uptime: 123 }

const askAnswer: CoachAskResponse = {
  text: 'Do a few light warm-up sets before your working sets.',
  steps: 1,
  usage: { inputTokens: 12, outputTokens: 9 },
}

const planValidationError: CoachPlanError = {
  error: 'Plan failed domain validation',
  issues: ['Training volume exceeds recovery capacity'],
}

export const handlers = [
  http.get('*/health', () => HttpResponse.json(health)),
  http.post('*/v1/coach/ask', () => HttpResponse.json(askAnswer)),
  // Plan defaults to the 502 path so tests must opt into a success body.
  http.post('*/v1/coach/plan', () =>
    HttpResponse.json(planValidationError, { status: 502 }),
  ),
]
