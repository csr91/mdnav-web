"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TerminalDemo from "@/components/TerminalDemo";
import FeatureGrid from "@/components/FeatureGrid";

const content = {
  en: {
    kicker: "open source · rust",
    subtitle: "A keyboard-driven file explorer for the terminal. Browse any directory, preview files as you navigate, manage your repo and share diagrams — all without touching the mouse.",
    cta: { primary: "Get started", secondary: "Documentation →" },
    featuresLabel: "Features",
    installLabel: "Install",
    nav: { hero: "Overview", features: "Features", install: "Install" },
    features: [
      { icon: "⌨", label: "Keyboard first",    title: "No mouse. No friction.",       desc: "Navigate any directory with hjkl, jump between panels with Tab, and run any action from the command palette with :. Fully keyboard-driven." },
      { icon: "◫", label: "Instant preview",   title: "See files as you move.",       desc: "The right panel updates as you navigate. Markdown is rendered, code is syntax-highlighted, Mermaid diagrams are detected automatically." },
      { icon: "⎇", label: "Git built-in",      title: "Commit without switching.",    desc: "Status, diff, log, commit, push and pull — all accessible from inside the explorer. Your repo is always a keystroke away." },
      { icon: "★", label: "Bookmarks",          title: "Jump to where you work.",      desc: "Pin any directory with Shift+B. Bookmarks appear at the top of the tree and let you switch roots instantly." },
      { icon: "◎", label: "Mermaid",           title: "Diagrams in the terminal.",    desc: "Render Mermaid blocks inline, open as HTML, or push to a temporary share link that auto-expires after the first view." },
      { icon: "↪", label: "Shell integration", title: "Exit into a directory.",       desc: "Press Shift+G to cd into the selected folder when you quit. Your shell session lands exactly where you left off." },
      { icon: "⎘", label: "Text selection",    title: "Copy without a mouse.",        desc: "Enter selection mode with Shift+Y, set an anchor, move the cursor to extend the range, then copy to clipboard with y." },
      { icon: "≡", label: "Table of contents", title: "Jump to any heading.",         desc: "Press Shift+T to open an auto-generated TOC from Markdown headers. Navigate your document in one keystroke." },
      { icon: "◉", label: "Focus mode",        title: "Only .md files.",              desc: "Toggle .md-only view to filter the tree down to Markdown files exclusively. Less noise, faster navigation." },
    ],
    install: { windows: "Windows", linux: "Linux / macOS" },
  },
  es: {
    kicker: "código abierto · rust",
    subtitle: "Un explorador de archivos para la terminal con control total por teclado. Navegá cualquier directorio, previsualizá archivos en tiempo real, gestioná tu repo y compartí diagramas — sin tocar el mouse.",
    cta: { primary: "Empezar", secondary: "Documentación →" },
    featuresLabel: "Funcionalidades",
    installLabel: "Instalación",
    nav: { hero: "Inicio", features: "Funciones", install: "Instalar" },
    features: [
      { icon: "⌨", label: "Teclado primero",   title: "Sin mouse. Sin fricción.",        desc: "Navegá cualquier directorio con hjkl, cambiá de panel con Tab y ejecutá cualquier acción desde el command palette con :." },
      { icon: "◫", label: "Preview instant.",   title: "Ves los archivos al moverse.",    desc: "El panel derecho se actualiza en tiempo real. Markdown renderizado, código con syntax highlighting, Mermaid detectado automáticamente." },
      { icon: "⎇", label: "Git integrado",      title: "Commitear sin salir.",            desc: "Status, diff, log, commit, push y pull — todo desde adentro del explorador. Tu repo siempre a un keystroke de distancia." },
      { icon: "★", label: "Bookmarks",          title: "Saltá a donde trabajás.",         desc: "Marcá cualquier directorio con Shift+B. Los bookmarks aparecen al tope del árbol y cambian el root al instante." },
      { icon: "◎", label: "Mermaid",           title: "Diagramas en la terminal.",       desc: "Renderizá bloques Mermaid inline, abrí como HTML o enviá a un link temporal que se auto-expira tras el primer acceso." },
      { icon: "↪", label: "Shell integration", title: "Salí dentro de un directorio.",   desc: "Presioná Shift+G para hacer cd al directorio seleccionado al salir. Tu shell termina justo donde dejaste el explorador." },
      { icon: "⎘", label: "Selección de texto", title: "Copiá sin mouse.",               desc: "Entrá al modo selección con Shift+Y, anclá el inicio, extendé el rango con el cursor y copiá al portapapeles con y." },
      { icon: "≡", label: "Tabla de contenidos", title: "Saltá a cualquier título.",      desc: "Presioná Shift+T para abrir un TOC auto-generado de los encabezados Markdown. Navegá tu documento en un keystroke." },
      { icon: "◉", label: "Modo enfocado",       title: "Solo archivos .md.",             desc: "Activá la vista solo-.md para filtrar el árbol y mostrar únicamente Markdown. Menos ruido, navegación más rápida." },
    ],
    install: { windows: "Windows", linux: "Linux / macOS" },
  },
} as const;

