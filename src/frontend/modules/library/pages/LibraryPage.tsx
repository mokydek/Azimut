import { useEffect, useState } from 'react'
import { Badge, Card } from '@shared/ui'
import { useDocumentTitle } from '@shared/useDocumentTitle'
import { categoryLabels } from '@backend/engine/roadmapTemplates'
import type { TemplateCategory } from '@backend/engine/roadmapTemplates'
import type { Answers } from '@backend/engine/riskEngine'
import { deriveFocusAreas } from '@backend/engine/riskEngine'
import { deriveFocusAreasV2, isAnswersV2 } from '@backend/engine/riskEngineV2'
import { getLatestAssessment } from '@backend/services/assessmentService'
import { resources } from '../resources'
import type { Resource } from '../resources'

type Filter = 'all' | TemplateCategory

const FOCUS_TO_CATEGORY: Record<string, TemplateCategory> = {
  communication: 'communication',
  creative: 'creative',
  aiuse: 'ai_tools',
}

const categoryOrder = Object.keys(categoryLabels) as TemplateCategory[]

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card>
      <Badge variant="neutral">{resource.type}</Badge>
      <h3 className="mt-3 text-base font-medium text-ink">{resource.title}</h3>
      <p className="mt-1 text-[13px] text-muted">{resource.source}</p>
      <p className="mt-2 text-sm text-ink">{resource.description}</p>
      <div className="mt-4 flex justify-end">
        <span className="text-[12px] text-muted">{resource.effort}</span>
      </div>
    </Card>
  )
}

function ResourceGrid({ items }: { items: Resource[] }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
      {items.map((resource) => (
        <ResourceCard key={resource.title} resource={resource} />
      ))}
    </div>
  )
}

export default function LibraryPage() {
  useDocumentTitle('Библиотека · Azimut')
  const [filter, setFilter] = useState<Filter>('all')
  const [recommended, setRecommended] = useState<TemplateCategory[]>([])

  useEffect(() => {
    let active = true
    getLatestAssessment().then((result) => {
      if (!active) return
      if ('error' in result || !result.data) return
      const answers = result.data.answers
      const focusIds = isAnswersV2(answers)
        ? deriveFocusAreasV2(answers).focusAreas.map((area) => area.id)
        : deriveFocusAreas(answers as Answers).map((area) => area.id)

      const categories = new Set<TemplateCategory>()
      for (const id of focusIds) {
        const category = FOCUS_TO_CATEGORY[id]
        if (category) categories.add(category)
      }
      setRecommended([...categories])
    })
    return () => {
      active = false
    }
  }, [])

  const filtered = filter === 'all' ? resources : resources.filter((item) => item.category === filter)
  const recommendedResources = resources.filter((item) => recommended.includes(item.category))
  const showRecommended = filter === 'all' && recommendedResources.length > 0

  const chips: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Все' },
    ...categoryOrder.map((category) => ({ key: category, label: categoryLabels[category] })),
  ]

  return (
    <div>
      <header>
        <h1 className="font-heading text-[28px] font-medium tracking-tight text-ink">Библиотека</h1>
        <p className="mt-1 text-sm text-muted">
          Книги, курсы и практики для развития устойчивых навыков.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = filter === chip.key
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key)}
              aria-pressed={active}
              className={`rounded-[2px] border px-3 py-1.5 text-[13px] transition-colors ${
                active ? 'border-ink bg-ink text-white' : 'border-border text-ink hover:border-ink'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {showRecommended ? (
        <section className="mt-8">
          <h2 className="text-[12px] uppercase tracking-[0.08em] text-muted">Рекомендовано вам</h2>
          <ResourceGrid items={recommendedResources} />
        </section>
      ) : null}

      <section className="mt-8">
        {showRecommended ? (
          <h2 className="text-[12px] uppercase tracking-[0.08em] text-muted">Все ресурсы</h2>
        ) : null}
        <ResourceGrid items={filtered} />
      </section>
    </div>
  )
}
