/**
 * Gerador de dados 100% fictícios para o CRA System.
 *
 * Este arquivo NUNCA deve conter nomes de pessoas reais, colaboradores reais,
 * empresas reais, CPFs reais ou qualquer dado obtido da internet. Todos os
 * valores aqui são combinações sintéticas usadas apenas para preencher o
 * ambiente de demonstração/seed do sistema.
 */

const FIRST_NAMES = [
  "Lucas", "Gabriel", "Bruno", "Diego", "Matheus", "Rafael", "Felipe",
  "Thiago", "André", "Henrique", "Vinícius", "Eduardo", "Rodrigo", "Marcelo",
  "Leonardo", "Guilherme", "Caio", "Igor", "Otávio", "Renan", "Camila",
  "Fernanda", "Juliana", "Patrícia", "Amanda", "Larissa", "Beatriz",
  "Carolina", "Débora", "Priscila", "Aline", "Vanessa", "Tatiane",
];

const LAST_NAMES = [
  "Ferreira", "Martins", "Almeida", "Carvalho", "Rocha", "Lima", "Duarte",
  "Mendes", "Campos", "Lopes", "Barros", "Nogueira", "Teixeira", "Ribeiro",
  "Correia", "Pinheiro", "Cardoso", "Farias", "Moraes", "Siqueira",
];

const REQUESTER_FIRST = [
  "Marina", "Paulo", "Sofia", "João", "Isabela", "Pedro", "Helena", "Lucas",
  "Valentina", "Miguel", "Alice", "Arthur", "Laura", "Davi", "Manuela",
  "Bernardo", "Cecília", "Heitor", "Luiza", "Enzo",
];

const REQUESTER_LAST = [
  "Souza", "Oliveira", "Pereira", "Costa", "Gomes", "Araújo", "Melo",
  "Barbosa", "Cavalcanti", "Dias", "Freitas", "Xavier", "Nunes", "Vieira",
];

export const PROTOCOL_TYPES = [
  "Estorno por duplicidade",
  "Contestação de PIX",
  "Contestação de TED",
  "Contestação de boleto",
  "Atualização cadastral",
  "Alteração de limite",
  "Contestação de compra",
  "Golpe/Fraude",
  "Bloqueio preventivo",
  "Desbloqueio de conta",
  "Recuperação de acesso",
  "Alteração de e-mail",
  "Alteração de telefone",
  "Reativação de cadastro",
  "Contestação de tarifa",
  "Cancelamento de cartão",
  "Segunda via de cartão",
  "Contestação de débito automático",
  "Contestação de saque",
  "Portabilidade",
  "Cadastro de chave PIX",
  "Exclusão de chave PIX",
  "Erro de transferência",
  "Solicitação de comprovante",
  "Revisão de atendimento",
];

export const STATUS_LIST = [
  "NOVO",
  "EM_ANALISE",
  "EM_ATENDIMENTO",
  "AGUARDANDO_CLIENTE",
  "AGUARDANDO_TERCEIROS",
  "CONCLUIDO",
  "CANCELADO",
] as const;

export const PRIORITY_LIST = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;

export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

/** Gera um nome fictício de colaborador, ex: "Lucas Ferreira" */
export function generateFakeEmployeeName(usedNames: Set<string>): string {
  let name = "";
  let attempts = 0;
  do {
    name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    attempts++;
  } while (usedNames.has(name) && attempts < 50);
  usedNames.add(name);
  return name;
}

/** Gera um nome fictício de solicitante externo (nunca é um usuário do sistema) */
export function generateFakeRequesterName(): string {
  return `${pick(REQUESTER_FIRST)} ${pick(REQUESTER_LAST)}`;
}

/** Gera um usuário fictício no padrão X00XXXX (ex: X001234) */
export function generateFakeUsername(seedIndex: number): string {
  const digits = String(1000 + seedIndex * 37 + randInt(0, 36)).padStart(6, "0");
  return `X${digits}`;
}

/** Gera número de protocolo no padrão 00 + 10 dígitos aleatórios */
export function generateProtocolNumber(): string {
  let digits = "";
  for (let i = 0; i < 10; i++) digits += randInt(0, 9);
  return `00${digits}`;
}

export const AVATAR_COLORS = [
  "#0B2545", // navy
  "#1F9D6B", // green
  "#F0872F", // orange
  "#2B5D93",
  "#178256",
  "#C1651B",
];
