import type { LucideIcon } from 'lucide-react'
import { Radar, Route, TrendingUp } from 'lucide-react'
import { Card, Container } from '@shared/ui'

interface Step {
  index: string
  icon: LucideIcon
  title: string
  description: string
}

const steps: Step[] = [
  {
    index: '01',
    icon: Radar,
    title: 'Диагностика',
    description:
      'Честная оценка того, насколько профессия открыта автоматизации. Без паники и общих слов.',
  },
  {
    index: '02',
    icon: Route,
    title: 'План',
    description:
      'Личная дорожная карта устойчивых навыков. Понятные приоритеты вместо длинного списка задач.',
  },
  {
    index: '03',
    icon: TrendingUp,
    title: 'Прогресс',
    description:
      'Небольшие шаги каждую неделю и дневник, который заменяет тревогу фактами.',
  },
]

export function Steps() {
  return (
    <section id="steps" className="scroll-mt-20 border-t border-border py-[120px]">
      <Container>
        <h2 className="font-heading text-[32px] font-bold tracking-tight text-ink">
          Как это работает
        </h2>
        <p className="mt-3 max-w-[560px] text-muted">Три шага от тревоги к плану.</p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map(({ index, icon: Icon, title, description }) => (
            <Card key={index} padding={28}>
              <span className="font-heading text-2xl font-bold text-muted">{index}</span>
              <Icon size={20} strokeWidth={1.75} className="mt-6 text-ink" aria-hidden />
              <h3 className="mt-4 text-lg font-medium text-ink">{title}</h3>
              <p className="mt-2 text-sm text-muted">{description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
