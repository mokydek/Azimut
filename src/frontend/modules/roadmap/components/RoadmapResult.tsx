import { useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { Button } from '@shared/ui'
import { categoryLabels } from '@backend/engine/roadmapTemplates'
import type { TemplateCategory } from '@backend/engine/roadmapTemplates'
import { generateRoadmap, toggleStep } from '@backend/services/roadmapService'
import type { RoadmapStepView, RoadmapView } from '@backend/services/roadmapService'
import { StepRow } from './StepRow'

interface RoadmapResultProps {
  roadmap: RoadmapView
  hasNewerAssessment: boolean
  onRegenerated: () => void
}

interface StepGroup {
  category: string
  label: string
  steps: RoadmapStepView[]
}

function groupSteps(steps: RoadmapStepView[]): StepGroup[] {
  const groups: StepGroup[] = []
  for (const step of steps) {
    const last = groups[groups.length - 1]
    if (last && last.category === step.category) {
      last.steps.push(step)
    } else {
      groups.push({
        category: step.category,
        label: categoryLabels[step.category as TemplateCategory] ?? step.category,
        steps: [step],
      })
    }
  }
  return groups
}

export function RoadmapResult({ roadmap, hasNewerAssessment, onRegenerated }: RoadmapResultProps) {
  const [steps, setSteps] = useState<RoadmapStepView[]>(roadmap.steps)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [regenOpen, setRegenOpen] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [regenError, setRegenError] = useState<string | null>(null)

  const total = steps.length
  const completed = steps.filter((step) => step.isDone).length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  const allComplete = total > 0 && completed === total
  const groups = groupSteps(steps)

  async function handleToggle(step: RoadmapStepView) {
    const next = !step.isDone
    setToggleError(null)
    setSteps((prev) => prev.map((item) => (item.id === step.id ? { ...item, isDone: next } : item)))

    const result = await toggleStep(step.id, next)
    if ('error' in result) {
      setSteps((prev) =>
        prev.map((item) => (item.id === step.id ? { ...item, isDone: !next } : item)),
      )
      setToggleError(result.error)
    }
  }

  async function handleRegenerate() {
    setRegenerating(true)
    setRegenError(null)
    const result = await generateRoadmap()
    if ('error' in result) {
      setRegenerating(false)
      setRegenError(result.error)
      return
    }
    onRegenerated()
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-[28px] font-medium tracking-tight text-ink">
          Ваш план адаптации
        </h1>
        <div className="shrink-0 font-heading text-lg tabular-nums text-ink">
          {completed} из {total}
        </div>
      </div>
      <div className="mt-3 h-[2px] w-full bg-surface">
        <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
      </div>

      {allComplete ? (
        <div className="mt-6 flex items-start gap-3 bg-surface p-4">
          <CircleCheck size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink" aria-hidden />
          <p className="text-sm text-ink">
            План выполнен. Пересмотрите его через месяц или пройдите диагностику заново
          </p>
        </div>
      ) : null}

      {hasNewerAssessment ? (
        <div className="mt-6 rounded-[2px] border border-border p-4">
          {regenOpen ? (
            <div>
              <p className="text-sm text-ink">Текущий прогресс будет сброшен</p>
              {regenError ? (
                <p className="mt-2 text-[13px] text-[#b42318]">{regenError}</p>
              ) : null}
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRegenOpen(false)
                    setRegenError(null)
                  }}
                  disabled={regenerating}
                >
                  Отмена
                </Button>
                <Button variant="accent" onClick={() => void handleRegenerate()} disabled={regenerating}>
                  {regenerating ? 'Пересобираем' : 'Пересобрать'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink">Есть новая диагностика</p>
              <Button variant="outline" size="sm" onClick={() => setRegenOpen(true)}>
                Пересобрать план
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {toggleError ? (
        <p className="mt-6 text-[13px] text-[#b42318]">{toggleError}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.category}>
            <div className="text-[12px] uppercase tracking-[0.08em] text-muted">{group.label}</div>
            <div className="mt-1">
              {group.steps.map((step, index) => (
                <div key={step.id} className={index > 0 ? 'border-t border-border' : ''}>
                  <StepRow step={step} onToggle={handleToggle} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
