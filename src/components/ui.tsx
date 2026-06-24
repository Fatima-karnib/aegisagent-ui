import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Verdict } from "@/lib/types";

/* ---------------- Card ---------------- */
export function Card({
  className,
  children,
  pad = true,
}: {
  className?: string;
  children: ReactNode;
  pad?: boolean;
}) {
  return (
    <div className={clsx("card", pad && "p-5", className)}>{children}</div>
  );
}

export function SectionTitle({
  children,
  action,
  sub,
}: {
  children: ReactNode;
  action?: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-[var(--text)]">
          {children}
        </h2>
        {sub && <p className="mt-0.5 text-xs text-[var(--text-faint)]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Buttons ---------------- */
type BtnVariant = "primary" | "accent" | "ghost" | "danger" | "subtle";

const btnStyles: Record<BtnVariant, string> = {
  primary:
    "bg-[var(--indigo)] text-white hover:brightness-110 border border-transparent",
  accent:
    "bg-[var(--accent-soft)] text-[var(--accent)] border border-[color-mix(in_srgb,var(--accent)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]",
  ghost:
    "bg-transparent text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
  danger:
    "bg-[var(--block-soft)] text-[var(--block)] border border-[color-mix(in_srgb,var(--block)_45%,transparent)] hover:bg-[color-mix(in_srgb,var(--block)_18%,transparent)]",
  subtle:
    "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-3)]",
};

export function Button({
  variant = "subtle",
  size = "md",
  className,
  children,
  href,
  onClick,
  type,
  disabled,
  title,
}: {
  variant?: BtnVariant;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  title?: string;
}) {
  const cls = clsx(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap",
    size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
    btnStyles[variant],
    className
  );
  if (href)
    return (
      <Link href={href} className={cls} title={title}>
        {children}
      </Link>
    );
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      className={cls}
      title={title}
    >
      {children}
    </button>
  );
}

/* ---------------- Verdict badge ---------------- */
export function VerdictBadge({
  verdict,
  size = "md",
}: {
  verdict: Verdict;
  size?: "sm" | "md";
}) {
  const map: Record<Verdict, { c: string; s: string; label: string }> = {
    ALLOW: { c: "var(--allow)", s: "var(--allow-soft)", label: "ALLOW" },
    BLOCK: { c: "var(--block)", s: "var(--block-soft)", label: "BLOCK" },
    HUMAN_REVIEW: {
      c: "var(--review)",
      s: "var(--review-soft)",
      label: "HUMAN_REVIEW",
    },
  };
  const m = map[verdict];
  return (
    <span
      className={clsx(
        "mono inline-flex items-center gap-1.5 rounded-md font-semibold tracking-wide",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]"
      )}
      style={{ color: m.c, background: m.s, border: `1px solid ${m.c}40` }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: m.c }}
      />
      {m.label}
    </span>
  );
}

/* ---------------- Generic pill / status ---------------- */
export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "allow" | "block" | "review" | "info" | "accent";
  className?: string;
}) {
  const tones: Record<string, { c: string; s: string }> = {
    neutral: { c: "var(--text-muted)", s: "var(--surface-2)" },
    allow: { c: "var(--allow)", s: "var(--allow-soft)" },
    block: { c: "var(--block)", s: "var(--block-soft)" },
    review: { c: "var(--review)", s: "var(--review-soft)" },
    info: { c: "var(--info)", s: "var(--info-soft)" },
    accent: { c: "var(--accent)", s: "var(--accent-soft)" },
  };
  const t = tones[tone];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        className
      )}
      style={{ color: t.c, background: t.s, border: `1px solid ${t.c}33` }}
    >
      {children}
    </span>
  );
}

