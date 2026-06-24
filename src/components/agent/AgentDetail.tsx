"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  Bot,
  Power,
  Swords,
  ChevronRight,
  Download,
  ScrollText,
  ShieldCheck,
  Search,
} from "lucide-react";
import type { Agent, ActionEvent } from "@/lib/types";
import {
  policyById,
  redTeamRuns,
  seedFeed,
  feedTemplates,
  agentTimeSeries,
} from "@/lib/data";
import {
  Card,
  Button,
  Pill,
  VerdictBadge,
  StackedBar,
  Table,
  Th,
  Td,
  SectionTitle,
  Sparkline,
  HashChip,
} from "@/components/ui";
import { MultiAreaChart } from "@/components/MultiAreaChart";
import { useToast, useTrace } from "@/components/providers";
import { RedTeamRunCard } from "@/components/RedTeamRun";

const TABS = [
  "Overview",
  "Live Trace",
  "Policies",
  "Red Team Results",
  "Audit Trail",
] as const;
type Tab = (typeof TABS)[number];

export function AgentDetail({ agent }: { agent: Agent }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [status, setStatus] = useState(agent.status);
  const [killOpen, setKillOpen] = useState(false);
  const { push } = useToast();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/agents"
          className="mb-3 inline-flex items-center gap-1 text-xs text-[var(--text-faint)] hover:text-[var(--text)]"
        >
          ← All agents
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent)]">
              <Bot size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-semibold text-[var(--text)]">
                  {agent.name}
                </h1>
                <Pill tone={status === "Active" ? "allow" : status === "Paused" ? "review" : "block"}>
                  {status}
                </Pill>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                <span className="mono">{agent.id}</span>
                <span>·</span>
                <span>{agent.framework}</span>
                <span>·</span>
                <span>Registered {agent.registered}</span>
                <span>·</span>
                <span>{agent.owner}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="accent"
              size="sm"
              onClick={() =>
                push({
                  title: "Red-team queued",
                  body: `Adversarial suite running against ${agent.name}`,
                  tone: "info",
                })
              }
            >
              <Swords size={14} /> Red-Team This Agent
            </Button>
            <Button variant="danger" size="sm" onClick={() => setKillOpen(true)}>
              <Power size={14} /> Kill Switch
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors",
              tab === t
                ? "text-[var(--text)]"
                : "text-[var(--text-faint)] hover:text-[var(--text-muted)]"
            )}
          >
            {t}
            {tab === t && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t bg-[var(--accent)]" />
            )}
          </button>
        ))}
      </div>

      {tab === "Overview" && <OverviewTab agent={agent} />}
      {tab === "Live Trace" && <LiveTraceTab agent={agent} />}
      {tab === "Policies" && <PoliciesTab agent={agent} />}
      {tab === "Red Team Results" && <RedTeamTab agent={agent} />}
      {tab === "Audit Trail" && <AuditTab agent={agent} />}

      {/* Kill switch confirm */}
      {killOpen && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setKillOpen(false)}
        >
          <div
            className="card w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--block-soft)] text-[var(--block)]">
                <Power size={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text)]">
                  Activate Kill Switch?
                </h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  This immediately blocks <strong>all</strong> actions from{" "}
                  {agent.name}. In-flight tool calls will receive a BLOCK verdict
                  until the agent is manually reactivated.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setKillOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setStatus("Killed");
                  setKillOpen(false);
                  push({
                    title: "Kill switch activated",
                    body: `${agent.name} is now blocking all actions.`,
                    tone: "danger",
                  });
                }}
              >
                <Power size={14} /> Kill all actions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Overview ---------------- */
