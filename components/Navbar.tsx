"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type NavLink = { href: string; label: string; id?: string };
type Lang = "en" | "es";

type NavbarProps = {
  links: readonly NavLink[];
  active?: string;
  version?: string;
  lang?: Lang;
  onLangChange?: (lang: Lang) => void;
};

const GITHUB_URL = "https://github.com/csr91/mdnav";

export default function Navbar({ links, active, version, lang, onLangChange }: NavbarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        document.getElementById("nav-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <nav className="nav" aria-label="Main">
        <div className="nav-brand-wrap">
          <Link href="/" className="nav-brand" onClick={close}>
            md<span>nav</span>
          </Link>
          {version && <span className="nav-version">{version}</span>}
        </div>

        <button
          id="nav-toggle"
          className="nav-toggle"
          type="button"
          aria-controls="nav-menu"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(o => !o)}
        >
          <span className="nav-toggle-bar" aria-hidden="true" />
        </button>

        <div id="nav-menu" className={`nav-menu${open ? " is-open" : ""}`}>
          <ul className="nav-links">
            {links.map(l => (
              <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={l.id && active === l.id ? "true" : undefined}
                  onClick={close}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {lang && onLangChange && (
              <div className="lang-toggle" role="group" aria-label="Language">
                <button
                  type="button"
                  className={`lang-btn${lang === "en" ? " active" : ""}`}
                  aria-pressed={lang === "en"}
                  onClick={() => onLangChange("en")}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={`lang-btn${lang === "es" ? " active" : ""}`}
                  aria-pressed={lang === "es"}
                  onClick={() => onLangChange("es")}
                >
                  ES
                </button>
              </div>
            )}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-icon"
              aria-label="mdnav on GitHub"
              onClick={close}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
