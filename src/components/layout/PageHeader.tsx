import type { ReactNode } from 'react'
import { useMatch, useNavigate } from 'react-router'
import { Bell, ChevronLeft } from 'lucide-react'
import { usePrefs } from '@/lib/prefs'
import { Icon, type IconName } from '@/components/brand/Icon'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { agentes } from '@/mocks/data'
import { useShell } from './AppShell'
import { UserMenu } from './UserMenu'

// Detalhe da ElevenLabs: dentro de um agente, o nome dele e um menu de ações ao lado do alternar menu.
function AgenteAtual() {
  const match = useMatch('/agentes/:id/*')
  const navigate = useNavigate()
  const agente = match && (agentes.find(a => a.id === match.params.id) ?? agentes[0])
  if (!agente) return null
  return (
    <div className="flex shrink-0 items-center gap-1">
      <span className="max-w-[220px] truncate px-1 text-[14px] font-medium">{agente.nome}</span>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Ações do agente" />}>
          <Icon name="more" className="size-[18px]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem className="gap-2.5" onClick={() => navigator.clipboard?.writeText(agente.id)}>
            <Icon name="copy" /> Copiar ID do agente
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2.5" onClick={() => navigate(`/agentes/${agente.id}/versoes`)}>
            <Icon name="history" /> Versões
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2.5" onClick={() => navigate('/agentes')}>
            <ChevronLeft className="size-4" /> Todos os agentes
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Cabeçalho único de toda tela: alternar menu · título · ações · usuário.
export function PageHeader({ icon, title, after, children }: { icon?: IconName; title: ReactNode; after?: ReactNode; children?: ReactNode }) {
  const { toggle } = useShell()
  // Estilo Stripe: sem título (ele fica na página) e sem régua.
  if (usePrefs().estilo === 'stripe') {
    return (
      <header className="flex h-16 shrink-0 items-center gap-3 px-5">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar menu">
          <Icon name="sidebar" className="size-5" />
        </Button>
        <AgenteAtual />
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Notificações"><Bell className="size-[18px]" strokeWidth={1.5} /></Button>
          <div className="ml-1 flex items-center gap-2">{children}</div>
          <UserMenu />
        </div>
      </header>
    )
  }
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-hairline px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar menu">
          <Icon name="sidebar" className="size-5" />
        </Button>
        {icon && <Icon name={icon} className="text-dim" />}
        <h1 className="truncate text-[15px]">{title}</h1>
        {after}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {children}
        <UserMenu />
      </div>
    </header>
  )
}
