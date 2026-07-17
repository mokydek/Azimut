import type { HTMLAttributes } from 'react'

export type BadgeVariant = 'neutral' | 'accent'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'text-muted border-border',
  accent: 'text-accent border-accent',
}

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  const classes = [
    'inline-flex items-center border rounded-[2px] px-1.5 py-0.5',
    'text-[11px] font-medium uppercase tracking-[0.08em]',
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
