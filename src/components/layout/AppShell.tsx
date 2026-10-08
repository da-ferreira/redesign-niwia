import { createContext, useContext, useState } from 'react'
import { NavLink, Outlet, useMatch, useNavigate } from 'react-router'
import { Check, ChevronLeft, ChevronsUpDown } from 'lucide-react'
import { Icon, type IconName } from '@/components/brand/Icon'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/Logo'
import { Dot, type DotTone } from '@/components/brand/Dot'
import { AgentMark } from '@/components/brand/AgentMark'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { agentes } from '@/mocks/data'

const ShellCtx = createContext<{ collapsed: boolean; toggle: () => void }>({ collapsed: false, toggle: () => {} })
export const useShell = () => useContext(ShellCtx)

type Item = { to: string; label: string; icon: IconName; end?: boolean; live?: boolean; beta?: boolean; soon?: boolean }

const GLOBAL: { title?: string; items: Item[] }[] = [
  { items: [{ to: '/', label: 'Início', icon: 'home', end: true }] },
  {
    title: 'Módulos',
    items: [
      { to: '/agentes', label: 'Agentes', icon: 'agent' },
      { to: '/construtor', label: 'Construtor', icon: 'builder' },
      { to: '/smart-charger', label: 'Smart Charger', icon: 'bolt', soon: true },
    ],
  },
  { title: 'Suporte', items: [{ to: '/central-ajuda', label: 'Central de ajuda', icon: 'help', beta: true }] },
  { title: 'Sistema', items: [{ to: '/fundamentos', label: 'Fundamentos', icon: 'system' }] },
]

function agentSections(id: string): { title?: string; items: Item[] }[] {
  const b = `/agentes/${id}`
  return [
    {
      title: 'Configurar',
      items: [
        { to: `${b}/agente`, label: 'Agente', icon: 'agent' },
        { to: `${b}/base-conhecimento`, label: 'Base de conhecimento', icon: 'knowledge' },
        { to: `${b}/diretrizes`, label: 'Diretrizes', icon: 'guard' },
        { to: `${b}/finalizacoes`, label: 'Finalizações', icon: 'tag' },
        { to: `${b}/workflow`, label: 'Workflow', icon: 'workflow' },
      ],
    },
    { title: 'Versionamento', items: [{ to: `${b}/versoes`, label: 'Versões', icon: 'history' }] },
    {
      title: 'Monitorar',
      items: [
        { to: `${b}/conversas`, label: 'Conversas', icon: 'conversations', live: true },
        { to: `${b}/relatorio-audios`, label: 'Relatório de áudios', icon: 'audio', beta: true },
        { to: `${b}/relatorio-mensagens`, label: 'Relatório de mensagens', icon: 'chart', beta: true },
      ],
    },
  ]
}

// Recolhido, o rótulo vira dica ao passar o mouse.
function Tip({ label, on, children }: { label: React.ReactNode; on: boolean; children: React.ReactElement }) {
  if (!on) return children
  return (
    <Tooltip>
      <TooltipTrigger render={<div className="flex justify-center" />}>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>{label}</TooltipContent>
    </Tooltip>
  )
}

function NavItem({ item, collapsed }: { item: Item; collapsed: boolean }) {
  return (
    <Tip on={collapsed} label={<>{item.label}{item.beta && <span className="opacity-60">Beta</span>}{item.soon && <span className="opacity-60">Em breve</span>}</>}>
      <NavLink
        to={item.to}
        end={item.end}
        aria-label={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'relative flex items-center transition-colors',
            collapsed ? 'size-10 justify-center rounded-xl' : 'h-8 gap-2.5 rounded-lg px-2.5 text-[14px]',
            isActive ? 'bg-surface-hover text-ink' : 'text-ink-soft hover:bg-surface hover:text-ink',
            item.soon && 'pointer-events-none opacity-50',
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon name={item.icon} active={isActive} className={cn('size-4', isActive && 'text-brand')} />
            {collapsed && item.live && <Dot tone="live" pulse className="absolute top-2 right-2" />}
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            {!collapsed && item.live && <Dot tone="live" pulse />}
            {!collapsed && item.beta && <span className="rounded-md bg-surface-hover px-1.5 py-0.5 text-[11px] text-ink-soft">Beta</span>}
            {!collapsed && item.soon && <span className="text-[11px] text-faint">Em breve</span>}
          </>
        )}
      </NavLink>
    </Tip>
  )
}

function FooterItem({ icon, label, extra, collapsed }: { icon: IconName; label: string; extra?: React.ReactNode; collapsed: boolean }) {
  return (
    <Tip on={collapsed} label={label}>
      <button
        aria-label={label}
        className={cn(
          'flex items-center text-ink-soft transition-colors hover:bg-surface hover:text-ink',
          collapsed ? 'size-10 justify-center rounded-xl' : 'h-8 w-full gap-2.5 rounded-lg px-2.5 text-[14px]',
        )}
      >
        <Icon name={icon} className="size-4" />
        {!collapsed && <><span className="flex-1 text-left">{label}</span>{extra}</>}
      </button>
    </Tip>
  )
}

