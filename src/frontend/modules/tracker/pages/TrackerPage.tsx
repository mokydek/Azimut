import { useCallback, useEffect, useState } from 'react'
import { Button } from '@shared/ui'
import { useDocumentTitle } from '@shared/useDocumentTitle'
import { deleteEntry, getEntries } from '@backend/services/journalService'
import type { JournalEntryView } from '@backend/services/journalService'
import { NewEntryCard } from '../components/NewEntryCard'
import { DayStrip } from '../components/DayStrip'
import { EntryList } from '../components/EntryList'
import { SupportBlock } from '../components/SupportBlock'
import { todaysEntry } from '../stats'

type Phase = 'loading' | 'error' | 'ready'

export default function TrackerPage() {
  useDocumentTitle('Трекер · Azimut')
  const [entries, setEntries] = useState<JournalEntryView[]>([])
  const [phase, setPhase] = useState<Phase>('loading')
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setPhase('loading')
    const result = await getEntries()
    if ('error' in result) {
      setPhase('error')
      return
    }
    setEntries(result.data)
    setPhase('ready')
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function handleAdded(entry: JournalEntryView) {
    setActionError(null)
    setEntries((prev) => [entry, ...prev])
  }

  async function handleDelete(id: string) {
    setActionError(null)
    const snapshot = entries
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
    const result = await deleteEntry(id)
    if ('error' in result) {
      setEntries(snapshot)
      setActionError(result.error)
    }
  }

  if (phase === 'loading') {
    return (
      <div className="mx-auto w-full max-w-[720px]">
        <div className="h-64 animate-pulse rounded-[2px] bg-[#f0f0f0]" />
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="mx-auto max-w-[720px] rounded-[2px] border border-[#b42318] bg-white px-4 py-4">
        <p className="text-sm text-[#b42318]">Не удалось загрузить трекер</p>
        <Button variant="ghost" className="mt-2 px-0" onClick={() => void load()}>
          Попробовать снова
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <header>
        <h1 className="font-heading text-[28px] font-medium tracking-tight text-ink">
          Трекер спокойствия
        </h1>
        <p className="mt-1 text-sm text-muted">
          короткая запись раз в день помогает видеть динамику вместо ощущения хаоса.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-6">
        <NewEntryCard todaysEntry={todaysEntry(entries)} onAdded={handleAdded} />
        <DayStrip entries={entries} />
        <SupportBlock entries={entries} />
        {actionError ? <p className="text-[13px] text-[#b42318]">{actionError}</p> : null}
        <EntryList entries={entries} onDelete={handleDelete} />
      </div>
    </div>
  )
}
