// Single source of truth for mood levels and their Russian labels.

export interface MoodLevel {
  value: number
  label: string
}

export const moodScale: MoodLevel[] = [
  { value: 1, label: 'Тяжело' },
  { value: 2, label: 'Тревожно' },
  { value: 3, label: 'Нейтрально' },
  { value: 4, label: 'Спокойно' },
  { value: 5, label: 'Уверенно' },
]

export function moodLabel(value: number): string {
  return moodScale.find((level) => level.value === value)?.label ?? ''
}
