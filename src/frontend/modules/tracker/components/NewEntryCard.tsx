import { useState } from 'react'
import { Button, Card } from '@shared/ui'
import { addEntry } from '@backend/services/journalService'
import type { JournalEntryView } from '@backend/services/journalService'
import { moodLabel, moodScale } from '../moodScale'

interface NewEntryCardProps {
  todaysEntry: JournalEntryView | null
  onAdded: (entry: JournalEntryView) => void
}

export function NewEntryCard({ todaysEntry, onAdded }: NewEntryCardProps) {
  const [reopened, setReopened] = useState(false)
  const [mood, setMood] = useState<number | null>(null)
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const showForm = todaysEntry === null || reopened

  async function handleSave() {
    if (mood === null) return
    setSaving(true)
    setSaveError(null)
    const result = await addEntry(mood, body)
    setSaving(false)
    if ('error' in result) {
      setSaveError(result.error)
      return
    }
    onAdded(result.data)
    setMood(null)
    setBody('')
    setReopened(false)
  }

  if (!showForm && todaysEntry) {
    return (
      <Card>
        <div className="text-[12px] uppercase tracking-[0.08em] text-muted">Сегодня</div>
        <div className="mt-2 text-[15px] font-medium text-ink">{moodLabel(todaysEntry.mood)}</div>
        {todaysEntry.body ? (
          <p className="mt-2 text-sm text-ink">{todaysEntry.body}</p>
        ) : null}
        <p className="mt-3 text-sm text-muted">Сегодня запись уже есть</p>
        <Button variant="ghost" className="mt-2 px-0" onClick={() => setReopened(true)}>
          Записать еще раз
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="font-heading text-base font-medium text-ink">
        Как вы себя чувствуете сегодня?
      </h2>

      <div className="mt-4 flex gap-2">
        {moodScale.map((level) => {
          const selected = mood === level.value
          return (
            <button
              key={level.value}
              type="button"
              aria-pressed={selected}
              aria-label={level.label}
              onClick={() => setMood(level.value)}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-[2px] border transition-colors ${
                  selected ? 'border-accent bg-surface text-accent' : 'border-border text-ink'
                }`}
              >
                <span className="font-heading text-base font-medium leading-none">
                  {level.value}
                </span>
              </span>
              <span className="text-center text-[11px] leading-tight text-muted">
                {level.label}
              </span>
            </button>
          )
        })}
      </div>

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Что происходит? Пара строк по желанию"
        className="mt-4 min-h-[80px] w-full resize-none rounded-[2px] border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink"
      />

      {saveError ? <p className="mt-3 text-[13px] text-[#b42318]">{saveError}</p> : null}

      <Button
        variant="accent"
        className="mt-4"
        onClick={() => void handleSave()}
        disabled={mood === null || saving}
      >
        {saving ? 'Сохраняем' : 'Сохранить запись'}
      </Button>
    </Card>
  )
}
