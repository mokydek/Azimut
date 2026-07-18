import { useCallback, useEffect, useState } from 'react'
import { Button } from '@shared/ui'
import { useDocumentTitle } from '@shared/useDocumentTitle'
import type { Profession } from '@backend/types/database'
import { riskCategory } from '@backend/engine/riskEngine'
import { getLatestAssessment, getProfessions } from '@backend/services/assessmentService'
import type { LatestAssessment } from '@backend/services/assessmentService'
import { AssessmentWizard } from '../components/AssessmentWizard'
import { ResultsView } from '../components/ResultsView'
import type { AssessmentResultView } from '../components/ResultsView'

type Phase = 'loading' | 'wizard' | 'results' | 'error'

function toResultView(latest: LatestAssessment): AssessmentResultView {
  return {
    score: latest.score,
    category: riskCategory(latest.score),
    breakdown: latest.breakdown,
    professionName: latest.professionName,
    createdAt: latest.createdAt,
  }
}

export default function AssessmentPage() {
  useDocumentTitle('Диагностика · Azimut')
  const [phase, setPhase] = useState<Phase>('loading')
  const [result, setResult] = useState<AssessmentResultView | null>(null)
  const [professions, setProfessions] = useState<Profession[]>([])

  const init = useCallback(async () => {
    setPhase('loading')

    const latest = await getLatestAssessment()
    if ('error' in latest) {
      setPhase('error')
      return
    }
    if (latest.data) {
      setResult(toResultView(latest.data))
      setPhase('results')
      return
    }

    const list = await getProfessions()
    if ('error' in list) {
      setPhase('error')
      return
    }
    setProfessions(list.data)
    setPhase('wizard')
  }, [])

  useEffect(() => {
    void init()
  }, [init])

  const startWizard = useCallback(async () => {
    if (professions.length === 0) {
      const list = await getProfessions()
      if ('error' in list) {
        setPhase('error')
        return
      }
      setProfessions(list.data)
    }
    setResult(null)
    setPhase('wizard')
  }, [professions])

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
        <p className="text-sm text-[#b42318]">Не удалось загрузить диагностику</p>
        <Button variant="ghost" className="mt-2 px-0" onClick={() => void init()}>
          Попробовать снова
        </Button>
      </div>
    )
  }

  if (phase === 'results' && result) {
    return <ResultsView result={result} onRetake={() => void startWizard()} />
  }

  return (
    <AssessmentWizard
      professions={professions}
      onComplete={(view) => {
        setResult(view)
        setPhase('results')
      }}
    />
  )
}
