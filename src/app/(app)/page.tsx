import Link from "next/link";
import {
  Activity,
  Bot,
  Inbox,
  Plus,
  ScrollText,
  Swords,
} from "lucide-react";
import {
  Card,
  StatCard,
  SectionTitle,
  Donut,
  MiniBars,
  Button,
} from "@/components/ui";
import { LiveFeed } from "@/components/LiveFeed";
import {
  dashboardMetrics,
  topBlockedActions,
  riskHeatmap,
} from "@/lib/data";

const heat = riskHeatmap();
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function heatColor(v: number) {
  const colors = [
    "var(--surface-3)",
    "color-mix(in srgb, var(--review) 30%, transparent)",
    "color-mix(in srgb, var(--review) 55%, transparent)",
    "color-mix(in srgb, var(--block) 55%, transparent)",
    "var(--block)",
  ];
  return colors[v] ?? colors[0];
}

export default function DashboardPage() {
  const m = dashboardMetrics();
  return (
    <div className="space-y-5">
      {/* Page intro */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">
            Command Center
          </h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            Real-time governance across {m.totalAgents} registered agents ·{" "}
            <span className="text-[var(--accent)]">Acme Corp</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" href="/red-team">
            <Swords size={14} /> Run Red Team
          </Button>
          <Button variant="accent" size="sm" href="/agents">
            <Plus size={14} /> Register Agent
          </Button>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Verifications Today"
          value={m.totalVerifications.toLocaleString()}
          accent="var(--accent)"
          spark={[28, 32, 30, 41, 38, 52, 48, 61, 58, 72, 69, 81]}
          sub={<span className="flex items-center gap-1"><Activity size={11} /> live</span>}
        />
        <StatCard
          label="Block Rate"
          value={`${(m.blockRate * 100).toFixed(1)}%`}
          accent="var(--block)"
          trend={{ dir: "down", value: "0.4pp", good: true }}
          sub="vs. last 7 days"
        />
        <StatCard
          label="Verification Latency"
          value={`${m.p50}ms`}
          accent="var(--info)"
          sub={`p50 · ${m.p99}ms p99 · SLA 800ms`}
        />
        <StatCard
          label="Active Agents"
          value={m.activeAgents}
          accent="var(--allow)"
          sub={`${m.totalAgents} registered total`}
        />
        <StatCard
          label="Open Human Reviews"
          value={m.openReviews}
          accent="var(--review)"
          alert={m.openReviews > 0}
          sub={<Link href="/reviews" className="text-[var(--review)] hover:underline">Go to queue →</Link>}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <LiveFeed />
        </div>

        <div className="space-y-5">
          {/* Risk heatmap */}
          <Card>
            <SectionTitle sub="Block / review density · last 7 days">
              Risk Heatmap
            </SectionTitle>
            <div className="mt-2 space-y-1">
              {heat.map((row, d) => (
                <div key={d} className="flex items-center gap-1.5">
                  <span className="w-8 shrink-0 text-[10px] text-[var(--text-faint)]">
                    {days[d]}
                  </span>
                  <div className="flex flex-1 gap-[3px]">
                    {row.map((v, h) => (
                      <span
                        key={h}
                        title={`${days[d]} ${h}:00 — intensity ${v}`}
                        className="h-3.5 flex-1 rounded-[2px]"
                        style={{ background: heatColor(v) }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-[var(--text-faint)]">
              less
              {[0, 1, 2, 3, 4].map((v) => (
                <span
                  key={v}
                  className="h-2.5 w-2.5 rounded-[2px]"
                  style={{ background: heatColor(v) }}
                />
              ))}
              more
            </div>
          </Card>

          {/* Top blocked */}
          <Card>
            <SectionTitle sub="Most frequently blocked tool calls">
              Top Blocked Actions
            </SectionTitle>
            <div className="mt-3">
              <MiniBars items={topBlockedActions.map((t) => ({ label: t.tool, value: t.blocks }))} />
            </div>
          </Card>

          {/* Policy coverage */}
          <Card>
            <SectionTitle sub="Actions covered by ≥ 1 policy">
              Policy Coverage
            </SectionTitle>
            <div className="mt-2 flex justify-center">
              <Donut
                size={130}
                segments={[
                  { value: 94, color: "var(--accent)", label: "Covered" },
                  { value: 6, color: "var(--surface-3)", label: "Uncovered" },
                ]}
                centerLabel="94%"
                centerSub="covered"
              />
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <SectionTitle>Quick Actions</SectionTitle>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button variant="subtle" size="sm" href="/agents" className="justify-start">
                <Bot size={14} /> New Agent
              </Button>
              <Button variant="subtle" size="sm" href="/policies/new" className="justify-start">
                <ScrollText size={14} /> Write Policy
              </Button>
              <Button variant="subtle" size="sm" href="/red-team" className="justify-start">
                <Swords size={14} /> Run Red Team
              </Button>
              <Button variant="subtle" size="sm" href="/reviews" className="justify-start">
                <Inbox size={14} /> Reviews
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
