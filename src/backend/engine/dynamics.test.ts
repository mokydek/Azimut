import { describe, expect, it } from 'vitest'
import type { ResultV2 } from './riskEngineV2'
import { compareAssessments } from './dynamics'

function makeV2(exposureScore: number, readinessScore: number): ResultV2 {
  return {
    version: 2,
    exposureScore,
    exposureMin: Math.max(0, exposureScore - 6),
    exposureMax: Math.min(100, exposureScore + 6),
    readinessScore,
    category: 'moderate',
    quadrant: 'rebuild',
    blocks: [],
  }
}

describe('compareAssessments', () => {
  it('returns a negative exposure delta when exposure falls', () => {
    const delta = compareAssessments(makeV2(40, 60), makeV2(60, 50))
    expect(delta).not.toBeNull()
    expect(delta?.exposureDelta).toBeLessThan(0)
    expect(delta?.exposureDelta).toBe(-20)
    expect(delta?.readinessDelta).toBe(10)
  })

  it('returns null when the versions are mixed', () => {
    const v1Breakdown = [{ id: 'base', label: 'Профессия', points: 5, direction: 'up' as const }]
    expect(compareAssessments(makeV2(40, 60), v1Breakdown)).toBeNull()
    expect(compareAssessments(v1Breakdown, makeV2(40, 60))).toBeNull()
  })
})
