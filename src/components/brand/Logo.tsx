import { cn } from '@/lib/utils'

export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <>
        <img src="/favicon-mark.png" alt="NiwIA" className={cn('size-6 dark:hidden', className)} />
        <img src="/favicon-mark-dark.png" alt="NiwIA" className={cn('hidden size-6 dark:block', className)} />
      </>
    )
  }
  return (
    <>
      <img src="/niwia-logo.png" alt="NiwIA" className={cn('h-5 w-auto dark:hidden', className)} />
      <img src="/niwia-logo-dark.png" alt="NiwIA" className={cn('hidden h-5 w-auto dark:block', className)} />
    </>
  )
}
