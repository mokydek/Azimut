import type { HTMLAttributes } from 'react'

export type ContainerProps = HTMLAttributes<HTMLDivElement>

export function Container({ className, children, ...props }: ContainerProps) {
  const classes = ['mx-auto w-full max-w-[1080px] px-6', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
