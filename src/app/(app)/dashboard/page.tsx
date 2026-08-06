"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Headset,
  CheckCircle2,
  AlarmClockOff,
  Flame,
  Timer,
  Gauge,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { Skeleton } from "@/components/ui/primitives";
import {
  TypeBarChart,
  CollaboratorBarChart,
  PriorityPieChart,
  DailyAreaChart,
  MonthlyLineChart,
  StatusDonut,
} from "@/components/dashboard/charts";
import { usePresentationMode } from "@/hooks/use-presentation-mode";

type StatsResponse = {
  cards: {
    pendentes: number;
    emAtendimento: number;
    concluidosHoje: number;
    atrasados: number;
    altaPrioridade: number;
    total: number;
    tempoMedioDias: number;
    sla: number;
    produtividade: number;
  };
  charts: {
    byType: { type: string; count: number }[];
    byPriority: { priority: string; count: number }[];
    byStatus: { status: string; count: number }[];
    byCollaborator: { name: string; count: number }[];
    byDay: { date: string; count: number }[];
    byMonth: { month: string; count: number }[];
  };
};

export default function DashboardPage() {
  const { enabled: presentationMode } = usePresentationMode();
  const { data, isLoading } = useQuery<StatsResponse>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Falha ao carregar estatísticas");
      return res.json();
    },
    refetchInterval: presentationMode ? false : 30_000,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted">Visão geral dos protocolos de atendimento e monitoria.</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {isLoading || !data ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Pendentes" value={data.cards.pendentes} icon={Clock} tone="navy" />
            <StatCard label="Em atendimento" value={data.cards.emAtendimento} icon={Headset} tone="navy" />
            <StatCard label="Concluídos hoje" value={data.cards.concluidosHoje} icon={CheckCircle2} tone="green" />
            <StatCard label="Atrasados" value={data.cards.atrasados} icon={AlarmClockOff} tone="red" />
            <StatCard label="Alta prioridade" value={data.cards.altaPrioridade} icon={Flame} tone="orange" />
            <StatCard label="Tempo médio" value={data.cards.tempoMedioDias} suffix="dias" icon={Timer} tone="navy" />
            <StatCard label="SLA" value={data.cards.sla} suffix="%" icon={Gauge} tone="green" />
            <StatCard label="Produtividade (7d)" value={data.cards.produtividade} icon={TrendingUp} tone="orange" />
          </>
        )}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Protocolos por tipo" subtitle="Top 8 categorias mais recorrentes">
          {isLoading || !data ? <Skeleton className="h-[260px]" /> : <TypeBarChart data={data.charts.byType} />}
        </ChartCard>
        <ChartCard title="Por prioridade" subtitle="Distribuição atual">
          {isLoading || !data ? <Skeleton className="h-[260px]" /> : <PriorityPieChart data={data.charts.byPriority} />}
        </ChartCard>
        <ChartCard title="Por status" subtitle="Situação geral dos protocolos">
          {isLoading || !data ? <Skeleton className="h-[260px]" /> : <StatusDonut data={data.charts.byStatus} />}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Protocolos por colaborador" subtitle="Volume total sob responsabilidade">
          {isLoading || !data ? (
            <Skeleton className="h-[260px]" />
          ) : (
            <CollaboratorBarChart data={data.charts.byCollaborator} />
          )}
        </ChartCard>
        <div className="grid grid-cols-1 gap-4">
          <ChartCard title="Protocolos por dia" subtitle="Últimos 14 dias">
            {isLoading || !data ? <Skeleton className="h-[220px]" /> : <DailyAreaChart data={data.charts.byDay} />}
          </ChartCard>
          <ChartCard title="Evolução mensal" subtitle="Últimos 6 meses">
            {isLoading || !data ? <Skeleton className="h-[220px]" /> : <MonthlyLineChart data={data.charts.byMonth} />}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
