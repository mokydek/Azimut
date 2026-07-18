import { describe, expect, it } from 'vitest'
import type { AnswersV2, ProfessionFactors } from './riskEngineV2'
import { calculateAssessmentV2 } from './riskEngineV2'

function makeProfession(overrides: Partial<ProfessionFactors> = {}): ProfessionFactors {
  return {
    base_risk: 50,
    routine_level: 50,
    social_level: 50,
    creative_level: 50,
    physical_level: 50,
    llm_exposure: 50,
    ...overrides,
  }
}

function makeAnswers(overrides: Partial<AnswersV2> = {}): AnswersV2 {
  return {
    version: 2,
    allocation: { routine: 20, social: 20, creative: 20, physical: 20, info: 20 },
    branchId: 'cognitive',
    branch: [50, 50, 50],
    readiness: [50, 50, 50],
    context: [50, 50],
    ...overrides,
  }
}

describe('calculateAssessmentV2', () => {
  it('rates fully routine work on a high risk profession above 60', () => {
    const result = calculateAssessmentV2(
      makeProfession({ base_risk: 90, routine_level: 95, llm_exposure: 90 }),
      makeAnswers({ allocation: { routine: 100, social: 0, creative: 0, physical: 0, info: 0 } }),
    )
    expect(result.exposureScore).toBeGreaterThan(60)
  })

  it('is deterministic: identical inputs give identical results', () => {
    const profession = makeProfession({ base_risk: 60 })
    const answers = makeAnswers({
      allocation: { routine: 40, social: 10, creative: 10, physical: 10, info: 30 },
    })
    expect(calculateAssessmentV2(profession, answers)).toEqual(
      calculateAssessmentV2(profession, answers),
    )
  })

  it('widens the range when the allocation diverges from the profession profile', () => {
    const profession = makeProfession({
      base_risk: 70,
      routine_level: 80,
      social_level: 10,
      creative_level: 10,
      physical_level: 0,
      llm_exposure: 60,
    })
    const matching = calculateAssessmentV2(
      profession,
      makeAnswers({ allocation: { routine: 50, social: 6, creative: 6, physical: 0, info: 38 } }),
    )
    const diverging = calculateAssessmentV2(
      profession,
      makeAnswers({ allocation: { routine: 0, social: 0, creative: 0, physical: 100, info: 0 } }),
    )
    expect(diverging.exposureMax - diverging.exposureMin).toBeGreaterThan(
      matching.exposureMax - matching.exposureMin,
    )
  })

  it('keeps readiness independent of the exposure inputs', () => {
    const readiness = [80, 60, 40]
    const a1 = makeAnswers({
      allocation: { routine: 100, social: 0, creative: 0, physical: 0, info: 0 },
      branch: [100, 100, 100],
      readiness,
      context: [100, 70],
    })
    const a2 = makeAnswers({
      allocation: { routine: 0, social: 0, creative: 0, physical: 100, info: 0 },
      branch: [0, 0, 0],
      readiness,
      context: [0, 70],
    })
    const r1 = calculateAssessmentV2(makeProfession({ base_risk: 90 }), a1)
    const r2 = calculateAssessmentV2(makeProfession({ base_risk: 10 }), a2)
    expect(r1.readinessScore).toBe(r2.readinessScore)
  })

  it('can reach every quadrant', () => {
    const highExposure = makeProfession({ base_risk: 95 })
    const lowExposure = makeProfession({ base_risk: 5 })
    const allocRoutine = { routine: 100, social: 0, creative: 0, physical: 0, info: 0 }
    const allocCreative = { routine: 0, social: 0, creative: 100, physical: 0, info: 0 }

    const rebuild = calculateAssessmentV2(
      highExposure,
      makeAnswers({
        allocation: allocRoutine,
        branch: [100, 100, 100],
        readiness: [100, 100, 100],
        context: [100, 100],
      }),
    )
    const attention = calculateAssessmentV2(
      highExposure,
      makeAnswers({
        allocation: allocRoutine,
        branch: [100, 100, 100],
        readiness: [0, 0, 0],
        context: [100, 0],
      }),
    )
    const stable = calculateAssessmentV2(
      lowExposure,
      makeAnswers({
        allocation: allocCreative,
        branch: [0, 0, 0],
        readiness: [100, 100, 100],
        context: [0, 100],
      }),
    )
    const calm = calculateAssessmentV2(
      lowExposure,
      makeAnswers({
        allocation: allocCreative,
        branch: [0, 0, 0],
        readiness: [0, 0, 0],
        context: [0, 0],
      }),
    )

    expect(rebuild.quadrant).toBe('rebuild')
    expect(attention.quadrant).toBe('attention')
    expect(stable.quadrant).toBe('stable')
    expect(calm.quadrant).toBe('calm')
    expect(new Set([rebuild, attention, stable, calm].map((r) => r.quadrant)).size).toBe(4)
  })
})
