import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button, Card, Input } from '@shared/ui'
import { signInWithEmail, signUpWithEmail } from '@backend/services/authService'

type Mode = 'signin' | 'signup'

interface FieldErrors {
  fullName?: string
  email?: string
  password?: string
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function switchMode(next: Mode) {
    if (next === mode) return
    setMode(next)
    setFieldErrors({})
    setServerError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    const nextErrors: FieldErrors = {}

    if (mode === 'signup' && trimmedName === '') {
      nextErrors.fullName = 'Введите имя'
    }
    if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Введите корректную почту'
    }
    if (password.length < 8) {
      nextErrors.password = 'Пароль должен быть не короче 8 символов'
    }

    setFieldErrors(nextErrors)
    setServerError(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)
    const result =
      mode === 'signup'
        ? await signUpWithEmail(trimmedEmail, password, trimmedName)
        : await signInWithEmail(trimmedEmail, password)

    if ('error' in result) {
      setServerError(result.error)
      setLoading(false)
      return
    }

    navigate('/app', { replace: true })
  }

  const submitLabel = loading ? 'Подождите' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'

  function tabClass(active: boolean): string {
    const state = active ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
    return `-mb-px flex-1 border-b-2 pb-3 text-sm font-medium transition-colors ${state}`
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16">
      <Link to="/" className="mb-8 flex items-center gap-2" aria-label="Azimut">
        <Compass size={20} strokeWidth={1.75} className="text-ink" aria-hidden />
        <span className="font-heading text-lg font-bold tracking-tight text-ink">Azimut</span>
      </Link>

      <Card className="w-full max-w-[400px]">
        <div className="flex border-b border-border">
          <button
            type="button"
            className={tabClass(mode === 'signin')}
            onClick={() => switchMode('signin')}
          >
            Вход
          </button>
          <button
            type="button"
            className={tabClass(mode === 'signup')}
            onClick={() => switchMode('signup')}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          {mode === 'signup' ? (
            <Input
              label="Имя"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              error={fieldErrors.fullName}
            />
          ) : null}

          <Input
            label="Почта"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
          />

          <Input
            label="Пароль"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
          />

          {serverError ? (
            <div
              role="alert"
              className="rounded-[2px] border border-[#b42318] bg-white px-3 py-2 text-[13px] text-[#b42318]"
            >
              {serverError}
            </div>
          ) : null}

          <Button type="submit" variant="accent" className="w-full" disabled={loading}>
            {submitLabel}
          </Button>
        </form>
      </Card>
    </div>
  )
}
