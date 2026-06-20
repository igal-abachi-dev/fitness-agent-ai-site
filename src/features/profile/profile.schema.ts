import { z } from 'zod'

/**
 * The user profile = the coach assessment. Stored once (localStorage) and reused
 * as the body for `/v1/coach/plan` and as optional context for `/v1/coach/ask`.
 *
 * This Zod schema is the runtime source of truth for the form. Its inferred type
 * stays assignable to the generated `CoachPlanRequest` (enum values + fields are
 * kept in sync); if the backend contract changes, regenerate and fix here.
 */

export const SEX_VALUES = ['male', 'female'] as const
export const PRIMARY_GOAL_VALUES = [
  'hypertrophy',
  'pure_strength',
  'gymnastics_skills',
  'athletic_performance',
  'fat_loss',
  'longevity_health',
] as const
export const EXPERIENCE_VALUES = ['beginner', 'intermediate', 'advanced'] as const
export const EQUIPMENT_VALUES = [
  'barbell',
  'dumbbell',
  'machine',
  'cables',
  'kettlebell',
  'bodyweight',
  'rings',
] as const

/** Human-readable labels for the enum values (used in the form + summaries). */
export const PROFILE_LABELS = {
  sex: { male: 'Male', female: 'Female' },
  primaryGoal: {
    hypertrophy: 'Hypertrophy',
    pure_strength: 'Pure strength',
    gymnastics_skills: 'Gymnastics skills',
    athletic_performance: 'Athletic performance',
    fat_loss: 'Fat loss',
    longevity_health: 'Longevity & health',
  },
  experienceLevel: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  },
  equipment: {
    barbell: 'Barbell',
    dumbbell: 'Dumbbell',
    machine: 'Machine',
    cables: 'Cables',
    kettlebell: 'Kettlebell',
    bodyweight: 'Bodyweight',
    rings: 'Rings',
  },
} as const

export const profileSchema = z.object({
  age: z
    .number({ error: 'Age is required' })
    .int('Whole number')
    .min(13, 'Must be at least 13')
    .max(100, 'Must be 100 or less'),
  sex: z.enum(SEX_VALUES, { error: 'Select your sex' }),
  heightCm: z
    .number({ error: 'Height is required' })
    .min(100, 'At least 100 cm')
    .max(250, 'At most 250 cm'),
  weightKg: z
    .number({ error: 'Weight is required' })
    .min(30, 'At least 30 kg')
    .max(250, 'At most 250 kg'),
  bodyFatPct: z
    .number()
    .min(3, 'At least 3%')
    .max(60, 'At most 60%')
    .optional(),
  primaryGoal: z.enum(PRIMARY_GOAL_VALUES, { error: 'Select a primary goal' }),
  experienceLevel: z.enum(EXPERIENCE_VALUES, {
    error: 'Select your experience level',
  }),
  trainingDaysPerWeek: z
    .number({ error: 'Required' })
    .int('Whole number')
    .min(1, 'At least 1 day')
    .max(7, 'At most 7 days'),
  equipment: z
    .array(z.enum(EQUIPMENT_VALUES))
    .min(1, 'Pick at least one'),
  limitationsOrInjuries: z.array(z.string().max(200)).max(10),
  currentDietStyle: z.string().max(100).optional(),
})

export type Profile = z.infer<typeof profileSchema>
