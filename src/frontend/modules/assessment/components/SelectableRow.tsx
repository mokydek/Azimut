import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

interface SelectableRowProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
}

export function SelectableRow({ selected, onClick, children }: SelectableRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center justify-between gap-3 rounded-[2px] border p-3 text-left text-sm transition-colors ${
        selected ? 'border-accent text-ink' : 'border-border text-ink hover:border-ink'
      }`}
    >
      <span>{children}</span>
      {selected ? (
        <Check size={16} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden />
      ) : null}
    </button>
  )
}
