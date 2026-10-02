import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon, type IconName } from '@/components/brand/Icon'
import { Pill } from '@/components/brand/Pill'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { agenteAtual, conversasPorDia, resumoConversa, transcricao, type Conversa } from '@/mocks/data'

type Origem = Conversa['origem']
const ORIGEM: Record<Origem, { icon: IconName; label: string; curto: string }> = {
  voz: { icon: 'phone', label: 'Voz', curto: 'Voz' },
  whatsapp: { icon: 'whatsapp', label: 'WhatsApp', curto: 'WhatsApp' },
  teste: { icon: 'chat', label: 'Chat de teste', curto: 'Teste' },
}

// Na tabela vai o nome legível; o código fica no título e nos metadados.
const FINALIZACAO: Record<string, string> = {
  ACORDO: 'Acordo', CONTESTACAO: 'Contestação', BOLETO_ENVIADO: 'Boleto enviado', DESCONHECIDO: 'Desconhecido',
  TRANSFERIDO: 'Transferido', PROMESSA: 'Promessa', NUMERO_ERRADO: 'Número errado',
}

type Status = 'todas' | 'ao_vivo' | 'sucesso' | 'falha' | 'sem'
const STATUS: { id: Status; label: string; test: (c: Conversa) => boolean }[] = [
  { id: 'todas', label: 'Todas', test: () => true },
  { id: 'ao_vivo', label: 'Ao vivo', test: c => !!c.aoVivo },
  { id: 'sucesso', label: 'Sucesso', test: c => c.avaliacao === 'sucesso' },
  { id: 'falha', label: 'Falha', test: c => c.avaliacao === 'falha' },
  { id: 'sem', label: 'Sem avaliação', test: c => !c.aoVivo && !c.avaliacao },
]

const COLS = 'grid grid-cols-[52px_minmax(0,1fr)_76px_148px_52px_52px_72px_44px_128px_112px] items-center gap-3 px-3'
const DIAS: Record<string, string> = { Hoje: 'quinta-feira, 1 de outubro', Ontem: 'quarta-feira, 30 de setembro' }

