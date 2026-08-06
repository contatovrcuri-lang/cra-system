import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

const updateSchema = z.object({
  active: z.boolean().optional(),
  role: z.enum(["ADMIN", "COLABORADOR"]).optional(),
  resetPassword: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.active !== undefined) data.active = parsed.data.active;
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.resetPassword) data.passwordHash = await hashPassword("123456");

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, username: true, name: true, role: true, active: true, avatarColor: true },
  });

  return NextResponse.json({
    user,
    ...(parsed.data.resetPassword ? { newPassword: "123456" } : {}),
  });
}
