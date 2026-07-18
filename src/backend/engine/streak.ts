// Pure helper for the tracker streak. Self contained day math so it can be used
// from both the backend services and the frontend without cross imports.

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date: Date, amount: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}

// Number of consecutive calendar days, counting back from today (or from
// yesterday if there is no entry today yet), that have at least one entry. The
// streak survives an incomplete current day and breaks on a fully missed day.
export function computeStreak(entries: { createdAt: string }[]): number {
  if (entries.length === 0) return 0

  const days = new Set<string>()
  for (const entry of entries) {
    days.add(dayKey(new Date(entry.createdAt)))
  }

  let cursor = startOfDay(new Date())
  if (!days.has(dayKey(cursor))) {
    // No entry today. The streak can still stand if yesterday has one.
    cursor = addDays(cursor, -1)
    if (!days.has(dayKey(cursor))) return 0
  }

  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}
