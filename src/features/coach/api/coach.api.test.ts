import { describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/api/http'

import { askCoach, generateCoachPlan } from './coach.api'

describe('coach api (http<T> + MSW)', () => {
  it('askCoach returns the parsed answer', async () => {
    const result = await askCoach({ prompt: 'How do I warm up before squats?' })

    expect(result.text).toContain('warm-up')
    expect(result.steps).toBe(1)
    expect(result.usage.outputTokens).toBe(9)
  })

  it('generateCoachPlan surfaces a 502 as a typed ApiError with the issues body', async () => {
    await expect(
      generateCoachPlan({
        age: 30,
        sex: 'male',
        heightCm: 180,
        weightKg: 80,
        primaryGoal: 'hypertrophy',
        experienceLevel: 'intermediate',
        trainingDaysPerWeek: 4,
        equipment: ['barbell'],
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 502,
    })

    const error = await generateCoachPlan({
      age: 30,
      sex: 'male',
      heightCm: 180,
      weightKg: 80,
      primaryGoal: 'hypertrophy',
      experienceLevel: 'intermediate',
      trainingDaysPerWeek: 4,
      equipment: ['barbell'],
    }).catch((err: unknown) => err)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(502)
  })
})
