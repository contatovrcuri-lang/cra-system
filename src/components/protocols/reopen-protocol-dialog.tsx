"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function ReopenProtocolDialog({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending?: boolean;
}) {
  const [reason, setReason] = useState("");
  const canSubmit = reason.trim().length >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="surface w-full max-w-sm animate-fade-up rounded-2xl p-6 shadow-lift">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Reabrir protocolo</h2>
          <button onClick={onCancel} className="focus-ring rounded-lg p-1.5 text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-3 text-sm text-muted">Explique por que esse protocolo está sendo reaberto. Isso fica registrado no histórico.</p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          autoFocus
          placeholder="Ex: Cooperado retornou dizendo que o problema não foi resolvido."
          className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
        />

        <button
          type="button"
          disabled={!canSubmit || isPending}
          onClick={() => onConfirm(reason.trim())}
          className="focus-ring mt-4 w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40"
        >
          Confirmar reabertura
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="focus-ring mt-2 w-full rounded-xl px-4 py-2 text-center text-sm font-medium text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
