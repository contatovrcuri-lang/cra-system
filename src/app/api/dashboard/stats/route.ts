import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const now = new Date();
  const todayStart = startOfDay(now);
  const isAdmin = session.role === "ADMIN";
  const scope = isAdmin ? {} : { responsibleId: session.sub };

  const [
    pendentes,
    emAtendimento,
    concluidosHoje,
    atrasados,
    altaPrioridade,
    total,
    concluidosComTempo,
    byType,
    byPriority,
    byStatus,
    protocols,
  ] = await Promise.all([
    prisma.protocol.count({ where: { ...scope, status: { in: ["NOVO", "EM_ANALISE"] } } }),
    prisma.protocol.count({ where: { ...scope, status: "EM_ATENDIMENTO" } }),
    prisma.protocol.count({
      where: { ...scope, status: "CONCLUIDO", completedAt: { gte: todayStart } },
    }),
    prisma.protocol.count({
      where: { ...scope, dueDate: { lt: now }, status: { notIn: ["CONCLUIDO", "CANCELADO"] } },
    }),
    prisma.protocol.count({
      where: { ...scope, priority: { in: ["ALTA", "CRITICA"] }, status: { notIn: ["CONCLUIDO", "CANCELADO"] } },
    }),
    prisma.protocol.count({ where: scope }),
    prisma.protocol.findMany({
      where: { ...scope, status: "CONCLUIDO", completedAt: { not: null } },
      select: { createdAt: true, completedAt: true },
      take: 200,
      orderBy: { completedAt: "desc" },
    }),
    prisma.protocol.groupBy({ by: ["type"], where: scope, _count: { _all: true } }),
    prisma.protocol.groupBy({ by: ["priority"], where: scope, _count: { _all: true } }),
    prisma.protocol.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
    prisma.protocol.findMany({
      where: scope,
      select: {
        createdAt: true,
        responsible: { select: { name: true } },
      },
      take: 500,
    }),
  ]);

  // Tempo médio de resolução (dias)
  const avgResolutionDays =
    concluidosComTempo.length > 0
      ? concluidosComTempo.reduce((sum, p) => {
          const diff = (p.completedAt!.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + diff;
        }, 0) / concluidosComTempo.length
      : 0;

  // SLA: percentual concluído dentro do prazo (entre os concluídos)
  const concluidosTotal = await prisma.protocol.findMany({
    where: { ...scope, status: "CONCLUIDO" },
    select: { completedAt: true, dueDate: true },
  });
  const dentroDoPrazo = concluidosTotal.filter(
    (p) => p.completedAt && p.completedAt <= p.dueDate
  ).length;
  const sla = concluidosTotal.length > 0 ? (dentroDoPrazo / concluidosTotal.length) * 100 : 100;

  // Produtividade: concluídos nos últimos 7 dias
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const produtividade = await prisma.protocol.count({
    where: { ...scope, status: "CONCLUIDO", completedAt: { gte: sevenDaysAgo } },
  });

  // Protocolos por colaborador
  const byCollaboratorMap = new Map<string, number>();
  protocols.forEach((p) => {
    const name = p.responsible?.name ?? "Não atribuído";
    byCollaboratorMap.set(name, (byCollaboratorMap.get(name) ?? 0) + 1);
  });
  const byCollaborator = Array.from(byCollaboratorMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Protocolos por dia (últimos 14 dias)
  const byDayMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
    byDayMap.set(d.toISOString().slice(0, 10), 0);
  }
  protocols.forEach((p) => {
    const key = startOfDay(p.createdAt).toISOString().slice(0, 10);
    if (byDayMap.has(key)) byDayMap.set(key, (byDayMap.get(key) ?? 0) + 1);
  });
  const byDay = Array.from(byDayMap.entries()).map(([date, count]) => ({ date, count }));

  // Evolução mensal (últimos 6 meses)
  const byMonthMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    byMonthMap.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, 0);
  }
  protocols.forEach((p) => {
    const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (byMonthMap.has(key)) byMonthMap.set(key, (byMonthMap.get(key) ?? 0) + 1);
  });
  const byMonth = Array.from(byMonthMap.entries()).map(([month, count]) => ({ month, count }));

  return NextResponse.json({
    cards: {
      pendentes,
      emAtendimento,
      concluidosHoje,
      atrasados,
      altaPrioridade,
      total,
      tempoMedioDias: Number(avgResolutionDays.toFixed(1)),
      sla: Number(sla.toFixed(1)),
      produtividade,
    },
    charts: {
      byType: byType.map((t) => ({ type: t.type, count: t._count._all })).sort((a, b) => b.count - a.count),
      byPriority: byPriority.map((p) => ({ priority: p.priority, count: p._count._all })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
      byCollaborator,
      byDay,
      byMonth,
    },
  });
}
