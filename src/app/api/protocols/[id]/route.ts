import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateProtocolSchema } from "@/lib/validators";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/lib/labels";

async function loadProtocol(id: string) {
  return prisma.protocol.findUnique({
    where: { id },
    include: {
      responsible: { select: { id: true, name: true, avatarColor: true, username: true } },
      createdBy: { select: { id: true, name: true } },
      history: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, avatarColor: true } } },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, avatarColor: true } } },
      },
      attachments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const protocol = await loadProtocol(id);
  if (!protocol) return NextResponse.json({ error: "Protocolo não encontrado." }, { status: 404 });

  if (session.role !== "ADMIN" && protocol.responsibleId !== session.sub) {
    return NextResponse.json({ error: "Você não tem acesso a este protocolo." }, { status: 403 });
  }

  return NextResponse.json({ protocol });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.protocol.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Protocolo não encontrado." }, { status: 404 });

  const isOwner = existing.responsibleId === session.sub;
  if (session.role !== "ADMIN" && !isOwner) {
    return NextResponse.json({ error: "Você não tem acesso a este protocolo." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateProtocolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  // Colaboradores só podem alterar status, notas e anexos — não reatribuir,
  // reclassificar prioridade/tipo ou alterar solicitante/prazo.
  const data = { ...parsed.data };
  if (session.role !== "ADMIN") {
    delete data.responsibleId;
    delete data.priority;
    delete data.type;
    delete data.requester;
    delete data.dueDate;
  }

  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];

  if (data.status && data.status !== existing.status) {
    changes.push({ field: "status", oldValue: STATUS_LABEL[existing.status], newValue: STATUS_LABEL[data.status] });
  }
  if (data.priority && data.priority !== existing.priority) {
    changes.push({ field: "prioridade", oldValue: PRIORITY_LABEL[existing.priority], newValue: PRIORITY_LABEL[data.priority] });
  }
  if (data.responsibleId !== undefined && data.responsibleId !== existing.responsibleId) {
    const [oldUser, newUser] = await Promise.all([
      existing.responsibleId ? prisma.user.findUnique({ where: { id: existing.responsibleId } }) : null,
      data.responsibleId ? prisma.user.findUnique({ where: { id: data.responsibleId } }) : null,
    ]);
    changes.push({ field: "responsável", oldValue: oldUser?.name ?? null, newValue: newUser?.name ?? null });
  }
  if (data.notes !== undefined && data.notes !== existing.notes) {
    changes.push({ field: "observações", oldValue: existing.notes, newValue: data.notes ?? null });
  }
  if (data.dueDate && data.dueDate.getTime() !== existing.dueDate.getTime()) {
    changes.push({
      field: "prazo",
      oldValue: existing.dueDate.toISOString().slice(0, 10),
      newValue: data.dueDate.toISOString().slice(0, 10),
    });
  }

  const completedAt =
    data.status === "CONCLUIDO" && existing.status !== "CONCLUIDO"
      ? new Date()
      : data.status && data.status !== "CONCLUIDO"
      ? null
      : undefined;

  const protocol = await prisma.protocol.update({
    where: { id },
    data: { ...data, ...(completedAt !== undefined ? { completedAt } : {}) },
    include: { responsible: { select: { id: true, name: true, avatarColor: true, username: true } } },
  });

  if (changes.length > 0) {
    await prisma.historyLog.createMany({
      data: changes.map((c) => ({
        protocolId: id,
        userId: session.sub,
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
      })),
    });
  }

  // Notificações
  const notifyTargets = new Set<string>();
  if (data.responsibleId && data.responsibleId !== existing.responsibleId) {
    notifyTargets.add(data.responsibleId);
  }
  if (data.status && data.status !== existing.status && protocol.responsibleId && protocol.responsibleId !== session.sub) {
    notifyTargets.add(protocol.responsibleId);
  }
  for (const userId of notifyTargets) {
    await prisma.notification.create({
      data: {
        userId,
        protocolId: id,
        type: data.responsibleId ? "MUDANCA_RESPONSAVEL" : "MUDANCA_STATUS",
        message: data.responsibleId
          ? `Você foi designado como responsável pelo protocolo ${protocol.number}.`
          : `O protocolo ${protocol.number} mudou para "${STATUS_LABEL[protocol.status]}".`,
      },
    });
  }

  return NextResponse.json({ protocol });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores podem excluir protocolos." }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.protocol.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Protocolo não encontrado." }, { status: 404 });

  await prisma.protocol.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
