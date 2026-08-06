"use client";

import { X, Phone, MessageCircle, Mail } from "lucide-react";
import { RESOLUTION_CHANNEL_LABEL } from "@/lib/labels";

const CHANNEL_ICON: Record<string, typeof Phone> = {
  CONTATO_ATIVO: Phone,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
};

export function ConcludeProtocolDialog({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: (channel: "CONTATO_ATIVO" | "WHATSAPP" | "EMAIL") => void;
  onCancel: () => void;
  isPending?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="surface w-full max-w-sm animate-fade-up rounded-2xl p-6 shadow-lift">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Finalizar protocolo</h2>
          <button onClick={onCancel} className="focus-ring rounded-lg p-1.5 text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-4 text-sm text-muted">Esse protocolo foi finalizado por:</p>

        <div className="space-y-2">
          {(Object.keys(RESOLUTION_CHANNEL_LABEL) as Array<keyof typeof RESOLUTION_CHANNEL_LABEL>).map((key) => {
            const Icon = CHANNEL_ICON[key];
            return (
              <button
                key={key}
                type="button"
                disabled={isPending}
                onClick={() => onConfirm(key as "CONTATO_ATIVO" | "WHATSAPP" | "EMAIL")}
                className="focus-ring flex w-full items-center gap-3 rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm font-medium hover:border-navy-400 hover:bg-navy-50 disabled:opacity-60 dark:border-charcoal-700 dark:bg-charcoal-900 dark:hover:bg-navy-900/20"
              >
                <Icon className="h-4 w-4 text-navy-700 dark:text-navy-300" />
                {RESOLUTION_CHANNEL_LABEL[key]}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="focus-ring mt-4 w-full rounded-xl px-4 py-2 text-center text-sm font-medium text-muted hover:bg-cream-150 dark:hover:bg-charcoal-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
