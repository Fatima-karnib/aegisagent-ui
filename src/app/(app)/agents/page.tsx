import Link from "next/link";
import { Bot, Plus, ChevronRight } from "lucide-react";
import { agents, agentTimeSeries } from "@/lib/data";
import { Card, Button, Pill, Sparkline } from "@/components/ui";

function statusTone(s: string) {
  return s === "Active" ? "allow" : s === "Paused" ? "review" : "block";
}

export default function AgentsPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Agents</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            {agents.length} registered · {agents.filter((a) => a.status === "Active").length} active
          </p>
        </div>
        <Button variant="accent" size="sm">
          <Plus size={14} /> Register New Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((a, idx) => {
          const series = agentTimeSeries(a.verifications24h + 1, 14).map((p) => p.allow);
          const blockColor =
            a.blockRate > 0.04 ? "var(--block)" : a.blockRate > 0.02 ? "var(--review)" : "var(--allow)";
          return (
            <Link key={a.id} href={`/agents/${a.id}`} className="group">
              <Card className="h-full transition-colors hover:border-[var(--border-strong)]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--accent)]">
                      <Bot size={18} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                        {a.name}
                      </h3>
                      <p className="mono mt-0.5 text-[11px] text-[var(--text-faint)]">
                        {a.id}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[var(--text-faint)] transition-transform group-hover:translate-x-0.5"
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Pill tone={statusTone(a.status)}>{a.status}</Pill>
                  <Pill tone="neutral">{a.framework}</Pill>
                  <Pill tone="accent">{a.policyIds.length} policies</Pill>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-3 text-center">
                  <div>
                    <div className="tnum text-sm font-semibold text-[var(--text)]">
                      {a.verifications24h.toLocaleString()}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                      24h verifs
                    </div>
                  </div>
                  <div>
                    <div className="tnum text-sm font-semibold" style={{ color: blockColor }}>
                      {(a.blockRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                      block rate
                    </div>
                  </div>
                  <div>
                    <div className="tnum text-sm font-semibold text-[var(--accent)]">
                      {a.redTeamScore}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                      RT score
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <Sparkline data={series} color="var(--accent)" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
