"use client";

import { useDroppable } from "@dnd-kit/core";
import { KanbanCard, type KanbanProtocol } from "./kanban-card";
import { STATUS_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

const COLUMN_ACCENT: Record<string, string> = {
  NOVO: "border-t-navy-500",
  EM_ANALISE: "border-t-orange-400",
  EM_ATENDIMENTO: "border-t-navy-700",
  AGUARDANDO_CLIENTE: "border-t-amber-400",
  CONCLUIDO: "border-t-green-500",
};

export function KanbanColumn({
  status,
  items,
  compact,
}: {
  status: string;
  items: KanbanProtocol[];
  compact?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={cn("flex shrink-0 flex-col", compact ? "w-[200px]" : "w-[280px]")}>
      <div className={cn("mb-3 flex items-center justify-between rounded-t-xl border-t-4 bg-white px-3 py-2.5 dark:bg-charcoal-900", COLUMN_ACCENT[status])}>
        <p className="font-display text-sm font-semibold">{STATUS_LABEL[status]}</p>
        <span className="rounded-full bg-cream-150 px-2 py-0.5 text-xs font-medium text-muted dark:bg-charcoal-800">
          {items.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl p-2 transition-colors min-h-[400px]",
          compact ? "space-y-1.5" : "space-y-2.5",
          isOver ? "bg-navy-50 dark:bg-navy-900/20" : "bg-cream-150/60 dark:bg-charcoal-900/40"
        )}
      >
        {items.map((p) => (
          <KanbanCard key={p.id} protocol={p} compact={compact} />
        ))}
        {items.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-cream-300 text-xs text-muted dark:border-charcoal-700">
            Nenhum protocolo
          </div>
        )}
      </div>
    </div>
  );
}
