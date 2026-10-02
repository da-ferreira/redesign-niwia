import { cn } from '@/lib/utils'

export type DotTone = 'brand' | 'live' | 'ok' | 'caution' | 'danger' | 'muted'

const TONE: Record<DotTone, string> = {
  brand: 'bg-brand',
  live: 'bg-live',
  ok: 'bg-ok',
  caution: 'bg-caution',
  danger: 'bg-danger',
  muted: 'bg-faint',
}

// O ponto do "niw.ia" é a assinatura do produto: status, ao vivo, seleção.
export function Dot({ tone = 'brand', pulse, className }: { tone?: DotTone; pulse?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-1.5 shrink-0 rounded-full', TONE[tone], className)}
      style={pulse ? { animation: 'dot-pulse 1.6s ease-in-out infinite' } : undefined}
    />
  )
}

// Carregando = três pontos em sequência, no lugar de spinner.
export function Waiting({ className }: { className?: string }) {
  return (
    <span role="status" aria-label="Carregando" className={cn('inline-flex items-center gap-1', className)}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-current"
          style={{ animation: `dot-wait 1.2s ${i * 0.16}s ease-in-out infinite` }}
        />
      ))}
    </span>
  )
}
