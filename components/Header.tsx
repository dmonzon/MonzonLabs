"use client";

import Mark from "./Mark";
import { NAVY, GOLD, PAPER } from "@/lib/theme";
import { Translation } from "@/lib/i18n";

interface HeaderProps {
  lang: "es" | "en";
  t: Translation;
  onLangToggle: () => void;
  onNavClick: (id: string) => void;
}

export default function Header({
  lang,
  t,
  onLangToggle,
  onNavClick,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "rgba(250,250,248,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #ECE9E1",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <div
          className="ml-logowrap flex items-center gap-2.5 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Mark size={34} />
          <span className="font-extrabold tracking-tight text-lg" style={{ color: NAVY }}>
            MONZON<span className="font-light" style={{ color: GOLD }}> LABS</span>
          </span>
        </div>

        <nav
          className="hidden md:flex items-center gap-7 text-sm font-semibold"
          style={{ color: NAVY }}
        >
          {[
            ["services", t.nav.services],
            ["process", t.nav.process],
            ["about", t.nav.about],
            ["contact", t.nav.contact],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => onNavClick(id)}
              className="ml-nav"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onLangToggle}
            className="ml-cta text-xs font-bold rounded-full px-3 py-1.5"
            style={{ border: `1.5px solid ${NAVY}`, color: NAVY }}
            aria-label="Cambiar idioma / Switch language"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
          <button
            onClick={() => onNavClick("contact")}
            className="ml-cta hidden sm:block text-sm font-bold rounded-full px-5 py-2"
            style={{ backgroundColor: NAVY, color: PAPER }}
          >
            {t.nav.cta}
          </button>
        </div>
      </div>
    </header>
  );
}