const dur = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`)
const versao = (c: Conversa) => (c.origem === 'teste' ? 'v13' : `v${agenteAtual.versao}`)

function Avaliacao({ c }: { c: Conversa }) {
  if (c.aoVivo) return <Pill tone="live" dot pulse>Em curso</Pill>
  if (c.avaliacao === 'sucesso') return <Pill tone="ok">Sucesso</Pill>
  if (c.avaliacao === 'falha') return <Pill tone="danger">Falha</Pill>
  return <span className="text-[13px] text-faint">—</span>
}

// Filtro no padrão da Stripe: tracejado com "+" quando vazio; preenchido com o valor e um "×" quando ativo.
function FilterChip({ label, value, onClear, children }: { label: string; value?: string; onClear?: () => void; children?: React.ReactNode }) {
  if (value) {
    return (
      <span className="flex h-8 items-center overflow-hidden rounded-full border border-field text-[13px]">
        <button onClick={onClear} aria-label={`Limpar ${label}`} className="flex h-full items-center pr-1 pl-2.5 text-dim hover:text-ink">
          <Icon name="close" className="size-3.5" />
        </button>
        <span className="pr-1.5 text-dim">{label}</span>
        <span className="h-4 border-l border-field" />
        {children ?? <span className="px-2.5 text-brand">{value}</span>}
      </span>
    )
  }
  return (
    <span className="flex h-8 items-center gap-1.5 rounded-full border border-dashed border-field px-3 text-[13px] text-ink-soft hover:border-faint hover:bg-surface">
      <Icon name="plus" className="size-3.5 text-dim" /> {label}
    </span>
  )
}

export function ConversasPage() {
  const [status, setStatus] = useState<Status>('todas')
  const [origem, setOrigem] = useState<Origem | null>(null)
  const [busca, setBusca] = useState('')
  const [aberta, setAberta] = useState<number | null>(null)

  const todas = conversasPorDia.flatMap(g => g.itens)
  const base = (c: Conversa) => {
    const q = busca.toLowerCase()
    return (!origem || c.origem === origem) && (c.titulo.toLowerCase().includes(q) || c.contato.includes(q) || String(c.seq).includes(q))
  }
  const teste = STATUS.find(s => s.id === status)!.test

  const grupos = useMemo(
    () => conversasPorDia.map(g => ({ ...g, itens: g.itens.filter(c => base(c) && teste(c)) })).filter(g => g.itens.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, origem, busca],
  )
  const visiveis = grupos.flatMap(g => g.itens)
  const idx = aberta === null ? -1 : visiveis.findIndex(c => c.seq === aberta)
  const conversa = idx >= 0 ? visiveis[idx] : null

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span className="text-dim">{agenteAtual.nome}</span>
            <span className="text-faint">/</span>
            Conversas
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1320px] px-12 pt-12 pb-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="titulo-pagina text-[30px] leading-none tracking-[-0.01em]">Conversas</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" aria-label="Atualizar"><Icon name="refresh" /></Button>
              <Button variant="outline"><Icon name="download" /> Exportar</Button>
            </div>
          </div>

          {/* Contagem por status, clicável — o resumo da tabela antes da tabela. */}
          <div className="mb-6 grid grid-cols-5 gap-3">
            {STATUS.map(s => {
              const n = todas.filter(c => base(c) && s.test(c)).length
              const on = status === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  className={cn(
                    'rounded-lg border px-3.5 py-2.5 text-left transition-colors',
                    on ? 'border-brand shadow-[inset_0_0_0_1px_var(--brand)]' : 'border-field hover:bg-surface',
                  )}
                >
                  <span className={cn('flex items-center gap-2 text-[13px]', on ? 'text-brand' : 'text-dim')}>
                    {s.id === 'ao_vivo' && <span className="size-1.5 animate-[dot-pulse_1.6s_ease-in-out_infinite] rounded-full bg-live" />}
                    {s.label}
                  </span>
                  <span className={cn('mt-0.5 block text-[18px] font-medium tabular-nums', on && 'text-brand')}>{n}</span>
                </button>
              )
            })}
          </div>

          <div className="relative mb-4">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-dim" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por assunto, número ou ID"
              className="h-10 w-full rounded-lg border border-field bg-canvas pr-4 pl-10 text-[14px] outline-none placeholder:text-faint focus:border-ink/30 focus:shadow-[0_0_0_4px_var(--surface-hover)]"
            />
          </div>

          <div className="mb-3 flex items-center gap-2">
            <FilterChip label="Data" value="Últimos 7 dias">
              <span className="flex items-center gap-1 px-2.5 text-brand">Últimos 7 dias <Icon name="down" className="size-3.5" /></span>
            </FilterChip>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <FilterChip label="Origem" value={origem ? ORIGEM[origem].label : undefined} onClear={() => setOrigem(null)} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {(Object.keys(ORIGEM) as Origem[]).map(o => (
                  <DropdownMenuItem key={o} onClick={() => setOrigem(o)}>
                    <Icon name={ORIGEM[o].icon} /> {ORIGEM[o].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <FilterChip label="Finalização" />
            <FilterChip label="Versão" />
            <div className="flex-1" />
            <Button variant="ghost" size="sm"><Icon name="columns" /> Colunas</Button>
          </div>

          <div className={cn(COLS, 'h-9 border-b border-field text-[13px] font-medium text-ink-soft')}>
            <span>ID</span><span>Conversa</span><span>Canal</span><span>Contato</span><span>Versão</span><span>Hora</span>
            <span className="text-right">Duração</span><span className="text-right">Msgs</span><span>Finalização</span><span>Avaliação</span>
          </div>

          {grupos.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-surface"><Icon name="conversations" className="size-5 text-dim" /></span>
              <p className="text-[15px]">Nenhuma conversa encontrada</p>
              <p className="text-[14px] text-dim">Ajuste a busca ou os filtros.</p>
              <Button variant="outline" className="mt-2" onClick={() => { setBusca(''); setOrigem(null); setStatus('todas') }}>Limpar filtros</Button>
            </div>
          )}

          {grupos.map(g => (
            <section key={g.dia}>
              <h3 className="flex items-baseline gap-2 border-b border-hairline px-3 pt-5 pb-1.5 text-[12px] font-medium">
                {g.dia} <span className="text-dim">{DIAS[g.dia]}</span>
              </h3>
              {g.itens.map(c => (
                <button
                  key={c.seq}
                  onClick={() => setAberta(c.seq)}
                  className={cn(COLS, 'h-11 w-full border-b border-hairline text-left text-[14px] transition-colors hover:bg-surface')}
                >
                  <span className="tabular-nums text-dim">{c.seq}</span>
                  <span className="truncate font-medium">{c.titulo}</span>
                  <span className="text-ink-soft">{ORIGEM[c.origem].curto}</span>
                  <span className="truncate tabular-nums text-ink-soft">{c.contato}</span>
                  <span className="tabular-nums text-ink-soft">{versao(c)}</span>
                  <span className="tabular-nums text-ink-soft">{c.hora}</span>
                  <span className="text-right tabular-nums">{dur(c.duracaoSeg)}</span>
                  <span className="text-right tabular-nums text-ink-soft">{c.msgs}</span>
                  <span className="min-w-0">
                    {c.finalizacao
                      ? <span className="block truncate text-ink-soft" title={c.finalizacao}>{FINALIZACAO[c.finalizacao] ?? c.finalizacao}</span>
                      : <span className="text-faint">—</span>}
                  </span>
                  <span><Avaliacao c={c} /></span>
                </button>
              ))}
            </section>
          ))}

          {grupos.length > 0 && (
            <div className="mt-3 flex items-center gap-1 text-[13px] text-dim">
              <Button variant="ghost" size="icon-sm" aria-label="Anterior" disabled><ChevronLeft className="size-4" /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="Próxima"><ChevronRight className="size-4" /></Button>
              <span className="ml-2 tabular-nums">1–{visiveis.length} de 1.842 resultados</span>
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!conversa} onOpenChange={o => !o && setAberta(null)}>
        <SheetContent
          showCloseButton={false}
          className="gap-0 data-[side=right]:w-[min(1180px,94vw)] data-[side=right]:sm:max-w-none"
        >
          {conversa && (
            <Detalhe
              c={conversa}
              pos={idx + 1}
              total={visiveis.length}
              onPrev={() => idx > 0 && setAberta(visiveis[idx - 1].seq)}
              onNext={() => idx < visiveis.length - 1 && setAberta(visiveis[idx + 1].seq)}
              onClose={() => setAberta(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

// ——— Detalhe da conversa: transcrição à esquerda, resumo e metadados à direita ———

const ABAS = ['Resumo', 'Dados do cliente', 'Avaliação', 'Logs'] as const
const ONDA = Array.from({ length: 96 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.31)))

function Detalhe({ c, pos, total, onPrev, onNext, onClose }: {
  c: Conversa; pos: number; total: number; onPrev: () => void; onNext: () => void; onClose: () => void
}) {
  const [aba, setAba] = useState<(typeof ABAS)[number]>('Resumo')
  const voz = c.origem === 'voz'

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline px-4">
        <div className="flex h-8 items-center rounded-lg border border-field">
          <span className="px-2.5 text-[13px] tabular-nums text-dim">{pos} / {total}</span>
          <button onClick={onPrev} aria-label="Anterior" className="flex h-full w-8 items-center justify-center border-l border-field text-dim hover:bg-surface hover:text-ink"><Icon name="up" /></button>
          <button onClick={onNext} aria-label="Próxima" className="flex h-full w-8 items-center justify-center border-l border-field text-dim hover:bg-surface hover:text-ink"><Icon name="down" /></button>
        </div>
        <SheetTitle className="truncate text-[15px] font-normal">{c.titulo}</SheetTitle>
        <Pill className="h-[22px] gap-1 px-1.5 text-[12px]"><Icon name="branch" className="size-3" /> {versao(c)}</Pill>
        <div className="flex-1" />
        <Button variant="ghost" size="icon-sm" aria-label="Copiar link"><Icon name="copy" /></Button>
        <Button variant="ghost" size="icon-sm" aria-label="Fechar" onClick={onClose}><Icon name="close" /></Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_440px]">
        <div className="flex min-h-0 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <p className="mb-5 flex items-center justify-center gap-1.5 text-[13px] text-dim">
              Conversa iniciada por <Icon name={ORIGEM[c.origem].icon} className="size-3.5" />
              <span className="text-ink">{voz ? 'Voz · ramal 3101' : ORIGEM[c.origem].label}</span>
            </p>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-hairline" />
              <span className="rounded-full border border-field px-3 py-0.5 text-[12.5px] text-ink-soft">quinta-feira, 1 de outubro</span>
              <span className="h-px flex-1 bg-hairline" />
            </div>

            <div className="space-y-1">
              {transcricao.map((t, i) => {
                if (t.lado === 'tool') {
                  return (
                    <div key={i} className="ml-11 flex items-center gap-2.5 py-2 text-[13px]">
                      <span className="flex size-6 items-center justify-center rounded-md bg-surface-hover"><Icon name="tool" className="size-3.5 text-dim" /></span>
                      <span className="font-mono text-ink-soft">{t.nome}</span>
                      <Pill tone={t.status < 300 ? 'ok' : 'danger'} className="h-5 px-1.5 font-mono text-[11px]">{t.status}</Pill>
                      <span className="tabular-nums text-dim">{t.ms} ms</span>
                      <span className="ml-auto tabular-nums text-faint">{t.hora}</span>
                    </div>
                  )
                }
                const agente = t.lado === 'agente'
                return (
                  <div key={i} className="flex gap-3 rounded-xl px-2 py-3 hover:bg-surface">
                    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', agente ? 'bg-brand/10 text-brand' : 'bg-ink text-canvas')}>
                      <Icon name={agente ? 'agent' : 'user'} className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[13px] text-dim">
                        <span className="text-ink-soft">{agente ? 'Agente' : 'Cliente'}</span>
                        {agente && <><span className="text-faint">›</span><span className="font-mono text-[12px]">{t.fase}</span></>}
                      </p>
                      <p className="mt-1 text-[15px] leading-relaxed">{t.texto}</p>
                      <p className="mt-1.5 flex items-center gap-2 text-[12.5px] tabular-nums text-dim">
                        {t.hora}
                        {agente && t.llmMs && <><span className="text-field">|</span>LLM {(t.llmMs / 1000).toFixed(1).replace('.', ',')} s</>}
                        {agente && t.ragMs && <><span className="text-field">|</span>RAG {t.ragMs} ms</>}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {voz && (
            <div className="flex h-16 shrink-0 items-center gap-4 border-t border-hairline px-5">
              <button aria-label="Tocar" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-canvas hover:bg-ink/85">
                <Icon name="play" className="size-4" active />
              </button>
              <div className="flex h-8 flex-1 items-center gap-[2px]">
                {ONDA.map((h, i) => (
                  <span key={i} className={cn('flex-1 rounded-full', i < 30 ? 'bg-ink' : 'bg-field')} style={{ height: `${h * 100}%` }} />
                ))}
              </div>
              <span className="shrink-0 text-[13px] tabular-nums text-dim">1:18 / {dur(c.duracaoSeg)}</span>
              <button className="rounded-md border border-field px-2 py-0.5 text-[12px] text-ink-soft hover:bg-surface">1x</button>
            </div>
          )}
        </div>

        <aside className="flex min-h-0 flex-col border-l border-hairline">
          <div className="flex h-12 shrink-0 items-end gap-5 border-b border-hairline px-6">
            {ABAS.map(a => (
              <button
                key={a}
                onClick={() => setAba(a)}
                className={cn('-mb-px border-b-2 pb-2.5 text-[14px]', aba === a ? 'border-ink text-ink' : 'border-transparent text-dim hover:text-ink')}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {aba === 'Resumo' && <Resumo c={c} />}
            {aba === 'Dados do cliente' && (
              <Campos linhas={[
                ['mailing.nome', 'Marcos Oliveira'], ['mailing.cpf', '341.•••.•••-20'], ['mailing.valor_divida', 'R$ 189,00'],
                ['mailing.contrato', '88213-0045'], ['consultaDebito.vencimento', '10/10/2026'],
              ]} mono />
            )}
            {aba === 'Avaliação' && (
              <div className="space-y-3">
                {[['Identidade validada antes do valor', true], ['Ofereceu parcelamento', true], ['Encerrou com cordialidade', true], ['Evitou repetir a pergunta', false]].map(([k, ok]) => (
                  <div key={k as string} className="flex items-center justify-between rounded-xl border border-field px-4 py-3 text-[14px]">
                    {k}
                    <Pill tone={ok ? 'ok' : 'danger'}>{ok ? 'Atendido' : 'Não atendido'}</Pill>
                  </div>
                ))}
              </div>
            )}
            {aba === 'Logs' && (
              <div className="space-y-1 font-mono text-[12px] leading-6 text-ink-soft">
                {transcricao.map((t, i) => (
                  <p key={i}><span className="text-faint">{t.hora}</span>  {t.lado === 'tool' ? `tool ${t.nome} → ${t.status} (${t.ms}ms)` : t.lado === 'agente' ? `llm fase=${t.fase}${t.llmMs ? ` ${t.llmMs}ms` : ''}` : 'stt speech_final=true'}</p>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Campos({ linhas, mono }: { linhas: [string, React.ReactNode][]; mono?: boolean }) {
  return (
    <dl className="grid grid-cols-[150px_minmax(0,1fr)] gap-x-4 gap-y-3.5 text-[14px]">
      {linhas.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className={cn('text-dim', mono && 'font-mono text-[12.5px] leading-[21px]')}>{k}</dt>
          <dd className="flex min-w-0 items-center gap-2">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function Resumo({ c }: { c: Conversa }) {
  return (
    <>
      <h3 className="text-[16px]">Resumo</h3>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm"><Icon name="plus" /> Adicionar tag</Button>
        <Button variant="outline" size="sm">Sinalizar problema</Button>
      </div>
      <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">{resumoConversa}</p>

      <div className="my-6 h-px bg-hairline" />

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px]">Metadados</h3>
        <Button variant="outline" size="sm"><Icon name="copy" /> Copiar ID</Button>
      </div>
      <Campos linhas={[
        ['ID da conversa', <><span className="truncate font-mono text-[13px]">conv_{c.seq}_8jxfv619</span><Icon name="copy" className="size-3.5 text-faint" /></>],
        ['Data', `1 de out. de 2026, ${c.hora}`],
        ['Agente', <>{agenteAtual.nome} <Pill className="h-[22px] px-1.5 text-[12px]">{versao(c)}</Pill></>],
        ['Avaliação', <Avaliacao c={c} />],
        ['Finalização', c.finalizacao ? <span className="font-mono text-[13px]">{c.finalizacao}</span> : <span className="text-faint">—</span>],
        ['Sentimento', <Pill dot>Neutro</Pill>],
        ['Contato', <span className="tabular-nums">{c.contato}</span>],
        ['Duração', dur(c.duracaoSeg)],
        ['Mensagens', `${c.msgs} mensagens`],
        ['Custo estimado', 'R$ 0,42'],
      ]} />
    </>
  )
}