function OverviewTab({ agent }: { agent: Agent }) {
  const series = agentTimeSeries(agent.verifications24h + 3, 24);
  const allow = Math.round(agent.verifications24h * (1 - agent.blockRate - 0.02));
  const block = Math.round(agent.verifications24h * agent.blockRate);
  const review = Math.round(agent.verifications24h * 0.02);

  const topActions = [
    { tool: "process_refund", count: 8420, blockRate: 0.04 },
    { tool: "lookup_order", count: 5210, blockRate: 0 },
    { tool: "send_email", count: 3110, blockRate: 0.02 },
    { tool: "issue_credit", count: 1690, blockRate: 0.06 },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Card>
          <SectionTitle
            sub="Allow vs. block vs. human_review"
            action={
              <div className="flex gap-1 rounded-lg border border-[var(--border)] p-0.5 text-xs">
                {["24h", "7d", "30d"].map((r, i) => (
                  <span
                    key={r}
                    className={clsx(
                      "rounded-md px-2 py-0.5",
                      i === 0
                        ? "bg-[var(--surface-3)] text-[var(--text)]"
                        : "text-[var(--text-faint)]"
                    )}
                  >
                    {r}
                  </span>
                ))}
              </div>
            }
          >
            Action Volume
          </SectionTitle>
          <MultiAreaChart
            data={series}
            series={[
              { key: "allow", color: "var(--allow)", label: "Allow" },
              { key: "review", color: "var(--review)", label: "Human Review" },
              { key: "block", color: "var(--block)", label: "Block" },
            ]}
          />
          <div className="mt-2 flex gap-5 text-xs">
            {[
              { c: "var(--allow)", l: "Allow" },
              { c: "var(--review)", l: "Human Review" },
              { c: "var(--block)", l: "Block" },
            ].map((x) => (
              <span key={x.l} className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: x.c }} />
                {x.l}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle sub="Per-action block rate, last 24h">Top Actions</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>Tool Call</Th>
                <Th className="text-right">Volume</Th>
                <Th className="text-right">Block Rate</Th>
              </tr>
            </thead>
            <tbody>
              {topActions.map((a) => (
                <tr key={a.tool}>
                  <Td className="mono text-[var(--text)]">{a.tool}</Td>
                  <Td className="tnum text-right">{a.count.toLocaleString()}</Td>
                  <Td className="text-right">
                    <span
                      style={{
                        color: a.blockRate > 0.03 ? "var(--block)" : "var(--text-muted)",
                      }}
                    >
                      {(a.blockRate * 100).toFixed(1)}%
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <SectionTitle>Verdict Breakdown</SectionTitle>
          <div className="mt-3">
            <StackedBar
              segments={[
                { value: allow, color: "var(--allow)", label: "Allow" },
                { value: review, color: "var(--review)", label: "Review" },
                { value: block, color: "var(--block)", label: "Block" },
              ]}
            />
          </div>
        </Card>

        <Card>
          <SectionTitle>Red-Team Score</SectionTitle>
          <div className="mt-1 flex items-end gap-2">
            <span className="tnum text-3xl font-semibold text-[var(--accent)]">
              {agent.redTeamScore}
            </span>
            <span className="mb-1 text-xs text-[var(--text-faint)]">/ 100</span>
          </div>
          <div className="mt-2">
            <Sparkline data={[68, 71, 70, 76, 79, 84, agent.redTeamScore]} color="var(--accent)" />
          </div>
        </Card>

        <Card>
          <SectionTitle sub="Cedar policies applied">Assigned Policies</SectionTitle>
          <div className="mt-2 space-y-1.5">
            {agent.policyIds.map((pid) => {
              const p = policyById(pid);
              if (!p) return null;
              return (
                <Link
                  key={pid}
                  href="/policies"
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 hover:border-[var(--border-strong)]"
                >
                  <ScrollText size={14} className="text-[var(--accent)]" />
                  <span className="flex-1 text-xs text-[var(--text)]">{p.name}</span>
                  <ChevronRight size={13} className="text-[var(--text-faint)]" />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Live Trace ---------------- */
function LiveTraceTab({ agent }: { agent: Agent }) {
  const { open } = useTrace();
  const events = useMemo<ActionEvent[]>(() => {
    const base = seedFeed.filter((e) => e.agentId === agent.id);
    const extra = feedTemplates
      .filter((t) => t.agentId === agent.id)
      .map((t, i) => ({
        ...t,
        id: `lt_${agent.id}_${i}`,
        ts: new Date(Date.now() - 1000 * (120 + i * 47)).toISOString(),
        hash: `sha256:${(agent.id + i).padEnd(20, "0").slice(0, 20)}`,
        s3Uri: `s3://aegis-audit-prod/${agent.id.replace("ag_", "")}/lt_${i}.json`,
      })) as ActionEvent[];
    return [...base, ...extra];
  }, [agent.id]);

  return (
    <Card pad={false}>
      <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3">
        <span className="live-dot h-2 w-2 rounded-full bg-[var(--accent)]" />
        <h2 className="text-sm font-semibold text-[var(--text)]">
          Live Trace — {agent.name}
        </h2>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {events.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-[var(--text-faint)]">
            This agent is paused — no live traces.
          </p>
        )}
        {events.map((e) => (
          <button
            key={e.id}
            onClick={() => open(e)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-2)]"
          >
            <span className="mono w-14 shrink-0 text-[11px] text-[var(--text-faint)]">
              {new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="mono min-w-0 flex-1 truncate text-[12px] text-[var(--text-muted)]">
              {e.tool}({Object.entries(e.args).slice(0, 3).map(([k, v]) => `${k}=${typeof v === "string" ? `"${v}"` : v}`).join(", ")})
            </span>
            <Pill tone="neutral">{e.layer === "3-Agent Debate" ? "Debate" : "Rules"}</Pill>
            <span className="mono hidden w-14 text-right text-[11px] text-[var(--text-faint)] sm:block">
              {e.latencyMs}ms
            </span>
            <VerdictBadge verdict={e.verdict} size="sm" />
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- Policies ---------------- */
function PoliciesTab({ agent }: { agent: Agent }) {
  return (
    <Card pad={false}>
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--text)]">Bound Policies</h2>
        <Button variant="accent" size="sm" href="/policies/new">
          Add Policy
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Policy</Th>
            <Th>Cedar ID</Th>
            <Th>Type</Th>
            <Th>Status</Th>
            <Th>Updated</Th>
          </tr>
        </thead>
        <tbody>
          {agent.policyIds.map((pid) => {
            const p = policyById(pid);
            if (!p) return null;
            return (
              <tr key={pid} className="hover:bg-[var(--surface-2)]">
                <Td className="font-medium text-[var(--text)]">
                  <Link href="/policies" className="hover:text-[var(--accent)]">
                    {p.name}
                  </Link>
                </Td>
                <Td className="mono text-[11px]">{p.id}</Td>
                <Td>{p.type}</Td>
                <Td>
                  <Pill tone={p.status === "Active" ? "allow" : "review"}>{p.status}</Pill>
                </Td>
                <Td>{p.updated}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
}

/* ---------------- Red Team ---------------- */
function RedTeamTab({ agent }: { agent: Agent }) {
  const runs = redTeamRuns.filter((r) => r.agentId === agent.id);
  if (runs.length === 0)
    return (
      <Card>
        <p className="py-10 text-center text-sm text-[var(--text-faint)]">
          No red-team runs yet for this agent.
        </p>
      </Card>
    );
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        {runs.map((r) => (
          <RedTeamRunCard key={r.id} run={r} agentName={agent.name} />
        ))}
      </div>
      <Card className="h-fit">
        <SectionTitle sub="Score should trend up as policies harden">
          Score Trend
        </SectionTitle>
        <div className="mt-1 flex items-end gap-2">
          <span className="tnum text-3xl font-semibold text-[var(--accent)]">
            {agent.redTeamScore}
          </span>
          <span className="mb-1 flex items-center gap-1 text-xs text-[var(--allow)]">
            <ShieldCheck size={12} /> improving
          </span>
        </div>
        <div className="mt-3">
          <Sparkline
            data={[60, 64, 68, 71, 79, 84, agent.redTeamScore]}
            color="var(--accent)"
            height={48}
          />
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Audit Trail ---------------- */
function AuditTab({ agent }: { agent: Agent }) {
  const [q, setQ] = useState("");
  const { push } = useToast();
  const rows = useMemo(() => {
    const r = seedFeed
      .filter((e) => e.agentId === agent.id || true)
      .filter((e) => e.agentId === agent.id);
    const synth = Array.from({ length: 14 }, (_, i) => {
      const base = seedFeed[i % seedFeed.length];
      return {
        ...base,
        id: `au_${agent.id}_${i}`,
        agentId: agent.id,
        ts: new Date(Date.now() - 1000 * 60 * (i * 13 + 5)).toISOString(),
        hash: `sha256:${(i * 7919).toString(16).padStart(10, "0")}${(i * 104729).toString(16).padStart(10, "0")}`,
      };
    });
    return [...r, ...synth].filter(
      (e) =>
        !q ||
        e.tool.includes(q) ||
        e.verdict.toLowerCase().includes(q.toLowerCase())
    );
  }, [agent.id, q]);

  return (
    <Card pad={false}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5">
          <Search size={14} className="text-[var(--text-faint)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by tool or verdict…"
            className="w-48 bg-transparent text-xs text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => push({ title: "Exported audit_trail.json", tone: "success" })}>
            <Download size={13} /> JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={() => push({ title: "Exported audit_trail.csv", tone: "success" })}>
            <Download size={13} /> CSV
          </Button>
        </div>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Timestamp</Th>
            <Th>Action</Th>
            <Th>Verdict</Th>
            <Th>Policy</Th>
            <Th>Reg Ref</Th>
            <Th>Hash</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id} className="hover:bg-[var(--surface-2)]">
              <Td className="mono whitespace-nowrap text-[11px]">
                {new Date(e.ts).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </Td>
              <Td className="mono text-[11px] text-[var(--text)]">{e.tool}</Td>
              <Td><VerdictBadge verdict={e.verdict} size="sm" /></Td>
              <Td className="text-[11px]">{e.policyName ?? "—"}</Td>
              <Td className="text-[11px]">{e.regRef ?? "—"}</Td>
              <Td><HashChip value={e.hash} /></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