type Lang = keyof typeof content;

const NAV_SECTIONS = [
  { id: "hero",     labelKey: "hero"     as const },
  { id: "features", labelKey: "features" as const },
  { id: "install",  labelKey: "install"  as const },
];

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("en");
  const [active, setActive] = useState("hero");
  const [stars, setStars] = useState<number | null>(null);
  const [version, setVersion] = useState("v0.1.8");

  useEffect(() => {
    fetch("https://api.github.com/repos/csr91/mdnav")
      .then(r => r.json())
      .then(d => setStars(d.stargazers_count ?? null))
      .catch(() => {});

    fetch("https://api.github.com/repos/csr91/mdnav/releases/latest")
      .then(r => r.json())
      .then(d => { if (d.tag_name) setVersion(d.tag_name); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("mdnav-lang");
    if (saved === "en" || saved === "es") setLang(saved);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    NAV_SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const toggle = (l: Lang) => {
    setLang(l);
    localStorage.setItem("mdnav-lang", l);
  };

  const t = content[lang];

  return (
    <>
      {/* ── Sidebar ──────────────────────────────────────── */}
      <nav className="lp-nav">
        {NAV_SECTIONS.map(s => (
          <a key={s.id} href={`#${s.id}`} className={`lp-nav-item${active === s.id ? " active" : ""}`}>
            <span className="lp-nav-sq" />
            {t.nav[s.labelKey]}
          </a>
        ))}
      </nav>

      {/* ── Main shell ───────────────────────────────────── */}
      <main className="shell">

        {/* Lang toggle */}
        <div className="lang-toggle">
          <button className={`lang-btn${lang === "en" ? " active" : ""}`} onClick={() => toggle("en")}>EN</button>
          <button className={`lang-btn${lang === "es" ? " active" : ""}`} onClick={() => toggle("es")}>ES</button>
        </div>

        {/* Version label */}
        <span className="shell-version">{version}</span>

        {/* Hero */}
        <section id="hero" className="hero">
          <h1 className="title title-gradient">mdnav</h1>
          <p className="subtitle">{t.subtitle}</p>
          <div className="cta-row">
            <Link href="/devs#install" className="btn-primary">{t.cta.primary}</Link>
            <Link href="/devs" className="btn-ghost">{t.cta.secondary}</Link>
            <a
              href="https://github.com/csr91/mdnav"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-github"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
              {stars !== null && <span className="btn-github-stars">★ {stars}</span>}
            </a>
          </div>
          <div className="platform-badges">
            <span className="platform-badge">✓ Windows</span>
            <span className="platform-badge">✓ Linux</span>
            <span className="platform-badge">✓ macOS</span>
          </div>

          <p className="hero-oneliner">You&apos;re already in the terminal. Why open Explorer or Finder?</p>
          <TerminalDemo />
        </section>

        <hr className="divider" />

        {/* Features */}
        <section id="features">
          <p className="section-label">{t.featuresLabel}</p>
          <FeatureGrid features={t.features} />
        </section>

        <hr className="divider" />

        {/* Install */}
        <section id="install">
          <p className="section-label">{t.installLabel}</p>
          <div className="grid">
            <div className="card">
              <p className="muted" style={{ margin: "0 0 10px", fontSize: "13px" }}>{t.install.windows}</p>
              <pre className="code">irm https://raw.githubusercontent.com/csr91/mdnav/master/install.ps1 | iex</pre>
            </div>
            <div className="card">
              <p className="muted" style={{ margin: "0 0 10px", fontSize: "13px" }}>{t.install.linux}</p>
              <pre className="code">curl -fsSL https://raw.githubusercontent.com/csr91/mdnav/master/install.sh | bash</pre>
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* Footer */}
        <footer className="site-footer">
          <span>
            A{" "}
            <a href="https://kaizenlab-mauve.vercel.app/" target="_blank" rel="noopener noreferrer">
              KaizenLab
            </a>{" "}
            open source project
          </span>
          <span>Created by César Mendoza</span>
        </footer>

      </main>
    </>
  );
}
