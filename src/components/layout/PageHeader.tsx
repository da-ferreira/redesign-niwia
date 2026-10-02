import type { ReactNode } from 'react'
import { Bell } from 'lucide-react'
import { usePrefs } from '@/lib/prefs'
import { Icon, type IconName } from '@/components/brand/Icon'
import { Button } from '@/components/ui/button'
import { useShell } from './AppShell'
import { UserMenu } from './UserMenu'

// Cabeçalho único de toda tela: alternar menu · título · ações · usuário.
export function PageHeader({ icon, title, after, children }: { icon?: IconName; title: ReactNode; after?: ReactNode; children?: ReactNode }) {
  const { toggle } = useShell()
  // Estilo Stripe: busca global no lugar do título (o título fica na página) e sem régua.
  if (usePrefs().estilo === 'stripe') {
    return (
      <header className="flex h-16 shrink-0 items-center gap-3 px-5">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar menu">
          <Icon name="sidebar" className="size-5" />
        </Button>
        <label className="flex h-9 w-[380px] max-w-full items-center gap-2.5 rounded-lg bg-surface px-3 text-dim focus-within:ring-3 focus-within:ring-brand/20">
          <Icon name="search" />
          <input placeholder="Pesquisar conversas, contatos, tools" className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-dim" />
          <kbd className="font-sans text-[11px] text-faint">⌘K</kbd>
        </label>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Ajuda"><Icon name="help" className="size-[18px]" /></Button>
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
