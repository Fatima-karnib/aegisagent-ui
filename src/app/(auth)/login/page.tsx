import Link from "next/link";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-7 flex flex-col items-center text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--indigo)] shadow-[0_0_28px_-4px_var(--indigo)]">
          <ShieldCheck size={24} className="text-white" />
        </span>
        <h1 className="text-lg font-semibold text-[var(--text)]">AegisAgent</h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          The Continuous Trust Plane for Autonomous AI Agents
        </p>
      </div>

      <div className="card p-6">
        <div className="space-y-3">
          <button className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] py-2.5 text-sm font-medium text-[var(--text)] hover:border-[var(--border-strong)]">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-[#FF9900] text-[9px] font-bold text-black">
              aws
            </span>
            Sign in with AWS SSO
          </button>
          <button className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] py-2.5 text-sm font-medium text-[var(--text)] hover:border-[var(--border-strong)]">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-[#1d6ad7] text-[9px] font-bold text-white">
              O
            </span>
            Sign in with Okta
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-faint)]">
            or
          </span>
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Email
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3">
              <Mail size={15} className="text-[var(--text-faint)]" />
              <input
                type="email"
                defaultValue="mohamad.karnib@acme.io"
                className="w-full bg-transparent py-2.5 text-sm text-[var(--text)] outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-faint)]">
              Password
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3">
              <Lock size={15} className="text-[var(--text-faint)]" />
              <input
                type="password"
                defaultValue="aegisagent"
                className="w-full bg-transparent py-2.5 text-sm text-[var(--text)] outline-none"
              />
            </div>
          </label>
        </div>

        <Link
          href="/onboarding"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--indigo)] py-2.5 text-sm font-medium text-white hover:brightness-110"
        >
          Sign in <ArrowRight size={15} />
        </Link>

        <p className="mt-4 text-center text-xs text-[var(--text-faint)]">
          New tenant?{" "}
          <Link href="/onboarding" className="text-[var(--accent)] hover:underline">
            Start onboarding
          </Link>
        </p>
      </div>

      <p className="mt-5 text-center text-[11px] text-[var(--text-faint)]">
        SOC 2 Type II · ISO 42001 · EU AI Act aligned
      </p>
    </div>
  );
}
