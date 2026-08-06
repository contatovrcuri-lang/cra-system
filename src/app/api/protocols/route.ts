import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createProtocolSchema } from "@/lib/validators";
import { generateProtocolNumber } from "@/lib/fake-data";
import type { Prisma, ProtocolStatus, Priority } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const type = searchParams.get("type");
  const responsibleId = searchParams.get("responsibleId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? "20"), 100);

  const where: Prisma.ProtocolWhereInput = {};

  if (session.role !== "ADMIN") {
    where.responsibleId = session.sub;
  }

  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { requester: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { type: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status as ProtocolStatus;
  if (priority) where.priority = priority as Priority;
  if (type) where.type = type;
  if (responsibleId && session.role === "ADMIN") where.responsibleId = responsibleId;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [items, totalCount] = await Promise.all([
    prisma.protocol.findMany({
      where,
      include: {
        responsible: { select: { id: true, name: true, avatarColor: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.protocol.count({ where }),
  ]);

  return NextResponse.json({
    items,
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas administradores podem criar protocolos." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createProtocolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  let number = generateProtocolNumber();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.protocol.findUnique({ where: { number } });
    if (!exists) break;
    number = generateProtocolNumber();
  }

  const protocol = await prisma.protocol.create({
    data: {
      number,
      ...parsed.data,
      createdById: session.sub,
    },
    include: { responsible: { select: { id: true, name: true, avatarColor: true, username: true } } },
  });

  await prisma.historyLog.create({
    data: {
      protocolId: protocol.id,
      userId: session.sub,
      field: "status",
      oldValue: null,
      newValue: protocol.status,
    },
  });

  if (protocol.responsibleId) {
    await prisma.notification.create({
      data: {
        userId: protocol.responsibleId,
        protocolId: protocol.id,
        type: "NOVO_PROTOCOLO",
        message: `Novo protocolo ${protocol.number} atribuído a você.`,
      },
    });
  }

  return NextResponse.json({ protocol }, { status: 201 });
}
