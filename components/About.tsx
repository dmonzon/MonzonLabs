"use client";

import Mark from "./Mark";
import Reveal from "./Reveal";
import { NAVY, GOLD, GOLDTINT } from "@/lib/theme";
import { Translation } from "@/lib/i18n";

interface AboutProps {
  t: Translation;
}

export default function About({ t }: AboutProps) {
  return (
    <Reveal id="about" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
      <div className="grid md:grid-cols-5 gap-10 items-start">
        <div className="md:col-span-3">
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: NAVY }}
          >
            {t.about.title}
          </h2>
          <p className="mt-6 leading-relaxed" style={{ color: "#3A4453" }}>
            {t.about.p1}
          </p>
          <p className="mt-4 leading-relaxed" style={{ color: "#3A4453" }}>
            {t.about.p2}
          </p>
          <p className="mt-4 leading-relaxed" style={{ color: "#3A4453" }}>
            {t.about.p3}{" "}
            <strong style={{ color: NAVY }}>{t.about.motto}</strong>
          </p>
          <p className="mt-8 font-bold" style={{ color: GOLD }}>
            — {t.about.sig}
          </p>
        </div>
        <div className="md:col-span-2 flex justify-center">
          <div
            className="ml-logowrap rounded-2xl w-full max-w-xs aspect-[4/5] flex items-center justify-center"
            style={{ backgroundColor: GOLDTINT, border: "1px solid #E7E0CE" }}
          >
            <Mark size={110} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}
