"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  Building2,
  Users,
  Plug,
  KeyRound,
  CreditCard,
  Bell,
  Plus,
  Copy,
  Trash2,
} from "lucide-react";
import { Card, Button, Pill, SectionTitle, Table, Th, Td } from "@/components/ui";
import { useToast } from "@/components/providers";

const SECTIONS = [
  { id: "tenant", label: "Tenant", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "keys", label: "API Keys", icon: KeyRound },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

export default function SettingsPage() {
  const [section, setSection] = useState<string>("tenant");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Settings</h1>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          Manage your tenant, team, integrations and billing
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={clsx(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                )}
              >
                <Icon size={15} /> {s.label}
              </button>
            );
          })}
        </nav>

        <div>
          {section === "tenant" && <TenantSettings />}
          {section === "team" && <TeamSettings />}
          {section === "integrations" && <IntegrationsSettings />}
          {section === "keys" && <KeysSettings />}
          {section === "billing" && <BillingSettings />}
          {section === "notifications" && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-faint)]">
        {label}
      </label>
      <input
        defaultValue={value}
        className={clsx(
          "w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]",
          mono && "mono text-xs"
        )}
      />
    </div>
  );
}

function TenantSettings() {
  return (
    <Card>
      <SectionTitle>Tenant</SectionTitle>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Organization name" value="Acme Corp" />
        <Field label="Tenant ID" value="ten_acme_8x29fk" mono />
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-faint)]">
            Tier
          </label>
          <div className="flex gap-2">
            {["Pool", "Bridge", "Silo"].map((t, i) => (
              <span
                key={t}
                className={clsx(
                  "rounded-lg border px-3 py-2 text-sm",
                  i === 2
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-muted)]"
                )}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <Field label="Region" value="eu-central-1" mono />
      </div>
      <div className="mt-4">
        <Button variant="primary" size="sm">Save changes</Button>
      </div>
    </Card>
  );
}

function TeamSettings() {
  const members = [
    { name: "Mohamad Karnib", email: "mohamad.karnib@acme.io", role: "Admin" },
    { name: "Priya Nguyen", email: "p.nguyen@acme.io", role: "Admin" },
    { name: "Sam Okafor", email: "s.okafor@acme.io", role: "Viewer" },
    { name: "Lena Brandt", email: "auditor@deloitte.com", role: "Auditor" },
  ];
  return (
    <Card pad={false}>
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <SectionTitle>Team Members</SectionTitle>
        <Button variant="accent" size="sm">
          <Plus size={14} /> Invite
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Member</Th>
            <Th>Email</Th>
            <Th>Role</Th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.email} className="hover:bg-[var(--surface-2)]">
              <Td className="font-medium text-[var(--text)]">{m.name}</Td>
              <Td className="mono text-[11px]">{m.email}</Td>
              <Td>
                <Pill tone={m.role === "Admin" ? "accent" : m.role === "Auditor" ? "info" : "neutral"}>
                  {m.role}
                </Pill>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

function IntegrationsSettings() {
  const [conn, setConn] = useState<Record<string, boolean>>({
    Slack: true,
    PagerDuty: false,
    Datadog: true,
    Dynatrace: false,
  });
  const meta: Record<string, string> = {
    Slack: "Approval routing & block alerts",
    PagerDuty: "Page on-call for incidents",
    Datadog: "Forward verification telemetry",
    Dynatrace: "Forward verification telemetry",
  };
  return (
    <div className="space-y-3">
      {Object.keys(conn).map((name) => (
        <Card key={name} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]">
            <Plug size={18} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--text)]">{name}</p>
            <p className="text-xs text-[var(--text-faint)]">{meta[name]}</p>
          </div>
          {conn[name] && <Pill tone="allow">Connected</Pill>}
          <button
            onClick={() => setConn((c) => ({ ...c, [name]: !c[name] }))}
            className={clsx(
              "relative h-6 w-11 rounded-full transition-colors",
              conn[name] ? "bg-[var(--accent)]" : "bg-[var(--surface-3)]"
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                conn[name] ? "translate-x-[22px]" : "translate-x-0.5"
              )}
            />
          </button>
        </Card>
      ))}
    </div>
  );
}

function KeysSettings() {
  const { push } = useToast();
  const keys = [
    { name: "Production SDK", prefix: "aegis_live_a3f1…c9e2", created: "2026-03-12", lastUsed: "2 min ago" },
    { name: "Staging SDK", prefix: "aegis_test_7d4e…0a91", created: "2026-04-02", lastUsed: "1 day ago" },
  ];
  return (
    <Card pad={false}>
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <SectionTitle>API Keys</SectionTitle>
        <Button variant="accent" size="sm" onClick={() => push({ title: "New API key created", body: "Copy it now — it won't be shown again.", tone: "success" })}>
          <Plus size={14} /> Create Key
        </Button>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Key</Th>
            <Th>Created</Th>
            <Th>Last Used</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => (
            <tr key={k.name} className="hover:bg-[var(--surface-2)]">
              <Td className="font-medium text-[var(--text)]">{k.name}</Td>
              <Td className="mono text-[11px]">{k.prefix}</Td>
              <Td>{k.created}</Td>
              <Td>{k.lastUsed}</Td>
              <Td>
                <div className="flex gap-1">
                  <button onClick={() => push({ title: "Key copied", tone: "info" })} className="rounded p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]">
                    <Copy size={13} />
                  </button>
                  <button onClick={() => push({ title: "Key revoked", tone: "danger" })} className="rounded p-1.5 text-[var(--text-faint)] hover:bg-[var(--surface-3)] hover:text-[var(--block)]">
                    <Trash2 size={13} />
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <SectionTitle>Current Plan</SectionTitle>
            <p className="mt-1 text-2xl font-semibold text-[var(--text)]">
              Enterprise <span className="text-sm font-normal text-[var(--text-faint)]">· Silo tier</span>
            </p>
          </div>
          <Button variant="accent" size="sm">Manage plan</Button>
        </div>
      </Card>
      <Card>
        <SectionTitle sub="Resets on the 1st of each month">Usage this month</SectionTitle>
        <div className="mt-3">
          <div className="flex items-end justify-between text-sm">
            <span className="text-[var(--text-muted)]">Verifications</span>
            <span className="tnum font-semibold text-[var(--text)]">2.41M / 5M</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: "48%" }} />
          </div>
          <p className="mt-2 text-xs text-[var(--text-faint)]">
            48% of monthly allowance · on track for ~3.8M
          </p>
        </div>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const triggers = [
    { event: "Action BLOCKED", slack: true, email: true, page: false },
    { event: "New HUMAN_REVIEW", slack: true, email: false, page: false },
    { event: "Red-team scenario escaped", slack: true, email: true, page: true },
    { event: "Unregistered agent detected", slack: true, email: true, page: false },
    { event: "Evidence pack ready", slack: false, email: true, page: false },
  ];
  return (
    <Card pad={false}>
      <div className="border-b border-[var(--border)] px-4 py-3">
        <SectionTitle sub="Choose a channel per event">Notification Preferences</SectionTitle>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Event</Th>
            <Th className="text-center">Slack</Th>
            <Th className="text-center">Email</Th>
            <Th className="text-center">PagerDuty</Th>
          </tr>
        </thead>
        <tbody>
          {triggers.map((t) => (
            <tr key={t.event} className="hover:bg-[var(--surface-2)]">
              <Td className="text-[var(--text)]">{t.event}</Td>
              {[t.slack, t.email, t.page].map((on, i) => (
                <Td key={i} className="text-center">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: on ? "var(--allow)" : "var(--surface-3)" }}
                  />
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
