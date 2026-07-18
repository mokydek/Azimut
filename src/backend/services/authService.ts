import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@backend/supabaseClient'
import type { ServiceResult } from './result'

export type { ServiceResult }

interface AuthErrorLike {
  message?: string
  status?: number
}

// Map common Supabase auth errors to calm Russian messages.
function translateAuthError(error: AuthErrorLike | null): string {
  const message = (error?.message ?? '').toLowerCase()
  const status = error?.status

  if (message.includes('invalid login credentials')) {
    return 'Неверная почта или пароль'
  }
  if (
    message.includes('already registered') ||
    message.includes('already been registered') ||
    message.includes('user already exists')
  ) {
    return 'Эта почта уже зарегистрирована'
  }
  if (
    message.includes('password') &&
    (message.includes('at least') ||
      message.includes('should be') ||
      message.includes('too short') ||
      message.includes('characters'))
  ) {
    return 'Пароль должен быть не короче 8 символов'
  }
  if (
    status === 429 ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('you can only request this after')
  ) {
    return 'Слишком много попыток, подождите минуту'
  }
  return 'Что то пошло не так, попробуйте еще раз'
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<ServiceResult<Session | null>> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })
  if (error) {
    return { error: translateAuthError(error) }
  }
  return { data: data.session }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<ServiceResult<Session>> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: translateAuthError(error) }
  }
  return { data: data.session }
}

export async function signOut(): Promise<ServiceResult<null>> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    return { error: translateAuthError(error) }
  }
  return { data: null }
}

export async function getSession(): Promise<ServiceResult<Session | null>> {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    return { error: translateAuthError(error) }
  }
  return { data: data.session }
}

// Wraps supabase.auth.onAuthStateChange. Calls back with the current user (or null)
// and returns an unsubscribe handle.
export function onAuthChange(callback: (user: User | null) => void): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return {
    unsubscribe: () => {
      data.subscription.unsubscribe()
    },
  }
}
