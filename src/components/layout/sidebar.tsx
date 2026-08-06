"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  KanbanSquare,
  Users,
  FileBarChart,
  Settings,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/primitives";

type ShellUser = {
  name: string;
  username: string;
  role: "ADMIN" | "COLABORADOR";
  avatarColor?: string;
};

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/protocols", label: "Protocolos", icon: FileText },
  { href: "/kanban", label: "Kanban", icon: KanbanSquare },
  { href: "/users", label: "Usuários", icon: Users, adminOnly: true },
  { href: "/reports", label: "Relatórios", icon: FileBarChart, adminOnly: true },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar({
  user,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  user: ShellUser;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const items = NAV.filter((i) => !i.adminOnly || user.role === "ADMIN");

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-cream-200 bg-white transition-all duration-200 dark:border-charcoal-800 dark:bg-charcoal-900",
          collapsed ? "lg:w-[76px]" : "lg:w-64",
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-900">
              <ShieldCheck className="h-4.5 w-4.5 text-white" strokeWidth={2} />
            </div>
            {!collapsed && (
              <span className="font-display text-[15px] font-bold tracking-tight whitespace-nowrap">
                CRA System
              </span>
            )}
          </Link>
          <button
            onClick={onCloseMobile}
            className="focus-ring rounded-lg p-1.5 text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "focus-ring group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-navy-900 text-white dark:bg-navy-600"
                    : "text-charcoal-600 hover:bg-cream-150 dark:text-charcoal-400 dark:hover:bg-charcoal-800"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                {active && (
                  <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-orange-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-cream-200 p-3 dark:border-charcoal-800">
          <button
            onClick={onToggleCollapse}
            className="focus-ring mb-2 hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800 lg:flex"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && "Recolher"}
          </button>
          <div className={cn("flex items-center gap-2.5 rounded-xl px-1.5 py-1.5", !collapsed && "bg-cream-150 dark:bg-charcoal-800")}>
            <Avatar name={user.name} color={user.avatarColor} size={32} />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{user.name}</p>
                <p className="truncate font-mono text-[11px] text-muted">{user.username}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
