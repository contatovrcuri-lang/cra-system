"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, KeyRound, UserX, UserCheck, Loader2, X } from "lucide-react";
import { Avatar, Card, Skeleton } from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils";
import { PerformancePanel } from "@/components/users/performance-panel";

type UserRow = {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "COLABORADOR";
  active: boolean;
  avatarColor: string;
  createdAt: string;
  _count: { protocolsOwned: number };
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [tab, setTab] = useState<"list" | "performance">("list");

  const { data, isLoading } = useQuery<{ users: UserRow[] }>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Falha ao carregar usuários");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role: "COLABORADOR" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao criar usuário");
      return json;
    },
    onSuccess: (data) => {
      toast.success(`Usuário ${data.user.username} criado. Senha inicial: 123456`);
      qc.invalidateQueries({ queryKey: ["users"] });
      setShowNew(false);
      setNewName("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patchMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao atualizar usuário");
      return json;
    },
    onSuccess: (data) => {
      if (data.newPassword) toast.success(`Senha redefinida para: ${data.newPassword}`);
      else toast.success("Usuário atualizado.");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted">Colaboradores e administradores fictícios do ambiente.</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="focus-ring flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 dark:bg-navy-600 dark:hover:bg-navy-500"
        >
          <Plus className="h-4 w-4" /> Novo colaborador
        </button>
      </div>

      <div className="flex gap-1 rounded-xl bg-cream-150 p-1 dark:bg-charcoal-900 w-fit">
        <button
          onClick={() => setTab("list")}
          className={`focus-ring rounded-lg px-4 py-1.5 text-sm font-medium transition ${
            tab === "list" ? "bg-white shadow-soft dark:bg-charcoal-800" : "text-muted hover:text-current"
          }`}
        >
          Usuários
        </button>
        <button
          onClick={() => setTab("performance")}
          className={`focus-ring rounded-lg px-4 py-1.5 text-sm font-medium transition ${
            tab === "performance" ? "bg-white shadow-soft dark:bg-charcoal-800" : "text-muted hover:text-current"
          }`}
        >
          Desempenho
        </button>
      </div>

      {tab === "performance" ? (
        <PerformancePanel />
      ) : (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-left text-xs text-muted dark:border-charcoal-800">
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Login</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Protocolos</th>
                <th className="px-4 py-3 font-medium">Cadastro</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-cream-100 dark:border-charcoal-800">
                    <td colSpan={7} className="px-4 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}
              {data?.users.map((u) => (
                <tr key={u.id} className="border-b border-cream-100 last:border-0 dark:border-charcoal-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} color={u.avatarColor} size={30} />
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{u.username}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200"
                          : "bg-navy-50 text-navy-700 dark:bg-navy-900/30 dark:text-navy-200"
                      }`}
                    >
                      {u.role === "ADMIN" ? "Administrador" : "Colaborador"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{u._count.protocolsOwned}</td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${u.active ? "text-green-600" : "text-muted"}`}>
                      {u.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        title="Redefinir senha para 123456"
                        onClick={() => patchMutation.mutate({ id: u.id, patch: { resetPassword: true } })}
                        className="focus-ring rounded-lg p-1.5 text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        title={u.active ? "Desativar usuário" : "Ativar usuário"}
                        onClick={() => patchMutation.mutate({ id: u.id, patch: { active: !u.active } })}
                        className="focus-ring rounded-lg p-1.5 text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800"
                      >
                        {u.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="surface w-full max-w-sm animate-fade-up rounded-2xl p-6 shadow-lift">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Novo colaborador</h2>
              <button onClick={() => setShowNew(false)} className="focus-ring rounded-lg p-1.5 text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Nome completo (fictício)</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex.: Rafael Lima"
              className="focus-ring mb-4 w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
            />
            <p className="mb-4 text-xs text-muted">
              O sistema gera automaticamente um usuário no padrão <span className="font-mono">X00XXXX</span> com senha
              inicial <span className="font-mono">123456</span>.
            </p>
            <button
              disabled={!newName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate(newName.trim())}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60 dark:bg-navy-600"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar usuário
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
