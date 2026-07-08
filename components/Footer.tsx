"use client";

import Mark from "./Mark";
import { NAVY, GOLD, PAPER } from "@/lib/theme";
import { Translation } from "@/lib/i18n";

interface FooterProps {
  t: Translation;
}

export default function Footer({ t }: FooterProps) {
  return (
    <footer style={{ backgroundColor: NAVY }}>
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="ml-logowrap flex items-center gap-2.5">
          <Mark size={28} fg={PAPER} />
          <span className="font-extrabold tracking-tight" style={{ color: PAPER }}>
            MONZON<span className="font-light" style={{ color: GOLD }}> LABS</span>
          </span>
        </div>
        <p className="text-xs" style={{ color: "#8C95A5" }}>
          {t.footer.tags}
        </p>
        <p className="text-xs" style={{ color: "#8C95A5" }}>
          © 2026 Monzon Labs · {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
