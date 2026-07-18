import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { Badge, Container } from '@shared/ui'

function RiskMock() {
  return (
    <div className="rounded-[2px] border border-border p-6">
      <div className="text-[13px] lowercase tracking-[0.08em] text-muted">
        давление автоматизации
      </div>
      <div className="mt-2 font-heading text-6xl font-bold tabular-nums text-ink">62</div>
      <div className="mt-1 text-[13px] text-muted">от 51 до 73</div>
      <div className="relative mt-5 h-2 w-full bg-border">
        <div
          className="absolute top-0 h-full"
          style={{ left: '51%', width: '22%', backgroundColor: 'rgba(0, 47, 167, 0.4)' }}
        />
        <div className="absolute top-0 h-full w-[2px] bg-ink" style={{ left: '62%' }} />
      </div>
      <div className="mt-3 text-[13px] text-muted">Оценка показана диапазоном, а не точкой</div>
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
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-2.5 w-2.5 rounded-[2px] bg-accent" />
          ))}
        </div>
        <span className="text-[13px] text-muted">Серия: 5 дней</span>
      </div>
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
    heading: 'Давление и готовность',
    paragraph:
      'Две оси вместо одной цифры: внешнее давление автоматизации и ваша личная готовность. Оценка всегда показана честным диапазоном, с разбором причин.',
    mock: <RiskMock />,
  },
  {
    badge: 'План',
    heading: 'Разбор и план',
    paragraph:
      'На основе ответов ИИ пишет персональный текстовый разбор, а план собирается из конкретных шагов. Каждый шаг понятен и не перегружает.',
    mock: <RoadmapMock />,
  },
  {
    badge: 'Прогресс',
    heading: 'Спокойный ритм',
    paragraph:
      'Дневник, серия дней и еженедельный обзор помогают опираться на факты, а не на тревогу. В библиотеке собраны материалы под ваши зоны роста.',
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
