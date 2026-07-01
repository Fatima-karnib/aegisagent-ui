/* =====================================================================
   AegisAgent — Figma Screen Generator
   Builds native, editable Figma frames for every screen in the app,
   using the same design tokens (dark theme), type scale and layout
   as the React build.
   Run: Plugins → Development → Import plugin from manifest → run.
   ===================================================================== */

// ---------- Design tokens (from globals.css, dark theme) ----------
const T = {
  bg: "#070b16",
  surface: "#0c1322",
  surface2: "#111a2e",
  surface3: "#16203a",
  border: "#1c2740",
  borderStrong: "#2a3a5c",
  text: "#e6edf7",
  muted: "#93a3bd",
  faint: "#5c6b86",
  navy: "#1b2a4a",
  indigo: "#4f6bed",
  accent: "#2dd4bf",
  accent2: "#22d3ee",
  allow: "#34d399",
  block: "#f43f5e",
  review: "#f59e0b",
  info: "#60a5fa",
  white: "#ffffff",
};

// ---------- helpers ----------
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}
function paint(hex, opacity) {
  return { type: "SOLID", color: hexToRgb(hex), opacity: opacity == null ? 1 : opacity };
}

const FONTS = [
  { family: "Inter", style: "Regular" },
  { family: "Inter", style: "Medium" },
  { family: "Inter", style: "Semi Bold" },
  { family: "Inter", style: "Bold" },
  { family: "Roboto Mono", style: "Regular" },
  { family: "Roboto Mono", style: "Medium" },
];
async function loadFonts() {
  for (const f of FONTS) await figma.loadFontAsync(f);
}

function frame(name, w, h, fillHex) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.fills = [paint(fillHex || T.bg)];
  f.clipsContent = true;
  return f;
}
function rect(parent, x, y, w, h, fillHex, radius, opacity) {
  const r = figma.createRectangle();
  r.resize(Math.max(1, w), Math.max(1, h));
  r.x = x;
  r.y = y;
  r.fills = fillHex === "none" ? [] : [paint(fillHex, opacity)];
  if (radius) r.cornerRadius = radius;
  parent.appendChild(r);
  return r;
}
function card(parent, x, y, w, h, fillHex) {
  const c = rect(parent, x, y, w, h, fillHex || T.surface, 12);
  c.strokes = [paint(T.border)];
  c.strokeWeight = 1;
  c.strokeAlign = "INSIDE";
  return c;
}
function txt(parent, x, y, chars, o) {
  o = o || {};
  const t = figma.createText();
  const family = o.family || "Inter";
  let style = o.weight || "Regular";
  if (family === "Roboto Mono" && style !== "Medium") style = "Regular";
  t.fontName = { family, style };
  t.characters = String(chars);
  t.fontSize = o.size || 12;
  t.fills = [paint(o.color || T.text, o.opacity)];
  if (o.spacing != null) t.letterSpacing = { value: o.spacing, unit: "PIXELS" };
  if (o.w) {
    t.textAutoResize = "HEIGHT";
    t.resize(o.w, t.height);
  }
  if (o.align) t.textAlignHorizontal = o.align;
  parent.appendChild(t);
  t.x = x;
  t.y = y;
  return t;
}
// soft-bg pill
function pill(parent, x, y, label, fgHex, opts) {
  opts = opts || {};
  const padX = opts.padX || 8;
  const fs = opts.size || 10;
  const mono = opts.mono;
  const g = figma.createFrame();
  g.name = "pill";
  g.layoutMode = "HORIZONTAL";
  g.primaryAxisSizingMode = "AUTO";
  g.counterAxisSizingMode = "AUTO";
  g.counterAxisAlignItems = "CENTER";
  g.paddingLeft = padX;
  g.paddingRight = padX;
  g.paddingTop = opts.padY || 4;
  g.paddingBottom = opts.padY || 4;
  g.itemSpacing = 6;
  g.cornerRadius = opts.radius || 6;
  g.fills = [paint(opts.bg || fgHex, opts.bgOpacity == null ? 0.13 : opts.bgOpacity)];
  if (opts.dot) {
    const d = figma.createEllipse();
    d.resize(6, 6);
    d.fills = [paint(fgHex)];
    g.appendChild(d);
  }
  const t = figma.createText();
  t.fontName = mono ? { family: "Roboto Mono", style: "Medium" } : { family: "Inter", style: "Medium" };
  t.characters = label;
  t.fontSize = fs;
  t.fills = [paint(fgHex)];
  g.appendChild(t);
  parent.appendChild(g);
  g.x = x;
  g.y = y;
  return g;
}
const VERDICT = {
  ALLOW: T.allow,
  BLOCK: T.block,
  HUMAN_REVIEW: T.review,
};
function verdictBadge(parent, x, y, v) {
  return pill(parent, x, y, v, VERDICT[v], { dot: true, mono: true, size: 10 });
}
function accentBar(parent, x, y, h, hex) {
  return rect(parent, x, y, 3, h, hex, 2);
}
function hr(parent, x, y, w) {
  return rect(parent, x, y, w, 1, T.border);
}

// ---------- App shell (sidebar + topbar) ----------
const SBW = 240;
const TBH = 56;
const NAV = [
  "Dashboard",
  "Agents",
  "Policy Studio",
  "Red Team",
  "Compliance",
  "Shadow Radar",
  "Review Queue",
  "Settings",
];
function shell(f, active, pageTitle) {
  const W = f.width;
  // sidebar
  rect(f, 0, 0, SBW, f.height, T.surface);
  rect(f, SBW - 1, 0, 1, f.height, T.border);
  // logo
  const logo = rect(f, 20, 18, 32, 32, T.indigo, 8);
  txt(f, 26, 26, "◈", { size: 16, color: T.white, weight: "Bold" });
  txt(f, 62, 20, "AegisAgent", { size: 14, weight: "Semi Bold" });
  txt(f, 62, 37, "Trust Plane", { size: 10, color: T.faint });
  // nav
  let ny = 78;
  NAV.forEach((n) => {
    const isActive = n === active;
    if (isActive) {
      rect(f, 12, ny - 6, SBW - 24, 36, T.accent, 8, 0.12);
      rect(f, 12, ny - 2, 3, 26, T.accent, 2);
    }
    rect(f, 26, ny + 3, 15, 15, isActive ? T.accent : T.muted, 4, isActive ? 1 : 0.5);
    txt(f, 52, ny + 2, n, {
      size: 13,
      weight: "Medium",
      color: isActive ? T.text : T.muted,
    });
    if (n === "Shadow Radar") pill(f, SBW - 52, ny + 1, "3", T.block, { size: 10, radius: 10 });
    if (n === "Review Queue") pill(f, SBW - 52, ny + 1, "4", T.review, { size: 10, radius: 10 });
    ny += 42;
  });
  // sidebar footer status
  card(f, 12, f.height - 70, SBW - 24, 54, T.surface2);
  const dot = figma.createEllipse();
  dot.resize(8, 8);
  dot.x = 26;
  dot.y = f.height - 56;
  dot.fills = [paint(T.allow)];
  f.appendChild(dot);
  txt(f, 42, f.height - 60, "All systems verified", { size: 12, weight: "Medium" });
  txt(f, 26, f.height - 42, "p99 latency 620ms · SLA 800ms", { size: 11, color: T.faint });

  // topbar
  rect(f, SBW, 0, W - SBW, TBH, T.surface, 0, 0.92);
  rect(f, SBW, TBH - 1, W - SBW, 1, T.border);
  txt(f, SBW + 24, 19, pageTitle, { size: 14, weight: "Semi Bold" });
  // search
  const sx = W - 620;
  const sb = rect(f, sx, 12, 360, 32, T.surface2, 8);
  sb.strokes = [paint(T.border)];
  sb.strokeWeight = 1;
  txt(f, sx + 14, 20, "Search agents, actions, policies…", { size: 12, color: T.faint });
  txt(f, sx + 320, 19, "⌘K", { size: 11, color: T.faint, family: "Roboto Mono" });
  // theme + bell + org + avatar
  rect(f, W - 232, 12, 32, 32, T.surface2, 8).strokes = [paint(T.border)];
  rect(f, W - 192, 12, 32, 32, T.surface2, 8).strokes = [paint(T.border)];
  const bell = pill(f, W - 178, 8, "7", T.white, { size: 9, radius: 8, bg: T.block, bgOpacity: 1 });
  const org = rect(f, W - 150, 12, 110, 32, T.surface2, 8);
  org.strokes = [paint(T.border)];
  rect(f, W - 142, 18, 20, 20, T.indigo, 5);
  txt(f, W - 116, 20, "Acme Corp", { size: 12, weight: "Medium" });
  const av = figma.createEllipse();
  av.resize(32, 32);
  av.x = W - 32 - 4;
  av.y = 12;
  av.fills = [paint(T.indigo)];
  f.appendChild(av);
  txt(f, W - 30, 20, "MK", { size: 11, color: T.white, weight: "Semi Bold" });

  return { cx: SBW + 28, cy: TBH + 26, cw: W - SBW - 56 };
}

