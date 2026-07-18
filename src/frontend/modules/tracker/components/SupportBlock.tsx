import { HeartHandshake } from 'lucide-react'
import type { JournalEntryView } from '@backend/services/journalService'
import { average } from '../stats'

interface SupportBlockProps {
  entries: JournalEntryView[]
}

// Shows a calm support note when the recent stretch has been heavy. Not
// dismissible: it disappears on its own once the average rises.
export function SupportBlock({ entries }: SupportBlockProps) {
  if (entries.length < 5) return null
  const recentAverage = average(entries.slice(0, 5).map((entry) => entry.mood))
  if (recentAverage === null || recentAverage > 2) return null

  return (
    <div className="flex items-start gap-3 bg-surface p-4">
      <HeartHandshake size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink" aria-hidden />
      <p className="text-sm text-ink">
        Долгая полоса тяжелых дней это ощутимый груз, и им стоит поделиться. Разговор с близким
        человеком или со специалистом это обычный рабочий инструмент, а не крайняя мера.
      </p>
    </div>
  )
}
