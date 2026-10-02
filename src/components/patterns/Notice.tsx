import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Dot, type DotTone } from '@/components/brand/Dot'

// Faixa de aviso logo abaixo do cabeçalho (não publicado, somente leitura...).
export function Notice({ tone = 'caution', children, action }: { tone?: DotTone; children: ReactNode; action?: ReactNode }) {
  return (
    <div className={cn('flex shrink-0 items-center gap-3 border-b border-hairline bg-surface px-4 py-2 text-[13px]')}>
      <Dot tone={tone} />
      <p className="flex-1 text-ink-soft">{children}</p>
      {action}
    </div>
  )
}
