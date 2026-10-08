// Conversas mockadas no formato da tabela `conversations` (+ `conversation_events`,
// `conversation_logs` e `conversation_ratings`) do loopieeApiAgent. A quantidade por
// dia e a taxa de sucesso saem do mesmo gerador da tela Início, então os números batem.

import { agentes, aoVivoPorAgente, CURVA, diaDoAgente, finalizacoesPorAgente, hashId, HORA_AGORA, perfil, semente } from './data'

export type Origem = 'voice' | 'whatsapp' | 'test_chat' | 'api'
export type Status = 'in_progress' | 'finished' | 'abandoned' | 'failed'
export type Avaliacao = 'successful' | 'failed' | 'unknown'
export type Sentimento = 'positive' | 'neutral' | 'negative'
export type Frustracao = 'low' | 'medium' | 'high'

export type Conversa = {
  id: string // conv_<ulid>
  seq: number
  agenteId: string
  origem: Origem
  status: Status
  endReason: string | null
  titulo: string
  resumo: string | null
  contato: string | null
  contatoNome: string | null
  inicio: Date
  duracaoMs: number
  mensagens: number
  turnos: number
  tools: number
  toolErros: number
  diretrizes: number
  avaliacao: Avaliacao | null // null = análise ainda não rodou (em andamento)
  sentimento: Sentimento | null
  frustracao: Frustracao | null
  humor: string | null
  finalizacao: { id: number; valor: string; razao: string } | null
  primeiraFase: string
  ultimaFase: string
  modelo: string
  tokensIn: number
  tokensCached: number
  tokensOut: number
  custoUsd: number
  flowKey: string
  temRag: boolean
  contexto: [string, string][] // meta.clientContext
  nota: { score: number; min: number; max: number; descricao: string | null } | null
  roteiro: Roteiro
}

// ——— Rótulos (mesmos do Builder: utils/conversationLabels.js) ———

export const ORIGEM_LABEL: Record<Origem, string> = { voice: 'Ligação', whatsapp: 'WhatsApp', test_chat: 'Chat de teste', api: 'API' }
export const STATUS_LABEL: Record<Status, string> = { in_progress: 'Em andamento', finished: 'Finalizada', abandoned: 'Abandonada', failed: 'Falhou' }
export const AVALIACAO_LABEL: Record<Avaliacao, string> = { successful: 'Sucesso', failed: 'Falha', unknown: 'Sem avaliação' }
export const SENTIMENTO_LABEL: Record<Sentimento, string> = { positive: 'Positivo', neutral: 'Neutro', negative: 'Negativo' }
export const FRUSTRACAO_LABEL: Record<Frustracao, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' }
export const END_REASON_LABEL: Record<string, string> = {
  user_closed: 'Encerrada pela tela',
  flow_end: 'Encerrada pelo fluxo',
  guardrail: 'Encerrada por diretriz',
  idle_timeout: 'Encerrada por inatividade',
  error: 'Encerrada por erro',
  hangup: 'Cliente desligou',
}

const ROTULOS_FIN: Record<string, string> = {
  ACORDO: 'Acordo', PROMESSA: 'Promessa de pagamento', BOLETO_ENVIADO: 'Boleto enviado', CONTESTACAO: 'Contestação',
  NUMERO_ERRADO: 'Número errado', SEGUNDA_VIA: 'Segunda via', DUVIDA_FATURA: 'Dúvida na fatura', DESCONHECIDO: 'Desconhecido',
}
export const rotuloFinalizacao = (v: string) => ROTULOS_FIN[v] ?? v.charAt(0) + v.slice(1).toLowerCase().replaceAll('_', ' ')

// Catálogo (tabela finalizations): DESCONHECIDO é sempre o id 0.
export function catalogoFinalizacoes(agenteId: string) {
  return (finalizacoesPorAgente[agenteId] ?? []).map((f, i) => ({ id: f.valor === 'DESCONHECIDO' ? 0 : i + 1, valor: f.valor }))
}

// ——— Configuração por agente ———

type Tipo = 'cobranca' | 'sac'
const CONFIG: Record<string, { tipo: Tipo; ramal: string; modelo: string; precoIn: number; precoCached: number; precoOut: number; flow: string; marca: string }> = {
  b71a3d93: { tipo: 'cobranca', ramal: '3101', modelo: 'llama-3.3-70b-versatile', precoIn: 0.59, precoCached: 0.295, precoOut: 0.79, flow: 'camara_ai:b71a3d93-4c1e-4f0a-9d2e-7a1f3c5b8e20', marca: 'Claro NET' },
  c22f0e11: { tipo: 'cobranca', ramal: '3102', modelo: 'gpt-4.1-mini', precoIn: 0.4, precoCached: 0.1, precoOut: 1.6, flow: 'camara_ai:c22f0e11-8b7d-4e2a-a1c3-5d9e0f2b6a74', marca: 'Claro' },
  a91b7c40: { tipo: 'sac', ramal: '3201', modelo: 'llama-3.3-70b-versatile', precoIn: 0.59, precoCached: 0.295, precoOut: 0.79, flow: 'camara_ai:a91b7c40-2e6f-4b8d-9c1a-3f7e5d0b4c96', marca: 'Claro' },
}
const config = (id: string) => CONFIG[id] ?? CONFIG.b71a3d93

export const FASES: Record<Tipo, string[]> = {
  cobranca: ['abertura', 'validacao_de_identidade', 'consulta_de_debito', 'negociacao', 'encerramento'],
  sac: ['abertura', 'identificacao', 'atendimento', 'encerramento'],
}
export const fasesDoAgente = (id: string) => FASES[config(id).tipo]

// ——— "Agora" do protótipo: 06/10/2026 14:52, andando com o relógio para as ao vivo crescerem ———

const AGORA_BASE = new Date(2026, 9, 6, HORA_AGORA, 52, 0).getTime()
const CARREGOU = Date.now()
export const agora = () => AGORA_BASE + (Date.now() - CARREGOU)
export const DIAS_HISTORICO = 30

// ——— Gerador ———

const NOMES = [
  'Marcos Oliveira', 'Juliana Costa', 'Fernanda Lima', 'Ricardo Alves', 'Patrícia Rocha', 'Carlos Menezes', 'Aline Barbosa',
  'Thiago Martins', 'Camila Ferreira', 'Roberto Nunes', 'Luciana Prado', 'Eduardo Ramos', 'Beatriz Teixeira', 'Gustavo Pires',
  'Renata Moura', 'André Carvalho', 'Sandra Ribeiro', 'Felipe Duarte', 'Mariana Lopes', 'Paulo Henrique Souza', 'Vanessa Gomes',
  'Rodrigo Batista', 'Cláudia Freitas', 'Leonardo Dias',
]
const DDD = ['11', '11', '11', '21', '21', '31', '41', '51', '61', '71', '81', '85', '62', '27', '48']
const TESTADORES = [{ nome: 'David Ferreira', contato: 'david@niwia.com.br' }, { nome: 'Ana Souza', contato: 'ana@niwia.com.br' }]

