/**
 * Public surface of the coach feature. Import from `@/features/coach` rather
 * than reaching into internal files.
 */
export { useHealth, useGenerateCoachPlan, useAskCoach } from './queries'
export { getHealth, generateCoachPlan, askCoach } from './api/coach.api'
export type {
  CoachAskRequest,
  CoachAskResponse,
  CoachPlanRequest,
  CoachPlanResponse,
  CoachPlanError,
  HealthResponse,
  UserAssessment,
  CoachProfile,
  PrimaryGoal,
  ExperienceLevel,
  Equipment,
} from './types'
