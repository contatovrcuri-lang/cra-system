"use client";

import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";
import { CSS } from "@dnd-kit/utilities";
import { Avatar } from "@/components/ui/primitives";
import { PriorityBadge } from "@/components/ui/badge";
import { formatDate, formatProtocolNumber, daysUntil } from "@/lib/utils";
import { GripVertical } from "lucide-react";

export type KanbanProtocol = {
  id: string;
  number: string;
  description: string;
  requester: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string;
  responsible: { name: string; avatarColor: string } | null;
};

export function KanbanCard({ protocol, compact }: { protocol: KanbanProtocol; compact?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: protocol.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = daysUntil(protocol.dueDate) < 0 && !["CONCLUIDO", "CANCELADO"].includes(protocol.status);

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="surface group flex items-center gap-2 rounded-lg px-2.5 py-2 shadow-soft transition hover:shadow-card"
      >
        <button {...attributes} {...listeners} className="cursor-grab touch-none text-muted active:cursor-grabbing">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <Link
          href={`/protocols/${protocol.id}`}
          className="focus-ring min-w-0 flex-1 truncate font-mono text-[11px] font-medium text-navy-700 hover:underline dark:text-navy-300"
          title={formatProtocolNumber(protocol.number)}
        >
          {formatProtocolNumber(protocol.number)}
        </Link>
        {protocol.responsible && (
          <Avatar name={protocol.responsible.name} color={protocol.responsible.avatarColor} size={18} />
        )}
        {overdue && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" title="Atrasado" />}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="surface group rounded-xl p-3 shadow-soft transition hover:shadow-card"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link
          href={`/protocols/${protocol.id}`}
          className="focus-ring font-mono text-[11px] font-medium text-navy-700 hover:underline dark:text-navy-300"
        >
          {formatProtocolNumber(protocol.number)}
        </Link>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-2 line-clamp-2 text-[13px] font-medium leading-snug">{protocol.type}</p>
      <p className="mb-3 line-clamp-1 text-xs text-muted">{protocol.requester}</p>
      <div className="flex items-center justify-between">
        <PriorityBadge priority={protocol.priority} className="px-2 py-0.5 text-[10px]" />
        {protocol.responsible && (
          <Avatar name={protocol.responsible.name} color={protocol.responsible.avatarColor} size={22} />
        )}
      </div>
      <p className={`mt-2 text-[10px] ${overdue ? "font-semibold text-red-500" : "text-muted"}`}>
        Prazo: {formatDate(protocol.dueDate)}
        {overdue && " · atrasado"}
      </p>
    </div>
  );
}
