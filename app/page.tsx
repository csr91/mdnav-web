"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TerminalDemo from "@/components/TerminalDemo";
import FeatureGrid from "@/components/FeatureGrid";

const content = {
  en: {
    kicker: "open source · rust · v0.1.8",
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
    kicker: "código abierto · rust · v0.1.8",
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

        {/* Hero */}
        <section id="hero" className="hero">
          <div className="kicker">{t.kicker}</div>
          <h1 className="title title-gradient">mdnav</h1>
          <p className="subtitle">{t.subtitle}</p>
          <div className="cta-row">
            <Link href="/devs#install" className="btn-primary">{t.cta.primary}</Link>
            <Link href="/devs" className="btn-ghost">{t.cta.secondary}</Link>
          </div>
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

      </main>
    </>
  );
}
