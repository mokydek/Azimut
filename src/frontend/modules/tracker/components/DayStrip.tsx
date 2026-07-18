import { Card } from '@shared/ui'
import type { JournalEntryView } from '@backend/services/journalService'
import { moodLabel } from '../moodScale'
import { average, buildDayStrip, entriesInLastDays } from '../stats'

interface DayStripProps {
  entries: JournalEntryView[]
}

const moodOpacity: Record<number, number> = {
  1: 0.15,
  2: 0.3,
  3: 0.5,
  4: 0.75,
  5: 1,
}

const dayMonthFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
const averageFormat = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function DayStrip({ entries }: DayStripProps) {
  const cells = buildDayStrip(entries, 14)
  const weekEntries = entriesInLastDays(entries, 7)
  const weekAverage = average(weekEntries.map((entry) => entry.mood))

  return (
    <Card>
      <h2 className="font-heading text-base font-medium text-ink">Последние 14 дней</h2>

      <div className="mt-4 flex gap-1.5">
        {cells.map((cell) => {
          const label = dayMonthFormat.format(cell.date)
          if (cell.mood === null) {
            return (
              <div
                key={cell.date.toISOString()}
                title={`${label}, нет записи`}
                className="h-5 w-5 rounded-[2px] border border-border bg-white"
              />
            )
          }
          return (
            <div
              key={cell.date.toISOString()}
              title={`${label}, ${moodLabel(cell.mood)}`}
              className="h-5 w-5 rounded-[2px]"
              style={{ backgroundColor: `rgba(0, 47, 167, ${moodOpacity[cell.mood]})` }}
            />
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px] text-muted">
        <span>светлее</span>
        <span>спокойнее</span>
      </div>

      <div className="mt-4 flex gap-8">
        <div>
          <div className="text-[12px] text-muted">Записей за 7 дней</div>
          <div className="font-heading text-lg tabular-nums text-ink">{weekEntries.length}</div>
        </div>
        <div>
          <div className="text-[12px] text-muted">Средняя оценка за 7 дней</div>
          <div className="font-heading text-lg tabular-nums text-ink">
            {weekAverage === null ? '—' : averageFormat.format(weekAverage)}
          </div>
        </div>
      </div>
    </Card>
  )
}
