import type {
  CaptureForm,
  DashboardData,
  Lead,
  LeadDetailsPayload,
  LeadEvent,
  LeadStage,
  LeadsPayload,
  LossReason,
  MetricsPayload,
  PipelineColumn,
  PipelinePayload,
  SettingsPayload,
  Tag,
  Task,
  TasksPayload
} from "@/types";

const now = Date.now();
const day = 1000 * 60 * 60 * 24;

export const mockStages: LeadStage[] = [
  { id: "stage-novo", key: "novo", name: "Novo", order: 0, isSystem: true },
  { id: "stage-contato", key: "contato", name: "Contato", order: 1, isSystem: true },
  { id: "stage-negociacao", key: "negociacao", name: "Negociacao", order: 2, isSystem: true },
  { id: "stage-ganho", key: "ganho", name: "Ganho", order: 3, isSystem: true },
  { id: "stage-perdido", key: "perdido", name: "Perdido", order: 4, isSystem: true }
];

export const mockTags: Tag[] = [
  { id: "tag-hot", label: "Quente", tone: "hot" },
  { id: "tag-paid", label: "Trafego Pago", tone: "default" },
  { id: "tag-urgente", label: "Urgente", tone: "warning" },
  { id: "tag-whatsapp", label: "WhatsApp", tone: "success" },
  { id: "tag-entra", label: "Alto Ticket", tone: "danger" }
];

const mkDate = (offsetDays: number, hour = 10) => new Date(now + offsetDays * day + hour * 60 * 60 * 1000).toISOString();

const tagById = (id: string) => mockTags.find((item) => item.id === id)!;

