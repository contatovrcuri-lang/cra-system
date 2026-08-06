/**
 * Seed do CRA System.
 * Gera usuários e protocolos 100% fictícios, com histórico de andamento
 * realista, para que dashboard, Kanban e desempenho já abram preenchidos.
 * NUNCA insira aqui dados reais de pessoas, empresas, CPFs ou e-mails.
 */
import { PrismaClient, Priority, ProtocolStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  generateFakeEmployeeName,
  generateFakeRequesterName,
  generateFakeUsername,
  generateProtocolNumber,
  PROTOCOL_TYPES,
  PRIORITY_LIST,
  AVATAR_COLORS,
  randInt,
  pick,
} from "../src/lib/fake-data";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

const NOTES_SAMPLES = [
  "Cliente reenviou comprovante de solicitação; aguardando validação da retaguarda.",
  "Encaminhado para análise da equipe de prevenção a fraudes.",
  "Aguardando retorno do terceiro envolvido na transação contestada.",
  "Documentação complementar anexada pelo solicitante.",
  "Contato telefônico realizado; cliente ciente do prazo estimado.",
  "Protocolo reaberto após retorno do cliente com nova informação.",
  "Validação cadastral concluída, aguardando aprovação final.",
  null,
  null,
];

const COMMENT_SAMPLES = [
  "Iniciando análise do caso hoje.",
  "Aguardando retorno do cliente para prosseguir.",
  "Caso encaminhado para o time de retaguarda.",
  "Documentação validada com sucesso.",
  "Reforcei o contato com o solicitante por telefone.",
  "Conferido com a equipe de fraudes, sem pendências adicionais.",
  "Aguardando posicionamento do terceiro envolvido.",
  "Tudo certo, seguindo para encerramento.",
];

function addLogEntry(
  logs: {
    protocolId: string;
    userId: string;
    field: string;
    oldValue: string | null;
    newValue: string | null;
    createdAt: Date;
  }[],
  protocolId: string,
  userId: string,
  field: string,
  oldValue: string | null,
  newValue: string | null,
  createdAt: Date
) {
  logs.push({ protocolId, userId, field, oldValue, newValue, createdAt });
}