export type Roteiro =
  | 'acordo' | 'promessa' | 'boleto' | 'contestacao' | 'numero_errado' | 'abandono' | 'erro_tool' | 'diretriz'
  | 'wa_boleto' | 'wa_sem_resposta' | 'sac_segunda_via' | 'sac_duvida' | 'sac_abandono' | 'teste'

type Rng = () => number
const escolher = <T,>(r: Rng, xs: readonly T[]) => xs[Math.floor(r() * xs.length)]
function sortearPeso<T extends { peso: number }>(r: Rng, xs: T[]): T {
  const total = xs.reduce((s, x) => s + x.peso, 0)
  let v = r() * total
  for (const x of xs) if ((v -= x.peso) <= 0) return x
  return xs[xs.length - 1]
}
const ULID = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const ulid = (r: Rng) => Array.from({ length: 26 }, () => ULID[Math.floor(r() * 32)]).join('')

// Hora de início dentro do dia, seguindo a curva do discador. Hoje para no "agora".
function horaDoDia(r: Rng, hoje: boolean) {
  const curva = CURVA.map((c, h) => (hoje && h > HORA_AGORA ? 0 : c))
  const total = curva.reduce((a, b) => a + b, 0)
  let v = r() * total
  let h = 8
  for (let i = 0; i < 24; i++) if ((v -= curva[i]) <= 0) { h = i; break }
  const maxMin = hoje && h === HORA_AGORA ? 50 : 60
  return { h, m: Math.floor(r() * maxMin), s: Math.floor(r() * 60) }
}

function roteiroPara(tipo: Tipo, origem: Origem, avaliacao: Avaliacao, status: Status, fin: string | null, r: Rng): Roteiro {
  if (origem === 'test_chat') return 'teste'
  if (origem === 'whatsapp') return status === 'abandoned' ? 'wa_sem_resposta' : 'wa_boleto'
  if (tipo === 'sac') return status === 'abandoned' ? 'sac_abandono' : fin === 'DUVIDA_FATURA' ? 'sac_duvida' : 'sac_segunda_via'
  if (status === 'abandoned') return 'abandono'
  if (status === 'failed') return 'erro_tool'
  if (fin === 'CONTESTACAO') return 'contestacao'
  if (fin === 'NUMERO_ERRADO') return 'numero_errado'
  if (fin === 'PROMESSA') return 'promessa'
  if (fin === 'BOLETO_ENVIADO') return 'boleto'
  if (avaliacao === 'failed') return r() < 0.5 ? 'diretriz' : 'contestacao'
  return r() < 0.12 ? 'diretriz' : 'acordo'
}

const TITULOS: Record<Roteiro, string[]> = {
  acordo: ['Acordo fechado em 3 parcelas', 'Acordo à vista com desconto', 'Parcelamento em 2 vezes aceito', 'Acordo fechado em 4 parcelas'],
  promessa: ['Promessa de pagamento para sexta', 'Cliente promete pagar no dia 10', 'Promessa de pagamento até o fim do mês'],
  boleto: ['Boleto enviado por SMS', 'Segunda via do boleto enviada', 'Pediu o boleto por SMS'],
  contestacao: ['Cliente desconhece a dívida', 'Contestação de cobrança', 'Diz que já pagou a fatura'],
  numero_errado: ['Número errado', 'Telefone não é do titular'],
  abandono: ['Ligação caiu na validação', 'Cliente desligou na negociação', 'Silêncio após a abertura'],
  erro_tool: ['Timeout na consultaDebito', 'Falha ao consultar o débito'],
  diretriz: ['Cliente fugiu do assunto', 'Pergunta fora do escopo redirecionada'],
  wa_boleto: ['Boleto enviado pelo WhatsApp', 'Segunda via da fatura', 'Pediu o código de barras'],
  wa_sem_resposta: ['Cliente parou de responder', 'Sem resposta no WhatsApp'],
  sac_segunda_via: ['Segunda via da fatura', 'Pediu a fatura por e-mail'],
  sac_duvida: ['Dúvida sobre valor da fatura', 'Cobrança de serviço não contratado'],
  sac_abandono: ['Ligação caiu no menu', 'Cliente desligou na identificação'],
  teste: ['Teste do prompt novo', 'Teste da negociação', 'Teste de interrupção'],
}

const RESUMOS: Partial<Record<Roteiro, (n: string, v: string) => string>> = {
  acordo: (n, v) => `${n} confirmou a identidade pelos três primeiros dígitos do CPF. Informado do débito de ${v}, pediu parcelamento e aceitou três parcelas com primeiro vencimento no dia 10. O acordo foi registrado e o boleto será enviado por SMS.`,
  promessa: (n, v) => `${n} confirmou a identidade e reconheceu o débito de ${v}. Sem condição de pagar hoje, prometeu quitar na sexta-feira. A promessa foi registrada.`,
  boleto: (n, v) => `${n} validou a identidade e pediu o boleto do débito de ${v} para pagar no aplicativo do banco. O boleto foi enviado por SMS.`,
  contestacao: (n, v) => `${n} não reconheceu o débito de ${v} e disse ter cancelado o serviço. O agente abriu uma contestação e informou o prazo de análise de até 10 dias úteis.`,
  numero_errado: () => 'Quem atendeu informou que o número não pertence ao titular. O agente pediu desculpas e encerrou a ligação.',
  abandono: n => `A ligação caiu enquanto o agente pedia a confirmação do CPF de ${n}. Não houve negociação.`,
  erro_tool: n => `${n} confirmou a identidade, mas a consulta do débito não respondeu a tempo. O agente usou a fala de contingência e encerrou sem negociar.`,
  diretriz: (n, v) => `${n} fez perguntas fora do assunto e o agente redirecionou a conversa. Depois, confirmou o débito de ${v} e aceitou parcelar.`,
  wa_boleto: (n, v) => `${n} pediu a segunda via pelo WhatsApp. O agente gerou o boleto de ${v} e enviou o código de barras.`,
  wa_sem_resposta: n => `${n} iniciou a conversa, mas parou de responder depois da primeira pergunta. A conversa foi encerrada por inatividade.`,
  sac_segunda_via: n => `${n} pediu a segunda via da fatura de outubro. O agente confirmou o e-mail cadastrado e enviou a fatura.`,
  sac_duvida: n => `${n} questionou um valor a mais na fatura. O agente explicou a cobrança proporcional da troca de plano com base na base de conhecimento.`,
  sac_abandono: n => `${n} desligou durante a identificação, antes de dizer o motivo do contato.`,
  teste: () => 'Conversa de teste no chat do Builder, simulando uma negociação de débito.',
}

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const cpfMascarado = (r: Rng) => `${100 + Math.floor(r() * 899)}.•••.•••-${String(Math.floor(r() * 99)).padStart(2, '0')}`

