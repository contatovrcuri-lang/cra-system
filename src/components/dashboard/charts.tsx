"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/lib/labels";

const NAVY = "#0B2545";
const NAVY_LIGHT = "#4A78AF";
const GREEN = "#1F9D6B";
const ORANGE = "#F0872F";
const RED = "#DC5C4E";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid rgb(var(--border))",
  background: "rgb(var(--surface))",
  color: "rgb(var(--text))",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(11,37,69,0.12)",
};

export function TypeBarChart({ data }: { data: { type: string; count: number }[] }) {
  const top = data.slice(0, 8);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={top} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgb(var(--border))" />
        <XAxis type="number" tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="type"
          width={150}
          tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "rgba(11,37,69,0.05)" }} contentStyle={tooltipStyle} />
        <Bar dataKey="count" fill={NAVY} radius={[0, 6, 6, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CollaboratorBarChart({ data }: { data: { name: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -12, right: 8, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "rgba(11,37,69,0.05)" }} contentStyle={tooltipStyle} />
        <Bar dataKey="count" fill={GREEN} radius={[6, 6, 0, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  BAIXA: GREEN,
  MEDIA: NAVY_LIGHT,
  ALTA: ORANGE,
  CRITICA: RED,
};

export function PriorityPieChart({ data }: { data: { priority: string; count: number }[] }) {
  const chartData = data.map((d) => ({ name: PRIORITY_LABEL[d.priority] ?? d.priority, value: d.count, key: d.priority }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={90}
          paddingAngle={3}
          strokeWidth={0}
        >
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={PRIORITY_COLORS[entry.key] ?? NAVY} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DailyAreaChart({ data }: { data: { date: string; count: number }[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(d.date)),
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={NAVY} stopOpacity={0.35} />
            <stop offset="100%" stopColor={NAVY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="count" stroke={NAVY} strokeWidth={2} fill="url(#colorDaily)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MonthlyLineChart({ data }: { data: { month: string; count: number }[] }) {
  const formatted = data.map((d) => {
    const [y, m] = d.month.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    return { ...d, label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date) };
  });
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ left: -20, right: 16, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="count" stroke={ORANGE} strokeWidth={2.5} dot={{ r: 3, fill: ORANGE }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AvgTimeBarChart({ data }: { data: { name: string; days: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -12, right: 8, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }}
          axisLine={false}
          tickLine={false}
          label={{ value: "dias", angle: -90, position: "insideLeft", fontSize: 10, fill: "rgb(var(--text-muted))" }}
        />
        <Tooltip cursor={{ fill: "rgba(11,37,69,0.05)" }} contentStyle={tooltipStyle} formatter={(v: number) => [`${v} dias`, "Tempo médio"]} />
        <Bar dataKey="days" fill={ORANGE} radius={[6, 6, 0, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusDonut({ data }: { data: { status: string; count: number }[] }) {
  const colorMap: Record<string, string> = {
    NOVO: NAVY_LIGHT,
    EM_ANALISE: ORANGE,
    EM_ATENDIMENTO: NAVY,
    AGUARDANDO_CLIENTE: "#D9A441",
    AGUARDANDO_TERCEIROS: "#C1651B",
    CONCLUIDO: GREEN,
    CANCELADO: "#8A93A3",
  };
  const chartData = data.map((d) => ({ name: STATUS_LABEL[d.status] ?? d.status, value: d.count, key: d.status }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={2} strokeWidth={0}>
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={colorMap[entry.key] ?? NAVY} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}
