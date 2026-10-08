import { useMemo, useState } from 'react'
import { Icon } from '@/components/brand/Icon'
import { Pill } from '@/components/brand/Pill'
import { Dot } from '@/components/brand/Dot'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  baixar, END_REASON_LABEL, formatarTelefone, fasesDoAgente, FRUSTRACAO_LABEL, logsDe, nomeAgente, rotuloFinalizacao, SENTIMENTO_LABEL, STATUS_LABEL,
  type Conversa, type Evento, type Nivel,
} from '@/mocks/conversas'
import { AvaliacaoPill, Campos, Copiar, dur, num, usd } from './comum'

const ABAS = [
  { id: 'geral', label: 'Visão geral' },
  { id: 'dados', label: 'Dados da conversa' },
  { id: 'logs', label: 'Logs' },
] as const
export type Aba = (typeof ABAS)[number]['id']

const Titulo = ({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) => (
  <div className="mb-3 flex items-center justify-between"><h3 className="text-[15px] font-semibold">{children}</h3>{extra}</div>
)
const Secao = ({ children }: { children: React.ReactNode }) => <section className="border-b border-hairline py-6 first:pt-0 last:border-0">{children}</section>

function VisaoGeral({ c, eventos, avisar }: { c: Conversa; eventos: Evento[]; avisar: (m: string) => void }) {
  const visitadas = new Set([c.primeiraFase, ...eventos.flatMap(e => (e.tipo === 'fase' ? [e.para] : []))])
  const vivo = c.status === 'in_progress'
  const agenteMsgs = Math.max(1, c.turnos)
  const ultimaMudanca = eventos.findLast(e => e.tipo === 'fase')
  const faseAtual = vivo ? (ultimaMudanca?.tipo === 'fase' ? ultimaMudanca.para : c.primeiraFase) : c.ultimaFase
  return (
    <>
      <Secao>
        <Titulo>Resumo</Titulo>
        {c.resumo
          ? <p className="text-[14px] leading-relaxed text-ink-soft">{c.resumo}</p>
          : <p className="text-[14px] text-dim">{vivo ? 'O resumo é gerado pela LLM quando a conversa termina.' : 'Sem resumo.'}</p>}
      </Secao>

      {c.nota && (
        <Secao>
          <Titulo extra={<span className="text-[12.5px] text-dim">conversation_ratings</span>}>Nota do cliente</Titulo>
          <div className="flex items-center gap-3">
            <span className="text-[24px] font-semibold tabular-nums">{c.nota.score}</span>
            <span className="text-[14px] text-dim">de {c.nota.max}</span>
            <span className="flex gap-0.5">
              {Array.from({ length: c.nota.max - c.nota.min + 1 }, (_, i) => (
                <span key={i} className={cn('h-1.5 w-5 rounded-full', i < c.nota!.score ? (c.nota!.score >= 4 ? 'bg-ok' : c.nota!.score <= 2 ? 'bg-danger' : 'bg-caution') : 'bg-field')} />
              ))}
            </span>
          </div>
          {c.nota.descricao && <p className="mt-2 text-[14px] text-ink-soft">“{c.nota.descricao}”</p>}
        </Secao>
      )}

      <Secao>
        <Titulo>Finalização</Titulo>
        {c.finalizacao ? (
          <>
            <p className="flex items-center gap-2 text-[14px] font-medium">{rotuloFinalizacao(c.finalizacao.valor)} <span className="text-[12.5px] font-normal text-dim">{c.finalizacao.valor}</span></p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{c.finalizacao.razao}</p>
          </>
        ) : <p className="text-[14px] text-dim">{vivo ? 'Escolhida pela IA no encerramento.' : 'Agente sem catálogo de finalizações neste canal.'}</p>}
      </Secao>

      <Secao>
        <Titulo>Fases do fluxo</Titulo>
        <ol className="space-y-1.5">
          {fasesDoAgente(c.agenteId).map((f, i) => {
            const on = visitadas.has(f)
            const ultima = f === faseAtual
            return (
              <li key={f} className={cn('flex items-center gap-2.5 text-[14px]', !on && 'text-faint')}>
                <span className={cn('flex size-5 items-center justify-center rounded-full text-[11px] tabular-nums', on ? 'bg-brand/10 text-brand' : 'bg-surface text-faint')}>{i + 1}</span>
                {f}
                {ultima && <span className="text-[12px] text-dim">· {vivo ? 'atual' : 'última'}</span>}
              </li>
            )
          })}
        </ol>
      </Secao>

      <Secao>
        <Titulo>Metadados</Titulo>
        <Campos linhas={[
          ['ID', <><span className="truncate text-[13px]">{c.id}</span><Copiar valor={c.id} rotulo="ID" avisar={avisar} /><span className="shrink-0 text-[13px] whitespace-nowrap text-dim tabular-nums">nº {c.seq}</span></>],
          [c.origem === 'test_chat' ? 'Usuário' : 'Telefone', c.contato ? <><span className="truncate tabular-nums">{formatarTelefone(c.contato)}</span><Copiar valor={c.contato} rotulo="Contato" avisar={avisar} /></> : null],
          ['Data', c.inicio.toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'medium' })],
          ['Agente', nomeAgente(c.agenteId)],
          ['Modelo', c.modelo],
          ['Fluxo', <span className="truncate text-[13px]" title={c.flowKey}>{c.flowKey}</span>],
          ['Base de conhecimento', c.temRag ? <Pill tone="ok" dot>Ativa</Pill> : <Pill dot>Inativa</Pill>],
          ['Status', <>{STATUS_LABEL[c.status]}{c.endReason && <span className="text-dim">· {END_REASON_LABEL[c.endReason] ?? c.endReason}</span>}</>],
          ['Avaliação', <AvaliacaoPill c={c} />],
          ['Sentimento', c.sentimento && <Pill dot tone={c.sentimento === 'positive' ? 'ok' : c.sentimento === 'negative' ? 'danger' : 'neutral'}>{SENTIMENTO_LABEL[c.sentimento]}</Pill>],
          ['Humor final', c.humor],
          ['Frustração', c.frustracao && FRUSTRACAO_LABEL[c.frustracao]],
          ['Duração', dur(c.duracaoMs)],
          ['Mensagens · turnos', `${c.mensagens} · ${c.turnos}`],
          ['Tools', c.tools ? <>{c.tools}{c.toolErros > 0 && <span className="text-danger">· {c.toolErros} com erro</span>}</> : '0'],
          ['Diretrizes acionadas', String(c.diretrizes)],
          ['Tokens entrada · saída', <span className="tabular-nums">{num(c.tokensIn)} <span className="text-dim">({num(c.tokensCached)} em cache)</span> · {num(c.tokensOut)}</span>],
          ['Custo LLM', <span className="tabular-nums">{usd(c.custoUsd)} <span className="text-dim">· {usd(c.custoUsd / agenteMsgs, 5)} por resposta</span></span>],
        ]} />
      </Secao>
    </>
  )
}

