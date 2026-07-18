import { useCallback, useEffect, useState } from 'react'
import { Button } from '@shared/ui'
import { useDocumentTitle } from '@shared/useDocumentTitle'
import type { Profession } from '@backend/types/database'
import type { ResultV2 } from '@backend/engine/riskEngineV2'
import { isResultV2 } from '@backend/engine/riskEngineV2'
import { getLatestAssessment, getProfessions } from '@backend/services/assessmentService'
import { AssessmentWizardV2 } from '../components/AssessmentWizardV2'
import { ResultsViewV2 } from '../components/ResultsViewV2'
import { LegacyResultsView } from '../components/LegacyResultsView'

type Phase = 'loading' | 'wizard' | 'results' | 'error'

type Display =
  | { kind: 'v2'; result: ResultV2; professionName: string | null; createdAt: string }
  | { kind: 'legacy'; score: number; professionName: string | null; createdAt: string }

export default function AssessmentPage() {
  useDocumentTitle('Диагностика · Azimut')
  const [phase, setPhase] = useState<Phase>('loading')
  const [display, setDisplay] = useState<Display | null>(null)
  const [professions, setProfessions] = useState<Profession[]>([])

  const init = useCallback(async () => {
    setPhase('loading')

    const latest = await getLatestAssessment()
    if ('error' in latest) {
      setPhase('error')
      return
    }
    if (latest.data) {
      const data = latest.data
      if (isResultV2(data.breakdown)) {
        setDisplay({
          kind: 'v2',
          result: data.breakdown,
          professionName: data.professionName,
          createdAt: data.createdAt,
        })
      } else {
        setDisplay({
          kind: 'legacy',
          score: data.score,
          professionName: data.professionName,
          createdAt: data.createdAt,
        })
      }
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
    setDisplay(null)
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

  if (phase === 'results' && display) {
    if (display.kind === 'v2') {
      return (
        <ResultsViewV2
          result={display.result}
          professionName={display.professionName}
          createdAt={display.createdAt}
          onRetake={() => void startWizard()}
        />
      )
    }
    return (
      <LegacyResultsView
        score={display.score}
        professionName={display.professionName}
        createdAt={display.createdAt}
        onRetake={() => void startWizard()}
      />
    )
  }

  return (
    <AssessmentWizardV2
      professions={professions}
      onComplete={(payload) => {
        setDisplay({
          kind: 'v2',
          result: payload.result,
          professionName: payload.professionName,
          createdAt: payload.createdAt,
        })
        setPhase('results')
      }}
    />
  )
}
