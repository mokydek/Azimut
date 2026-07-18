// Pure scoring engine. No imports from supabase or react so it stays trivially
// testable and free of side effects.

export interface Answers {
  routine: number
  communication: number
  creative: number
  physical: number
  aiuse: number
}

export type RiskCategory = 'low' | 'moderate' | 'high'
export type Direction = 'up' | 'down'

export interface BreakdownFactor {
  id: string
  label: string
  points: number
  direction: Direction
}

export interface RiskResult {
  score: number
  category: RiskCategory
  breakdown: BreakdownFactor[]
}

export interface FocusArea {
  id: string
  label: string
}

const NEUTRAL = 50

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function riskCategory(score: number): RiskCategory {
  if (score < 35) return 'low'
  if (score <= 60) return 'moderate'
  return 'high'
}

export function calculateRisk(baseRisk: number, answers: Answers): RiskResult {
  const { routine, communication, creative, physical, aiuse } = answers

  const modifier =
    0.35 * routine +
    0.25 * (100 - creative) +
    0.2 * (100 - communication) +
    0.1 * (100 - physical) +
    0.1 * (100 - aiuse)

  const raw = 0.55 * baseRisk + 0.45 * modifier
  const score = clamp(Math.round(raw), 5, 95)
  const category = riskCategory(score)

  // Signed contribution of each factor relative to a neutral answer of 50.
  // The sum of the raw contributions equals raw minus the neutral score (50).
  const rawContributions: { id: string; label: string; value: number }[] = [
    { id: 'base', label: 'Профессия', value: 0.55 * (baseRisk - NEUTRAL) },
    { id: 'routine', label: 'Повторяющиеся задачи', value: 0.45 * 0.35 * (routine - NEUTRAL) },
    {
      id: 'creative',
      label: 'Нестандартные задачи',
      value: 0.45 * 0.25 * (100 - creative - NEUTRAL),
    },
    {
      id: 'communication',
      label: 'Живое общение',
      value: 0.45 * 0.2 * (100 - communication - NEUTRAL),
    },
    { id: 'physical', label: 'Физическая среда', value: 0.45 * 0.1 * (100 - physical - NEUTRAL) },
    { id: 'aiuse', label: 'Опыт работы с ИИ', value: 0.45 * 0.1 * (100 - aiuse - NEUTRAL) },
  ]

  const breakdown: BreakdownFactor[] = rawContributions.map((factor) => {
    const points = Math.round(factor.value)
    return {
      id: factor.id,
      label: factor.label,
      points,
      direction: points >= 0 ? 'up' : 'down',
    }
  })

  return { score, category, breakdown }
}

const DURABLE_LABELS: Record<'communication' | 'creative' | 'aiuse', string> = {
  communication: 'Коммуникация и эмпатия',
  creative: 'Нестандартное мышление',
  aiuse: 'Работа с инструментами ИИ',
}

// The weakest durable areas the roadmap (phase 8) will focus on: the lowest
// scoring among communication, creative and aiuse. Always the two weakest, plus
// the third when it is also weak (at or below the neutral midpoint).
export function deriveFocusAreas(answers: Answers): FocusArea[] {
  const durable = (['communication', 'creative', 'aiuse'] as const)
    .map((id) => ({ id, value: answers[id] }))
    .sort((a, b) => a.value - b.value)

  const areas: FocusArea[] = [durable[0], durable[1]].map((item) => ({
    id: item.id,
    label: DURABLE_LABELS[item.id],
  }))

  if (durable[2].value <= NEUTRAL) {
    areas.push({ id: durable[2].id, label: DURABLE_LABELS[durable[2].id] })
  }

  return areas
}
