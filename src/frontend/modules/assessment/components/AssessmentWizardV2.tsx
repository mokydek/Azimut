import { useState } from 'react'
import { Button, Card } from '@shared/ui'
import type { Profession } from '@backend/types/database'
import type { AnswersV2, ResultV2, TaskKey } from '@backend/engine/riskEngineV2'
import { calculateAssessmentV2, selectBranch } from '@backend/engine/riskEngineV2'
import { saveAssessment } from '@backend/services/assessmentService'
import {
  BRANCHES,
  CONTEXT_QUESTIONS,
  READINESS_QUESTIONS,
  TASK_TYPES,
} from '../questionsV2'
import type { QuestionV2 } from '../questionsV2'
import { SelectableRow } from './SelectableRow'
import { ProfessionPicker } from './ProfessionPicker'
import { AllocationStep } from './AllocationStep'

const TOTAL_STEPS = 10

const emptyAllocation: Record<TaskKey, number> = {
  routine: 0,
  social: 0,
  creative: 0,
  physical: 0,
  info: 0,
}

interface WizardState {
  step: number
  professionId: number | null
  search: string
  allocation: Record<TaskKey, number>
  branch: (number | null)[]
  readiness: (number | null)[]
  context: (number | null)[]
  saving: boolean
  saveError: string | null
}

export interface WizardCompletePayload {
  assessmentId: string
  result: ResultV2
  professionName: string
  createdAt: string
}

interface AssessmentWizardV2Props {
  professions: Profession[]
  onComplete: (payload: WizardCompletePayload) => void
}

function blockLabel(step: number): string | null {
  if (step === 1) return 'Состав работы'
  if (step >= 2 && step <= 4) return 'Характер задач'
  if (step >= 5 && step <= 7) return 'Готовность'
  if (step >= 8 && step <= 9) return 'Среда'
  return null
}

