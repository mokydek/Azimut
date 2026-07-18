import { compareAssessments } from '@backend/engine/dynamics'
import { computeStreak } from '@backend/engine/streak'
import { supabase } from '@backend/supabaseClient'
import type { ServiceResult } from './result'

export interface AssessmentSummary {
  riskScore: number
  createdAt: string
  professionName: string | null
  // Exposure delta versus the previous assessment; only when both are v2.
  exposureDelta: number | null
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
  streak: number
  hasRecentReview: boolean
}

interface AssessmentRow {
  risk_score: number
  created_at: string
  breakdown: unknown
  professions: { name: string } | { name: string }[] | null
}

interface RoadmapRow {
  id: string
  roadmap_steps: { is_done: boolean }[] | null
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function professionName(professions: AssessmentRow['professions']): string | null {
  if (!professions) return null
  if (Array.isArray(professions)) {
    return professions[0]?.name ?? null
  }
  return professions.name ?? null
}

// Loads everything the dashboard needs in one call. Queries run in parallel and
// rely on RLS to scope rows to the current user. The weekly review query is non
// fatal so the dashboard keeps working before migration 004 is applied.
export async function getOverview(): Promise<ServiceResult<OverviewData>> {
  const since7 = new Date(Date.now() - WEEK_MS).toISOString()
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const [assessmentResult, roadmapResult, journalResult, reviewResult] = await Promise.all([
    supabase
      .from('assessments')
      .select('risk_score, created_at, breakdown, professions(name)')
      .order('created_at', { ascending: false })
      .limit(2),
    supabase
      .from('roadmaps')
      .select('id, roadmap_steps(is_done)')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('journal_entries')
      .select('created_at')
      .gte('created_at', since90)
      .order('created_at', { ascending: false }),
    supabase
      .from('weekly_reviews')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (assessmentResult.error || roadmapResult.error || journalResult.error) {
    return { error: 'Не удалось загрузить данные' }
  }

  const assessmentRows = (assessmentResult.data as AssessmentRow[] | null) ?? []
  const latest = assessmentRows[0] ?? null
  const previous = assessmentRows[1] ?? null

  const assessment: AssessmentSummary | null = latest
    ? {
        riskScore: latest.risk_score,
        createdAt: latest.created_at,
        professionName: professionName(latest.professions),
        exposureDelta: previous
          ? (compareAssessments(latest.breakdown, previous.breakdown)?.exposureDelta ?? null)
          : null,
      }
    : null

  const roadmapRow = roadmapResult.data as RoadmapRow | null
  const roadmap: RoadmapSummary | null = roadmapRow
    ? {
        id: roadmapRow.id,
        total: roadmapRow.roadmap_steps?.length ?? 0,
        completed: roadmapRow.roadmap_steps?.filter((step) => step.is_done).length ?? 0,
      }
    : null

  const journalRows = (journalResult.data as { created_at: string }[] | null) ?? []
  const entries = journalRows.map((row) => ({ createdAt: row.created_at }))
  const journalCountLast7Days = entries.filter((entry) => entry.createdAt >= since7).length
  const streak = computeStreak(entries)

  // A missing weekly_reviews table (before 004) surfaces as an error here; treat
  // it as no recent review rather than failing the whole dashboard.
  const reviewRow =
    !reviewResult.error && reviewResult.data
      ? (reviewResult.data as { created_at: string })
      : null
  const hasRecentReview =
    reviewRow !== null && Date.now() - new Date(reviewRow.created_at).getTime() < WEEK_MS

  return {
    data: {
      assessment,
      roadmap,
      journalCountLast7Days,
      streak,
      hasRecentReview,
    },
  }
}
