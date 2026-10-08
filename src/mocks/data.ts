// Dados de mentira para o protótipo — formato próximo do que o Builder recebe hoje.

export const agentes = [
  { id: 'b71a3d93', nome: 'Claro NET V3', versao: 12, publicada: true, criadoPor: 'David Ferreira', criadoEm: '28 set 2026' },
  { id: 'c22f0e11', nome: 'Claro D8 Cobrança', versao: 4, publicada: false, criadoPor: 'Ana Souza', criadoEm: '22 set 2026' },
  { id: 'a91b7c40', nome: 'Receptivo SAC', versao: 7, publicada: true, criadoPor: 'David Ferreira', criadoEm: '10 set 2026' },
]

export const agenteAtual = {
  ...agentes[0],
  prompt: `Você é a Kora, assistente de cobrança da Claro NET. Fale de forma cordial, objetiva e em frases curtas — o cliente está ao telefone.

## Objetivo
Confirmar a identidade de {{mailing.nome}} e negociar o débito de {{mailing.valor_divida}}.

## Regras
- Nunca informe valores antes de validar o CPF.
- Se o cliente pedir para falar com humano, transfira.
- Use {{consultaDebito.vencimento}} quando o cliente perguntar a data.`,
  primeiraMensagem: 'Olá, falo com {{mailing.nome}}?',
  interrompivel: true,
  voz: 'Vanessa — feminina, calma',
  idioma: 'Português (Brasil)',
  llm: 'llama-3.3-70b-versatile',
  comportamento: 'Cobrança — firme e cordial',
}

export type OrigemConversa = 'voice' | 'whatsapp' | 'test_chat'
export const ORIGENS: { value: OrigemConversa | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Conversas' },
  { value: 'voice', label: 'Ligações' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'test_chat', label: 'Chat de teste' },
]

// Gerador determinístico: o mesmo filtro devolve sempre os mesmos números.
export function semente(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}
export const hashId = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

// Peso de cada agente no volume e mistura de canais.
const PERFIL: Record<string, { volume: number; mix: Record<OrigemConversa, number>; sucesso: number; duracaoS: number }> = {
  b71a3d93: { volume: 1, mix: { voice: 0.86, whatsapp: 0.1, test_chat: 0.04 }, sucesso: 0.71, duracaoS: 142 },
  c22f0e11: { volume: 0.5, mix: { voice: 0.7, whatsapp: 0.22, test_chat: 0.08 }, sucesso: 0.63, duracaoS: 128 },
  a91b7c40: { volume: 0.22, mix: { voice: 0.55, whatsapp: 0.42, test_chat: 0.03 }, sucesso: 0.82, duracaoS: 196 },
}
export const perfil = (id: string) => PERFIL[id] ?? { volume: 0, mix: { voice: 0, whatsapp: 0, test_chat: 0 }, sucesso: 0, duracaoS: 0 }

// Curva do dia de um discador: começa às 8h, pico no fim da manhã, cai depois das 18h.
export const CURVA = [0, 0, 0, 0, 0, 0, 0, 0.2, 0.7, 1.1, 1.4, 1.5, 1.1, 1.3, 1.45, 1.3, 1.15, 0.9, 0.5, 0.15, 0, 0, 0, 0]
export const HORA_AGORA = 14 // "agora" do protótipo: 14:52

export type DiaRef = 'hoje' | 'ontem' | 'semana_passada'

export function serieHoraria(agentesIds: string[], origem: OrigemConversa | 'todas', dia: DiaRef): number[] {
  const deslocamento = { hoje: 0, ontem: 1, semana_passada: 7 }[dia]
  return CURVA.map((c, h) => {
    if (dia === 'hoje' && h > HORA_AGORA) return 0
    return agentesIds.reduce((soma, id) => {
      const p = perfil(id)
      const r = semente(hashId(id) + deslocamento * 97 + h)()
      const mix = origem === 'todas' ? 1 : p.mix[origem]
      return soma + Math.round(c * 22 * p.volume * mix * (0.75 + r * 0.5))
    }, 0)
  })
}

export type Dia = { conversas: number; avaliadas: number; sucesso: number; duracaoTotalS: number; custoUsd: number }

