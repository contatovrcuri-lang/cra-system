export const STATUS_LABEL: Record<string, string> = {
  NOVO: "Novo",
  EM_ANALISE: "Em análise",
  EM_ATENDIMENTO: "Em atendimento",
  AGUARDANDO_CLIENTE: "Aguardando cliente",
  AGUARDANDO_TERCEIROS: "Aguardando terceiros",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export const KANBAN_STATUS_ORDER = [
  "NOVO",
  "EM_ANALISE",
  "EM_ATENDIMENTO",
  "AGUARDANDO_CLIENTE",
  "CONCLUIDO",
] as const;

export const STATUS_COLOR: Record<string, string> = {
  NOVO: "bg-navy-100 text-navy-800 dark:bg-navy-900/50 dark:text-navy-200 border-navy-200 dark:border-navy-700",
  EM_ANALISE:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200 border-orange-200 dark:border-orange-800",
  EM_ATENDIMENTO:
    "bg-navy-600/10 text-navy-700 dark:bg-navy-500/20 dark:text-navy-100 border-navy-300 dark:border-navy-600",
  AGUARDANDO_CLIENTE:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  AGUARDANDO_TERCEIROS:
    "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-900",
  CONCLUIDO:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800",
  CANCELADO:
    "bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-700/40 dark:text-charcoal-300 border-charcoal-300 dark:border-charcoal-600",
};

export const PRIORITY_LABEL: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export const PRIORITY_COLOR: Record<string, string> = {
  BAIXA: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  MEDIA:
    "text-navy-600 dark:text-navy-300 bg-navy-50 dark:bg-navy-900/30 border-navy-200 dark:border-navy-700",
  ALTA: "text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
  CRITICA: "text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
};

export const RESOLUTION_CHANNEL_LABEL: Record<string, string> = {
  CONTATO_ATIVO: "Contato ativo",
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
};

export const PRIORITY_DOT: Record<string, string> = {
  BAIXA: "bg-green-500",
  MEDIA: "bg-navy-500",
  ALTA: "bg-orange-500",
  CRITICA: "bg-red-500",
};