function pageHeading(f, x, y, title, sub) {
  txt(f, x, y, title, { size: 20, weight: "Semi Bold" });
  if (sub) txt(f, x, y + 28, sub, { size: 13, color: T.muted });
}

// metric card
function metric(f, x, y, w, label, value, sub, accentHex) {
  card(f, x, y, w, 96);
  accentBar(f, x, y, 96, accentHex);
  txt(f, x + 16, y + 14, label.toUpperCase(), { size: 10, color: T.faint, weight: "Medium", spacing: 0.6 });
  txt(f, x + 16, y + 34, value, { size: 24, weight: "Semi Bold" });
  if (sub) txt(f, x + 16, y + 68, sub, { size: 11, color: T.muted });
}

// simple bar-chart "sparkline" inside a box
function sparkline(f, x, y, w, h, hex) {
  const bars = 16;
  const bw = (w - (bars - 1) * 3) / bars;
  const vals = [4, 6, 5, 8, 7, 10, 9, 12, 10, 14, 12, 16, 15, 18, 16, 20];
  for (let i = 0; i < bars; i++) {
    const bh = (vals[i] / 20) * h;
    rect(f, x + i * (bw + 3), y + (h - bh), bw, bh, hex, 2, 0.7);
  }
}

// donut
function donut(f, cx, cy, r, thick, segHex, pct, centerLabel) {
  const ring = figma.createEllipse();
  ring.resize(r * 2, r * 2);
  ring.x = cx - r;
  ring.y = cy - r;
  ring.fills = [paint(T.surface3)];
  ring.arcData = { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: 1 - thick / r };
  f.appendChild(ring);
  const seg = figma.createEllipse();
  seg.resize(r * 2, r * 2);
  seg.x = cx - r;
  seg.y = cy - r;
  seg.fills = [paint(segHex)];
  seg.arcData = { startingAngle: -Math.PI / 2, endingAngle: -Math.PI / 2 + Math.PI * 2 * pct, innerRadius: 1 - thick / r };
  f.appendChild(seg);
  if (centerLabel) {
    const t = txt(f, cx - r, cy - 12, centerLabel, { size: 18, weight: "Semi Bold", align: "CENTER", w: r * 2 });
  }
}

// section card title
function cardTitle(f, x, y, title, sub) {
  txt(f, x, y, title, { size: 13, weight: "Semi Bold" });
  if (sub) txt(f, x, y + 18, sub, { size: 11, color: T.faint });
}

// ============================================================
//                         SCREENS
// ============================================================

function buildLogin() {
  const f = frame("01 · Login", 1440, 900, T.bg);
  // glow
  rect(f, 120, 120, 360, 360, T.indigo, 360, 0.16);
  rect(f, 980, 520, 360, 360, T.accent, 360, 0.1);
  const cw = 380;
  const cx = (1440 - cw) / 2;
  // logo
  rect(f, 1440 / 2 - 24, 150, 48, 48, T.indigo, 14);
  txt(f, 1440 / 2 - 9, 164, "◈", { size: 20, color: T.white, weight: "Bold" });
  txt(f, cx, 214, "AegisAgent", { size: 18, weight: "Semi Bold", align: "CENTER", w: cw });
  txt(f, cx, 238, "The Continuous Trust Plane for Autonomous AI Agents", {
    size: 12,
    color: T.muted,
    align: "CENTER",
    w: cw,
  });
  // card
  const cardY = 280;
  card(f, cx, cardY, cw, 360);
  let y = cardY + 24;
  [["aws", "Sign in with AWS SSO", "#FF9900"], ["O", "Sign in with Okta", "#1d6ad7"]].forEach((b) => {
    const btn = rect(f, cx + 24, y, cw - 48, 42, T.surface2, 8);
    btn.strokes = [paint(T.border)];
    rect(f, cx + 40, y + 13, 16, 16, b[2], 4);
    txt(f, cx + 70, y + 13, b[1], { size: 13, weight: "Medium" });
    y += 52;
  });
  // divider
  hr(f, cx + 24, y + 10, 150);
  txt(f, cx + 184, y + 4, "OR", { size: 11, color: T.faint });
  hr(f, cx + 210, y + 10, 146);
  y += 34;
  ["Email", "Password"].forEach((lbl, i) => {
    txt(f, cx + 24, y, lbl.toUpperCase(), { size: 10, color: T.faint, weight: "Medium", spacing: 0.6 });
    const inp = rect(f, cx + 24, y + 16, cw - 48, 40, T.bg, 8);
    inp.strokes = [paint(T.border)];
    txt(f, cx + 38, y + 28, i === 0 ? "mohamad.karnib@acme.io" : "••••••••••", { size: 13, color: i === 0 ? T.text : T.muted });
    y += 70;
  });
  const cta = rect(f, cx + 24, y, cw - 48, 42, T.indigo, 8);
  txt(f, cx + 24, y + 13, "Sign in  →", { size: 13, color: T.white, weight: "Medium", align: "CENTER", w: cw - 48 });
  txt(f, cx, 664, "SOC 2 Type II · ISO 42001 · EU AI Act aligned", {
    size: 11,
    color: T.faint,
    align: "CENTER",
    w: cw,
  });
  return f;
}

function buildOnboarding() {
  const f = frame("02 · Onboarding", 1440, 900, T.bg);
  rect(f, 120, 120, 360, 360, T.indigo, 360, 0.14);
  const cw = 660;
  const cx = (1440 - cw) / 2;
  rect(f, 1440 / 2 - 18, 120, 36, 36, T.indigo, 10);
  txt(f, 1440 / 2 - 7, 131, "◈", { size: 15, color: T.white, weight: "Bold" });
  // stepper
  const steps = ["Connect agent", "Write policy", "Protected"];
  let sx = cx + 150;
  steps.forEach((s, i) => {
    const cdone = i === 0;
    const cnow = i === 1;
    const cc = figma.createEllipse();
    cc.resize(28, 28);
    cc.x = sx;
    cc.y = 184;
    cc.fills = [paint(cdone ? T.accent : cnow ? T.indigo : T.surface2)];
    f.appendChild(cc);
    txt(f, sx, 191, cdone ? "✓" : String(i + 1), { size: 12, color: cdone ? T.bg : cnow ? T.white : T.faint, weight: "Semi Bold", align: "CENTER", w: 28 });
    txt(f, sx + 36, 191, s, { size: 12, weight: "Medium", color: i <= 1 ? T.text : T.faint });
    if (i < 2) rect(f, sx + 36 + s.length * 7 + 14, 197, 40, 1, T.border);
    sx += 36 + s.length * 7 + 70;
  });
  // card — step 2 (write policy) shown
  const cardY = 240;
  card(f, cx, cardY, cw, 420);
  txt(f, cx + 24, cardY + 22, "✦  Write your first policy", { size: 16, weight: "Semi Bold" });
  txt(f, cx + 24, cardY + 48, "Describe a rule in plain English. We compile it to Cedar and a formal-logic proof.", {
    size: 13,
    color: T.muted,
    w: cw - 48,
  });
  const ta = rect(f, cx + 24, cardY + 84, cw - 48, 56, T.bg, 8);
  ta.strokes = [paint(T.border)];
  txt(f, cx + 38, cardY + 100, "Agents may only refund up to $500 without approval.", { size: 13 });
  const cbtn = rect(f, cx + 24, cardY + 152, 110, 34, T.indigo, 8);
  txt(f, cx + 24, cardY + 161, "✦ Compile", { size: 13, color: T.white, weight: "Medium", align: "CENTER", w: 110 });
  // output two panels
  const pw = (cw - 48 - 12) / 2;
  [["CEDAR", `permit (\n  principal,\n  action ==\n   Action::"process_refund",\n  resource\n) when {\n  context.amount <= 500\n};`],
   ["FORMAL LOGIC", `∀ a, r:\n exec(a, refund(r))\n  → amount(r) ≤ 500\n  ∨ approved(r)\n\n⊢ verified\n 0 counterexamples`]].forEach((p, i) => {
    const px = cx + 24 + i * (pw + 12);
    const pc = rect(f, px, cardY + 200, pw, 190, T.bg, 8);
    pc.strokes = [paint(T.border)];
    rect(f, px, cardY + 200, pw, 26, T.surface2, 8);
    txt(f, px + 12, cardY + 207, p[0], { size: 10, color: T.faint, family: "Roboto Mono" });
    txt(f, px + 12, cardY + 236, p[1], { size: 11, color: T.muted, family: "Roboto Mono", w: pw - 24 });
  });
  // footer
  hr(f, cx + 24, cardY + 372, cw - 48);
  txt(f, cx + 24, cardY + 388, "Back", { size: 13, color: T.faint });
  const next = rect(f, cx + cw - 24 - 150, cardY + 380, 150, 34, T.indigo, 8);
  txt(f, cx + cw - 24 - 150, cardY + 389, "Confirm Policy  →", { size: 13, color: T.white, weight: "Medium", align: "CENTER", w: 150 });
  return f;
}

