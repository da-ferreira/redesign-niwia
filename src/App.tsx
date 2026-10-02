import { BrowserRouter, Route, Routes } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PrefsProvider, usePrefs } from '@/lib/prefs'
import { AppShell } from '@/components/layout/AppShell'
import { AgentePage } from '@/pages/AgentePage'
import { AgenteStripePage } from '@/pages/AgenteStripePage'
import { ConversasPage } from '@/pages/ConversasPage'
import { InicioPage } from '@/pages/InicioPage'
import { WorkflowPage } from '@/pages/WorkflowPage'
import { FundamentosPage } from '@/pages/FundamentosPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

const PENDENTES: [string, string][] = [
  ['/agentes', 'Agentes'], ['/construtor', 'Construtor'], ['/central-ajuda', 'Central de ajuda'],
  ['/agentes/:id/base-conhecimento', 'Base de conhecimento'], ['/agentes/:id/diretrizes', 'Diretrizes'],
  ['/agentes/:id/finalizacoes', 'Finalizações'], ['/agentes/:id/versoes', 'Versões'],
  ['/agentes/:id/relatorio-audios', 'Relatório de áudios'], ['/agentes/:id/relatorio-mensagens', 'Relatório de mensagens'],
]

// Agente é a única tela com layout próprio no estilo Stripe; Início e Conversas mudam só pela casca e pelos tokens.
function Agente() {
  return usePrefs().estilo === 'stripe' ? <AgenteStripePage /> : <AgentePage />
}

export default function App() {
  return (
    <PrefsProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<InicioPage />} />
              <Route path="fundamentos" element={<FundamentosPage />} />
              <Route path="agentes/:id/agente" element={<Agente />} />
              <Route path="agentes/:id/workflow" element={<WorkflowPage />} />
              <Route path="agentes/:id/conversas" element={<ConversasPage />} />
              {PENDENTES.map(([p, t]) => <Route key={p} path={p} element={<PlaceholderPage title={t} />} />)}
              <Route path="*" element={<PlaceholderPage title="Página" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PrefsProvider>
  )
}
