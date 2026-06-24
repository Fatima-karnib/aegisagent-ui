"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Hand,
  Lightbulb,
} from "lucide-react";
import type { RedTeamRun } from "@/lib/types";
import { Card, Pill } from "@/components/ui";

export function RedTeamRunCard({
  run,
  agentName,
  defaultOpen,
}: {
  run: RedTeamRun;
  agentName?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const pass = run.caught === run.total;
  return (
    <Card pad={false} className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-2)]"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: pass ? "var(--allow-soft)" : "var(--block-soft)",
            color: pass ? "var(--allow)" : "var(--block)",
          }}
        >
          {pass ? <ShieldCheck size={17} /> : <ShieldAlert size={17} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text)]">
              {agentName ? `${agentName} · ` : ""}
              {run.date}
            </span>
            <Pill tone={run.trigger === "Scheduled" ? "info" : "neutral"}>
              <span className="flex items-center gap-1">
                {run.trigger === "Scheduled" ? <Calendar size={10} /> : <Hand size={10} />}
                {run.trigger}
              </span>
            </Pill>
          </div>
          <p className="mt-0.5 text-xs text-[var(--text-faint)]">
            {run.caught}/{run.total} attacks blocked
          </p>
        </div>
        <Pill tone={pass ? "allow" : "block"}>{pass ? "PASS" : "FAIL"}</Pill>
        <ChevronDown
          size={16}
          className="text-[var(--text-faint)] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {run.results.map((r) => {
            const caught = r.status === "Caught";
            return (
              <div key={r.attack} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: caught ? "var(--allow)" : "var(--block)" }}
                  />
                  <span className="text-sm font-medium text-[var(--text)]">
                    {r.attack}
                  </span>
                  <Pill tone={caught ? "allow" : "block"}>
                    {caught ? "Caught" : "Escaped"}
                  </Pill>
                  <span className="ml-auto text-[11px] text-[var(--text-faint)]">
                    {caught ? `caught by ${r.layer}` : "no layer caught it"}
                  </span>
                </div>
                <div
                  className="mono mt-2 rounded-md border-l-2 p-2.5 text-[11px] leading-relaxed text-[var(--text-muted)]"
                  style={{
                    background: "var(--bg)",
                    borderColor: caught ? "var(--allow)" : "var(--block)",
                  }}
                >
                  <span className="text-[var(--text-faint)]">adversarial prompt:</span>{" "}
                  “{r.prompt}”
                </div>
                {!caught && (
                  <div className="mt-2 flex items-start gap-2 rounded-md bg-[var(--review-soft)] p-2.5 text-[11px] text-[var(--text-muted)]">
                    <Lightbulb size={13} className="mt-0.5 shrink-0 text-[var(--review)]" />
                    <span>
                      <span className="font-semibold text-[var(--review)]">
                        Recommendation:{" "}
                      </span>
                      {r.recommendation}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
