import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Compass } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Intentionally quiet: the fallback UI is the user facing signal.
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <div className="flex items-center gap-2">
          <Compass size={20} strokeWidth={1.75} className="text-ink" aria-hidden />
          <span className="font-heading text-lg font-bold tracking-tight text-ink">Azimut</span>
        </div>
        <h1 className="mt-6 font-heading text-xl font-medium text-ink">Что то пошло не так</h1>
        <p className="mt-2 max-w-[360px] text-sm text-muted">
          Мы не смогли отобразить страницу. Обновление обычно решает проблему.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-[2px] border border-ink bg-white px-4 text-sm font-medium text-ink transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Обновить страницу
        </button>
      </div>
    )
  }
}