export const mockLeads: Lead[] = [
  {
    id: "lead-001",
    name: "Mariana Costa",
    company: "MC Studio Beauty",
    phone: "(11) 98877-1122",
    email: "mariana@mcstudio.com",
    need: "CRM para equipe comercial de 3 pessoas",
    budget: 3500,
    deadline: "15 dias",
    source: "instagram",
    priority: "high",
    score: 92,
    tags: [tagById("tag-hot"), tagById("tag-whatsapp")],
    stageId: "stage-negociacao",
    status: "open",
    lastInteractionAt: mkDate(-1, 15),
    nextTaskAt: mkDate(0, 17),
    hasPendingTask: true,
    assignedTo: "Ana Souza",
    utm: { source: "instagram", medium: "stories", campaign: "abril_reels" },
    createdAt: mkDate(-6, 11),
    updatedAt: mkDate(-1, 15)
  },
  {
    id: "lead-002",
    name: "Rafael Gomes",
    company: "RG Imoveis",
    phone: "(21) 97766-3322",
    email: "rafael@rgimoveis.com",
    need: "Pipeline para leads de anuncio",
    budget: 7800,
    deadline: "30 dias",
    source: "meta-ads",
    priority: "high",
    score: 88,
    tags: [tagById("tag-paid"), tagById("tag-entra")],
    stageId: "stage-contato",
    status: "open",
    lastInteractionAt: mkDate(-3, 10),
    nextTaskAt: mkDate(-1, 16),
    hasPendingTask: true,
    assignedTo: "Caio Lima",
    utm: { source: "facebook", medium: "cpc", campaign: "campanha_imob_abril" },
    createdAt: mkDate(-10, 13),
    updatedAt: mkDate(-3, 10)
  },
  {
    id: "lead-003",
    name: "Bianca Alves",
    company: "Agencia Pixel Norte",
    phone: "(31) 96655-9988",
    email: "bianca@pixelnorte.com",
    need: "Organizacao de follow-up no WhatsApp",
    budget: 1900,
    source: "site",
    priority: "medium",
    score: 71,
    tags: [tagById("tag-whatsapp")],
    stageId: "stage-novo",
    status: "open",
    lastInteractionAt: mkDate(-4, 9),
    hasPendingTask: false,
    assignedTo: "Ana Souza",
    utm: { source: "google", medium: "organic", campaign: "home" },
    createdAt: mkDate(-4, 8),
    updatedAt: mkDate(-4, 8)
  },
  {
    id: "lead-004",
    name: "Lucas Freitas",
    company: "LF Odonto",
    phone: "(41) 95544-2211",
    email: "lucas@lfodonto.com",
    need: "Captura por QR code em eventos",
    budget: 2600,
    source: "qr-code",
    priority: "medium",
    score: 65,
    tags: [tagById("tag-urgente")],
    stageId: "stage-negociacao",
    status: "open",
    lastInteractionAt: mkDate(-8, 14),
    nextTaskAt: mkDate(-2, 18),
    hasPendingTask: true,
    assignedTo: "Joao Pedro",
    utm: { source: "evento", medium: "qrcode", campaign: "feira_saude" },
    createdAt: mkDate(-12, 9),
    updatedAt: mkDate(-8, 14)
  },
  {
    id: "lead-005",
    name: "Camila Prado",
    company: "Consultoria Prisma",
    phone: "(11) 94433-8877",
    email: "camila@prisma.com",
    need: "Controle de propostas e perda",
    budget: 12500,
    source: "indicacao",
    priority: "high",
    score: 95,
    tags: [tagById("tag-hot"), tagById("tag-entra")],
    stageId: "stage-ganho",
    status: "won",
    closedReason: "Fechou contrato anual",
    lastInteractionAt: mkDate(-1, 12),
    hasPendingTask: false,
    assignedTo: "Caio Lima",
    createdAt: mkDate(-18, 10),
    updatedAt: mkDate(-1, 12)
  },
  {
    id: "lead-006",
    name: "Thiago Nunes",
    company: "TN Tecnologia",
    phone: "(71) 93322-7788",
    email: "thiago@tntec.com",
    need: "Relatorios de funil por origem",
    budget: 4200,
    source: "google-ads",
    priority: "medium",
    score: 59,
    tags: [tagById("tag-paid")],
    stageId: "stage-perdido",
    status: "lost",
    closedReason: "Sem budget neste trimestre",
    lastInteractionAt: mkDate(-11, 11),
    hasPendingTask: false,
    assignedTo: "Joao Pedro",
    createdAt: mkDate(-17, 10),
    updatedAt: mkDate(-11, 11)
  },
  {
    id: "lead-007",
    name: "Bruno Esteves",
    company: "B. Esteves Arquitetura",
    phone: "(51) 92211-3344",
    email: "bruno@bestarq.com",
    need: "CRM simples para leads do Instagram",
    budget: 1500,
    source: "instagram",
    priority: "low",
    score: 44,
    tags: [],
    stageId: "stage-novo",
    status: "open",
    hasPendingTask: false,
    lastInteractionAt: mkDate(-6, 10),
    createdAt: mkDate(-6, 10),
    updatedAt: mkDate(-6, 10)
  },
  {
    id: "lead-008",
    name: "Patricia Tavares",
    company: "Clinica Harmonia",
    phone: "(62) 91122-6644",
    email: "patricia@harmonia.com",
    need: "Lembretes de follow-up",
    budget: 3000,
    source: "site",
    priority: "high",
    score: 82,
    tags: [tagById("tag-hot")],
    stageId: "stage-contato",
    status: "open",
    lastInteractionAt: mkDate(-2, 9),
    nextTaskAt: mkDate(1, 10),
    hasPendingTask: true,
    assignedTo: "Ana Souza",
    createdAt: mkDate(-5, 14),
    updatedAt: mkDate(-2, 9)
  },
  {
    id: "lead-009",
    name: "Eduardo Mello",
    company: "Mello Auto Center",
    phone: "(48) 98812-4411",
    email: "eduardo@melloauto.com",
    need: "Gestao de leads por equipe",
    source: "whatsapp",
    priority: "medium",
    score: 67,
    tags: [tagById("tag-whatsapp")],
    stageId: "stage-negociacao",
    status: "open",
    lastInteractionAt: mkDate(-1, 18),
    nextTaskAt: mkDate(2, 10),
    hasPendingTask: true,
    createdAt: mkDate(-9, 9),
    updatedAt: mkDate(-1, 18)
  },
  {
    id: "lead-010",
    name: "Sabrina Vieira",
    company: "Vieira Eventos",
    phone: "(85) 97711-1177",
    email: "sabrina@vieiraeventos.com",
    need: "Controle de funil por periodo",
    budget: 2800,
    source: "youtube",
    priority: "low",
    score: 51,
    tags: [],
    stageId: "stage-perdido",
    status: "lost",
    closedReason: "Optou por planilha interna",
    lastInteractionAt: mkDate(-14, 16),
    hasPendingTask: false,
    createdAt: mkDate(-20, 10),
    updatedAt: mkDate(-14, 16)
  }
];