// Um dia de conversas encerradas de um agente, `n` dias atrás (0 = hoje).
export function diaDoAgente(id: string, n: number): Dia {
  const p = perfil(id)
  const r = semente(hashId(id) * 13 + n * 7919)
  const fimDeSemana = [0, 6].includes(new Date(2026, 9, 6 - n).getDay())
  const conversas = Math.round(p.volume * (fimDeSemana ? 70 : 210) * (0.8 + r() * 0.4) * (1 + (90 - Math.min(n, 90)) / 400))
  const avaliadas = Math.round(conversas * (0.88 + r() * 0.08))
  const sucesso = Math.round(avaliadas * Math.min(0.97, p.sucesso + (r() - 0.5) * 0.08))
  return {
    conversas, avaliadas, sucesso,
    duracaoTotalS: Math.round(conversas * p.duracaoS * (0.9 + r() * 0.2)),
    // ~6 mil tokens por conversa, preço médio dos modelos em uso.
    custoUsd: conversas * 0.0042 * (0.85 + r() * 0.3),
  }
}

// Série diária somando os agentes, do mais antigo para o mais recente. `offset` pula dias (período anterior).
export function serieDiaria(agentesIds: string[], dias: number, offset = 0): Dia[] {
  return Array.from({ length: dias }, (_, i) => {
    const n = offset + dias - 1 - i
    return agentesIds.reduce<Dia>((acc, id) => {
      const d = diaDoAgente(id, n)
      return { conversas: acc.conversas + d.conversas, avaliadas: acc.avaliadas + d.avaliadas, sucesso: acc.sucesso + d.sucesso, duracaoTotalS: acc.duracaoTotalS + d.duracaoTotalS, custoUsd: acc.custoUsd + d.custoUsd }
    }, { conversas: 0, avaliadas: 0, sucesso: 0, duracaoTotalS: 0, custoUsd: 0 })
  })
}

// conversations.status = 'in_progress' agora.
export const aoVivoPorAgente: Record<string, number> = { b71a3d93: 3, c22f0e11: 1, a91b7c40: 0 }

// Catálogo de finalizações (tabela finalizations) e a proporção de cada uma por agente.
// DESCONHECIDO é a fixa (finalization_id = 0); agente sem catálogo grava NULL e fica de fora.
export const finalizacoesPorAgente: Record<string, { valor: string; peso: number }[]> = {
  b71a3d93: [{ valor: 'ACORDO', peso: 0.34 }, { valor: 'PROMESSA', peso: 0.19 }, { valor: 'BOLETO_ENVIADO', peso: 0.16 }, { valor: 'CONTESTACAO', peso: 0.08 }, { valor: 'NUMERO_ERRADO', peso: 0.07 }, { valor: 'DESCONHECIDO', peso: 0.16 }],
  c22f0e11: [{ valor: 'ACORDO', peso: 0.29 }, { valor: 'PROMESSA', peso: 0.24 }, { valor: 'NUMERO_ERRADO', peso: 0.12 }, { valor: 'DESCONHECIDO', peso: 0.35 }],
  a91b7c40: [{ valor: 'SEGUNDA_VIA', peso: 0.41 }, { valor: 'DUVIDA_FATURA', peso: 0.33 }, { valor: 'DESCONHECIDO', peso: 0.26 }],
}

// Sugestões que a tela consegue montar com dado real.
export const recomendacoes = [
  {
    id: 'versao-nao-publicada', agenteId: 'b71a3d93',
    texto: 'A versão v13 do Claro NET V3 está salva e ainda não foi publicada.', // agent_versions sem published_at
    acao: 'Revisar e publicar', destino: 'agente',
  },
  {
    id: 'abandono-fase', agenteId: 'b71a3d93',
    texto: '12% das ligações de ontem foram abandonadas na fase de validação de identidade.', // status abandoned + last_phase
    acao: 'Ver as conversas', destino: 'conversas',
  },
  {
    id: 'erro-tool', agenteId: 'c22f0e11',
    texto: 'A tool consultaDebito falhou em 9 conversas do Claro D8 Cobrança nas últimas 24h.', // tool_error_count
    acao: 'Ver as conversas', destino: 'conversas',
  },
]