function gerarAgente(agenteId: string): Conversa[] {
  const p = perfil(agenteId)
  if (!p.volume) return []
  const cfg = config(agenteId)
  const catalogo = finalizacoesPorAgente[agenteId] ?? []
  const lista: Conversa[] = []

  for (let n = DIAS_HISTORICO - 1; n >= 0; n--) {
    const dia = diaDoAgente(agenteId, n)
    const r = semente(hashId(agenteId) * 7 + n * 104729)
    // Quem tem avaliação e quem teve sucesso, embaralhado ao longo do dia.
    const ordem = Array.from({ length: dia.conversas }, (_, i) => i).sort(() => r() - 0.5)
    const doDia: Conversa[] = []
    for (let k = 0; k < dia.conversas; k++) {
      const pos = ordem[k]
      const avaliacao: Avaliacao = pos < dia.sucesso ? 'successful' : pos < dia.avaliadas ? 'failed' : 'unknown'
      doDia.push(montar(agenteId, cfg, catalogo, n, avaliacao, r))
    }
    // Ao vivo só hoje: conversas que começaram nos últimos minutos.
    if (n === 0) for (let k = 0; k < (aoVivoPorAgente[agenteId] ?? 0); k++) doDia.push(montar(agenteId, cfg, catalogo, 0, null, r, k))
    doDia.sort((a, b) => a.inicio.getTime() - b.inicio.getTime())
    lista.push(...doDia)
  }
  lista.forEach((c, i) => { c.seq = i + 1 })
  return lista.reverse()
}

function montar(agenteId: string, cfg: (typeof CONFIG)[string], catalogo: { valor: string; peso: number }[], n: number, avaliacao: Avaliacao | null, r: Rng, aoVivo = -1): Conversa {
  const p = perfil(agenteId)
  const vivo = aoVivo >= 0
  const origem: Origem = vivo ? 'voice' : sortearPeso(r, (['voice', 'whatsapp', 'test_chat'] as const).map(o => ({ o, peso: p.mix[o] }))).o

  let status: Status = 'finished'
  if (vivo) status = 'in_progress'
  else if (avaliacao === 'failed') { const x = r(); status = x < 0.45 ? 'abandoned' : x < 0.62 && cfg.tipo === 'cobranca' && origem === 'voice' ? 'failed' : 'finished' }
  else if (avaliacao === 'unknown' && r() < 0.4) status = 'abandoned'

  // Finalização: positivas no sucesso, negativas na falha; abandonada vira DESCONHECIDO.
  let fin: string | null = null
  if (!vivo && origem !== 'test_chat') {
    const positivas = catalogo.filter(f => ['ACORDO', 'PROMESSA', 'BOLETO_ENVIADO', 'SEGUNDA_VIA', 'DUVIDA_FATURA'].includes(f.valor))
    const negativas = catalogo.filter(f => ['CONTESTACAO', 'NUMERO_ERRADO'].includes(f.valor))
    if (status === 'abandoned' || status === 'failed') fin = 'DESCONHECIDO'
    else if (avaliacao === 'successful' && positivas.length) fin = sortearPeso(r, positivas).valor
    else if (negativas.length && r() < 0.7) fin = sortearPeso(r, negativas).valor
    else fin = 'DESCONHECIDO'
    if (origem === 'whatsapp' && avaliacao === 'successful') fin = cfg.tipo === 'sac' ? 'SEGUNDA_VIA' : 'BOLETO_ENVIADO'
  }

  const roteiro = vivo ? (cfg.tipo === 'sac' ? 'sac_segunda_via' : 'acordo') : roteiroPara(cfg.tipo, origem, avaliacao ?? 'unknown', status, fin, r)
  if (fin && !catalogo.some(c => c.valor === fin)) fin = 'DESCONHECIDO'

  const quando = new Date(AGORA_BASE)
  quando.setDate(quando.getDate() - n)
  if (vivo) {
    quando.setTime(AGORA_BASE - (40 + aoVivo * 95 + Math.floor(r() * 30)) * 1000)
  } else {
    const { h, m, s } = horaDoDia(r, n === 0)
    quando.setHours(h, m, s, Math.floor(r() * 1000))
  }

  const testador = escolher(r, TESTADORES)
  const nome = origem === 'test_chat' ? testador.nome : escolher(r, NOMES)
  const primeiro = nome.split(' ')[0]
  const telefone = `55${escolher(r, DDD)}9${String(Math.floor(r() * 1e8)).padStart(8, '0')}`
  const valor = Math.round((89 + r() * 530) * 100) / 100
  const contrato = `${80000 + Math.floor(r() * 19999)}-${String(Math.floor(r() * 9999)).padStart(4, '0')}`

  const base = CONTAGEM[roteiro]
  const curtas = ['numero_errado', 'abandono', 'sac_abandono', 'wa_sem_resposta'].includes(roteiro)
  const duracaoS = origem === 'whatsapp'
    ? (curtas ? 1800 : 240 + r() * 900)
    : p.duracaoS * (curtas ? 0.3 : 1) * (0.7 + r() * 0.6)
  // Encerrada não pode terminar depois de "agora".
  if (!vivo && quando.getTime() + duracaoS * 1000 > AGORA_BASE - 5000) quando.setTime(AGORA_BASE - 5000 - duracaoS * 1000)
  const turnos = base.turnos
  const tokensIn = turnos * Math.round(620 + r() * 260)
  const tokensCached = Math.round(tokensIn * (0.5 + r() * 0.2))
  const tokensOut = turnos * Math.round(38 + r() * 30)
  const custoUsd = ((tokensIn - tokensCached) * cfg.precoIn + tokensCached * cfg.precoCached + tokensOut * cfg.precoOut) / 1e6

  const fases = FASES[cfg.tipo]
  const ultimaFase = vivo ? 'negociacao' : ({ abandono: 'validacao_de_identidade', sac_abandono: 'identificacao', erro_tool: 'consulta_de_debito', wa_sem_resposta: 'abertura' } as Record<string, string>)[roteiro] ?? 'encerramento'

  const negativo = avaliacao === 'failed' || roteiro === 'contestacao'
  const sentimento: Sentimento | null = vivo ? null : negativo ? (r() < 0.6 ? 'negative' : 'neutral') : r() < 0.55 ? 'positive' : 'neutral'
  const frustracao: Frustracao | null = vivo ? null : negativo ? (r() < 0.5 ? 'high' : 'medium') : r() < 0.8 ? 'low' : 'medium'

  const endReason = vivo ? null
    : status === 'abandoned' ? (origem === 'whatsapp' ? 'idle_timeout' : 'hangup')
      : status === 'failed' ? 'error'
        : origem === 'test_chat' ? 'user_closed'
          : 'flow_end'

  const contexto: [string, string][] = origem === 'voice'
    ? [
        ['mailing.nome', nome], ['mailing.cpf', cpfMascarado(r)], ['mailing.contrato', contrato],
        ...(cfg.tipo === 'cobranca'
          ? [['mailing.valor_divida', brl(valor)], ['mailing.dias_atraso', String(12 + Math.floor(r() * 80))], ['mailing.produto', escolher(r, ['NET Virtua 500MB', 'Claro TV+ Box', 'Combo Multi'])]] as [string, string][]
          : [['mailing.plano', escolher(r, ['Claro Pós 50GB', 'Claro Controle 25GB', 'Claro Flex'])]] as [string, string][]),
        ['call.ramal', cfg.ramal], ['call.idcall', String(4_800_000 + Math.floor(r() * 99999))],
      ]
    : origem === 'whatsapp'
      ? [['contato.nome', nome], ['contato.wa_id', telefone], ['mailing.contrato', contrato]]
      : []

  const nota = !vivo && origem !== 'test_chat' && status === 'finished' && r() < 0.18
    ? (() => {
        const score = avaliacao === 'failed' ? 1 + Math.floor(r() * 2) : 4 + Math.floor(r() * 2)
        return { score, min: 1, max: 5, descricao: score >= 4 ? escolher(r, ['Resolveu rápido.', 'Atendente educada.', null, null]) : escolher(r, ['Não resolveu meu problema.', 'Demorou para entender.', null]) }
      })()
    : null

  const finItem = fin ? catalogoFinalizacoes(agenteId).find(c => c.valor === fin)! : null
  return {
    id: `conv_${ulid(r)}`,
    seq: 0,
    agenteId, origem, status, endReason,
    titulo: vivo ? 'Negociação de débito em andamento' : escolher(r, TITULOS[roteiro]),
    resumo: vivo ? null : RESUMOS[roteiro]?.(primeiro, brl(valor)) ?? null,
    contato: origem === 'test_chat' ? testador.contato : telefone,
    contatoNome: nome,
    inicio: quando,
    duracaoMs: Math.round(duracaoS * 1000),
    mensagens: base.mensagens, turnos, tools: base.tools, toolErros: base.toolErros, diretrizes: base.diretrizes,
    avaliacao, sentimento, frustracao,
    humor: vivo ? null : negativo ? escolher(r, ['irritado', 'desconfiado', 'impaciente']) : escolher(r, ['calmo', 'cordial', 'aliviado']),
    finalizacao: finItem ? { ...finItem, razao: RAZOES[fin!] ?? 'O cliente encerrou sem uma definição clara.' } : null,
    primeiraFase: fases[0], ultimaFase,
    modelo: cfg.modelo, tokensIn, tokensCached, tokensOut, custoUsd,
    flowKey: cfg.flow, temRag: true,
    contexto, nota, roteiro,
  }
}

