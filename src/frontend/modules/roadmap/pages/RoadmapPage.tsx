import { useCallback, useEffect, useState } from 'react'
import { Radar } from 'lucide-react'
import { Badge, Button, Card } from '@shared/ui'
import { useDocumentTitle } from '@shared/useDocumentTitle'
import { deriveFocusAreas, riskCategory } from '@backend/engine/riskEngine'
import type { Answers, RiskCategory } from '@backend/engine/riskEngine'
import { deriveFocusAreasV2, isAnswersV2 } from '@backend/engine/riskEngineV2'
import { getLatestAssessment } from '@backend/services/assessmentService'
import type { LatestAssessment } from '@backend/services/assessmentService'
import { generateRoadmap, getRoadmapWithSteps } from '@backend/services/roadmapService'
import type { RoadmapView } from '@backend/services/roadmapService'
import { RoadmapResult } from '../components/RoadmapResult'

type Phase = 'loading' | 'error' | 'empty' | 'ready' | 'roadmap'

const categoryLabels: Record<RiskCategory, string> = {
  low: 'Низкий',
  moderate: 'Умеренный',
  high: 'Высокий',
}

export default function RoadmapPage() {
  useDocumentTitle('План · Azimut')
  const [phase, setPhase] = useState<Phase>('loading')
  const [assessment, setAssessment] = useState<LatestAssessment | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapView | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setPhase('loading')
    const [assessmentResult, roadmapResult] = await Promise.all([
      getLatestAssessment(),
      getRoadmapWithSteps(),
    ])
    if ('error' in assessmentResult || 'error' in roadmapResult) {
      setPhase('error')
      return
    }

    setAssessment(assessmentResult.data)
    setRoadmap(roadmapResult.data)

    if (!assessmentResult.data) {
      setPhase('empty')
    } else if (!roadmapResult.data) {
      setPhase('ready')
    } else {
      setPhase('roadmap')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleGenerate() {
    setGenerating(true)
    setGenerateError(null)
    const result = await generateRoadmap()
    setGenerating(false)
    if ('error' in result) {
      setGenerateError(result.error)
      return
    }
    await load()
  }

  if (phase === 'loading') {
    return (
      <div className="mx-auto w-full max-w-[640px]">
        <div className="h-64 animate-pulse rounded-[2px] bg-[#f0f0f0]" />
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="mx-auto max-w-[640px] rounded-[2px] border border-[#b42318] bg-white px-4 py-4">
        <p className="text-sm text-[#b42318]">Не удалось загрузить план</p>
        <Button variant="ghost" className="mt-2 px-0" onClick={() => void load()}>
          Попробовать снова
        </Button>
      </div>
    )
  }

  if (phase === 'empty') {
    return (
      <div className="mx-auto flex max-w-[420px] flex-col items-center py-16 text-center">
        <Radar size={32} strokeWidth={1.5} className="text-muted" aria-hidden />
        <h1 className="mt-4 font-heading text-xl font-medium text-ink">
          План строится на основе диагностики
        </h1>
        <p className="mt-2 text-sm text-muted">
          Сначала оцените свою профессию, и мы предложим конкретные шаги адаптации.
        </p>
        <Button to="/app/assessment" variant="accent" className="mt-6">
          Пройти диагностику
        </Button>
      </div>
    )
  }

  if (phase === 'ready' && assessment) {
    const focusAreas = isAnswersV2(assessment.answers)
      ? deriveFocusAreasV2(assessment.answers).focusAreas
      : deriveFocusAreas(assessment.answers as Answers)
    const category = riskCategory(assessment.score)
    return (
      <Card className="mx-auto w-full max-w-[640px]">
        <h1 className="font-heading text-xl font-medium text-ink">План готов к формированию</h1>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted">Уровень риска</span>
          <Badge variant={category === 'low' ? 'neutral' : 'accent'}>
            {categoryLabels[category]}
          </Badge>
        </div>
        {focusAreas.length > 0 ? (
          <div className="mt-5">
            <div className="text-[12px] uppercase tracking-[0.08em] text-muted">
              Над чем будем работать
            </div>
            <ul className="mt-2 flex flex-col gap-1">
              {focusAreas.map((area) => (
                <li key={area.id} className="text-sm text-ink">
                  {area.label}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {generateError ? (
          <p className="mt-4 text-[13px] text-[#b42318]">{generateError}</p>
        ) : null}
        <Button
          variant="accent"
          className="mt-6"
          onClick={() => void handleGenerate()}
          disabled={generating}
        >
          {generating ? 'Формируем план' : 'Сформировать план'}
        </Button>
      </Card>
    )
  }

  if (phase === 'roadmap' && roadmap) {
    const hasNewerAssessment = assessment
      ? new Date(assessment.createdAt).getTime() > new Date(roadmap.createdAt).getTime()
      : false
    return (
      <RoadmapResult
        roadmap={roadmap}
        hasNewerAssessment={hasNewerAssessment}
        onRegenerated={() => void load()}
      />
    )
  }

  return null
}
