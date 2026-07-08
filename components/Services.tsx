"use client";

import Mark from "./Mark";
import ServiceCard from "./ServiceCard";
import Reveal from "./Reveal";
import { NAVY, GOLD, INKSOFT } from "@/lib/theme";
import { Translation } from "@/lib/i18n";

interface ServicesProps {
  lang: "es" | "en";
  t: Translation;
  onNavClick: (id: string) => void;
}

export default function Services({ lang, t, onNavClick }: ServicesProps) {
  return (
    <Reveal id="services" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
      <h2
        className="text-3xl md:text-5xl font-extrabold tracking-tight"
        style={{ color: NAVY }}
      >
        {t.services.title}
      </h2>
      <p
        className="mt-3 text-base md:text-lg font-light"
        style={{ color: INKSOFT }}
      >
        {t.services.sub}
      </p>

      <div className="mt-14 space-y-20">
        {t.services.lines.map((line, li) => (
          <Reveal key={li + lang}>
            <div className="ml-logowrap flex items-center gap-3 mb-2">
              <Mark size={26} />
              <h3
                className="text-xl md:text-2xl font-bold"
                style={{ color: NAVY }}
              >
                {line.name}
              </h3>
            </div>
            <p
              className="max-w-2xl text-sm md:text-base leading-relaxed mb-7"
              style={{ color: INKSOFT }}
            >
              {line.desc}
            </p>
            <div
              className={`grid gap-5 ${
                line.items.length === 3
                  ? "md:grid-cols-3"
                  : line.items.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-1 md:max-w-xl"
              }`}
            >
              {line.items.map((item, ii) => (
                <ServiceCard
                  key={ii + lang}
                  item={item}
                  more={t.services.more}
                  less={t.services.less}
                />
              ))}
            </div>
            <button
              onClick={() => onNavClick("contact")}
              className="ml-cta mt-6 text-sm font-bold"
              style={{ color: GOLD }}
            >
              {line.cta} →
            </button>
          </Reveal>
        ))}
      </div>
    </Reveal>
  );
}
