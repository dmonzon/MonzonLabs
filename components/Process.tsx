"use client";

import Reveal from "./Reveal";
import { NAVY, GOLD, PAPER } from "@/lib/theme";
import { Translation } from "@/lib/i18n";

interface ProcessProps {
  t: Translation;
}

export default function Process({ t }: ProcessProps) {
  return (
    <section id="process" style={{ backgroundColor: NAVY }}>
      <Reveal className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <h2
          className="text-3xl md:text-4xl font-extrabold tracking-tight mb-14"
          style={{ color: PAPER }}
        >
          {t.process.title}
        </h2>
        <div className="grid md:grid-cols-4 gap-10 relative">
          <div
            className="hidden md:block absolute left-0 right-0"
            style={{
              top: 13,
              height: 2,
              backgroundColor: "rgba(250,250,248,0.15)",
            }}
          />
          {t.process.steps.map((s, i) => (
            <div key={i} className="ml-step relative cursor-default">
              <div
                className="ml-node rounded-full relative z-10"
                style={{
                  width: 28,
                  height: 28,
                  backgroundColor: i === 3 ? GOLD : PAPER,
                  border: `6px solid ${NAVY}`,
                  boxShadow: `0 0 0 2px ${
                    i === 3 ? GOLD : "rgba(250,250,248,0.4)"
                  }`,
                }}
              />
              <h3 className="mt-5 font-bold text-lg" style={{ color: PAPER }}>
                {s.t}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed font-light"
                style={{ color: "#B7BEC9" }}
              >
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
