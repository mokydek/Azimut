import type { AiAnalysis } from '@backend/engine/riskEngineV2'
import { supabase } from '@backend/supabaseClient'
import type { ServiceResult } from './result'

const UNAVAILABLE = 'Сервис разбора сейчас недоступен, попробуйте позже'

// Calls the serverless function that generates the personal analysis. The
// current session access token is attached as a Bearer header.
export async function requestAnalysis(assessmentId: string): Promise<ServiceResult<AiAnalysis>> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) {
    return { error: 'Сессия истекла, войдите снова' }
  }

  let response: Response
  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assessmentId }),
    })
  } catch {
    return { error: UNAVAILABLE }
  }

  if (!response.ok) {
    if (response.status === 401) {
      return { error: 'Сессия истекла, войдите снова' }
    }
    if (response.status === 422) {
      return { error: 'Диагностика пройдена по старой версии' }
    }
    // 429 or 5xx and any other failure.
    return { error: UNAVAILABLE }
  }

  const payload = (await response.json()) as { ai?: AiAnalysis }
  if (!payload.ai) {
    return { error: UNAVAILABLE }
  }
  return { data: payload.ai }
}
