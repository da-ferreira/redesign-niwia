import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon } from '@/components/brand/Icon'
import { Pill } from '@/components/brand/Pill'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAviso } from '@/lib/aviso'
import { cn } from '@/lib/utils'
import { agentes } from '@/mocks/data'
import {
  agora, catalogoFinalizacoes, chegarConversaNova, conversasDoAgente, diaDe, formatarTelefone, hhmm, inicioDoDia, ORIGEM_LABEL,
  rotuloDia, rotuloFinalizacao, SENTIMENTO_LABEL, STATUS_LABEL, type Conversa, type Origem, type Status,
} from '@/mocks/conversas'
import { AvaliacaoPill, dur, ORIGEM_ICON, usd } from './conversas/comum'
import { Detalhe, type Largura } from './conversas/Detalhe'

// Cartões = filtro por evaluation (e "ao vivo" = status in_progress), como o `?evaluation=` da API.
type Cartao = 'todas' | 'ao_vivo' | 'sucesso' | 'falha' | 'sem'
const CARTOES: { id: Cartao; label: string; test: (c: Conversa) => boolean }[] = [
  { id: 'todas', label: 'Todas', test: () => true },
  { id: 'ao_vivo', label: 'Ao vivo', test: c => c.status === 'in_progress' },
  { id: 'sucesso', label: 'Sucesso', test: c => c.avaliacao === 'successful' },
  { id: 'falha', label: 'Falha', test: c => c.avaliacao === 'failed' },
  { id: 'sem', label: 'Sem avaliação', test: c => c.avaliacao === 'unknown' },
]

type Periodo = 'hoje' | 'ontem' | '7d' | '30d'
const PERIODOS: { id: Periodo; label: string; de: number; ate?: number }[] = [
  { id: 'hoje', label: 'Hoje', de: 0 },
  { id: 'ontem', label: 'Ontem', de: 1, ate: 0 },
  { id: '7d', label: 'Últimos 7 dias', de: 6 },
  { id: '30d', label: 'Últimos 30 dias', de: 29 },
]

// Só as colunas do whitelist de `order_by` da API são ordenáveis.
type Campo = 'seq_id' | 'title' | 'origin' | 'started_at' | 'duration_ms' | 'message_count' | 'evaluation' | 'status'
const VALOR: Record<Campo, (c: Conversa) => string | number> = {
  seq_id: c => c.seq, title: c => c.titulo, origin: c => ORIGEM_LABEL[c.origem], started_at: c => c.inicio.getTime(),
  duration_ms: c => duracao(c), message_count: c => c.mensagens, evaluation: c => c.avaliacao ?? '', status: c => c.status,
}
type Extra = 'status' | 'sentimento' | 'custo'
const EXTRAS: { id: Extra; label: string; largura: string }[] = [
  { id: 'status', label: 'Status', largura: '108px' },
  { id: 'sentimento', label: 'Sentimento', largura: '92px' },
  { id: 'custo', label: 'Custo LLM', largura: '88px' },
]

const duracao = (c: Conversa) => (c.status === 'in_progress' ? agora() - c.inicio.getTime() : c.duracaoMs)

function FilterChip({ label, value, onClear, aberto }: { label: string; value?: string; onClear?: () => void; aberto?: boolean }) {
  if (value) {
    return (
      <span className="flex h-8 items-center overflow-hidden rounded-full border border-field text-[13px]">
        <span
          role="button"
          tabIndex={0}
          onClick={e => { e.stopPropagation(); onClear?.() }}
          onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onClear?.() } }}
          aria-label={`Limpar ${label}`}
          className="flex h-full items-center pr-1 pl-2.5 text-dim hover:text-ink"
        >
          <Icon name="close" className="size-3.5" />
        </span>
        <span className="pr-1.5 text-dim">{label}</span>
        <span className="h-4 border-l border-field" />
        <span className="flex items-center gap-1 px-2.5 text-brand">{value} <Icon name="down" className="size-3.5" /></span>
      </span>
    )
  }
  return (
    <span className={cn('flex h-8 items-center gap-1.5 rounded-full border border-dashed border-field px-3 text-[13px] text-ink-soft hover:border-faint hover:bg-surface', aberto && 'bg-surface')}>
      <Icon name="plus" className="size-3.5 text-dim" /> {label}
    </span>
  )
}

