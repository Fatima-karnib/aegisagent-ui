"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  ShieldCheck,
  FileText,
  Download,
  Share2,
  Hash,
  Lock,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Eye,
} from "lucide-react";
import {
  frameworks,
  comingSoonFrameworks,
  complianceControls,
} from "@/lib/data";
import {
  Card,
  Button,
  Pill,
  Donut,
  Table,
  Th,
  Td,
  SectionTitle,
  HashChip,
} from "@/components/ui";
import { useToast } from "@/components/providers";

function statusTone(s: string) {
  return s === "Covered" ? "allow" : s === "Partial" ? "review" : "block";
}

export default function CompliancePage() {
  const { push } = useToast();
  const [fw, setFw] = useState<string>(frameworks[1]); // ISO 42001 (hero)
  const [genState, setGenState] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [showAuditor, setShowAuditor] = useState(false);

  const controls = complianceControls[fw] ?? [];
  const covered = controls.filter((c) => c.status === "Covered").length;
  const partial = controls.filter((c) => c.status === "Partial").length;
  const gap = controls.filter((c) => c.status === "Gap").length;

  const generate = () => {
    setGenState("running");
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setGenState("done");
          push({
            title: `${fw} evidence pack ready`,
            body: "Hashed, sealed in S3 Object Lock. PDF + JSON available.",
            tone: "success",
          });
          return 100;
        }
        return p + 8;
      });
    }, 130);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">
          Evidence &amp; Compliance
        </h1>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          Continuous, audit-ready evidence mapped to regulatory controls
        </p>
      </div>

      {/* Framework tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {frameworks.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFw(f);
              setGenState("idle");
            }}
            className={clsx(
              "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
              fw === f
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
            )}
          >
            {f}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-[var(--border)]" />
        {comingSoonFrameworks.map((f) => (
          <span
            key={f}
            className="cursor-not-allowed rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-sm text-[var(--text-faint)]"
          >
            {f} <span className="text-[10px]">soon</span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Control mapping */}
        <Card pad={false}>
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <SectionTitle sub={`${controls.length} controls · ${fw}`}>
              Control Mapping
            </SectionTitle>
            <Pill tone="allow">
              {Math.round((covered / controls.length) * 100)}% full coverage
            </Pill>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Control</Th>
                <Th>Status</Th>
                <Th className="text-right">Evidence</Th>
                <Th>Last Evidence</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {controls.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--surface-2)]">
                  <Td>
                    <span className="mono text-[11px] text-[var(--accent)]">
                      {c.id}
                    </span>
                    <span className="ml-2 text-[var(--text)]">{c.name}</span>
                  </Td>
                  <Td>
                    <Pill tone={statusTone(c.status)}>{c.status}</Pill>
                  </Td>
                  <Td className="tnum text-right">
                    {c.evidenceCount.toLocaleString()}
                  </Td>
                  <Td>{c.lastEvidence}</Td>
                  <Td>
                    <button
                      onClick={() =>
                        push({ title: `Opening evidence for ${c.id}`, tone: "info" })
                      }
                      className="text-xs font-medium text-[var(--accent)] hover:underline"
                    >
                      View
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* Right: coverage + pack */}
        <div className="space-y-5">
          <Card>
            <SectionTitle sub="Controls with full evidence">
              Coverage
            </SectionTitle>
            <div className="mt-3 flex justify-center">
              <Donut
                size={130}
                segments={[
                  { value: covered, color: "var(--allow)", label: "Covered" },
                  { value: partial, color: "var(--review)", label: "Partial" },
                  { value: gap, color: "var(--block)", label: "Gap" },
                ]}
                centerLabel={`${Math.round((covered / controls.length) * 100)}%`}
                centerSub="covered"
              />
            </div>
          </Card>

          <Card>
            <SectionTitle sub="Cryptographically sealed, auditor-ready">
              <span className="flex items-center gap-2">
                <FileText size={15} className="text-[var(--accent)]" /> Evidence
                Pack
              </span>
            </SectionTitle>

            {genState === "idle" && (
              <Button
                variant="accent"
                size="sm"
                className="mt-2 w-full"
                onClick={generate}
              >
                <FileText size={14} /> Generate {fw} Pack
              </Button>
            )}

            {genState === "running" && (
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Loader2 size={13} className="spin" />
                  Collecting evidence · hashing · sealing…
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {genState === "done" && (
              <div className="mt-2 space-y-3">
                {/* PDF preview thumbnail */}
                <div className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                  <div className="flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded border border-[var(--border-strong)] bg-[var(--surface)]">
                    <FileText size={18} className="text-[var(--block)]" />
                    <span className="mt-1 text-[8px] font-bold text-[var(--text-faint)]">
                      PDF
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--text)]">
                      {fw.replace(/\s/g, "_")}_Evidence_Pack.pdf
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--text-faint)]">
                      48 pages · {controls.length} controls · generated 2026-06-24
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[var(--allow)]">
                      <CheckCircle2 size={10} /> integrity verified
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[var(--text-faint)]">
                    <Hash size={11} /> Hash
                  </div>
                  <HashChip value="sha256:9f3a1c7e4b20d88f1aa6" />
                  <div className="mt-2 flex items-center gap-1.5 text-[var(--text-faint)]">
                    <Lock size={11} /> S3 Object Lock URI
                  </div>
                  <span className="mono block break-all text-[var(--text-muted)]">
                    s3://aegis-evidence-prod/{fw.replace(/\s/g, "-").toLowerCase()}/2026-06-24/pack.pdf
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="subtle" size="sm" onClick={() => push({ title: "Downloading PDF…", tone: "success" })}>
                    <Download size={13} /> PDF
                  </Button>
                  <Button variant="subtle" size="sm" onClick={() => push({ title: "Downloading JSON…", tone: "success" })}>
                    <Download size={13} /> JSON
                  </Button>
                </div>
                <Button
                  variant="accent"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowAuditor(true)}
                >
                  <Share2 size={13} /> Share with Auditor
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Auditor portal preview modal */}
      {showAuditor && (
        <div
          className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setShowAuditor(false)}
        >
          <div
            className="card my-auto w-full max-w-2xl"
            style={{ padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <AuditorPortal fw={fw} onClose={() => setShowAuditor(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function AuditorPortal({ fw, onClose }: { fw: string; onClose: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-3">
        <div className="flex items-center gap-2">
          <Eye size={15} className="text-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--text)]">
            Auditor Portal Preview — read-only, time-boxed link
          </span>
        </div>
        <button onClick={onClose} className="text-[var(--text-faint)] hover:text-[var(--text)]">
          ✕
        </button>
      </div>
      <div className="p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-[var(--border)] pb-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--indigo)]">
            <ShieldCheck size={20} className="text-white" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">
              Acme Corp · {fw} Evidence Pack
            </p>
            <p className="text-[11px] text-[var(--text-faint)]">
              Shared by mohamad.karnib@acme.io · expires in 14 days · view-only
            </p>
          </div>
          <Pill tone="allow" className="ml-auto">
            <span className="flex items-center gap-1">
              <Lock size={10} /> Hash verified
            </span>
          </Pill>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "Controls", v: complianceControls[fw]?.length ?? 0 },
            { l: "Evidence records", v: "184,320" },
            { l: "Coverage", v: "82%" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-center">
              <div className="tnum text-lg font-semibold text-[var(--text)]">
                {s.v}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                {s.l}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Control mappings
        </p>
        <div className="space-y-1">
          {(complianceControls[fw] ?? []).slice(0, 4).map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-xs"
            >
              <span className="mono text-[var(--accent)]">{c.id}</span>
              <span className="text-[var(--text)]">{c.name}</span>
              <Pill tone={statusTone(c.status)} className="ml-auto">
                {c.status}
              </Pill>
            </div>
          ))}
        </div>

        <p className="mt-5 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Agent activity timeline
        </p>
        <div className="space-y-2 border-l border-[var(--border)] pl-4">
          {[
            "02:00 — Nightly red-team: 22/25 caught",
            "09:12 — Human review approved (refund $9,200)",
            "11:48 — BLOCK: $50,000 refund to sanctioned vendor",
            "14:30 — Evidence pack sealed to S3 Object Lock",
          ].map((t, i) => (
            <div key={i} className="relative text-[11px] text-[var(--text-muted)]">
              <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
              {t}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-4 py-3">
          <span className="text-[11px] text-[var(--text-faint)]">
            No editing · no navigation to other tenant data · all access logged
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[var(--accent)]">
            <ExternalLink size={11} /> aegis.audit/acme/iso42001
          </span>
        </div>
      </div>
    </div>
  );
}
