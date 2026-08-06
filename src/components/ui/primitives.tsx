import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function Avatar({
  name,
  color = "#0B2545",
  size = 32,
  className,
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white",
        className
      )}
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.38 }}
      title={name}
    >
      {initials(name)}
    </div>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("surface rounded-2xl shadow-card dark:shadow-dark-card", className)}>
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && <div className="text-muted opacity-60">{icon}</div>}
      <p className="font-display text-base font-semibold">{title}</p>
      {description && <p className="text-muted max-w-sm text-sm">{description}</p>}
      {action}
    </div>
  );
}
