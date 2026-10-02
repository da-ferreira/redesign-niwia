import { useState } from 'react'
import {
  Braces, ChevronDown, Ellipsis, Globe, Maximize2, MessageCircle, Play, Settings, Volume2, X,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { OptionList, OptionRow, SettingBlock, Tag } from '@/components/patterns/SettingCard'
import { VariableField } from '@/components/patterns/VariableField'
import { Slider } from '@/components/patterns/Slider'
import { VoiceMark } from '@/components/brand/AgentMark'
import { Dot } from '@/components/brand/Dot'
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

// Rótulo de campo com sublinhado pontilhado: indica que há explicação no hover.
function FieldLabel({ children, hint }: { children: string; hint: string }) {
  return (
    <span title={hint} className="cursor-help text-[15px] underline decoration-field decoration-dotted underline-offset-[6px]">
      {children}
    </span>
  )
}

function EditorBox({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-field transition-shadow focus-within:border-ink/30 focus-within:shadow-[0_0_0_4px_var(--surface-hover)]">
      <button aria-label="Expandir" className="absolute top-3 right-3 z-10 rounded-md p-1.5 text-faint hover:bg-surface hover:text-ink">
        <Maximize2 className="size-4" strokeWidth={1.5} />
      </button>
      {children}
      <div className="flex min-h-14 items-center justify-between gap-3 border-t border-hairline bg-surface px-5 py-2.5 text-[14px] text-dim">
        {footer}
      </div>
    </div>
  )
}

const Kbd = ({ children }: { children: string }) => (
  <code className="mx-1 rounded-md px-1 font-sans text-ink-soft shadow-[inset_0_0_0_1px_var(--field)]">{children}</code>
)

export function AgentePage() {
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
      <PageHeader
        title={agenteAtual.nome}
        after={
          <Button variant="ghost" size="icon-sm" aria-label="Mais opções"><Ellipsis /></Button>
        }
      >
        {dirty && <span className="mr-2 flex items-center gap-2 text-[13px] text-dim"><Dot tone="caution" /> Não salvo</span>}
        <Button variant="ghost"><Braces /> Variáveis</Button>
        <Button variant="outline"><MessageCircle /> Testar</Button>
        <div className="flex">
          <Button className="rounded-r-none">Publicar</Button>
          <Button size="icon" className="rounded-l-none border-l border-canvas/20" aria-label="Mais opções de publicação"><ChevronDown /></Button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1320px] px-12 pt-12 pb-16">
          <div className="mb-10 flex items-center gap-3">
            <h2 className="text-[30px] leading-none tracking-[-0.01em]">Agente</h2>
            <span className="flex h-9 items-center gap-2 rounded-full border border-field pr-3 pl-1 text-[14px]">
              <span className="rounded-full bg-ink px-2.5 py-1 text-[12px] text-canvas">v{agenteAtual.versao}</span>
              {agenteAtual.publicada ? 'Publicada' : 'Rascunho'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="min-w-0 space-y-10">
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <FieldLabel hint="Instrução principal que define quem o agente é e como ele deve se comportar.">Prompt do sistema</FieldLabel>
                </div>
                <EditorBox
                  footer={
                    <>
                      <span>Digite<Kbd>{'{{'}</Kbd>para adicionar variáveis</span>
                      <span className="flex h-9 items-center gap-2 rounded-lg border border-field bg-canvas px-3 text-ink">
                        <Globe className="size-4" strokeWidth={1.5} /> America/Sao_Paulo
                      </span>
                    </>
                  }
                >
                  <VariableField value={prompt} onChange={setPrompt} className="h-[340px] pr-10" />
                </EditorBox>
              </section>

              <section>
                <FieldLabel hint="Se estiver vazia, o agente aguarda o cliente falar primeiro.">Primeira mensagem</FieldLabel>
                <p className="mt-1.5 mb-3 text-[14px] text-dim">A primeira coisa que o agente diz ao atender. Vazia, ele espera o cliente falar primeiro.</p>
                <EditorBox
                  footer={
                    <>
                      <span>Digite<Kbd>{'{{'}</Kbd>para adicionar variáveis</span>
                      <label className="flex cursor-pointer items-center gap-2.5 text-ink">
                        Interrompível <Switch checked={interrompivel} onCheckedChange={setInterrompivel} />
                      </label>
                    </>
                  }
                >
                  <VariableField value={primeira} onChange={setPrimeira} className="h-[104px] pr-10" />
                </EditorBox>
              </section>
            </div>

            <aside className="space-y-9">
              {avisoAberto && (
                <section className="rounded-2xl bg-surface p-5">
                  <div className="flex items-center gap-2.5">
                    <Dot tone="caution" />
                    <h3 className="flex-1 text-[15px]">Versão v13 não publicada</h3>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-dim">
                    Há uma versão salva que ainda não vale no atendimento. Publique para aplicá-la às ligações.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="bg-canvas">Publicar agora</Button>
                    <Button variant="ghost" onClick={() => setAvisoAberto(false)}>Depois</Button>
                  </div>
                </section>
              )}

              <SettingBlock
                title="Vozes"
                hint="Escolha a voz do agente e ajuste como ela soa."
                actions={
                  <>
                    <Button variant="outline" size="icon" aria-label="Ouvir"><Volume2 strokeWidth={1.5} /></Button>
                    <Button variant="outline" size="icon" aria-label="Ajustes da voz" onClick={() => setDrawer(true)}><Settings strokeWidth={1.5} /></Button>
                  </>
                }
              >
                <OptionList>
                  <OptionRow onClick={() => setDrawer(true)}>
                    <VoiceMark name={voz} />
                    {voz} — {VOZES.find(v => v.nome === voz)?.desc}
                    <span className="ml-auto"><Tag>Principal</Tag></span>
                  </OptionRow>
                  <OptionRow add>Adicionar outra voz</OptionRow>
                </OptionList>
              </SettingBlock>

              <SettingBlock title="Idioma" hint="Idioma padrão e adicionais em que o agente vai se comunicar.">
                <OptionList>
                  <OptionRow>
                    <img src="https://flagcdn.com/w40/br.png" alt="" className="h-3.5 w-5 rounded-[3px] object-cover" />
                    {agenteAtual.idioma}
                    <span className="ml-auto"><Tag>Padrão</Tag></span>
                  </OptionRow>
                  <OptionRow add>Adicionar idiomas</OptionRow>
                </OptionList>
              </SettingBlock>

              <SettingBlock title="LLM" hint="Modelo que gera as respostas e a temperatura.">
                <OptionList>
                  <OptionRow>
                    {agenteAtual.llm}
                    <span className="ml-auto"><Tag>Temperatura 0,4</Tag></span>
                  </OptionRow>
                </OptionList>
              </SettingBlock>

              <SettingBlock title="Comportamento" hint="Estilo de resposta por personalidade e canal.">
                <Select value={comportamento} onValueChange={v => v && setComportamento(v)}>
                  <SelectTrigger className="h-12 w-full rounded-xl border-field px-4 text-[15px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMPORTAMENTOS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </SettingBlock>
            </aside>
          </div>
        </div>
      </div>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent className="w-[460px] gap-0 sm:max-w-[460px]" showCloseButton={false}>
          <SheetHeader className="flex-row items-start justify-between p-6">
            <div>
              <SheetTitle className="text-[18px] font-normal">Voz</SheetTitle>
              <SheetDescription className="text-[14px]">Escolha a voz e ajuste como ela soa.</SheetDescription>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setDrawer(false)} aria-label="Fechar"><X /></Button>
          </SheetHeader>
          <div className="flex-1 space-y-8 overflow-y-auto px-6">
            <OptionList>
              {VOZES.map(v => (
                <button
                  key={v.nome}
                  onClick={() => setVoz(v.nome)}
                  className={cn('flex h-14 w-full items-center gap-3 px-4 text-left hover:bg-surface', voz === v.nome && 'bg-surface')}
                >
                  <span className="flex size-8 items-center justify-center rounded-full border border-field bg-canvas"><Play className="size-3" /></span>
                  <span className="flex-1">
                    <span className="block text-[15px]">{v.nome}</span>
                    <span className="block text-[13px] text-dim">{v.desc}</span>
                  </span>
                  {voz === v.nome && <Tag>Selecionada</Tag>}
                </button>
              ))}
            </OptionList>
            <Slider label="Estabilidade" value={0.55} />
            <Slider label="Velocidade" value={1.05} min={0.7} max={1.2} />
            <Slider label="Similaridade" value={0.8} />
          </div>
          <SheetFooter className="flex-row justify-end p-6">
            <Button variant="outline" onClick={() => setDrawer(false)}>Cancelar</Button>
            <Button onClick={() => setDrawer(false)}>Aplicar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
