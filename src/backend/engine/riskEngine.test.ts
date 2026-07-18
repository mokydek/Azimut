import { describe, expect, it } from 'vitest'
import type { Answers } from './riskEngine'
import { calculateRisk, deriveFocusAreas } from './riskEngine'

const neutral: Answers = {
  routine: 50,
  communication: 50,
  creative: 50,
  physical: 50,
  aiuse: 50,
}

describe('calculateRisk', () => {
  it('rates a highly exposed profile above 60 and marks it high', () => {
    const result = calculateRisk(85, {
      routine: 100,
      communication: 0,
      creative: 0,
      physical: 0,
      aiuse: 0,
    })
    expect(result.score).toBeGreaterThan(60)
    expect(result.category).toBe('high')
  })

  it('rates a resilient profile below 35', () => {
    const result = calculateRisk(15, {
      routine: 0,
      communication: 100,
      creative: 100,
      physical: 66,
      aiuse: 66,
    })
    expect(result.score).toBeLessThan(35)
  })

  it('never leaves the 5 to 95 range even with extreme inputs', () => {
    const maxProfile = calculateRisk(100, {
      routine: 100,
      communication: 0,
      creative: 0,
      physical: 0,
      aiuse: 0,
    })
    const minProfile = calculateRisk(0, {
      routine: 0,
      communication: 100,
      creative: 100,
      physical: 100,
      aiuse: 100,
    })
    for (const result of [maxProfile, minProfile]) {
      expect(result.score).toBeGreaterThanOrEqual(5)
      expect(result.score).toBeLessThanOrEqual(95)
    }
    expect(maxProfile.score).toBe(95)
    expect(minProfile.score).toBe(5)
  })

  it('breakdown points roughly sum toward the deviation of the score from the neutral 50', () => {
    const answers: Answers = {
      routine: 70,
      communication: 40,
      creative: 30,
      physical: 50,
      aiuse: 20,
    }
    const result = calculateRisk(60, answers)
    const sum = result.breakdown.reduce((total, factor) => total + factor.points, 0)
    // Tolerance covers rounding across the six factors.
    expect(Math.abs(sum - (result.score - 50))).toBeLessThanOrEqual(4)

    // Signs: a high base and low durable answers all push the score up.
    const byId = Object.fromEntries(result.breakdown.map((factor) => [factor.id, factor]))
    expect(byId.base.direction).toBe('up')
    expect(byId.routine.direction).toBe('up')
    expect(byId.creative.direction).toBe('up')
    expect(byId.communication.direction).toBe('up')

    // A strongly creative profile makes the creative factor pull the score down.
    const creativeResult = calculateRisk(60, { ...neutral, creative: 95 })
    const creativeFactor = creativeResult.breakdown.find((factor) => factor.id === 'creative')
    expect(creativeFactor?.direction).toBe('down')
  })
})

describe('deriveFocusAreas', () => {
  it('returns the two or three weakest durable areas as labelled ids', () => {
    const areas = deriveFocusAreas({
      routine: 50,
      communication: 20,
      creative: 30,
      physical: 50,
      aiuse: 90,
    })
    expect(areas.length).toBe(2)
    expect(areas.map((area) => area.id)).toEqual(['communication', 'creative'])
    for (const area of areas) {
      expect(typeof area.label).toBe('string')
      expect(area.label.length).toBeGreaterThan(0)
    }

    const allWeak = deriveFocusAreas({
      routine: 50,
      communication: 10,
      creative: 20,
      physical: 50,
      aiuse: 40,
    })
    expect(allWeak.length).toBe(3)
  })
})