function buildDashboard() {
  const f = frame("03 · Dashboard", 1440, 900, T.bg);
  const { cx, cy, cw } = shell(f, "Dashboard", "Dashboard");
  pageHeading(f, cx, cy, "Command Center", "Real-time governance across 5 registered agents · Acme Corp");
  // metrics
  const metrics = [
    ["Verifications Today", "75,712", "↑ live", T.accent],
    ["Block Rate", "1.9%", "▼ 0.4pp vs 7 days", T.block],
    ["Verification Latency", "142ms", "p50 · 620ms p99", T.info],
    ["Active Agents", "4", "5 registered total", T.allow],
    ["Open Human Reviews", "4", "Go to queue →", T.review],
  ];
  const mw = (cw - 4 * 16) / 5;
  metrics.forEach((m, i) => metric(f, cx + i * (mw + 16), cy + 64, mw, m[0], m[1], m[2], m[3]));
  sparkline(f, cx + 16, cy + 64 + 40, mw - 32, 26, T.accent);

  // live feed
  const feedY = cy + 180;
  const feedW = cw - 372;
  const feedH = 540;
  card(f, cx, feedY, feedW, feedH, T.surface);
  const fd = figma.createEllipse();
  fd.resize(8, 8);
  fd.x = cx + 16;
  fd.y = feedY + 16;
  fd.fills = [paint(T.accent)];
  f.appendChild(fd);
  txt(f, cx + 32, feedY + 11, "Live Action Feed", { size: 13, weight: "Semi Bold" });
  txt(f, cx + 160, feedY + 13, "intercepting every tool call · < 800ms SLA", { size: 11, color: T.faint });
  hr(f, cx, feedY + 40, feedW);
  const rows = [
    ["1s", "ProcureBot", 'lookup_vendor(name="Insight")', "32ms", "ALLOW"],
    ["6s", "DataSync Agent", 'query_warehouse(table="events")', "30ms", "ALLOW"],
    ["9s", "SupportGPT Triage", 'send_email(to="customer@acme.io")', "86ms", "ALLOW"],
    ["23s", "FinPilot Refund Agent", 'process_refund(amount=50000, vendor="globaltrust-89.ru")', "352ms", "BLOCK"],
    ["54s", "ProcureBot", "create_po(amount=38000, vendor=…)", "410ms", "HUMAN_REVIEW"],
    ["1m", "DataSync Agent", 'export_dataset(dataset="eu_customers")', "298ms", "BLOCK"],
    ["1m", "FinPilot Refund Agent", "process_refund(amount=240)", "64ms", "ALLOW"],
    ["2m", "SupportGPT Triage", 'lookup_order(order_id="ORD-88210")', "41ms", "ALLOW"],
  ];
  let ry = feedY + 52;
  rows.forEach((r) => {
    if (r[4] === "BLOCK") rect(f, cx + 1, ry - 6, feedW - 2, 44, T.block, 0, 0.08);
    txt(f, cx + 16, ry, "›", { size: 13, color: T.faint });
    txt(f, cx + 36, ry + 1, r[0] + " ago", { size: 11, color: T.faint, family: "Roboto Mono" });
    txt(f, cx + 100, ry, r[1], { size: 12, weight: "Medium", w: 150 });
    txt(f, cx + 262, ry + 1, r[2], { size: 11, color: T.muted, family: "Roboto Mono", w: feedW - 420 });
    txt(f, cx + feedW - 150, ry + 1, r[3], { size: 11, color: T.faint, family: "Roboto Mono" });
    verdictBadge(f, cx + feedW - 110, ry - 3, r[4]);
    hr(f, cx, ry + 32, feedW);
    ry += 44;
  });

  // right column
  const rx = cx + feedW + 16;
  const rw = 356;
  // heatmap
  card(f, rx, feedY, rw, 180);
  cardTitle(f, rx + 16, feedY + 14, "Risk Heatmap", "Block / review density · last 7 days");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heatColors = [T.surface3, "#3a3326", "#5a4520", T.review, T.block];
  for (let d = 0; d < 7; d++) {
    txt(f, rx + 16, feedY + 56 + d * 16, days[d], { size: 9, color: T.faint });
    for (let h = 0; h < 24; h++) {
      const v = (d * 7 + h * 3) % 5;
      rect(f, rx + 48 + h * 11.5, feedY + 54 + d * 16, 9, 11, heatColors[v], 2);
    }
  }
  // top blocked
  card(f, rx, feedY + 196, rw, 170);
  cardTitle(f, rx + 16, feedY + 210, "Top Blocked Actions", "Most frequently blocked");
  const tb = [["process_refund", 12], ["send_email", 7], ["export_dataset", 4], ["create_po", 3], ["issue_credit", 2]];
  tb.forEach((b, i) => {
    const by = feedY + 248 + i * 22;
    txt(f, rx + 16, by, b[0], { size: 11, color: T.muted, family: "Roboto Mono" });
    rect(f, rx + 150, by + 2, 160, 6, T.surface3, 3);
    rect(f, rx + 150, by + 2, (b[1] / 12) * 160, 6, T.block, 3);
    txt(f, rx + 320, by, String(b[1]), { size: 11, weight: "Medium" });
  });
  // policy coverage
  card(f, rx, feedY + 382, rw, 158);
  cardTitle(f, rx + 16, feedY + 396, "Policy Coverage", "Actions covered by ≥ 1 policy");
  donut(f, rx + 70, feedY + 470, 44, 16, T.accent, 0.94, "94%");
  txt(f, rx + 140, feedY + 452, "● Covered   94%", { size: 12, color: T.muted });
  txt(f, rx + 140, feedY + 474, "● Uncovered   6%", { size: 12, color: T.faint });
  return f;
}

function buildAgents() {
  const f = frame("04 · Agents", 1440, 900, T.bg);
  const { cx, cy, cw } = shell(f, "Agents", "Agents");
  pageHeading(f, cx, cy, "Agents", "5 registered · 4 active");
  const data = [
    ["FinPilot Refund Agent", "ag_finpilot", "Active", "LangGraph", "18,432", "3.1%", "92"],
    ["SupportGPT Triage", "ag_supportgpt", "Active", "CrewAI", "41,200", "0.8%", "88"],
    ["ProcureBot", "ag_procbot", "Active", "Strands SDK", "6,210", "5.2%", "79"],
    ["HR Copilot", "ag_hrcopilot", "Paused", "LangGraph", "0", "0.0%", "71"],
    ["DataSync Agent", "ag_datasync", "Active", "CrewAI", "9,870", "1.9%", "84"],
  ];
  const colW = (cw - 2 * 16) / 3;
  data.forEach((a, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = cx + col * (colW + 16);
    const y = cy + 56 + row * 200;
    card(f, x, y, colW, 184);
    rect(f, x + 16, y + 16, 40, 40, T.surface2, 10);
    txt(f, x + 28, y + 28, "▣", { size: 16, color: T.accent });
    txt(f, x + 66, y + 18, a[0], { size: 13, weight: "Semi Bold", w: colW - 90 });
    txt(f, x + 66, y + 38, a[1], { size: 11, color: T.faint, family: "Roboto Mono" });
    const tone = a[2] === "Active" ? T.allow : a[2] === "Paused" ? T.review : T.block;
    pill(f, x + 16, y + 66, a[2], tone, { size: 10 });
    pill(f, x + 16 + 70, y + 66, a[3], T.muted, { size: 10, bg: T.surface2, bgOpacity: 1 });
    pill(f, x + 16 + 160, y + 66, "3 policies", T.accent, { size: 10 });
    hr(f, x + 16, y + 104, colW - 32);
    const stats = [["24h verifs", a[4]], ["block rate", a[5]], ["RT score", a[6]]];
    stats.forEach((s, j) => {
      const sxx = x + 16 + j * ((colW - 32) / 3);
      txt(f, sxx, y + 118, s[1], { size: 14, weight: "Semi Bold", align: "CENTER", w: (colW - 32) / 3 - 8 });
      txt(f, sxx, y + 140, s[0].toUpperCase(), { size: 9, color: T.faint, align: "CENTER", w: (colW - 32) / 3 - 8, spacing: 0.4 });
    });
    sparkline(f, x + 16, y + 158, colW - 32, 16, T.accent);
  });
  return f;
}