function Paginas({ pagina, total, ir }: { pagina: number; total: number; ir: (p: number) => void }) {
  const nums: (number | '…')[] = []
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - pagina) <= 1) nums.push(p)
    else if (nums[nums.length - 1] !== '…') nums.push('…')
  }
  return (
    <div className="flex items-center gap-0.5">
      <Button variant="ghost" size="icon-sm" aria-label="Anterior" disabled={pagina <= 1} onClick={() => ir(pagina - 1)}><ChevronLeft className="size-4" /></Button>
      {nums.map((n, i) => n === '…'
        ? <span key={`e${i}`} className="w-6 text-center text-faint">…</span>
        : <button key={n} onClick={() => ir(n)} className={cn('h-7 min-w-7 rounded-md px-1.5 tabular-nums', n === pagina ? 'bg-surface-hover font-medium text-ink' : 'hover:bg-surface')}>{n}</button>)}
      <Button variant="ghost" size="icon-sm" aria-label="Próxima" disabled={pagina >= total} onClick={() => ir(pagina + 1)}><ChevronRight className="size-4" /></Button>
    </div>
  )
}

function Cabecalho({ label, dica, campo, ordem, setOrdem, direita }: {
  label: string; dica?: string; campo?: Campo; ordem: { campo: Campo; dir: 'asc' | 'desc' }; setOrdem: (o: { campo: Campo; dir: 'asc' | 'desc' }) => void; direita?: boolean
}) {
  const ativo = campo && ordem.campo === campo
  const conteudo = (
    <span className={cn('flex items-center gap-1', direita && 'justify-end')}>
      {campo ? (
        <button
          onClick={() => setOrdem({ campo, dir: ativo && ordem.dir === 'desc' ? 'asc' : 'desc' })}
          className={cn('flex items-center gap-1 hover:text-ink', ativo && 'text-ink')}
        >
          {label}
          <Icon name={ativo ? (ordem.dir === 'desc' ? 'down' : 'up') : 'sort'} className={cn('size-3', !ativo && 'text-faint')} />
        </button>
      ) : label}
    </span>
  )
  if (!dica) return conteudo
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>{conteudo}</TooltipTrigger>
      <TooltipContent className="max-w-60">{dica}</TooltipContent>
    </Tooltip>
  )
}

