import { cn } from '@/lib/utils'

// Matizes fechados; o nome escolhe um, então o mesmo agente tem sempre a mesma cor.
const MATIZES = ['#0b4aa2', '#0f766e', '#6d3fd6', '#c2560f', '#b4235f', '#3a4a63']

function matiz(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) | 0
  return MATIZES[Math.abs(h) % MATIZES.length]
}

const SIZE = {
  xs: 'size-[18px] rounded-[5px] text-[10px]',
  sm: 'size-5 rounded-[5px] text-[11px]',
  md: 'size-[22px] rounded-[6px] text-[12px]',
}

// Bloco chapado na cor do agente, inicial em branco. O status não mora aqui: vai no Dot ao lado do texto.
export function AgentMark({ name, size = 'md', className }: { name: string; size?: keyof typeof SIZE; className?: string }) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center font-semibold leading-none text-white', SIZE[size], className)}
      style={{ background: matiz(name) }}
    >
      {name.trim()[0]?.toUpperCase()}
    </span>
  )
}

// Para vozes: o mesmo bloco, com três barras de áudio no lugar da letra.
export function VoiceMark({ name, size = 'sm', className }: { name: string; size?: keyof typeof SIZE; className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center gap-[2px] text-white', SIZE[size], className)} style={{ background: matiz(name) }}>
      {[0.45, 0.9, 0.6].map((h, i) => <span key={i} className="w-[2px] rounded-full bg-current" style={{ height: `${h * 50}%` }} />)}
    </span>
  )
}
