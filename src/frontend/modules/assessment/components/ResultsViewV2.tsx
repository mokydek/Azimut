import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { Badge, Button, Card } from '@shared/ui'
import type { AiAnalysis, QuadrantId, ResultV2 } from '@backend/engine/riskEngineV2'
import { QUADRANT_META } from '@backend/engine/riskEngineV2'
import type { RiskCategory } from '@backend/engine/riskEngine'
import { requestAnalysis } from '@backend/services/aiService'
import { saveAnalysis } from '@backend/services/assessmentService'

const categoryLabels: Record<RiskCategory, string> = {
  low: 'Низкий',
  moderate: 'Умеренный',
  high: 'Высокий',
}

// Grid order: columns are readiness (low left, high right), rows are exposure
// (high top, low bottom).
const QUADRANT_GRID: QuadrantId[] = ['attention', 'rebuild', 'calm', 'stable']

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

interface ResultsViewV2Props {
  assessmentId: string
  result: ResultV2
  professionName: string | null
  createdAt: string
  onRetake: () => void
}

function PersonalAnalysisCard({
  assessmentId,
  initialAi,
}: {
  assessmentId: string
  initialAi?: AiAnalysis
}) {
  const [ai, setAi] = useState<AiAnalysis | null>(initialAi ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRequest() {
    setLoading(true)
    setError(null)
    const result = await requestAnalysis(assessmentId)
    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }
    await saveAnalysis(assessmentId, result.data)
    setAi(result.data)
    setLoading(false)
  }

  return (
    <Card className="mt-6">
      <div className="flex items-center gap-2">
        <Sparkles size={18} strokeWidth={1.75} className="text-ink" aria-hidden />
        <h3 className="font-heading text-base font-medium text-ink">Персональный разбор</h3>
      </div>

      {ai ? (
        <div className="mt-4">
          {ai.analysis.split(/\n\n+/).map((paragraph, index) => (
            <p
              key={index}
              className={`text-[15px] leading-[1.6] text-ink ${index > 0 ? 'mt-3' : ''}`}
            >
              {paragraph}
            </p>
          ))}

          <div className="mt-6 flex flex-col">
            {ai.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className={`flex gap-4 py-3 ${index > 0 ? 'border-t border-border' : ''}`}
              >
                <span className="font-heading text-lg tabular-nums text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-ink">{recommendation}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-surface p-4">
            <p className="text-sm text-ink">{ai.reframe}</p>
          </div>
        </div>
      ) : loading ? (
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="h-4 w-full animate-pulse rounded-[2px] bg-[#f0f0f0]" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-4">
          <p className="text-[13px] text-[#b42318]">{error}</p>
          <Button variant="ghost" className="mt-2 px-0" onClick={() => void handleRequest()}>
            Попробовать снова
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-muted">
            Разбор пишет ИИ на основе ваших ответов. Это занимает около половины минуты.
          </p>
          <Button variant="accent" className="mt-4" onClick={() => void handleRequest()}>
            Получить разбор
          </Button>
        </div>
      )}
    </Card>
  )
}

export function ResultsViewV2({
  assessmentId,
  result,
  professionName,
  createdAt,
  onRetake,
}: ResultsViewV2Props) {
  const { exposureScore, exposureMin, exposureMax, readinessScore, category, quadrant, blocks } =
    result

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-[0.08em] text-muted">
          Давление автоматизации
        </div>
        <div className="mt-2 font-heading text-[72px] font-bold leading-none tabular-nums text-ink">
          {exposureScore}
        </div>
        <div className="mt-2 text-sm text-muted">
          от {exposureMin} до {exposureMax}
        </div>
        <div className="mt-4 flex justify-center">
          <Badge variant={category === 'low' ? 'neutral' : 'accent'}>
            {categoryLabels[category]}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-muted">
          {professionName ?? 'Профессия не указана'} · {formatDate(createdAt)}
        </p>
        <div className="relative mt-5 h-1 w-full bg-surface">
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${exposureMin}%`,
              width: `${exposureMax - exposureMin}%`,
              backgroundColor: 'rgba(0, 47, 167, 0.4)',
            }}
          />
          <div
            className="absolute top-0 h-full w-[2px] bg-ink"
            style={{ left: `${exposureScore}%` }}
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <div className="grid grid-cols-2 gap-2">
            {QUADRANT_GRID.map((id) => {
              const active = id === quadrant
              return (
                <div
                  key={id}
                  className={`rounded-[2px] border p-3 text-[12px] ${
                    active ? 'border-accent bg-surface text-ink' : 'border-border text-muted'
                  }`}
                >
                  {QUADRANT_META[id].name}
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-sm text-muted">{QUADRANT_META[quadrant].interpretation}</p>
        </Card>

        <Card>
          <h3 className="font-heading text-base font-medium text-ink">Готовность</h3>
          <div className="mt-2 font-heading text-[40px] font-bold leading-none tabular-nums text-ink">
            {readinessScore}
          </div>
          <div className="mt-4 h-1 w-full bg-surface">
            <div className="h-full bg-accent" style={{ width: `${readinessScore}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted">Эта ось полностью в ваших руках.</p>
        </Card>
      </div>

      <PersonalAnalysisCard assessmentId={assessmentId} initialAi={result.ai} />

      <Card className="mt-6">
        <h3 className="font-heading text-base font-medium text-ink">Что влияет на оценку</h3>
        <div className="mt-2 flex flex-col">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={`flex items-center justify-between py-3 ${
                index > 0 ? 'border-t border-border' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {block.direction === 'up' ? (
                  <ArrowUpRight size={16} strokeWidth={1.75} className="text-ink" aria-hidden />
                ) : (
                  <ArrowDownRight size={16} strokeWidth={1.75} className="text-muted" aria-hidden />
                )}
                <span className="text-sm text-ink">{block.label}</span>
              </div>
              <span className="font-heading text-sm tabular-nums text-ink">
                {formatPoints(block.points)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 bg-surface p-4">
        <p className="text-sm text-muted">
          Это приблизительная модель на основе профиля профессии и ваших ответов, а не приговор.
          Ширина диапазона показывает, насколько ваш личный профиль отличается от типичного профиля
          профессии. Устойчивые навыки меняют расклад в вашу пользу.
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
