import type { Profile } from '@backend/types/database'
import { supabase } from '@backend/supabaseClient'
import type { ServiceResult } from './result'

// Reads the current user's profile row. RLS limits the result to the caller,
// so no explicit user_id filter is needed. Returns null when the row is absent.
export async function getProfile(): Promise<ServiceResult<Profile | null>> {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle()
  if (error) {
    return { error: 'Не удалось загрузить профиль' }
  }
  return { data: (data as Profile | null) ?? null }
}