const RAZOES: Record<string, string> = {
  ACORDO: 'Cliente aceitou o parcelamento e o acordo foi registrado na ferramenta registrarAcordo.',
  PROMESSA: 'Cliente informou uma data para pagamento e a promessa foi registrada.',
  BOLETO_ENVIADO: 'Cliente pediu o boleto e a ferramenta de envio confirmou o disparo.',
  CONTESTACAO: 'Cliente não reconheceu o débito; foi aberta uma contestação.',
  NUMERO_ERRADO: 'Quem atendeu informou que não conhece o titular.',
  SEGUNDA_VIA: 'Fatura reenviada para o e-mail cadastrado.',
  DUVIDA_FATURA: 'Dúvida sobre cobrança respondida com base na base de conhecimento.',
  DESCONHECIDO: 'A conversa terminou antes de uma tabulação clara.',
}

// ——— Cache por agente ———

const cache = new Map<string, Conversa[]>()
export function conversasDoAgente(agenteId: string): Conversa[] {
  if (!cache.has(agenteId)) cache.set(agenteId, gerarAgente(agenteId))
  return cache.get(agenteId)!
}

// Ações de tela que mexem na lista: encerrar, apagar e a conversa nova que "chega".
export function encerrarConversa(c: Conversa) {
  const t = segundosDesde(c)
  const ev = linhaDoTempo(c).filter(e => e.t <= t)
  ev.push({ tipo: 'fim', t, titulo: 'Encerrada pela tela', detalhe: 'POST /conversations/:id/finish' })
  timelines.set(c.id, ev)
  c.status = 'finished'
  c.endReason = 'user_closed'
  c.duracaoMs = agora() - c.inicio.getTime()
  c.avaliacao = 'unknown'
  c.resumo = 'Encerrada pela tela enquanto estava em andamento; a análise não rodou.'
  c.finalizacao = { ...catalogoFinalizacoes(c.agenteId).find(f => f.id === 0)!, razao: RAZOES.DESCONHECIDO }
}
export function apagarConversa(c: Conversa) {
  const lista = conversasDoAgente(c.agenteId)
  const i = lista.indexOf(c)
  if (i >= 0) lista.splice(i, 1)
}
export function chegarConversaNova(agenteId: string): Conversa | null {
  const lista = conversasDoAgente(agenteId)
  if (!lista.length) return null
  const r = semente(hashId(agenteId) + lista.length * 31)
  const c = montar(agenteId, config(agenteId), finalizacoesPorAgente[agenteId] ?? [], 0, 'successful', r)
  c.inicio = new Date(agora() - c.duracaoMs - 4000)
  c.seq = Math.max(...lista.map(x => x.seq)) + 1
  lista.unshift(c)
  return c
}

// Falhas da tela Início: evaluation = failed ou status = failed, mais recentes primeiro, de todos os agentes.
export function falhasRecentes(agentesIds: string[]) {
  return agentesIds
    .flatMap(id => conversasDoAgente(id).slice(0, 400))
    .filter(c => c.avaliacao === 'failed' || c.status === 'failed')
    .sort((a, b) => b.inicio.getTime() - a.inicio.getTime())
    .slice(0, 12)
    .map(c => ({
      id: c.id, seq: c.seq, agenteId: c.agenteId, titulo: c.titulo,
      motivo: c.status === 'failed' ? 'Erro de tool' : c.status === 'abandoned' ? 'Abandonada' : c.diretrizes ? 'Diretriz' : 'Avaliada como falha',
      hora: rotuloDiaCurto(c.inicio),
    }))
}

// ——— Datas ———

const chaveDia = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
export const hhmm = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
export function rotuloDia(d: Date) {
  const hoje = new Date(AGORA_BASE)
  const ontem = new Date(AGORA_BASE - 86_400_000)
  const extenso = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  if (chaveDia(d) === chaveDia(hoje)) return { titulo: 'Hoje', extenso }
  if (chaveDia(d) === chaveDia(ontem)) return { titulo: 'Ontem', extenso }
  return { titulo: extenso.charAt(0).toUpperCase() + extenso.slice(1), extenso: '' }
}
export const diaDe = (d: Date) => chaveDia(d)
function rotuloDiaCurto(d: Date) {
  const { titulo } = rotuloDia(d)
  return `${titulo === 'Hoje' || titulo === 'Ontem' ? titulo : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${hhmm(d)}`
}
export function inicioDoDia(diasAtras: number) {
  const d = new Date(AGORA_BASE)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - diasAtras)
  return d
}

export function formatarTelefone(v: string | null) {
  if (!v) return null
  let d = v.replace(/\D/g, '')
  if (!d || v.includes('@')) return v
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2)
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return v
}

