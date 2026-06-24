"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Command as CommandIcon,
} from "lucide-react";
import { useTheme } from "@/components/providers";
import { CommandPalette } from "./CommandPalette";
import { navItems } from "./nav";
import { reviewQueue, shadowAgents } from "@/lib/data";

function pageTitle(path: string) {
  if (path === "/") return "Dashboard";
  if (path.startsWith("/agents/")) return "Agent Detail";
  const item = navItems.find((n) => n.href !== "/" && path.startsWith(n.href));
  return item?.label ?? "AegisAgent";
}

export function Topbar() {
  const { theme, toggle } = useTheme();
  const path = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const alerts = reviewQueue.length + shadowAgents.filter((s) => s.status === "Unregistered").length;

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] px-4 backdrop-blur-md">
        <h1 className="hidden text-sm font-semibold text-[var(--text)] sm:block">
          {pageTitle(path)}
        </h1>

        {/* Search trigger */}
        <button
          onClick={() => setPaletteOpen(true)}
          className="group ml-auto flex w-full max-w-md items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-faint)] transition-colors hover:border-[var(--border-strong)]"
        >
          <Search size={15} />
          <span className="flex-1 text-left">Search agents, actions, policies…</span>
          <kbd className="mono hidden items-center gap-0.5 rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] sm:flex">
            <CommandIcon size={10} /> K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <Bell size={16} />
            {alerts > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--block)] px-1 text-[9px] font-semibold text-white">
                {alerts}
              </span>
            )}
          </button>
          {notifOpen && (
            <div
              className="card absolute right-0 top-11 z-50 w-72"
              style={{ padding: 0 }}
            >
              <div className="border-b border-[var(--border)] px-4 py-2.5 text-xs font-semibold text-[var(--text)]">
                Notifications
              </div>
              <div className="max-h-72 overflow-y-auto">
                <NotifRow tone="block" title="BLOCK — FinPilot $50,000 refund" body="Sanctioned vendor · 0 approvals · 9s ago" />
                <NotifRow tone="block" title="3 unregistered agents detected" body="Shadow Radar · CloudTrail + LLM egress" />
                <NotifRow tone="review" title="4 actions awaiting human review" body="Oldest waiting 26m" />
                <NotifRow tone="allow" title="Red-team complete: FinPilot 5/5" body="Scheduled nightly run · all caught" />
              </div>
            </div>
          )}
        </div>

        {/* Org switcher */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setOrgOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] py-1.5 pl-2 pr-2.5 text-sm hover:border-[var(--border-strong)]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--indigo)] text-[11px] font-bold text-white">
              A
            </span>
            <span className="font-medium text-[var(--text)]">Acme Corp</span>
            <ChevronDown size={14} className="text-[var(--text-faint)]" />
          </button>
          {orgOpen && (
            <div className="card absolute right-0 top-11 z-50 w-52" style={{ padding: 6 }}>
              {["Acme Corp", "Acme EU", "Sandbox"].map((o, i) => (
                <button
                  key={o}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--surface-3)] text-[10px] font-bold">
                    {o[0]}
                  </span>
                  {o}
                  {i === 0 && (
                    <span className="ml-auto text-[var(--accent)]">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--indigo)] to-[var(--accent)] text-xs font-bold text-white">
          MK
        </button>
      </header>

      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
    </>
  );
}

function NotifRow({
  tone,
  title,
  body,
}: {
  tone: "block" | "review" | "allow";
  title: string;
  body: string;
}) {
  const c =
    tone === "block"
      ? "var(--block)"
      : tone === "review"
        ? "var(--review)"
        : "var(--allow)";
  return (
    <div className="flex items-start gap-2.5 border-b border-[var(--border)] px-4 py-2.5 last:border-0 hover:bg-[var(--surface-2)]">
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ background: c }}
      />
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--text)]">{title}</p>
        <p className="mt-0.5 text-[11px] text-[var(--text-faint)]">{body}</p>
      </div>
    </div>
  );
}