export const mockTasks: Task[] = [
  {
    id: "task-001",
    leadId: "lead-001",
    title: "Enviar proposta final no WhatsApp",
    dueAt: mkDate(0, 17),
    status: "pending",
    assignee: "Ana Souza",
    createdAt: mkDate(-2, 11),
    updatedAt: mkDate(-2, 11)
  },
  {
    id: "task-002",
    leadId: "lead-002",
    title: "Primeiro contato comercial",
    dueAt: mkDate(-1, 16),
    status: "pending",
    assignee: "Caio Lima",
    createdAt: mkDate(-3, 10),
    updatedAt: mkDate(-3, 10)
  },
  {
    id: "task-003",
    leadId: "lead-004",
    title: "Remarcar reuniao com decisor",
    dueAt: mkDate(-2, 18),
    status: "pending",
    assignee: "Joao Pedro",
    createdAt: mkDate(-8, 14),
    updatedAt: mkDate(-8, 14)
  },
  {
    id: "task-004",
    leadId: "lead-008",
    title: "Confirmar dados para onboarding",
    dueAt: mkDate(1, 10),
    status: "pending",
    assignee: "Ana Souza",
    createdAt: mkDate(-1, 9),
    updatedAt: mkDate(-1, 9)
  },
  {
    id: "task-005",
    leadId: "lead-009",
    title: "Apresentar plano anual",
    dueAt: mkDate(2, 10),
    status: "pending",
    assignee: "Caio Lima",
    createdAt: mkDate(-1, 18),
    updatedAt: mkDate(-1, 18)
  },
  {
    id: "task-006",
    leadId: "lead-005",
    title: "Checklist de passagem para CS",
    dueAt: mkDate(-1, 12),
    status: "completed",
    assignee: "Caio Lima",
    createdAt: mkDate(-3, 12),
    updatedAt: mkDate(-1, 12)
  }
];

export const mockLeadEvents: LeadEvent[] = [
  {
    id: "event-001",
    leadId: "lead-001",
    type: "created",
    createdAt: mkDate(-6, 11),
    createdBy: "system",
    payload: { source: "instagram" }
  },
  {
    id: "event-002",
    leadId: "lead-001",
    type: "stage_changed",
    createdAt: mkDate(-2, 12),
    createdBy: "Ana Souza",
    payload: { from: "Contato", to: "Negociacao" }
  },
  {
    id: "event-003",
    leadId: "lead-001",
    type: "task_created",
    createdAt: mkDate(-2, 11),
    createdBy: "Ana Souza",
    payload: { title: "Enviar proposta final no WhatsApp" }
  },
  {
    id: "event-004",
    leadId: "lead-001",
    type: "note_added",
    createdAt: mkDate(-1, 15),
    createdBy: "Ana Souza",
    payload: { note: "Cliente pediu opcao de pagamento trimestral." }
  }
];

