import Link from "next/link";
import { Plus, ScrollText, Filter } from "lucide-react";
import { policies } from "@/lib/data";
import { Card, Button, Pill, Table, Th, Td } from "@/components/ui";

export default function PoliciesPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Policy Studio</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            Plain-English rules compiled to Cedar + formally verified
          </p>
        </div>
        <Button variant="accent" size="sm" href="/policies/new">
          <Plus size={14} /> New Policy
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
          <Filter size={13} /> Filter:
        </span>
        {["All types", "Cedar", "Formal Logic", "Natural Language"].map((f, i) => (
          <button
            key={f}
            className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)] hover:border-[var(--border-strong)] data-[active=true]:bg-[var(--accent-soft)] data-[active=true]:text-[var(--accent)]"
            data-active={i === 0}
          >
            {f}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-[var(--border)]" />
        {["EU AI Act", "ISO 42001", "SOC 2"].map((f) => (
          <button
            key={f}
            className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)] hover:border-[var(--border-strong)]"
          >
            {f}
          </button>
        ))}
      </div>

      <Card pad={false}>
        <Table>
          <thead>
            <tr>
              <Th>Policy</Th>
              <Th>Type</Th>
              <Th className="text-center">Bound Agents</Th>
              <Th>Frameworks</Th>
              <Th>Status</Th>
              <Th>Last Modified</Th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--surface-2)]">
                <Td>
                  <Link
                    href={`/policies/new?id=${p.id}`}
                    className="flex items-center gap-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]">
                      <ScrollText size={15} />
                    </span>
                    <span>
                      <span className="block font-medium text-[var(--text)]">
                        {p.name}
                      </span>
                      <span className="mono text-[11px] text-[var(--text-faint)]">
                        {p.id}
                      </span>
                    </span>
                  </Link>
                </Td>
                <Td>{p.type}</Td>
                <Td className="tnum text-center">{p.boundAgents.length}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {p.frameworks.map((f) => (
                      <Pill key={f} tone="info">
                        {f}
                      </Pill>
                    ))}
                  </div>
                </Td>
                <Td>
                  <Pill tone={p.status === "Active" ? "allow" : "review"}>
                    {p.status}
                  </Pill>
                </Td>
                <Td>{p.updated}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