function buildAgentDetail() {
  const f = frame("05 · Agent Detail", 1440, 900, T.bg);
  const { cx, cy, cw } = shell(f, "Agents", "Agent Detail");
  txt(f, cx, cy, "← All agents", { size: 11, color: T.faint });
  rect(f, cx, cy + 24, 48, 48, T.surface2, 14);
  txt(f, cx + 16, cy + 38, "▣", { size: 20, color: T.accent });
  txt(f, cx + 62, cy + 26, "FinPilot Refund Agent", { size: 20, weight: "Semi Bold" });
  pill(f, cx + 320, cy + 30, "Active", T.allow, { size: 11 });
  txt(f, cx + 62, cy + 54, "ag_finpilot · LangGraph · Registered 2026-03-12 · Payments Platform", {
    size: 12,
    color: T.muted,
  });
  // buttons
  const b1 = rect(f, cw + cx - 300, cy + 26, 150, 34, T.accent, 8, 0.12);
  b1.strokes = [paint(T.accent, 0.45)];
  txt(f, cw + cx - 300, cy + 35, "⚔ Red-Team This Agent", { size: 12, color: T.accent, weight: "Medium", align: "CENTER", w: 150 });
  const b2 = rect(f, cw + cx - 140, cy + 26, 140, 34, T.block, 8, 0.12);
  b2.strokes = [paint(T.block, 0.45)];
  txt(f, cw + cx - 140, cy + 35, "⏻ Kill Switch", { size: 12, color: T.block, weight: "Medium", align: "CENTER", w: 140 });
  // tabs
  const tabs = ["Overview", "Live Trace", "Policies", "Red Team Results", "Audit Trail"];
  let tx = cx;
  hr(f, cx, cy + 96, cw);
  tabs.forEach((t, i) => {
    txt(f, tx, cy + 80, t, { size: 13, weight: "Medium", color: i === 0 ? T.text : T.faint });
    if (i === 0) rect(f, tx, cy + 95, t.length * 8, 2, T.accent, 1);
    tx += t.length * 8 + 28;
  });
  // overview content
  const ly = cy + 124;
  const lw = cw - 340;
  // action volume chart
  card(f, cx, ly, lw, 260);
  cardTitle(f, cx + 16, ly + 14, "Action Volume", "Allow vs. block vs. human_review");
  // fake stacked area as bars
  for (let i = 0; i < 24; i++) {
    const bx = cx + 24 + i * ((lw - 48) / 24);
    const bw = (lw - 48) / 24 - 3;
    rect(f, bx, ly + 200, bw, 30, T.block, 2, 0.5);
    rect(f, bx, ly + 130, bw, 70, T.allow, 2, 0.4);
  }
  txt(f, cx + 24, ly + 240, "● Allow    ● Human Review    ● Block", { size: 11, color: T.muted });
  // top actions table
  card(f, cx, ly + 280, lw, 180);
  cardTitle(f, cx + 16, ly + 294, "Top Actions", "Per-action block rate, last 24h");
  const ta = [["process_refund", "8,420", "4.0%"], ["lookup_order", "5,210", "0.0%"], ["send_email", "3,110", "2.0%"], ["issue_credit", "1,690", "6.0%"]];
  let ay = ly + 330;
  ta.forEach((r) => {
    txt(f, cx + 16, ay, r[0], { size: 12, family: "Roboto Mono" });
    txt(f, cx + lw - 220, ay, r[1], { size: 12, color: T.muted, align: "RIGHT", w: 80 });
    txt(f, cx + lw - 90, ay, r[2], { size: 12, color: r[2] === "6.0%" || r[2] === "4.0%" ? T.block : T.muted, align: "RIGHT", w: 70 });
    hr(f, cx + 16, ay + 22, lw - 32);
    ay += 32;
  });
  // right column
  const rx = cx + lw + 16;
  const rw = 324;
  card(f, rx, ly, rw, 80);
  cardTitle(f, rx + 16, ly + 14, "Verdict Breakdown");
  rect(f, rx + 16, ly + 44, rw - 32, 10, T.surface3, 5);
  rect(f, rx + 16, ly + 44, (rw - 32) * 0.95, 10, T.allow, 5);
  rect(f, rx + 16 + (rw - 32) * 0.95, ly + 44, (rw - 32) * 0.03, 10, T.review);
  card(f, rx, ly + 96, rw, 120);
  cardTitle(f, rx + 16, ly + 110, "Red-Team Score");
  txt(f, rx + 16, ly + 130, "92", { size: 30, weight: "Semi Bold", color: T.accent });
  txt(f, rx + 64, ly + 148, "/ 100", { size: 12, color: T.faint });
  sparkline(f, rx + 16, ly + 178, rw - 32, 24, T.accent);
  card(f, rx, ly + 232, rw, 200);
  cardTitle(f, rx + 16, ly + 246, "Assigned Policies", "Cedar policies applied");
  ["Refund Approval Threshold", "No PII in External Email", "Sanctioned Vendor Geo-Block"].forEach((p, i) => {
    const py = ly + 280 + i * 40;
    const pc = rect(f, rx + 16, py, rw - 32, 32, T.bg, 8);
    pc.strokes = [paint(T.border)];
    txt(f, rx + 30, py + 9, "▤  " + p, { size: 11, color: T.text });
  });
  return f;
}

function buildPolicyStudio() {
  const f = frame("06 · Policy Studio", 1440, 900, T.bg);
  const { cx, cy, cw } = shell(f, "Policy Studio", "Policy Studio");
  pageHeading(f, cx, cy, "Policy Studio", "Plain-English rules compiled to Cedar + formally verified");
  const nb = rect(f, cx + cw - 120, cy + 4, 120, 34, T.accent, 8, 0.12);
  nb.strokes = [paint(T.accent, 0.45)];
  txt(f, cx + cw - 120, cy + 13, "+ New Policy", { size: 12, color: T.accent, weight: "Medium", align: "CENTER", w: 120 });
  // table
  card(f, cx, cy + 64, cw, 480);
  const cols = ["POLICY", "TYPE", "BOUND AGENTS", "FRAMEWORKS", "STATUS", "LAST MODIFIED"];
  const cw2 = [cw * 0.28, cw * 0.14, cw * 0.13, cw * 0.2, cw * 0.12, cw * 0.13];
  let colx = cx + 16;
  cols.forEach((c, i) => {
    txt(f, colx, cy + 80, c, { size: 10, color: T.faint, weight: "Medium", spacing: 0.5 });
    colx += cw2[i];
  });
  hr(f, cx + 16, cy + 100, cw - 32);
  const rows = [
    ["Refund Approval Threshold", "pol_refund_cap", "Cedar", "1", "SOC 2  EU AI Act", "Active", "2026-06-18"],
    ["No PII in External Email", "pol_pii_email", "Cedar", "4", "EU AI Act  ISO 42001", "Active", "2026-06-10"],
    ["Sanctioned Vendor Geo-Block", "pol_vendor_geo", "Formal Logic", "2", "SOC 2", "Active", "2026-06-01"],
    ["Purchase Order Sign-off", "pol_po_approval", "Cedar", "1", "SOC 2  ISO 42001", "Active", "2026-05-22"],
    ["Customer Tone & Safety", "pol_tone", "Natural Lang.", "1", "EU AI Act", "Draft", "2026-06-20"],
    ["Cross-Border Data Export", "pol_export_geo", "Cedar", "1", "EU AI Act  ISO 42001", "Active", "2026-05-30"],
  ];
  let ry = cy + 116;
  rows.forEach((r) => {
    rect(f, cx + 16, ry + 4, 28, 28, T.surface2, 8);
    txt(f, cx + 25, ry + 11, "▤", { size: 12, color: T.accent });
    txt(f, cx + 52, ry + 4, r[0], { size: 12, weight: "Medium", w: cw2[0] - 60 });
    txt(f, cx + 52, ry + 21, r[1], { size: 10, color: T.faint, family: "Roboto Mono" });
    let xx = cx + 16 + cw2[0];
    txt(f, xx, ry + 10, r[2], { size: 12, color: T.muted });
    xx += cw2[1];
    txt(f, xx + 20, ry + 10, r[3], { size: 12, color: T.muted });
    xx += cw2[2];
    txt(f, xx, ry + 10, r[4], { size: 10, color: T.info, w: cw2[3] - 10 });
    xx += cw2[3];
    pill(f, xx, ry + 6, r[5], r[5] === "Active" ? T.allow : T.review, { size: 10 });
    xx += cw2[4];
    txt(f, xx, ry + 10, r[6], { size: 11, color: T.muted });
    hr(f, cx + 16, ry + 40, cw - 32);
    ry += 48;
  });
  return f;
}

