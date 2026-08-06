"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, FileText, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { Avatar, Card, Skeleton, EmptyState } from "@/components/ui/primitives";
import { NewProtocolDialog } from "@/components/protocols/new-protocol-dialog";
import { formatDate, formatProtocolNumber, daysUntil } from "@/lib/utils";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/lib/labels";
import { PROTOCOL_TYPES } from "@/lib/fake-data";
import { useCurrentUser } from "@/hooks/use-current-user";

type Protocol = {
  id: string;
  number: string;
  description: string;
  requester: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string;
  createdAt: string;
  responsible: { id: string; name: string; avatarColor: string; username: string } | null;
};

export default function ProtocolsPage() {
  return (
    <Suspense fallback={null}>
      <ProtocolsPageContent />
    </Suspense>
  );
}

function ProtocolsPageContent() {
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();
  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Sincroniza com buscas vindas da barra de busca global (topbar), inclusive
  // se o usuário já estiver nessa página e buscar de novo.
  useEffect(() => {
    const urlQ = searchParams.get("q");
    if (urlQ !== null && urlQ !== q) {
      setQ(urlQ);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Atalho de teclado: "N" abre o formulário de novo protocolo (monitoria).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (isTyping || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "n" && user?.role === "ADMIN") {
        e.preventDefault();
        setShowNew(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [user]);

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);
  if (type) params.set("type", type);
  params.set("page", String(page));
  params.set("pageSize", "12");

  const { data, isLoading } = useQuery<{
    items: Protocol[];
    totalCount: number;
    totalPages: number;
  }>({
    queryKey: ["protocols", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/protocols?${params.toString()}`);
      if (!res.ok) throw new Error("Falha ao carregar protocolos");
      return res.json();
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Protocolos</h1>
          <p className="text-sm text-muted">
            {data ? `${data.totalCount} protocolo(s) encontrado(s)` : "Carregando..."}
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <button
            onClick={() => setShowNew(true)}
            title="Atalho: tecla N"
            className="focus-ring flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500"
          >
            <Plus className="h-4 w-4" /> Novo protocolo
            <kbd className="hidden rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-normal sm:inline">N</kbd>
          </button>
        )}
      </div>

      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por número, solicitante, tipo ou palavra-chave..."
              className="focus-ring w-full rounded-xl border border-cream-200 bg-white py-2.5 pl-9 pr-3 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="focus-ring flex items-center justify-center gap-2 rounded-xl border border-cream-200 px-3.5 py-2.5 text-sm font-medium hover:bg-cream-150 dark:border-charcoal-700 dark:hover:bg-charcoal-800"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 grid grid-cols-1 gap-3 border-t border-cream-200 pt-3 dark:border-charcoal-800 sm:grid-cols-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="focus-ring rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="focus-ring rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            >
              <option value="">Todas as prioridades</option>
              {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="focus-ring rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            >
              <option value="">Todos os tipos</option>
              {PROTOCOL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-left text-xs text-muted dark:border-charcoal-800">
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Solicitante</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Responsável</th>
                <th className="px-4 py-3 font-medium">Prioridade</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-cream-100 dark:border-charcoal-800">
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}
              {!isLoading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<FileText className="h-8 w-8" />}
                      title="Nenhum protocolo encontrado"
                      description="Ajuste os filtros ou crie um novo protocolo."
                    />
                  </td>
                </tr>
              )}
              {!isLoading &&
                data?.items.map((p) => {
                  const overdue = daysUntil(p.dueDate) < 0 && !["CONCLUIDO", "CANCELADO"].includes(p.status);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-cream-100 last:border-0 transition hover:bg-cream-150/60 dark:border-charcoal-800 dark:hover:bg-charcoal-800/60"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/protocols/${p.id}`} className="focus-ring rounded font-mono text-[13px] font-medium text-navy-700 hover:underline dark:text-navy-300">
                          {formatProtocolNumber(p.number)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{p.requester}</td>
                      <td className="px-4 py-3 text-muted">{p.type}</td>
                      <td className="px-4 py-3">
                        {p.responsible ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={p.responsible.name} color={p.responsible.avatarColor} size={22} />
                            <span className="text-xs">{p.responsible.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">Não atribuído</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={p.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className={`px-4 py-3 text-xs ${overdue ? "font-semibold text-red-500" : "text-muted"}`}>
                        {formatDate(p.dueDate)}
                        {overdue && " · atrasado"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-cream-200 px-4 py-3 dark:border-charcoal-800">
            <p className="text-xs text-muted">
              Página {page} de {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="focus-ring rounded-lg border border-cream-200 p-1.5 disabled:opacity-40 dark:border-charcoal-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="focus-ring rounded-lg border border-cream-200 p-1.5 disabled:opacity-40 dark:border-charcoal-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {showNew && <NewProtocolDialog onClose={() => setShowNew(false)} />}
    </div>
  );
}
