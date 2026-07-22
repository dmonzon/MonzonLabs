"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import Mark from "./Mark";
import Reveal from "./Reveal";
import { sendQuoteRequest } from "@/lib/actions";
import { NAVY, GOLD, GOLDTINT, PAPER, INKSOFT } from "@/lib/theme";
import { type Lang } from "@/lib/i18n";
import {
  getQuoteConfig,
  getQuoteUI,
  computeEstimate,
  formatUSD,
  type QuoteCategory,
  type QuoteProduct,
} from "@/lib/quote";

interface QuoteProps {
  lang: Lang;
  onNavClick: (id: string) => void;
}

function CatIcon({ kind }: { kind: QuoteCategory["icon"] }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: GOLD,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (kind === "bolt")
    return (
      <svg {...common}>
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    );
  if (kind === "code")
    return (
      <svg {...common}>
        <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-1L3 20l1.1-4.9a8.4 8.4 0 0 1-1-4A8.4 8.4 0 0 1 11.5 3 8.4 8.4 0 0 1 21 11.5z" />
    </svg>
  );
}

export default function Quote({ lang, onNavClick }: QuoteProps) {
  const config = useMemo(() => getQuoteConfig(lang), [lang]);
  const ui = useMemo(() => getQuoteUI(lang), [lang]);

  const [catId, setCatId] = useState<string | null>(null);
  const [prodId, setProdId] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showEstimate, setShowEstimate] = useState(false);

  const category = config.categories.find((c) => c.id === catId) ?? null;
  const product: QuoteProduct | null =
    category?.products.find((p) => p.id === prodId) ?? null;

  const reset = () => {
    setCatId(null);
    setProdId(null);
    setStepIdx(0);
    setAnswers({});
    setShowEstimate(false);
  };

  const pickCategory = (id: string) => {
    const cat = config.categories.find((c) => c.id === id)!;
    setCatId(id);
    setAnswers({});
    setStepIdx(0);
    setShowEstimate(false);
    // Si la categoría tiene un solo producto, sáltalo.
    if (cat.products.length === 1) {
      setProdId(cat.products[0].id);
    } else {
      setProdId(null);
    }
  };

  const pickProduct = (id: string) => {
    setProdId(id);
    setStepIdx(0);
    setAnswers({});
    setShowEstimate(false);
  };

  const advance = () => {
    if (product && stepIdx < product.steps.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      setShowEstimate(true);
    }
  };

  const goBack = () => {
    if (showEstimate) {
      setShowEstimate(false);
      return;
    }
    if (product && stepIdx > 0) {
      setStepIdx((i) => i - 1);
      return;
    }
    // Volver a la selección de producto (si la categoría tiene varios) o de categoría.
    if (product && category && category.products.length > 1) {
      setProdId(null);
      return;
    }
    reset();
  };

  const chooseSingle = (stepId: string, optId: string) => {
    setAnswers((a) => ({ ...a, [stepId]: [optId] }));
    // avanza en el próximo tick
    setTimeout(advance, 180);
  };

  const toggleMulti = (stepId: string, optId: string) => {
    setAnswers((a) => {
      const cur = a[stepId] ?? [];
      return {
        ...a,
        [stepId]: cur.includes(optId)
          ? cur.filter((x) => x !== optId)
          : [...cur, optId],
      };
    });
  };

  /* ----------------------------- Render helpers ----------------------------- */

  const shell = (children: React.ReactNode) => (
    <Reveal id="services" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
      <div className="max-w-3xl">
        <h2
          className="text-3xl md:text-5xl font-extrabold tracking-tight"
          style={{ color: NAVY }}
        >
          {ui.title}
        </h2>
        <p className="mt-3 text-base md:text-lg font-light" style={{ color: INKSOFT }}>
          {ui.sub}
        </p>
      </div>
      <div
        className="mt-10 rounded-3xl p-6 md:p-10"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E4DC", boxShadow: "0 10px 40px rgba(13,27,51,0.06)" }}
      >
        {children}
      </div>
    </Reveal>
  );

  // Progreso (categoría -> producto -> pasos -> estimado)
  const totalSteps = product ? product.steps.length : 0;
  const progressLabel =
    product && !showEstimate
      ? `${ui.step} ${stepIdx + 1} ${ui.of} ${totalSteps}`
      : null;

  const cardBtn =
    "text-left rounded-2xl p-5 transition-all ml-card w-full flex flex-col";

  /* 1) Selección de categoría */
  if (!catId) {
    return shell(
      <div>
        <p className="text-sm font-bold uppercase tracking-wide mb-5" style={{ color: GOLD }}>
          {ui.pickCategory}
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {config.categories.map((cat) => (
            <button key={cat.id} onClick={() => pickCategory(cat.id)} className={cardBtn} style={{ backgroundColor: PAPER }}>
              <CatIcon kind={cat.icon} />
              <h3 className="mt-3 text-lg font-bold" style={{ color: NAVY }}>
                {cat.label}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: INKSOFT }}>
                {cat.tagline}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* 2) Selección de producto */
  if (category && !prodId) {
    return shell(
      <div>
        <TopBar back={goBack} ui={ui} label={category.label} />
        <p className="text-sm font-bold uppercase tracking-wide mb-5" style={{ color: GOLD }}>
          {ui.pickProduct}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {category.products.map((p) => (
            <button key={p.id} onClick={() => pickProduct(p.id)} className={cardBtn} style={{ backgroundColor: PAPER }}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold" style={{ color: NAVY }}>
                  {p.label}
                </h3>
                <span className="text-xs font-bold whitespace-nowrap" style={{ color: GOLD }}>
                  {ui.from} {formatUSD(p.baseMin)}
                  {p.baseMonthly ? `/${lang === "es" ? "mes" : "mo"}` : ""}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: INKSOFT }}>
                {p.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* 4) Estimado + formulario */
  if (product && showEstimate) {
    return shell(
      <EstimateView
        lang={lang}
        ui={ui}
        category={category!}
        product={product}
        answers={answers}
        onBack={goBack}
        onRestart={reset}
        onContact={() => onNavClick("contact")}
      />
    );
  }

  /* 3) Pasos del producto */
  if (product) {
    const step = product.steps[stepIdx];
    const chosen = answers[step.id] ?? [];
    return shell(
      <div>
        <TopBar back={goBack} ui={ui} label={product.label} progress={progressLabel} />

        {/* barra de progreso */}
        <div className="flex gap-1.5 mb-7">
          {product.steps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full flex-1 transition-colors"
              style={{ backgroundColor: i <= stepIdx ? GOLD : "#EAE6DC" }}
            />
          ))}
        </div>

        <h3 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>
          {step.q}
        </h3>
        {step.hint && (
          <p className="mt-1 text-sm" style={{ color: INKSOFT }}>
            {step.hint}
          </p>
        )}

        <div className="mt-6 grid gap-3">
          {step.opts.map((opt) => {
            const active = chosen.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() =>
                  step.multi ? toggleMulti(step.id, opt.id) : chooseSingle(step.id, opt.id)
                }
                className="text-left rounded-xl px-5 py-4 flex items-center gap-4 transition-all"
                style={{
                  border: `1.5px solid ${active ? GOLD : "#E2DED4"}`,
                  backgroundColor: active ? GOLDTINT : "#FFFFFF",
                }}
              >
                <span
                  className="flex-shrink-0 flex items-center justify-center transition-all"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: step.multi ? 6 : 999,
                    border: `2px solid ${active ? GOLD : "#CBC6B8"}`,
                    backgroundColor: active ? GOLD : "transparent",
                    color: NAVY,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {active ? "✓" : ""}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold" style={{ color: NAVY }}>
                    {opt.label}
                  </span>
                  {opt.desc && (
                    <span className="block text-xs mt-0.5" style={{ color: INKSOFT }}>
                      {opt.desc}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {step.multi && (
          <button
            onClick={advance}
            className="ml-cta mt-7 font-bold rounded-full px-7 py-3 text-sm"
            style={{ backgroundColor: NAVY, color: PAPER }}
          >
            {chosen.length ? ui.continue : ui.skip} →
          </button>
        )}
      </div>
    );
  }

  return null;
}

/* ------------------------------- Sub-components ------------------------------- */

function TopBar({
  back,
  ui,
  label,
  progress,
}: {
  back: () => void;
  ui: ReturnType<typeof getQuoteUI>;
  label: string;
  progress?: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      <button
        onClick={back}
        className="text-sm font-semibold flex items-center gap-1.5 ml-nav"
        style={{ color: INKSOFT }}
      >
        ← {ui.back}
      </button>
      <span className="text-xs font-bold uppercase tracking-wide text-right" style={{ color: GOLD }}>
        {progress ?? label}
      </span>
    </div>
  );
}

function EstimateView({
  lang,
  ui,
  category,
  product,
  answers,
  onBack,
  onRestart,
  onContact,
}: {
  lang: Lang;
  ui: ReturnType<typeof getQuoteUI>;
  category: QuoteCategory;
  product: QuoteProduct;
  answers: Record<string, string[]>;
  onBack: () => void;
  onRestart: () => void;
  onContact: () => void;
}) {
  const est = useMemo(() => computeEstimate(product, answers), [product, answers]);

  // Resumen legible de las selecciones
  const summaryLines = useMemo(() => {
    const lines: string[] = [];
    for (const step of product.steps) {
      const chosen = answers[step.id] ?? [];
      const labels = step.opts
        .filter((o) => chosen.includes(o.id))
        .map((o) => o.label);
      if (labels.length) lines.push(`${step.q}: ${labels.join(", ")}`);
    }
    return lines;
  }, [product, answers]);

  const oneTime =
    est.oneTimeMax > 0
      ? est.oneTimeMin === est.oneTimeMax
        ? formatUSD(est.oneTimeMin)
        : `${formatUSD(est.oneTimeMin)} – ${formatUSD(est.oneTimeMax)}`
      : null;
  const monthly =
    est.monthlyMax > 0
      ? est.monthlyMin === est.monthlyMax
        ? formatUSD(est.monthlyMin)
        : `${formatUSD(est.monthlyMin)} – ${formatUSD(est.monthlyMax)}`
      : null;

  // Texto plano para el correo
  const summaryText = [
    `${category.label} › ${product.label}`,
    ...summaryLines,
    "—",
    oneTime ? `${ui.estimateTitle} (${ui.oneTime}): ${oneTime}` : "",
    monthly ? `${ui.estimateTitle} (${ui.perMonth}): ${monthly}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const [state, formAction, isPending] = useActionState(sendQuoteRequest, {});

  return (
    <div>
      <TopBar back={onBack} ui={ui} label={product.label} />

      <div className="grid md:grid-cols-2 gap-8 md:gap-10">
        {/* Estimado */}
        <div>
          <div className="ml-logowrap flex items-center gap-2.5 mb-4">
            <Mark size={30} />
            <span className="text-sm font-bold uppercase tracking-wide" style={{ color: GOLD }}>
              {ui.estimateTitle}
            </span>
          </div>
          <p className="text-sm" style={{ color: INKSOFT }}>
            {ui.estimateLead}
          </p>

          <div
            className="mt-4 rounded-2xl p-6"
            style={{ backgroundColor: NAVY, color: PAPER }}
          >
            {oneTime && (
              <div>
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {oneTime}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: "#AEB6C4" }}>
                  {ui.oneTime}
                </div>
              </div>
            )}
            {monthly && (
              <div className={oneTime ? "mt-4 pt-4" : ""} style={oneTime ? { borderTop: "1px solid rgba(250,250,248,0.14)" } : undefined}>
                <div className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: GOLD }}>
                  {monthly}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: "#AEB6C4" }}>
                  {ui.perMonth}
                </div>
              </div>
            )}
          </div>

          {summaryLines.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: GOLD }}>
                {ui.summaryTitle}
              </p>
              <ul className="space-y-1.5">
                {summaryLines.map((line, i) => (
                  <li key={i} className="text-sm leading-relaxed" style={{ color: "#3A4453" }}>
                    • {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-6 text-xs italic leading-relaxed" style={{ color: INKSOFT }}>
            {ui.disclaimer}
          </p>

          <button
            onClick={onRestart}
            className="ml-nav mt-4 text-sm font-semibold"
            style={{ color: NAVY }}
          >
            ↺ {ui.restart}
          </button>
        </div>

        {/* Formulario / captura */}
        <div>
          {state.ok ? (
            <div
              className="rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center"
              style={{ backgroundColor: GOLDTINT, border: "1px solid #E7E0CE" }}
            >
              <p className="font-bold text-lg" style={{ color: NAVY }}>
                ✓ {ui.ok}
              </p>
              <button
                onClick={onRestart}
                className="ml-nav mt-5 text-sm font-semibold"
                style={{ color: NAVY }}
              >
                ↺ {ui.restart}
              </button>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <p className="text-sm leading-relaxed" style={{ color: INKSOFT }}>
                {ui.formLead}
              </p>

              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="category" value={category.label} />
              <input type="hidden" name="product" value={product.label} />
              <input type="hidden" name="estimate" value={[oneTime && `${oneTime} ${ui.oneTime}`, monthly && `${monthly} ${ui.perMonth}`].filter(Boolean).join(" · ")} />
              <input type="hidden" name="summary" value={summaryText} />

              <input
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD9CF", color: NAVY }}
                type="text"
                name="name"
                placeholder={ui.name + " *"}
                required
              />
              <input
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD9CF", color: NAVY }}
                type="email"
                name="email"
                placeholder={ui.email + " *"}
                required
              />
              <input
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD9CF", color: NAVY }}
                type="tel"
                name="phone"
                placeholder={ui.phone}
              />
              <textarea
                className="w-full rounded-xl px-4 py-3 text-sm min-h-[90px]"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDD9CF", color: NAVY }}
                name="notes"
                placeholder={ui.notesPh}
              />

              {state.error && (
                <p className="text-sm font-semibold" style={{ color: "#C41E1E" }}>
                  ✗ {ui.error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="ml-cta w-full font-bold rounded-full px-6 py-3.5"
                style={{
                  backgroundColor: isPending ? "#C6CBD4" : NAVY,
                  color: PAPER,
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
              >
                {isPending ? ui.sending : ui.send}
              </button>

              <p className="text-center text-xs" style={{ color: INKSOFT }}>
                {ui.wantExact}{" "}
                <button
                  type="button"
                  onClick={onContact}
                  className="ml-nav font-semibold"
                  style={{ color: GOLD }}
                >
                  {lang === "es" ? "Agenda una llamada gratis" : "Book a free call"} →
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
