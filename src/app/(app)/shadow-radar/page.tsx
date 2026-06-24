"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { shadowAgents } from "@/lib/data";
import { Card, Button, Pill, Table, Th, Td, HashChip, SectionTitle } from "@/components/ui";
import { useToast } from "@/components/providers";

export default function ShadowRadarPage() {
  const { push } = useToast();
  const [registered, setRegistered] = useState<Set<string>>(new Set());
  const unregisteredCount = shadowAgents.filter(
    (s) => s.status === "Unregistered" && !registered.has(s.id)
  ).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">
          Shadow Agent Radar
        </h1>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          Discovering AI agents in your AWS account via CloudTrail, VPC Flow &amp;
          LLM egress
        </p>
      </div>

      {unregisteredCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--block)_40%,transparent)] bg-[var(--block-soft)] px-4 py-3">
          <AlertTriangle size={18} className="text-[var(--block)]" />
          <p className="flex-1 text-sm text-[var(--text)]">
            <strong>{unregisteredCount} unregistered agents detected</strong> in
            your AWS account. Register them to ensure governance coverage.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        {/* Radar visual */}
        <Card>
          <SectionTitle sub="Detection density by source">Radar</SectionTitle>
          <div className="relative mx-auto mt-2 aspect-square w-full max-w-[240px]">
            <svg viewBox="0 0 200 200" className="h-full w-full">
              {[30, 60, 90].map((r) => (
                <circle
                  key={r}
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              ))}
              <line x1="100" y1="10" x2="100" y2="190" stroke="var(--border)" strokeWidth="1" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="var(--border)" strokeWidth="1" />
              {/* sweep */}
              <defs>
                <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M100 100 L100 12 A88 88 0 0 1 168 60 Z" fill="url(#sweep)">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 100 100"
                  to="360 100 100"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </path>
              {/* blips */}
              {shadowAgents.map((s, i) => {
                const angle = (i / shadowAgents.length) * Math.PI * 2;
                const rad = 30 + (i % 3) * 28;
                const x = 100 + Math.cos(angle) * rad;
                const y = 100 + Math.sin(angle) * rad;
                const reg = s.status === "Registered" || registered.has(s.id);
                return (
                  <circle
                    key={s.id}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={reg ? "var(--allow)" : "var(--block)"}
                  >
                    {!reg && (
                      <animate
                        attributeName="opacity"
                        values="1;0.3;1"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                );
              })}
            </svg>
          </div>
          <div className="mt-3 flex justify-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--allow)]" /> Registered
            </span>
            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--block)]" /> Unregistered
            </span>
          </div>
        </Card>

        {/* Detected table */}
        <Card pad={false}>
          <div className="border-b border-[var(--border)] px-4 py-3">
            <SectionTitle sub={`${shadowAgents.length} agents detected`}>
              Detected Agents
            </SectionTitle>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Fingerprint</Th>
                <Th>Source</Th>
                <Th>Detection</Th>
                <Th>First / Last Seen</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {shadowAgents.map((s) => {
                const reg = s.status === "Registered" || registered.has(s.id);
                return (
                  <tr key={s.id} className="hover:bg-[var(--surface-2)]">
                    <Td><HashChip value={s.fingerprint} /></Td>
                    <Td className="mono text-[11px] text-[var(--text)]">{s.source}</Td>
                    <Td>
                      <Pill tone="neutral">{s.method}</Pill>
                    </Td>
                    <Td className="text-[11px]">
                      {s.firstSeen} → {s.lastSeen}
                    </Td>
                    <Td>
                      {reg ? (
                        <Pill tone="allow">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={10} /> Registered
                          </span>
                        </Pill>
                      ) : (
                        <Pill tone="block">
                          <span className="flex items-center gap-1">
                            <AlertTriangle size={10} /> Unregistered
                          </span>
                        </Pill>
                      )}
                    </Td>
                    <Td>
                      {!reg && (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            setRegistered((prev) => new Set(prev).add(s.id));
                            push({
                              title: "Agent registered",
                              body: `${s.fingerprint.slice(0, 16)}… is now under AegisAgent governance.`,
                              tone: "success",
                            });
                          }}
                        >
                          Register
                        </Button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
