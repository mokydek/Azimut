import { Button } from '@shared/ui'
import { useDocumentTitle } from '@shared/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('404 · Azimut')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="font-heading text-[72px] font-bold leading-none tabular-nums text-ink">404</div>
      <p className="mt-4 text-sm text-muted">Такой страницы нет</p>
      <Button to="/" variant="ghost" className="mt-6">
        На главную
      </Button>
    </div>
  )
}
