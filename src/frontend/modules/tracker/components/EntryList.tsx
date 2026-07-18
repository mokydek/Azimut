import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Badge, Button, Card } from '@shared/ui'
import type { JournalEntryView } from '@backend/services/journalService'
import { moodLabel } from '../moodScale'

const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

interface EntryListProps {
  entries: JournalEntryView[]
  onDelete: (id: string) => void
}

export function EntryList({ entries, onDelete }: EntryListProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <Card>
      <h2 className="font-heading text-base font-medium text-ink">Записи</h2>

      {entries.length === 0 ? (
        <p className="mt-4 text-center text-sm text-muted">Записей пока нет. Начните с первой</p>
      ) : (
        <div className="mt-2 flex flex-col">
          {entries.map((entry, index) => (
            <div key={entry.id} className={index > 0 ? 'border-t border-border' : ''}>
              {confirmingId === entry.id ? (
                <div className="flex items-center justify-between gap-3 py-3">
                  <span className="text-sm text-ink">Удалить запись?</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>
                      Отмена
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConfirmingId(null)
                        onDelete(entry.id)
                      }}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <div className="text-[12px] text-muted">
                      {dateTimeFormat.format(new Date(entry.createdAt))}
                    </div>
                    <div className="mt-1">
                      <Badge variant="neutral">{moodLabel(entry.mood)}</Badge>
                    </div>
                    {entry.body ? <p className="mt-2 text-sm text-ink">{entry.body}</p> : null}
                  </div>
                  <button
                    type="button"
                    aria-label="Удалить запись"
                    onClick={() => setConfirmingId(entry.id)}
                    className="shrink-0 text-muted transition-colors hover:text-ink"
                  >
                    <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
