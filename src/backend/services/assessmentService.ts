import type { Profession } from '@backend/types/database'
import type { Answers, BreakdownFactor } from '@backend/engine/riskEngine'
import { supabase } from '@backend/supabaseClient'
import type { ServiceResult } from './result'

export interface SaveAssessmentInput {
  professionId: number
  answers: Answers
  riskScore: number
  breakdown: BreakdownFactor[]
}

export interface LatestAssessment {
  score: number
  answers: Answers
  breakdown: BreakdownFactor[]
  professionName: string | null
  createdAt: string
}

interface LatestAssessmentRow {
  risk_score: number
  answers: Answers
  breakdown: BreakdownFactor[]
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

export async function saveAssessment(input: SaveAssessmentInput): Promise<ServiceResult<null>> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) {
    return { error: 'Нужно войти в систему' }
  }

  const { error } = await supabase.from('assessments').insert({
    user_id: userId,
    profession_id: input.professionId,
    answers: input.answers,
    risk_score: input.riskScore,
    breakdown: input.breakdown,
  })
  if (error) {
    return { error: 'Не удалось сохранить результат' }
  }
  return { data: null }
}

export async function getLatestAssessment(): Promise<ServiceResult<LatestAssessment | null>> {
  const { data, error } = await supabase
    .from('assessments')
    .select('risk_score, answers, breakdown, created_at, professions(name)')
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
      score: row.risk_score,
      answers: row.answers,
      breakdown: row.breakdown,
      professionName: professionName(row.professions),
      createdAt: row.created_at,
    },
  }
}
