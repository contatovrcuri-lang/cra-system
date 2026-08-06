import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone = "navy",
  hint,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  tone?: "navy" | "green" | "orange" | "red";
  hint?: string;
}) {
  const toneMap = {
    navy: "bg-navy-50 text-navy-700 dark:bg-navy-900/40 dark:text-navy-200",
    green: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    orange: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    red: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="surface animate-fade-up rounded-2xl p-4 shadow-card transition hover:shadow-lift dark:shadow-dark-card sm:p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", toneMap[tone])}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-[28px]">
        {value}
        {suffix && <span className="ml-1 text-sm font-medium text-muted">{suffix}</span>}
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}
