import type { Profession } from '@backend/types/database'
import type { AiAnalysis, AnswersV2, ResultV2 } from '@backend/engine/riskEngineV2'
import { supabase } from '@backend/supabaseClient'
import type { ServiceResult } from './result'

export interface SaveAssessmentInput {
  professionId: number
  answers: AnswersV2
  riskScore: number
  breakdown: ResultV2
}

// answers and breakdown are jsonb and may be either the v1 or v2 shape. Callers
// narrow with the version guards from the engine.
export interface LatestAssessment {
  id: string
  score: number
  answers: unknown
  breakdown: unknown
  professionName: string | null
  createdAt: string
}

interface LatestAssessmentRow {
  id: string
  risk_score: number
  answers: unknown
  breakdown: unknown
  created_at: string
  professions: { name: string } | { name: string }[] | null
}

function professionName(professions: LatestAssessmentRow['professions']): string | null {
  if (!professions) return null
  if (Array.isArray(professions)) {
    return professions[0]?.name ?? null
  }
  return professions.name ?? null
}

export async function getProfessions(): Promise<ServiceResult<Profession[]>> {
  const { data, error } = await supabase
    .from('professions')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })
  if (error) {
    return { error: 'Не удалось загрузить список профессий' }
  }
  return { data: (data as Profession[] | null) ?? [] }
}

export async function saveAssessment(
  input: SaveAssessmentInput,
): Promise<ServiceResult<{ id: string }>> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) {
    return { error: 'Нужно войти в систему' }
  }

  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      profession_id: input.professionId,
      answers: input.answers,
      risk_score: input.riskScore,
      breakdown: input.breakdown,
    })
    .select('id')
    .single()
  if (error || !data) {
    return { error: 'Не удалось сохранить результат' }
  }
  return { data: { id: (data as { id: string }).id } }
}

// Merges the AI analysis into the assessment's stored breakdown jsonb.
export async function saveAnalysis(
  assessmentId: string,
  ai: AiAnalysis,
): Promise<ServiceResult<null>> {
  const { data, error } = await supabase
    .from('assessments')
    .select('breakdown')
    .eq('id', assessmentId)
    .single()
  if (error || !data) {
    return { error: 'Не удалось сохранить разбор' }
  }

  const current = (data as { breakdown: Record<string, unknown> | null }).breakdown ?? {}
  const { error: updateError } = await supabase
    .from('assessments')
    .update({ breakdown: { ...current, ai } })
    .eq('id', assessmentId)
  if (updateError) {
    return { error: 'Не удалось сохранить разбор' }
  }
  return { data: null }
}

export async function getLatestAssessment(): Promise<ServiceResult<LatestAssessment | null>> {
  const { data, error } = await supabase
    .from('assessments')
    .select('id, risk_score, answers, breakdown, created_at, professions(name)')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    return { error: 'Не удалось загрузить оценку' }
  }
  if (!data) {
    return { data: null }
  }

  const row = data as LatestAssessmentRow
  return {
    data: {
      id: row.id,
      score: row.risk_score,
      answers: row.answers,
      breakdown: row.breakdown,
      professionName: professionName(row.professions),
      createdAt: row.created_at,
    },
  }
}

export interface AssessmentHistoryItem {
  id: string
  score: number
  breakdown: unknown
  professionName: string | null
  createdAt: string
}

interface HistoryRow {
  id: string
  risk_score: number
  breakdown: unknown
  created_at: string
  professions: { name: string } | { name: string }[] | null
}

// All of the user's assessments, newest first, with the joined profession name.
export async function getHistory(): Promise<ServiceResult<AssessmentHistoryItem[]>> {
  const { data, error } = await supabase
    .from('assessments')
    .select('id, risk_score, breakdown, created_at, professions(name)')
    .order('created_at', { ascending: false })
  if (error) {
    return { error: 'Не удалось загрузить историю' }
  }
  const rows = (data as HistoryRow[] | null) ?? []
  return {
    data: rows.map((row) => ({
      id: row.id,
      score: row.risk_score,
      breakdown: row.breakdown,
      professionName: professionName(row.professions),
      createdAt: row.created_at,
    })),
  }
}
