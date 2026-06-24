"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ShieldCheck } from "lucide-react";
import { navItems } from "./nav";
import { reviewQueue, shadowAgents } from "@/lib/data";

export function Sidebar() {
  const path = usePathname();
  const badges = {
    reviews: reviewQueue.length,
    shadow: shadowAgents.filter((s) => s.status === "Unregistered").length,
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex">
      <Link
        href="/"
        className="flex items-center gap-2.5 px-5 py-[18px]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--indigo)] shadow-[0_0_18px_-4px_var(--indigo)]">
          <ShieldCheck size={18} className="text-white" />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-[var(--text)]">
            AegisAgent
          </div>
          <div className="text-[10px] text-[var(--text-faint)]">
            Trust Plane
          </div>
        </div>
      </Link>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map((item) => {
          const active = item.match
            ? item.match(path)
            : path.startsWith(item.href);
          const Icon = item.icon;
          const badge = item.badgeKey ? badges[item.badgeKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[var(--accent)]" />
              )}
              <Icon
                size={17}
                className={active ? "text-[var(--accent)]" : ""}
              />
              <span className="font-medium">{item.label}</span>
              {badge > 0 && (
                <span
                  className="tnum ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    background:
                      item.badgeKey === "reviews"
                        ? "var(--review-soft)"
                        : "var(--block-soft)",
                    color:
                      item.badgeKey === "reviews"
                        ? "var(--review)"
                        : "var(--block)",
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <div className="rounded-lg bg-[var(--surface-2)] p-3">
          <div className="flex items-center gap-2">
            <span className="live-dot h-2 w-2 rounded-full bg-[var(--allow)]" />
            <span className="text-xs font-medium text-[var(--text)]">
              All systems verified
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--text-faint)]">
            p99 latency 620ms · SLA 800ms
          </p>
        </div>
      </div>
    </aside>
  );
}
