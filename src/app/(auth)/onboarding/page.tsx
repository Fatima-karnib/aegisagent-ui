"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  ShieldCheck,
  Terminal,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { CodeBlock } from "@/components/ui";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [compiled, setCompiled] = useState(false);

  const steps = ["Connect agent", "Write policy", "Protected"];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--indigo)]">
          <ShieldCheck size={18} className="text-white" />
        </span>
        <span className="text-sm font-semibold text-[var(--text)]">AegisAgent</span>
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={clsx(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < step
                  ? "bg-[var(--accent)] text-black"
                  : i === step
                    ? "bg-[var(--indigo)] text-white"
                    : "bg-[var(--surface-2)] text-[var(--text-faint)]"
              )}
            >
              {i < step ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span
              className={clsx(
                "hidden text-xs font-medium sm:block",
                i <= step ? "text-[var(--text)]" : "text-[var(--text-faint)]"
              )}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-1 h-px w-8 bg-[var(--border)]" />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6">
        {step === 0 && (
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Terminal size={16} className="text-[var(--accent)]" />
              <h2 className="text-base font-semibold text-[var(--text)]">
                Connect your first agent
              </h2>
            </div>
            <p className="mb-4 text-sm text-[var(--text-muted)]">
              Install the SDK and wrap your agent&apos;s tool calls with the
              verify decorator.
            </p>
            <CodeBlock code="pip install aegisagent" lang="bash" className="mb-3" />
            <CodeBlock
              lang="python"
              code={`from aegisagent import aegis

@aegis.verify(agent="finpilot-refund")
def process_refund(amount, vendor, approvals=0):
    # your agent's tool call — every invocation
    # is intercepted and verified in < 800ms
    return payments.refund(amount, vendor)`}
            />

            <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="flex items-center gap-2 text-sm">
                {verified ? (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--allow)]" />
                    <span className="text-[var(--allow)]">
                      First trace received from <span className="mono">finpilot-refund</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="live-dot h-2.5 w-2.5 rounded-full bg-[var(--review)]" />
                    <span className="text-[var(--text-muted)]">
                      Waiting for first trace…
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setVerifying(true);
                  setTimeout(() => {
                    setVerifying(false);
                    setVerified(true);
                  }, 1400);
                }}
                disabled={verifying || verified}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium",
                  verified
                    ? "bg-[var(--allow-soft)] text-[var(--allow)]"
                    : "bg-[var(--indigo)] text-white hover:brightness-110 disabled:opacity-60"
                )}
              >
                {verifying ? (
                  <>
                    <Loader2 size={14} className="spin" /> Listening…
                  </>
                ) : verified ? (
                  <>
                    <CheckCircle2 size={14} /> Connected
                  </>
                ) : (
                  "Verify Connection"
                )}
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--accent)]" />
              <h2 className="text-base font-semibold text-[var(--text)]">
                Write your first policy
              </h2>
            </div>
            <p className="mb-4 text-sm text-[var(--text-muted)]">
              Describe a rule in plain English. We compile it to Cedar and a
              formal-logic proof.
            </p>
            <textarea
              defaultValue="Agents may only refund up to $500 without approval."
              rows={2}
              onChange={() => setCompiled(false)}
              className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={() => setCompiled(true)}
              className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--indigo)] px-3 py-1.5 text-sm font-medium text-white hover:brightness-110"
            >
              <Sparkles size={14} /> Compile
            </button>

            {compiled && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CodeBlock
                  lang="cedar"
                  code={`permit (
  principal,
  action == Action::"process_refund",
  resource
) when {
  context.amount <= 500
};`}
                />
                <CodeBlock
                  lang="formal logic"
                  code={`∀ a, r:
  exec(a, refund(r))
   → amount(r) ≤ 500
   ∨ approved(r)

⊢ verified
  0 counterexamples`}
                />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="py-6 text-center">
            <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--allow-soft)] text-[var(--allow)]">
              <PartyPopper size={30} />
            </span>
            <h2 className="text-xl font-semibold text-[var(--text)]">
              You&apos;re protected
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text-muted)]">
              <span className="mono text-[var(--text)]">finpilot-refund</span> is
              connected and your first policy is live. Every tool call is now
              verified, governed and audited.
            </p>
            <div className="mx-auto mt-5 flex max-w-xs flex-col gap-2 text-left">
              {[
                "SDK connected & emitting traces",
                "Refund policy active (Cedar + verified)",
                "Audit trail recording to S3 Object Lock",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <CheckCircle2 size={15} className="text-[var(--allow)]" /> {t}
                </div>
              ))}
            </div>
            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[var(--indigo)] px-5 py-2.5 text-sm font-medium text-white hover:brightness-110"
            >
              Go to dashboard <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* Footer nav */}
        {step < 2 && (
          <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-sm text-[var(--text-faint)] hover:text-[var(--text)] disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 0 && !verified) || (step === 1 && !compiled)}
              className="flex items-center gap-2 rounded-lg bg-[var(--indigo)] px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-40"
            >
              {step === 1 ? "Confirm Policy" : "Continue"} <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-[var(--text-faint)]">
        <Link href="/" className="hover:text-[var(--text)]">
          Skip onboarding →
        </Link>
      </p>
    </div>
  );
}
