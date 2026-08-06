import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_COLOR, PRIORITY_LABEL, PRIORITY_COLOR, PRIORITY_DOT } from "@/lib/labels";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        STATUS_COLOR[status],
        className
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        PRIORITY_COLOR[priority],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[priority])} />
      {PRIORITY_LABEL[priority] ?? priority}
    </span>
  );
}
