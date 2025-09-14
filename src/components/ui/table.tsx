import * as React from 'react'
import { cn } from '@/lib/utils'

export function Table({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('w-full overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800', className)} {...props} />
  )
}

export function TableInner({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full text-sm', className)} {...props} />
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-neutral-50/60 dark:bg-neutral-900/30', className)} {...props} />
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-neutral-200 dark:border-neutral-800', className)} {...props} />
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('py-3 px-4 text-left font-medium text-neutral-600 dark:text-neutral-300', className)} {...props} />
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-neutral-200 dark:divide-neutral-800', className)} {...props} />
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('py-3 px-4 align-middle', className)} {...props} />
}

