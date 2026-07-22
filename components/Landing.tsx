"use client";

import { useState } from "react";
import { T, type Lang } from "@/lib/i18n";
import { PAPER } from "@/lib/theme";
import Header from "./Header";
import Hero from "./Hero";
import Quote from "./Quote";
import Process from "./Process";
import About from "./About";
import FinalCta from "./FinalCta";
import ContactSection from "./ContactSection";
import Footer from "./Footer";

export default function Landing() {
  const [lang, setLang] = useState<Lang>("es");
  const t = T[lang];

  const handleNavClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ backgroundColor: PAPER, fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif" }}>
      <Header
        lang={lang}
        t={t}
        onLangToggle={() => setLang(lang === "es" ? "en" : "es")}
        onNavClick={handleNavClick}
      />

      <Hero t={t} onNavClick={handleNavClick} />

      <Quote lang={lang} onNavClick={handleNavClick} />

      <Process t={t} />

      <About t={t} />

      <FinalCta t={t} onNavClick={handleNavClick} />

      <ContactSection t={t} />

      <Footer t={t} />
    </div>
  );
}