export const mockLossReasons: LossReason[] = [
  { id: "loss-budget", reason: "Sem budget", total: 12, percentage: 32 },
  { id: "loss-priority", reason: "Sem prioridade interna", total: 9, percentage: 24 },
  { id: "loss-time", reason: "Sem resposta no prazo", total: 7, percentage: 19 },
  { id: "loss-price", reason: "Preco", total: 6, percentage: 16 },
  { id: "loss-competitor", reason: "Escolheu concorrente", total: 4, percentage: 9 }
];

export const mockCaptureForms: CaptureForm[] = [
  {
    id: "form-main",
    title: "Formulario principal de captacao",
    description: "Lead captado pelo site principal.",
    publicUrl: "/f/workspace-demo/form-main",
    receivesUtm: true,
    antiDuplicate: true,
    consentText: "Autorizo contato comercial da equipe Aithos Sales.",
    successMessage: "Recebemos seu contato e vamos responder em breve.",
    fields: [
      { id: "f-name", key: "name", label: "Nome", enabled: true, required: true, placeholder: "Seu nome" },
      {
        id: "f-whatsapp",
        key: "whatsapp",
        label: "WhatsApp",
        enabled: true,
        required: true,
        placeholder: "(99) 99999-9999"
      },
      { id: "f-company", key: "company", label: "Empresa", enabled: true, required: false, placeholder: "Sua empresa" },
      { id: "f-need", key: "need", label: "Necessidade", enabled: true, required: true, placeholder: "No que voce precisa de ajuda?" },
      { id: "f-email", key: "email", label: "E-mail", enabled: true, required: false, placeholder: "voce@empresa.com" },
      { id: "f-budget", key: "budget", label: "Faixa de orcamento", enabled: true, required: false, placeholder: "Ex: 2000 a 5000" },
      { id: "f-deadline", key: "deadline", label: "Prazo", enabled: true, required: false, placeholder: "Ex: 30 dias" },
      { id: "f-notes", key: "notes", label: "Observacoes", enabled: true, required: false, placeholder: "Mais detalhes..." }
    ],
    createdAt: mkDate(-30, 10),
    updatedAt: mkDate(-3, 14)
  },
  {
    id: "form-qr-evento",
    title: "Formulario QR Evento",
    description: "Usado em eventos presenciais.",
    publicUrl: "/f/workspace-demo/form-qr-evento",
    receivesUtm: true,
    antiDuplicate: true,
    consentText: "Concordo com o uso dos dados para contato comercial.",
    successMessage: "Cadastro enviado! Nosso time entra em contato por WhatsApp.",
    fields: [
      { id: "q-name", key: "name", label: "Nome", enabled: true, required: true },
      { id: "q-whatsapp", key: "whatsapp", label: "WhatsApp", enabled: true, required: true },
      { id: "q-company", key: "company", label: "Empresa", enabled: true, required: false },
      { id: "q-need", key: "need", label: "Tipo de servico", enabled: true, required: true },
      { id: "q-email", key: "email", label: "Email", enabled: false, required: false },
      { id: "q-budget", key: "budget", label: "Orcamento", enabled: false, required: false },
      { id: "q-deadline", key: "deadline", label: "Prazo", enabled: true, required: false },
      { id: "q-notes", key: "notes", label: "Observacoes", enabled: true, required: false }
    ],
    createdAt: mkDate(-20, 10),
    updatedAt: mkDate(-2, 9)
  }
];

const toStageSummary = () =>
  mockStages.map((stage) => ({
    stageId: stage.id,
    stageName: stage.name,
    total: mockLeads.filter((lead) => lead.stageId === stage.id).length
  }));

const getTaskState = (task: Task) => {
  if (task.status === "completed") {
    return "completed";
  }

  return new Date(task.dueAt).getTime() < now ? "overdue" : "open";
};