function buildPolicyEditor() {
  const f = frame("07 · Policy Editor", 1440, 900, T.bg);
  const { cx, cy, cw } = shell(f, "Policy Studio", "Policy Studio");
  txt(f, cx, cy, "← Policy Studio", { size: 11, color: T.faint });
  pageHeading(f, cx, cy + 18, "Edit · Refund Approval Threshold");
  const half = (cw - 20) / 2;
  // left NL
  card(f, cx, cy + 64, half, 460);
  cardTitle(f, cx + 16, cy + 80, "✦  Natural Language", "Describe the rule in plain English");
  const ta = rect(f, cx + 16, cy + 116, half - 32, 160, T.bg, 8);
  ta.strokes = [paint(T.border)];
  txt(f, cx + 30, cy + 130, "Agents may only refund up to $500 without human approval. Any refund of $10,000 or more requires dual approval from a manager.", {
    size: 13,
    w: half - 60,
  });
  const cb = rect(f, cx + half - 130, cy + 288, 114, 34, T.indigo, 8);
  txt(f, cx + half - 130, cy + 297, "✦ Compile", { size: 13, color: T.white, weight: "Medium", align: "CENTER", w: 114 });
  hr(f, cx + 16, cy + 340, half - 32);
  const tbtn = rect(f, cx + 16, cy + 356, half - 32, 34, T.surface2, 8);
  tbtn.strokes = [paint(T.border)];
  txt(f, cx + 16, cy + 365, "↺ Test Against History (last 1,000 actions)", { size: 12, color: T.muted, align: "CENTER", w: half - 32 });
  // replay deltas
  const dlt = [["Now BLOCK", "+9", T.block], ["Now REVIEW", "+3", T.review], ["Unchanged", "988", T.muted]];
  dlt.forEach((d, i) => {
    const dx = cx + 16 + i * ((half - 32) / 3 + 0) + i * 4;
    const dw = (half - 32 - 8) / 3;
    rect(f, dx, cy + 400, dw, 50, T.bg, 8);
    txt(f, dx, cy + 410, d[1], { size: 16, weight: "Semi Bold", color: d[2], align: "CENTER", w: dw });
    txt(f, dx, cy + 432, d[0].toUpperCase(), { size: 9, color: T.faint, align: "CENTER", w: dw, spacing: 0.4 });
  });
  const act = rect(f, cx + 16, cy + 462, half - 32, 34, T.accent, 8, 0.14);
  act.strokes = [paint(T.accent, 0.45)];
  txt(f, cx + 16, cy + 471, "✓ Save & Re-activate", { size: 13, color: T.accent, weight: "Medium", align: "CENTER", w: half - 32 });
  // right outputs
  const rx = cx + half + 20;
  card(f, rx, cy + 64, half, 224);
  cardTitle(f, rx + 16, cy + 80, "▤  Cedar Policy", "Authored, version-controlled authorization");
  pill(f, rx + half - 90, cy + 78, "generated", T.accent, { size: 10 });
  const cc = rect(f, rx + 16, cy + 116, half - 32, 156, T.bg, 8);
  cc.strokes = [paint(T.border)];
  txt(f, rx + 28, cy + 128, `permit (\n  principal in Agent::"finpilot",\n  action == Action::"process_refund",\n  resource\n) when { context.amount <= 500 };\n\nforbid ( principal, action, resource )\nwhen { context.amount >= 10000 &&\n       context.approvals < 2 };`, {
    size: 11,
    color: T.muted,
    family: "Roboto Mono",
    w: half - 56,
  });
  card(f, rx, cy + 300, half, 224);
  cardTitle(f, rx + 16, cy + 316, "Σ  Formal Logic", "Automated Reasoning · provably correct");
  pill(f, rx + half - 80, cy + 314, "verified", T.allow, { size: 10 });
  const fc = rect(f, rx + 16, cy + 352, half - 32, 156, T.bg, 8);
  fc.strokes = [paint(T.border)];
  txt(f, rx + 28, cy + 364, `∀ a ∈ Agents, r ∈ Refunds:\n exec(a, refund(r)) →\n  (amount(r) ≤ 500)\n  ∨ (approvals(r) ≥ 2 ∧\n     role(approver) = MANAGER)\n\n⊢ SAT · 0 counterexamples`, {
    size: 11,
    color: T.muted,
    family: "Roboto Mono",
    w: half - 56,
  });
  return f;
}

function buildRedTeam() {
  const f = frame("08 · Red Team", 1440, 900, T.bg);
  const { cx, cy, cw } = shell(f, "Red Team", "Red Team");
  pageHeading(f, cx, cy, "Red Team Center", "Continuous adversarial testing — war room for agent resilience");
  const rb = rect(f, cx + cw - 110, cy + 4, 110, 34, T.accent, 8, 0.12);
  rb.strokes = [paint(T.accent, 0.45)];
  txt(f, cx + cw - 110, cy + 13, "▶ Run Now", { size: 12, color: T.accent, weight: "Medium", align: "CENTER", w: 110 });
  // score + schedule (left)
  const lw = 264;
  card(f, cx, cy + 64, lw, 150);
  cardTitle(f, cx + 16, cy + 78, "Org Red-Team Score");
  txt(f, cx + 16, cy + 100, "83", { size: 36, weight: "Semi Bold", color: T.accent });
  txt(f, cx + 76, cy + 122, "/ 100", { size: 13, color: T.faint });
  sparkline(f, cx + 16, cy + 160, lw - 32, 28, T.accent);
  txt(f, cx + 16, cy + 192, "↑ +6 over the last 30 days", { size: 11, color: T.allow });
  card(f, cx, cy + 230, lw, 130);
  cardTitle(f, cx + 16, cy + 244, "Schedule", "EventBridge cron");
  const sc = rect(f, cx + 16, cy + 276, lw - 32, 50, T.bg, 8);
  sc.strokes = [paint(T.border)];
  txt(f, cx + 30, cy + 286, "Nightly at 2:00 AM UTC", { size: 12, weight: "Medium" });
  txt(f, cx + 30, cy + 304, "cron(0 2 * * ? *)", { size: 11, color: T.faint, family: "Roboto Mono" });
  // matrix (centerpiece)
  const mx = cx + lw + 16;
  const mw = cw - lw - 16;
  card(f, mx, cy + 64, mw, 360);
  cardTitle(f, mx + 16, cy + 80, "Attack Coverage Matrix", "Latest result per agent × attack type");
  hr(f, mx, cy + 110, mw);
  const attacks = ["Prompt\nInjection", "Privilege\nEscalation", "Data\nExfiltration", "Social\nEngineering", "Goal\nHijack"];
  const cellW = (mw - 200 - 40) / 5;
  attacks.forEach((a, i) => {
    txt(f, mx + 200 + i * cellW, cy + 120, a, { size: 9, color: T.faint, align: "CENTER", w: cellW - 8 });
  });
  const agentsM = [
    ["FinPilot Refund Agent", [1, 1, 1, 1, 1]],
    ["SupportGPT Triage", [1, 1, 0, 1, 1]],
    ["ProcureBot", [1, 1, 0, 0, 1]],
    ["HR Copilot", [0, 1, 1, 1, 0]],
    ["DataSync Agent", [1, 1, 1, 1, 0]],
  ];
  agentsM.forEach((ag, r) => {
    const ay = cy + 150 + r * 44;
    txt(f, mx + 16, ay + 12, ag[0], { size: 12, weight: "Medium", w: 180 });
    ag[1].forEach((c, i) => {
      const cxp = mx + 200 + i * cellW + (cellW - 44) / 2;
      rect(f, cxp, ay, 44, 36, c ? T.allow : T.block, 8, 0.13);
      txt(f, cxp, ay + 9, c ? "✓" : "✕", { size: 15, color: c ? T.allow : T.block, align: "CENTER", w: 44 });
    });
  });
  txt(f, mx + 16, cy + 384, "✓ Caught      ✕ Escaped      —  Not tested", { size: 11, color: T.muted });
  // recent runs
  txt(f, cx, cy + 444, "Recent Runs", { size: 13, weight: "Semi Bold" });
  const runs = [["FinPilot Refund Agent · 2026-06-24", "5/5 attacks blocked", "PASS", T.allow], ["ProcureBot · 2026-06-24", "3/5 attacks blocked", "FAIL", T.block]];
  runs.forEach((rn, i) => {
    const rxp = cx + i * ((cw - 16) / 2 + 16);
    const rwp = (cw - 16) / 2;
    card(f, rxp, cy + 472, rwp, 70);
    rect(f, rxp + 16, cy + 488, 36, 36, rn[3], 8, 0.13);
    txt(f, rxp + 26, cy + 498, rn[2] === "PASS" ? "✓" : "!", { size: 16, color: rn[3], align: "CENTER", w: 16 });
    txt(f, rxp + 64, cy + 488, rn[0], { size: 12, weight: "Medium" });
    txt(f, rxp + 64, cy + 506, rn[1], { size: 11, color: T.faint });
    pill(f, rxp + rwp - 70, cy + 494, rn[2], rn[3], { size: 10 });
  });
  return f;
}

