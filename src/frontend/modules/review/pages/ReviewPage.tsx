import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Button, Card } from '@shared/ui'
import { useDocumentTitle } from '@shared/useDocumentTitle'
import { getEntries } from '@backend/services/journalService'
import type { JournalEntryView } from '@backend/services/journalService'
import { getRoadmapWithSteps } from '@backend/services/roadmapService'
import type { RoadmapStepView } from '@backend/services/roadmapService'
import { saveReview } from '@backend/services/reviewService'
import { SelectableRow } from '@frontend/modules/assessment/components/SelectableRow'

const TOTAL_STEPS = 3
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const numberFormat = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((total, value) => total + value, 0) / values.length
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2px] border border-border p-4">
      <div className="font-heading text-[28px] font-medium tabular-nums text-ink">{value}</div>
      <div className="mt-1 text-[12px] text-muted">{label}</div>
    </div>
  )
}

function MoodDeltaTile({ label, delta }: { label: string; delta: number | null }) {
  const isZero = delta === null || Math.abs(delta) < 0.05
  const fell = (delta ?? 0) < 0
  const color = isZero ? 'text-muted' : fell ? 'text-accent' : 'text-ink'
  return (
    <div className="rounded-[2px] border border-border p-4">
      <div className={`flex items-center gap-1 font-heading text-[28px] font-medium tabular-nums ${color}`}>
        {isZero ? null : fell ? (
          <ArrowDownRight size={22} strokeWidth={1.75} aria-hidden />
        ) : (
          <ArrowUpRight size={22} strokeWidth={1.75} aria-hidden />
        )}
        {isZero ? '0' : numberFormat.format(Math.abs(delta ?? 0))}
      </div>
      <div className="mt-1 text-[12px] text-muted">{label}</div>
    </div>
  )
}

export default function ReviewPage() {
  useDocumentTitle('Обзор недели · Azimut')
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'loading' | 'error' | 'ready'>('loading')
  const [entries, setEntries] = useState<JournalEntryView[]>([])
  const [steps, setSteps] = useState<RoadmapStepView[]>([])
  const [step, setStep] = useState(0)
  const [focusStepId, setFocusStepId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setPhase('loading')
    const [entriesResult, roadmapResult] = await Promise.all([getEntries(), getRoadmapWithSteps()])
    if ('error' in entriesResult || 'error' in roadmapResult) {
      setPhase('error')
      return
    }
    setEntries(entriesResult.data)
    setSteps(roadmapResult.data?.steps ?? [])
    setPhase('ready')
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (phase === 'loading') {
    return (
      <div className="mx-auto w-full max-w-[640px]">
        <div className="h-72 animate-pulse rounded-[2px] bg-[#f0f0f0]" />
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="mx-auto max-w-[640px] rounded-[2px] border border-[#b42318] bg-white px-4 py-4">
        <p className="text-sm text-[#b42318]">Не удалось загрузить обзор</p>
        <Button variant="ghost" className="mt-2 px-0" onClick={() => void load()}>
          Попробовать снова
        </Button>
      </div>
    )
  }

  const now = Date.now()
  const since7 = now - WEEK_MS
  const since14 = now - 2 * WEEK_MS
  const thisWeek = entries.filter((entry) => new Date(entry.createdAt).getTime() >= since7)
  const prevWeek = entries.filter((entry) => {
    const time = new Date(entry.createdAt).getTime()
    return time >= since14 && time < since7
  })
  const stepsThisWeek = steps.filter(
    (item) => item.isDone && item.completedAt !== null && new Date(item.completedAt).getTime() >= since7,
  ).length
  const avgThisWeek = average(thisWeek.map((entry) => entry.mood))
  const avgPrevWeek = average(prevWeek.map((entry) => entry.mood))
  const moodDelta = avgThisWeek !== null && avgPrevWeek !== null ? avgThisWeek - avgPrevWeek : null
  const notDone = steps.filter((item) => !item.isDone)

  const isLastStep = step === TOTAL_STEPS - 1
  const canAdvance =
    step === 1 ? notDone.length === 0 || focusStepId !== null : true

  async function finish() {
    setSaving(true)
    setSaveError(null)
    const result = await saveReview(note, focusStepId)
    if ('error' in result) {
      setSaving(false)
      setSaveError(result.error)
      return
    }
    navigate('/app')
  }

  function goNext() {
    if (!isLastStep) {
      setStep((prev) => prev + 1)
      return
    }
    void finish()
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100

  return (
    <Card className="mx-auto w-full max-w-[640px]">
      <div className="text-[13px] text-muted">
        Шаг {step + 1} из {TOTAL_STEPS}
      </div>
      <div className="mt-2 h-[2px] w-full bg-border">
        <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-6">
        {step === 0 ? (
          <div>
            <h2 className="font-heading text-xl font-medium text-ink">Итоги недели</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <StatTile label="Записей за неделю" value={String(thisWeek.length)} />
              <StatTile label="Шагов плана за неделю" value={String(stepsThisWeek)} />
              <StatTile
                label="Средняя оценка"
                value={avgThisWeek === null ? '—' : numberFormat.format(avgThisWeek)}
              />
              <MoodDeltaTile label="Настроение к прошлой неделе" delta={moodDelta} />
            </div>
            {thisWeek.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                На этой неделе записей пока нет. Это нормально, начните с малого.
              </p>
            ) : null}
          </div>
        ) : step === 1 ? (
          <div>
            <h2 className="font-heading text-xl font-medium text-ink">Фокус недели</h2>
            {notDone.length > 0 ? (
              <>
                <p className="mt-2 text-sm text-muted">Выберите один шаг, на котором сосредоточитесь.</p>
                <div className="mt-4 flex max-h-[340px] flex-col gap-2 overflow-y-auto">
                  {notDone.map((item) => (
                    <SelectableRow
                      key={item.id}
                      selected={focusStepId === item.id}
                      onClick={() => setFocusStepId(item.id)}
                    >
                      {item.title}
                    </SelectableRow>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Свободных шагов плана нет. Можно пропустить этот шаг.
              </p>
            )}
          </div>
        ) : (
          <div>
            <h2 className="font-heading text-xl font-medium text-ink">Заметка</h2>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              aria-label="Заметка недели"
              placeholder="Что изменилось за неделю. Пара строк"
              className="mt-4 min-h-[100px] w-full resize-none rounded-[2px] border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink"
            />
            {saveError ? <p className="mt-3 text-[13px] text-[#b42318]">{saveError}</p> : null}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        {step > 0 ? (
          <Button
            variant="ghost"
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={saving}
          >
            Назад
          </Button>
        ) : (
          <span />
        )}
        <Button variant="accent" onClick={goNext} disabled={!canAdvance || saving}>
          {isLastStep ? (saving ? 'Сохранение' : 'Завершить обзор') : 'Далее'}
        </Button>
      </div>
    </Card>
  )
}
