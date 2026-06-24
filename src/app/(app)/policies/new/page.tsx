"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ScrollText,
  Sigma,
  History,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { policyById } from "@/lib/data";
import { Card, Button, CodeBlock, Pill, SectionTitle } from "@/components/ui";
import { useToast } from "@/components/providers";

const SAMPLE_CEDAR = `permit (
  principal in AgentGroup::"all",
  action == Action::"process_payment",
  resource
)
when {
  context.amount <= 10000 ||
  (context.approvals >= 2 &&
   context.approver_role == "manager")
};

forbid (
  principal,
  action == Action::"send_email",
  resource
)
when {
  context.external == true &&
  context.contains_pii == true
};`;

const SAMPLE_FORMAL = `∀ a ∈ Agents, p ∈ Payments:
  exec(a, pay(p)) →
    amount(p) ≤ 10000
    ∨ (approvals(p) ≥ 2 ∧ role(approver(p)) = MANAGER)

∀ a ∈ Agents, e ∈ Emails:
  exec(a, send(e)) ∧ external(e) → ¬pii(e)

────────────────────────────────
Automated Reasoning result:
  ⊢ policy set is SATISFIABLE
  ⊢ no conflicting permit/forbid pairs
  ⊢ 0 counterexamples found`;

function EditorInner() {
  const params = useSearchParams();
  const existing = params.get("id") ? policyById(params.get("id")!) : null;
  const { push } = useToast();

  const [nl, setNl] = useState(
    existing?.nl ??
      "No agent may process a payment above $10,000 without dual approval from a manager. Agents must never reveal customer PII in external emails."
  );
  const [compiled, setCompiled] = useState(!!existing);
  const [compiling, setCompiling] = useState(false);
  const [tested, setTested] = useState(false);

  const cedar = existing?.cedar ?? SAMPLE_CEDAR;
  const formal = existing?.formal ?? SAMPLE_FORMAL;

  const compile = () => {
    setCompiling(true);
    setCompiled(false);
    setTested(false);
    setTimeout(() => {
      setCompiling(false);
      setCompiled(true);
    }, 1100);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/policies"
            className="mb-2 inline-flex items-center gap-1 text-xs text-[var(--text-faint)] hover:text-[var(--text)]"
          >
            ← Policy Studio
          </Link>
          <h1 className="text-xl font-semibold text-[var(--text)]">
            {existing ? `Edit · ${existing.name}` : "New Policy"}
          </h1>
        </div>
        {existing && (
          <div className="flex gap-2">
            {existing.frameworks.map((f) => (
              <Pill key={f} tone="info">
                {f}
              </Pill>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: NL input */}
        <Card>
          <SectionTitle sub="Describe the rule in plain English">
            <span className="flex items-center gap-2">
              <Sparkles size={15} className="text-[var(--accent)]" /> Natural
              Language
            </span>
          </SectionTitle>
          <textarea
            value={nl}
            onChange={(e) => setNl(e.target.value)}
            rows={9}
            className="mt-1 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3.5 text-sm leading-relaxed text-[var(--text)] outline-none focus:border-[var(--accent)]"
            placeholder="e.g. Agents may only refund up to $500 without approval…"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-faint)]">
              Compiles to Cedar + formal logic
            </span>
            <Button variant="primary" size="sm" onClick={compile} disabled={compiling}>
              {compiling ? (
                <>
                  <Loader2 size={14} className="spin" /> Compiling…
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Compile
                </>
              )}
            </Button>
          </div>

          {compiled && (
            <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setTested(true);
                  push({
                    title: "Replay complete",
                    body: "12 of the last 1,000 actions would change verdict (9 → BLOCK, 3 → HUMAN_REVIEW).",
                    tone: "info",
                  });
                }}
              >
                <History size={14} /> Test Against History (last 1,000 actions)
              </Button>
              {tested && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs">
                  <p className="mb-2 font-medium text-[var(--text)]">
                    Replay vs. last 1,000 actions
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Delta label="Now BLOCK" value="+9" tone="block" />
                    <Delta label="Now REVIEW" value="+3" tone="review" />
                    <Delta label="Unchanged" value="988" tone="neutral" />
                  </div>
                </div>
              )}
              <Button
                variant="accent"
                size="sm"
                className="w-full"
                onClick={() =>
                  push({
                    title: existing ? "Policy updated" : "Policy activated",
                    body: "Now enforced across bound agents. Audit record written.",
                    tone: "success",
                  })
                }
              >
                <CheckCircle2 size={14} /> {existing ? "Save & Re-activate" : "Activate Policy"}
              </Button>
            </div>
          )}
        </Card>

        {/* Right: generated output */}
        <div className="space-y-5">
          {!compiled && !compiling && (
            <Card className="flex h-full min-h-72 flex-col items-center justify-center text-center">
              <ArrowRight
                size={22}
                className="mb-3 text-[var(--text-faint)] lg:-rotate-180"
              />
              <p className="text-sm font-medium text-[var(--text)]">
                Output appears here
              </p>
              <p className="mt-1 max-w-xs text-xs text-[var(--text-muted)]">
                Write a rule on the left and hit Compile to generate the Cedar
                policy and its formal-logic proof, side by side.
              </p>
            </Card>
          )}
          {compiling && (
            <Card>
              <div className="space-y-3">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-24 w-full" />
                <div className="skeleton h-4 w-1/4" />
                <div className="skeleton h-20 w-full" />
              </div>
            </Card>
          )}
          {compiled && (
            <>
              <Card>
                <SectionTitle
                  sub="Authored, version-controlled authorization"
                  action={<Pill tone="accent">generated</Pill>}
                >
                  <span className="flex items-center gap-2">
                    <ScrollText size={15} className="text-[var(--accent)]" /> Cedar
                    Policy
                  </span>
                </SectionTitle>
                <CodeBlock code={cedar} lang="cedar" />
              </Card>
              <Card>
                <SectionTitle
                  sub="Automated Reasoning · provably correct"
                  action={
                    <Pill tone="allow">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={10} /> verified
                      </span>
                    </Pill>
                  }
                >
                  <span className="flex items-center gap-2">
                    <Sigma size={15} className="text-[var(--accent)]" /> Formal
                    Logic
                  </span>
                </SectionTitle>
                <CodeBlock code={formal} lang="smt / first-order logic" />
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Delta({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "block" | "review" | "neutral";
}) {
  const c =
    tone === "block"
      ? "var(--block)"
      : tone === "review"
        ? "var(--review)"
        : "var(--text-muted)";
  return (
    <div className="rounded-md bg-[var(--bg)] py-2">
      <div className="tnum text-base font-semibold" style={{ color: c }}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
        {label}
      </div>
    </div>
  );
}

export default function NewPolicyPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--text-faint)]">Loading…</div>}>
      <EditorInner />
    </Suspense>
  );
}
