import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function avg(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

const MS_DAY = 1000 * 60 * 60 * 24;

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: "COLABORADOR" },
    select: { id: true, name: true, username: true, avatarColor: true, active: true },
    orderBy: { name: "asc" },
  });

  const results = await Promise.all(
    users.map(async (user) => {
      const [assignedNow, allAssigned, concluded] = await Promise.all([
        prisma.protocol.count({
          where: { responsibleId: user.id, status: { notIn: ["CONCLUIDO", "CANCELADO"] } },
        }),
        prisma.protocol.count({ where: { responsibleId: user.id } }),
        prisma.protocol.findMany({
          where: { responsibleId: user.id, status: "CONCLUIDO", completedAt: { not: null } },
          select: {
            id: true,
            createdAt: true,
            completedAt: true,
            dueDate: true,
            history: {
              where: { field: "status" },
              orderBy: { createdAt: "asc" },
              select: { newValue: true, createdAt: true },
            },
          },
        }),
      ]);

      // Tempo total: criação -> conclusão
      const totalDays = concluded.map(
        (p) => (p.completedAt!.getTime() - p.createdAt.getTime()) / MS_DAY
      );

      // Tempo "em atendimento": da primeira vez que entrou em EM_ATENDIMENTO
      // até a entrada em CONCLUIDO (funil de arrastar no Kanban).
      const inProgressDays: number[] = [];
      for (const p of concluded) {
        const startedEntry = p.history.find((h) => h.newValue === "EM_ATENDIMENTO");
        const finishedEntry = [...p.history].reverse().find((h) => h.newValue === "CONCLUIDO");
        if (startedEntry && finishedEntry) {
          const diff = (finishedEntry.createdAt.getTime() - startedEntry.createdAt.getTime()) / MS_DAY;
          if (diff >= 0) inProgressDays.push(diff);
        }
      }

      const onTime = concluded.filter((p) => p.completedAt! <= p.dueDate).length;
      const slaPercent = concluded.length > 0 ? (onTime / concluded.length) * 100 : null;

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        avatarColor: user.avatarColor,
        active: user.active,
        assignedNow,
        totalAssigned: allAssigned,
        completedCount: concluded.length,
        avgTotalDays: Number(avg(totalDays).toFixed(1)),
        avgInProgressDays: inProgressDays.length > 0 ? Number(avg(inProgressDays).toFixed(1)) : null,
        slaPercent: slaPercent !== null ? Number(slaPercent.toFixed(1)) : null,
      };
    })
  );

  results.sort((a, b) => b.completedCount - a.completedCount);

  return NextResponse.json({ performance: results });
}
