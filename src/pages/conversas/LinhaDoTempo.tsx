import { useState } from 'react'
import { Icon } from '@/components/brand/Icon'
import { Pill, type PillTone } from '@/components/brand/Pill'
import { Waiting } from '@/components/brand/Dot'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { SENTIMENTO_LABEL, type Conversa, type Evento, type Fonte, type ToolCall } from '@/mocks/conversas'
import { Chip, ms, num, relogio } from './comum'

type Msg = Extract<Evento, { tipo: 'msg' }>

const TOM: Record<string, PillTone> = { positive: 'ok', neutral: 'neutral', negative: 'danger' }
const FONTE_TIPO: Record<Fonte['tipo'], string> = { file: 'Arquivo', url: 'Página', text: 'Texto' }

function Divisor({ children, tom, detalhes }: { children: React.ReactNode; tom?: 'warn' | 'danger' | 'brand'; detalhes?: [string, string][] }) {
  const [aberto, setAberto] = useState(false)
  const cor = tom === 'warn' ? 'text-caution' : tom === 'danger' ? 'text-danger' : tom === 'brand' ? 'text-brand' : 'text-dim'
  return (
    <div className="py-2">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <button
          disabled={!detalhes?.length}
          onClick={() => setAberto(a => !a)}
          className={cn('flex items-center gap-1.5 rounded-full border border-hairline px-3 py-0.5 text-[12.5px]', cor, detalhes?.length && 'hover:border-field')}
        >
          {children}
          {!!detalhes?.length && <Icon name={aberto ? 'up' : 'down'} className="size-3" />}
        </button>
        <span className="h-px flex-1 bg-hairline" />
      </div>
      {aberto && detalhes && (
        <dl className="mx-auto mt-2 grid w-fit grid-cols-[auto_auto] gap-x-4 gap-y-1 rounded-lg bg-surface px-4 py-2.5 text-[12.5px]">
          {detalhes.map(([k, v]) => <div key={k} className="contents"><dt className="text-dim">{k}</dt><dd>{v}</dd></div>)}
        </dl>
      )}
    </div>
  )
}

function Json({ valor }: { valor: unknown }) {
  return <pre className="max-h-56 overflow-auto rounded-md bg-surface px-3 py-2 text-[12px] leading-5 whitespace-pre-wrap text-ink-soft">{JSON.stringify(valor, null, 2)}</pre>
}

function ToolCallBlock({ tc, t }: { tc: ToolCall; t: number }) {
  const [aberto, setAberto] = useState(false)
  const badge = tc.timeout ? <Pill tone="danger">Tempo esgotado</Pill>
    : tc.erro ? <Pill tone="danger">Erro interno</Pill>
      : <Pill tone="ok">Sucesso · HTTP {tc.http}</Pill>
  return (
    <div className="mb-2 overflow-hidden rounded-lg border border-hairline">
      <button onClick={() => setAberto(a => !a)} className="flex h-9 w-full items-center gap-2.5 px-3 text-left text-[13px] hover:bg-surface">
        <Icon name="tool" className="size-3.5 text-dim" />
        <span className="font-medium">{tc.nome}</span>
        {badge}
        <span className={cn('text-[12px]', tc.ramo === 'onError' ? 'text-danger' : 'text-dim')}>{tc.ramo}</span>
        <span className="ml-auto tabular-nums text-dim">{relogio(t)} · {ms(tc.ms)}</span>
        <Icon name={aberto ? 'up' : 'down'} className="size-3.5 text-faint" />
      </button>
      {aberto && (
        <div className="space-y-3 border-t border-hairline px-3 py-3 text-[12.5px]">
          <p className="break-all"><span className="mr-2 rounded bg-surface-hover px-1.5 py-px font-medium">{tc.metodo}</span>{tc.url}</p>
          <div><p className="mb-1 text-dim">Entrada (argumentos extraídos pela LLM)</p><Json valor={tc.input} /></div>
          {tc.resposta !== undefined && <div><p className="mb-1 text-dim">Resposta</p><Json valor={tc.resposta} /></div>}
          {tc.erro && <div><p className="mb-1 text-dim">Erro</p><p className="rounded-md bg-danger/[0.06] px-3 py-2 text-danger">{tc.erro}</p></div>}
          <p className="text-dim">Ramo aplicado: <span className="text-ink">{tc.ramo}</span>{tc.ramo === 'onError' && ' — a mensagem de erro do fluxo foi usada.'}</p>
        </div>
      )}
    </div>
  )
}

