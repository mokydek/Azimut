import { supabase } from '@backend/supabaseClient'
import type { ServiceResult } from './result'

export interface JournalEntryView {
  id: string
  mood: number
  body: string | null
  createdAt: string
}

interface JournalRow {
  id: string
  mood: number
  body: string | null
  created_at: string
}

function toView(row: JournalRow): JournalEntryView {
  return { id: row.id, mood: row.mood, body: row.body, createdAt: row.created_at }
}

export async function addEntry(mood: number, body: string): Promise<ServiceResult<JournalEntryView>> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) {
    return { error: 'Нужно войти в систему' }
  }

  const trimmed = body.trim()
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({ user_id: userId, mood, body: trimmed.length > 0 ? trimmed : null })
    .select('id, mood, body, created_at')
    .single()
  if (error || !data) {
    return { error: 'Не удалось сохранить запись' }
  }
  return { data: toView(data as JournalRow) }
}

export async function getEntries(): Promise<ServiceResult<JournalEntryView[]>> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('id, mood, body, created_at')
    .order('created_at', { ascending: false })
    .limit(60)
  if (error) {
    return { error: 'Не удалось загрузить записи' }
  }
  return { data: ((data as JournalRow[] | null) ?? []).map(toView) }
}

export async function deleteEntry(id: string): Promise<ServiceResult<null>> {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id)
  if (error) {
    return { error: 'Не удалось удалить запись' }
  }
  return { data: null }
}
