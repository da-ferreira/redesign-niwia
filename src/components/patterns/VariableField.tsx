import { Fragment } from 'react'
import { cn } from '@/lib/utils'

// Textarea com {{variáveis}} destacadas: um <pre> espelho por baixo, texto transparente por cima.
// O contorno da pílula usa padding com margem negativa igual, para não mudar a métrica e desalinhar o cursor.
export function VariableField({
  value, onChange, className, readOnly, placeholder,
}: { value: string; onChange: (v: string) => void; className?: string; readOnly?: boolean; placeholder?: string }) {
  const parts = value.split(/(\{\{[^}]*\}\})/g)
  const shared = 'col-start-1 row-start-1 m-0 w-full whitespace-pre-wrap break-words px-5 py-4 text-[15px] leading-[26px] font-sans'
  return (
    <div className={cn('grid overflow-y-auto', className)}>
      <pre aria-hidden className={cn(shared, 'pointer-events-none text-ink')}>
        {parts.map((p, i) =>
          p.startsWith('{{') ? <mark key={i} className="-mx-[3px] rounded-md bg-transparent px-[3px] text-ink shadow-[inset_0_0_0_1px_var(--field)]">{p}</mark> : <Fragment key={i}>{p}</Fragment>,
        )}
        {'\n'}
      </pre>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        className={cn(shared, 'resize-none overflow-hidden bg-transparent text-transparent caret-ink outline-none placeholder:text-faint')}
      />
    </div>
  )
}
