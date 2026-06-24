"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  Check,
  X,
  Clock,
  Inbox,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import type { ReviewItem } from "@/lib/types";
import { reviewQueue, resolvedReviews } from "@/lib/data";
import { Card, Button, Pill, VerdictBadge, EmptyState } from "@/components/ui";
import { useToast } from "@/components/providers";

function fmtArgs(tool: string, args: Record<string, unknown>) {
  return `${tool}(${Object.entries(args)
    .map(([k, v]) => `${k}=${typeof v === "string" ? `"${v}"` : v}`)
    .join(", ")})`;
}

function slaTone(min: number) {
  if (min > 20) return { c: "var(--block)", label: "SLA breach" };
  if (min > 10) return { c: "var(--review)", label: "approaching SLA" };
  return { c: "var(--text-faint)", label: "within SLA" };
}

export default function ReviewsPage() {
  const { push } = useToast();
  const [tab, setTab] = useState<"pending" | "resolved">("pending");
  const [queue, setQueue] = useState(reviewQueue);
  const [resolved, setResolved] = useState(resolvedReviews);

  const decide = (item: ReviewItem, decision: "Approved" | "Rejected") => {
    setQueue((q) => q.filter((x) => x.id !== item.id));
    setResolved((r) => [
      {
        ...item,
        resolved: {
          decision,
          by: "mohamad.karnib@acme.io",
          at: new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        },
      },
      ...r,
    ]);
    push({
      title: `Action ${decision.toLowerCase()}`,
      body: `${item.agentName} · ${item.tool}`,
      tone: decision === "Approved" ? "success" : "danger",
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">
          Human Review Queue
        </h1>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          Actions routed to a human before they execute
        </p>
      </div>

      <div className="flex gap-1 border-b border-[var(--border)]">
        {(["pending", "resolved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "relative px-3.5 py-2.5 text-sm font-medium capitalize transition-colors",
              tab === t ? "text-[var(--text)]" : "text-[var(--text-faint)] hover:text-[var(--text-muted)]"
            )}
          >
            {t}
            <span className="ml-1.5 text-xs text-[var(--text-faint)]">
              {t === "pending" ? queue.length : resolved.length}
            </span>
            {tab === t && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t bg-[var(--accent)]" />
            )}
          </button>
        ))}
      </div>

      {tab === "pending" &&
        (queue.length === 0 ? (
          <EmptyState
            icon={<Inbox size={22} />}
            title="Queue is clear"
            body="No actions are awaiting human review. New HUMAN_REVIEW verdicts will land here in real time."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {queue.map((item) => {
              const sla = slaTone(item.waitingMin);
              return (
                <Card key={item.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <VerdictBadge verdict="HUMAN_REVIEW" size="sm" />
                      <Link
                        href={`/agents/${item.agentId}`}
                        className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent)]"
                      >
                        {item.agentName}
                      </Link>
                    </div>
                    <span
                      className="flex items-center gap-1 text-[11px]"
                      style={{ color: sla.c }}
                    >
                      <Clock size={11} /> {item.waitingMin}m · {sla.label}
                    </span>
                  </div>

                  <pre className="mono mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2.5 text-[11px] text-[var(--text-muted)]">
                    {fmtArgs(item.tool, item.args)}
                  </pre>

                  <div className="mt-3 rounded-lg bg-[var(--surface-2)] p-3">
                    <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
                      <MessageSquare size={11} /> Why it was routed
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      <span className="font-medium text-[var(--text)]">
                        {item.policyName}:{" "}
                      </span>
                      {item.judgeReason}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-[var(--border)] pt-3">
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => decide(item, "Rejected")}
                    >
                      <X size={14} /> Reject
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      className="flex-1"
                      onClick={() => decide(item, "Approved")}
                    >
                      <Check size={14} /> Approve
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ))}

      {tab === "resolved" && (
        <Card pad={false}>
          <div className="divide-y divide-[var(--border)]">
            {resolved.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <CheckCircle2
                  size={16}
                  style={{
                    color:
                      item.resolved?.decision === "Approved"
                        ? "var(--allow)"
                        : "var(--block)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--text)]">
                    {item.agentName}{" "}
                    <span className="mono text-[11px] text-[var(--text-faint)]">
                      · {item.tool}
                    </span>
                  </p>
                  <p className="text-[11px] text-[var(--text-faint)]">
                    {item.resolved?.by} · {item.resolved?.at}
                  </p>
                </div>
                <Pill tone={item.resolved?.decision === "Approved" ? "allow" : "block"}>
                  {item.resolved?.decision}
                </Pill>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
