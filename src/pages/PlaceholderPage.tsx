import { PageHeader } from '@/components/layout/PageHeader'
import { Dot } from '@/components/brand/Dot'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <Dot tone="muted" />
        <p className="text-[13px] font-medium">{title} ainda não foi redesenhada</p>
        <p className="text-xs text-dim">Nesta rodada: Agente, Workflow, Conversas e Fundamentos.</p>
      </div>
    </>
  )
}