export function ConversasPage() {
  const { id = agentes[0].id } = useParams()
  const agente = agentes.find(a => a.id === id) ?? agentes[0]
  const [params, setParams] = useSearchParams()
  const [aviso, avisar] = useAviso()

  const [cartao, setCartao] = useState<Cartao>('todas')
  const [digitado, setDigitado] = useState('')
  const [busca, setBusca] = useState('')
  const [periodo, setPeriodo] = useState<Periodo | null>(null)
  const [origem, setOrigem] = useState<Origem | null>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [finalizacao, setFinalizacao] = useState<number | null>(null)
  const [extras, setExtras] = useState<Set<Extra>>(new Set())
  const [ordem, setOrdem] = useState<{ campo: Campo; dir: 'asc' | 'desc' }>({ campo: 'started_at', dir: 'desc' })
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(25)
  const [largura, setLargura] = useState<Largura>('normal')
  const [novidades, setNovidades] = useState(false)
  const [versao, setVersao] = useState(0)
  const [, tick] = useState(0)

  // Busca com debounce de 350 ms, como no Builder.
  useEffect(() => {
    const t = setTimeout(() => setBusca(digitado.trim()), 350)
    return () => clearTimeout(t)
  }, [digitado])
  // Qualquer mudança de filtro, ordem ou tamanho volta para a página 1.
  const chaveFiltro = JSON.stringify([busca, cartao, periodo, origem, status, finalizacao, porPagina, ordem, id])
  const [chaveAnterior, setChaveAnterior] = useState(chaveFiltro)
  if (chaveAnterior !== chaveFiltro) { setChaveAnterior(chaveFiltro); setPagina(1) }

  // Duração das ao vivo andando; e a cada ~20 s "chega" uma conversa nova (o Builder checa a cada 8 s).
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000)
    const n = setTimeout(() => setNovidades(true), 20_000)
    return () => { clearInterval(t); clearTimeout(n) }
  }, [versao])

  const todas = useMemo(() => conversasDoAgente(agente.id), [agente.id])
  const catalogo = catalogoFinalizacoes(agente.id)

  const base = (c: Conversa) => {
    if (origem && c.origem !== origem) return false
    if (status && c.status !== status) return false
    if (finalizacao !== null && c.finalizacao?.id !== finalizacao) return false
    if (periodo) {
      const p = PERIODOS.find(x => x.id === periodo)!
      const t = c.inicio.getTime()
      if (t < inicioDoDia(p.de).getTime()) return false
      if (p.ate !== undefined && t >= inicioDoDia(p.ate).getTime()) return false
    }
    if (busca) {
      // Mesmos campos do `q` da API; só dígitos também casa o nº exato.
      const q = busca.toLowerCase()
      const digitos = /^\d+$/.test(busca)
      const campos = [c.titulo, ORIGEM_LABEL[c.origem], c.id, c.resumo, c.contato, c.contatoNome, c.finalizacao && rotuloFinalizacao(c.finalizacao.valor), c.finalizacao?.valor]
      if (!(digitos && String(c.seq) === busca) && !campos.some(x => x?.toLowerCase().includes(q))) return false
    }
    return true
  }
  const filtroCartao = CARTOES.find(s => s.id === cartao)!.test
  const filtradas = todas.filter(c => base(c) && filtroCartao(c))
  const mult = ordem.dir === 'asc' ? 1 : -1
  const ordenadas = [...filtradas].sort((a, b) => {
    const va = VALOR[ordem.campo](a)
    const vb = VALOR[ordem.campo](b)
    return (typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'pt-BR')) * mult || b.seq - a.seq
  })
  const paginas = Math.max(1, Math.ceil(ordenadas.length / porPagina))
  const daPagina = ordenadas.slice((pagina - 1) * porPagina, pagina * porPagina)
  const maiorDuracao = Math.max(1, ...daPagina.map(duracao))

  // Grupos por dia só fazem sentido ordenando por data.
  const porDia = ordem.campo === 'started_at'
  const grupos = porDia
    ? daPagina.reduce<{ chave: string; itens: Conversa[] }[]>((g, c) => {
        const k = diaDe(c.inicio)
        if (g[g.length - 1]?.chave !== k) g.push({ chave: k, itens: [] })
        g[g.length - 1].itens.push(c)
        return g
      }, [])
    : [{ chave: 'todas', itens: daPagina }]

  const colunas = ['56px', 'minmax(0,1fr)', '96px', '188px', '56px', '112px', '48px', '128px', '112px', ...EXTRAS.filter(e => extras.has(e.id)).map(e => e.largura)]
  const grid = { gridTemplateColumns: colunas.join(' ') }

  const abertaId = params.get('conversa')
  const idx = abertaId ? ordenadas.findIndex(c => c.id === abertaId) : -1
  const aberta = abertaId ? todas.find(c => c.id === abertaId) ?? null : null
  const abrir = (cid: string | null) => setParams(p => { if (cid) p.set('conversa', cid); else p.delete('conversa'); return p }, { replace: !!abertaId && !!cid })

  const temFiltro = !!(busca || periodo || origem || status || finalizacao !== null || cartao !== 'todas')
  const limpar = () => { setDigitado(''); setBusca(''); setPeriodo(null); setOrigem(null); setStatus(null); setFinalizacao(null); setCartao('todas') }

  const atualizar = () => {
    if (novidades) {
      const nova = chegarConversaNova(agente.id)
      avisar(nova ? `1 conversa nova: ${nova.titulo}` : 'Lista atualizada')
    } else avisar('Nenhuma conversa nova')
    setNovidades(false)
    setVersao(v => v + 1)
  }

  const larguraSheet = largura === 'compacta' ? 'min(620px,96vw)' : largura === 'larga' ? 'min(1400px,96vw)' : 'min(1160px,96vw)'

  return (
    <>
      <PageHeader title="Conversas" />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1320px] px-12 pt-10 pb-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="titulo-pagina text-[30px] leading-none tracking-[-0.01em]">Conversas</h2>
              <p className="mt-2 text-[14px] text-dim tabular-nums">{todas.length.toLocaleString('pt-BR')} conversas de {agente.nome} nos últimos 30 dias</p>
            </div>
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" onClick={atualizar} className="relative" />}>
                <Icon name="refresh" /> Atualizar
                {novidades && <span className="absolute -top-1 -right-1 flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60" /><span className="relative inline-flex size-2.5 rounded-full bg-ok" /></span>}
              </TooltipTrigger>
              <TooltipContent>{novidades ? 'Há conversas novas' : 'Sem novidades desde a última atualização'}</TooltipContent>
            </Tooltip>
          </div>

          <div className="mb-6 grid grid-cols-5 gap-3">
            {CARTOES.map(s => {
              const n = todas.filter(c => base(c) && s.test(c)).length
              const on = cartao === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setCartao(s.id)}
                  className={cn('rounded-lg border px-3.5 py-2.5 text-left transition-colors', on ? 'border-brand shadow-[inset_0_0_0_1px_var(--brand)]' : 'border-field hover:bg-surface')}
                >
                  <span className={cn('flex items-center gap-2 text-[13px]', on ? 'text-brand' : 'text-dim')}>
                    {s.id === 'ao_vivo' && <span className="size-1.5 animate-[dot-pulse_1.6s_ease-in-out_infinite] rounded-full bg-live" />}
                    {s.label}
                  </span>
                  <span className={cn('mt-0.5 block text-[18px] font-medium tabular-nums', on && 'text-brand')}>{n.toLocaleString('pt-BR')}</span>
                </button>
              )
            })}
          </div>

          <div className="relative mb-4">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-dim" />
            <input
              value={digitado}
              onChange={e => setDigitado(e.target.value)}
              placeholder="Buscar por título, número, contato, resumo ou ID"
              className="h-10 w-full rounded-lg border border-field bg-canvas pr-10 pl-10 text-[14px] outline-none placeholder:text-faint focus:border-ink/30 focus:shadow-[0_0_0_4px_var(--surface-hover)]"
            />
            {digitado && (
              <button onClick={() => setDigitado('')} aria-label="Limpar busca" className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 text-dim hover:text-ink"><Icon name="close" className="size-4" /></button>
            )}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<button />}>
                <FilterChip label="Data" value={PERIODOS.find(p => p.id === periodo)?.label} onClear={() => setPeriodo(null)} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuRadioGroup value={periodo ?? ''} onValueChange={v => setPeriodo(v as Periodo)}>
                  {PERIODOS.map(p => <DropdownMenuRadioItem key={p.id} value={p.id}>{p.label}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={<button />}>
                <FilterChip label="Canal" value={origem ? ORIGEM_LABEL[origem] : undefined} onClear={() => setOrigem(null)} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {(Object.keys(ORIGEM_LABEL) as Origem[]).map(o => (
                  <DropdownMenuItem key={o} className="gap-2.5" onClick={() => setOrigem(o)}>
                    <Icon name={ORIGEM_ICON[o]} /> <span className="flex-1">{ORIGEM_LABEL[o]}</span>
                    <span className="text-[12px] text-dim tabular-nums">{todas.filter(c => c.origem === o).length}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={<button />}>
                <FilterChip label="Status" value={status ? STATUS_LABEL[status] : undefined} onClear={() => setStatus(null)} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuRadioGroup value={status ?? ''} onValueChange={v => setStatus(v as Status)}>
                  {(Object.keys(STATUS_LABEL) as Status[]).map(s => <DropdownMenuRadioItem key={s} value={s}>{STATUS_LABEL[s]}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={<button />}>
                <FilterChip label="Finalização" value={finalizacao !== null ? rotuloFinalizacao(catalogo.find(f => f.id === finalizacao)?.valor ?? '') : undefined} onClear={() => setFinalizacao(null)} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {catalogo.length ? (
                  <DropdownMenuRadioGroup value={finalizacao === null ? '' : String(finalizacao)} onValueChange={v => setFinalizacao(Number(v))}>
                    {catalogo.map(f => (
                      <DropdownMenuRadioItem key={f.id} value={String(f.id)}>
                        <span className="flex-1">{rotuloFinalizacao(f.valor)}</span>
                        <span className="text-[12px] text-dim tabular-nums">{todas.filter(c => c.finalizacao?.id === f.id).length}</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                ) : <p className="px-2 py-2 text-[13px] text-dim">Este agente não tem catálogo de finalizações.</p>}
              </DropdownMenuContent>
            </DropdownMenu>

            {temFiltro && <button onClick={limpar} className="px-1.5 text-[13px] text-brand hover:underline">Limpar filtros</button>}
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                <Icon name="columns" /> Colunas{extras.size > 0 && <span className="text-dim tabular-nums">+{extras.size}</span>}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <p className="px-2 pt-1.5 pb-1 text-[12px] text-dim">Colunas opcionais</p>
                {EXTRAS.map(e => (
                  <DropdownMenuCheckboxItem
                    key={e.id}
                    checked={extras.has(e.id)}
                    onCheckedChange={on => setExtras(s => { const n = new Set(s); if (on) n.add(e.id); else n.delete(e.id); return n })}
                  >
                    {e.label}
                  </DropdownMenuCheckboxItem>
                ))}
                {extras.size > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setExtras(new Set())}>Restaurar padrão</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid h-9 items-center gap-3 border-b border-field px-3 text-[13px] font-medium text-ink-soft" style={grid}>
            <Cabecalho label="ID" campo="seq_id" ordem={ordem} setOrdem={setOrdem} />
            <Cabecalho label="Conversa" campo="title" ordem={ordem} setOrdem={setOrdem} />
            <Cabecalho label="Canal" campo="origin" ordem={ordem} setOrdem={setOrdem} />
            <Cabecalho label="Contato" dica="Nome que veio do mailing ou do WhatsApp, e o número formatado." ordem={ordem} setOrdem={setOrdem} />
            <Cabecalho label="Hora" campo="started_at" ordem={ordem} setOrdem={setOrdem} />
            <Cabecalho label="Duração" campo="duration_ms" dica="A barra é relativa à conversa mais longa desta página." ordem={ordem} setOrdem={setOrdem} />
            <Cabecalho label="Msgs" campo="message_count" direita ordem={ordem} setOrdem={setOrdem} />
            <Cabecalho label="Finalização" dica="Tabulação que a IA escolheu no encerramento, do catálogo do agente." ordem={ordem} setOrdem={setOrdem} />
            <Cabecalho label="Avaliação" campo="evaluation" dica="Resultado da análise automática ao fim da conversa." ordem={ordem} setOrdem={setOrdem} />
            {extras.has('status') && <Cabecalho label="Status" campo="status" ordem={ordem} setOrdem={setOrdem} />}
            {extras.has('sentimento') && <Cabecalho label="Sentimento" ordem={ordem} setOrdem={setOrdem} />}
            {extras.has('custo') && <Cabecalho label="Custo" dica="Custo de LLM em dólar, pelo preço do modelo." direita ordem={ordem} setOrdem={setOrdem} />}
          </div>

          {!filtradas.length && (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-surface"><Icon name="conversations" className="size-5 text-dim" /></span>
              <p className="text-[15px]">Nenhuma conversa encontrada</p>
              <p className="text-[14px] text-dim">{todas.length ? 'Ajuste a busca ou os filtros.' : 'Este agente ainda não teve conversas.'}</p>
              {temFiltro && <Button variant="outline" className="mt-2" onClick={limpar}>Limpar filtros</Button>}
            </div>
          )}

          {grupos.map(g => {
            const dia = porDia && g.itens[0] ? rotuloDia(g.itens[0].inicio) : null
            return (
              <section key={g.chave}>
                {dia && (
                  <h3 className="flex items-baseline gap-2 border-b border-hairline px-3 pt-5 pb-1.5 text-[12px] font-medium">
                    {dia.titulo} {dia.extenso && <span className="text-dim">{dia.extenso}</span>}
                  </h3>
                )}
                {g.itens.map(c => {
                  const vivo = c.status === 'in_progress'
                  const d = duracao(c)
                  return (
                    <button
                      key={c.id}
                      onClick={() => abrir(c.id)}
                      style={grid}
                      className={cn(
                        'grid h-[52px] w-full items-center gap-3 border-b border-hairline px-3 text-left text-[14px] transition-colors hover:bg-surface',
                        vivo && 'bg-live/[0.04]',
                        c.id === abertaId && 'bg-surface',
                      )}
                    >
                      <span className="tabular-nums text-dim">{c.seq}</span>
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-medium">{c.titulo}</span>
                        {vivo && <Pill tone="live" dot pulse className="h-5 px-1.5 text-[11px]">AO VIVO</Pill>}
                      </span>
                      <span className="flex items-center gap-1.5 text-ink-soft"><Icon name={ORIGEM_ICON[c.origem]} className="size-3.5 text-dim" />{c.origem === 'test_chat' ? 'Teste' : ORIGEM_LABEL[c.origem]}</span>
                      <span className="min-w-0 leading-tight">
                        <span className="block truncate">{c.contatoNome ?? '—'}</span>
                        <span className="block truncate text-[12.5px] text-dim tabular-nums">{formatarTelefone(c.contato)}</span>
                      </span>
                      <span className="tabular-nums text-ink-soft">{hhmm(c.inicio)}</span>
                      <span className="flex items-center gap-2">
                        <span className={cn('w-[52px] shrink-0 tabular-nums', vivo && 'text-live')}>{dur(d)}</span>
                        <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-hover">
                          <span className={cn('block h-full rounded-full', vivo ? 'bg-live' : 'bg-ink-soft/50')} style={{ width: `${Math.max(4, (d / maiorDuracao) * 100)}%` }} />
                        </span>
                      </span>
                      <span className="text-right tabular-nums text-ink-soft">{c.mensagens}</span>
                      <span className="min-w-0">
                        {c.finalizacao
                          ? <span className="block truncate text-ink-soft" title={c.finalizacao.valor}>{rotuloFinalizacao(c.finalizacao.valor)}</span>
                          : <span className="text-faint">—</span>}
                      </span>
                      <span><AvaliacaoPill c={c} /></span>
                      {extras.has('status') && <span className="truncate text-ink-soft">{STATUS_LABEL[c.status]}</span>}
                      {extras.has('sentimento') && <span className="truncate text-ink-soft">{c.sentimento ? SENTIMENTO_LABEL[c.sentimento] : <span className="text-faint">—</span>}</span>}
                      {extras.has('custo') && <span className="text-right tabular-nums text-ink-soft">{usd(c.custoUsd, 3)}</span>}
                    </button>
                  )
                })}
              </section>
            )
          })}

          {filtradas.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-dim">
              <Paginas pagina={pagina} total={paginas} ir={setPagina} />
              <span className="tabular-nums">
                Mostrando {((pagina - 1) * porPagina + 1).toLocaleString('pt-BR')}–{Math.min(pagina * porPagina, ordenadas.length).toLocaleString('pt-BR')} de {ordenadas.length.toLocaleString('pt-BR')}
              </span>
              <div className="flex-1" />
              <DropdownMenu>
                <DropdownMenuTrigger render={<button className="flex h-7 items-center gap-1 rounded-md border border-field px-2 tabular-nums text-ink-soft hover:bg-surface" />}>
                  {porPagina} por página <Icon name="down" className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuRadioGroup value={String(porPagina)} onValueChange={v => setPorPagina(Number(v))}>
                    {[25, 50, 100, 200].map(n => <DropdownMenuRadioItem key={n} value={String(n)}>{n} por página</DropdownMenuRadioItem>)}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!aberta} onOpenChange={o => !o && abrir(null)}>
        <SheetContent
          showCloseButton={false}
          className="gap-0 transition-[width] data-[side=right]:sm:max-w-none"
          style={{ width: larguraSheet }}
        >
          {aberta && (
            <Detalhe
              c={aberta}
              pos={idx + 1}
              total={ordenadas.length}
              onPrev={() => idx > 0 && abrir(ordenadas[idx - 1].id)}
              onNext={() => idx >= 0 && idx < ordenadas.length - 1 && abrir(ordenadas[idx + 1].id)}
              onClose={() => abrir(null)}
              onMudou={() => setVersao(v => v + 1)}
              largura={largura}
              setLargura={setLargura}
              avisar={avisar}
            />
          )}
        </SheetContent>
      </Sheet>
      {aviso}
    </>
  )
}
