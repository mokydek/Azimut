import { supabase } from '@backend/supabaseClient'
import type { ServiceResult } from './result'

export interface WeeklyReview {
  id: string
  note: string | null
  focusStepId: string | null
  createdAt: string
}

interface WeeklyReviewRow {
  id: string
  note: string | null
  focus_step_id: string | null
  created_at: string
}

export async function getLatestReview(): Promise<ServiceResult<WeeklyReview | null>> {
  const { data, error } = await supabase
    .from('weekly_reviews')
    .select('id, note, focus_step_id, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    return { error: 'Не удалось загрузить обзор' }
  }
  if (!data) {
    return { data: null }
  }
  const row = data as WeeklyReviewRow
  return {
    data: {
      id: row.id,
      note: row.note,
      focusStepId: row.focus_step_id,
      createdAt: row.created_at,
    },
  }
}

export async function saveReview(
  note: string,
  focusStepId: string | null,
): Promise<ServiceResult<null>> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) {
    return { error: 'Нужно войти в систему' }
  }

  const trimmed = note.trim()
  const { error } = await supabase.from('weekly_reviews').insert({
    user_id: userId,
    note: trimmed.length > 0 ? trimmed : null,
    focus_step_id: focusStepId,
  })
  if (error) {
    return { error: 'Не удалось сохранить обзор' }
  }
  return { data: null }
}