// ——— Linha do tempo (conversation_events) ———

export type ToolCall = {
  nome: string; metodo: 'GET' | 'POST'; url: string; input: Record<string, unknown>; resposta?: unknown
  http?: number; ms: number; ramo: 'onSuccess' | 'onError'; timeout?: boolean; erro?: string
}
export type Fonte = { titulo: string; tipo: 'file' | 'url' | 'text'; trecho: string; score: number }
export type Llm = { modelo: string; ms: number; ttftMs: number; tokensIn: number; tokensCached: number; tokensOut: number }

export type Evento =
  | { tipo: 'fase'; t: number; de?: string; para: string; motivo: string; detalhes: [string, string][] }
  | {
      tipo: 'msg'; t: number; lado: 'agente' | 'cliente'; texto: string; fase?: string
      tom?: Sentimento; dtmf?: boolean; contingencia?: string; correcao?: string; midia?: string[]; emocao?: string
      llm?: Llm; rag?: { ms: number; consulta: string; fontes: Fonte[] }
      voz?: { ttsMs: number; falouMs: number; cortadaMs?: number }; stt?: { modelo: string; falaMs: number }
      tools?: ToolCall[]
    }
  | { tipo: 'ponte'; t: number; texto: string }
  | { tipo: 'diretriz'; t: number; titulo: string; detalhe: string }
  | { tipo: 'fim'; t: number; titulo: string; detalhe?: string }
  | { tipo: 'tecnico'; t: number; nome: string; linhas: [string, string][] }

const FONTES: Record<string, Fonte> = {
  parcelamento: { titulo: 'Política de parcelamento 2026.pdf', tipo: 'file', trecho: 'Débitos entre R$ 80 e R$ 1.000 podem ser parcelados em até 4 vezes sem juros, com primeira parcela em até 7 dias corridos.', score: 0.86 },
  desconto: { titulo: 'Campanha de desconto à vista', tipo: 'text', trecho: 'Pagamento à vista até o dia 15 tem 10% de desconto sobre o valor em aberto.', score: 0.74 },
  contestacao: { titulo: 'Contestação de débitos', tipo: 'url', trecho: 'Quando o cliente não reconhece a dívida, abrir contestação e informar o prazo de análise de até 10 dias úteis. Não insistir na cobrança.', score: 0.91 },
  segundaVia: { titulo: 'FAQ — segunda via', tipo: 'url', trecho: 'A segunda via pode ser enviada para o e-mail cadastrado ou por SMS. O código de barras vale até a data de vencimento.', score: 0.83 },
  proporcional: { titulo: 'Cobrança proporcional na troca de plano.pdf', tipo: 'file', trecho: 'Na troca de plano no meio do ciclo, a fatura seguinte traz os dias proporcionais dos dois planos.', score: 0.88 },
}

type Ctx = { c: Conversa; nome: string; valor: string; r: Rng; voz: boolean }

