import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/brand/Icon'
import { Pill } from '@/components/brand/Pill'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { AVALIACAO_LABEL, type Conversa, type Origem } from '@/mocks/conversas'

export const ORIGEM_ICON: Record<Origem, IconName> = { voice: 'phone', whatsapp: 'whatsapp', test_chat: 'chat', api: 'globe' }

export function dur(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`
}
export const relogio = (seg: number) => `${Math.floor(seg / 60)}:${String(Math.floor(seg % 60)).padStart(2, '0')}`
export const ms = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1).replace('.', ',')} s` : `${v} ms`)
export const usd = (v: number, casas = 4) => `US$ ${v.toFixed(casas).replace('.', ',')}`
export const num = (v: number) => v.toLocaleString('pt-BR')

export function AvaliacaoPill({ c }: { c: Conversa }) {
  if (c.status === 'in_progress') return <Pill tone="live" dot pulse>Em curso</Pill>
  if (c.avaliacao === 'successful') return <Pill tone="ok">{AVALIACAO_LABEL.successful}</Pill>
  if (c.avaliacao === 'failed') return <Pill tone="danger">{AVALIACAO_LABEL.failed}</Pill>
  return <span className="text-[13px] text-faint">Sem avaliação</span>
}

export function Campos({ linhas }: { linhas: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[148px_minmax(0,1fr)] gap-x-4 gap-y-3 text-[14px]">
      {linhas.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-dim">{k}</dt>
          <dd className="flex min-w-0 items-center gap-2">{v ?? <span className="text-faint">—</span>}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Copiar({ valor, rotulo, avisar }: { valor: string; rotulo: string; avisar: (m: string) => void }) {
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(valor); avisar(`${rotulo} copiado`) }}
      aria-label={`Copiar ${rotulo}`}
      className="shrink-0 rounded p-0.5 text-faint hover:bg-surface-hover hover:text-ink"
    >
      <Icon name="copy" className="size-3.5" />
    </button>
  )
}

export function Confirmar({ aberto, titulo, texto, acao, perigo, onClose, onConfirmar }: {
  aberto: boolean; titulo: string; texto: string; acao: string; perigo?: boolean; onClose: () => void; onConfirmar: () => void
}) {
  return (
    <Dialog open={aberto} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{texto}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant={perigo ? 'destructive' : 'default'} onClick={() => { onConfirmar(); onClose() }}>{acao}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Chip pequeno sob a mensagem: métrica de um turno; quando tem painel, abre ao clicar.
export function Chip({ children, tom, ativo, onClick, title }: { children: ReactNode; tom?: 'warn'; ativo?: boolean; onClick?: () => void; title?: string }) {
  const cls = cn(
    'inline-flex h-[22px] items-center gap-1 rounded-md border px-1.5 text-[12px] tabular-nums whitespace-nowrap',
    tom === 'warn' ? 'border-caution/30 bg-caution/[0.07] text-caution' : 'border-hairline text-dim',
    onClick && 'hover:border-field hover:text-ink',
    ativo && 'border-field bg-surface text-ink',
  )
  return onClick ? <button title={title} onClick={onClick} className={cls}>{children}</button> : <span title={title} className={cls}>{children}</span>
}
