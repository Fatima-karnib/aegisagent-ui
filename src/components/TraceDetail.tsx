"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  ChevronDown,
  Gavel,
  Shield,
  Swords,
  Hash,
  Database,
  Flag,
  ScrollText,
  Scale,
} from "lucide-react";
import type { ActionEvent } from "@/lib/types";
import { VerdictBadge, Button } from "@/components/ui";

function fmtArgs(tool: string, args: Record<string, unknown>) {
  const inner = Object.entries(args)
    .map(([k, v]) => `${k}=${typeof v === "string" ? `"${v}"` : v}`)
    .join(", ");
  return `${tool}(${inner})`;
}

const stepColor = (v: ActionEvent["verdict"]) =>
  v === "BLOCK" ? "var(--block)" : v === "HUMAN_REVIEW" ? "var(--review)" : "var(--allow)";

export function TraceDetail({
  event,
  onClose,
}: {
  event: ActionEvent;
  onClose?: () => void;
}) {
  const verdictColor = stepColor(event.verdict);
  const hasDebate = !!event.debate;

  const steps = [
    { name: "SDK intercept", detail: "@aegis.verify decorator", ms: 2, ok: true },
    { name: "API Gateway + Auth", detail: "mTLS · tenant resolved", ms: 6, ok: true },
    {
      name: "Rules Engine (Cedar)",
      detail: hasDebate
        ? "ambiguous → escalated to debate"
        : event.verdict === "ALLOW"
          ? "matched permit policy"
          : "matched forbid policy",
      ms: event.rulesMs,
      ok: !hasDebate,
    },
  ];

  return (
    <div className="flex max-h-[88vh] flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <VerdictBadge verdict={event.verdict} />
            <span className="text-xs text-[var(--text-faint)]">
              {new Date(event.ts).toLocaleString()}
            </span>
          </div>
          <Link
            href={`/agents/${event.agentId}`}
            className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent)]"
          >
            {event.agentName}
          </Link>
          <p className="mono mt-1 break-all text-[12px] text-[var(--text-muted)]">
            {fmtArgs(event.tool, event.args)}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-0 overflow-y-auto lg:grid-cols-[1fr_300px]">
        {/* Waterfall */}
        <div className="p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">
            Verification Waterfall · {event.latencyMs}ms total
          </h3>

          <div className="relative space-y-0">
            {steps.map((s, i) => (
              <WaterfallRow
                key={i}
                name={s.name}
                detail={s.detail}
                ms={s.ms}
                total={event.latencyMs}
                color={s.ok ? "var(--allow)" : "var(--review)"}
                offset={steps.slice(0, i).reduce((a, b) => a + b.ms, 0)}
              />
            ))}

            {hasDebate && event.debate && (
              <div className="my-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <div className="mb-3 flex items-center gap-2">
                  <Scale size={14} className="text-[var(--accent)]" />
                  <span className="text-xs font-semibold text-[var(--text)]">
                    3-Agent Debate
                  </span>
                  <span className="mono ml-auto text-[11px] text-[var(--text-faint)]">
                    {event.debateMs}ms
                  </span>
                </div>
                <DebateBlock
                  icon={<Swords size={13} />}
                  role="Prosecutor"
                  color="var(--block)"
                  text={event.debate.prosecutor}
                  defaultOpen
                />
                <DebateBlock
                  icon={<Shield size={13} />}
                  role="Defender"
                  color="var(--info)"
                  text={event.debate.defender}
                />
                <DebateBlock
                  icon={<Gavel size={13} />}
                  role="Judge"
                  color={verdictColor}
                  text={event.debate.judge}
                  highlight
                  defaultOpen
                />
              </div>
            )}

            <WaterfallRow
              name="Decision → DynamoDB"
              detail="audit record written + hashed"
              ms={4}
              total={event.latencyMs}
              color="var(--info)"
              offset={event.latencyMs - 8}
            />
            <WaterfallRow
              name="Response → agent"
              detail={`verdict: ${event.verdict}`}
              ms={4}
              total={event.latencyMs}
              color={verdictColor}
              offset={event.latencyMs - 4}
              last
            />
          </div>

          {event.reason && (
            <div
              className="mt-4 rounded-lg p-3 text-xs"
              style={{
                background: `color-mix(in srgb, ${verdictColor} 10%, transparent)`,
                border: `1px solid ${verdictColor}33`,
                color: "var(--text-muted)",
              }}
            >
              <span className="font-semibold" style={{ color: verdictColor }}>
                Why {event.verdict}:{" "}
              </span>
              {event.reason}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 border-t border-[var(--border)] bg-[var(--surface-2)] p-5 lg:border-l lg:border-t-0">
          {event.policyName && (
            <SideItem icon={<ScrollText size={13} />} label="Cited Policy">
              <Link
                href="/policies"
                className="text-xs text-[var(--accent)] hover:underline"
              >
                {event.policyName}
              </Link>
              {event.policyId && (
                <div className="mono mt-0.5 text-[11px] text-[var(--text-faint)]">
                  {event.policyId}
                </div>
              )}
            </SideItem>
          )}
          {event.regRef && (
            <SideItem icon={<Shield size={13} />} label="Regulation">
              <span className="text-xs text-[var(--text-muted)]">
                {event.regRef}
              </span>
            </SideItem>
          )}
          <SideItem icon={<Hash size={13} />} label="Audit Hash">
            <span className="mono break-all text-[11px] text-[var(--text-muted)]">
              {event.hash}
            </span>
          </SideItem>
          <SideItem icon={<Database size={13} />} label="S3 Object Lock URI">
            <span className="mono break-all text-[11px] text-[var(--text-muted)]">
              {event.s3Uri}
            </span>
          </SideItem>
          <div className="pt-1">
            <Button variant="ghost" size="sm" className="w-full">
              <Flag size={13} /> Flag for Review
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function WaterfallRow({
  name,
  detail,
  ms,
  total,
  color,
  offset,
  last,
}: {
  name: string;
  detail: string;
  ms: number;
  total: number;
  color: string;
  offset: number;
  last?: boolean;
}) {
  const widthPct = Math.max(2, (ms / total) * 100);
  const leftPct = (offset / total) * 100;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="flex w-44 shrink-0 items-start gap-2">
        <div className="flex flex-col items-center">
          <span
            className="mt-1 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--surface)]"
            style={{ background: color }}
          />
          {!last && <span className="my-0.5 h-4 w-px bg-[var(--border)]" />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-[var(--text)]">
            {name}
          </p>
          <p className="truncate text-[11px] text-[var(--text-faint)]">
            {detail}
          </p>
        </div>
      </div>
      <div className="relative h-2 flex-1 rounded-full bg-[var(--surface-3)]">
        <div
          className="absolute h-full rounded-full"
          style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: color }}
        />
      </div>
      <span className="mono w-12 shrink-0 text-right text-[11px] text-[var(--text-muted)]">
        {ms}ms
      </span>
    </div>
  );
}

function DebateBlock({
  icon,
  role,
  color,
  text,
  highlight,
  defaultOpen,
}: {
  icon: React.ReactNode;
  role: string;
  color: string;
  text: string;
  highlight?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div
      className="mb-1.5 overflow-hidden rounded-md last:mb-0"
      style={{
        background: highlight
          ? `color-mix(in srgb, ${color} 9%, transparent)`
          : "var(--surface)",
        border: `1px solid ${highlight ? color + "44" : "var(--border)"}`,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left"
      >
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {role}
        </span>
        <ChevronDown
          size={13}
          className="ml-auto text-[var(--text-faint)] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      {open && (
        <p className="px-2.5 pb-2.5 text-[12px] leading-relaxed text-[var(--text-muted)]">
          {text}
        </p>
      )}
    </div>
  );
}

function SideItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
        <span className="text-[var(--accent)]">{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}