function buildCompliance() {
  const f = frame("09 · Compliance", 1440, 900, T.bg);
  const { cx, cy, cw } = shell(f, "Compliance", "Compliance");
  pageHeading(f, cx, cy, "Evidence & Compliance", "Continuous, audit-ready evidence mapped to regulatory controls");
  // framework tabs
  const fws = ["EU AI Act", "ISO 42001", "SOC 2", "HIPAA", "FedRAMP", "DORA", "NIS2"];
  let fx = cx;
  fws.forEach((fw, i) => {
    const active = i === 1;
    const soon = i > 2;
    const w = fw.length * 8 + 30;
    const b = rect(f, fx, cy + 60, w, 36, active ? T.accent : T.surface, 8, active ? 0.12 : 1);
    b.strokes = [paint(active ? T.accent : T.border, active ? 0.6 : 1)];
    if (soon) b.dashPattern = [4, 3];
    txt(f, fx, cy + 70, fw + (soon ? "  soon" : ""), { size: 12, weight: "Medium", color: active ? T.accent : soon ? T.faint : T.muted, align: "CENTER", w });
    fx += w + 8;
  });
  // control mapping table
  const lw = cw - 340;
  card(f, cx, cy + 116, lw, 420);
  cardTitle(f, cx + 16, cy + 132, "Control Mapping", "5 controls · ISO 42001");
  pill(f, cx + lw - 150, cy + 130, "60% full coverage", T.allow, { size: 10 });
  hr(f, cx + 16, cy + 162, lw - 32);
  const ctrls = [
    ["A.6", "AI System Decision Oversight", "Covered", "642", "2026-06-24"],
    ["A.7", "Data for AI Systems", "Covered", "880", "2026-06-24"],
    ["A.8", "Information for Interested Parties", "Partial", "54", "2026-06-20"],
    ["A.9", "Use of AI Systems", "Covered", "184,320", "2026-06-24"],
    ["A.10", "Third-Party Relationships", "Partial", "32", "2026-06-19"],
  ];
  let ry = cy + 180;
  ctrls.forEach((c) => {
    txt(f, cx + 16, ry, c[0], { size: 11, color: T.accent, family: "Roboto Mono" });
    txt(f, cx + 70, ry, c[1], { size: 12 });
    pill(f, cx + lw - 360, ry - 4, c[2], c[2] === "Covered" ? T.allow : T.review, { size: 10 });
    txt(f, cx + lw - 220, ry, c[3], { size: 12, color: T.muted, align: "RIGHT", w: 80 });
    txt(f, cx + lw - 120, ry, c[4], { size: 11, color: T.muted });
    hr(f, cx + 16, ry + 26, lw - 32);
    ry += 40;
  });
  // right column
  const rx = cx + lw + 16;
  const rw = 324;
  card(f, rx, cy + 116, rw, 170);
  cardTitle(f, rx + 16, cy + 130, "Coverage", "Controls with full evidence");
  donut(f, rx + 70, cy + 210, 44, 16, T.allow, 0.6, "60%");
  txt(f, rx + 140, cy + 184, "● Covered  60%", { size: 11, color: T.muted });
  txt(f, rx + 140, cy + 204, "● Partial  40%", { size: 11, color: T.review });
  txt(f, rx + 140, cy + 224, "● Gap  0%", { size: 11, color: T.faint });
  card(f, rx, cy + 300, rw, 236);
  cardTitle(f, rx + 16, cy + 314, "▤  Evidence Pack", "Cryptographically sealed, auditor-ready");
  const pk = rect(f, rx + 16, cy + 348, rw - 32, 64, T.bg, 8);
  pk.strokes = [paint(T.border)];
  rect(f, rx + 28, cy + 360, 36, 40, T.surface, 4).strokes = [paint(T.borderStrong)];
  txt(f, rx + 34, cy + 374, "PDF", { size: 8, color: T.block, weight: "Bold" });
  txt(f, rx + 78, cy + 358, "ISO_42001_Evidence_Pack.pdf", { size: 11, weight: "Medium" });
  txt(f, rx + 78, cy + 376, "48 pages · 5 controls · 2026-06-24", { size: 10, color: T.faint });
  txt(f, rx + 78, cy + 392, "✓ integrity verified", { size: 9, color: T.allow });
  txt(f, rx + 16, cy + 426, "# sha256:9f3a1c7e4b20d88f1aa6", { size: 10, color: T.muted, family: "Roboto Mono" });
  txt(f, rx + 16, cy + 444, "🔒 s3://aegis-evidence-prod/iso-42001/…", { size: 10, color: T.muted, family: "Roboto Mono" });
  const sh = rect(f, rx + 16, cy + 470, rw - 32, 34, T.accent, 8, 0.14);
  sh.strokes = [paint(T.accent, 0.45)];
  txt(f, rx + 16, cy + 479, "⇪ Share with Auditor", { size: 12, color: T.accent, weight: "Medium", align: "CENTER", w: rw - 32 });
  return f;
}

