import { useState } from 'react'
import { Braces, ChevronRight, CirclePlus, Globe, MessageCircle, Play, Settings, Volume2, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { VariableField } from '@/components/patterns/VariableField'
import { Slider } from '@/components/patterns/Slider'
import { VoiceMark } from '@/components/brand/AgentMark'
import { Dot } from '@/components/brand/Dot'
import { Icon } from '@/components/brand/Icon'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { agenteAtual } from '@/mocks/data'

const COMPORTAMENTOS = ['Cobrança — firme e cordial', 'Suporte — paciente', 'Vendas — consultivo']
const VOZES = [
  { nome: 'Vanessa', desc: 'Feminina, calma' },
  { nome: 'Kora', desc: 'Feminina, acolhedora' },
  { nome: 'Rafael', desc: 'Masculina, firme' },
  { nome: 'Lia', desc: 'Feminina, jovem' },
]

// Mesma organização da AgentePage (editores à esquerda, ajustes à direita), com o acabamento Stripe:
// raios menores, rótulos em semibold, badges discretos e o azul na ação principal.

function Rotulo({ titulo, hint, actions }: { titulo: string; hint: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-4">
      <div>
        <h3 className="text-[14px] font-semibold">{titulo}</h3>
        <p className="mt-0.5 text-[13px] leading-relaxed text-dim">{hint}</p>
      </div>
      {actions && <div className="flex shrink-0 gap-1">{actions}</div>}
    </div>
  )
}

function Editor({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-field transition-shadow focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/20">
      {children}
      <div className="flex min-h-11 items-center justify-between gap-3 border-t border-hairline bg-surface px-4 py-2 text-[12px] text-dim">
        {footer}
      </div>
    </div>
  )
}

function Lista({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-hairline overflow-hidden rounded-lg border border-field">{children}</div>
}

function Linha({ children, onClick, add }: { children: React.ReactNode; onClick?: () => void; add?: boolean }) {
  return (
    <button onClick={onClick} className={cn('flex h-11 w-full items-center gap-2.5 px-3.5 text-left text-[14px] transition-colors hover:bg-surface', add && 'font-medium text-brand')}>
      {add && <CirclePlus className="size-4" strokeWidth={1.75} />}
      <span className="flex min-w-0 flex-1 items-center gap-2.5 truncate">{children}</span>
      {!add && <ChevronRight className="size-4 shrink-0 text-faint" />}
    </button>
  )
}

const Badge = ({ children }: { children: string }) => (
  <span className="rounded-[5px] bg-surface-hover px-1.5 py-px text-[12px] font-medium text-ink-soft">{children}</span>
)

const Kbd = ({ children }: { children: string }) => (
  <code className="mx-1 rounded border border-field bg-canvas px-1 font-mono text-[11px] text-ink-soft">{children}</code>
)

export function AgenteStripePage() {
  const [prompt, setPrompt] = useState(agenteAtual.prompt)
  const [primeira, setPrimeira] = useState(agenteAtual.primeiraMensagem)
  const [interrompivel, setInterrompivel] = useState(agenteAtual.interrompivel)
  const [comportamento, setComportamento] = useState(agenteAtual.comportamento)
  const [voz, setVoz] = useState('Vanessa')
  const [drawer, setDrawer] = useState(false)
  const [avisoAberto, setAvisoAberto] = useState(true)
  const dirty = prompt !== agenteAtual.prompt || primeira !== agenteAtual.primeiraMensagem || interrompivel !== agenteAtual.interrompivel

  return (
    <>
      <PageHeader title="Agente">
        {dirty && <span className="mr-1 flex items-center gap-2 text-[13px] text-dim"><Dot tone="caution" /> Não salvo</span>}
        <Button variant="ghost"><Braces /> Variáveis</Button>
        <Button variant="outline"><MessageCircle /> Testar</Button>
        <Button>Publicar</Button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1240px] px-10 pt-6 pb-14">
          <div className="flex items-center gap-3">
            <h2 className="titulo-pagina flex-1 leading-tight">Agente</h2>
            <span className="flex items-center gap-1.5 text-[13px] text-ink-soft tabular-nums">
              <Dot tone={agenteAtual.publicada ? 'ok' : 'caution'} />v{agenteAtual.versao} {agenteAtual.publicada ? 'publicada' : 'rascunho'}
            </span>
            <Button variant="outline" size="sm"><Icon name="history" /> Versões</Button>
          </div>
          <p className="mt-1 mb-8 border-b border-hairline pb-6 text-[14px] text-dim">Como o {agenteAtual.nome} fala e se comporta nas ligações.</p>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-8">
              <section>
                <Rotulo titulo="Prompt do sistema" hint="Quem o agente é e como deve se comportar em toda conversa." />
                <Editor
                  footer={
                    <>
                      <span>Digite<Kbd>{'{{'}</Kbd>para inserir dados do mailing ou de uma tool</span>
                      <span className="flex items-center gap-1.5 tabular-nums">
                        <Globe className="size-3.5" strokeWidth={1.5} /> America/Sao_Paulo
                        <span className="text-faint">·</span>
                        {prompt.length.toLocaleString('pt-BR')} / 8.000
                      </span>
                    </>
                  }
                >
                  <VariableField value={prompt} onChange={setPrompt} className="h-[340px]" />
                </Editor>
              </section>

              <section>
                <Rotulo titulo="Primeira mensagem" hint="Dita assim que o cliente atende. Vazia, o agente espera o cliente falar." />
                <Editor
                  footer={
                    <>
                      <span>Digite<Kbd>{'{{'}</Kbd>para inserir variáveis</span>
                      <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-soft">
                        Cliente pode interromper <Switch checked={interrompivel} onCheckedChange={setInterrompivel} />
                      </label>
                    </>
                  }
                >
                  <VariableField value={primeira} onChange={setPrimeira} className="h-[96px]" />
                </Editor>
              </section>
            </div>

            <aside className="space-y-7">
              {avisoAberto && (
                <section className="rounded-lg border border-caution/25 bg-caution/[0.06] p-4">
                  <div className="flex items-start gap-2.5">
                    <Dot tone="caution" className="mt-1.5" />
                    <div className="flex-1">
                      <h3 className="text-[14px] font-semibold">A v13 ainda não foi publicada</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">Está salva, mas as ligações seguem usando a v12.</p>
                      <div className="mt-2.5 flex gap-4 text-[13px] font-medium">
                        <button className="text-brand hover:underline">Publicar agora</button>
                        <button className="text-brand hover:underline">Ver diferenças</button>
                      </div>
                    </div>
                    <button onClick={() => setAvisoAberto(false)} aria-label="Fechar aviso" className="rounded p-0.5 text-dim hover:text-ink"><X className="size-4" /></button>
                  </div>
                </section>
              )}

              <section>
                <Rotulo
                  titulo="Voz"
                  hint="Quem fala e como soa."
                  actions={
                    <>
                      <Button variant="ghost" size="icon-sm" aria-label="Ouvir"><Volume2 strokeWidth={1.5} /></Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Ajustes da voz" onClick={() => setDrawer(true)}><Settings strokeWidth={1.5} /></Button>
                    </>
                  }
                />
                <Lista>
                  <Linha onClick={() => setDrawer(true)}>
                    <VoiceMark name={voz} />
                    {voz} <span className="text-dim">{VOZES.find(v => v.nome === voz)?.desc}</span>
                    <span className="ml-auto"><Badge>Principal</Badge></span>
                  </Linha>
                  <Linha add>Adicionar voz</Linha>
                </Lista>
              </section>

              <section>
                <Rotulo titulo="Idioma" hint="Vale para a transcrição e a fala." />
                <Lista>
                  <Linha>
                    <img src="https://flagcdn.com/w40/br.png" alt="" className="h-3 w-[18px] rounded-[2px] object-cover" />
                    {agenteAtual.idioma}
                    <span className="ml-auto"><Badge>Padrão</Badge></span>
                  </Linha>
                  <Linha add>Adicionar idioma</Linha>
                </Lista>
              </section>

              <section>
                <Rotulo titulo="Modelo" hint="Gera as respostas do agente." />
                <Lista>
                  <Linha>
                    <span className="font-mono text-[13px]">{agenteAtual.llm}</span>
                    <span className="ml-auto"><Badge>Temperatura 0,4</Badge></span>
                  </Linha>
                </Lista>
              </section>

              <section>
                <Rotulo titulo="Comportamento" hint="Estilo de resposta por personalidade e canal." />
                <Select value={comportamento} onValueChange={v => v && setComportamento(v)}>
                  <SelectTrigger className="h-9 w-full rounded-lg border-field px-3 text-[14px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMPORTAMENTOS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </section>
            </aside>
          </div>
        </div>
      </div>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent className="w-[440px] gap-0 sm:max-w-[440px]" showCloseButton={false}>
          <SheetHeader className="flex-row items-start justify-between border-b border-hairline p-5">
            <div>
              <SheetTitle className="text-[16px] font-semibold">Voz</SheetTitle>
              <SheetDescription className="text-[13px]">Escolha a voz e ajuste como ela soa.</SheetDescription>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setDrawer(false)} aria-label="Fechar"><X /></Button>
          </SheetHeader>
          <div className="flex-1 space-y-7 overflow-y-auto p-5">
            <Lista>
              {VOZES.map(v => (
                <button
                  key={v.nome}
                  onClick={() => setVoz(v.nome)}
                  className={cn('flex h-12 w-full items-center gap-3 px-3.5 text-left hover:bg-surface', voz === v.nome && 'bg-surface')}
                >
                  <span className="flex size-7 items-center justify-center rounded-full border border-field bg-canvas"><Play className="size-3" /></span>
                  <span className="flex-1">
                    <span className="block text-[14px] font-medium">{v.nome}</span>
                    <span className="block text-[12px] text-dim">{v.desc}</span>
                  </span>
                  {voz === v.nome && <Badge>Selecionada</Badge>}
                </button>
              ))}
            </Lista>
            <Slider label="Estabilidade" value={0.55} />
            <Slider label="Velocidade" value={1.05} min={0.7} max={1.2} />
            <Slider label="Similaridade" value={0.8} />
          </div>
          <SheetFooter className="flex-row justify-end border-t border-hairline p-4">
            <Button variant="outline" onClick={() => setDrawer(false)}>Cancelar</Button>
            <Button onClick={() => setDrawer(false)}>Aplicar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
