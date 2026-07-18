// Pure assessment engine, version 2. Two axes: automation exposure and personal
// readiness. No imports from supabase or react.

import type { FocusArea, RiskCategory } from './riskEngine'
import { riskCategory } from './riskEngine'

export type TaskKey = 'routine' | 'social' | 'creative' | 'physical' | 'info'
export type BranchId = 'physical' | 'social' | 'cognitive'
export type QuadrantId = 'rebuild' | 'attention' | 'stable' | 'calm'

export interface ProfessionFactors {
  base_risk: number
  routine_level: number
  social_level: number
  creative_level: number
  physical_level: number
  llm_exposure: number
}

export interface AnswersV2 {
  version: 2
  allocation: Record<TaskKey, number>
  branchId: BranchId
  branch: number[]
  readiness: number[]
  context: number[]
}

export interface BlockV2 {
  id: string
  label: string
  points: number
  direction: 'up' | 'down'
}

export interface ResultV2 {
  version: 2
  exposureScore: number
  exposureMin: number
  exposureMax: number
  readinessScore: number
  category: RiskCategory
  quadrant: QuadrantId
  blocks: BlockV2[]
}

export interface QuadrantContent {
  name: string
  interpretation: string
}

export const QUADRANT_META: Record<QuadrantId, QuadrantContent> = {
  rebuild: {
    name: 'Перестройка в силе',
    interpretation:
      'Давление заметное, но у вас есть ресурсы, чтобы направить перемены в свою пользу.',
  },
  attention: {
    name: 'Зона внимания',
    interpretation:
      'Давление высокое, а запас прочности пока небольшой, поэтому стоит начать с первых шагов.',
  },
  stable: {
    name: 'Устойчивая позиция',
    interpretation:
      'Профессия меняется медленно, и вы уже готовы поддерживать преимущество дальше.',
  },
  calm: {
    name: 'Спокойная зона',
    interpretation:
      'Спешить некуда, а спокойное развитие навыков закрепит вашу устойчивость.',
  },
}

const TASK_WEIGHTS: Record<TaskKey, number> = {
  routine: 0.9,
  info: 0.75,
  creative: 0.3,
  social: 0.25,
  physical: 0.2,
}

const AXIS_THRESHOLD = 50
const NEUTRAL = 50

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((total, value) => total + value, 0) / values.length
}

// Which branch of follow up questions fits the profession's factor profile.
export function selectBranch(profession: Pick<ProfessionFactors, 'physical_level' | 'social_level'>): BranchId {
  if (profession.physical_level >= 50) return 'physical'
  if (profession.social_level >= 60) return 'social'
  return 'cognitive'
}

function quadrantFor(exposureScore: number, readinessScore: number): QuadrantId {
  const highExposure = exposureScore >= AXIS_THRESHOLD
  const highReadiness = readinessScore >= AXIS_THRESHOLD
  if (highExposure) return highReadiness ? 'rebuild' : 'attention'
  return highReadiness ? 'stable' : 'calm'
}

export function calculateAssessmentV2(
  profession: ProfessionFactors,
  answers: AnswersV2,
): ResultV2 {
  const { allocation, branch, readiness, context } = answers

  // Exposure axis.
  const taskExposureRaw =
    allocation.routine * TASK_WEIGHTS.routine +
    allocation.info * TASK_WEIGHTS.info +
    allocation.creative * TASK_WEIGHTS.creative +
    allocation.social * TASK_WEIGHTS.social +
    allocation.physical * TASK_WEIGHTS.physical
  const taskExposure = clamp(taskExposureRaw * 1.11, 0, 100)

  const branchModifier = average(branch)
  const adoption = context[0] ?? NEUTRAL

  const exposureRaw =
    0.4 * profession.base_risk + 0.3 * taskExposure + 0.2 * branchModifier + 0.1 * adoption
  const exposureScore = clamp(Math.round(exposureRaw), 5, 95)

  // Divergence between the personal allocation and the typical profession profile
  // widens the confidence range.
  const factorByKey: Record<TaskKey, number> = {
    routine: profession.routine_level,
    social: profession.social_level,
    creative: profession.creative_level,
    physical: profession.physical_level,
    info: profession.llm_exposure,
  }
  const factorTotal = (Object.keys(factorByKey) as TaskKey[]).reduce(
    (total, key) => total + factorByKey[key],
    0,
  )
  const divergence =
    factorTotal > 0
      ? (Object.keys(factorByKey) as TaskKey[]).reduce((total, key) => {
          const profilePercent = (factorByKey[key] / factorTotal) * 100
          return total + Math.abs(allocation[key] - profilePercent)
        }, 0) / 2
      : 50
  const rangeWidth = Math.min(14, 6 + Math.round(divergence / 12))
  const exposureMin = Math.max(0, exposureScore - rangeWidth)
  const exposureMax = Math.min(100, exposureScore + rangeWidth)

  // Readiness axis, independent of the exposure inputs.
  const readinessScore = clamp(
    Math.round(
      0.4 * (readiness[0] ?? NEUTRAL) +
        0.3 * (readiness[1] ?? NEUTRAL) +
        0.15 * (readiness[2] ?? NEUTRAL) +
        0.15 * (context[1] ?? NEUTRAL),
    ),
    0,
    100,
  )

  const category = riskCategory(exposureScore)
  const quadrant = quadrantFor(exposureScore, readinessScore)

  // Contributions relative to the neutral midpoint of 50, same style as v1.
  const rawBlocks: { id: string; label: string; value: number }[] = [
    { id: 'profession', label: 'Профессия', value: 0.4 * (profession.base_risk - NEUTRAL) },
    { id: 'composition', label: 'Состав работы', value: 0.3 * (taskExposure - NEUTRAL) },
    { id: 'tasks', label: 'Характер задач', value: 0.2 * (branchModifier - NEUTRAL) },
    { id: 'environment', label: 'Среда', value: 0.1 * (adoption - NEUTRAL) },
  ]
  const blocks: BlockV2[] = rawBlocks.map((block) => {
    const points = Math.round(block.value)
    return { id: block.id, label: block.label, points, direction: points >= 0 ? 'up' : 'down' }
  })

  return {
    version: 2,
    exposureScore,
    exposureMin,
    exposureMax,
    readinessScore,
    category,
    quadrant,
    blocks,
  }
}

const DURABLE_LABELS = {
  communication: 'Коммуникация и эмпатия',
  creative: 'Нестандартное мышление',
}

// Maps a v2 assessment onto the roadmap engine input the same way the v1 path does.
export function deriveFocusAreasV2(answers: AnswersV2): { focusAreas: FocusArea[]; aiuse: number } {
  const focusAreas: FocusArea[] = []

  const socialBranchAutomatable =
    answers.branchId === 'social' && average(answers.branch) >= AXIS_THRESHOLD
  if (socialBranchAutomatable || answers.allocation.social < 20) {
    focusAreas.push({ id: 'communication', label: DURABLE_LABELS.communication })
  }

  const inventQuestionLow = answers.branchId === 'cognitive' && (answers.branch[2] ?? NEUTRAL) <= 33
  if (answers.allocation.creative < 20 || inventQuestionLow) {
    focusAreas.push({ id: 'creative', label: DURABLE_LABELS.creative })
  }

  return { focusAreas, aiuse: answers.readiness[0] ?? 0 }
}

export function isAnswersV2(value: unknown): value is AnswersV2 {
  return typeof value === 'object' && value !== null && (value as { version?: unknown }).version === 2
}

export function isResultV2(value: unknown): value is ResultV2 {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    (value as { version?: unknown }).version === 2
  )
}
