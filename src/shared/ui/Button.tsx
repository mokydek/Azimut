import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { To } from 'react-router-dom'

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  /** When set, the button renders as a react-router Link instead of a button. */
  to?: To
}

const base =
  'inline-flex items-center justify-center gap-2 font-body font-medium rounded-[2px] ' +
  'transition-colors cursor-pointer select-none ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:opacity-40 disabled:pointer-events-none'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-black text-white hover:bg-[#333333]',
  accent: 'bg-accent text-white hover:bg-accent-hover',
  outline: 'bg-white text-ink border border-ink hover:bg-surface',
  ghost: 'bg-transparent text-muted hover:text-ink',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  to,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [base, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {Icon ? <Icon size={16} strokeWidth={1.75} aria-hidden /> : null}
      {children}
    </>
  )

  if (to !== undefined) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  )
}
