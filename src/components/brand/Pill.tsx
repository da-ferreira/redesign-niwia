import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Dot } from './Dot'

export type PillTone = 'ok' | 'danger' | 'caution' | 'live' | 'brand' | 'neutral'

const TONE: Record<PillTone, string> = {
  ok: 'bg-ok/10 text-ok',
  danger: 'bg-danger/10 text-danger',
  caution: 'bg-caution/10 text-caution',
  live: 'bg-live/10 text-live',
  brand: 'bg-brand/10 text-brand',
  neutral: 'bg-surface-hover text-ink-soft',
}

// Status em pílula de fundo suave. `dot` liga o ponto da marca; `pulse` só para o que está ao vivo.
export function Pill({ tone = 'neutral', dot, pulse, className, children }: { tone?: PillTone; dot?: boolean; pulse?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md px-2 text-[12.5px] whitespace-nowrap', TONE[tone], className)}>
      {dot && <Dot tone={tone === 'neutral' ? 'muted' : tone} pulse={pulse} />}
      {children}
    </span>
  )
}
