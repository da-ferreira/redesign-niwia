import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchField({ value, onChange, placeholder = 'Buscar', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={cn('flex h-8 items-center gap-2 rounded-md border border-field px-2.5 focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/20', className)}>
      <Search className="size-3.5 shrink-0 text-faint" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[13px] outline-none placeholder:text-faint"
      />
    </label>
  )
}
