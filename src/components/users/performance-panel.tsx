"use client";

import { useQuery } from "@tanstack/react-query";
import { Gauge, Timer, CheckCircle2, ListChecks } from "lucide-react";
import { Card, Avatar, Skeleton, EmptyState } from "@/components/ui/primitives";
import { ChartCard } from "@/components/dashboard/chart-card";
import { AvgTimeBarChart } from "@/components/dashboard/charts";

type PerformanceRow = {
  id: string;
  name: string;
  username: string;
  avatarColor: string;
  active: boolean;
  assignedNow: number;
  totalAssigned: number;
  completedCount: number;
  avgTotalDays: number;
  avgInProgressDays: number | null;
  slaPercent: number | null;
};

export function PerformancePanel() {
  const { data, isLoading } = useQuery<{ performance: PerformanceRow[] }>({
    queryKey: ["users-performance"],
    queryFn: async () => {
      const res = await fetch("/api/users/performance");
      if (!res.ok) throw new Error("Falha ao carregar desempenho");
      return res.json();
    },
  });

  const rows = data?.performance ?? [];
  const withCompletions = rows.filter((r) => r.completedCount > 0);
  const chartData = withCompletions.map((r) => ({ name: r.name.split(" ")[0], days: r.avgTotalDays }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight">Desempenho por colaborador</h2>
        <p className="text-sm text-muted">
          Tempo médio do fluxo completo (criação → conclusão) e do trecho <span className="font-medium">Em atendimento → Concluído</span> no Kanban, calculado a partir do histórico de cada protocolo.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : withCompletions.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Gauge className="h-8 w-8" />}
            title="Ainda sem protocolos concluídos"
            description="As métricas de desempenho aparecem assim que os colaboradores finalizarem protocolos."
          />
        </Card>
      ) : (
        <ChartCard title="Tempo médio de conclusão" subtitle="Criação → conclusão, por colaborador (dias)">
          <AvgTimeBarChart data={chartData} />
        </ChartCard>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-left text-xs text-muted dark:border-charcoal-800">
                <th className="px-4 py-3 font-medium">Colaborador</th>
                <th className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" /> Atribuídos hoje</span>
                </th>
                <th className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Concluídos</span>
                </th>
                <th className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5" /> Tempo médio total</span>
                </th>
                <th className="px-4 py-3 font-medium">Em atendimento → Concluído</th>
                <th className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> SLA individual</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-cream-100 dark:border-charcoal-800">
                    <td colSpan={6} className="px-4 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-cream-100 last:border-0 dark:border-charcoal-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.name} color={r.avatarColor} size={28} />
                      <div>
                        <p className="font-medium leading-tight">{r.name}</p>
                        <p className="font-mono text-[11px] text-muted">{r.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{r.assignedNow}</td>
                  <td className="px-4 py-3 font-medium">{r.completedCount}</td>
                  <td className="px-4 py-3 text-muted">
                    {r.completedCount > 0 ? `${r.avgTotalDays} dias` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.avgInProgressDays !== null ? `${r.avgInProgressDays} dias` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.slaPercent !== null ? (
                      <span
                        className={`font-medium ${
                          r.slaPercent >= 80 ? "text-green-600" : r.slaPercent >= 50 ? "text-orange-600" : "text-red-500"
                        }`}
                      >
                        {r.slaPercent}%
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
