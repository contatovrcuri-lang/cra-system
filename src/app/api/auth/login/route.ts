import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, setSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Usuário inválido.")
    .max(32, "Usuário inválido.")
    .regex(/^[A-Za-z0-9]+$/, "Usuário inválido."),
  password: z.string().min(4, "Senha inválida.").max(128),
});

// Rate limit simples em memória (proteção básica contra força bruta).
// Em produção multi-instância, substitua por um limitador distribuído
// (ex.: Supabase/Upstash) — ver README para detalhes.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um minuto e tente novamente." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !user.active) {
    return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  }

  const token = await signSession({
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    avatarColor: user.avatarColor,
  });

  await setSessionCookie(token);

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      avatarColor: user.avatarColor,
    },
  });
}