// Uma linha só: o agente e a versão; trocar de agente, versões e voltar ficam no menu.
function AgentSwitcher({ agente, collapsed }: { agente: (typeof agentes)[number]; collapsed: boolean }) {
  const navigate = useNavigate()
  const tom = (a: typeof agente): DotTone => (a.publicada ? 'ok' : 'caution')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          collapsed ? (
            <button aria-label={agente.nome} className="mb-4 flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-surface-hover" />
          ) : (
            <button className="mb-4 flex h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors hover:bg-surface data-popup-open:bg-surface" />
          )
        }
      >
        <AgentMark name={agente.nome} />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] leading-5 font-medium">{agente.nome}</span>
              <span className="flex items-center gap-1.5 text-[12px] leading-4 text-dim tabular-nums">
                <Dot tone={tom(agente)} />v{agente.versao} · {agente.publicada ? 'publicada' : 'rascunho'}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 text-faint" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={collapsed ? 'right' : 'bottom'} sideOffset={collapsed ? 10 : 4} className="w-60">
        <p className="px-2 pt-1.5 pb-1 text-[12px] text-dim">Agentes</p>
        {agentes.map(a => (
          <DropdownMenuItem key={a.id} onClick={() => navigate(`/agentes/${a.id}/agente`)} className="gap-2.5">
            <AgentMark name={a.nome} size="xs" />
            <span className="flex-1 truncate">{a.nome}</span>
            {a.id === agente.id ? <Check className="size-3.5 text-brand" /> : <Dot tone={tom(a)} />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/agentes/${agente.id}/versoes`)} className="gap-2.5">
          <span className="flex size-[18px] items-center justify-center"><Icon name="history" className="size-4" /></span>
          <span className="flex-1">Versões</span><span className="text-[12px] text-dim tabular-nums">v{agente.versao}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/agentes')} className="gap-2.5">
          <span className="flex size-[18px] items-center justify-center"><ChevronLeft className="size-4" /></span>
          Todos os agentes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const match = useMatch('/agentes/:id/*')
  const agente = match ? agentes.find(a => a.id === match.params.id) ?? agentes[0] : null
  const sections = agente ? agentSections(agente.id) : GLOBAL

  return (
    <ShellCtx.Provider value={{ collapsed, toggle: () => setCollapsed(c => !c) }}>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <aside
          className={cn(
            'flex shrink-0 flex-col border-r border-hairline transition-[width] duration-200',
            collapsed ? 'w-[68px] bg-surface/60' : 'w-[248px] bg-canvas',
          )}
        >
          <div className={cn('flex h-16 shrink-0 items-center', collapsed ? 'justify-center' : 'px-5')}>
            <Logo compact={collapsed} />
          </div>

          <nav className={cn('flex-1 overflow-y-auto pb-3', collapsed ? 'flex flex-col items-center px-3.5' : 'px-3')}>
            {collapsed ? (
              <Tip on label={<>Buscar e criar <span className="opacity-60">⌘K</span></>}>
                <button aria-label="Buscar e criar" className="mb-3 flex size-10 items-center justify-center rounded-xl border border-field bg-canvas text-ink-soft shadow-xs hover:text-ink">
                  <Icon name="search" className="size-[18px]" />
                </button>
              </Tip>
            ) : (
              <button className="mb-3 flex h-9 w-full items-center gap-2.5 rounded-lg border border-field px-2.5 text-[14px] text-dim hover:bg-surface">
                <Icon name="search" />
                <span className="flex-1 text-left">Buscar e criar</span>
                <kbd className="rounded-md border border-field px-1.5 font-sans text-[11px]">⌘K</kbd>
              </button>
            )}

            {agente && <AgentSwitcher agente={agente} collapsed={collapsed} />}

            {sections.map((s, i) => (
              <div key={i} className="mb-5">
                {s.title && !collapsed && <p className="mb-1 px-2.5 text-[12px] text-dim">{s.title}</p>}
                <div className={collapsed ? 'flex flex-col gap-1' : 'space-y-0.5'}>
                  {s.items.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
                </div>
              </div>
            ))}
          </nav>

          <div className={cn('p-3', collapsed ? 'flex flex-col items-center gap-1 px-3.5' : 'space-y-0.5')}>
            <FooterItem icon="news" label="Novidades" collapsed={collapsed} extra={<span className="text-[11px] text-faint">v2.14</span>} />
            <FooterItem icon="logout" label="Sair" collapsed={collapsed} />
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </ShellCtx.Provider>
  )
}
