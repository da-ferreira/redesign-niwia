import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@/components/brand/Icon'
import { Pill } from '@/components/brand/Pill'
import { Dot } from '@/components/brand/Dot'
import { Button } from '@/components/ui/button'
import { SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  apagarConversa, baixar, encerrarConversa, eventosVisiveis, ORIGEM_LABEL, segundosDesde, transcricaoJson, transcricaoTexto,
  type Conversa,
} from '@/mocks/conversas'
import { hashId } from '@/mocks/data'
import { Confirmar, ORIGEM_ICON, relogio } from './comum'
import { LinhaDoTempo } from './LinhaDoTempo'
import { Painel, type Aba } from './Painel'

export type Largura = 'compacta' | 'normal' | 'larga'

function Dica({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

const VELOCIDADES = ['0.75', '1', '1.25', '1.5', '2']

// Gravação simulada: o tempo anda num intervalo e a onda é derivada do id, sempre igual para a mesma conversa.
function Player({ c, pos, setPos, tocando, setTocando, avisar }: {
  c: Conversa; pos: number; setPos: React.Dispatch<React.SetStateAction<number>>; tocando: boolean; setTocando: (v: boolean) => void; avisar: (m: string) => void
}) {
  const [vel, setVel] = useState('1')
  const [mudo, setMudo] = useState(false)
  const total = c.duracaoMs / 1000
  const onda = useMemo(() => Array.from({ length: 110 }, (_, i) => 0.18 + 0.82 * Math.abs(Math.sin(i * 1.7 + (hashId(c.id) % 13)) * Math.cos(i * 0.29))), [c.id])
  const rodando = tocando && pos < total

  useEffect(() => {
    if (!rodando) return
    const t = setInterval(() => setPos(p => Math.min(total, p + 0.1 * Number(vel))), 100)
    return () => clearInterval(t)
  }, [rodando, vel, total, setPos])

  const pct = total ? pos / total : 0
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-t border-hairline px-5">
      <button
        onClick={() => { if (pos >= total) setPos(0); setTocando(!rodando) }}
        aria-label={rodando ? 'Pausar' : 'Ouvir gravação'}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-canvas hover:bg-ink/85"
      >
        <Icon name={rodando ? 'pause' : 'play'} className="size-4" active />
      </button>
      <div
        role="slider"
        aria-label="Posição da gravação"
        aria-valuemin={0}
        aria-valuemax={Math.round(total)}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'ArrowRight') setPos(Math.min(total, pos + 5)); if (e.key === 'ArrowLeft') setPos(Math.max(0, pos - 5)) }}
        onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setPos(((e.clientX - r.left) / r.width) * total) }}
        className="flex h-8 flex-1 cursor-pointer items-center gap-[2px]"
      >
        {onda.map((h, i) => (
          <span key={i} className={cn('flex-1 rounded-full', i / onda.length < pct ? 'bg-ink' : 'bg-field', mudo && 'opacity-50')} style={{ height: `${h * 100}%` }} />
        ))}
      </div>
      <span className="w-[86px] shrink-0 text-right text-[13px] tabular-nums text-dim">{relogio(pos)} / {relogio(total)}</span>
      <DropdownMenu>
        <DropdownMenuTrigger render={<button className="h-7 rounded-md border border-field px-2 text-[12px] tabular-nums text-ink-soft hover:bg-surface" />}>
          {vel.replace('.', ',')}x
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <p className="px-2 pt-1.5 pb-1 text-[12px] text-dim">Velocidade</p>
          <DropdownMenuRadioGroup value={vel} onValueChange={v => setVel(v as string)}>
            {VELOCIDADES.map(v => <DropdownMenuRadioItem key={v} value={v}>{v.replace('.', ',')}x</DropdownMenuRadioItem>)}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="icon-sm" aria-label={mudo ? 'Ativar som' : 'Silenciar'} onClick={() => setMudo(m => !m)}>
        <Icon name={mudo ? 'mute' : 'volume'} />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Baixar gravação" onClick={() => avisar(`Baixando gravação-${c.seq}.wav`)}>
        <Icon name="download" />
      </Button>
    </div>
  )
}

