import type { ReactNode } from 'react'
import { ChevronRight, CirclePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

// Bloco da coluna lateral: título + apoio fora da caixa, opções numa lista com borda.
export function SettingBlock({ title, hint, actions, children }: { title: string; hint: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px]">{title}</h3>
          <p className="mt-0.5 text-[14px] leading-relaxed text-dim">{hint}</p>
        </div>
        {actions && <div className="flex shrink-0 gap-1.5">{actions}</div>}
      </div>
      {children}
    </section>
  )
}

export function OptionList({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-hairline overflow-hidden rounded-xl border border-field">{children}</div>
}

export function OptionRow({ children, onClick, add }: { children: ReactNode; onClick?: () => void; add?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn('flex h-12 w-full items-center gap-3 px-4 text-left text-[15px] transition-colors hover:bg-surface', add && 'text-ink-soft')}
    >
      {add && <CirclePlus className="size-[18px] text-dim" strokeWidth={1.5} />}
      <span className="flex min-w-0 flex-1 items-center gap-2.5 truncate">{children}</span>
      {!add && <ChevronRight className="size-4 shrink-0 text-dim" />}
    </button>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-md bg-surface-hover px-2 py-0.5 text-[12px] text-ink-soft">{children}</span>
}
