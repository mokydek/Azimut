import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  const fieldClasses = [
    'w-full rounded-[2px] border bg-white px-3 py-2.5 text-sm text-ink',
    'outline-none transition-colors placeholder:text-muted',
    error ? 'border-[#b42318] focus:border-[#b42318]' : 'border-border focus:border-ink',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-[13px] font-medium text-ink">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={fieldClasses}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? <span className="text-[13px] text-[#b42318]">{error}</span> : null}
    </div>
  )
}
