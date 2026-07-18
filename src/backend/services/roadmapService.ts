import type { Answers } from '@backend/engine/riskEngine'
import { deriveFocusAreas, riskCategory } from '@backend/engine/riskEngine'
import { deriveFocusAreasV2, isAnswersV2 } from '@backend/engine/riskEngineV2'
import { generateRoadmapSteps } from '@backend/engine/roadmapEngine'
import { supabase } from '@backend/supabaseClient'
import type { ServiceResult } from './result'

export interface RoadmapStepView {
  id: string
  title: string
  description: string | null
  category: string
  orderIndex: number
  isDone: boolean
  completedAt: string | null
}

export interface RoadmapView {
  id: string
  createdAt: string
  steps: RoadmapStepView[]
}

interface RoadmapRow {
  id: string
  created_at: string
  roadmap_steps: {
    id: string
    title: string
    description: string | null
    category: string
    order_index: number
    is_done: boolean
    completed_at: string | null
  }[]
}

export async function getRoadmapWithSteps(): Promise<ServiceResult<RoadmapView | null>> {
  const { data, error } = await supabase
    .from('roadmaps')
    .select(
      'id, created_at, roadmap_steps(id, title, description, category, order_index, is_done, completed_at)',
    )
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    return { error: 'Не удалось загрузить план' }
  }
  if (!data) {
    return { data: null }
  }

  const row = data as RoadmapRow
  const steps: RoadmapStepView[] = [...row.roadmap_steps]
    .sort((a, b) => a.order_index - b.order_index)
    .map((step) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      category: step.category,
      orderIndex: step.order_index,
      isDone: step.is_done,
      completedAt: step.completed_at,
    }))

  return { data: { id: row.id, createdAt: row.created_at, steps } }
}

export async function generateRoadmap(): Promise<ServiceResult<null>> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) {
    return { error: 'Нужно войти в систему' }
  }

  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('id, risk_score, answers')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (assessmentError) {
    return { error: 'Не удалось загрузить диагностику' }
  }
  if (!assessment) {
    return { error: 'Сначала пройдите диагностику' }
  }

  const row = assessment as { id: string; risk_score: number; answers: unknown }

  // Version 2 assessments carry a different answers shape; derive the roadmap
  // input accordingly, keeping the v1 path for older assessments.
  let focusAreaIds: string[]
  let aiuse: number
  if (isAnswersV2(row.answers)) {
    const derived = deriveFocusAreasV2(row.answers)
    focusAreaIds = derived.focusAreas.map((area) => area.id)
    aiuse = derived.aiuse
  } else {
    const legacy = row.answers as Answers
    focusAreaIds = deriveFocusAreas(legacy).map((area) => area.id)
    aiuse = legacy.aiuse
  }

  const steps = generateRoadmapSteps({
    category: riskCategory(row.risk_score),
    focusAreas: focusAreaIds,
    aiuse,
  })

  // Remove any existing roadmap first; the cascade drops its steps.
  const { error: deleteError } = await supabase.from('roadmaps').delete().eq('user_id', userId)
  if (deleteError) {
    return { error: 'Не удалось пересобрать план' }
  }

  const { data: created, error: insertError } = await supabase
    .from('roadmaps')
    .insert({ user_id: userId, assessment_id: row.id })
    .select('id')
    .single()
  if (insertError || !created) {
    return { error: 'Не удалось создать план' }
  }

  const roadmapId = (created as { id: string }).id
  const { error: stepsError } = await supabase.from('roadmap_steps').insert(
    steps.map((step) => ({
      roadmap_id: roadmapId,
      title: step.title,
      description: step.description,
      category: step.category,
      order_index: step.order_index,
      is_done: false,
    })),
  )
  if (stepsError) {
    return { error: 'Не удалось сохранить шаги плана' }
  }

  return { data: null }
}

export async function toggleStep(stepId: string, isDone: boolean): Promise<ServiceResult<null>> {
  const { error } = await supabase
    .from('roadmap_steps')
    .update({ is_done: isDone, completed_at: isDone ? new Date().toISOString() : null })
    .eq('id', stepId)
  if (error) {
    return { error: 'Не удалось обновить шаг' }
  }
  return { data: null }
}
