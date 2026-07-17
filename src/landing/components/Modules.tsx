import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { Badge, Container } from '@shared/ui'

function RiskMock() {
  return (
    <div className="rounded-[2px] border border-border p-6">
      <div className="text-[13px] lowercase tracking-[0.08em] text-muted">уровень риска</div>
      <div className="mt-2 font-heading text-6xl font-bold tabular-nums text-ink">62</div>
      <div className="mt-5 h-2 w-full bg-border">
        <div className="h-full bg-accent" style={{ width: '62%' }} />
      </div>
      <div className="mt-3 text-[13px] text-muted">Средняя устойчивость профессии</div>
    </div>
  )
}

const roadmapSkills = [
  'Анализ данных',
  'Навыки коммуникации',
  'Работа с инструментами ИИ',
  'Критическое мышление',
]

function RoadmapMock() {
  return (
    <div className="rounded-[2px] border border-border p-5">
      <ul className="flex flex-col gap-3">
        {roadmapSkills.map((skill, i) => (
          <li key={skill} className="flex items-center gap-3">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-[2px] border ${
                i === 0 ? 'border-accent text-accent' : 'border-border text-muted'
              }`}
            >
              <Check size={14} strokeWidth={2} aria-hidden />
            </span>
            <span className="text-sm text-ink">{skill}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const week: Array<'done' | 'today' | 'upcoming'> = [
  'done',
  'done',
  'done',
  'done',
  'today',
  'upcoming',
  'upcoming',
]

function WeekMock() {
  return (
    <div className="rounded-[2px] border border-border p-6">
      <div className="text-[13px] lowercase tracking-[0.08em] text-muted">неделя</div>
      <div className="mt-4 flex gap-2">
        {week.map((state, i) => (
          <div
            key={i}
            className={`h-8 w-8 rounded-[2px] ${
              state === 'done'
                ? 'bg-ink'
                : state === 'today'
                  ? 'bg-accent'
                  : 'border border-border bg-white'
            }`}
          />
        ))}
      </div>
      <div className="mt-3 text-[13px] text-muted">Четыре шага сделаны, один сегодня</div>
    </div>
  )
}

interface ModuleRow {
  badge: string
  heading: string
  paragraph: string
  mock: ReactNode
}

const modules: ModuleRow[] = [
  {
    badge: 'Диагностика',
    heading: 'Оценка риска',
    paragraph:
      'Мы показываем, какие задачи в вашей профессии проще передать машине. Вы видите уровень риска и его причины.',
    mock: <RiskMock />,
  },
  {
    badge: 'План',
    heading: 'Личный план',
    paragraph:
      'На основе оценки вы получаете список устойчивых навыков. Каждый шаг понятен и не перегружает.',
    mock: <RoadmapMock />,
  },
  {
    badge: 'Прогресс',
    heading: 'Спокойный трекер',
    paragraph:
      'Небольшие действия складываются в результат. Дневник помогает опираться на факты, а не на тревогу.',
    mock: <WeekMock />,
  },
]

export function Modules() {
  return (
    <section className="border-t border-border">
      <Container>
        {modules.map((module) => (
          <div
            key={module.badge}
            className="grid grid-cols-1 items-center gap-10 border-t border-border py-16 first:border-t-0 md:grid-cols-2"
          >
            <div>
              <Badge variant="neutral">{module.badge}</Badge>
              <h3 className="mt-4 font-heading text-[28px] font-bold tracking-tight text-ink">
                {module.heading}
              </h3>
              <p className="mt-3 max-w-[440px] text-muted">{module.paragraph}</p>
            </div>
            <div>{module.mock}</div>
          </div>
        ))}
      </Container>
    </section>
  )
}
