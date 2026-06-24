"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { X, CheckCircle2, AlertTriangle, Info, ShieldX } from "lucide-react";
import type { ActionEvent } from "@/lib/types";
import { TraceDetail } from "@/components/TraceDetail";

/* ============ Theme ============ */
type Theme = "dark" | "light";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});
export const useTheme = () => useContext(ThemeCtx);

/* ============ Toasts ============ */
export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone?: "success" | "warn" | "info" | "danger";
}
const ToastCtx = createContext<{ push: (t: Omit<Toast, "id">) => void }>({
  push: () => {},
});
export const useToast = () => useContext(ToastCtx);

/* ============ Trace modal ============ */
const TraceCtx = createContext<{ open: (e: ActionEvent) => void }>({
  open: () => {},
});
export const useTrace = () => useContext(TraceCtx);

const toneMeta = {
  success: { c: "var(--allow)", icon: CheckCircle2 },
  warn: { c: "var(--review)", icon: AlertTriangle },
  info: { c: "var(--info)", icon: Info },
  danger: { c: "var(--block)", icon: ShieldX },
};

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [trace, setTraceEvent] = useState<ActionEvent | null>(null);

  useEffect(() => {
    const saved = (localStorage.getItem("aegis-theme") as Theme) || "dark";
    setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("aegis-theme", theme);
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5200);
  }, []);

  const open = useCallback((e: ActionEvent) => setTraceEvent(e), []);

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <ToastCtx.Provider value={{ push }}>
        <TraceCtx.Provider value={{ open }}>
          {children}

          {/* Toast stack */}
          <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2.5">
            {toasts.map((t) => {
              const m = toneMeta[t.tone ?? "info"];
              const Icon = m.icon;
              return (
                <div
                  key={t.id}
                  className="toast-enter card pointer-events-auto flex items-start gap-3 p-3.5"
                  style={{ borderLeft: `3px solid ${m.c}` }}
                >
                  <Icon size={18} style={{ color: m.c }} className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text)]">
                      {t.title}
                    </p>
                    {t.body && (
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {t.body}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setToasts((prev) => prev.filter((x) => x.id !== t.id))
                    }
                    className="text-[var(--text-faint)] hover:text-[var(--text)]"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Trace modal */}
          {trace && (
            <div
              className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8"
              onClick={() => setTraceEvent(null)}
            >
              <div
                className="card my-auto w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
                style={{ padding: 0 }}
              >
                <TraceDetail event={trace} onClose={() => setTraceEvent(null)} />
              </div>
            </div>
          )}
        </TraceCtx.Provider>
      </ToastCtx.Provider>
    </ThemeCtx.Provider>
  );
}
