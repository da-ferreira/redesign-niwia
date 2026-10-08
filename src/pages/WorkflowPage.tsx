import { useCallback, useState } from 'react'
import {
  ReactFlow, Background, BackgroundVariant, Handle, Position, useReactFlow, ReactFlowProvider,
  applyNodeChanges, type Edge, type Node, type NodeChange, type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import {
  Braces, Calculator, CircleStop, Flag, GitFork, Maximize, MessageSquare, Minus, PhoneForwarded,
  Plus, Redo2, Settings2, Undo2, Upload, Webhook, type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Dot } from '@/components/brand/Dot'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type Kind = 'start' | 'conversation' | 'condition' | 'tool' | 'transfer' | 'end'
type Data = { kind: Kind; title: string; body?: string; tokens?: number }

const KIND: Record<Kind, { icon: LucideIcon; label: string }> = {
  start: { icon: Flag, label: 'início' },
  conversation: { icon: MessageSquare, label: 'conversa' },
  condition: { icon: GitFork, label: 'condição' },
  tool: { icon: Webhook, label: 'ferramenta' },
  transfer: { icon: PhoneForwarded, label: 'transferir' },
  end: { icon: CircleStop, label: 'encerrar' },
}

function FlowNode({ data, selected }: NodeProps<Node<Data>>) {
  const k = KIND[data.kind]
  const compact = data.kind === 'start' || data.kind === 'end'
  return (
    <div
      className={cn(
        'rounded-lg border bg-canvas transition-colors',
        compact ? 'w-[180px]' : 'w-[260px]',
        selected ? 'border-brand ring-3 ring-brand/20' : 'border-field hover:border-faint',
      )}
    >
      {data.kind !== 'start' && <Handle type="target" position={Position.Top} />}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-2">
        <k.icon className="size-3.5 text-dim" strokeWidth={1.75} />
        <span className="text-[10px] tracking-wide text-faint uppercase">{k.label}</span>
        {data.tokens != null && <span className="ml-auto text-[10px] text-faint">{data.tokens} tk</span>}
      </div>
      <div className="px-3 pb-3">
        <p className="text-[13px] font-medium">{data.title}</p>
        {data.body && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-dim">{data.body}</p>}
      </div>
      {data.kind !== 'end' && <Handle type="source" position={Position.Bottom} />}
    </div>
  )
}

const nodeTypes = { flow: FlowNode }

const n = (id: string, x: number, y: number, data: Data): Node<Data> => ({ id, type: 'flow', position: { x, y }, data })
const INITIAL_NODES: Node<Data>[] = [
  n('start', 340, 0, { kind: 'start', title: 'Ligação atendida' }),
  n('abertura', 300, 110, { kind: 'conversation', title: 'Abertura', body: 'Cumprimente e confirme se fala com {{mailing.nome}}.', tokens: 84 }),
  n('validacao', 300, 270, { kind: 'conversation', title: 'Validação de identidade', body: 'Peça os 3 primeiros dígitos do CPF antes de qualquer valor.', tokens: 132 }),
  n('cond', 300, 430, { kind: 'condition', title: 'CPF confere?', body: 'LLM decide com base na resposta do cliente.' }),
  n('consulta', 80, 590, { kind: 'tool', title: 'consultaDebito', body: 'GET /clientes/{{input.cpf}}/debitos' }),
  n('transferir', 540, 590, { kind: 'transfer', title: 'Fila humana', body: 'Ramal 4010 · SAC cobrança' }),
  n('negociacao', 80, 740, { kind: 'conversation', title: 'Negociação', body: 'Ofereça à vista ou em até 3x usando {{consultaDebito.valor}}.', tokens: 210 }),
  n('fim', 120, 900, { kind: 'end', title: 'Encerramento' }),
]
const e = (s: string, t: string, label?: string): Edge => ({ id: `${s}-${t}`, source: s, target: t, label, type: 'smoothstep' })
const EDGES: Edge[] = [
  e('start', 'abertura'), e('abertura', 'validacao'), e('validacao', 'cond'),
  e('cond', 'consulta', 'sim'), e('cond', 'transferir', 'não'),
  e('consulta', 'negociacao'), e('negociacao', 'fim'),
]

function ToolButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className="flex size-8 items-center justify-center rounded-md text-dim hover:bg-surface-hover hover:text-ink">
      <Icon className="size-4" strokeWidth={1.75} />
    </button>
  )
}

function Canvas() {
  const [nodes, setNodes] = useState(INITIAL_NODES)
  const [selected, setSelected] = useState<Node<Data> | null>(null)
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const onNodesChange = useCallback((c: NodeChange<Node<Data>>[]) => setNodes(ns => applyNodeChanges(c, ns)), [])

  return (
    <div className="relative flex-1">
      <ReactFlow
        nodes={nodes}
        edges={EDGES}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => setSelected(node)}
        fitView
        fitViewOptions={{ padding: 0.08, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        className="niwia-flow"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--field)" />
      </ReactFlow>

      <div className="absolute bottom-4 left-4 flex items-center gap-0.5 rounded-lg border border-hairline bg-raised p-1 shadow-sm">
        <ToolButton icon={Undo2} label="Desfazer" />
        <ToolButton icon={Redo2} label="Refazer" />
        <span className="mx-1 h-5 w-px bg-hairline" />
        <ToolButton icon={Minus} label="Diminuir zoom" onClick={() => zoomOut()} />
        <ToolButton icon={Plus} label="Aumentar zoom" onClick={() => zoomIn()} />
        <ToolButton icon={Maximize} label="Ajustar à tela" onClick={() => fitView({ padding: 0.08, maxZoom: 1 })} />
      </div>

      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-md border border-hairline bg-raised px-3 py-1.5 text-xs text-ink-soft shadow-sm">
        <Dot tone="caution" /> 1 aviso: a fase <span className="font-medium">negociacao</span> não tem saída para recusa.
      </div>

      <Sheet open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <SheetContent className="w-[440px] sm:max-w-[440px]">
          {selected && (
            <>
              <SheetHeader className="border-b border-hairline">
                <span className="text-[10px] tracking-wide text-faint uppercase">{KIND[selected.data.kind].label}</span>
                <SheetTitle>{selected.data.title}</SheetTitle>
                <SheetDescription>Configuração do nó.</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-medium">Nome</span>
                  <input defaultValue={selected.data.title} className="h-9 w-full rounded-md border border-field bg-transparent px-3 text-[13px] outline-none focus:border-brand focus:ring-3 focus:ring-brand/20" />
                </label>
                {selected.data.body && (
                  <label className="block">
                    <span className="mb-1.5 block text-[13px] font-medium">Instrução</span>
                    <textarea defaultValue={selected.data.body} rows={6} className="w-full rounded-md border border-field bg-transparent px-3 py-2 text-[13px] leading-relaxed outline-none focus:border-brand focus:ring-3 focus:ring-brand/20" />
                  </label>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function WorkflowPage() {
  return (
    <>
      <PageHeader title="Workflow">
        <Button variant="outline"><Calculator /> Simular custo</Button>
        <Button variant="outline"><Settings2 /> Configurações globais</Button>
        <Button variant="ghost" size="icon" aria-label="Ver JSON"><Braces /></Button>
        <Button variant="outline">Salvar versão</Button>
        <Button><Upload /> Publicar</Button>
      </PageHeader>
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </>
  )
}