// Cada roteiro devolve os eventos com tempo relativo; no fim o tempo é esticado para a duração real.
function roteiroEventos(x: Ctx): Evento[] {
  const { c, nome, valor, r, voz } = x
  const cfg = config(c.agenteId)
  const ev: Evento[] = []
  let t = 0
  let fase = FASES[cfg.tipo][0]
  const llm = (): Llm => ({ modelo: cfg.modelo, ms: Math.round(700 + r() * 1300), ttftMs: Math.round(220 + r() * 300), tokensIn: Math.round(2400 + r() * 900), tokensCached: Math.round(1600 + r() * 500), tokensOut: Math.round(30 + r() * 50) })
  const agente = (texto: string, extra: Partial<Extract<Evento, { tipo: 'msg' }>> = {}) => {
    const l = extra.llm === undefined ? llm() : extra.llm
    t += (l?.ms ?? 300) / 1000 + 0.4
    const falouMs = Math.round(texto.length * 62)
    ev.push({ tipo: 'msg', t, lado: 'agente', texto, fase, ...(l ? { llm: l } : {}), ...(voz ? { voz: { ttsMs: Math.round(180 + r() * 260), falouMs } } : {}), ...extra })
    if (voz) ev.push({ tipo: 'tecnico', t: t + 0.2, nome: 'tts.first_byte', linhas: [['latência', `${Math.round(180 + r() * 260)} ms`], ['voz', 'Vanessa'], ['modelo', 'eleven_multilingual_v2']] })
    t += voz ? falouMs / 1000 : 2
  }
  const cliente = (texto: string, extra: Partial<Extract<Evento, { tipo: 'msg' }>> = {}) => {
    const falaMs = Math.round(texto.length * 70 + 400)
    t += voz ? 0.8 + falaMs / 1000 : 6 + r() * 40
    ev.push({ tipo: 'msg', t, lado: 'cliente', texto, ...(voz ? { stt: { modelo: 'nova-2', falaMs } } : {}), ...extra })
  }
  const mudar = (para: string, motivo: string, detalhes: [string, string][] = []) => {
    t += 0.1
    ev.push({ tipo: 'fase', t, de: fase, para, motivo, detalhes: [['motivo', motivo], ...detalhes] })
    fase = para
  }
  const tool = (nome: string, input: Record<string, unknown>, resposta: unknown, ok = true, extra: Partial<ToolCall> = {}): ToolCall => ({
    nome, metodo: nome.startsWith('consulta') ? 'GET' : 'POST',
    url: `https://api.cobranca.claro.com.br/v2/${nome.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}${nome.startsWith('consulta') ? `?contrato=${input.contrato ?? ''}` : ''}`,
    input, resposta: ok ? resposta : undefined, http: ok ? (nome.startsWith('consulta') ? 200 : 201) : undefined,
    ms: Math.round(180 + r() * 420), ramo: ok ? 'onSuccess' : 'onError', ...extra,
  })
  const contrato = c.contexto.find(([k]) => k === 'mailing.contrato')?.[1] ?? '88213-0045'
  const ragDe = (consulta: string, ...chaves: string[]) => ({ ms: Math.round(90 + r() * 120), consulta, fontes: chaves.map(k => FONTES[k]) })
  const fim = (titulo: string, detalhe?: string) => { t += 1; ev.push({ tipo: 'fim', t, titulo, detalhe }) }
  const primeiro = nome.split(' ')[0]

  // Voz de cobrança: o miolo comum.
  const aberturaCobranca = (dtmf: boolean) => {
    agente(`Olá, falo com ${nome}?`, { llm: null as unknown as undefined })
    cliente(r() < 0.5 ? 'Sim, sou eu.' : 'Sou eu, pode falar.', { tom: 'neutral' })
    mudar('validacao_de_identidade', 'decisão da IA', [['casou', '"sim"']])
    agente(`${primeiro}, aqui é a Kora, da ${cfg.marca}. Para sua segurança, pode me confirmar os três primeiros dígitos do seu CPF?`)
    if (dtmf) cliente('341', { dtmf: true })
    else cliente('Três, quatro, um.', { correcao: r() < 0.3 ? 'STT fechou depois: "três quatro um"' : undefined })
  }
  const consultar = () => {
    mudar('consulta_de_debito', 'avanço automático')
    const tc = tool('consultaDebito', { contrato, cpf_prefixo: '341' }, { contrato, valor: valor, vencimento: '10/10/2026', dias_atraso: 34, parcelavel: true })
    ev.push({ tipo: 'ponte', t: t + 0.3, texto: 'Só um instante, estou consultando aqui.' })
    t += 1.2 + tc.ms / 1000
    mudar('negociacao', 'resultado da ferramenta', [['tool', 'consultaDebito'], ['ramo', 'onSuccess']])
    agente(`Obrigada. Consta um valor em aberto de ${valor}, com vencimento em 10 de outubro. Consegue pagar hoje ou prefere parcelar?`, { tools: [tc], rag: ragDe('opções de pagamento débito em atraso', 'parcelamento', 'desconto') })
  }

  switch (c.roteiro) {
    case 'acordo':
    case 'promessa':
    case 'boleto':
    case 'diretriz': {
      aberturaCobranca(r() < 0.3)
      consultar()
      if (c.roteiro === 'diretriz') {
        cliente('Antes disso, você sabe me dizer o resultado do jogo de ontem?', { tom: 'neutral' })
        t += 0.3
        ev.push({ tipo: 'diretriz', t, titulo: 'Diretriz: fora de escopo · redirecionou', detalhe: 'Tema fora do atendimento de cobrança.' })
        agente('Essa eu fico devendo, sou especialista só no seu atendimento da Claro. Voltando ao débito: prefere pagar hoje ou parcelar?', { emocao: '[bem-humorada]' })
      }
      if (c.roteiro === 'promessa') {
        cliente('Hoje não consigo. Recebo na sexta, posso pagar nesse dia?', { tom: 'neutral' })
        const tc = tool('registrarPromessa', { contrato, data: '09/10/2026', valor }, { protocolo: `PR${Math.floor(r() * 1e7)}` })
        agente('Pode sim. Vou registrar a promessa de pagamento para sexta, dia 9. Você recebe o código de barras por SMS na quinta. Combinado?', { tools: [tc] })
        cliente('Combinado.', { tom: 'positive' })
      } else if (c.roteiro === 'boleto') {
        cliente('Me manda o boleto que eu pago pelo aplicativo do banco.', { tom: 'positive' })
        const tc = tool('enviarBoleto', { contrato, canal: 'sms', telefone: c.contato }, { enviado: true, linha_digitavel: '23793.38128 60000.000003 00000.000400 1 98760000018990' })
        agente('Perfeito. Acabei de enviar o boleto por SMS para este número. O pagamento compensa em até dois dias úteis.', { tools: [tc] })
        cliente('Chegou aqui, obrigado.', { tom: 'positive' })
      } else {
        cliente('Hoje não dá. Consigo dividir em três vezes?', { tom: 'neutral' })
        const corte = r() < 0.5
        agente('Consegue sim. Ficam três parcelas iguais, a primeira para o dia dez. Posso confirmar o acordo?', corte ? {} : {})
        if (corte) {
          const ultimo = ev.findLast(e => e.tipo === 'msg' && e.lado === 'agente') as Extract<Evento, { tipo: 'msg' }>
          ultimo.voz = { ...ultimo.voz!, cortadaMs: Math.round(ultimo.voz!.falouMs * 0.6) }
          ev.push({ tipo: 'tecnico', t: ultimo.t + ultimo.voz.cortadaMs! / 1000, nome: 'vad.interrupt', linhas: [['rms', String(Math.round(420 + r() * 300))], ['limiar', '200'], ['fala do cliente', '1.340 ms']] })
        }
        cliente(corte ? 'Pode, pode confirmar.' : 'Pode confirmar.', { tom: 'positive' })
        ev.push({ tipo: 'ponte', t: t + 0.4, texto: 'Perfeito, estou registrando.' })
        const tc = tool('registrarAcordo', { contrato, parcelas: 3, primeiro_vencimento: '10/10/2026' }, { protocolo: `AC${Math.floor(r() * 1e7)}`, parcelas: 3 })
        t += 0.8
        agente(`Pronto, acordo registrado. Você recebe o boleto da primeira parcela por SMS ainda hoje. Obrigada, ${primeiro}, tenha um ótimo dia.`, { tools: [tc], emocao: '[cordial]' })
      }
      mudar('encerramento', 'decisão da IA')
      if (c.roteiro !== 'acordo' && c.roteiro !== 'diretriz') agente(`Obrigada pelo retorno, ${primeiro}. Tenha um ótimo dia.`)
      fim('Encerrada pelo fluxo', 'fase encerramento')
      break
    }
    case 'contestacao': {
      aberturaCobranca(false)
      consultar()
      cliente('Que dívida é essa? Eu cancelei esse serviço em julho, não devo nada.', { tom: 'negative' })
      const tc = tool('abrirContestacao', { contrato, motivo: 'servico_cancelado' }, { protocolo: `CT${Math.floor(r() * 1e7)}`, prazo_dias_uteis: 10 })
      agente('Entendo. Vou abrir uma contestação agora para a área responsável analisar o cancelamento. O prazo é de até dez dias úteis e, enquanto isso, a cobrança fica suspensa.', { tools: [tc], rag: ragDe('cliente não reconhece a dívida', 'contestacao') })
      cliente('Tá, mas ninguém mais me liga sobre isso, né?', { tom: 'negative' })
      mudar('encerramento', 'decisão da IA')
      agente('Isso, enquanto a análise estiver aberta você não recebe novas cobranças. O protocolo vai por SMS. Obrigada pela paciência.')
      fim('Encerrada pelo fluxo', 'fase encerramento')
      break
    }
    case 'numero_errado': {
      agente(`Olá, falo com ${nome}?`, { llm: null as unknown as undefined })
      cliente(`Não, aqui não tem nenhum ${primeiro}. Esse número é meu faz anos.`, { tom: 'neutral' })
      mudar('encerramento', 'frase contida', [['casou', '"não tem nenhum"']])
      agente('Peço desculpas pelo incômodo. Vou retirar este número do cadastro. Tenha um bom dia.')
      fim('Encerrada pelo fluxo', 'fase encerramento')
      break
    }
    case 'abandono': {
      aberturaCobranca(false)
      ev.pop()
      t += 4
      ev.push({ tipo: 'tecnico', t, nome: 'stt.silence', linhas: [['silêncio', '2.000 ms'], ['ação', 'Finalize enviado ao Deepgram']] })
      agente('Você ainda está na linha? Preciso dos três primeiros dígitos do CPF para continuar.')
      fim('Cliente desligou', 'hangup do canal no Asterisk')
      break
    }
    case 'erro_tool': {
      aberturaCobranca(false)
      mudar('consulta_de_debito', 'avanço automático')
      const tc = tool('consultaDebito', { contrato, cpf_prefixo: '341' }, null, false, { ms: 8000, timeout: true, erro: 'Tempo esgotado após 8.000 ms (timeout da tool)' })
      ev.push({ tipo: 'ponte', t: t + 0.3, texto: 'Só um instante, estou consultando aqui.' })
      t += 8.4
      agente('Estou com instabilidade para consultar seu débito agora. Vou pedir para a central retornar a ligação ainda hoje. Obrigada pela paciência.', { tools: [tc], contingencia: 'ferramenta não respondeu', llm: null as unknown as undefined })
      fim('Encerrada por erro', 'Falha na ferramenta · consultaDebito')
      break
    }
    case 'wa_boleto': {
      cliente('Oi, preciso da segunda via do meu boleto', { tom: 'neutral' })
      agente(`Olá, ${primeiro}! Sou a Kora, da ${cfg.marca}. Para localizar sua conta, me confirma o CPF do titular, por favor?`)
      cliente('é três quatro um ponto…', { midia: ['Áudio transcrito · 0:04'] })
      mudar(cfg.tipo === 'sac' ? 'identificacao' : 'validacao_de_identidade', 'decisão da IA')
      const tc = tool(cfg.tipo === 'sac' ? 'gerarSegundaVia' : 'enviarBoleto', { contrato, canal: 'whatsapp' }, { enviado: true, linha_digitavel: '23793.38128 60000.000003 00000.000400 1 98760000018990' })
      agente(`Prontinho! Segue a segunda via no valor de ${valor}:\n\n23793.38128 60000.000003 00000.000400 1 98760000018990\n\nVencimento em 10/10. Posso ajudar em algo mais?`, { tools: [tc], rag: ragDe('segunda via boleto validade', 'segundaVia') })
      cliente('Só isso, valeu!', { tom: 'positive' })
      mudar('encerramento', 'decisão da IA')
      agente('Por nada! Qualquer coisa é só chamar por aqui.')
      fim('Encerrada pelo fluxo')
      break
    }
    case 'wa_sem_resposta': {
      cliente('Oi', { tom: 'neutral' })
      agente(`Olá! Sou a Kora, da ${cfg.marca}. Como posso ajudar?`)
      t += 1800
      fim('Encerrada por inatividade', 'sem resposta do cliente por 30 min')
      break
    }
    case 'sac_segunda_via':
    case 'sac_duvida':
    case 'sac_abandono': {
      agente(`Olá, ${primeiro}! Aqui é a Kora, da ${cfg.marca}. Para começar, me confirma a data de nascimento do titular?`, { llm: null as unknown as undefined })
      if (c.roteiro === 'sac_abandono') {
        t += 6
        fim('Cliente desligou', 'hangup do canal no Asterisk')
        break
      }
      cliente('Doze do três de oitenta e cinco.', { tom: 'neutral' })
      mudar('identificacao', 'decisão da IA')
      const tcId = tool('consultaCliente', { contrato }, { titular: nome, plano: 'Claro Pós 50GB', email: 'p•••@gmail.com' })
      if (c.roteiro === 'sac_duvida') {
        mudar('atendimento', 'resultado da ferramenta', [['tool', 'consultaCliente']])
        agente('Obrigada. Em que posso ajudar hoje?', { tools: [tcId] })
        cliente('Minha fatura veio quarenta reais mais cara e eu não entendi o porquê.', { tom: 'negative' })
        agente('Entendo. Como você trocou de plano no dia 18, esta fatura traz os dias proporcionais do plano antigo e do novo. A partir da próxima, o valor volta ao normal.', { rag: ragDe('fatura mais cara troca de plano', 'proporcional') })
        cliente('Ah, então tá explicado. Obrigado.', { tom: 'positive' })
      } else {
        mudar('atendimento', 'resultado da ferramenta', [['tool', 'consultaCliente']])
        agente('Obrigada. Em que posso ajudar hoje?', { tools: [tcId] })
        cliente('Quero a segunda via da fatura de outubro.', { tom: 'neutral' })
        const tc = tool('gerarSegundaVia', { contrato, competencia: '10/2026', canal: 'email' }, { enviado: true, email: 'p•••@gmail.com' })
        agente('Pronto, enviei a segunda via para o e-mail cadastrado, que começa com p. Chega em alguns minutos.', { tools: [tc], rag: ragDe('segunda via fatura', 'segundaVia') })
        cliente('Recebi, obrigado.', { tom: 'positive' })
      }
      mudar('encerramento', 'decisão da IA')
      agente('Eu que agradeço. Tenha um ótimo dia.')
      fim('Encerrada pelo fluxo', 'fase encerramento')
      break
    }
    case 'teste': {
      cliente('oi, tenho uma conta atrasada', { tom: 'neutral' })
      agente('Olá! Sou a Kora. Para localizar seu débito, me informa os três primeiros dígitos do CPF?')
      cliente('341')
      mudar('negociacao', 'decisão da IA')
      const tc = tool('consultaDebito', { contrato, cpf_prefixo: '341' }, { valor, vencimento: '10/10/2026' })
      agente(`Encontrei um débito de ${valor}. Quer pagar à vista com 10% de desconto ou parcelar?`, { tools: [tc], rag: ragDe('desconto à vista', 'desconto') })
      cliente('parcelar em 3')
      agente('Combinado: três parcelas iguais, a primeira no dia 10. Posso registrar?')
      fim('Encerrada pela tela', 'chat de teste fechado no Builder')
      break
    }
  }
  return ev
}

