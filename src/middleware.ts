import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "cra_session";

const ADMIN_ONLY_PREFIXES = ["/users", "/api/users", "/api/reports"];
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

async function verify(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
    const { payload } = await jwtVerify(token, secret);
    return payload as { sub: string; role: "ADMIN" | "COLABORADOR" };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verify(token) : null;

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiresAdmin = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (requiresAdmin && session.role !== "ADMIN") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/protocols/:path*",
    "/kanban/:path*",
    "/users/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/api/protocols/:path*",
    "/api/users/:path*",
    "/api/dashboard/:path*",
    "/api/reports/:path*",
    "/api/notifications/:path*",
  ],
};
