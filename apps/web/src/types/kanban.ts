export type LeadStage = "novo" | "contato" | "negociacao" | "ganho" | "perdido";
export type LeadPriority = "baixa" | "media" | "alta" | "urgente";

export type LeadOrigin =
  | "instagram"
  | "site"
  | "trafego-pago"
  | "qr-code"
  | "indicacao"
  | "whatsapp"
  | "organico"
  | "linkedin"
  | "email";

export type LeadSeller = {
  name: string;
  initials: string;
};

export type SaleCard = {
  id: string;
  nome: string;
  empresa?: string;
  orcamento?: number;
  prioridade: LeadPriority;
  etapa: LeadStage;
  origem: LeadOrigin;
  tags: string[];
  ultimoContatoEm?: string;
  proximoFollowupEm?: string;
  diasParado: number;
  vendedor: LeadSeller;
};

export type ColumnConfig = {
  id: LeadStage;
  label: string;
  colorClass: string;
  toneClass: string;
};

// Aliases para manter compatibilidade com os nomes antigos usados localmente.
export type Priority = LeadPriority;
export type Status = LeadStage;