export const getMockDashboard = (): DashboardData => ({
  metrics: [
    { id: "leads-today", label: "Leads capturados hoje", value: "14", helper: "2 acima de ontem", trend: { direction: "up", label: "+16%" } },
    { id: "first-contact", label: "Tempo medio ate 1o contato", value: "2h 18m", helper: "Meta: ate 3 horas", trend: { direction: "up", label: "-22%" } },
    { id: "conversion-rate", label: "Taxa de conversao", value: "31.4%", helper: "Do Novo para Ganho", trend: { direction: "up", label: "+4.1 pp" } },
    { id: "stalled", label: "Leads parados", value: "9", helper: "Sem follow-up ha 3+ dias", trend: { direction: "down", label: "-3" } }
  ],
  lossReasons: mockLossReasons,
  overdueTasks: mockTasks.filter((task) => getTaskState(task) === "overdue"),
  leadsWithoutFollowUp: mockLeads.filter((lead) => {
    const reference = lead.lastInteractionAt ?? lead.createdAt;
    return now - new Date(reference).getTime() > day * 3 && lead.status === "open";
  }),
  funnelSummary: toStageSummary(),
  conversionByStage: [
    { stageName: "Novo > Contato", conversion: 72 },
    { stageName: "Contato > Negociacao", conversion: 56 },
    { stageName: "Negociacao > Ganho", conversion: 44 }
  ]
});

export const getMockLeadsPayload = (): LeadsPayload => ({
  source: "mock",
  leads: mockLeads,
  stages: mockStages,
  sources: Array.from(new Set(mockLeads.map((lead) => lead.source).filter(Boolean))) as string[],
  tags: mockTags
});

export const getMockPipelinePayload = (): PipelinePayload => {
  const columns: PipelineColumn[] = mockStages
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((stage) => {
      const leads = mockLeads.filter((lead) => lead.stageId === stage.id);
      return {
        id: `col-${stage.id}`,
        stageId: stage.id,
        name: stage.name,
        order: stage.order,
        count: leads.length,
        leads,
        isSystem: stage.isSystem
      };
    });

  return {
    source: "mock",
    stages: mockStages,
    columns
  };
};

export const getMockLeadDetailsPayload = (leadId: string): LeadDetailsPayload | null => {
  const lead = mockLeads.find((item) => item.id === leadId);
  if (!lead) {
    return null;
  }

  return {
    source: "mock",
    lead,
    tasks: mockTasks.filter((task) => task.leadId === lead.id),
    events: mockLeadEvents.filter((event) => event.leadId === lead.id),
    stages: mockStages
  };
};

export const getMockTasksPayload = (): TasksPayload => ({
  source: "mock",
  tasks: mockTasks,
  leads: mockLeads
});

export const getMockMetricsPayload = (): MetricsPayload => ({
  source: "mock",
  lossReasons: mockLossReasons,
  conversionByStage: [
    { stageName: "Novo", conversion: 100 },
    { stageName: "Contato", conversion: 72 },
    { stageName: "Negociacao", conversion: 54 },
    { stageName: "Ganho", conversion: 31 }
  ],
  leadsBySource: [
    { source: "instagram", total: 34 },
    { source: "site", total: 21 },
    { source: "meta-ads", total: 18 },
    { source: "indicacao", total: 13 },
    { source: "qr-code", total: 9 }
  ],
  gainsVsLosses: [
    { period: "Sem 1", ganhos: 7, perdidos: 5 },
    { period: "Sem 2", ganhos: 8, perdidos: 6 },
    { period: "Sem 3", ganhos: 10, perdidos: 4 },
    { period: "Sem 4", ganhos: 9, perdidos: 5 }
  ],
  avgFirstContactHours: 2.3
});

export const getMockSettingsPayload = (): SettingsPayload => ({
  source: "mock",
  stages: mockStages,
  tags: mockTags,
  lossReasons: mockLossReasons,
  followUpDays: 3,
  branding: {
    appName: "Aithos Sales",
    accentColor: "#2563eb"
  }
});

export const getMockFormsPayload = () => ({
  source: "mock" as const,
  forms: mockCaptureForms
});
