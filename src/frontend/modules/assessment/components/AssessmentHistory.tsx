import { useEffect, useState } from 'react'
import { Badge, Card } from '@shared/ui'
import { isResultV2 } from '@backend/engine/riskEngineV2'
import { getHistory } from '@backend/services/assessmentService'
import type { AssessmentHistoryItem } from '@backend/services/assessmentService'

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function AssessmentHistory() {
  const [items, setItems] = useState<AssessmentHistoryItem[] | null>(null)

  useEffect(() => {
    let active = true
    getHistory().then((result) => {
      if (!active) return
      if ('data' in result) setItems(result.data)
    })
    return () => {
      active = false
    }
  }, [])

  if (!items || items.length < 2) {
    return null
  }

  return (
    <Card className="mx-auto mt-8 w-full max-w-[720px]">
      <h3 className="font-heading text-base font-medium text-ink">История диагностик</h3>
      <div className="mt-2 flex flex-col">
        {items.map((item, index) => {
          const readiness = isResultV2(item.breakdown) ? item.breakdown.readinessScore : null
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-4 py-3 ${
                index > 0 ? 'border-t border-border' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="text-[13px] text-muted">
                  {dateFormat.format(new Date(item.createdAt))}
                </div>
                <div className="truncate text-sm text-ink">
                  {item.professionName ?? 'Профессия не указана'}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {readiness !== null ? (
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-[0.08em] text-muted">
                      готовность
                    </div>
                    <div className="font-heading text-sm tabular-nums text-ink">{readiness}</div>
                  </div>
                ) : null}
                <div className="font-heading text-lg tabular-nums text-ink">{item.score}</div>
                {index === 0 ? <Badge variant="neutral">Текущая</Badge> : null}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
