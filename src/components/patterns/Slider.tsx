import { useState } from 'react'

// Controle de faixa simples com o valor ao lado do rótulo.
export function Slider({ label, value, min = 0, max = 1, step = 0.05 }: { label: string; value: number; min?: number; max?: number; step?: number }) {
  const [v, setV] = useState(value)
  return (
    <label className="block">
      <span className="mb-3 flex items-center justify-between text-[15px]">
        {label}
        <span className="text-[14px] tabular-nums text-dim">{v.toFixed(2)}</span>
      </span>
      <input
        type="range" min={min} max={max} step={step} value={v}
        onChange={e => setV(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-hairline accent-ink"
      />
    </label>
  )
}
