"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PROTOCOL_TYPES } from "@/lib/fake-data";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/lib/labels";

const formSchema = z.object({
  description: z.string().min(5, "Descreva o protocolo com mais detalhes."),
  requester: z.string().min(2, "Informe o solicitante."),
  type: z.string().min(1, "Selecione um tipo."),
  priority: z.enum(["BAIXA", "MEDIA", "ALTA", "CRITICA"]),
  status: z.enum([
    "NOVO",
    "EM_ANALISE",
    "EM_ATENDIMENTO",
    "AGUARDANDO_CLIENTE",
    "AGUARDANDO_TERCEIROS",
    "CONCLUIDO",
    "CANCELADO",
  ]),
  responsibleId: z.string().optional(),
  dueDate: z.string().min(1, "Informe o prazo."),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type UserOption = { id: string; name: string; username: string };

export function NewProtocolDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();

  const { data: usersData } = useQuery<{ users: UserOption[] }>({
    queryKey: ["users-options"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Falha ao carregar usuários");
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: "MEDIA",
      status: "NOVO",
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          responsibleId: values.responsibleId || null,
          dueDate: new Date(values.dueDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar protocolo");
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Protocolo ${data.protocol.number} criado com sucesso.`);
      qc.invalidateQueries({ queryKey: ["protocols"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="surface w-full max-w-lg animate-fade-up rounded-2xl p-6 shadow-lift max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Novo protocolo</h2>
          <button onClick={onClose} className="focus-ring rounded-lg p-1.5 text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Descrição</label>
            <textarea
              {...register("description")}
              rows={3}
              className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
              placeholder="Detalhe a solicitação..."
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Solicitante</label>
              <input
                {...register("requester")}
                className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
                placeholder="Nome do solicitante"
              />
              {errors.requester && <p className="mt-1 text-xs text-red-500">{errors.requester.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Tipo</label>
              <select
                {...register("type")}
                className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
              >
                <option value="">Selecione...</option>
                {PROTOCOL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Prioridade</label>
              <select
                {...register("priority")}
                className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
              >
                {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Status</label>
              <select
                {...register("status")}
                className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
              >
                {Object.entries(STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Prazo</label>
              <input
                type="date"
                {...register("dueDate")}
                className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
              />
              {errors.dueDate && <p className="mt-1 text-xs text-red-500">{errors.dueDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Responsável</label>
            <select
              {...register("responsibleId")}
              className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            >
              <option value="">Não atribuído</option>
              {usersData?.users
                .filter((u) => "username" in u)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} · {u.username}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Observações (opcional)</label>
            <textarea
              {...register("notes")}
              rows={2}
              className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-xl px-4 py-2.5 text-sm font-medium text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="focus-ring flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60 dark:bg-navy-600 dark:hover:bg-navy-500"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar protocolo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
