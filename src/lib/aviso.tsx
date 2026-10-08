import { useEffect, useState } from 'react'

// Aviso curto no rodapé: confirma a ação de tela enquanto não há backend.
export function useAviso() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2600)
    return () => clearTimeout(t)
  }, [msg])
  const el = msg && (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-[13px] text-canvas shadow-lg">{msg}</div>
  )
  return [el, setMsg] as const
}
