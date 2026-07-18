import type { LucideIcon } from 'lucide-react'
import { Database, Lock, Scale } from 'lucide-react'
import { Container } from '@shared/ui'

interface MethodologyBlock {
  icon: LucideIcon
  title: string
  text: string
}

const blocks: MethodologyBlock[] = [
  {
    icon: Database,
    title: 'Данные',
    text: 'Базовые оценки синтезированы из открытых исследований автоматизации: Frey и Osborne, глобальный индекс ILO и NASK 2025 года, Anthropic Economic Index. По индексу ILO и NASK каждая четвертая профессия в мире подвержена влиянию генеративного ИИ.',
  },
  {
    icon: Scale,
    title: 'Честность',
    text: 'Оценка всегда диапазон, а не приговор. Она никогда не равна нулю или ста: и давление, и готовность остаются вопросом степени.',
  },
  {
    icon: Lock,
    title: 'Приватность',
    text: 'Ответы видны только пользователю. Доступ защищен на уровне базы данных.',
  },
]

export function Methodology() {
  return (
    <section className="border-t border-border py-[120px]">
      <Container>
        <h2 className="font-heading text-[32px] font-bold tracking-tight text-ink">Методология</h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {blocks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[2px] border border-border p-6">
              <Icon size={20} strokeWidth={1.75} className="text-ink" aria-hidden />
              <h3 className="mt-4 text-lg font-medium text-ink">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
