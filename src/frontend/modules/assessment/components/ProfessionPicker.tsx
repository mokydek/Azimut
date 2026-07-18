import { Input } from '@shared/ui'
import type { Profession } from '@backend/types/database'
import { SelectableRow } from './SelectableRow'

interface ProfessionPickerProps {
  professions: Profession[]
  search: string
  onSearch: (value: string) => void
  selectedId: number | null
  onSelect: (id: number) => void
}

const collator = new Intl.Collator('ru')

export function ProfessionPicker({
  professions,
  search,
  onSearch,
  selectedId,
  onSelect,
}: ProfessionPickerProps) {
  const normalized = search.trim().toLowerCase()
  const filtered = normalized
    ? professions.filter((item) => item.name.toLowerCase().includes(normalized))
    : professions

  const groups = new Map<string, Profession[]>()
  for (const item of filtered) {
    const list = groups.get(item.category) ?? []
    list.push(item)
    groups.set(item.category, list)
  }

  const sortedGroups = [...groups.entries()]
    .sort((a, b) => collator.compare(a[0], b[0]))
    .map(
      ([category, items]) =>
        [category, [...items].sort((x, y) => collator.compare(x.name, y.name))] as const,
    )

  return (
    <div>
      <h2 className="font-heading text-xl font-medium text-ink">Ваша профессия</h2>
      <p className="mt-2 text-sm text-muted">Найдите профессию в списке ниже.</p>
      <div className="mt-4">
        <Input
          label="Поиск"
          placeholder="Начните вводить название"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      <div className="mt-4 flex max-h-[340px] flex-col gap-4 overflow-y-auto">
        {sortedGroups.map(([category, items]) => (
          <div key={category}>
            <div className="mb-2 text-[11px] uppercase tracking-[0.08em] text-muted">{category}</div>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <SelectableRow
                  key={item.id}
                  selected={selectedId === item.id}
                  onClick={() => onSelect(item.id)}
                >
                  {item.name}
                </SelectableRow>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 ? <p className="text-sm text-muted">Ничего не найдено</p> : null}
      </div>
    </div>
  )
}
