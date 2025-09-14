import * as React from 'react'
import { cn } from '@/lib/utils'

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive' | 'outline'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const styles = {
    default: 'bg-neutral-900 text-white dark:bg-white dark:text-black',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    outline: 'border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-200',
  } as const

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        styles[variant],
        className
      )}
      {...props}
    />
  )
}

export function statusToBadgeVariant(status?: string): BadgeProps['variant'] {
  switch (status) {
    case 'OPEN':
      return 'info'
    case 'IN_PROGRESS':
      return 'warning'
    case 'RESOLVED':
      return 'success'
    case 'CLOSED':
      return 'outline'
    default:
      return 'default'
  }
}

