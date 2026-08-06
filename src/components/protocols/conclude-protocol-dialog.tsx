"use client";

import { useState } from "react";
import { X, Phone, MessageCircle, Mail } from "lucide-react";
import { RESOLUTION_CHANNEL_LABEL } from "@/lib/labels";

const CHANNEL_ICON: Record<string, typeof Phone> = {
  CONTATO_ATIVO: Phone,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
};

type Channel = "CONTATO_ATIVO" | "WHATSAPP" | "EMAIL";

export function ConcludeProtocolDialog({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: (channel: Channel, note: string) => void;
  onCancel: () => void;
  isPending?: boolean;
}) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [note, setNote] = useState("");

  const canSubmit = channel !== null && note.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="surface w-full max-w-sm animate-fade-up rounded-2xl p-6 shadow-lift">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Finalizar protocolo</h2>
          <button onClick={onCancel} className="focus-ring rounded-lg p-1.5 text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-3 text-sm text-muted">Esse protocolo foi finalizado por:</p>

        <div className="space-y-2">
          {(Object.keys(RESOLUTION_CHANNEL_LABEL) as Channel[]).map((key) => {
            const Icon = CHANNEL_ICON[key];
            const selected = channel === key;
            return (
              <button
                key={key}
                type="button"
                disabled={isPending}
                onClick={() => setChannel(key)}
                className={`focus-ring flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:opacity-60 ${
                  selected
                    ? "border-navy-500 bg-navy-50 dark:border-navy-400 dark:bg-navy-900/30"
                    : "border-cream-200 bg-white hover:border-navy-400 hover:bg-navy-50 dark:border-charcoal-700 dark:bg-charcoal-900 dark:hover:bg-navy-900/20"
                }`}
              >
                <Icon className="h-4 w-4 text-navy-700 dark:text-navy-300" />
                {RESOLUTION_CHANNEL_LABEL[key]}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-muted">O que foi resolvido/informado ao cooperado?</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Ex: Estorno confirmado, cooperado orientado sobre o prazo de compensação."
            className="focus-ring w-full rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm dark:border-charcoal-700 dark:bg-charcoal-900"
          />
        </div>

        <button
          type="button"
          disabled={!canSubmit || isPending}
          onClick={() => channel && onConfirm(channel, note.trim())}
          className="focus-ring mt-4 w-full rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-40 dark:bg-navy-600 dark:hover:bg-navy-500"
        >
          Confirmar conclusão
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
