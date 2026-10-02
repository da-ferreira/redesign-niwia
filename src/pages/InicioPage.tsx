import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon } from '@/components/brand/Icon'
import { Pill } from '@/components/brand/Pill'
import { Dot } from '@/components/brand/Dot'
import { AgentMark } from '@/components/brand/AgentMark'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { agentesAtivos, falhasRecentes, finalizacoesSemana, hojeSerie, ontemSerie, panorama } from '@/mocks/data'

// Linha SVG simples: sem biblioteca de gráfico enquanto for protótipo.
function Linha({ dados, comparar, h = 160, area }: { dados: number[]; comparar?: number[]; h?: number; area?: boolean }) {
  const w = 600
  const max = Math.max(...dados, ...(comparar ?? [])) || 1
  const pts = (d: number[]) => d.map((v, i) => `${(i / (d.length - 1)) * w},${h - 4 - (v / max) * (h - 12)}`)
  const ultimo = dados.findLastIndex(v => v > 0)
  const atual = ultimo >= 0 ? dados.slice(0, ultimo + 1) : dados
  const p = atual.map((v, i) => `${(i / (dados.length - 1)) * w},${h - 4 - (v / max) * (h - 12)}`)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full overflow-visible" style={{ height: h }}>
      {comparar && <polyline points={pts(comparar).join(' ')} fill="none" stroke="var(--field)" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
      {area && <polygon points={`0,${h} ${p.join(' ')} ${p.at(-1)!.split(',')[0]},${h}`} fill="var(--brand)" opacity="0.08" />}
      <polyline points={p.join(' ')} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function Delta({ v, invertido }: { v: number; invertido?: boolean }) {
  const bom = invertido ? v < 0 : v > 0
  return <Pill tone={bom ? 'ok' : 'danger'} className="h-5 px-1.5 text-[12px] tabular-nums">{v > 0 ? '+' : ''}{v.toString().replace('.', ',')}%</Pill>
}

function Card({ titulo, extra, children, rodape }: { titulo: string; extra?: React.ReactNode; children: React.ReactNode; rodape?: React.ReactNode }) {
  return (
    <section className="flex flex-col">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-[14px]">{titulo}</h3>
        <span title="Como é calculado" className="text-faint"><Icon name="help" className="size-3.5" /></span>
        {extra && <span className="ml-auto">{extra}</span>}
      </div>
      <div className="flex-1">{children}</div>
      {rodape && <div className="mt-3 flex items-center justify-between text-[13px]">{rodape}</div>}
    </section>
  )
}

const VerMais = ({ to = '#' }: { to?: string }) => <Link to={to} className="text-brand hover:underline">Ver mais</Link>
const Atualizado = () => <span className="text-faint">Atualizado 14:52</span>

export function InicioPage() {
  const totalFin = finalizacoesSemana.reduce((s, f) => s + f.qtd, 0)
  const hoje = hojeSerie.reduce((a, b) => a + b, 0)
  const ontemAteAgora = ontemSerie.slice(0, 16).reduce((a, b) => a + b, 0)

  return (
    <>
      <PageHeader title="Início">
        <Button variant="outline"><Icon name="plus" /> Novo agente</Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1320px] px-12 pt-12 pb-16">
          <h2 className="titulo-pagina border-b border-hairline pb-4 text-[30px] leading-none tracking-[-0.01em]">Hoje</h2>

          <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-12 pt-8">
            <div>
              <div className="flex gap-12">
                <div>
                  <p className="flex items-center gap-1 text-[14px] text-dim">Ligações <Icon name="down" className="size-3.5" /></p>
                  <p className="mt-1 text-[22px] tabular-nums">{hoje}</p>
                  <p className="text-[13px] tabular-nums text-faint">até 14:52</p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-[14px] text-dim">Ontem <Icon name="down" className="size-3.5" /></p>
                  <p className="mt-1 text-[22px] tabular-nums text-dim">{ontemAteAgora}</p>
                  <p className="text-[13px] text-faint">no mesmo horário</p>
                </div>
              </div>
              <div className="mt-6">
                <Linha dados={hojeSerie} comparar={ontemSerie} h={180} area />
                <div className="mt-2 flex justify-between text-[12px] tabular-nums text-faint"><span>00:00</span><span>12:00</span><span>23:59</span></div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-10 border-t border-hairline pt-6">
                <div>
                  <div className="flex items-center justify-between"><p className="text-[14px] text-dim">Ao vivo agora</p><Link to="/agentes/b71a3d93/conversas" className="text-[13px] text-brand hover:underline">Ver conversas</Link></div>
                  <p className="mt-1 flex items-center gap-2.5 text-[22px] tabular-nums"><Dot tone="live" pulse /> 4</p>
                </div>
                <div>
                  <div className="flex items-center justify-between"><p className="text-[14px] text-dim">Agentes publicados</p><Link to="/agentes" className="text-[13px] text-brand hover:underline">Ver agentes</Link></div>
                  <p className="mt-1 text-[22px] tabular-nums">2 <span className="text-[14px] text-dim">de 3</span></p>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl bg-surface p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px]">Recomendações</h3>
                  <button aria-label="Dispensar" className="text-dim hover:text-ink"><Icon name="close" /></button>
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">A versão v13 do Claro NET V3 está salva e ainda não foi publicada.</p>
                <Link to="/agentes/b71a3d93/agente" className="mt-1 inline-block text-[14px] text-brand hover:underline">Revisar e publicar</Link>
                <div className="my-4 h-px bg-field/60" />
                <p className="text-[14px] leading-relaxed text-ink-soft">12% das ligações de ontem caíram antes da validação de identidade.</p>
                <Link to="/agentes/b71a3d93/conversas" className="mt-1 inline-block text-[14px] text-brand hover:underline">Ver as conversas</Link>
              </section>
            </aside>
          </div>

          <div className="mt-16 mb-6 flex items-center gap-4">
            <h2 className="text-[22px]">Seu panorama</h2>
          </div>
          <div className="mb-8 flex items-center gap-2 text-[13px]">
            <span className="flex h-8 items-center gap-1.5 rounded-full border border-field px-3"><Icon name="calendar" className="size-3.5 text-dim" /> Últimos 7 dias <Icon name="down" className="size-3.5 text-dim" /></span>
            <span className="text-dim">comparado a</span>
            <span className="flex h-8 items-center gap-1.5 rounded-full border border-field px-3">Período anterior <Icon name="down" className="size-3.5 text-dim" /></span>
            <span className="flex h-8 items-center gap-1.5 rounded-full border border-dashed border-field px-3 text-ink-soft"><Icon name="plus" className="size-3.5 text-dim" /> Agente</span>
            <div className="flex-1" />
            <Button variant="ghost" size="sm"><Icon name="settings" /> Editar</Button>
          </div>

          <div className="grid grid-cols-3 gap-x-10 gap-y-12 border-t border-hairline pt-8">
            {panorama.slice(0, 3).map(m => (
              <Card key={m.titulo} titulo={m.titulo} extra={<Delta v={m.delta} invertido={m.invertido} />} rodape={<><VerMais /><Atualizado /></>}>
                <p className="text-[20px] tabular-nums">{m.valor}</p>
                <p className="mb-3 text-[13px] text-dim">{m.anterior}</p>
                <Linha dados={m.serie} h={72} />
              </Card>
            ))}

            <Card titulo="Finalizações" rodape={<><VerMais /><Atualizado /></>}>
              <div className="mt-1 mb-4 flex h-2 gap-0.5 overflow-hidden rounded-full">
                {finalizacoesSemana.map(f => <span key={f.codigo} style={{ width: `${(f.qtd / totalFin) * 100}%`, background: f.cor }} />)}
              </div>
              <ul className="space-y-2.5 text-[14px]">
                {finalizacoesSemana.map(f => (
                  <li key={f.codigo} className="flex items-center gap-2.5">
                    <span className="size-2 rounded-[3px]" style={{ background: f.cor }} />
                    <span className="flex-1 text-ink-soft">{f.label}</span>
                    <span className="tabular-nums">{f.qtd}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card titulo="Falhas recentes" rodape={<><Link to="/agentes/b71a3d93/conversas" className="text-brand hover:underline">3 de 12 resultados</Link><Atualizado /></>}>
              <ul className="divide-y divide-hairline">
                {falhasRecentes.map(f => (
                  <li key={f.seq} className="flex items-center gap-3 py-2.5 first:pt-1">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px]">{f.titulo}</p>
                      <p className="text-[13px] text-dim">{f.agente} · {f.hora}</p>
                    </div>
                    <Pill tone="danger">Falha</Pill>
                  </li>
                ))}
              </ul>
            </Card>

            {panorama.slice(3).map(m => (
              <Card key={m.titulo} titulo={m.titulo} extra={<Delta v={m.delta} invertido={m.invertido} />} rodape={<><VerMais /><Atualizado /></>}>
                <p className="text-[20px] tabular-nums">{m.valor}</p>
                <p className="mb-3 text-[13px] text-dim">{m.anterior}</p>
                <Linha dados={m.serie} h={72} />
              </Card>
            ))}

            <Card titulo="Agentes mais ativos" extra={<span className="text-[13px] text-dim">7 dias</span>} rodape={<><Link to="/agentes" className="text-brand hover:underline">Ver todos</Link><Atualizado /></>}>
              <ul className="divide-y divide-hairline">
                {agentesAtivos.map(a => (
                  <li key={a.nome} className="flex items-center gap-3 py-2.5 first:pt-1">
                    <AgentMark name={a.nome} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px]">{a.nome}</p>
                      <p className="text-[13px] tabular-nums text-dim">{a.ligacoes} ligações{a.acordo ? ` · ${a.acordo.toString().replace('.', ',')}% de acordo` : ''}</p>
                    </div>
                    {a.aoVivo > 0 && <span className={cn('flex items-center gap-1.5 text-[13px] tabular-nums text-live')}><Dot tone="live" pulse /> {a.aoVivo}</span>}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