const CONTAGEM = {} as Record<Roteiro, { mensagens: number; turnos: number; tools: number; toolErros: number; diretrizes: number }>
for (const roteiro of Object.keys(TITULOS) as Roteiro[]) {
  const falsa = { roteiro, agenteId: roteiro.startsWith('sac') ? 'a91b7c40' : 'b71a3d93', contexto: [], contato: '' } as unknown as Conversa
  const ev = roteiroEventos({ c: falsa, nome: 'Ana Lima', valor: 'R$ 1,00', r: semente(1), voz: !roteiro.startsWith('wa') && roteiro !== 'teste' })
  const msgs = ev.filter(e => e.tipo === 'msg')
  const tools = msgs.flatMap(m => m.tools ?? [])
  CONTAGEM[roteiro] = {
    mensagens: msgs.length,
    turnos: msgs.filter(m => m.lado === 'agente').length,
    tools: tools.length,
    toolErros: tools.filter(x => x.ramo === 'onError').length,
    diretrizes: ev.filter(e => e.tipo === 'diretriz').length,
  }
}

const timelines = new Map<string, Evento[]>()
export function linhaDoTempo(c: Conversa): Evento[] {
  if (timelines.has(c.id)) return timelines.get(c.id)!
  const valor = c.contexto.find(([k]) => k === 'mailing.valor_divida')?.[1] ?? brl(100 + (hashId(c.id) % 400))
  const ev = roteiroEventos({ c, nome: c.contatoNome ?? 'Cliente', valor, r: semente(hashId(c.id)), voz: c.origem === 'voice' })
  // Estica (ou encolhe) o roteiro para caber na duração gravada da conversa.
  // Ao vivo, o roteiro termina um pouco depois de "agora": a tela revela os eventos conforme o tempo passa.
  const vivo = c.status === 'in_progress'
  const semFim = vivo ? ev.filter(e => e.tipo !== 'fim') : ev
  const bruto = Math.max(...semFim.map(e => e.t), 1)
  const alvo = vivo ? (agora() - c.inicio.getTime()) / 1000 + 75 : c.duracaoMs / 1000
  const k = alvo / bruto
  semFim.forEach(e => { e.t = Math.round(e.t * k * 10) / 10 })
  timelines.set(c.id, semFim)
  return semFim
}

