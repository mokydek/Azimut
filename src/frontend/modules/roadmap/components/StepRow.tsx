import { Check } from 'lucide-react'
import type { RoadmapStepView } from '@backend/services/roadmapService'

interface StepRowProps {
  step: RoadmapStepView
  onToggle: (step: RoadmapStepView) => void
}

export function StepRow({ step, onToggle }: StepRowProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(step)}
      aria-pressed={step.isDone}
      className="flex w-full items-start gap-3 py-3 text-left"
    >
      <span
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border ${
          step.isDone ? 'border-accent bg-accent' : 'border-ink bg-white'
        }`}
      >
        {step.isDone ? (
          <Check size={14} strokeWidth={2} className="text-white" aria-hidden />
        ) : null}
      </span>
      <span className="flex flex-col">
        <span
          className={`text-[15px] font-medium ${step.isDone ? 'text-muted' : 'text-ink'}`}
        >
          {step.title}
        </span>
        {step.description ? (
          <span className="mt-0.5 text-[13px] text-muted">{step.description}</span>
        ) : null}
      </span>
    </button>
  )
}
