"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/lib/labels";

type UserOption = { id: string; name: string; username: string };

export default function ReportsPage() {
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [responsibleId, setResponsibleId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: usersData } = useQuery<{ users: UserOption[] }>({
    queryKey: ["users-options"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Falha ao carregar usuários");
      return res.json();
    },
  });

  function buildParams() {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (responsibleId) params.set("responsibleId", responsibleId);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params;
  }

  function download(kind: "pdf" | "excel") {
    const params = buildParams();
    window.open(`/api/reports/${kind}?${params.toString()}`, "_blank");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted">Exporte protocolos filtrados em PDF ou Excel.</p>
      </div>

      <Card className="p-5">
        <p className="mb-4 font-display text-sm font-semibold">Filtros</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Período — de</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Período — até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Responsável</label>
            <select
              value={responsibleId}
              onChange={(e) => setResponsibleId(e.target.value)}
              className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            >
              <option value="">Todos</option>
              {usersData?.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            >
              <option value="">Todos</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            >
              <option value="">Todas</option>
              {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 border-t border-cream-200 pt-4 dark:border-charcoal-800">
          <button
            onClick={() => download("pdf")}
            className="focus-ring flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500"
          >
            <FileText className="h-4 w-4" /> Exportar PDF
          </button>
          <button
            onClick={() => download("excel")}
            className="focus-ring flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
          </button>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <FileDown className="h-3.5 w-3.5" /> Os arquivos são gerados com base nos filtros acima.
          </div>
        </div>
      </Card>
    </div>
  );
}
