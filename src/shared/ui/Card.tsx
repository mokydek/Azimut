import type { CSSProperties, HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Inner padding in pixels. Defaults to 24. */
  padding?: number
}

export function Card({ padding = 24, className, style, children, ...props }: CardProps) {
  const classes = ['bg-white border border-border rounded-[2px]', className]
    .filter(Boolean)
    .join(' ')

  const mergedStyle: CSSProperties = { padding, ...style }

  return (
    <div className={classes} style={mergedStyle} {...props}>
      {children}
    </div>
  )
}
