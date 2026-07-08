"use client";

import Mark from "./Mark";
import Reveal from "./Reveal";
import ContactForm from "./ContactForm";
import { NAVY, INKSOFT } from "@/lib/theme";
import { Translation } from "@/lib/i18n";

interface ContactSectionProps {
  t: Translation;
}

export default function ContactSection({ t }: ContactSectionProps) {
  return (
    <Reveal id="contact" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: NAVY }}
          >
            {t.contact.title}
          </h2>
          <p
            className="mt-5 text-sm leading-relaxed"
            style={{ color: INKSOFT }}
          >
            📧 danny@monzonlabs.com
            <br />
            📍 {t.contact.direct}
          </p>
          <div className="mt-8 hidden md:block ml-logowrap">
            <Mark size={64} />
          </div>
        </div>

        <div>
          <ContactForm t={t} />
        </div>
      </div>
    </Reveal>
  );
}
