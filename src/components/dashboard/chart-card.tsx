export function ChartCard({
  title,
  subtitle,
  children,
  legend,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  legend?: React.ReactNode;
}) {
  return (
    <div className="surface animate-fade-up rounded-2xl p-5 shadow-card dark:shadow-dark-card">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="font-display text-sm font-semibold">{title}</p>
          {subtitle && <p className="text-[11px] text-muted">{subtitle}</p>}
        </div>
        {legend}
      </div>
      {children}
    </div>
  );
}