function buildShadowRadar() {
  const f = frame("10 · Shadow Radar", 1440, 900, T.bg);
  const { cx, cy, cw } = shell(f, "Shadow Radar", "Shadow Radar");
  pageHeading(f, cx, cy, "Shadow Agent Radar", "Discovering AI agents in your AWS account via CloudTrail, VPC Flow & LLM egress");
  // alert banner
  const ab = rect(f, cx, cy + 60, cw, 44, T.block, 10, 0.13);
  ab.strokes = [paint(T.block, 0.4)];
  txt(f, cx + 16, cy + 74, "⚠  3 unregistered agents detected in your AWS account. Register them to ensure governance coverage.", {
    size: 12,
    color: T.text,
  });
  // radar
  const rw = 300;
  card(f, cx, cy + 120, rw, 360);
  cardTitle(f, cx + 16, cy + 134, "Radar", "Detection density by source");
  const rcx = cx + rw / 2;
  const rcy = cy + 300;
  [90, 60, 30].forEach((rr) => {
    const e = figma.createEllipse();
    e.resize(rr * 2, rr * 2);
    e.x = rcx - rr;
    e.y = rcy - rr;
    e.fills = [];
    e.strokes = [paint(T.border)];
    e.strokeWeight = 1;
    f.appendChild(e);
  });
  const blips = [[1, T.allow], [0, T.block], [0, T.block], [0, T.block], [1, T.allow], [1, T.allow]];
  blips.forEach((b, i) => {
    const ang = (i / 6) * Math.PI * 2;
    const rad = 30 + (i % 3) * 28;
    const d = figma.createEllipse();
    d.resize(8, 8);
    d.x = rcx + Math.cos(ang) * rad - 4;
    d.y = rcy + Math.sin(ang) * rad - 4;
    d.fills = [paint(b[1])];
    f.appendChild(d);
  });
  txt(f, cx + 16, cy + 446, "● Registered      ● Unregistered", { size: 11, color: T.muted });
  // table
  const tx = cx + rw + 16;
  const tw = cw - rw - 16;
  card(f, tx, cy + 120, tw, 360);
  cardTitle(f, tx + 16, cy + 134, "Detected Agents", "6 agents detected");
  hr(f, tx + 16, cy + 162, tw - 32);
  const cols = ["FINGERPRINT", "SOURCE", "DETECTION", "FIRST / LAST SEEN", "STATUS", ""];
  const cwd = [tw * 0.2, tw * 0.22, tw * 0.16, tw * 0.2, tw * 0.14, tw * 0.08];
  let colx = tx + 16;
  cols.forEach((c, i) => {
    txt(f, colx, cy + 172, c, { size: 9, color: T.faint, weight: "Medium", spacing: 0.4 });
    colx += cwd[i];
  });
  const rows = [
    ["sha256:a3f1c9e2b7d4", "bedrock.amazonaws.com", "CloudTrail", "03-12 → 06-24", "Registered", 1],
    ["sha256:7d4e0a91fce9", "lambda.amazonaws.com", "CloudTrail", "06-21 → 06-24", "Unregistered", 0],
    ["sha256:e91b2c4d7a30", "sagemaker.amazonaws.com", "VPC Flow", "06-23 → 06-24", "Unregistered", 0],
    ["sha256:0c5f8a3e2188", "api.openai.com", "LLM API egress", "06-22 → 06-24", "Unregistered", 0],
    ["sha256:b6e4d90c1faa", "bedrock.amazonaws.com", "CloudTrail", "02-28 → 06-24", "Registered", 1],
    ["sha256:f2a7c3e8b0d1", "ecs.amazonaws.com", "VPC Flow", "04-02 → 06-24", "Registered", 1],
  ];
  let ry = cy + 196;
  rows.forEach((r) => {
    let xx = tx + 16;
    txt(f, xx, ry, r[0], { size: 10, color: T.muted, family: "Roboto Mono" });
    xx += cwd[0];
    txt(f, xx, ry, r[1], { size: 10, family: "Roboto Mono" });
    xx += cwd[1];
    pill(f, xx, ry - 4, r[2], T.muted, { size: 9, bg: T.surface2, bgOpacity: 1 });
    xx += cwd[2];
    txt(f, xx, ry, r[3], { size: 10, color: T.muted });
    xx += cwd[3];
    pill(f, xx, ry - 4, r[4], r[5] ? T.allow : T.block, { size: 9 });
    xx += cwd[4];
    if (!r[5]) {
      const rb = rect(f, xx, ry - 6, 70, 26, T.accent, 6, 0.13);
      rb.strokes = [paint(T.accent, 0.45)];
      txt(f, xx, ry, "Register", { size: 10, color: T.accent, weight: "Medium", align: "CENTER", w: 70 });
    }
    hr(f, tx + 16, ry + 24, tw - 32);
    ry += 36;
  });
  return f;
}

function buildReviews() {
  const f = frame("11 · Review Queue", 1440, 900, T.bg);
  const { cx, cy, cw } = shell(f, "Review Queue", "Review Queue");
  pageHeading(f, cx, cy, "Human Review Queue", "Actions routed to a human before they execute");
  // tabs
  txt(f, cx, cy + 60, "pending", { size: 13, weight: "Medium" });
  txt(f, cx + 64, cy + 60, "4", { size: 12, color: T.faint });
  rect(f, cx, cy + 78, 56, 2, T.accent, 1);
  txt(f, cx + 90, cy + 60, "resolved", { size: 13, color: T.faint });
  hr(f, cx, cy + 80, cw);
  const items = [
    ["ProcureBot", 'create_po(amount=38000, vendor="Dell EMC", finance_signoff=false)', "Purchase Order Sign-off", "Amount exceeds the $25,000 unattended limit but the vendor is a trusted approved supplier.", "4m", T.faint],
    ["FinPilot Refund Agent", 'process_refund(amount=14500, vendor="vendorx.io", approvals=1)', "Refund Approval Threshold", "Refund ≥ $10k requires two manager approvals; only one was attached.", "11m", T.review],
    ["DataSync Agent", 'export_dataset(dataset="eu_pilot", dest_region="eu-central-1", has_scc=true)', "Cross-Border Data Export", "Destination is in-region but the SCC artifact is newly issued and unverified.", "26m", T.block],
    ["SupportGPT Triage", 'issue_credit(amount=600, reason="goodwill")', "Refund Approval Threshold", "Goodwill credit above the $500 auto-approve limit.", "2m", T.faint],
  ];
  const halfW = (cw - 16) / 2;
  items.forEach((it, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = cx + col * (halfW + 16);
    const y = cy + 104 + row * 230;
    card(f, x, y, halfW, 214);
    verdictBadge(f, x + 16, y + 16, "HUMAN_REVIEW");
    txt(f, x + 150, y + 18, it[0], { size: 12, weight: "Medium" });
    txt(f, x + halfW - 110, y + 18, "⏱ " + it[4] + " waiting", { size: 11, color: it[5] });
    const pl = rect(f, x + 16, y + 46, halfW - 32, 32, T.bg, 8);
    pl.strokes = [paint(T.border)];
    txt(f, x + 28, y + 55, it[1], { size: 10, color: T.muted, family: "Roboto Mono", w: halfW - 56 });
    const why = rect(f, x + 16, y + 88, halfW - 32, 64, T.surface2, 8);
    txt(f, x + 28, y + 96, "WHY IT WAS ROUTED", { size: 9, color: T.faint, weight: "Medium", spacing: 0.4 });
    txt(f, x + 28, y + 110, it[2] + ": " + it[3], { size: 11, color: T.muted, w: halfW - 56 });
    hr(f, x + 16, y + 164, halfW - 32);
    const rej = rect(f, x + 16, y + 176, (halfW - 40) / 2, 32, T.block, 8, 0.12);
    rej.strokes = [paint(T.block, 0.45)];
    txt(f, x + 16, y + 184, "✕ Reject", { size: 12, color: T.block, weight: "Medium", align: "CENTER", w: (halfW - 40) / 2 });
    const app = rect(f, x + 24 + (halfW - 40) / 2, y + 176, (halfW - 40) / 2, 32, T.accent, 8, 0.12);
    app.strokes = [paint(T.accent, 0.45)];
    txt(f, x + 24 + (halfW - 40) / 2, y + 184, "✓ Approve", { size: 12, color: T.accent, weight: "Medium", align: "CENTER", w: (halfW - 40) / 2 });
  });
  return f;
}

