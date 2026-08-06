"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "cra-presentation-mode";
const EVENT_NAME = "cra-presentation-mode-change";

function readStored(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Modo apresentação: liga/desliga (client-side, via localStorage) elementos
 * pensados para desenvolvimento/demonstração — dicas de credenciais, avisos
 * de "ambiente fictício" e atualização automática dos gráficos — para deixar
 * a tela mais limpa e estável ao apresentar o sistema para terceiros.
 * Não afeta nenhum dado no banco, é puramente visual e local ao navegador.
 */
export function usePresentationMode() {
  const [enabled, setEnabledState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEnabledState(readStored());
    setMounted(true);
    function onChange() {
      setEnabledState(readStored());
    }
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // localStorage indisponível (modo privado, etc.) — ignora silenciosamente
    }
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  // Antes de montar, assume "desligado" para evitar flash/hydration mismatch.
  return { enabled: mounted ? enabled : false, setEnabled, mounted };
}