export function AssessmentWizardV2({ professions, onComplete }: AssessmentWizardV2Props) {
  const [state, setState] = useState<WizardState>({
    step: 0,
    professionId: null,
    search: '',
    allocation: { ...emptyAllocation },
    branch: [null, null, null],
    readiness: [null, null, null],
    context: [null, null],
    saving: false,
    saveError: null,
  })

  const { step, professionId, search, allocation, branch, readiness, context, saving, saveError } =
    state

  const profession = professions.find((item) => item.id === professionId) ?? null
  const branchId = profession ? selectBranch(profession) : 'cognitive'
  const allocationSum = TASK_TYPES.reduce((total, task) => total + allocation[task.key], 0)
  const isLastStep = step === TOTAL_STEPS - 1

  const activeQuestion = questionForStep()

  function questionForStep(): { question: QuestionV2; value: number | null; index: number } | null {
    if (step >= 2 && step <= 4) {
      const index = step - 2
      return { question: BRANCHES[branchId][index], value: branch[index], index }
    }
    if (step >= 5 && step <= 7) {
      const index = step - 5
      return { question: READINESS_QUESTIONS[index], value: readiness[index], index }
    }
    if (step >= 8 && step <= 9) {
      const index = step - 8
      return { question: CONTEXT_QUESTIONS[index], value: context[index], index }
    }
    return null
  }

  const hasSelection =
    step === 0
      ? professionId !== null
      : step === 1
        ? allocationSum === 100
        : activeQuestion
          ? activeQuestion.value !== null
          : false

  function selectProfession(id: number) {
    setState((prev) => ({
      ...prev,
      professionId: id,
      // A different profession may use a different branch, so reset its answers.
      branch: id === prev.professionId ? prev.branch : [null, null, null],
    }))
  }

  function changeAllocation(key: TaskKey, delta: number) {
    setState((prev) => {
      const current = prev.allocation[key]
      const next = current + delta
      if (next < 0) return prev
      const total = TASK_TYPES.reduce((sum, task) => sum + prev.allocation[task.key], 0)
      if (delta > 0 && total + delta > 100) return prev
      return { ...prev, allocation: { ...prev.allocation, [key]: next } }
    })
  }

  function answerQuestion(value: number) {
    setState((prev) => {
      if (step >= 2 && step <= 4) {
        const branchAnswers = [...prev.branch]
        branchAnswers[step - 2] = value
        return { ...prev, branch: branchAnswers }
      }
      if (step >= 5 && step <= 7) {
        const readinessAnswers = [...prev.readiness]
        readinessAnswers[step - 5] = value
        return { ...prev, readiness: readinessAnswers }
      }
      const contextAnswers = [...prev.context]
      contextAnswers[step - 8] = value
      return { ...prev, context: contextAnswers }
    })
  }

  function goBack() {
    setState((prev) => ({ ...prev, step: Math.max(0, prev.step - 1), saveError: null }))
  }

  async function finish() {
    if (!profession) return
    const answers: AnswersV2 = {
      version: 2,
      allocation,
      branchId: selectBranch(profession),
      branch: branch.map((value) => value ?? 0),
      readiness: readiness.map((value) => value ?? 0),
      context: context.map((value) => value ?? 0),
    }
    const result = calculateAssessmentV2(profession, answers)

    setState((prev) => ({ ...prev, saving: true, saveError: null }))
    const saved = await saveAssessment({
      professionId: profession.id,
      answers,
      riskScore: result.exposureScore,
      breakdown: result,
    })
    if ('error' in saved) {
      setState((prev) => ({ ...prev, saving: false, saveError: saved.error }))
      return
    }

    onComplete({
      assessmentId: saved.data.id,
      result,
      professionName: profession.name,
      createdAt: new Date().toISOString(),
    })
  }

  function goNext() {
    if (!isLastStep) {
      setState((prev) => ({ ...prev, step: prev.step + 1 }))
      return
    }
    void finish()
  }

  const label = blockLabel(step)
  const progress = ((step + 1) / TOTAL_STEPS) * 100

  return (
    <Card className="mx-auto w-full max-w-[640px]">
      <div className="text-[13px] text-muted">
        Шаг {step + 1} из {TOTAL_STEPS}
      </div>
      <div className="mt-2 h-[2px] w-full bg-border">
        <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
      </div>

      {label ? (
        <div className="mt-6 text-[12px] uppercase tracking-[0.08em] text-muted">{label}</div>
      ) : null}

      <div className={label ? 'mt-2' : 'mt-6'}>
        {step === 0 ? (
          <ProfessionPicker
            professions={professions}
            search={search}
            onSearch={(value) => setState((prev) => ({ ...prev, search: value }))}
            selectedId={professionId}
            onSelect={selectProfession}
          />
        ) : step === 1 ? (
          <AllocationStep allocation={allocation} sum={allocationSum} onChange={changeAllocation} />
        ) : activeQuestion ? (
          <div>
            <h2 className="font-heading text-xl font-medium text-ink">
              {activeQuestion.question.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{activeQuestion.question.hint}</p>
            <div className="mt-5 flex flex-col gap-2">
              {activeQuestion.question.options.map((option) => (
                <SelectableRow
                  key={option.value}
                  selected={activeQuestion.value === option.value}
                  onClick={() => answerQuestion(option.value)}
                >
                  {option.label}
                </SelectableRow>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {saveError ? (
        <div className="mt-6 rounded-[2px] border border-[#b42318] bg-white px-3 py-2 text-[13px] text-[#b42318]">
          {saveError}
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between">
        {step > 0 ? (
          <Button variant="ghost" onClick={goBack} disabled={saving}>
            Назад
          </Button>
        ) : (
          <span />
        )}
        <Button variant="accent" onClick={goNext} disabled={!hasSelection || saving}>
          {isLastStep ? (saving ? 'Сохранение' : 'Показать результат') : 'Далее'}
        </Button>
      </div>
    </Card>
  )
}
