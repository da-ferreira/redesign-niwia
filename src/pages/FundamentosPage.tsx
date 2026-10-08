import { Upload } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Dot, Waiting, type DotTone } from '@/components/brand/Dot'
import { AgentMark } from '@/components/brand/AgentMark'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SearchField } from '@/components/patterns/SearchField'
import { FONTS, usePrefs } from '@/lib/prefs'

const CINZAS = [
  ['canvas', 'Fundo da página'], ['surface', 'Menu, faixas, cabeçalho de grupo'], ['surface-hover', 'Hover e item ativo'],
  ['raised', 'Popover, drawer, modal'], ['hairline', 'Divisória'], ['field', 'Borda de controle'],
]
const TEXTOS = [['ink', 'Título, nome do item'], ['ink-soft', 'Dado de célula'], ['dim', 'Texto de apoio'], ['faint', 'Rótulo de coluna, placeholder']]
const ESTADOS: [DotTone, string, string][] = [
  ['brand', 'brand', 'Ação principal, seleção, foco'], ['live', 'live', 'Ao vivo'], ['ok', 'ok', 'Sucesso, publicado'],
  ['caution', 'caution', 'Atenção, não salvo'], ['danger', 'danger', 'Erro, destrutivo'],
]

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[220px_1fr] gap-8 border-b border-hairline py-8">
      <div>
        <h3 className="text-[13px] font-medium">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-dim">{hint}</p>
      </div>
      <div>{children}</div>
    </section>
  )
}

function Swatch({ token, uso }: { token: string; uso: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="size-9 shrink-0 rounded-md border border-hairline" style={{ background: `var(--${token})` }} />
      <div>
        <p className="text-xs">{token}</p>
        <p className="text-xs text-dim">{uso}</p>
      </div>
    </div>
  )
}

export function FundamentosPage() {
  const { font } = usePrefs()
  return (
    <>
      <PageHeader title="Fundamentos" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1100px] px-10 py-8">
          <h2 className="text-2xl font-semibold tracking-tight">Fundamentos NiwIA</h2>
          <p className="mt-2 max-w-[640px] text-[13px] leading-relaxed text-dim">
            Preto, branco e um azul só — o do “ia” do logo. A personalidade vem do ponto: ele marca o que está
            selecionado, ao vivo ou com problema, em vez de cores e brilhos espalhados pela tela.
          </p>

          <Section title="Cinzas" hint="Neutros, sem tom azulado. No escuro o fundo é preto de verdade.">
            <div className="grid grid-cols-3 gap-4">{CINZAS.map(([t, u]) => <Swatch key={t} token={t} uso={u} />)}</div>
          </Section>

          <Section title="Texto" hint="Quatro degraus. Textos vizinhos com papéis diferentes não dividem a mesma cor.">
            <div className="grid grid-cols-2 gap-4">
              {TEXTOS.map(([t, u]) => (
                <div key={t} className="flex items-baseline gap-3">
                  <span className="w-16 text-lg font-medium" style={{ color: `var(--${t})` }}>Aa</span>
                  <div><p className="text-xs">{t}</p><p className="text-xs text-dim">{u}</p></div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Marca e estados" hint="O azul é a única cor de marca. Estados aparecem como ponto, não como fundo colorido.">
            <div className="grid grid-cols-3 gap-4">
              {ESTADOS.map(([tone, t, u]) => (
                <div key={t} className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-md border border-hairline"><Dot tone={tone} className="size-2.5" /></span>
                  <div><p className="text-xs">{t}</p><p className="text-xs text-dim">{u}</p></div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="O ponto" hint="A assinatura do logo vira linguagem do produto.">
            <div className="flex flex-wrap items-center gap-8 text-[13px]">
              <span className="flex items-center gap-2"><Dot tone="live" pulse /> Ao vivo</span>
              <span className="flex items-center gap-2"><Dot tone="ok" /> Publicada</span>
              <span className="flex items-center gap-2"><Dot tone="caution" /> Alterações não salvas</span>
              <span className="flex items-center gap-2"><Dot tone="danger" /> Erro no processamento</span>
              <span className="flex items-center gap-2 text-dim"><Waiting /> Carregando</span>
              <span className="flex items-center gap-3"><AgentMark name="Claro NET" /><AgentMark name="Receptivo SAC" /></span>
            </div>
          </Section>

          <Section title="Tipografia" hint={`Uma família para a interface (agora: ${FONTS.find(f => f.value === font)?.label}; troque no menu do usuário), inclusive no dado técnico.`}>
            <div className="space-y-4">
              <p className="text-2xl font-semibold tracking-tight">Título de tela · 24 semibold</p>
              <p className="text-[13px] font-medium">Título de seção e nome do item · 13 medium</p>
              <p className="text-[13px] text-ink-soft">Corpo e célula de tabela · 13 regular</p>
              <p className="text-xs text-dim">Texto de apoio · 12 regular</p>
              <p className="text-xs text-ink-soft">{'{{mailing.nome}}'} · #1842 · llama-3.3-70b · 412 ms</p>
            </div>
          </Section>

          <Section title="Controles" hint="Raio de 6px em controle e 10px no que flutua. Sem sombra no que está na página.">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button><Upload /> Publicar</Button>
                <Button variant="outline">Salvar versão</Button>
                <Button variant="ghost">Cancelar</Button>
                <Button variant="destructive">Excluir</Button>
                <Button disabled>Desabilitado</Button>
              </div>
              <div className="flex items-center gap-4">
                <SearchField value="" onChange={() => {}} className="w-72" />
                <label className="flex items-center gap-2 text-[13px]">Interrompível <Switch defaultChecked /></label>
                <span className="rounded-sm border border-hairline px-1.5 py-0.5 text-[11px] text-ink-soft">ACORDO</span>
                <span className="text-[11px] text-faint">Beta</span>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
