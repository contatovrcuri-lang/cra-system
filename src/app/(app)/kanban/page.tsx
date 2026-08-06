"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { toast } from "sonner";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { KanbanCard, type KanbanProtocol } from "@/components/kanban/kanban-card";
import { ConcludeProtocolDialog } from "@/components/protocols/conclude-protocol-dialog";
import { Skeleton } from "@/components/ui/primitives";
import { KANBAN_STATUS_ORDER } from "@/lib/labels";

export default function KanbanPage() {
  const qc = useQueryClient();
  const [activeItem, setActiveItem] = useState<KanbanProtocol | null>(null);
  const [pendingConclude, setPendingConclude] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ items: KanbanProtocol[] }>({
    queryKey: ["kanban-protocols"],
    queryFn: async () => {
      const res = await fetch("/api/protocols?pageSize=100");
      if (!res.ok) throw new Error("Falha ao carregar protocolos");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, resolutionChannel }: { id: string; status: string; resolutionChannel?: string }) => {
      const res = await fetch(`/api/protocols/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(resolutionChannel ? { resolutionChannel } : {}) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao mover protocolo");
      return json;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["kanban-protocols"] });
      const previous = qc.getQueryData<{ items: KanbanProtocol[] }>(["kanban-protocols"]);
      qc.setQueryData<{ items: KanbanProtocol[] }>(["kanban-protocols"], (old) =>
        old ? { items: old.items.map((p) => (p.id === id ? { ...p, status } : p)) } : old
      );
      return { previous };
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["kanban-protocols"], ctx.previous);
      toast.error(err.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const columns = useMemo(() => {
    const map: Record<string, KanbanProtocol[]> = {};
    KANBAN_STATUS_ORDER.forEach((s) => (map[s] = []));
    data?.items.forEach((p) => {
      // "Aguardando terceiros" é agrupado visualmente com "Aguardando cliente";
      // protocolos cancelados não aparecem no board (ficam só na lista/relatórios).
      if (p.status === "CANCELADO") return;
      const col = p.status === "AGUARDANDO_TERCEIROS" ? "AGUARDANDO_CLIENTE" : p.status;
      if (!map[col]) map[col] = [];
      map[col].push(p);
    });
    return map;
  }, [data]);

  function handleDragStart(e: DragStartEvent) {
    const item = data?.items.find((p) => p.id === e.active.id);
    if (item) setActiveItem(item);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = e;
    if (!over) return;
    const newStatus = String(over.id);
    const item = data?.items.find((p) => p.id === active.id);
    if (!item || item.status === newStatus) return;

    if (newStatus === "CONCLUIDO") {
      setPendingConclude(String(active.id));
      return;
    }
    updateMutation.mutate({ id: String(active.id), status: newStatus });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Kanban</h1>
        <p className="text-sm text-muted">Arraste os protocolos entre as colunas para atualizar o status.</p>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[480px] w-[280px] shrink-0 rounded-xl" />
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {KANBAN_STATUS_ORDER.map((status) => (
              <KanbanColumn key={status} status={status} items={columns[status] ?? []} />
            ))}
          </div>
          <DragOverlay>{activeItem && <KanbanCard protocol={activeItem} />}</DragOverlay>
        </DndContext>
      )}

      {pendingConclude && (
        <ConcludeProtocolDialog
          isPending={updateMutation.isPending}
          onCancel={() => setPendingConclude(null)}
          onConfirm={(channel) => {
            updateMutation.mutate(
              { id: pendingConclude, status: "CONCLUIDO", resolutionChannel: channel },
              { onSuccess: () => setPendingConclude(null) }
            );
          }}
        />
      )}
    </div>
  );
}
