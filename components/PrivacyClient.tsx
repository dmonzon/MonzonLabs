"use client";

import { useState } from "react";
import Link from "next/link";
import { T, type Lang } from "@/lib/i18n";
import { NAVY, GOLD, PAPER, INKSOFT } from "@/lib/theme";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyClient() {
  const [lang, setLang] = useState<Lang>("es");
  const t = T[lang];
  const privacy = t.privacy;

  const handleNavClick = (id: string) => {
    if (id === "contact") {
      window.location.href = "/#contact";
    } else {
      window.location.href = `/#${id}`;
    }
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\n- /g, "\n• ");
  };

  return (
    <>
      <Header
        lang={lang}
        t={t}
        onLangToggle={() => setLang(lang === "es" ? "en" : "es")}
        onNavClick={handleNavClick}
      />

      <main className="min-h-screen" style={{ backgroundColor: "#FAFAF8" }}>
        <div className="max-w-3xl mx-auto px-5 py-12 md:py-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: NAVY }}>
            {privacy.title}
          </h1>
          <p className="text-sm mb-8" style={{ color: INKSOFT }}>
            {privacy.updated}
          </p>

          <p className="text-base leading-relaxed mb-12" style={{ color: NAVY }}>
            {privacy.intro}
          </p>

          {privacy.sections.map((section, idx) => (
            <section key={idx} className="mb-12">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: NAVY }}
              >
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.paragraphs.map((para, pidx) => (
                  <p
                    key={pidx}
                    className="text-base leading-relaxed"
                    style={{ color: NAVY }}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(para)
                        .replace(
                          /danny@monzonlabs\.com/g,
                          '<a href="mailto:danny@monzonlabs.com" style="color: ' +
                            GOLD +
                            '; text-decoration: underline;">danny@monzonlabs.com</a>'
                        ),
                    }}
                  />
                ))}
              </div>
            </section>
          ))}

          <div className="mt-16 pt-8 border-t" style={{ borderColor: "#E7E0CE" }}>
            <Link
              href="/"
              className="inline-block text-sm font-bold rounded-full px-6 py-3"
              style={{ backgroundColor: NAVY, color: PAPER }}
            >
              {lang === "es" ? "← Volver al inicio" : "← Back to home"}
            </Link>
          </div>
        </div>
      </main>

      <Footer t={t} />
    </>
  );
}
