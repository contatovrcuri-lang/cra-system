import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createUserSchema } from "@/lib/validators";
import { generateFakeUsername, AVATAR_COLORS, pick } from "@/lib/fake-data";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      active: true,
      avatarColor: true,
      createdAt: true,
      _count: { select: { protocolsOwned: true } },
    },
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const count = await prisma.user.count();
  let username = generateFakeUsername(count);
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.user.findUnique({ where: { username } });
    if (!exists) break;
    username = generateFakeUsername(count + i + 1);
  }

  const passwordHash = await hashPassword("123456");

  const user = await prisma.user.create({
    data: {
      username,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash,
      avatarColor: pick(AVATAR_COLORS),
    },
    select: { id: true, username: true, name: true, role: true, active: true, avatarColor: true, createdAt: true },
  });

  return NextResponse.json({ user, initialPassword: "123456" }, { status: 201 });
}