/* ---------------- Stat card ---------------- */
export function StatCard({
  label,
  value,
  sub,
  trend,
  accent,
  spark,
  alert,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  trend?: { dir: "up" | "down"; value: string; good?: boolean };
  accent?: string;
  spark?: number[];
  alert?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      {accent && (
        <span
          className="absolute left-0 top-0 h-full w-[3px]"
          style={{ background: accent }}
        />
      )}
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">
          {label}
        </span>
        {alert && (
          <span className="live-dot h-2 w-2 rounded-full bg-[var(--review)]" />
        )}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="tnum text-2xl font-semibold leading-none text-[var(--text)]">
          {value}
        </span>
        {trend && (
          <span
            className="mb-0.5 inline-flex items-center gap-0.5 text-xs font-medium"
            style={{
              color: trend.good ? "var(--allow)" : "var(--block)",
            }}
          >
            {trend.dir === "up" ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>
      {sub && <div className="mt-1 text-xs text-[var(--text-muted)]">{sub}</div>}
      {spark && (
        <div className="mt-3">
          <Sparkline data={spark} color={accent ?? "var(--accent)"} />
        </div>
      )}
    </Card>
  );
}

/* ---------------- Sparkline ---------------- */
export function Sparkline({
  data,
  color = "var(--accent)",
  height = 32,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const w = 120;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - ((d - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const areaPts = `0,${height} ${pts} ${w},${height}`;
  const gid = `sg-${color.replace(/[^a-z]/gi, "")}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${gid})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ---------------- Donut ---------------- */
export function Donut({
  segments,
  size = 140,
  thickness = 16,
  centerLabel,
  centerSub,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: ReactNode;
  centerSub?: ReactNode;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth={thickness}
          />
          {segments.map((s, i) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="tnum text-xl font-semibold text-[var(--text)]">
              {centerLabel}
            </span>
            {centerSub && (
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                {centerSub}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: s.color }}
            />
            <span className="text-[var(--text-muted)]">{s.label}</span>
            <span className="tnum ml-auto font-medium text-[var(--text)]">
              {Math.round((s.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Stacked bar ---------------- */
export function StackedBar({
  segments,
}: {
  segments: { value: number; color: string; label: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-[var(--surface-3)]">
        {segments.map((s, i) => (
          <div
            key={i}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: s.color }}
            />
            <span className="text-[var(--text-muted)]">{s.label}</span>
            <span className="tnum font-medium text-[var(--text)]">
              {Math.round((s.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Table primitives ---------------- */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}
export function Th({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={clsx(
        "border-b border-[var(--border)] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-faint)]",
        className
      )}
    >
      {children}
    </th>
  );
}
export function Td({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={clsx(
        "border-b border-[var(--border)] px-3 py-2.5 align-middle text-[var(--text-muted)]",
        className
      )}
    >
      {children}
    </td>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({
  icon,
  title,
  body,
  cta,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  cta?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-[var(--text-muted)]">{body}</p>
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton", className)} />;
}

/* ---------------- Code block ---------------- */
export function CodeBlock({
  code,
  lang,
  className,
}: {
  code: string;
  lang?: string;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)]",
        className
      )}
    >
      {lang && (
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5">
          <span className="mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
            {lang}
          </span>
        </div>
      )}
      <pre className="mono overflow-x-auto p-3.5 text-[12px] leading-relaxed text-[var(--text-muted)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ---------------- Hash chip ---------------- */
export function HashChip({ value }: { value: string }) {
  return (
    <span className="mono inline-flex items-center gap-1 rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px] text-[var(--text-muted)]">
      {value.length > 24 ? value.slice(0, 22) + "…" : value}
    </span>
  );
}

/* ---------------- Bars (mini horizontal) ---------------- */
export function MiniBars({
  items,
  color = "var(--block)",
}: {
  items: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...items.map((i) => i.value)) || 1;
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3">
          <span className="mono w-32 shrink-0 truncate text-xs text-[var(--text-muted)]">
            {it.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${(it.value / max) * 100}%`, background: color }}
            />
          </div>
          <span className="tnum w-6 text-right text-xs font-medium text-[var(--text)]">
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}
