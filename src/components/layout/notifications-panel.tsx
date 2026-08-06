"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { BellRing, CheckCheck } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type Notification = {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ notifications: Notification[] }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Falha ao carregar notificações");
      return res.json();
    },
  });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }

  const notifications = data?.notifications ?? [];

  return (
    <div
      ref={ref}
      className="surface absolute right-0 top-11 z-50 w-80 rounded-2xl p-2 shadow-lift animate-fade-up"
    >
      <div className="flex items-center justify-between px-2.5 py-2">
        <p className="font-display text-sm font-semibold">Notificações</p>
        <button
          onClick={markAllRead}
          className="focus-ring flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800"
        >
          <CheckCheck className="h-3.5 w-3.5" /> Marcar tudo
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {isLoading && (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        )}
        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <BellRing className="h-6 w-6 text-muted opacity-50" />
            <p className="text-xs text-muted">Nenhuma notificação por aqui.</p>
          </div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl px-2.5 py-2.5 text-sm ${
              n.read ? "opacity-60" : ""
            } hover:bg-cream-150 dark:hover:bg-charcoal-800`}
          >
            <p className="leading-snug">{n.message}</p>
            <p className="mt-1 text-[11px] text-muted">{formatDateTime(n.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
