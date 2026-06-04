"use client";

import { useEffect, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────
type TreeItem = { id: string; prefix: string; icon: string; name: string; depth: number };
type Step = {
  tree: TreeItem[];
  selected: string;
  preview: string[];
  hint: string;
  delay: number;
  mermaid?: boolean;
  splitClass?: string;
  selLines?: number[];
};
type Demo = { label: string; steps: Step[] };

// ── Trees ────────────────────────────────────────────────
const COLLAPSED: TreeItem[] = [
  { id: "src",  prefix: "",    icon: "▸", name: "src/",          depth: 0 },
  { id: "docs", prefix: "",    icon: "▸", name: "docs/",         depth: 0 },
  { id: "rdme", prefix: "",    icon: " ", name: "README.md",     depth: 0 },
  { id: "pkg",  prefix: "",    icon: " ", name: "package.json",  depth: 0 },
  { id: "ts",   prefix: "",    icon: " ", name: "tsconfig.json", depth: 0 },
];

const DOCS_OPEN: TreeItem[] = [
  { id: "src",       prefix: "",    icon: "▸", name: "src/",             depth: 0 },
  { id: "docs",      prefix: "",    icon: "▾", name: "docs/",            depth: 0 },
  { id: "docs-arch", prefix: "├─ ", icon: " ", name: "architecture.md",  depth: 1 },
  { id: "docs-diag", prefix: "├─ ", icon: " ", name: "diagram.md",       depth: 1 },
  { id: "docs-api",  prefix: "└─ ", icon: " ", name: "api.md",           depth: 1 },
  { id: "rdme",      prefix: "",    icon: " ", name: "README.md",         depth: 0 },
  { id: "pkg",       prefix: "",    icon: " ", name: "package.json",      depth: 0 },
  { id: "ts",        prefix: "",    icon: " ", name: "tsconfig.json",     depth: 0 },
];

const DOCS_RENAMED: TreeItem[] = [
  { id: "src",          prefix: "",    icon: "▸", name: "src/",             depth: 0 },
  { id: "docs",         prefix: "",    icon: "▾", name: "docs/",            depth: 0 },
  { id: "docs-arch",    prefix: "├─ ", icon: " ", name: "architecture.md",  depth: 1 },
  { id: "docs-diag",    prefix: "├─ ", icon: " ", name: "diagram.md",       depth: 1 },
  { id: "docs-api-v2",  prefix: "└─ ", icon: " ", name: "api-v2.md",        depth: 1 },
  { id: "rdme",         prefix: "",    icon: " ", name: "README.md",         depth: 0 },
  { id: "pkg",          prefix: "",    icon: " ", name: "package.json",      depth: 0 },
  { id: "ts",           prefix: "",    icon: " ", name: "tsconfig.json",     depth: 0 },
];

const BACKEND: TreeItem[] = [
  { id: "api",      prefix: "",    icon: "▸", name: "api/",      depth: 0 },
  { id: "models",   prefix: "",    icon: "▸", name: "models/",   depth: 0 },
  { id: "services", prefix: "",    icon: "▸", name: "services/", depth: 0 },
  { id: "main",     prefix: "",    icon: " ", name: "main.go",   depth: 0 },
  { id: "go-mod",   prefix: "",    icon: " ", name: "go.mod",    depth: 0 },
  { id: "be-rdme",  prefix: "",    icon: " ", name: "README.md", depth: 0 },
];

// ── Previews ─────────────────────────────────────────────
const P_README   = ["# myapp", "", "A full-stack web application", "built with Next.js and TypeScript.", "", "## Getting started", "", "  npm install", "  npm run dev"];
const P_PKG      = ["{", '  "name": "myapp",', '  "version": "1.0.0",', '  "scripts": {', '    "dev": "next dev",', '    "build": "next build"', "  }", "}"];
const P_TS       = ["{", '  "compilerOptions": {', '    "target": "ES2017",', '    "strict": true,', '    "module": "esnext",', '    "jsx": "preserve"', "  }", "}"];
const P_ARCH     = ["# Architecture", "", "## Frontend", "  Next.js + TypeScript", "", "## Backend", "  API routes + MongoDB", "", "## Deploy", "  Vercel"];
const P_DIAG     = ["# diagram.md", "", "```mermaid", "flowchart TD", "  A[User] --> B[mdnav]", "  B --> C[Preview]", "  B --> D[Git]", "  B --> E[Share]", "  E --> F[Link]", "```"];
const P_MACTIONS = ["─ Mermaid ─────────────────────", "", "  1  Preview in terminal", "  2  Open as HTML", "▶ 3  Share link", "", "  ↵ confirm   Esc dismiss"];
const P_LINK     = ["✓ Link ready", "", "  https://mdnav.app/a1b2c3", "", "  Opens in browser.", "  Expires after first view.", "", "  ✓ Copied to clipboard"];
const P_API      = ["# API Reference", "", "## POST /api/diagrams/:hash", "", "  Body: { mermaid,", "    html?, title?,", "    ttlSeconds? }", "", "  Returns: { ok, hash, url }"];
const P_MAIN_GO  = ["package main", "", "import (", '  "fmt"', '  "net/http"', ")", "", "func main() {", "  http.HandleFunc(\"/\",", "    handler)", '  fmt.Println("Listening")', "  http.ListenAndServe(", '    ":8080", nil)', "}"];

// ── Demo 1: Navigate + Mermaid share ─────────────────────
const DEMO_NAV: Step[] = [
  { tree: COLLAPSED,  selected: "rdme",      preview: P_README,   hint: "",        delay: 2000 },
  { tree: COLLAPSED,  selected: "pkg",       preview: P_PKG,      hint: "j",       delay: 1400 },
  { tree: COLLAPSED,  selected: "ts",        preview: P_TS,       hint: "j",       delay: 1200 },
  { tree: COLLAPSED,  selected: "docs",      preview: P_TS,       hint: "k k k",   delay: 800  },
  { tree: DOCS_OPEN,  selected: "docs",      preview: P_TS,       hint: "l",       delay: 900  },
  { tree: DOCS_OPEN,  selected: "docs-arch", preview: P_ARCH,     hint: "j",       delay: 1600 },
  { tree: DOCS_OPEN,  selected: "docs-diag", preview: P_DIAG,     hint: "j",       delay: 2000 },
  { tree: DOCS_OPEN,  selected: "docs-diag", preview: P_MACTIONS, hint: "Shift+M", delay: 1600 },
  { tree: DOCS_OPEN,  selected: "docs-diag", preview: P_LINK,     hint: "↵",       delay: 1400 },
  { tree: DOCS_OPEN,  selected: "docs-diag", preview: [],         hint: "",        delay: 3200, mermaid: true },
  { tree: COLLAPSED,  selected: "rdme",      preview: P_README,   hint: "h",       delay: 900  },
];

// ── Demo 2: :edit → vim ──────────────────────────────────
const DEMO_EDIT: Step[] = [
  { tree: COLLAPSED, selected: "rdme", preview: P_README, hint: "", delay: 1500 },
  {
    tree: COLLAPSED, selected: "rdme", hint: ":", delay: 1400,
    preview: [": █", "", "  edit    open in editor", "  files   file browser", "  find    search text", "  git     git panel", "  toc     table of contents"],
  },
  {
    tree: COLLAPSED, selected: "rdme", hint: ":edit", delay: 1400,
    preview: [": edit █", "", "▶ edit README.md", "  edit package.json", "  edit tsconfig.json"],
  },
  {
    tree: COLLAPSED, selected: "rdme", hint: "↵", delay: 2400,
    preview: ["── VIM · INSERT ─────────────────", "# myapp", "", "A full-stack web application█", "built with Next.js and TypeScript.", "", "## Getting started", "", "  npm install", "  npm run dev", "~", "~", '"README.md" 12L, 245B'],
  },
  {
    tree: COLLAPSED, selected: "rdme", hint: ":wq", delay: 1000,
    preview: [": wq█", "", "  write and quit"],
  },
  {
    tree: COLLAPSED, selected: "rdme", hint: "↵", delay: 1000,
    preview: ['"README.md" written, 245 bytes'],
  },
  { tree: COLLAPSED, selected: "rdme", preview: P_README, hint: "", delay: 1200 },
];

// ── Demo 3: Rename + :goto ───────────────────────────────
const DEMO_RENAME: Step[] = [
  { tree: DOCS_OPEN, selected: "docs-api", preview: P_API, hint: "", delay: 1800 },
  {
    tree: DOCS_OPEN, selected: "docs-api", hint: "Shift+R", delay: 1600,
    preview: ["── Rename ───────────────────────", "", "  api.md", "  ↓", "  api-v2.md█", "", "  ↵ confirm   Esc cancel"],
  },
  {
    tree: DOCS_RENAMED, selected: "docs-api-v2", hint: "↵", delay: 1600,
    preview: ["✓ Renamed", "", "  api.md → api-v2.md"],
  },
  { tree: DOCS_RENAMED, selected: "docs-api-v2", preview: P_API, hint: "", delay: 1400 },
  {
    tree: DOCS_RENAMED, selected: "docs-api-v2", hint: ":goto", delay: 1600,
    preview: [": goto █", "", "▶ ~/work/backend", "  ~/projects/myapp", "  ~/personal/notes", "  ~/docs", "", "  ↵ navigate   Esc dismiss"],
  },
  { tree: BACKEND, selected: "main",    preview: P_MAIN_GO, hint: "↵",   delay: 2200 },
  { tree: BACKEND, selected: "be-rdme", preview: P_README,  hint: "j j", delay: 1800 },
];

// ── Demo 4: Split + Shift+Y selection ────────────────────
const DEMO_SELECT: Step[] = [
  { tree: COLLAPSED, selected: "rdme", preview: P_README, hint: "", delay: 1600 },
  { tree: COLLAPSED, selected: "rdme", preview: P_README, hint: "Shift+1", delay: 1000, splitClass: "split-1" },
  { tree: COLLAPSED, selected: "rdme", preview: P_README, hint: "Shift+3", delay: 1000, splitClass: "split-3" },
  { tree: COLLAPSED, selected: "rdme", preview: P_README, hint: "Shift+5", delay: 1200, splitClass: "split-5" },
  { tree: COLLAPSED, selected: "rdme", preview: P_README, hint: "Shift+3", delay: 1000 },
  { tree: COLLAPSED, selected: "rdme", preview: P_README, hint: "Shift+Y", delay: 1800, selLines: [2, 3] },
  { tree: COLLAPSED, selected: "rdme", preview: P_README, hint: "y",       delay: 1600, selLines: [2, 3, 4, 5] },
  {
    tree: COLLAPSED, selected: "rdme", hint: "y", delay: 1400,
    preview: [...P_README, "", "  ✓ Copied 5 lines to clipboard"],
  },
  { tree: COLLAPSED, selected: "rdme", preview: P_README, hint: "Esc", delay: 1200 },
];

// ── All demos ────────────────────────────────────────────
const DEMOS: Demo[] = [
  { label: "navigate",     steps: DEMO_NAV    },
  { label: ":edit → vim",  steps: DEMO_EDIT   },
  { label: "rename+goto",  steps: DEMO_RENAME },
  { label: "split+select", steps: DEMO_SELECT },
];

// ── Inline SVG diagram ───────────────────────────────────
function DiagramSVG() {
  return (
    <svg viewBox="0 0 280 252" xmlns="http://www.w3.org/2000/svg" style={{ maxHeight: 220, width: "auto" }}>
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0,8 3,0 6" fill="#77c6ff" opacity="0.7" />
        </marker>
      </defs>
      <line x1="140" y1="40"  x2="140" y2="72"  stroke="#77c6ff" strokeWidth="1.5" opacity="0.55" markerEnd="url(#arr)" />
      <line x1="116" y1="106" x2="72"  y2="142" stroke="#77c6ff" strokeWidth="1.5" opacity="0.55" markerEnd="url(#arr)" />
      <line x1="140" y1="106" x2="140" y2="142" stroke="#77c6ff" strokeWidth="1.5" opacity="0.55" markerEnd="url(#arr)" />
      <line x1="164" y1="106" x2="208" y2="142" stroke="#77c6ff" strokeWidth="1.5" opacity="0.55" markerEnd="url(#arr)" />
      <line x1="224" y1="172" x2="224" y2="208" stroke="#9ee37d" strokeWidth="1.5" opacity="0.65" markerEnd="url(#arr)" />
      <rect x="98"  y="12"  width="84" height="28" rx="5" fill="#0f151d" stroke="#77c6ff" strokeWidth="1.4" />
      <text x="140" y="30"  textAnchor="middle" fill="#e7edf5" fontFamily="monospace" fontSize="12">User</text>
      <rect x="96"  y="78"  width="88" height="28" rx="5" fill="#141b24" stroke="#9ee37d" strokeWidth="1.6" />
      <text x="140" y="96"  textAnchor="middle" fill="#9ee37d"  fontFamily="monospace" fontSize="12" fontWeight="bold">mdnav</text>
      <rect x="12"  y="142" width="84" height="28" rx="5" fill="#0f151d" stroke="#77c6ff" strokeWidth="1.2" opacity="0.85" />
      <text x="54"  y="160" textAnchor="middle" fill="#e7edf5" fontFamily="monospace" fontSize="11">Preview</text>
      <rect x="108" y="142" width="64" height="28" rx="5" fill="#0f151d" stroke="#77c6ff" strokeWidth="1.2" opacity="0.85" />
      <text x="140" y="160" textAnchor="middle" fill="#e7edf5" fontFamily="monospace" fontSize="11">Git</text>
      <rect x="182" y="142" width="84" height="28" rx="5" fill="#0f151d" stroke="#77c6ff" strokeWidth="1.2" opacity="0.85" />
      <text x="224" y="160" textAnchor="middle" fill="#e7edf5" fontFamily="monospace" fontSize="11">Share</text>
      <rect x="182" y="208" width="84" height="28" rx="5" fill="#141b24" stroke="#9ee37d" strokeWidth="1.4" />
      <text x="224" y="226" textAnchor="middle" fill="#9ee37d" fontFamily="monospace" fontSize="11">🔗 Link</text>
    </svg>
  );
}

// ── Component ────────────────────────────────────────────
export default function TerminalDemo() {
  const [demoIdx, setDemoIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [fade,    setFade]    = useState(true);
  const [demoBg,  setDemoBg]  = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const demo = DEMOS[demoIdx];
  const step = demo.steps[stepIdx];

  useEffect(() => {
    timer.current = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        const isLast = stepIdx >= demo.steps.length - 1;
        if (isLast) {
          setDemoBg(false);
          setTimeout(() => {
            setDemoIdx(d => (d + 1) % DEMOS.length);
            setStepIdx(0);
            setDemoBg(true);
          }, 350);
        } else {
          setStepIdx(s => s + 1);
        }
        setFade(true);
      }, 130);
    }, step.delay);
    return () => clearTimeout(timer.current);
  }, [demoIdx, stepIdx, demo.steps.length, step.delay]);

  const bodyClass = [
    "tdem-body",
    step.mermaid    ? "tdem-full"      : "",
    step.splitClass ?? "",
  ].filter(Boolean).join(" ");

  return (
    <div className="tdem" style={{ opacity: demoBg ? 1 : 0, transition: "opacity 0.35s" }}>
      {/* Header */}
      <div className="tdem-header">
        <span>~/projects/myapp</span>
        <span style={{ color: "var(--accent-2)" }}>
          {step.tree.find(t => t.id === step.selected)?.name ?? ""}
        </span>
      </div>

      {/* Body */}
      <div className={bodyClass}>
        <div className="tdem-tree">
          {step.tree.map(item => (
            <div
              key={item.id}
              className={`tdem-line${item.id === step.selected ? " tdem-sel" : ""}`}
              style={{ paddingLeft: item.depth * 16 }}
            >
              <span className="tdem-prefix">{item.prefix}</span>
              <span>{item.icon}</span>{" "}{item.name}
            </div>
          ))}
        </div>

        <div className="tdem-preview" style={{ opacity: fade ? 1 : 0, transition: "opacity 0.12s", padding: step.mermaid ? 0 : undefined }}>
          {step.mermaid ? (
            <div className="tdem-browser">
              <div className="tdem-browser-bar">
                <span className="tdem-browser-dot" style={{ background: "#ff5f57" }} />
                <span className="tdem-browser-dot" style={{ background: "#febc2e" }} />
                <span className="tdem-browser-dot" style={{ background: "#28c840" }} />
                <span style={{ marginLeft: 6 }}>mdnav.app/a1b2c3</span>
              </div>
              <div className="tdem-browser-content"><DiagramSVG /></div>
            </div>
          ) : (
            step.preview.map((line, i) => (
              <div
                key={i}
                className={`tdem-preview-line${step.selLines?.includes(i) ? " tdem-sel-line" : ""}`}
              >
                {line || " "}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status */}
      <div className="tdem-status">
        <span>hjkl</span>
        <span>Tab</span>
        <span>Shift+M</span>
        <span>:git</span>
        {step.hint && <span className="tdem-hint">{step.hint}</span>}
        <span style={{ marginLeft: "auto" }}>:q</span>
      </div>

      {/* Demo tabs */}
      <div className="tdem-tabs">
        {DEMOS.map((d, i) => (
          <button
            key={i}
            className={`tdem-tab${demoIdx === i ? " active" : ""}`}
            onClick={() => { clearTimeout(timer.current); setDemoIdx(i); setStepIdx(0); setFade(true); }}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
