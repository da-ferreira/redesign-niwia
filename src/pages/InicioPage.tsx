import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon } from '@/components/brand/Icon'
import { Pill } from '@/components/brand/Pill'
import { Dot } from '@/components/brand/Dot'
import { AgentMark } from '@/components/brand/AgentMark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useAviso } from '@/lib/aviso'
import { falhasRecentes } from '@/mocks/conversas'
import {
  agentes, aoVivoPorAgente, finalizacoesPorAgente, HORA_AGORA, ORIGENS, recomendacoes,
  serieDiaria, serieHoraria, type DiaRef, type OrigemConversa,
} from '@/mocks/data'

// Linha SVG simples: sem biblioteca de gráfico enquanto for protótipo.
function Linha({ dados, comparar, h = 160, area }: { dados: number[]; comparar?: number[]; h?: number; area?: boolean }) {
  const w = 600
  const todos = [...dados, ...(comparar ?? [])]
  const max = Math.max(...todos)
  // Com área a base é zero (volume); sem área a escala aperta na faixa, senão taxa e duração viram reta.
  const min = area ? 0 : Math.min(...todos)
  const y = (v: number) => h - 4 - ((v - min) / (max - min || 1)) * (h - 12)
  const x = (i: number, n: number) => (n > 1 ? (i / (n - 1)) * w : w / 2)
  const pts = (d: number[]) => d.map((v, i) => `${x(i, d.length)},${y(v)}`)
  const ultimo = dados.findLastIndex(v => v > 0)
  const atual = ultimo >= 0 ? dados.slice(0, ultimo + 1) : dados
  const p = atual.map((v, i) => `${x(i, dados.length)},${y(v)}`)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full overflow-visible" style={{ height: h }}>
      {comparar && <polyline points={pts(comparar).join(' ')} fill="none" stroke="var(--field)" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
      {area && <polygon points={`0,${h} ${p.join(' ')} ${p.at(-1)!.split(',')[0]},${h}`} fill="var(--brand)" opacity="0.08" />}
      <polyline points={p.join(' ')} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Delta({ v, invertido }: { v: number | null; invertido?: boolean }) {
  if (v == null || !isFinite(v)) return null
  const bom = invertido ? v < 0 : v > 0
  return <Pill tone={v === 0 ? 'neutral' : bom ? 'ok' : 'danger'} className="h-5 px-1.5 text-[12px] tabular-nums">{v > 0 ? '+' : ''}{num(v, 1)}%</Pill>
}

const num = (v: number, casas = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
const usd = (v: number) => `US$ ${num(v, 2)}`
const dur = (s: number) => `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, '0')}s`
const variacao = (atual: number, anterior: number) => (anterior ? ((atual - anterior) / anterior) * 100 : null)
const agora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

function Ajuda({ texto }: { texto: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<button aria-label="Como é calculado" className="text-faint hover:text-dim" />}>
        <Icon name="help" className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{texto}</TooltipContent>
    </Tooltip>
  )
}

function Card({ titulo, ajuda, extra, children, rodape }: { titulo: string; ajuda: string; extra?: React.ReactNode; children: React.ReactNode; rodape?: React.ReactNode }) {
  return (
    <section className="flex flex-col">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-[14px]">{titulo}</h3>
        <Ajuda texto={ajuda} />
        {extra && <span className="ml-auto">{extra}</span>}
      </div>
      <div className="flex-1">{children}</div>
      {rodape && <div className="mt-3 flex items-center justify-between text-[13px]">{rodape}</div>}
    </section>
  )
}

// Chip de filtro no padrão Stripe: pílula com o valor e a seta.
function Chip({ children, tracejado }: { children: React.ReactNode; tracejado?: boolean }) {
  return (
    <DropdownMenuTrigger
      render={<button className={cn('flex h-8 items-center gap-1.5 rounded-full border border-field px-3 text-[13px] hover:bg-surface data-popup-open:bg-surface', tracejado && 'border-dashed text-ink-soft')} />}
    >
      {children}
    </DropdownMenuTrigger>
  )
}

function Escolha<T extends string>({ valor, opcoes, onChange, className }: { valor: T; opcoes: { value: T; label: string }[]; onChange: (v: T) => void; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button className={cn('flex items-center gap-1 text-[14px] text-dim hover:text-ink', className)} />}>
        {opcoes.find(o => o.value === valor)?.label} <Icon name="down" className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuRadioGroup value={valor} onValueChange={v => onChange(v as T)}>
          {opcoes.map(o => <DropdownMenuRadioItem key={o.value} value={o.value}>{o.label}</DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const PERIODOS = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
] as const
type Periodo = (typeof PERIODOS)[number]['value']

const COMPARAR = [
  { value: 'anterior', label: 'Período anterior' },
  { value: 'nenhum', label: 'Sem comparação' },
] as const
type Comparar = (typeof COMPARAR)[number]['value']

const DIA_COMPARADO: { value: Exclude<DiaRef, 'hoje'>; label: string; rodape: string }[] = [
  { value: 'ontem', label: 'Ontem', rodape: 'no mesmo horário' },
  { value: 'semana_passada', label: 'Semana passada', rodape: 'mesmo dia, mesmo horário' },
]

const CARDS = [
  { id: 'conversas', label: 'Conversas encerradas' },
  { id: 'sucesso', label: 'Taxa de sucesso' },
  { id: 'duracao', label: 'Duração média' },
  { id: 'custo', label: 'Custo de LLM' },
  { id: 'finalizacoes', label: 'Finalizações' },
  { id: 'falhas', label: 'Falhas recentes' },
  { id: 'agentes', label: 'Agentes mais ativos' },
] as const
type CardId = (typeof CARDS)[number]['id']

const CORES_FIN = ['var(--ok)', 'var(--brand)', '#7c9fd6', 'var(--caution)', '#9b7fd6', '#5fa8a0']
const ROTULOS: Record<string, string> = {
  ACORDO: 'Acordo', PROMESSA: 'Promessa de pagamento', BOLETO_ENVIADO: 'Boleto enviado', CONTESTACAO: 'Contestação',
  NUMERO_ERRADO: 'Número errado', SEGUNDA_VIA: 'Segunda via', DUVIDA_FATURA: 'Dúvida na fatura',
}
const rotulo = (v: string) => ROTULOS[v] ?? v.charAt(0) + v.slice(1).toLowerCase().replaceAll('_', ' ')

function NovoAgente({ aberto, onClose, onCriar }: { aberto: boolean; onClose: () => void; onCriar: (nome: string) => void }) {
  const [nome, setNome] = useState('')
  const valido = nome.trim().length >= 3
  return (
    <Dialog open={aberto} onOpenChange={o => { if (!o) { onClose(); setNome('') } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo agente</DialogTitle>
          <DialogDescription>Ele começa como rascunho, sem ramal e sem base de conhecimento.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={e => { e.preventDefault(); if (valido) { onCriar(nome.trim()); setNome('') } }}
          className="space-y-4"
        >
          <label className="block space-y-1.5">
            <span className="text-[13px] font-medium">Nome</span>
            <Input autoFocus value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Cobrança Vivo" />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!valido}>Criar agente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function InicioPage() {
  const navigate = useNavigate()
  const [aviso, avisar] = useAviso()
  const [novoAberto, setNovoAberto] = useState(false)
  const [atualizado, setAtualizado] = useState('14:52')

  // Hoje
  const [origem, setOrigem] = useState<OrigemConversa | 'todas'>('voice')
  const [diaComparado, setDiaComparado] = useState<Exclude<DiaRef, 'hoje'>>('ontem')
  const [dispensadas, setDispensadas] = useState<string[]>([])

  // Panorama
  const [periodo, setPeriodo] = useState<Periodo>('7')
  const [comparar, setComparar] = useState<Comparar>('anterior')
  const [filtroAgentes, setFiltroAgentes] = useState<string[]>([])
  const [visiveis, setVisiveis] = useState<CardId[]>(CARDS.map(c => c.id))

  const todosIds = agentes.map(a => a.id)
  const ids = filtroAgentes.length ? filtroAgentes : todosIds
  const nomeAgente = (id: string) => agentes.find(a => a.id === id)?.nome ?? '—'
  const conversasDe = (id: string) => `/agentes/${id}/conversas`
  const principal = ids[0] ?? todosIds[0]

  const hojeSerie = serieHoraria(todosIds, origem, 'hoje')
  const comparadoSerie = serieHoraria(todosIds, origem, diaComparado)
  const totalHoje = hojeSerie.reduce((a, b) => a + b, 0)
  const totalComparado = comparadoSerie.slice(0, HORA_AGORA + 1).reduce((a, b) => a + b, 0)

  const aoVivo = todosIds.reduce((s, id) => s + (aoVivoPorAgente[id] ?? 0), 0)
  const publicados = agentes.filter(a => a.publicada).length
  const recs = recomendacoes.filter(r => !dispensadas.includes(r.id))

  const dias = Number(periodo)
  const painel = (() => {
    const atual = serieDiaria(ids, dias)
    const anterior = serieDiaria(ids, dias, dias)
    const soma = (s: typeof atual, k: keyof (typeof atual)[number]) => s.reduce((a, d) => a + d[k], 0)
    const conv = soma(atual, 'conversas'), convAnt = soma(anterior, 'conversas')
    const taxa = (s: typeof atual) => (soma(s, 'sucesso') / (soma(s, 'avaliadas') || 1)) * 100
    const durMedia = (s: typeof atual) => soma(s, 'duracaoTotalS') / (soma(s, 'conversas') || 1)
    return {
      conversas: { valor: num(conv), anterior: `${num(convAnt)} no período anterior`, delta: variacao(conv, convAnt), serie: atual.map(d => d.conversas) },
      sucesso: { valor: `${num(taxa(atual), 1)}%`, anterior: `${num(taxa(anterior), 1)}% no período anterior`, delta: taxa(atual) - taxa(anterior), serie: atual.map(d => (d.sucesso / (d.avaliadas || 1)) * 100) },
      duracao: { valor: dur(durMedia(atual)), anterior: `${dur(durMedia(anterior))} no período anterior`, delta: variacao(durMedia(atual), durMedia(anterior)), serie: atual.map(d => d.duracaoTotalS / (d.conversas || 1)) },
      custo: { valor: usd(soma(atual, 'custoUsd')), anterior: `${usd(soma(anterior, 'custoUsd'))} no período anterior`, delta: variacao(soma(atual, 'custoUsd'), soma(anterior, 'custoUsd')), serie: atual.map(d => d.custoUsd) },
      porAgente: ids.map(id => {
        const s = serieDiaria([id], dias)
        return { id, conversas: soma(s, 'conversas'), sucesso: (soma(s, 'sucesso') / (soma(s, 'avaliadas') || 1)) * 100 }
      }).sort((a, b) => b.conversas - a.conversas),
      conversasTotal: conv,
    }
  })()

  const finalizacoes = (() => {
    const mapa = new Map<string, number>()
    for (const a of painel.porAgente) {
      for (const f of finalizacoesPorAgente[a.id] ?? []) mapa.set(f.valor, (mapa.get(f.valor) ?? 0) + Math.round(a.conversas * f.peso))
    }
    // DESCONHECIDO sempre por último: é o "não soube tabular", não uma categoria do negócio.
    const lista = [...mapa].map(([valor, qtd]) => ({ valor, qtd })).sort((a, b) => (a.valor === 'DESCONHECIDO' ? 1 : b.valor === 'DESCONHECIDO' ? -1 : b.qtd - a.qtd))
    const top = lista.filter(f => f.valor !== 'DESCONHECIDO').slice(0, 4)
    const resto = lista.filter(f => !top.includes(f))
    const outros = resto.reduce((s, f) => s + f.qtd, 0)
    return [
      ...top.map((f, i) => ({ ...f, label: rotulo(f.valor), cor: CORES_FIN[i] })),
      ...(outros ? [{ valor: 'OUTROS', qtd: outros, label: 'Outras e desconhecido', cor: 'var(--field)' }] : []),
    ]
  })()
  const totalFin = finalizacoes.reduce((s, f) => s + f.qtd, 0)

  const falhas = falhasRecentes(ids)
  const deltaOuNada = (v: number | null) => (comparar === 'nenhum' ? null : v)
  const anteriorOuNada = (t: string) => (comparar === 'nenhum' ? ' ' : t)

  const atualizadoBtn = (
    <button onClick={() => { setAtualizado(agora()); avisar('Painel atualizado') }} className="flex items-center gap-1 text-faint hover:text-dim">
      Atualizado {atualizado}
    </button>
  )
  const verMais = (to: string) => <Link to={to} className="text-brand hover:underline">Ver mais</Link>

  function criarAgente(nome: string) {
    const id = Math.random().toString(16).slice(2, 10)
    agentes.push({ id, nome, versao: 1, publicada: false, criadoPor: 'David Ferreira', criadoEm: '6 out 2026' })
    setNovoAberto(false)
    navigate(`/agentes/${id}/agente`)
  }

  const metrica = (id: 'conversas' | 'sucesso' | 'duracao' | 'custo', titulo: string, ajuda: string, invertido?: boolean, deltaPontos?: boolean) => {
    const m = painel[id]
    return (
      <Card
        key={id}
        titulo={titulo}
        ajuda={ajuda}
        extra={deltaPontos && comparar !== 'nenhum'
          ? <Pill tone={m.delta! >= 0 ? 'ok' : 'danger'} className="h-5 px-1.5 text-[12px] tabular-nums">{m.delta! > 0 ? '+' : ''}{num(m.delta!, 1)} p.p.</Pill>
          : <Delta v={deltaOuNada(m.delta)} invertido={invertido} />}
        rodape={<>{verMais(conversasDe(principal))}{atualizadoBtn}</>}
      >
        <p className="text-[20px] tabular-nums">{m.valor}</p>
        <p className="mb-3 text-[13px] text-dim">{anteriorOuNada(m.anterior)}</p>
        <Linha dados={m.serie} h={72} />
      </Card>
    )
  }

  const blocos: Record<CardId, React.ReactNode> = {
    conversas: metrica('conversas', 'Conversas encerradas', 'Conversas finalizadas no período, de todos os canais: ligação, WhatsApp e chat de teste.'),
    sucesso: metrica('sucesso', 'Taxa de sucesso', 'Conversas que a análise pós-atendimento classificou como sucesso, sobre as que foram avaliadas.', false, true),
    duracao: metrica('duracao', 'Duração média', 'Tempo médio entre o início e o encerramento da conversa.', true),
    custo: metrica('custo', 'Custo de LLM', 'Tokens de entrada e saída de cada conversa multiplicados pelo preço do modelo usado. Modelo sem preço cadastrado fica de fora.', true),
    finalizacoes: (
      <Card key="finalizacoes" titulo="Finalizações" ajuda="Tabulação que a IA escolheu ao encerrar cada conversa, do catálogo de finalizações de cada agente." rodape={<>{verMais(conversasDe(principal))}{atualizadoBtn}</>}>
        {totalFin ? (
          <>
            <div className="mt-1 mb-4 flex h-2 gap-0.5 overflow-hidden rounded-full">
              {finalizacoes.map(f => <span key={f.valor} title={`${f.label}: ${num(f.qtd)}`} style={{ width: `${(f.qtd / totalFin) * 100}%`, background: f.cor }} />)}
            </div>
            <ul className="space-y-2.5 text-[14px]">
              {finalizacoes.map(f => (
                <li key={f.valor} className="flex items-center gap-2.5">
                  <span className="size-2 rounded-[3px]" style={{ background: f.cor }} />
                  <span className="flex-1 text-ink-soft">{f.label}</span>
                  <span className="text-[13px] text-faint tabular-nums">{num((f.qtd / totalFin) * 100)}%</span>
                  <span className="w-12 text-right tabular-nums">{num(f.qtd)}</span>
                </li>
              ))}
            </ul>
          </>
        ) : <p className="py-6 text-[14px] text-dim">Nenhum agente selecionado tem catálogo de finalizações.</p>}
      </Card>
    ),
    falhas: (
      <Card
        key="falhas"
        titulo="Falhas recentes"
        ajuda="Conversas avaliadas como falha ou encerradas por erro, das mais recentes para as mais antigas."
        rodape={<><Link to={conversasDe(falhas[0]?.agenteId ?? principal)} className="text-brand hover:underline">{Math.min(3, falhas.length)} de {falhas.length} resultados</Link>{atualizadoBtn}</>}
      >
        {falhas.length ? (
          <ul className="divide-y divide-hairline">
            {falhas.slice(0, 3).map(f => (
              <li key={f.id}>
                <Link to={`${conversasDe(f.agenteId)}?conversa=${f.id}`} className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-surface">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px]">{f.titulo}</p>
                    <p className="truncate text-[13px] text-dim">{nomeAgente(f.agenteId)} · {f.hora}</p>
                  </div>
                  <Pill tone="danger">{f.motivo}</Pill>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="py-6 text-[14px] text-dim">Nenhuma falha no período.</p>}
      </Card>
    ),
    agentes: (
      <Card key="agentes" titulo="Agentes mais ativos" ajuda="Agentes com mais conversas encerradas no período. O número em azul é quantas estão em andamento agora." extra={<span className="text-[13px] text-dim">{dias} dias</span>} rodape={<><Link to="/agentes" className="text-brand hover:underline">Ver todos</Link>{atualizadoBtn}</>}>
        <ul className="divide-y divide-hairline">
          {painel.porAgente.slice(0, 3).map(a => (
            <li key={a.id}>
              <Link to={`/agentes/${a.id}/agente`} className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-surface">
                <AgentMark name={nomeAgente(a.id)} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px]">{nomeAgente(a.id)}</p>
                  <p className="text-[13px] text-dim tabular-nums">{num(a.conversas)} conversas{a.conversas ? ` · ${num(a.sucesso, 1)}% de sucesso` : ''}</p>
                </div>
                {(aoVivoPorAgente[a.id] ?? 0) > 0 && <span className="flex items-center gap-1.5 text-[13px] text-live tabular-nums"><Dot tone="live" pulse /> {aoVivoPorAgente[a.id]}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    ),
  }

  const origemLabel = ORIGENS.find(o => o.value === origem)!.label

  return (
    <>
      <PageHeader title="Início">
        <Button variant="outline" onClick={() => setNovoAberto(true)}><Icon name="plus" /> Novo agente</Button>
      </PageHeader>
      <NovoAgente aberto={novoAberto} onClose={() => setNovoAberto(false)} onCriar={criarAgente} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1320px] px-12 pt-12 pb-16">
          <h2 className="titulo-pagina border-b border-hairline pb-4 text-[30px] leading-none tracking-[-0.01em]">Hoje</h2>

          <div className={cn('grid gap-12 pt-8', recs.length ? 'grid-cols-[minmax(0,1fr)_340px]' : 'grid-cols-1')}>
            <div>
              <div className="flex gap-12">
                <div>
                  <Escolha valor={origem} opcoes={ORIGENS} onChange={setOrigem} />
                  <p className="mt-1 text-[22px] tabular-nums">{num(totalHoje)}</p>
                  <p className="text-[13px] text-faint tabular-nums">até 14:52</p>
                </div>
                <div>
                  <Escolha valor={diaComparado} opcoes={DIA_COMPARADO} onChange={setDiaComparado} />
                  <p className="mt-1 text-[22px] text-dim tabular-nums">{num(totalComparado)}</p>
                  <p className="text-[13px] text-faint">{DIA_COMPARADO.find(d => d.value === diaComparado)!.rodape}</p>
                </div>
              </div>
              <div className="mt-6">
                <Linha dados={hojeSerie} comparar={comparadoSerie} h={180} area />
                <div className="mt-2 flex justify-between text-[12px] text-faint tabular-nums"><span>00:00</span><span>12:00</span><span>23:59</span></div>
                <p className="mt-3 flex items-center gap-4 text-[12px] text-dim">
                  <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-brand" /> {origemLabel} hoje</span>
                  <span className="flex items-center gap-1.5"><span className="h-0 w-3 border-t-[1.5px] border-dashed border-field" /> {DIA_COMPARADO.find(d => d.value === diaComparado)!.label}</span>
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-10 border-t border-hairline pt-6">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] text-dim">Ao vivo agora</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<button className="text-[13px] text-brand hover:underline" />}>Ver conversas</DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <p className="px-2 pt-1.5 pb-1 text-[12px] text-dim">Em andamento por agente</p>
                        {agentes.map(a => (
                          <DropdownMenuItem key={a.id} className="gap-2.5" onClick={() => navigate(conversasDe(a.id))}>
                            <AgentMark name={a.nome} size="xs" />
                            <span className="flex-1 truncate">{a.nome}</span>
                            <span className="text-[12px] text-dim tabular-nums">{aoVivoPorAgente[a.id] ?? 0}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-1 flex items-center gap-2.5 text-[22px] tabular-nums">{aoVivo > 0 && <Dot tone="live" pulse />} {aoVivo}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between"><p className="text-[14px] text-dim">Agentes publicados</p><Link to="/agentes" className="text-[13px] text-brand hover:underline">Ver agentes</Link></div>
                  <p className="mt-1 text-[22px] tabular-nums">{publicados} <span className="text-[14px] text-dim">de {agentes.length}</span></p>
                </div>
              </div>
            </div>

            {recs.length > 0 && (
              <aside>
                <section className="rounded-2xl bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px]">Recomendações</h3>
                    <button
                      aria-label="Dispensar todas"
                      onClick={() => { setDispensadas(recomendacoes.map(r => r.id)); avisar('Recomendações dispensadas') }}
                      className="text-dim hover:text-ink"
                    >
                      <Icon name="close" />
                    </button>
                  </div>
                  {recs.map((r, i) => (
                    <div key={r.id}>
                      {i > 0 && <div className="my-4 h-px bg-field/60" />}
                      <p className={cn('text-[14px] leading-relaxed text-ink-soft', i === 0 && 'mt-2')}>{r.texto}</p>
                      <div className="mt-1 flex items-center gap-3 text-[14px]">
                        <Link to={`/agentes/${r.agenteId}/${r.destino}`} className="text-brand hover:underline">{r.acao}</Link>
                        <button onClick={() => setDispensadas(d => [...d, r.id])} className="text-dim hover:text-ink">Dispensar</button>
                      </div>
                    </div>
                  ))}
                </section>
              </aside>
            )}
          </div>

          <div className="mt-16 mb-6 flex items-center gap-4">
            <h2 className="text-[22px]">Seu panorama</h2>
          </div>
          <div className="mb-8 flex flex-wrap items-center gap-2 text-[13px]">
            <DropdownMenu>
              <Chip><Icon name="calendar" className="size-3.5 text-dim" /> {PERIODOS.find(p => p.value === periodo)!.label} <Icon name="down" className="size-3.5 text-dim" /></Chip>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuRadioGroup value={periodo} onValueChange={v => setPeriodo(v as Periodo)}>
                  {PERIODOS.map(p => <DropdownMenuRadioItem key={p.value} value={p.value}>{p.label}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-dim">comparado a</span>
            <DropdownMenu>
              <Chip>{COMPARAR.find(c => c.value === comparar)!.label} <Icon name="down" className="size-3.5 text-dim" /></Chip>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuRadioGroup value={comparar} onValueChange={v => setComparar(v as Comparar)}>
                  {COMPARAR.map(c => <DropdownMenuRadioItem key={c.value} value={c.value}>{c.label}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              {filtroAgentes.length ? (
                <span className="flex h-8 items-center overflow-hidden rounded-full border border-field">
                  <button onClick={() => setFiltroAgentes([])} aria-label="Limpar filtro de agente" className="flex h-full items-center pr-1 pl-2.5 text-dim hover:text-ink">
                    <Icon name="close" className="size-3.5" />
                  </button>
                  <span className="pr-1.5 text-dim">Agente</span>
                  <span className="h-4 border-l border-field" />
                  <DropdownMenuTrigger render={<button className="h-full px-2.5 text-brand hover:bg-surface" />}>
                    {filtroAgentes.length === 1 ? nomeAgente(filtroAgentes[0]) : `${filtroAgentes.length} agentes`}
                  </DropdownMenuTrigger>
                </span>
              ) : (
                <Chip tracejado><Icon name="plus" className="size-3.5 text-dim" /> Agente</Chip>
              )}
              <DropdownMenuContent align="start" className="w-56">
                <p className="px-2 pt-1.5 pb-1 text-[12px] text-dim">Filtrar por agente</p>
                {agentes.map(a => (
                  <DropdownMenuCheckboxItem
                    key={a.id}
                    checked={filtroAgentes.includes(a.id)}
                    onCheckedChange={on => setFiltroAgentes(f => (on ? [...f, a.id] : f.filter(x => x !== a.id)))}
                    className="gap-2.5"
                  >
                    <AgentMark name={a.nome} size="xs" /> {a.nome}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}><Icon name="settings" /> Editar</DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <p className="px-2 pt-1.5 pb-1 text-[12px] text-dim">Cartões visíveis</p>
                {CARDS.map(c => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    checked={visiveis.includes(c.id)}
                    onCheckedChange={on => setVisiveis(v => (on ? CARDS.map(x => x.id).filter(x => x === c.id || v.includes(x)) : v.filter(x => x !== c.id)))}
                  >
                    {c.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setVisiveis(CARDS.map(c => c.id))}>Restaurar padrão</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {visiveis.length ? (
            <div className="grid grid-cols-3 gap-x-10 gap-y-12 border-t border-hairline pt-8">
              {visiveis.map(id => blocos[id])}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-field py-14 text-center text-[14px] text-dim">
              Nenhum cartão visível. <button onClick={() => setVisiveis(CARDS.map(c => c.id))} className="text-brand hover:underline">Restaurar padrão</button>
            </div>
          )}
        </div>
      </div>
      {aviso}
    </>
  )
}
