import { z } from "zod";

export const PRIORITY_ENUM = z.enum(["BAIXA", "MEDIA", "ALTA", "CRITICA"]);
export const STATUS_ENUM = z.enum([
  "NOVO",
  "EM_ANALISE",
  "EM_ATENDIMENTO",
  "AGUARDANDO_CLIENTE",
  "AGUARDANDO_TERCEIROS",
  "CONCLUIDO",
  "CANCELADO",
]);

// Sanitiza texto livre removendo tags HTML básicas (proteção contra XSS
// em campos que são renderizados como texto simples na interface).
export function sanitizeText(value: string) {
  return value.replace(/<[^>]*>?/gm, "").trim();
}

export const RESOLUTION_CHANNEL_ENUM = z.enum(["CONTATO_ATIVO", "WHATSAPP", "EMAIL"]);

// Número de protocolo já existente em outro sistema — a monitoria só cadastra
// aqui, não gera um número novo. Aceita dígitos, letras e hífen/barra.
const protocolNumberSchema = z
  .string()
  .trim()
  .min(3, "Informe o número do protocolo.")
  .max(40, "Número de protocolo muito longo.")
  .regex(/^[A-Za-z0-9/\-.]+$/, "Número de protocolo inválido.");

export const createProtocolSchema = z.object({
  number: protocolNumberSchema,
  description: z.string().trim().min(5).max(2000).transform(sanitizeText),
  requester: z.string().trim().min(2).max(120).transform(sanitizeText),
  type: z.string().trim().min(2).max(120),
  priority: PRIORITY_ENUM.default("MEDIA"),
  status: STATUS_ENUM.default("NOVO"),
  responsibleId: z.string().cuid().nullable().optional(),
  dueDate: z.coerce.date(),
  notes: z.string().trim().max(4000).transform(sanitizeText).optional().nullable(),
});

export const updateProtocolSchema = z.object({
  description: z.string().trim().min(5).max(2000).transform(sanitizeText).optional(),
  requester: z.string().trim().min(2).max(120).transform(sanitizeText).optional(),
  type: z.string().trim().min(2).max(120).optional(),
  priority: PRIORITY_ENUM.optional(),
  status: STATUS_ENUM.optional(),
  responsibleId: z.string().cuid().nullable().optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().trim().max(4000).transform(sanitizeText).optional().nullable(),
  resolutionChannel: RESOLUTION_CHANNEL_ENUM.optional().nullable(),
  resolutionNote: z.string().trim().min(1).max(2000).transform(sanitizeText).optional().nullable(),
  // Motivo exigido quando um protocolo já concluído é reaberto (só admin).
  reopenReason: z.string().trim().min(3).max(500).transform(sanitizeText).optional(),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(3).max(120).transform(sanitizeText),
  role: z.enum(["ADMIN", "COLABORADOR"]).default("COLABORADOR"),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1).max(2000).transform(sanitizeText),
});
