import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "mdnav — Developer Docs",
  description: "Complete reference for mdnav CLI/TUI and mdnav-web",
};

const toc = [
  { id: "overview",      label: "Overview" },
  { id: "architecture",  label: "Architecture" },
  { id: "cli-reference", label: "CLI Reference", children: [
    { id: "keybindings", label: "Keybindings" },
    { id: "commands",    label: "Commands" },
    { id: "config",      label: "Configuration" },
  ]},
  { id: "api-reference", label: "API Reference" },
  { id: "development",   label: "Development" },
];

export default function DevsPage() {
  return (
    <main className="shell">
      <section className="hero" style={{ marginBottom: "32px" }}>
        <div className="kicker">mdnav · docs</div>
        <h1 className="title">Developer Docs</h1>
        <p className="subtitle">
          Complete reference for <strong>mdnav</strong> (CLI/TUI in Rust) and{" "}
          <strong>mdnav-web</strong> (Mermaid sharing service on Next.js + Vercel).
        </p>
      </section>

      <div className="docs-layout">
        {/* ── TOC ─────────────────────────────────────────── */}
        <aside className="docs-toc">
          <p className="docs-toc-title">Contents</p>
          <ul className="docs-toc-list">
            {toc.map((item) => (
              <>
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.label}</a>
                </li>
                {item.children?.map((child) => (
                  <li key={child.id} className="sub">
                    <a href={`#${child.id}`}>{child.label}</a>
                  </li>
                ))}
              </>
            ))}
          </ul>
        </aside>

        {/* ── Content ─────────────────────────────────────── */}
        <div className="docs-content">

          <section id="overview" className="docs-section">
            <h2>Overview</h2>
            <div className="docs-placeholder">— coming soon —</div>
          </section>

          <section id="architecture" className="docs-section">
            <h2>Architecture</h2>
            <div className="docs-placeholder">— coming soon —</div>
          </section>

          <section id="cli-reference" className="docs-section">
            <h2>CLI Reference</h2>

            <h3 id="keybindings">Keybindings</h3>
            <div className="docs-placeholder">— coming soon —</div>

            <h3 id="commands">Commands</h3>
            <div className="docs-placeholder">— coming soon —</div>

            <h3 id="config">Configuration</h3>
            <div className="docs-placeholder">— coming soon —</div>
          </section>

          <section id="api-reference" className="docs-section">
            <h2>API Reference</h2>
            <div className="docs-placeholder">— coming soon —</div>
          </section>

          <section id="development" className="docs-section">
            <h2>Development</h2>
            <div className="docs-placeholder">— coming soon —</div>
          </section>

        </div>
      </div>
    </main>
  );
}
