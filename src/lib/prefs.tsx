import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'
export type Font = 'geist' | 'figtree' | 'inter' | 'inter-variable' | 'system-ui' | 'm-saans'
  | 'instrument-sans' | 'onest' | 'albert-sans' | 'schibsted-grotesk' | 'ibm-plex'

export const FONTS: { value: Font; label: string }[] = [
  { value: 'geist', label: 'Geist' },
  { value: 'figtree', label: 'Figtree' },
  { value: 'inter', label: 'Inter' },
  { value: 'inter-variable', label: 'Inter Variable' },
  { value: 'system-ui', label: 'System UI' },
  { value: 'm-saans', label: 'M Saans' },
  { value: 'instrument-sans', label: 'Instrument Sans' },
  { value: 'onest', label: 'Onest' },
  { value: 'albert-sans', label: 'Albert Sans' },
  { value: 'schibsted-grotesk', label: 'Schibsted Grotesk' },
  { value: 'ibm-plex', label: 'IBM Plex Sans' },
]

export type Estilo = 'atual' | 'stripe'

export const ESTILOS: { value: Estilo; label: string }[] = [
  { value: 'atual', label: 'Atual' },
  { value: 'stripe', label: 'Stripe' },
]

export type IconSet = 'lucide' | 'phosphor' | 'tabler' | 'hugeicons'

export const ICON_SETS: { value: IconSet; label: string }[] = [
  { value: 'phosphor', label: 'Phosphor' },
  { value: 'hugeicons', label: 'Hugeicons' },
  { value: 'tabler', label: 'Tabler' },
  { value: 'lucide', label: 'Lucide (atual)' },
]

function read<T extends string>(key: string, fallback: T): T {
  try { return (localStorage.getItem(key) as T) || fallback } catch { return fallback }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* sem storage: só não lembra */ }
}

type Prefs = {
  theme: Theme; setTheme: (t: Theme) => void
  font: Font; setFont: (f: Font) => void
  iconSet: IconSet; setIconSet: (s: IconSet) => void
  estilo: Estilo; setEstilo: (e: Estilo) => void
}
const Ctx = createContext<Prefs | null>(null)

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => read('niwia.theme', 'light'))
  const [font, setFont] = useState<Font>(() => read('niwia.font', 'geist'))
  const [iconSet, setIconSet] = useState<IconSet>(() => read('niwia.icons', 'phosphor'))
  const [estilo, setEstilo] = useState<Estilo>(() => read('niwia.estilo', 'atual'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    write('niwia.theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.font = font
    write('niwia.font', font)
  }, [font])

  useEffect(() => write('niwia.icons', iconSet), [iconSet])

  useEffect(() => {
    document.documentElement.dataset.estilo = estilo
    write('niwia.estilo', estilo)
  }, [estilo])

  return <Ctx.Provider value={{ theme, setTheme, font, setFont, iconSet, setIconSet, estilo, setEstilo }}>{children}</Ctx.Provider>
}

export function usePrefs() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePrefs fora do PrefsProvider')
  return ctx
}