async function main() {
  console.log("🌱 Iniciando seed do CRA System (dados fictícios)...");

  await prisma.notification.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.historyLog.deleteMany();
  await prisma.protocol.deleteMany();
  await prisma.user.deleteMany();

  // ---------------------------------------------------------------------
  // Administrador
  // ---------------------------------------------------------------------
  const adminHash = await bcrypt.hash("cramonitoria2026", 10);
  const admin = await prisma.user.create({
    data: {
      username: "cramonitoria",
      name: "Administrador da Monitoria",
      passwordHash: adminHash,
      role: "ADMIN",
      avatarColor: "#0B2545",
    },
  });

  // ---------------------------------------------------------------------
  // Colaboradores fictícios (usuário X00XXXX / senha inicial 123456)
  // ---------------------------------------------------------------------
  const usedNames = new Set<string>();
  const defaultHash = await bcrypt.hash("123456", 10);
  const collaborators = [];

  for (let i = 0; i < 16; i++) {
    const name = generateFakeEmployeeName(usedNames);
    const username = generateFakeUsername(i);
    const user = await prisma.user.create({
      data: {
        username,
        name,
        passwordHash: defaultHash,
        role: "COLABORADOR",
        avatarColor: pick(AVATAR_COLORS),
      },
    });
    collaborators.push(user);
  }

  console.log(`👤 ${collaborators.length + 1} usuários fictícios criados.`);

  // ---------------------------------------------------------------------
  // Protocolos fictícios — distribuídos nos últimos 5 meses, com volume
  // crescente mês a mês (para a "Evolução mensal" mostrar tendência de alta)
  // e histórico completo de andamento (para Kanban/desempenho/SLA).
  // ---------------------------------------------------------------------
  const now = new Date();
  const usedNumbers = new Set<string>();
  const allHistoryLogs: {
    protocolId: string;
    userId: string;
    field: string;
    oldValue: string | null;
    newValue: string | null;
    createdAt: Date;
  }[] = [];
  const allComments: { protocolId: string; userId: string; content: string; createdAt: Date }[] = [];
  const allNotifications: {
    userId: string;
    protocolId: string;
    type: "NOVO_PROTOCOLO" | "MUDANCA_RESPONSAVEL" | "MUDANCA_STATUS" | "PRAZO_PROXIMO" | "PROTOCOLO_ATRASADO";
    message: string;
    read: boolean;
    createdAt: Date;
  }[] = [];

  // Volume por mês, do atual (índice 0) ao mais antigo (índice 4) — cresce
  // com o tempo para simular adoção crescente do sistema.
  const MONTHLY_VOLUME = [46, 40, 32, 24, 16]; // mês atual, -1, -2, -3, -4
  const protocolsToCreate: { monthOffset: number; createdAt: Date }[] = [];

  MONTHLY_VOLUME.forEach((count, monthOffset) => {
    for (let i = 0; i < count; i++) {
      const daysBack = monthOffset * 30 + randInt(0, 29);
      const createdAt = new Date(now.getTime() - daysBack * DAY);
      protocolsToCreate.push({ monthOffset, createdAt });
    }
  });

  let protocolCount = 0;

  for (const { monthOffset, createdAt } of protocolsToCreate) {
    let number = generateProtocolNumber();
    while (usedNumbers.has(number)) number = generateProtocolNumber();
    usedNumbers.add(number);

    const type = pick(PROTOCOL_TYPES);
    const priority = pick(PRIORITY_LIST) as Priority;
    const responsible = pick(collaborators);
    const ageInDays = Math.floor((now.getTime() - createdAt.getTime()) / DAY);

    let status: ProtocolStatus;
    const roll = Math.random();
    if (monthOffset >= 2) {
      status =
        roll < 0.78 ? "CONCLUIDO" : roll < 0.85 ? "CANCELADO" : roll < 0.92 ? "EM_ATENDIMENTO" : "AGUARDANDO_TERCEIROS";
    } else if (monthOffset === 1) {
      status =
        roll < 0.55
          ? "CONCLUIDO"
          : roll < 0.63
          ? "CANCELADO"
          : roll < 0.8
          ? "EM_ATENDIMENTO"
          : roll < 0.9
          ? "AGUARDANDO_CLIENTE"
          : "AGUARDANDO_TERCEIROS";
    } else {
      status =
        roll < 0.15
          ? "NOVO"
          : roll < 0.35
          ? "EM_ANALISE"
          : roll < 0.62
          ? "EM_ATENDIMENTO"
          : roll < 0.75
          ? "AGUARDANDO_CLIENTE"
          : roll < 0.8
          ? "AGUARDANDO_TERCEIROS"
          : roll < 0.95
          ? "CONCLUIDO"
          : "CANCELADO";
    }

    const isDone = status === "CONCLUIDO" || status === "CANCELADO";
    let dueDate: Date;
    if (isDone) {
      dueDate = new Date(createdAt.getTime() + randInt(3, 12) * DAY);
    } else {
      const overdue = Math.random() < 0.22;
      dueDate = overdue
        ? new Date(now.getTime() - randInt(1, 6) * DAY)
        : new Date(now.getTime() + randInt(1, 14) * DAY);
    }

    const stages: ProtocolStatus[] = ["NOVO"];
    if (status !== "NOVO") stages.push("EM_ANALISE");
    if (!["NOVO", "EM_ANALISE"].includes(status)) stages.push("EM_ATENDIMENTO");
    if (status === "AGUARDANDO_CLIENTE") stages.push("AGUARDANDO_CLIENTE");
    if (status === "AGUARDANDO_TERCEIROS") stages.push("AGUARDANDO_TERCEIROS");
    if (isDone) stages.push(status);
    if (!stages.includes(status)) stages.push(status);

    const maxSpan = Math.max(1, Math.min(ageInDays, isDone ? randInt(2, 10) : ageInDays));
    const stageTimestamps: Date[] = stages.map((_, idx) => {
      const offset = stages.length > 1 ? Math.round((idx / (stages.length - 1)) * maxSpan) : 0;
      return new Date(createdAt.getTime() + offset * DAY);
    });

    let completedAt: Date | null = null;
    if (isDone) {
      completedAt = stageTimestamps[stageTimestamps.length - 1];
      if (monthOffset === 0 && Math.random() < 0.25) {
        const candidate = new Date(now.getTime() - randInt(0, 6) * DAY);
        completedAt = candidate < createdAt ? new Date(createdAt.getTime() + DAY) : candidate;
      }
    }

    const protocol = await prisma.protocol.create({
      data: {
        number,
        description: `Solicitação referente a ${type.toLowerCase()} registrada pelo canal de atendimento.`,
        requester: generateFakeRequesterName(),
        type,
        priority,
        status,
        notes: pick(NOTES_SAMPLES),
        responsibleId: responsible.id,
        createdById: admin.id,
        dueDate,
        createdAt,
        completedAt,
      },
    });

    protocolCount++;

    addLogEntry(allHistoryLogs, protocol.id, admin.id, "responsável", null, responsible.name, createdAt);
    let prevStage: string | null = null;
    stages.forEach((stage, idx) => {
      addLogEntry(
        allHistoryLogs,
        protocol.id,
        idx === 0 ? admin.id : responsible.id,
        "status",
        prevStage,
        stage,
        stageTimestamps[idx]
      );
      prevStage = stage;
    });

    const commentChance = stages.length > 1 ? 0.6 : 0.25;
    if (Math.random() < commentChance) {
      const numComments = randInt(1, stages.length > 2 ? 3 : 1);
      for (let c = 0; c < numComments; c++) {
        const ts = new Date(createdAt.getTime() + randInt(0, Math.max(1, ageInDays)) * DAY);
        allComments.push({
          protocolId: protocol.id,
          userId: responsible.id,
          content: pick(COMMENT_SAMPLES),
          createdAt: ts > now ? now : ts,
        });
      }
    }

    if (monthOffset === 0) {
      if (status === "NOVO" && Math.random() < 0.7) {
        allNotifications.push({
          userId: responsible.id,
          protocolId: protocol.id,
          type: "NOVO_PROTOCOLO",
          message: `Novo protocolo ${number} atribuído a você.`,
          read: Math.random() < 0.4,
          createdAt,
        });
      }
      const daysToDue = Math.ceil((dueDate.getTime() - now.getTime()) / DAY);
      if (!isDone && daysToDue < 0) {
        allNotifications.push({
          userId: responsible.id,
          protocolId: protocol.id,
          type: "PROTOCOLO_ATRASADO",
          message: `O protocolo ${number} está atrasado.`,
          read: Math.random() < 0.3,
          createdAt: now,
        });
      } else if (!isDone && daysToDue <= 2) {
        allNotifications.push({
          userId: responsible.id,
          protocolId: protocol.id,
          type: "PRAZO_PROXIMO",
          message: `O protocolo ${number} vence em breve.`,
          read: Math.random() < 0.3,
          createdAt: now,
        });
      }
    }
  }

  const BATCH = 200;
  for (let i = 0; i < allHistoryLogs.length; i += BATCH) {
    await prisma.historyLog.createMany({ data: allHistoryLogs.slice(i, i + BATCH) });
  }
  for (let i = 0; i < allComments.length; i += BATCH) {
    await prisma.comment.createMany({ data: allComments.slice(i, i + BATCH) });
  }
  for (let i = 0; i < allNotifications.length; i += BATCH) {
    await prisma.notification.createMany({ data: allNotifications.slice(i, i + BATCH) });
  }

  console.log(`📄 ${protocolCount} protocolos fictícios criados, com histórico completo.`);
  console.log(`🕘 ${allHistoryLogs.length} entradas de histórico.`);
  console.log(`💬 ${allComments.length} comentários.`);
  console.log(`🔔 ${allNotifications.length} notificações.`);
  console.log("✅ Seed concluído com sucesso — todos os dados são fictícios.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
