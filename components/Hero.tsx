"use client";

import NodeField from "./NodeField";
import { NAVY, NAVY2, GOLD, PAPER } from "@/lib/theme";
import { Translation } from "@/lib/i18n";

interface HeroProps {
  t: Translation;
  onNavClick: (id: string) => void;
}

export default function Hero({ t, onNavClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: NAVY }}>
      <NodeField />
      <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-16 md:pt-28 md:pb-24 pointer-events-none">
        <p
          className="text-xs md:text-sm font-bold tracking-[0.25em] uppercase mb-5"
          style={{ color: GOLD }}
        >
          {t.hero.kicker}
        </p>
        <h1
          className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight"
          style={{ color: PAPER }}
        >
          {t.hero.h1a}
          <br />
          <span style={{ color: GOLD }}>{t.hero.h1b}</span>
        </h1>
        <p
          className="mt-6 max-w-xl text-base md:text-lg leading-relaxed font-light"
          style={{ color: "#C9CFD9" }}
        >
          {t.hero.sub}
        </p>
        <div className="mt-9 flex flex-wrap gap-4 pointer-events-auto">
          <button
            onClick={() => onNavClick("contact")}
            className="ml-cta font-bold rounded-full px-7 py-3.5 text-sm md:text-base"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            {t.hero.cta1}
          </button>
          <button
            onClick={() => onNavClick("services")}
            className="ml-cta font-semibold rounded-full px-7 py-3.5 text-sm md:text-base"
            style={{ border: `1.5px solid ${PAPER}`, color: PAPER }}
          >
            {t.hero.cta2} ↓
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: NAVY2,
          borderTop: "1px solid rgba(250,250,248,0.08)",
          position: "relative",
        }}
      >
        <div
          className="max-w-6xl mx-auto px-5 py-4 flex flex-wrap gap-x-10 gap-y-2 text-xs md:text-sm font-medium"
          style={{ color: "#AEB6C4" }}
        >
          {t.hero.trust.map((s, i) => (
            <span key={i} className="flex items-center gap-2">
              <span
                className="rounded-full"
                style={{ width: 6, height: 6, backgroundColor: GOLD }}
              />
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
