import type { LucideIcon } from 'lucide-react'
import { Minus, Plus } from 'lucide-react'
import type { TaskKey } from '@backend/engine/riskEngineV2'
import { TASK_TYPES } from '../questionsV2'

interface AllocationStepProps {
  allocation: Record<TaskKey, number>
  sum: number
  onChange: (key: TaskKey, delta: number) => void
}

function StepperButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-[2px] border border-ink text-ink transition-colors hover:bg-surface disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden />
    </button>
  )
}

export function AllocationStep({ allocation, sum, onChange }: AllocationStepProps) {
  const complete = sum === 100

  return (
    <div>
      <h2 className="font-heading text-xl font-medium text-ink">Из чего состоит ваша работа?</h2>
      <p className="mt-2 text-sm text-muted">Распределите 100 процентов между типами задач.</p>

      <div className="mt-5 flex flex-col gap-3">
        {TASK_TYPES.map((task) => {
          const value = allocation[task.key]
          return (
            <div key={task.key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm text-ink">{task.label}</div>
                <div className="text-[13px] text-muted">{task.hint}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StepperButton
                  icon={Minus}
                  label={`Уменьшить: ${task.label}`}
                  disabled={value === 0}
                  onClick={() => onChange(task.key, -5)}
                />
                <span className="min-w-[56px] text-center font-heading text-lg tabular-nums text-ink">
                  {value}
                </span>
                <StepperButton
                  icon={Plus}
                  label={`Увеличить: ${task.label}`}
                  disabled={complete}
                  onClick={() => onChange(task.key, 5)}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className={`mt-5 text-sm ${complete ? 'text-ink' : 'text-muted'}`}>
        Распределено {sum} из 100
      </div>
      <div className="mt-2 h-[2px] w-full bg-border">
        <div className="h-full bg-accent" style={{ width: `${Math.min(100, sum)}%` }} />
      </div>
    </div>
  )
}
