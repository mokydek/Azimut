import { supabase } from '@backend/supabaseClient'
import type { ServiceResult } from './result'

export interface AssessmentSummary {
  riskScore: number
  createdAt: string
  professionName: string | null
}

export interface RoadmapSummary {
  id: string
  total: number
  completed: number
}

export interface OverviewData {
  assessment: AssessmentSummary | null
  roadmap: RoadmapSummary | null
  journalCountLast7Days: number
}

interface AssessmentRow {
  risk_score: number
  created_at: string
  profession_id: number | null
  professions: { name: string } | { name: string }[] | null
}

interface RoadmapRow {
  id: string
  roadmap_steps: { is_done: boolean }[] | null
}

function professionName(professions: AssessmentRow['professions']): string | null {
  if (!professions) return null
  if (Array.isArray(professions)) {
    return professions[0]?.name ?? null
  }
  return professions.name ?? null
}

// Loads everything the dashboard needs in one call. The three queries run in
// parallel and rely on RLS to scope rows to the current user.
export async function getOverview(): Promise<ServiceResult<OverviewData>> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [assessmentResult, roadmapResult, journalResult] = await Promise.all([
    supabase
      .from('assessments')
      .select('risk_score, created_at, profession_id, professions(name)')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('roadmaps')
      .select('id, roadmap_steps(is_done)')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since),
  ])

  if (assessmentResult.error || roadmapResult.error || journalResult.error) {
    return { error: 'Не удалось загрузить данные' }
  }

  const assessmentRow = assessmentResult.data as AssessmentRow | null
  const roadmapRow = roadmapResult.data as RoadmapRow | null

  const assessment: AssessmentSummary | null = assessmentRow
    ? {
        riskScore: assessmentRow.risk_score,
        createdAt: assessmentRow.created_at,
        professionName: professionName(assessmentRow.professions),
      }
    : null

  const roadmap: RoadmapSummary | null = roadmapRow
    ? {
        id: roadmapRow.id,
        total: roadmapRow.roadmap_steps?.length ?? 0,
        completed: roadmapRow.roadmap_steps?.filter((step) => step.is_done).length ?? 0,
      }
    : null

  return {
    data: {
      assessment,
      roadmap,
      journalCountLast7Days: journalResult.count ?? 0,
    },
  }
}
