import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Badge, Button, Card } from '@shared/ui'
import type { BreakdownFactor, RiskCategory } from '@backend/engine/riskEngine'

export interface AssessmentResultView {
  score: number
  category: RiskCategory
  breakdown: BreakdownFactor[]
  professionName: string | null
  createdAt: string
}

const categoryLabels: Record<RiskCategory, string> = {
  low: 'Низкий',
  moderate: 'Умеренный',
  high: 'Высокий',
}

function formatPoints(points: number): string {
  if (points > 0) return `+${points}`
  if (points < 0) return `−${Math.abs(points)}`
  return '0'
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

interface ResultsViewProps {
  result: AssessmentResultView
  onRetake: () => void
}

export function ResultsView({ result, onRetake }: ResultsViewProps) {
  const { score, category, breakdown, professionName, createdAt } = result

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-[0.08em] text-muted">
          Уровень риска автоматизации
        </div>
        <div className="mt-2 font-heading text-[72px] font-bold leading-none tabular-nums text-ink">
          {score}
        </div>
        <div className="mt-4 flex justify-center">
          <Badge variant={category === 'low' ? 'neutral' : 'accent'}>
            {categoryLabels[category]}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-muted">
          {professionName ?? 'Профессия'} · {formatDate(createdAt)}
        </p>
        <div className="mt-5 h-1 w-full bg-surface">
          <div className="h-full bg-ink" style={{ width: `${score}%` }} />
        </div>
      </div>

      <Card className="mt-8">
        <h3 className="font-heading text-base font-medium text-ink">Что влияет на оценку</h3>
        <div className="mt-2 flex flex-col">
          {breakdown.map((factor, index) => (
            <div
              key={factor.id}
              className={`flex items-center justify-between py-3 ${
                index > 0 ? 'border-t border-border' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {factor.direction === 'up' ? (
                  <ArrowUpRight size={16} strokeWidth={1.75} className="text-ink" aria-hidden />
                ) : (
                  <ArrowDownRight size={16} strokeWidth={1.75} className="text-muted" aria-hidden />
                )}
                <span className="text-sm text-ink">{factor.label}</span>
              </div>
              <span className="font-heading text-sm tabular-nums text-ink">
                {formatPoints(factor.points)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 bg-surface p-4">
        <p className="text-sm text-muted">
          Это приблизительная модель на основе профиля профессии и ваших ответов, а не приговор.
          Устойчивые навыки меняют расклад в вашу пользу.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button to="/app/roadmap" variant="accent">
          Сформировать план адаптации
        </Button>
        <Button variant="ghost" onClick={onRetake}>
          Пройти заново
        </Button>
      </div>
    </div>
  )
}
