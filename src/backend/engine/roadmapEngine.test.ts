import { describe, expect, it } from 'vitest'
import { generateRoadmapSteps } from './roadmapEngine'
import { roadmapTemplates } from './roadmapTemplates'

describe('generateRoadmapSteps', () => {
  it('produces more steps for a high profile with low AI use than a low profile with high AI use', () => {
    const high = generateRoadmapSteps({
      category: 'high',
      focusAreas: ['communication', 'creative'],
      aiuse: 10,
    })
    const low = generateRoadmapSteps({
      category: 'low',
      focusAreas: ['communication'],
      aiuse: 90,
    })
    expect(high.length).toBeGreaterThan(low.length)
  })

  it('assigns sequential order_index values starting from 0', () => {
    const steps = generateRoadmapSteps({
      category: 'moderate',
      focusAreas: ['creative'],
      aiuse: 40,
    })
    expect(steps.map((step) => step.order_index)).toEqual(steps.map((_, index) => index))
    expect(steps[0].order_index).toBe(0)
  })

  it('only returns categories present in the template library', () => {
    const validCategories = new Set(Object.keys(roadmapTemplates))
    const steps = generateRoadmapSteps({
      category: 'high',
      focusAreas: ['communication', 'creative', 'aiuse'],
      aiuse: 20,
    })
    for (const step of steps) {
      expect(validCategories.has(step.category)).toBe(true)
    }
  })
})