export const segundosDesde = (c: Conversa) => (agora() - c.inicio.getTime()) / 1000
export function eventosVisiveis(c: Conversa) {
  const ev = linhaDoTempo(c)
  if (c.status !== 'in_progress') return ev
  const ate = segundosDesde(c)
  return ev.filter(e => e.t <= ate)
}

// ——— Log de execução do motor (conversation_logs) ———

export type Nivel = 'info' | 'warn' | 'error'
export type LinhaLog = { t: number; nivel: Nivel; tag: string; msg: string }

export function logsDe(c: Conversa, eventos: Evento[]): LinhaLog[] {
  const L: LinhaLog[] = []
  const add = (t: number, nivel: Nivel, tag: string, msg: string) => L.push({ t, nivel, tag, msg })
  const voz = c.origem === 'voice'
  add(0, 'info', 'Kora', `chamada iniciada · ${c.id} · flow=${c.flowKey}`)
  if (voz) {
    add(0, 'info', 'STT', 'Deepgram conectado (pré-aquecido) · nova-2 pt-BR · endpointing 2000ms')
    add(0, 'info', 'Memory', 'createCall ok · contexto do cliente carregado (6 campos)')
  }
  for (const e of eventos) {
    switch (e.tipo) {
      case 'fase': add(e.t, 'info', 'Fase', `${e.de ?? '—'} → ${e.para} (${e.motivo})`); break
      case 'ponte': add(e.t, 'info', 'Filler', `fala-ponte: "${e.texto}"`); break
      case 'diretriz': add(e.t, 'warn', 'Guardrail', `${e.titulo} — ${e.detalhe}`); break
      case 'fim': add(e.t, 'info', 'DONE', `${e.titulo}${e.detalhe ? ` · ${e.detalhe}` : ''}`); break
      case 'tecnico': add(e.t, e.nome === 'vad.interrupt' ? 'warn' : 'info', e.nome.startsWith('vad') ? 'VAD' : e.nome.startsWith('stt') ? 'STT' : 'LAT', `${e.nome} ${e.linhas.map(([k, v]) => `${k}=${v}`).join(' ')}`); break
      case 'msg':
        if (e.lado === 'cliente') {
          if (e.stt) add(e.t, 'info', 'STT', `speech_final=true · ${e.stt.falaMs}ms · "${e.texto}"`)
          if (e.dtmf) add(e.t, 'info', 'DTMF', `dígitos recebidos: ${e.texto}`)
          add(e.t, 'info', 'Memory', 'customerTurn → RAG context (await)')
        } else {
          if (e.rag) add(e.t - 0.6, 'info', 'RAG', `consulta="${e.rag.consulta}" · ${e.rag.fontes.length} fonte(s) · ${e.rag.ms}ms`)
          for (const tc of e.tools ?? []) {
            if (tc.ramo === 'onError') add(e.t - 0.5, 'error', 'Tools', `${tc.nome} ${tc.metodo} ${tc.url}\n${tc.erro}\nramo aplicado: onError`)
            else add(e.t - 0.5, 'info', 'Tools', `${tc.nome} → HTTP ${tc.http} em ${tc.ms}ms`)
          }
          if (e.llm) add(e.t, 'info', 'LLM', `${e.llm.modelo} · ${e.llm.ms}ms (ttft ${e.llm.ttftMs}ms) · in=${e.llm.tokensIn} cached=${e.llm.tokensCached} out=${e.llm.tokensOut}\n{"agente":"${e.fase}","humor":"neutro","texto":"${e.texto.slice(0, 80)}${e.texto.length > 80 ? '…' : ''}"}`)
          if (e.contingencia) add(e.t, 'warn', 'LLM', `fala de contingência usada · motivo: ${e.contingencia}`)
          if (e.llm && e.llm.ms > 1700) add(e.t, 'warn', 'LAT', `turno lento: ${e.llm.ms}ms até a resposta (meta < 3000ms do fim da fala)`)
          if (e.voz) add(e.t + 0.1, 'info', 'TTS', `ElevenLabs stream · ${e.texto.length} chars · first byte ${e.voz.ttsMs}ms`)
          if (e.voz?.cortadaMs) add(e.t + e.voz.cortadaMs / 1000, 'warn', 'VAD', `barge-in após ${e.voz.cortadaMs}ms · buffer descartado`)
          add(e.t, 'info', 'Memory', 'agentTurn (fire-and-forget)')
        }
    }
  }
  if (c.status !== 'in_progress') add((c.duracaoMs / 1000), 'info', 'Memory', 'finishCall · resumo gerado · conversation_memory apagada')
  return L.sort((a, b) => a.t - b.t)
}

// ——— Exportar transcrição (GET /conversations/:id/transcript?format=txt|json) ———

export function transcricaoTexto(c: Conversa, eventos: Evento[]) {
  const linhas = eventos.filter(e => e.tipo === 'msg').map(e => {
    const m = e as Extract<Evento, { tipo: 'msg' }>
    const hora = new Date(c.inicio.getTime() + m.t * 1000)
    return `[${hora.toLocaleTimeString('pt-BR')}] ${m.lado === 'agente' ? 'Agente' : (c.contatoNome ?? 'Cliente')}: ${m.texto}`
  })
  return `${c.titulo} · nº ${c.seq} · ${c.id}\n${c.inicio.toLocaleString('pt-BR')}\n\n${linhas.join('\n')}\n`
}
export function transcricaoJson(c: Conversa, eventos: Evento[]) {
  return JSON.stringify({
    id: c.id, seq_id: c.seq, title: c.titulo, started_at: c.inicio.toISOString(),
    messages: eventos.filter(e => e.tipo === 'msg').map(e => {
      const m = e as Extract<Evento, { tipo: 'msg' }>
      return { role: m.lado === 'agente' ? 'agent' : 'user', content: m.texto, phase: m.fase ?? null, at: new Date(c.inicio.getTime() + m.t * 1000).toISOString() }
    }),
  }, null, 2)
}

export function baixar(nome: string, conteudo: string, tipo = 'text/plain') {
  const url = URL.createObjectURL(new Blob([conteudo], { type: `${tipo};charset=utf-8` }))
  const a = Object.assign(document.createElement('a'), { href: url, download: nome })
  a.click()
  URL.revokeObjectURL(url)
}

export const nomeAgente = (id: string) => agentes.find(a => a.id === id)?.nome ?? 'Agente'
