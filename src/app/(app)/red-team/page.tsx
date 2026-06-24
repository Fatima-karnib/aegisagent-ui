"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  Clock,
  Pencil,
  ShieldCheck,
  ShieldX,
  Minus,
  Loader2,
} from "lucide-react";
import {
  agents,
  coverageMatrix,
  redTeamRuns,
  ATTACK_TYPES,
} from "@/lib/data";
import { Card, Button, SectionTitle, Sparkline } from "@/components/ui";
import { RedTeamRunCard } from "@/components/RedTeamRun";
import { useToast } from "@/components/providers";

const matrix = coverageMatrix();
const orgScore = Math.round(
  agents.reduce((s, a) => s + a.redTeamScore, 0) / agents.length
);

function cellStyle(status: string) {
  if (status === "Caught")
    return { bg: "var(--allow-soft)", fg: "var(--allow)", Icon: ShieldCheck };
  if (status === "Escaped")
    return { bg: "var(--block-soft)", fg: "var(--block)", Icon: ShieldX };
  return { bg: "var(--surface-2)", fg: "var(--text-faint)", Icon: Minus };
}

export default function RedTeamPage() {
  const { push } = useToast();
  const [running, setRunning] = useState(false);

  const runNow = () => {
    setRunning(true);
    push({ title: "Red-team started", body: "5 agents × 5 attack types = 25 scenarios", tone: "info" });
    setTimeout(() => {
      setRunning(false);
      push({
        title: "Red-team complete: 22/25 caught",
        body: "3 scenarios escaped — see ProcureBot & HR Copilot.",
        tone: "warn",
      });
    }, 2600);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">
            Red Team Center
          </h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            Continuous adversarial testing — war room for agent resilience
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={runNow} disabled={running}>
          {running ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
          {running ? "Running…" : "Run Now"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        {/* Score + schedule */}
        <div className="space-y-5">
          <Card>
            <SectionTitle>Org Red-Team Score</SectionTitle>
            <div className="mt-2 flex items-end gap-2">
              <span className="tnum text-4xl font-semibold text-[var(--accent)]">
                {orgScore}
              </span>
              <span className="mb-1.5 text-sm text-[var(--text-faint)]">/ 100</span>
            </div>
            <div className="mt-3">
              <Sparkline
                data={[72, 74, 73, 78, 81, 84, orgScore]}
                color="var(--accent)"
                height={44}
              />
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-[var(--allow)]">
              <ShieldCheck size={12} /> +6 over the last 30 days
            </p>
          </Card>

          <Card>
            <SectionTitle sub="EventBridge cron">Schedule</SectionTitle>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
              <Clock size={16} className="text-[var(--accent)]" />
              <div className="flex-1">
                <p className="text-xs font-medium text-[var(--text)]">
                  Nightly at 2:00 AM UTC
                </p>
                <p className="mono text-[11px] text-[var(--text-faint)]">
                  cron(0 2 * * ? *)
                </p>
              </div>
              <button className="text-[var(--text-faint)] hover:text-[var(--text)]">
                <Pencil size={14} />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-faint)]">
              Last run completed 2026-06-24 02:00 UTC
            </p>
          </Card>
        </div>

        {/* Coverage matrix — centerpiece */}
        <Card pad={false}>
          <div className="border-b border-[var(--border)] px-4 py-3">
            <SectionTitle sub="Latest result per agent × attack type">
              Attack Coverage Matrix
            </SectionTitle>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full border-separate" style={{ borderSpacing: "4px" }}>
              <thead>
                <tr>
                  <th className="w-44" />
                  {ATTACK_TYPES.map((a) => (
                    <th
                      key={a}
                      className="px-1 pb-2 text-center align-bottom text-[10px] font-medium leading-tight text-[var(--text-faint)]"
                    >
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.agent.id}>
                    <td className="pr-2">
                      <Link
                        href={`/agents/${row.agent.id}`}
                        className="block truncate text-xs font-medium text-[var(--text)] hover:text-[var(--accent)]"
                      >
                        {row.agent.name}
                      </Link>
                    </td>
                    {row.cells.map((c, i) => {
                      const s = cellStyle(c);
                      return (
                        <td key={i}>
                          <div
                            title={`${row.agent.name} · ${ATTACK_TYPES[i]} · ${c}`}
                            className="flex h-11 items-center justify-center rounded-md transition-transform hover:scale-105"
                            style={{ background: s.bg }}
                          >
                            <s.Icon size={16} style={{ color: s.fg }} />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} style={{ color: "var(--allow)" }} /> Caught
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldX size={13} style={{ color: "var(--block)" }} /> Escaped
              </span>
              <span className="flex items-center gap-1.5">
                <Minus size={13} style={{ color: "var(--text-faint)" }} /> Not tested
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent runs */}
      <div>
        <SectionTitle sub="Drill into any run to inspect escaped scenarios">
          Recent Runs
        </SectionTitle>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {redTeamRuns.map((r) => {
            const a = agents.find((x) => x.id === r.agentId);
            return (
              <RedTeamRunCard
                key={r.id}
                run={r}
                agentName={a?.name}
                defaultOpen={r.caught < r.total}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