function Dados({ c, avisar }: { c: Conversa; avisar: (m: string) => void }) {
  if (!c.contexto.length) {
    return <p className="py-10 text-center text-[14px] text-dim">Conversa sem dados de contexto. Chats de teste não recebem mailing.</p>
  }
  return (
    <>
      <p className="mb-4 text-[13px] text-dim">Campos que o fluxo recebeu antes do primeiro turno — usados nos placeholders <code className="rounded bg-surface px-1">{'{{mailing.*}}'}</code>.</p>
      <div className="divide-y divide-hairline rounded-lg border border-hairline">
        {c.contexto.map(([k, v]) => (
          <div key={k} className="group flex items-center gap-3 px-3 py-2.5 text-[14px]">
            <span className="w-40 shrink-0 truncate text-[13px] text-dim">{k}</span>
            <span className="min-w-0 flex-1 truncate tabular-nums">{v}</span>
            <span className="opacity-0 group-hover:opacity-100"><Copiar valor={v} rotulo={k} avisar={avisar} /></span>
          </div>
        ))}
      </div>
    </>
  )
}

const NIVEIS: { id: Nivel; label: string; tom: 'muted' | 'caution' | 'danger' }[] = [
  { id: 'info', label: 'info', tom: 'muted' },
  { id: 'warn', label: 'warn', tom: 'caution' },
  { id: 'error', label: 'error', tom: 'danger' },
]