function Mensagem({ m, c, atual, onSeek, onFonte }: { m: Msg; c: Conversa; atual: boolean; onSeek?: (t: number) => void; onFonte: (f: Fonte) => void }) {
  const [painel, setPainel] = useState<'llm' | 'rag' | null>(null)
  const agente = m.lado === 'agente'
  const alterna = (p: 'llm' | 'rag') => setPainel(x => (x === p ? null : p))

  return (
    <div className={cn('flex gap-3 rounded-xl px-2 py-3 transition-colors', atual ? 'bg-brand/[0.06]' : 'hover:bg-surface')}>
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', agente ? 'bg-brand/10 text-brand' : 'bg-ink text-canvas')}>
        <Icon name={agente ? 'agent' : 'user'} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-dim">
          <span className="text-ink-soft">{agente ? 'Agente' : c.contatoNome ?? 'Cliente'}</span>
          {agente && m.fase && <><span className="text-faint">›</span><span className="text-[12px]">{m.fase}</span></>}
          {m.tom && <span className="ml-1"><Pill tone={TOM[m.tom]} className="h-5 px-1.5 text-[11.5px]">Tom de voz: {SENTIMENTO_LABEL[m.tom]}</Pill></span>}
          {m.dtmf && <Pill className="ml-1 h-5 gap-1 px-1.5 text-[11.5px]"><Icon name="keyboard" className="size-3" /> digitado no teclado</Pill>}
        </p>

        {!!m.tools?.length && <div className="mt-2">{m.tools.map((tc, i) => <ToolCallBlock key={i} tc={tc} t={m.t} />)}</div>}

        <div className={cn('mt-1', m.contingencia && 'mt-2 rounded-lg border border-caution/40 bg-caution/[0.05] px-3 py-2')}>
          {m.contingencia && <p className="mb-1 text-[12px] font-medium text-caution">Resposta de contingência · {m.contingencia}</p>}
          {m.midia?.map(x => <p key={x} className="mb-1 flex items-center gap-1.5 text-[12.5px] text-dim"><Icon name="audio" className="size-3.5" /> {x}</p>)}
          <p className="text-[15px] leading-relaxed whitespace-pre-line">
            {m.emocao && <span className="mr-1.5 rounded bg-brand/10 px-1 py-px align-[1px] text-[11.5px] text-brand" title="Tag de emoção enviada ao TTS">{m.emocao}</span>}
            {m.texto}
          </p>
          {m.correcao && <p className="mt-1 text-[12.5px] text-dim">Correção do STT: {m.correcao}</p>}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Chip onClick={onSeek && (() => onSeek(m.t))} title={onSeek ? 'Ouvir a partir daqui' : 'Tempo desde o início'}>{relogio(m.t)}</Chip>
          {m.llm && <Chip ativo={painel === 'llm'} onClick={() => alterna('llm')}>LLM {m.llm.modelo} · {ms(m.llm.ms)}</Chip>}
          {m.rag && <Chip ativo={painel === 'rag'} onClick={() => alterna('rag')}>RAG · {m.rag.fontes.length} {m.rag.fontes.length === 1 ? 'fonte' : 'fontes'} · {m.rag.ms} ms</Chip>}
          {m.voz && <Chip title="Tempo até o primeiro byte do TTS">Voz · {m.voz.ttsMs} ms</Chip>}
          {m.voz && !m.voz.cortadaMs && <Chip>Falou {ms(m.voz.falouMs)}</Chip>}
          {m.voz?.cortadaMs && <Chip tom="warn" title="O cliente interrompeu (VAD)">Cortada após {ms(m.voz.cortadaMs)}</Chip>}
          {m.stt && <Chip>STT {m.stt.modelo} · fala {num(m.stt.falaMs)} ms</Chip>}
        </div>

        {painel === 'llm' && m.llm && (
          <div className="mt-2 rounded-lg border border-hairline px-3 py-2.5 text-[12.5px]">
            <p className="mb-1.5 font-medium">Chamada à LLM</p>
            <dl className="grid grid-cols-[150px_1fr] gap-y-1">
              {[
                ['Modelo', m.llm.modelo], ['Tempo total', ms(m.llm.ms)], ['Primeiro token', ms(m.llm.ttftMs)],
                ['Tokens de entrada', num(m.llm.tokensIn)], ['Em cache', `${num(m.llm.tokensCached)} (${Math.round((m.llm.tokensCached / m.llm.tokensIn) * 100)}%)`],
                ['Tokens de saída', num(m.llm.tokensOut)],
              ].map(([k, v]) => <div key={k} className="contents"><dt className="text-dim">{k}</dt><dd className="tabular-nums">{v}</dd></div>)}
            </dl>
          </div>
        )}
        {painel === 'rag' && m.rag && (
          <div className="mt-2 rounded-lg border border-hairline px-3 py-2.5 text-[12.5px]">
            <p className="mb-2 text-dim">Consulta: <span className="text-ink">“{m.rag.consulta}”</span></p>
            <ul className="space-y-1">
              {m.rag.fontes.map(f => (
                <li key={f.titulo}>
                  <button onClick={() => onFonte(f)} className="-mx-1.5 flex w-[calc(100%+12px)] items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-surface">
                    <Icon name="file" className="size-3.5 text-dim" />
                    <span className="flex-1 truncate">{f.titulo}</span>
                    <span className="tabular-nums text-dim">{f.score.toFixed(2).replace('.', ',')}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export function LinhaDoTempo({ c, eventos, tecnicos, posicao, onSeek }: {
  c: Conversa; eventos: Evento[]; tecnicos: boolean; posicao: number | null; onSeek?: (t: number) => void
}) {
  const [fonte, setFonte] = useState<Fonte | null>(null)
  const msgs = eventos.filter((e): e is Msg => e.tipo === 'msg')
  const atual = posicao === null ? null : msgs.findLast(m => m.t <= posicao) ?? null
  const ultimo = eventos.findLast(e => e.tipo === 'msg') as Msg | undefined

  return (
    <div className="space-y-1">
      {eventos.map((e, i) => {
        switch (e.tipo) {
          case 'msg':
            return <Mensagem key={i} m={e} c={c} atual={e === atual} onSeek={onSeek} onFonte={setFonte} />
          case 'fase':
            return (
              <Divisor key={i} tom="brand" detalhes={e.detalhes}>
                Fase {e.para} <span className="text-dim">· {e.motivo}</span>
              </Divisor>
            )
          case 'diretriz':
            return <Divisor key={i} tom="warn" detalhes={[['diretriz', e.titulo], ['detalhe', e.detalhe]]}><Icon name="guard" className="size-3.5" /> {e.titulo}</Divisor>
          case 'fim':
            return <Divisor key={i} tom={c.status === 'failed' ? 'danger' : undefined} detalhes={e.detalhe ? [['motivo', e.detalhe]] : undefined}>{e.titulo}</Divisor>
          case 'ponte':
            return (
              <p key={i} className="ml-13 flex items-center gap-2 py-1 text-[13px] text-dim">
                <Icon name="audio" className="size-3.5" /> Fala-ponte: <span className="text-ink-soft italic">“{e.texto}”</span>
                <span className="tabular-nums text-faint">{relogio(e.t)}</span>
              </p>
            )
          case 'tecnico':
            return tecnicos ? (
              <div key={i} className="ml-13 flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-md bg-surface px-2.5 py-1.5 text-[12px] text-dim">
                <Icon name="terminal" className="size-3.5" />
                <span className="font-medium text-ink-soft">{e.nome}</span>
                {e.linhas.map(([k, v]) => <span key={k}>{k}: <span className="text-ink-soft">{v}</span></span>)}
                <span className="ml-auto tabular-nums text-faint">{relogio(e.t)}</span>
              </div>
            ) : null
        }
      })}

      {c.status === 'in_progress' && (
        <p className="ml-13 flex items-center gap-2 py-3 text-[13px] text-dim">
          <Waiting className="text-live" /> {ultimo?.lado === 'agente' ? `${c.contatoNome?.split(' ')[0] ?? 'Cliente'} está falando…` : 'Agente pensando…'}
        </p>
      )}

      <Dialog open={!!fonte} onOpenChange={o => !o && setFonte(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{fonte?.titulo}</DialogTitle>
            <DialogDescription>{fonte && `${FONTE_TIPO[fonte.tipo]} da base de conhecimento · relevância ${fonte.score.toFixed(2).replace('.', ',')}`}</DialogDescription>
          </DialogHeader>
          <p className="rounded-lg bg-surface px-4 py-3 text-[14px] leading-relaxed">{fonte?.trecho}</p>
          <p className="text-[12.5px] text-dim">Trecho exato que entrou no prompt deste turno.</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