function OuvirAoVivo({ avisar }: { avisar: (m: string) => void }) {
  const [ouvindo, setOuvindo] = useState(false)
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-t border-hairline px-5">
      <Button variant={ouvindo ? 'outline' : 'default'} size="sm" onClick={() => { setOuvindo(o => !o); avisar(ouvindo ? 'Você saiu da chamada' : 'Ouvindo a chamada (só escuta, sem falar)') }}>
        <Icon name={ouvindo ? 'stop' : 'volume'} /> {ouvindo ? 'Parar de ouvir' : 'Ouvir chamada ao vivo'}
      </Button>
      {ouvindo && (
        <span className="flex h-6 items-end gap-[3px]">
          {[0, 1, 2, 3, 4].map(i => <span key={i} className="w-[3px] rounded-full bg-live" style={{ height: '40%', animation: `dot-wait 0.9s ${i * 0.12}s ease-in-out infinite` }} />)}
        </span>
      )}
    </div>
  )
}

export function Detalhe({ c, pos, total, onPrev, onNext, onClose, onMudou, largura, setLargura, avisar }: {
  c: Conversa; pos: number; total: number; onPrev: () => void; onNext: () => void; onClose: () => void; onMudou: () => void
  largura: Largura; setLargura: (l: Largura) => void; avisar: (m: string) => void
}) {
  const [tecnicos, setTecnicos] = useState(false)
  const [aba, setAba] = useState<Aba>('geral')
  const [confirmar, setConfirmar] = useState<'encerrar' | 'apagar' | null>(null)
  const [tempo, setTempo] = useState(0)
  const [tocando, setTocando] = useState(false)
  const [, tick] = useState(0)
  const vivo = c.status === 'in_progress'
  const voz = c.origem === 'voice'
  const painel = largura !== 'compacta'

  // Ao vivo, a linha do tempo e os logs crescem sozinhos (o Builder faz polling a cada 3 s).
  useEffect(() => {
    if (!vivo) return
    const t = setInterval(() => tick(n => n + 1), 3000)
    return () => clearInterval(t)
  }, [vivo])
  // Trocar de conversa (setas ↑↓) zera o player sem perder a aba escolhida.
  const [idAnterior, setIdAnterior] = useState(c.id)
  if (idAnterior !== c.id) { setIdAnterior(c.id); setTempo(0); setTocando(false) }

  const eventos = eventosVisiveis(c)
  const qtdTecnicos = eventos.filter(e => e.tipo === 'tecnico').length
  const link = `${location.origin}${location.pathname}?conversa=${c.id}`

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-hairline px-4">
        <div className="flex h-8 shrink-0 items-center rounded-lg border border-field">
          <span className="px-2.5 text-[13px] tabular-nums text-dim">{pos} / {total}</span>
          <button onClick={onPrev} disabled={pos <= 1} aria-label="Anterior" className="flex h-full w-8 items-center justify-center border-l border-field text-dim hover:bg-surface hover:text-ink disabled:opacity-40"><Icon name="up" /></button>
          <button onClick={onNext} disabled={pos >= total} aria-label="Próxima" className="flex h-full w-8 items-center justify-center border-l border-field text-dim hover:bg-surface hover:text-ink disabled:opacity-40"><Icon name="down" /></button>
        </div>
        <SheetTitle className="ml-1 min-w-0 truncate text-[15px] font-medium">{c.titulo}</SheetTitle>
        <span className="shrink-0 text-[13px] text-dim tabular-nums">nº {c.seq}</span>
        {vivo && <Pill tone="live" dot pulse>Ao vivo</Pill>}
        <div className="flex-1" />
        {vivo && <Button variant="outline" size="sm" className="text-danger" onClick={() => setConfirmar('encerrar')}><Icon name="stop" /> Encerrar</Button>}
        <Dica label="Atualizar">
          <Button variant="ghost" size="icon-sm" aria-label="Atualizar" onClick={() => { tick(n => n + 1); avisar('Conversa atualizada') }}><Icon name="refresh" /></Button>
        </Dica>
        <Dica label={tecnicos ? 'Ocultar eventos técnicos' : 'Mostrar eventos técnicos'}>
          <Button variant="ghost" size="sm" aria-pressed={tecnicos} onClick={() => setTecnicos(t => !t)} className={cn('gap-1.5 px-2', tecnicos && 'bg-surface-hover text-ink')}>
            <Icon name="terminal" /> <span className="text-[12px] tabular-nums">{qtdTecnicos}</span>
          </Button>
        </Dica>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Mais ações" />}><Icon name="more" /></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="gap-2.5" onClick={() => { navigator.clipboard?.writeText(link); avisar('Link copiado') }}><Icon name="link" /> Copiar link</DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5" onClick={() => { navigator.clipboard?.writeText(c.id); avisar('ID copiado') }}><Icon name="copy" /> Copiar ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2.5" onClick={() => baixar(`conversa-${c.seq}.txt`, transcricaoTexto(c, eventos))}><Icon name="file" /> Baixar transcrição (.txt)</DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5" onClick={() => baixar(`conversa-${c.seq}.json`, transcricaoJson(c, eventos), 'application/json')}><Icon name="download" /> Baixar transcrição (.json)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" className="gap-2.5" onClick={() => setConfirmar('apagar')}><Icon name="trash" /> Apagar conversa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dica label={painel ? 'Ocultar painel' : 'Mostrar painel'}>
          <Button variant="ghost" size="icon-sm" aria-label="Painel" onClick={() => setLargura(painel ? 'compacta' : 'normal')} className={cn(painel && 'text-brand')}><Icon name="panel" /></Button>
        </Dica>
        <Button variant="ghost" size="icon-sm" aria-label="Fechar" onClick={onClose}><Icon name="close" /></Button>
      </header>

      <div className={cn('grid min-h-0 flex-1', painel ? (largura === 'larga' ? 'grid-cols-[minmax(0,1fr)_minmax(0,760px)]' : 'grid-cols-[minmax(0,1fr)_480px]') : 'grid-cols-1')}>
        <div className="flex min-h-0 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <p className="mb-4 flex items-center justify-center gap-1.5 text-[13px] text-dim">
              Iniciada por <Icon name={ORIGEM_ICON[c.origem]} className="size-3.5" />
              <span className="text-ink">{ORIGEM_LABEL[c.origem]}{voz && ` · ramal ${c.contexto.find(([k]) => k === 'call.ramal')?.[1] ?? '—'}`}</span>
              <span className="text-faint">·</span>
              {c.inicio.toLocaleString('pt-BR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              {vivo && <><span className="text-faint">·</span><span className="flex items-center gap-1 text-live tabular-nums"><Dot tone="live" pulse />{relogio(segundosDesde(c))}</span></>}
            </p>
            <LinhaDoTempo
              c={c}
              eventos={eventos}
              tecnicos={tecnicos}
              posicao={voz && !vivo && (tocando || tempo > 0) ? tempo : null}
              onSeek={voz && !vivo ? t => { setTempo(t); setTocando(true) } : undefined}
            />
          </div>
          {voz && (vivo ? <OuvirAoVivo avisar={avisar} /> : <Player c={c} pos={tempo} setPos={setTempo} tocando={tocando} setTocando={setTocando} avisar={avisar} />)}
        </div>

        {painel && (
          <Painel
            c={c}
            eventos={eventos}
            aba={aba}
            setAba={setAba}
            logsExpandido={largura === 'larga'}
            onExpandirLogs={() => setLargura(largura === 'larga' ? 'normal' : 'larga')}
            avisar={avisar}
          />
        )}
      </div>

      <Confirmar
        aberto={confirmar === 'encerrar'}
        titulo="Encerrar esta conversa?"
        texto="O agente para de responder e a ligação é desligada. A conversa fica como “Encerrada pela tela” e não volta a ficar ao vivo."
        acao="Encerrar"
        perigo
        onClose={() => setConfirmar(null)}
        onConfirmar={() => { encerrarConversa(c); onMudou(); avisar('Conversa encerrada') }}
      />
      <Confirmar
        aberto={confirmar === 'apagar'}
        titulo={`Apagar a conversa nº ${c.seq}?`}
        texto="Mensagens, eventos, logs e a nota do cliente são apagados para sempre. Não dá para desfazer."
        acao="Apagar"
        perigo
        onClose={() => setConfirmar(null)}
        onConfirmar={() => { apagarConversa(c); onClose(); onMudou(); avisar(`Conversa nº ${c.seq} apagada`) }}
      />
    </div>
  )
}
