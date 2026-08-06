"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Menu, Sun, Moon, Bell, LogOut, Presentation } from "lucide-react";
import { toast } from "sonner";
import { NotificationsPanel } from "./notifications-panel";
import { usePresentationMode } from "@/hooks/use-presentation-mode";
import { cn } from "@/lib/utils";

type ShellUser = { name: string; username: string; role: "ADMIN" | "COLABORADOR" };

export function Topbar({ user, onOpenMobile }: { user: ShellUser; onOpenMobile: () => void }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { enabled: presentationMode, setEnabled: setPresentationMode } = usePresentationMode();

  useEffect(() => setMounted(true), []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sessão encerrada.");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-cream-200 bg-white/80 px-4 backdrop-blur-md dark:border-charcoal-800 dark:bg-charcoal-950/80 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="focus-ring rounded-lg p-2 text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs text-muted">
            {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date())}
          </p>
          <p className="font-display text-sm font-semibold">
            Olá, {user.name.split(" ")[0]} · {user.role === "ADMIN" ? "Administrador" : "Colaborador"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setPresentationMode(!presentationMode)}
          aria-pressed={presentationMode}
          title={presentationMode ? "Modo apresentação ativo — clique para desligar" : "Ativar modo apresentação"}
          className={cn(
            "focus-ring hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition sm:flex",
            presentationMode
              ? "bg-navy-900 text-white dark:bg-navy-600"
              : "text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800"
          )}
        >
          <Presentation className="h-4 w-4" />
          {presentationMode && "Apresentação"}
        </button>

        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="focus-ring rounded-lg p-2 text-muted transition hover:bg-cream-150 dark:hover:bg-charcoal-800"
          aria-label="Alternar tema"
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="focus-ring relative rounded-lg p-2 text-muted transition hover:bg-cream-150 dark:hover:bg-charcoal-800"
            aria-label="Notificações"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
          </button>
          {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
        </div>

        <button
          onClick={handleLogout}
          className="focus-ring ml-1 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted transition hover:bg-cream-150 dark:hover:bg-charcoal-800"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
