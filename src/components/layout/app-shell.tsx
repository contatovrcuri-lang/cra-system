"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { cn } from "@/lib/utils";

type ShellUser = {
  name: string;
  username: string;
  role: "ADMIN" | "COLABORADOR";
  avatarColor?: string;
};

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal-950">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[76px]" : "lg:pl-64"
        )}
      >
        <Topbar user={user} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 pb-10 pt-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