function buildSettings() {
  const f = frame("12 · Settings", 1440, 900, T.bg);
  const { cx, cy, cw } = shell(f, "Settings", "Settings");
  pageHeading(f, cx, cy, "Settings", "Manage your tenant, team, integrations and billing");
  // sub nav
  const subnav = ["Tenant", "Team", "Integrations", "API Keys", "Billing", "Notifications"];
  const nw = 190;
  subnav.forEach((s, i) => {
    const active = i === 0;
    if (active) rect(f, cx, cy + 64 + i * 40, nw, 34, T.accent, 8, 0.12);
    rect(f, cx + 12, cy + 73 + i * 40, 15, 15, active ? T.accent : T.muted, 4, active ? 1 : 0.5);
    txt(f, cx + 38, cy + 72 + i * 40, s, { size: 13, weight: "Medium", color: active ? T.accent : T.muted });
  });
  // tenant form card
  const fx = cx + nw + 20;
  const fw = cw - nw - 20;
  card(f, fx, cy + 64, fw, 300);
  cardTitle(f, fx + 16, cy + 80, "Tenant");
  const fields = [["Organization name", "Acme Corp"], ["Tenant ID", "ten_acme_8x29fk"], ["Tier", "Silo"], ["Region", "eu-central-1"]];
  fields.forEach((fl, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = fx + 16 + col * ((fw - 48) / 2 + 16);
    const y = cy + 116 + row * 80;
    txt(f, x, y, fl[0].toUpperCase(), { size: 10, color: T.faint, weight: "Medium", spacing: 0.5 });
    const inp = rect(f, x, y + 16, (fw - 48) / 2, 40, T.bg, 8);
    inp.strokes = [paint(T.border)];
    txt(f, x + 14, y + 28, fl[1], { size: 13, family: i === 1 ? "Roboto Mono" : "Inter" });
  });
  const save = rect(f, fx + 16, cy + 300, 130, 34, T.indigo, 8);
  txt(f, fx + 16, cy + 309, "Save changes", { size: 13, color: T.white, weight: "Medium", align: "CENTER", w: 130 });
  // integrations preview card
  card(f, fx, cy + 384, fw, 150);
  cardTitle(f, fx + 16, cy + 400, "Integrations");
  const ints = [["Slack", "Connected", 1], ["PagerDuty", "Disconnected", 0], ["Datadog", "Connected", 1]];
  ints.forEach((it, i) => {
    const y = cy + 430 + i * 34;
    rect(f, fx + 16, y, 24, 24, T.surface2, 6);
    txt(f, fx + 52, y + 4, it[0], { size: 12, weight: "Medium" });
    pill(f, fx + 180, y + 2, it[1], it[2] ? T.allow : T.faint, { size: 10, bg: it[2] ? T.allow : T.surface2, bgOpacity: it[2] ? 0.13 : 1 });
    const tog = rect(f, fx + fw - 60, y, 44, 24, it[2] ? T.accent : T.surface3, 12);
    const knob = figma.createEllipse();
    knob.resize(20, 20);
    knob.x = fx + fw - 60 + (it[2] ? 22 : 2);
    knob.y = y + 2;
    knob.fills = [paint(T.white)];
    f.appendChild(knob);
  });
  return f;
}

function buildTraceViewer() {
  const f = frame("13 · Trace Viewer", 1040, 760, T.surface);
  f.strokes = [paint(T.border)];
  f.strokeWeight = 1;
  f.cornerRadius = 14;
  // header
  verdictBadge(f, 20, 20, "BLOCK");
  txt(f, 140, 22, "6/24/2026, 4:17:09 PM", { size: 11, color: T.faint });
  txt(f, 20, 48, "FinPilot Refund Agent", { size: 14, weight: "Semi Bold" });
  txt(f, 20, 70, 'process_refund(amount=50000, currency="USD", vendor="globaltrust-89.ru", invoice="INV-44192", approvals=0)', {
    size: 11,
    color: T.muted,
    family: "Roboto Mono",
    w: 900,
  });
  hr(f, 0, 100, 1040);
  // waterfall left
  txt(f, 20, 116, "VERIFICATION WATERFALL · 352MS TOTAL", { size: 10, color: T.faint, weight: "Medium", spacing: 0.5 });
  const steps = [
    ["SDK intercept", "@aegis.verify decorator", "2ms", T.allow],
    ["API Gateway + Auth", "mTLS · tenant resolved", "6ms", T.allow],
    ["Rules Engine (Cedar)", "ambiguous → escalated to debate", "12ms", T.review],
  ];
  let sy = 144;
  steps.forEach((s) => {
    const d = figma.createEllipse();
    d.resize(10, 10);
    d.x = 24;
    d.y = sy + 2;
    d.fills = [paint(s[3])];
    f.appendChild(d);
    txt(f, 44, sy - 2, s[0], { size: 12, weight: "Medium" });
    txt(f, 44, sy + 14, s[1], { size: 10, color: T.faint });
    rect(f, 230, sy + 4, 360, 6, T.surface3, 3);
    rect(f, 230, sy + 4, s[0] === "Rules Engine (Cedar)" ? 30 : 60, 6, s[3], 3);
    txt(f, 600, sy, s[2], { size: 11, color: T.muted, family: "Roboto Mono" });
    sy += 40;
  });
  // debate box
  const db = rect(f, 24, sy + 4, 566, 240, T.surface2, 10);
  db.strokes = [paint(T.border)];
  txt(f, 38, sy + 16, "⚖  3-Agent Debate", { size: 12, weight: "Semi Bold" });
  txt(f, 540, sy + 16, "340ms", { size: 11, color: T.faint, family: "Roboto Mono" });
  const debate = [
    ["Prosecutor", T.block, "$50,000 — 100× the $500 auto-approve limit, sent to a .ru domain registered 6 days ago in a sanctioned jurisdiction. Zero approvals. Matches push-payment fraud. Block."],
    ["Defender", T.info, "Valid session and invoice resolves to an open ticket — but no approval artifact, and vendor domain unverified."],
    ["Judge", T.block, "Two policies violated: refund cap (0/2 approvals) and sanctioned-vendor geo. No mitigating evidence. Verdict: BLOCK. Cited EU AI Act Art. 14."],
  ];
  let dy = sy + 40;
  debate.forEach((d, i) => {
    const h = i === 1 ? 44 : 62;
    const box = rect(f, 38, dy, 538, h, i === 2 ? T.block : T.surface, 6, i === 2 ? 0.09 : 1);
    box.strokes = [paint(i === 2 ? T.block : T.border, i === 2 ? 0.4 : 1)];
    txt(f, 50, dy + 8, d[0], { size: 11, weight: "Semi Bold", color: d[1] });
    txt(f, 50, dy + 24, d[2], { size: 10, color: T.muted, w: 514 });
    dy += h + 8;
  });
  // sidebar right
  rect(f, 600, 100, 440, 660, T.surface2);
  rect(f, 600, 100, 1, 660, T.border);
  const sb = [
    ["CITED POLICY", "Refund Approval Threshold", T.accent],
    ["", "pol_refund_cap", T.faint],
    ["REGULATION", "EU AI Act Art. 14 — Human Oversight", T.muted],
    ["AUDIT HASH", "sha256:7d4e0a91fcb6e4d90c1f", T.muted],
    ["S3 OBJECT LOCK URI", "s3://aegis-audit-prod/finpilot/ev_hero_block.json", T.muted],
  ];
  let by = 124;
  sb.forEach((s) => {
    if (s[0]) {
      txt(f, 624, by, s[0], { size: 10, color: T.faint, weight: "Medium", spacing: 0.5 });
      by += 18;
    }
    txt(f, 624, by, s[1], { size: 11, color: s[2], family: s[0] === "" || s[0] === "AUDIT HASH" || s[0] === "S3 OBJECT LOCK URI" ? "Roboto Mono" : "Inter", w: 392 });
    by += s[1].length > 40 ? 40 : 28;
  });
  const flag = rect(f, 624, 380, 392, 34, T.surface, 8);
  flag.strokes = [paint(T.border)];
  txt(f, 624, 389, "⚑ Flag for Review", { size: 12, color: T.muted, align: "CENTER", w: 392 });
  return f;
}

// ============================================================
//                         RUN
// ============================================================
(async () => {
  try {
    await loadFonts();
    const builders = [
      buildLogin,
      buildOnboarding,
      buildDashboard,
      buildAgents,
      buildAgentDetail,
      buildPolicyStudio,
      buildPolicyEditor,
      buildRedTeam,
      buildCompliance,
      buildShadowRadar,
      buildReviews,
      buildSettings,
      buildTraceViewer,
    ];
    const frames = [];
    // title text
    const title = figma.createText();
    title.fontName = { family: "Inter", style: "Bold" };
    title.characters = "AegisAgent — UI Screens";
    title.fontSize = 40;
    title.fills = [paint(T.text)];
    title.x = 0;
    title.y = -120;
    figma.currentPage.appendChild(title);

    const PER_ROW = 4;
    const STRIDE_X = 1600;
    const STRIDE_Y = 1080;
    builders.forEach((b, i) => {
      const fr = b();
      figma.currentPage.appendChild(fr);
      fr.x = (i % PER_ROW) * STRIDE_X;
      fr.y = Math.floor(i / PER_ROW) * STRIDE_Y;
      frames.push(fr);
    });

    figma.currentPage.selection = frames;
    figma.viewport.scrollAndZoomIntoView(frames);
    figma.closePlugin("✓ Created " + frames.length + " AegisAgent screens");
  } catch (e) {
    figma.closePlugin("Error: " + (e && e.message ? e.message : String(e)));
  }
})();
