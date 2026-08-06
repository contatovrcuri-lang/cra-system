"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Trash2,
  User,
  Calendar,
  Clock3,
  History as HistoryIcon,
  MessageSquare,
} from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { Avatar, Card, Skeleton } from "@/components/ui/primitives";
import { formatDate, formatDateTime, formatProtocolNumber } from "@/lib/utils";
import { STATUS_LABEL, PRIORITY_LABEL, RESOLUTION_CHANNEL_LABEL } from "@/lib/labels";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ConcludeProtocolDialog } from "@/components/protocols/conclude-protocol-dialog";

type UserOption = { id: string; name: string; username: string };

type ProtocolDetail = {
  id: string;
  number: string;
  description: string;
  requester: string;
  type: string;
  priority: string;
  status: string;
  notes: string | null;
  resolutionChannel: string | null;
  dueDate: string;
  createdAt: string;
  completedAt: string | null;
  responsible: { id: string; name: string; avatarColor: string; username: string } | null;
  createdBy: { name: string } | null;
  history: {
    id: string;
    field: string;
    oldValue: string | null;
    newValue: string | null;
    createdAt: string;
    user: { name: string; avatarColor: string } | null;
  }[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: { name: string; avatarColor: string } | null;
  }[];
};

export default function ProtocolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useCurrentUser();
  const [comment, setComment] = useState("");
  const [pendingConclude, setPendingConclude] = useState(false);

  const isAdminForOptions = user?.role === "ADMIN";
  const { data: usersData } = useQuery<{ users: UserOption[] }>({
    queryKey: ["users-options"],
    enabled: isAdminForOptions,
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Falha ao carregar usuários");
      return res.json();
    },
  });

  const { data, isLoading } = useQuery<{ protocol: ProtocolDetail }>({
    queryKey: ["protocol", id],
    queryFn: async () => {
      const res = await fetch(`/api/protocols/${id}`);
      if (!res.ok) throw new Error("Falha ao carregar protocolo");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const res = await fetch(`/api/protocols/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao atualizar");
      return json;
    },
    onSuccess: () => {
      toast.success("Protocolo atualizado.");
      qc.invalidateQueries({ queryKey: ["protocol", id] });
      qc.invalidateQueries({ queryKey: ["protocols"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/protocols/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao comentar");
      return json;
    },
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["protocol", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/protocols/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir protocolo");
    },
    onSuccess: () => {
      toast.success("Protocolo excluído.");
      qc.invalidateQueries({ queryKey: ["protocols"] });
      router.push("/protocols");
    },
    onError: () => toast.error("Erro ao excluir protocolo."),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const p = data.protocol;
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/protocols" className="focus-ring flex items-center gap-1.5 text-sm text-muted hover:text-current">
          <ArrowLeft className="h-4 w-4" /> Voltar para protocolos
        </Link>
        {isAdmin && (
          <button
            onClick={() => {
              if (confirm(`Excluir o protocolo ${formatProtocolNumber(p.number)}? Esta ação não pode ser desfeita.`)) {
                deleteMutation.mutate();
              }
            }}
            className="focus-ring flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-3.5 w-3.5" /> Excluir
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-muted">{formatProtocolNumber(p.number)}</p>
                <h1 className="font-display text-xl font-bold">{p.type}</h1>
              </div>
              <div className="flex gap-2">
                <PriorityBadge priority={p.priority} />
                <StatusBadge status={p.status} />
              </div>
            </div>
            <p className="text-sm leading-relaxed">{p.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-cream-200 pt-4 text-sm dark:border-charcoal-800 sm:grid-cols-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <User className="h-3.5 w-3.5" /> Solicitante
                </p>
                <p className="mt-1 font-medium">{p.requester}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <Calendar className="h-3.5 w-3.5" /> Criado em
                </p>
                <p className="mt-1 font-medium">{formatDate(p.createdAt)}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <Clock3 className="h-3.5 w-3.5" /> Prazo
                </p>
                <p className="mt-1 font-medium">{formatDate(p.dueDate)}</p>
              </div>
            </div>

            {p.notes && (
              <div className="mt-4 rounded-xl bg-cream-150 p-3 text-sm dark:bg-charcoal-800">
                <p className="mb-1 text-xs font-medium text-muted">Observações</p>
                {p.notes}
              </div>
            )}

            {p.resolutionChannel && (
              <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm dark:bg-green-950/20">
                <p className="mb-1 text-xs font-medium text-muted">Finalizado por</p>
                {RESOLUTION_CHANNEL_LABEL[p.resolutionChannel]}
              </div>
            )}
          </Card>

          {/* Controles de andamento */}
          <Card className="p-5">
            <p className="mb-3 font-display text-sm font-semibold">Atualizar andamento</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Status</label>
                <select
                  key={`${p.status}-${pendingConclude}`}
                  defaultValue={pendingConclude ? p.status : p.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    if (newStatus === "CONCLUIDO" && p.status !== "CONCLUIDO") {
                      setPendingConclude(true);
                      return;
                    }
                    updateMutation.mutate({ status: newStatus });
                  }}
                  className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
                >
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              {isAdmin && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">Prioridade</label>
                  <select
                    defaultValue={p.priority}
                    onChange={(e) => updateMutation.mutate({ priority: e.target.value })}
                    className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
                  >
                    {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Card>

          {/* Comentários */}
          <Card className="p-5">
            <p className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold">
              <MessageSquare className="h-4 w-4" /> Observações da equipe
            </p>
            <div className="space-y-3">
              {p.comments.length === 0 && <p className="text-sm text-muted">Nenhum comentário ainda.</p>}
              {p.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.user?.name ?? "?"} color={c.user?.avatarColor} size={28} />
                  <div className="flex-1 rounded-xl bg-cream-150 px-3 py-2 text-sm dark:bg-charcoal-800">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">{c.user?.name}</p>
                      <p className="text-[10px] text-muted">{formatDateTime(c.createdAt)}</p>
                    </div>
                    <p className="mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (comment.trim()) commentMutation.mutate(comment.trim());
              }}
              className="mt-4 flex gap-2"
            >
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Adicionar observação..."
                className="focus-ring flex-1 rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
              />
              <button
                type="submit"
                disabled={commentMutation.isPending}
                className="focus-ring flex items-center gap-1.5 rounded-xl bg-navy-900 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60 dark:bg-navy-600"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <p className="mb-3 text-xs font-medium text-muted">Responsável</p>
            {p.responsible ? (
              <div className="flex items-center gap-3">
                <Avatar name={p.responsible.name} color={p.responsible.avatarColor} size={40} />
                <div>
                  <p className="text-sm font-semibold">{p.responsible.name}</p>
                  <p className="font-mono text-xs text-muted">{p.responsible.username}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Não atribuído</p>
            )}

            {isAdmin && (
              <div className="mt-3 border-t border-cream-200 pt-3 dark:border-charcoal-800">
                <label className="mb-1.5 block text-xs font-medium text-muted">Transferir para</label>
                <select
                  key={p.responsible?.id ?? "none"}
                  defaultValue={p.responsible?.id ?? ""}
                  onChange={(e) => updateMutation.mutate({ responsibleId: e.target.value || null })}
                  className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
                >
                  <option value="">Não atribuído</option>
                  {usersData?.users
                    .filter((u) => u.id !== p.responsible?.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} · {u.username}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {p.createdBy && (
              <p className="mt-3 border-t border-cream-200 pt-3 text-xs text-muted dark:border-charcoal-800">
                Criado por <span className="font-medium">{p.createdBy.name}</span>
              </p>
            )}
          </Card>

          <Card className="p-5">
            <p className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold">
              <HistoryIcon className="h-4 w-4" /> Histórico
            </p>
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {p.history.map((h) => (
                <div key={h.id} className="relative border-l-2 border-cream-200 pb-3 pl-4 dark:border-charcoal-700">
                  <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-navy-500" />
                  <p className="text-xs">
                    <span className="font-semibold">{h.user?.name ?? "Sistema"}</span> alterou{" "}
                    <span className="font-medium">{h.field}</span>
                    {h.oldValue && h.newValue && (
                      <>
                        {" "}
                        de <span className="text-muted">&quot;{h.oldValue}&quot;</span> para{" "}
                        <span className="text-muted">&quot;{h.newValue}&quot;</span>
                      </>
                    )}
                    {!h.oldValue && h.newValue && <> para <span className="text-muted">&quot;{h.newValue}&quot;</span></>}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted">{formatDateTime(h.createdAt)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {pendingConclude && (
        <ConcludeProtocolDialog
          isPending={updateMutation.isPending}
          onCancel={() => setPendingConclude(false)}
          onConfirm={(channel) => {
            updateMutation.mutate(
              { status: "CONCLUIDO", resolutionChannel: channel },
              { onSuccess: () => setPendingConclude(false) }
            );
          }}
        />
      )}
    </div>
  );
}
