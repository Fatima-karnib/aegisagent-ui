"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { navItems } from "./nav";
import { agents, policies } from "@/lib/data";

interface Cmd {
  label: string;
  hint: string;
  href: string;
  group: string;
}

export function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  const commands = useMemo<Cmd[]>(
    () => [
      ...navItems.map((n) => ({
        label: n.label,
        hint: "Page",
        href: n.href,
        group: "Navigate",
      })),
      ...agents.map((a) => ({
        label: a.name,
        hint: a.framework,
        href: `/agents/${a.id}`,
        group: "Agents",
      })),
      ...policies.map((p) => ({
        label: p.name,
        hint: p.type,
        href: `/policies`,
        group: "Policies",
      })),
    ],
    []
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return commands;
    const t = q.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(t) || c.hint.toLowerCase().includes(t)
    );
  }, [q, commands]);

  useEffect(() => setSel(0), [q]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center bg-black/55 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="card w-full max-w-xl overflow-hidden"
        style={{ padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
          <Search size={18} className="text-[var(--text-faint)]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === "Enter" && filtered[sel]) {
                go(filtered[sel].href);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="Search agents, policies, actions, pages…"
            className="w-full bg-transparent py-3.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
          />
          <kbd className="mono rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--text-faint)]">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-[var(--text-faint)]">
              No results for “{q}”
            </p>
          )}
          {filtered.map((c, i) => (
            <button
              key={c.href + c.label}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(c.href)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left"
              style={{
                background: i === sel ? "var(--accent-soft)" : "transparent",
              }}
            >
              <span className="w-16 shrink-0 text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                {c.group}
              </span>
              <span className="flex-1 truncate text-sm text-[var(--text)]">
                {c.label}
              </span>
              <span className="mono text-[11px] text-[var(--text-faint)]">
                {c.hint}
              </span>
              {i === sel && (
                <CornerDownLeft size={13} className="text-[var(--accent)]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
