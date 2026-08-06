"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, ShieldCheck, Presentation } from "lucide-react";
import { Card, Avatar } from "@/components/ui/primitives";
import { useCurrentUser } from "@/hooks/use-current-user";
import { usePresentationMode } from "@/hooks/use-presentation-mode";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useCurrentUser();
  const { enabled: presentationMode, setEnabled: setPresentationMode } = usePresentationMode();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted">Preferências de aparência e informações da conta.</p>
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 flex items-center gap-1.5 font-display text-sm font-semibold">
              <Presentation className="h-4 w-4" /> Modo apresentação
            </p>
            <p className="max-w-md text-xs text-muted">
              Oculta dicas de login/senha padrão e avisos de "ambiente fictício", e congela a
              atualização automática dos gráficos — ideal para apresentar o sistema em uma reunião
              sem números mudando na tela. Não altera nenhum dado, é só visual e fica salvo neste
              navegador.
            </p>
          </div>
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            aria-pressed={presentationMode}
            className={cn(
              "focus-ring relative h-7 w-12 shrink-0 rounded-full transition-colors",
              presentationMode ? "bg-navy-700 dark:bg-navy-500" : "bg-cream-200 dark:bg-charcoal-700"
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
                presentationMode ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
        {mounted && presentationMode && (
          <p className="mt-3 rounded-lg bg-navy-50 px-3 py-2 text-xs font-medium text-navy-700 dark:bg-navy-900/30 dark:text-navy-200">
            Modo apresentação ativo neste navegador.
          </p>
        )}
      </Card>

      <Card className="p-5">
        <p className="mb-4 font-display text-sm font-semibold">Aparência</p>
        <div className="grid grid-cols-3 gap-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const active = mounted && theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "focus-ring flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium transition",
                  active
                    ? "border-navy-500 bg-navy-50 text-navy-700 dark:bg-navy-900/30 dark:text-navy-200"
                    : "border-cream-200 hover:bg-cream-150 dark:border-charcoal-700 dark:hover:bg-charcoal-800"
                )}
              >
                <Icon className="h-5 w-5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <p className="mb-4 font-display text-sm font-semibold">Conta</p>
        {user && (
          <div className="flex items-center gap-3">
            <Avatar name={user.name} color={user.avatarColor} size={44} />
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="font-mono text-xs text-muted">{user.username}</p>
            </div>
            {user.role === "ADMIN" && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-200">
                <ShieldCheck className="h-3 w-3" /> Administrador
              </span>
            )}
          </div>
        )}
        <p className="mt-4 border-t border-cream-200 pt-4 text-xs text-muted dark:border-charcoal-800">
          Para alterar sua senha, peça à monitoria para redefini-la na tela de Usuários. O padrão de senha
          inicial (<span className="font-mono">123456</span>) é aplicado apenas a este ambiente de demonstração.
        </p>
      </Card>
    </div>
  );
}
