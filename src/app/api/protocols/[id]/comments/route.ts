import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { commentSchema } from "@/lib/validators";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const protocol = await prisma.protocol.findUnique({ where: { id } });
  if (!protocol) return NextResponse.json({ error: "Protocolo não encontrado." }, { status: 404 });
  if (session.role !== "ADMIN" && protocol.responsibleId !== session.sub) {
    return NextResponse.json({ error: "Você não tem acesso a este protocolo." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Comentário inválido." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { protocolId: id, userId: session.sub, content: parsed.data.content },
    include: { user: { select: { name: true, avatarColor: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
