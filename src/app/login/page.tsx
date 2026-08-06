"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2, LayoutGrid, Activity, Users2 } from "lucide-react";
import { toast } from "sonner";
import { usePresentationMode } from "@/hooks/use-presentation-mode";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { enabled: presentationMode } = usePresentationMode();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível entrar.");
        return;
      }
      toast.success(`Bem-vindo, ${data.user.name.split(" ")[0]}.`);
      router.push(params.get("from") || "/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-cream-100 dark:bg-charcoal-950">
      {/* Painel de marca */}
      <div className="relative hidden overflow-hidden bg-navy-900 lg:flex lg:flex-col lg:justify-between p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #F0872F, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #1F9D6B, transparent 70%)" }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
            <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            CRA System
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-navy-300"
          >
            Painel interno · monitoria
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-4xl font-bold leading-tight text-white"
          >
            Cada protocolo, sob controle total.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-[15px] leading-relaxed text-navy-200"
          >
            Acompanhe atendimentos, retornos e monitoria em um único fluxo — do
            registro à conclusão, com histórico completo e SLA em tempo real.
          </motion.p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: LayoutGrid, label: "Kanban ao vivo" },
              { icon: Activity, label: "SLA monitorado" },
              { icon: Users2, label: "Times organizados" },
            ].map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
              >
                <Icon className="mb-2 h-4 w-4 text-orange-300" strokeWidth={1.75} />
                <p className="text-xs font-medium text-navy-100">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {!presentationMode && (
          <p className="relative z-10 font-mono text-[11px] text-navy-400">
            Ambiente de demonstração — todos os dados são fictícios.
          </p>
        )}
      </div>

      {/* Painel de formulário */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
              <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">CRA System</span>
          </div>

          <h2 className="font-display text-2xl font-bold">Entrar</h2>
          <p className="text-muted mt-1.5 text-sm">
            Use seu usuário e senha cadastrados pela monitoria.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-muted">
                Usuário
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="X001234"
                className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 font-mono text-sm tracking-wide placeholder:text-charcoal-400/60 dark:border-charcoal-700 dark:bg-charcoal-900"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-muted">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring group flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60 dark:bg-navy-600 dark:hover:bg-navy-500"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {!presentationMode && (
            <div className="mt-8 rounded-xl border border-cream-200 bg-cream-50 p-4 text-xs leading-relaxed text-muted dark:border-charcoal-700 dark:bg-charcoal-900">
              <p className="mb-1 font-semibold text-[13px]" style={{ color: "rgb(var(--text))" }}>
                Ambiente de demonstração
              </p>
              Administrador: <span className="font-mono">cramonitoria</span> · Colaboradores: padrão{" "}
              <span className="font-mono">X00XXXX</span> com senha inicial{" "}
              <span className="font-mono">123456</span>.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
