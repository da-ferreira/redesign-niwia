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

export type Conversa = {
  seq: number
  aoVivo?: boolean
  titulo: string
  origem: 'voz' | 'whatsapp' | 'teste'
  contato: string
  hora: string
  duracaoSeg: number
  msgs: number
  finalizacao?: string
  avaliacao?: 'sucesso' | 'falha'
}

export const conversasPorDia: { dia: string; itens: Conversa[] }[] = [
  {
    dia: 'Hoje',
    itens: [
      { seq: 1842, aoVivo: true, titulo: 'Negociação de débito em andamento', origem: 'voz', contato: '+55 11 98765-4321', hora: '14:52', duracaoSeg: 96, msgs: 9 },
      { seq: 1841, titulo: 'Acordo fechado em 3 parcelas', origem: 'voz', contato: '+55 21 99123-0045', hora: '14:31', duracaoSeg: 248, msgs: 22, finalizacao: 'ACORDO', avaliacao: 'sucesso' },
      { seq: 1840, titulo: 'Cliente desconhece a dívida', origem: 'voz', contato: '+55 31 98444-7782', hora: '14:12', duracaoSeg: 132, msgs: 14, finalizacao: 'CONTESTACAO', avaliacao: 'sucesso' },
      { seq: 1839, titulo: 'Boleto enviado pelo WhatsApp', origem: 'whatsapp', contato: '+55 11 97001-2210', hora: '13:47', duracaoSeg: 610, msgs: 31, finalizacao: 'BOLETO_ENVIADO', avaliacao: 'sucesso' },
      { seq: 1838, titulo: 'Ligação caiu na validação', origem: 'voz', contato: '+55 85 98112-9034', hora: '13:20', duracaoSeg: 41, msgs: 4, finalizacao: 'DESCONHECIDO', avaliacao: 'falha' },
      { seq: 1837, titulo: 'Teste do prompt novo', origem: 'teste', contato: 'David Ferreira', hora: '12:05', duracaoSeg: 75, msgs: 8 },
    ],
  },
  {
    dia: 'Ontem',
    itens: [
      { seq: 1836, titulo: 'Pediu para falar com atendente', origem: 'voz', contato: '+55 41 99654-1120', hora: '18:44', duracaoSeg: 58, msgs: 6, finalizacao: 'TRANSFERIDO', avaliacao: 'sucesso' },
      { seq: 1835, titulo: 'Promessa de pagamento para sexta', origem: 'voz', contato: '+55 11 96320-4471', hora: '17:02', duracaoSeg: 189, msgs: 17, finalizacao: 'PROMESSA', avaliacao: 'sucesso' },
      { seq: 1834, titulo: 'Número errado', origem: 'voz', contato: '+55 62 98001-3398', hora: '16:15', duracaoSeg: 22, msgs: 3, finalizacao: 'NUMERO_ERRADO' },
      { seq: 1833, titulo: 'Segunda via da fatura', origem: 'whatsapp', contato: '+55 11 95550-8812', hora: '15:39', duracaoSeg: 302, msgs: 19, finalizacao: 'BOLETO_ENVIADO', avaliacao: 'sucesso' },
    ],
  },
]

export type Turno =
  | { lado: 'agente'; texto: string; fase: string; hora: string; llmMs?: number; ragMs?: number }
  | { lado: 'cliente'; texto: string; hora: string }
  | { lado: 'tool'; nome: string; status: number; ms: number; hora: string }

