import { useState } from 'react'
import { Button, Card, Input } from '@shared/ui'
import type { Profession } from '@backend/types/database'
import type { Answers } from '@backend/engine/riskEngine'
import { calculateRisk } from '@backend/engine/riskEngine'
import { saveAssessment } from '@backend/services/assessmentService'
import { questions } from '../questions'
import type { QuestionId } from '../questions'
import { SelectableRow } from './SelectableRow'
import type { AssessmentResultView } from './ResultsView'

const TOTAL_STEPS = 6

interface WizardState {
  step: number
  professionId: number | null
  answers: Partial<Record<QuestionId, number>>
  search: string
  saving: boolean
  saveError: string | null
}

interface AssessmentWizardProps {
  professions: Profession[]
  onComplete: (result: AssessmentResultView) => void
}

export function AssessmentWizard({ professions, onComplete }: AssessmentWizardProps) {
  const [state, setState] = useState<WizardState>({
    step: 0,
    professionId: null,
    answers: {},
    search: '',
    saving: false,
    saveError: null,
  })

  const { step, professionId, answers, search, saving, saveError } = state
  const isProfessionStep = step === 0
  const currentQuestion = isProfessionStep ? null : questions[step - 1]

  const hasSelection = isProfessionStep
    ? professionId !== null
    : currentQuestion
      ? answers[currentQuestion.id] !== undefined
      : false

  const isLastStep = step === TOTAL_STEPS - 1

  function goBack() {
    setState((prev) => ({ ...prev, step: Math.max(0, prev.step - 1), saveError: null }))
  }

  function selectProfession(id: number) {
    setState((prev) => ({ ...prev, professionId: id }))
  }

  function selectAnswer(id: QuestionId, value: number) {
    setState((prev) => ({ ...prev, answers: { ...prev.answers, [id]: value } }))
  }

  async function finish() {
    const profession = professions.find((item) => item.id === professionId)
    if (!profession) return

    const finalAnswers: Answers = {
      routine: answers.routine ?? 50,
      communication: answers.communication ?? 50,
      creative: answers.creative ?? 50,
      physical: answers.physical ?? 50,
      aiuse: answers.aiuse ?? 50,
    }

    const result = calculateRisk(profession.base_risk, finalAnswers)

    setState((prev) => ({ ...prev, saving: true, saveError: null }))
    const saved = await saveAssessment({
      professionId: profession.id,
      answers: finalAnswers,
      riskScore: result.score,
      breakdown: result.breakdown,
    })

    if ('error' in saved) {
      setState((prev) => ({ ...prev, saving: false, saveError: saved.error }))
      return
    }

    onComplete({
      score: result.score,
      category: result.category,
      breakdown: result.breakdown,
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

  const progress = ((step + 1) / TOTAL_STEPS) * 100

  return (
    <Card className="mx-auto w-full max-w-[640px]">
      <div className="text-[13px] text-muted">Шаг {step + 1} из {TOTAL_STEPS}</div>
      <div className="mt-2 h-[2px] w-full bg-border">
        <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-6">
        {isProfessionStep ? (
          <ProfessionStep
            professions={professions}
            search={search}
            onSearch={(value) => setState((prev) => ({ ...prev, search: value }))}
            selectedId={professionId}
            onSelect={selectProfession}
          />
        ) : currentQuestion ? (
          <div>
            <h2 className="font-heading text-xl font-medium text-ink">{currentQuestion.title}</h2>
            <p className="mt-2 text-sm text-muted">{currentQuestion.hint}</p>
            <div className="mt-5 flex flex-col gap-2">
              {currentQuestion.options.map((option) => (
                <SelectableRow
                  key={option.value}
                  selected={answers[currentQuestion.id] === option.value}
                  onClick={() => selectAnswer(currentQuestion.id, option.value)}
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

interface ProfessionStepProps {
  professions: Profession[]
  search: string
  onSearch: (value: string) => void
  selectedId: number | null
  onSelect: (id: number) => void
}

function ProfessionStep({
  professions,
  search,
  onSearch,
  selectedId,
  onSelect,
}: ProfessionStepProps) {
  const normalized = search.trim().toLowerCase()
  const filtered = normalized
    ? professions.filter((item) => item.name.toLowerCase().includes(normalized))
    : professions

  const groups = new Map<string, Profession[]>()
  for (const item of filtered) {
    const list = groups.get(item.category) ?? []
    list.push(item)
    groups.set(item.category, list)
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-medium text-ink">Ваша профессия</h2>
      <p className="mt-2 text-sm text-muted">Найдите профессию в списке ниже.</p>
      <div className="mt-4">
        <Input
          label="Поиск"
          placeholder="Начните вводить название"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      <div className="mt-4 flex max-h-[340px] flex-col gap-4 overflow-y-auto">
        {[...groups.entries()].map(([category, items]) => (
          <div key={category}>
            <div className="mb-2 text-[11px] uppercase tracking-[0.08em] text-muted">{category}</div>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <SelectableRow
                  key={item.id}
                  selected={selectedId === item.id}
                  onClick={() => onSelect(item.id)}
                >
                  {item.name}
                </SelectableRow>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="text-sm text-muted">Ничего не найдено</p>
        ) : null}
      </div>
    </div>
  )
}
