import type { JournalEntryView } from '@backend/services/journalService'

export function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// The latest entry recorded today, if any. Entries are expected newest first.
export function todaysEntry(entries: JournalEntryView[]): JournalEntryView | null {
  const today = new Date()
  return entries.find((entry) => sameDay(new Date(entry.createdAt), today)) ?? null
}

export interface DayCell {
  date: Date
  mood: number | null
}

// Oldest day first. Each cell holds the latest mood recorded that day, or null.
export function buildDayStrip(entries: JournalEntryView[], days = 14): DayCell[] {
  const today = startOfDay(new Date())
  const cells: DayCell[] = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const dayEntries = entries.filter((entry) => sameDay(new Date(entry.createdAt), date))
    cells.push({ date, mood: dayEntries.length > 0 ? dayEntries[0].mood : null })
  }
  return cells
}

export function entriesInLastDays(entries: JournalEntryView[], days: number): JournalEntryView[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return entries.filter((entry) => new Date(entry.createdAt).getTime() >= cutoff)
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((total, value) => total + value, 0) / values.length
}