export const transcricao: Turno[] = [
  { lado: 'agente', texto: 'Olá, falo com Marcos Oliveira?', fase: 'abertura', hora: '14:31:02' },
  { lado: 'cliente', texto: 'Sim, é ele.', hora: '14:31:06' },
  { lado: 'agente', texto: 'Marcos, aqui é a Kora, da Claro NET. Para sua segurança, pode me confirmar os três primeiros dígitos do seu CPF?', fase: 'validacao_de_identidade', hora: '14:31:08', llmMs: 1180, ragMs: 159 },
  { lado: 'cliente', texto: 'Três, quatro, um.', hora: '14:31:17' },
  { lado: 'tool', nome: 'consultaDebito', status: 200, ms: 412, hora: '14:31:18' },
  { lado: 'agente', texto: 'Obrigada. Consta um valor em aberto de cento e oitenta e nove reais. Consegue pagar hoje ou prefere parcelar?', fase: 'negociacao', hora: '14:31:20', llmMs: 1640, ragMs: 121 },
  { lado: 'cliente', texto: 'Hoje não dá. Consigo dividir em três vezes?', hora: '14:31:31' },
  { lado: 'agente', texto: 'Consegue sim. Ficam três parcelas de sessenta e três reais, a primeira para o dia dez. Posso confirmar?', fase: 'negociacao', hora: '14:31:34', llmMs: 1320, ragMs: 140 },
  { lado: 'cliente', texto: 'Pode confirmar.', hora: '14:31:41' },
  { lado: 'tool', nome: 'registrarAcordo', status: 201, ms: 288, hora: '14:31:42' },
  { lado: 'agente', texto: 'Pronto, acordo registrado. Você vai receber o boleto por SMS ainda hoje. Obrigada, Marcos, tenha um ótimo dia.', fase: 'encerramento', hora: '14:31:44', llmMs: 1050 },
]

export const resumoConversa =
  'O cliente confirmou a identidade pelos três primeiros dígitos do CPF. Informado do débito de R$ 189,00, pediu parcelamento e aceitou três parcelas de R$ 63,00 com primeiro vencimento no dia 10. O acordo foi registrado e o boleto será enviado por SMS.'

// Tela Início — números do dia e da semana, no formato do painel da Stripe.
export const hojeSerie = [0, 0, 0, 0, 0, 0, 0, 2, 9, 18, 26, 31, 24, 29, 33, 21, 0, 0, 0, 0, 0, 0, 0, 0]
export const ontemSerie = [0, 0, 0, 0, 0, 0, 0, 3, 11, 15, 22, 27, 19, 25, 30, 28, 24, 17, 9, 0, 0, 0, 0, 0]

export const panorama = [
  { titulo: 'Ligações atendidas', valor: '1.284', anterior: '1.102 no período anterior', delta: 16.5, serie: [140, 162, 158, 190, 176, 210, 248] },
  { titulo: 'Taxa de acordo', valor: '38,4%', anterior: '35,1% no período anterior', delta: 3.3, serie: [33, 35, 36, 34, 39, 37, 41] },
  { titulo: 'Duração média', valor: '2m 18s', anterior: '2m 31s no período anterior', delta: -8.6, serie: [158, 151, 149, 144, 139, 140, 132], invertido: true },
  { titulo: 'Transferidas para humano', valor: '96', anterior: '121 no período anterior', delta: -20.7, serie: [21, 18, 16, 14, 11, 9, 7], invertido: true },
]

export const finalizacoesSemana = [
  { codigo: 'ACORDO', label: 'Acordo', qtd: 493, cor: 'var(--ok)' },
  { codigo: 'PROMESSA', label: 'Promessa de pagamento', qtd: 268, cor: 'var(--brand)' },
  { codigo: 'BOLETO_ENVIADO', label: 'Boleto enviado', qtd: 214, cor: '#7c9fd6' },
  { codigo: 'TRANSFERIDO', label: 'Transferido', qtd: 96, cor: 'var(--caution)' },
  { codigo: 'OUTROS', label: 'Outros', qtd: 213, cor: 'var(--field)' },
]

export const falhasRecentes = [
  { seq: 1838, titulo: 'Ligação caiu na validação', agente: 'Claro NET V3', hora: '13:20' },
  { seq: 1829, titulo: 'Timeout na consultaDebito', agente: 'Claro D8 Cobrança', hora: '11:02' },
  { seq: 1811, titulo: 'Cliente não reconheceu a voz', agente: 'Receptivo SAC', hora: '09:47' },
]

export const agentesAtivos = [
  { nome: 'Claro NET V3', ligacoes: 742, acordo: 41.2, aoVivo: 3 },
  { nome: 'Claro D8 Cobrança', ligacoes: 388, acordo: 36.0, aoVivo: 1 },
  { nome: 'Receptivo SAC', ligacoes: 154, acordo: 0, aoVivo: 0 },
]
