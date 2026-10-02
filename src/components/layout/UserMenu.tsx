import { Check, Moon, Palette, Shapes, Sun, Type } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ESTILOS, FONTS, ICON_SETS, usePrefs } from '@/lib/prefs'
export function UserMenu() {
  const { theme, setTheme, font, setFont, iconSet, setIconSet, estilo, setEstilo } = usePrefs()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-1 flex size-9 items-center justify-center rounded-full bg-ink text-[12px] font-medium text-canvas hover:bg-ink/85">
        DF
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[80vh] w-56 overflow-y-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="text-[13px] font-medium text-ink">David Ferreira</p>
            <p className="text-xs text-dim">Administrador</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun /> : <Moon />}
          {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-faint">Estilo do protótipo</DropdownMenuLabel>
          {ESTILOS.map(e => (
            // Cada estilo traz a sua fonte; dá para trocar depois na lista abaixo.
            <DropdownMenuItem key={e.value} onClick={() => { setEstilo(e.value); setFont(e.value === 'stripe' ? 'figtree' : 'geist') }}>
              <Palette />
              <span className="flex-1">{e.label}</span>
              {estilo === e.value && <Check />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-faint">Ícones do protótipo</DropdownMenuLabel>
          {ICON_SETS.map(s => (
            <DropdownMenuItem key={s.value} onClick={() => setIconSet(s.value)}>
              <Shapes />
              <span className="flex-1">{s.label}</span>
              {iconSet === s.value && <Check />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-faint">Tipografia do protótipo</DropdownMenuLabel>
          {FONTS.map(f => (
            <DropdownMenuItem key={f.value} onClick={() => setFont(f.value)}>
              <Type />
              <span className="flex-1">{f.label}</span>
              {font === f.value && <Check />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
