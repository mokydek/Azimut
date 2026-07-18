import { Button } from '@shared/ui'

interface LegacyResultsViewProps {
  score: number
  professionName: string | null
  createdAt: string
  onRetake: () => void
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

// Compact view for assessments saved before the v2 engine. The old data is not
// rendered in the v2 layout, only its score.
export function LegacyResultsView({
  score,
  professionName,
  createdAt,
  onRetake,
}: LegacyResultsViewProps) {
  return (
    <div className="mx-auto max-w-[640px]">
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-[0.08em] text-muted">
          Уровень риска автоматизации
        </div>
        <div className="mt-2 font-heading text-[72px] font-bold leading-none tabular-nums text-ink">
          {score}
        </div>
        <p className="mt-3 text-sm text-muted">
          {professionName ?? 'Профессия не указана'} · {formatDate(createdAt)}
        </p>
      </div>

      <div className="mt-6 bg-surface p-4">
        <p className="text-sm text-muted">Диагностика пройдена по старой версии.</p>
      </div>

      <div className="mt-8">
        <Button variant="accent" onClick={onRetake}>
          Пройти заново по новой методике
        </Button>
      </div>
    </div>
  )
}