function Logs({ c, eventos, expandido, onExpandir }: { c: Conversa; eventos: Evento[]; expandido: boolean; onExpandir: () => void }) {
  const [busca, setBusca] = useState('')
  const [niveis, setNiveis] = useState<Set<Nivel>>(new Set(['info', 'warn', 'error']))
  const [tag, setTag] = useState<string | null>(null)
  const [todasTags, setTodasTags] = useState(false)
  const [abertas, setAbertas] = useState<Set<number>>(new Set())
  const linhas = useMemo(() => logsDe(c, eventos), [c, eventos])

  const tags = Object.entries(linhas.reduce<Record<string, number>>((a, l) => ({ ...a, [l.tag]: (a[l.tag] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])
  const q = busca.toLowerCase()
  const filtradas = linhas.filter(l => niveis.has(l.nivel) && (!tag || l.tag === tag) && (!q || l.msg.toLowerCase().includes(q) || l.tag.toLowerCase().includes(q)))
  const hora = (t: number) => new Date(c.inicio.getTime() + t * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const alterna = <T,>(s: Set<T>, v: T) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); return n }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-dim" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar nos logs..." className="h-8 w-full rounded-lg border border-field bg-canvas pr-3 pl-8 text-[13px] outline-none placeholder:text-faint focus:border-ink/30" />
        </div>
        <div className="flex h-8 overflow-hidden rounded-lg border border-field">
          {NIVEIS.map(n => (
            <button key={n.id} onClick={() => setNiveis(s => alterna(s, n.id))} className={cn('flex items-center gap-1.5 border-l border-field px-2.5 text-[12.5px] first:border-l-0', niveis.has(n.id) ? 'bg-surface text-ink' : 'text-faint')}>
              <Dot tone={niveis.has(n.id) ? n.tom : 'muted'} /> {n.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Baixar logs" title="Baixar .txt" onClick={() => baixar(`logs-${c.id}.txt`, filtradas.map(l => `${hora(l.t)} [${l.nivel.toUpperCase()}] [${l.tag}] ${l.msg}`).join('\n'))}>
          <Icon name="download" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label={expandido ? 'Reduzir' : 'Expandir'} title={expandido ? 'Reduzir' : 'Expandir'} onClick={onExpandir}>
          <Icon name="expand" />
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {(todasTags ? tags : tags.slice(0, 10)).map(([t, n]) => (
          <button key={t} onClick={() => setTag(x => (x === t ? null : t))} className={cn('h-6 rounded-md border px-2 text-[12px] tabular-nums', tag === t ? 'border-brand bg-brand/10 text-brand' : 'border-hairline text-ink-soft hover:border-field')}>
            {t} <span className="text-dim">{n}</span>
          </button>
        ))}
        {tags.length > 10 && <button onClick={() => setTodasTags(v => !v)} className="h-6 px-1.5 text-[12px] text-brand">{todasTags ? 'menos' : `+${tags.length - 10}`}</button>}
      </div>

      <p className="mb-2 flex items-center gap-2 text-[12px] text-dim tabular-nums">
        {filtradas.length} de {linhas.length} linhas
        {c.status === 'in_progress' && <span className="flex items-center gap-1.5 text-live"><Dot tone="live" pulse /> ao vivo · atualiza a cada 3 s</span>}
      </p>

      <div className="rounded-lg border border-hairline text-[12px] leading-5">
        {filtradas.map((l, i) => {
          const multi = l.msg.includes('\n')
          const aberta = abertas.has(i)
          return (
            <button
              key={i}
              onClick={() => multi && setAbertas(s => alterna(s, i))}
              className={cn('flex w-full gap-2.5 border-b border-hairline px-2.5 py-1 text-left last:border-0', l.nivel === 'error' ? 'bg-danger/[0.05]' : l.nivel === 'warn' ? 'bg-caution/[0.05]' : '', multi && 'hover:bg-surface')}
            >
              <span className="shrink-0 tabular-nums text-faint">{hora(l.t)}</span>
              <span className={cn('w-16 shrink-0 font-medium', l.nivel === 'error' ? 'text-danger' : l.nivel === 'warn' ? 'text-caution' : 'text-ink-soft')}>{l.tag}</span>
              <span className={cn('min-w-0 flex-1 break-words whitespace-pre-wrap text-ink-soft', !aberta && 'truncate whitespace-nowrap')}>{aberta ? l.msg : l.msg.split('\n')[0]}</span>
              {multi && <Icon name={aberta ? 'up' : 'down'} className="mt-0.5 size-3 shrink-0 text-faint" />}
            </button>
          )
        })}
        {!filtradas.length && <p className="px-3 py-6 text-center text-dim">Nenhuma linha com esses filtros.</p>}
      </div>
    </div>
  )
}

export function Painel({ c, eventos, aba, setAba, logsExpandido, onExpandirLogs, avisar }: {
  c: Conversa; eventos: Evento[]; aba: Aba; setAba: (a: Aba) => void; logsExpandido: boolean; onExpandirLogs: () => void; avisar: (m: string) => void
}) {
  return (
    <aside className="flex min-h-0 flex-col border-l border-hairline">
      <div className="flex h-11 shrink-0 items-end gap-5 border-b border-hairline px-6">
        {ABAS.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)} className={cn('-mb-px border-b-2 pb-2.5 text-[14px]', aba === a.id ? 'border-ink text-ink' : 'border-transparent text-dim hover:text-ink')}>
            {a.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {aba === 'geral' && <VisaoGeral c={c} eventos={eventos} avisar={avisar} />}
        {aba === 'dados' && <Dados c={c} avisar={avisar} />}
        {aba === 'logs' && <Logs key={c.id} c={c} eventos={eventos} expandido={logsExpandido} onExpandir={onExpandirLogs} />}
      </div>
    </aside>
  )
}
