"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ChevronRight, Pause, Play, Bot } from "lucide-react";
import type { ActionEvent } from "@/lib/types";
import { feedTemplates, seedFeed } from "@/lib/data";
import { VerdictBadge } from "@/components/ui";
import { useTrace } from "@/components/providers";

function fmtArgs(tool: string, args: Record<string, unknown>) {
  const inner = Object.entries(args)
    .slice(0, 4)
    .map(([k, v]) => `${k}=${typeof v === "string" ? `"${v}"` : v}`)
    .join(", ");
  return `${tool}(${inner})`;
}

let counter = 0;
function synth(): ActionEvent {
  const t = feedTemplates[Math.floor(Math.random() * feedTemplates.length)];
  counter += 1;
  const id = `ev_live_${Date.now()}_${counter}`;
  const jitter = Math.round((Math.random() - 0.5) * (t.debateMs ? 60 : 12));
  return {
    ...t,
    id,
    ts: new Date().toISOString(),
    latencyMs: Math.max(8, t.latencyMs + jitter),
    hash: `sha256:${Math.random().toString(16).slice(2, 12)}${Math.random()
      .toString(16)
      .slice(2, 12)}`,
    s3Uri: `s3://aegis-audit-prod/${t.agentId.replace("ag_", "")}/2026-06-24/${id}.json`,
    debate: t.verdict === "ALLOW" ? undefined : (t as ActionEvent).debate,
  };
}

function timeAgo(ts: string) {
  const s = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

export function LiveFeed() {
  const [events, setEvents] = useState<ActionEvent[]>(seedFeed);
  const [paused, setPaused] = useState(false);
  const [, setTick] = useState(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const { open } = useTrace();

  useEffect(() => {
    const stream = setInterval(() => {
      if (pausedRef.current) return;
      setEvents((prev) => [synth(), ...prev].slice(0, 40));
    }, 2600);
    const clock = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(stream);
      clearInterval(clock);
    };
  }, []);

  return (
    <div className="card overflow-hidden" style={{ padding: 0 }}>
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="live-dot h-2 w-2 rounded-full bg-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Live Action Feed
          </h2>
          <span className="text-xs text-[var(--text-faint)]">
            intercepting every tool call · &lt; 800ms SLA
          </span>
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      <div className="max-h-[640px] divide-y divide-[var(--border)] overflow-y-auto">
        {events.map((e, i) => (
          <FeedRow key={e.id} e={e} fresh={i === 0} onOpen={() => open(e)} />
        ))}
      </div>
    </div>
  );
}

function FeedRow({
  e,
  fresh,
  onOpen,
}: {
  e: ActionEvent;
  fresh: boolean;
  onOpen: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={clsx(
        fresh && "row-enter",
        fresh && e.verdict === "BLOCK" && "row-block-flash"
      )}
    >
      <button
        onClick={() => setExpanded((x) => !x)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--surface-2)]"
      >
        <ChevronRight
          size={14}
          className="shrink-0 text-[var(--text-faint)] transition-transform"
          style={{ transform: expanded ? "rotate(90deg)" : "none" }}
        />
        <span className="mono w-16 shrink-0 text-[11px] text-[var(--text-faint)]">
          {timeAgo(e.ts)}
        </span>
        <span className="flex w-44 shrink-0 items-center gap-1.5">
          <Bot size={13} className="text-[var(--text-faint)]" />
          <span className="truncate text-xs font-medium text-[var(--text)]">
            {e.agentName}
          </span>
        </span>
        <span className="mono min-w-0 flex-1 truncate text-[12px] text-[var(--text-muted)]">
          {fmtArgs(e.tool, e.args)}
        </span>
        <span className="mono hidden w-14 shrink-0 text-right text-[11px] text-[var(--text-faint)] sm:block">
          {e.latencyMs}ms
        </span>
        <span className="shrink-0">
          <VerdictBadge verdict={e.verdict} size="sm" />
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3 pl-12">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                Payload
              </p>
              <pre className="mono overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[11px] text-[var(--text-muted)]">
                {JSON.stringify(e.args, null, 2)}
              </pre>
            </div>
            <div className="space-y-1.5 text-xs">
              <Row k="Layer" v={e.layer} />
              {e.policyName && <Row k="Policy" v={e.policyName} />}
              {e.regRef && <Row k="Regulation" v={e.regRef} />}
              <Row k="Latency" v={`Rules ${e.rulesMs}ms · Debate ${e.debateMs}ms · Total ${e.latencyMs}ms`} />
              <Row k="Hash" v={e.hash} mono />
              <div className="pt-1.5">
                <button
                  onClick={onOpen}
                  className="text-xs font-medium text-[var(--accent)] hover:underline"
                >
                  View full trace →
                </button>
                <Link
                  href={`/agents/${e.agentId}`}
                  className="ml-4 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  Open agent
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="w-20 shrink-0 text-[var(--text-faint)]">{k}</span>
      <span
        className={clsx(
          "min-w-0 break-all text-[var(--text-muted)]",
          mono && "mono text-[11px]"
        )}
      >
        {v}
      </span>
    </div>
  );
}
