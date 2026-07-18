import { describe, expect, it } from 'vitest'
import { computeStreak } from './streak'

// Builds an ISO timestamp for local noon `n` days before today, which keeps the
// date stable regardless of timezone.
function daysAgo(n: number): string {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - n)
  return date.toISOString()
}

describe('computeStreak', () => {
  it('counts today and yesterday as 2', () => {
    expect(computeStreak([{ createdAt: daysAgo(0) }, { createdAt: daysAgo(1) }])).toBe(2)
  })

  it('breaks the streak on a missed day', () => {
    // Entry today and three days ago, but yesterday is missing.
    expect(
      computeStreak([
        { createdAt: daysAgo(0) },
        { createdAt: daysAgo(3) },
        { createdAt: daysAgo(4) },
      ]),
    ).toBe(1)
  })

  it('counts a streak that ended yesterday as 1', () => {
    expect(computeStreak([{ createdAt: daysAgo(1) }])).toBe(1)
  })

  it('returns 0 for no entries and 0 when the last entry is older than yesterday', () => {
    expect(computeStreak([])).toBe(0)
    expect(computeStreak([{ createdAt: daysAgo(2) }])).toBe(0)
  })
})
