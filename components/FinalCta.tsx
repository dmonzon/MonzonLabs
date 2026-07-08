"use client";

import Reveal from "./Reveal";
import { NAVY, PAPER, GOLDTINT } from "@/lib/theme";
import { Translation } from "@/lib/i18n";

interface FinalCtaProps {
  t: Translation;
  onNavClick: (id: string) => void;
}

export default function FinalCta({ t, onNavClick }: FinalCtaProps) {
  return (
    <section
      style={{
        backgroundColor: GOLDTINT,
        borderTop: "1px solid #EDE6D3",
        borderBottom: "1px solid #EDE6D3",
      }}
    >
      <Reveal className="max-w-3xl mx-auto px-5 py-16 md:py-20 text-center">
        <h2
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
          style={{ color: NAVY }}
        >
          {t.finalCta.title}
        </h2>
        <p
          className="mt-4 leading-relaxed"
          style={{ color: "#3A4453" }}
        >
          {t.finalCta.text}
        </p>
        <button
          onClick={() => onNavClick("contact")}
          className="ml-cta mt-8 font-bold rounded-full px-8 py-3.5"
          style={{ backgroundColor: NAVY, color: PAPER }}
        >
          {t.finalCta.btn}
        </button>
      </Reveal>
    </section>
  );
}
