 import type { Lang } from "./i18n";

/* ---------------------------------------------------------------------------
 * Cotizador · Quote engine
 * Configuración bilingüe (ES/EN) + cálculo del estimado.
 * Los números son estimados de referencia — el precio final se confirma
 * por escrito, igual que en el proceso descrito en la sección "Proceso".
 * ------------------------------------------------------------------------- */

export interface QuoteOpt {
  id: string;
  label: string;
  desc?: string;
  /** Aporte al estimado (mínimo). Si `monthly`, es aporte mensual. */
  min: number;
  /** Aporte al estimado (máximo). Si `monthly`, es aporte mensual. */
  max: number;
  monthly?: boolean;
}

export interface QuoteStep {
  id: string;
  q: string;
  hint?: string;
  /** true = selección múltiple; por defecto es selección única. */
  multi?: boolean;
  opts: QuoteOpt[];
}

export interface QuoteProduct {
  id: string;
  label: string;
  desc: string;
  baseMin: number;
  baseMax: number;
  baseMonthly?: boolean;
  steps: QuoteStep[];
}

export interface QuoteCategory {
  id: string;
  label: string;
  tagline: string;
  icon: "bolt" | "code" | "chat";
  products: QuoteProduct[];
}

export interface QuoteConfig {
  categories: QuoteCategory[];
}

export interface Estimate {
  oneTimeMin: number;
  oneTimeMax: number;
  monthlyMin: number;
  monthlyMax: number;
}

/** Textos de la interfaz del cotizador. */
export interface QuoteUI {
  title: string;
  sub: string;
  disclaimer: string;
  step: string; // "Paso {n} de {total}"
  of: string;
  back: string;
  continue: string;
  skip: string;
  restart: string;
  pickCategory: string;
  pickProduct: string;
  estimateTitle: string;
  estimateLead: string;
  oneTime: string;
  perMonth: string;
  summaryTitle: string;
  formLead: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  notesPh: string;
  send: string;
  sending: string;
  ok: string;
  error: string;
  wantExact: string;
  from: string; // "desde" / "from"
}

export function getQuoteUI(lang: Lang): QuoteUI {
  const L = <T,>(es: T, en: T): T => (lang === "es" ? es : en);
  return {
    title: L("Cotiza tu proyecto", "Get an instant quote"),
    sub: L(
      "Responde unas preguntas y obtén un estimado al instante. Sin compromiso.",
      "Answer a few questions and get an instant estimate. No commitment."
    ),
    disclaimer: L(
      "Estimado de referencia. El precio final se confirma por escrito antes de comenzar — lo que se cotiza es lo que se paga.",
      "Reference estimate. The final price is confirmed in writing before we start — what's quoted is what you pay."
    ),
    step: L("Paso", "Step"),
    of: L("de", "of"),
    back: L("Atrás", "Back"),
    continue: L("Continuar", "Continue"),
    skip: L("Ninguno / continuar", "None / continue"),
    restart: L("Empezar de nuevo", "Start over"),
    pickCategory: L("¿Qué necesitas?", "What do you need?"),
    pickProduct: L("Elige la opción que más se acerca", "Pick the option that fits best"),
    estimateTitle: L("Tu estimado", "Your estimate"),
    estimateLead: L(
      "Según lo que nos contaste, tu proyecto rondaría:",
      "Based on what you told us, your project would be around:"
    ),
    oneTime: L("pago único", "one-time"),
    perMonth: L("por mes", "per month"),
    summaryTitle: L("Lo que incluiste", "What you selected"),
    formLead: L(
      "¿Quieres el detalle por correo y una propuesta a la medida? Déjanos tus datos.",
      "Want the details by email and a tailored proposal? Leave your info."
    ),
    name: L("Nombre", "Name"),
    email: L("Correo electrónico", "Email"),
    phone: L("Teléfono (opcional)", "Phone (optional)"),
    notes: L("Comentarios (opcional)", "Notes (optional)"),
    notesPh: L(
      "Cuéntanos cualquier detalle adicional de tu proyecto…",
      "Tell us any extra detail about your project…"
    ),
    send: L("Enviar mi cotización", "Send my quote"),
    sending: L("Enviando…", "Sending…"),
    ok: L(
      "¡Recibido! Te enviamos el detalle y respondemos en menos de 24 horas laborales.",
      "Got it! We've sent the details and will reply within 24 business hours."
    ),
    error: L("Error al enviar. Intenta de nuevo.", "Error sending. Please try again."),
    wantExact: L("¿Prefieres hablarlo?", "Rather talk it through?"),
    from: L("desde", "from"),
  };
}

export function getQuoteConfig(lang: Lang): QuoteConfig {
  const es = lang === "es";
  const L = <T,>(a: T, b: T): T => (es ? a : b);

  return {
    categories: [
      /* ---------------- Automatización e IA ---------------- */
      {
        id: "automation",
        icon: "bolt",
        label: L("Automatización e IA", "AI & Automation"),
        tagline: L(
          "Agentes y flujos que trabajan solos.",
          "Agents and workflows that run themselves."
        ),
        products: [
          {
            id: "audit",
            label: L("Auditoría de Automatización", "Automation Audit"),
            desc: L(
              "Analizamos tus procesos y te entregamos un plan claro de qué automatizar.",
              "We analyze your processes and deliver a clear plan of what to automate."
            ),
            baseMin: L(750, 950),
            baseMax: L(1200, 1500),
            steps: [
              {
                id: "size",
                q: L("Tamaño de tu operación", "Size of your operation"),
                opts: [
                  { id: "small", label: L("Pequeña (1–5 personas)", "Small (1–5 people)"), min: 0, max: 0 },
                  { id: "medium", label: L("Mediana (6–20 personas)", "Medium (6–20 people)"), min: L(150, 200), max: L(400, 500) },
                  { id: "large", label: L("Grande (20+ personas)", "Large (20+ people)"), min: L(400, 500), max: L(900, 1100) },
                ],
              },
            ],
          },
          {
            id: "implementation",
            label: L("Implementación de Agentes y Automatización", "Agent & Automation Implementation"),
            desc: L(
              "Flujos automatizados de punta a punta: integraciones, agentes y notificaciones.",
              "End-to-end automated workflows: integrations, agents, and notifications."
            ),
            baseMin: L(3000, 4000),
            baseMax: L(3000, 4000),
            steps: [
              {
                id: "complexity",
                q: L("Complejidad del flujo", "Workflow complexity"),
                opts: [
                  { id: "simple", label: L("Sencillo — 1 a 2 pasos", "Simple — 1 to 2 steps"), min: 0, max: L(1000, 1200) },
                  { id: "medium", label: L("Medio — varios pasos con lógica", "Medium — several steps with logic"), min: L(1500, 2000), max: L(4000, 4500) },
                  { id: "complex", label: L("Complejo — múltiples sistemas y agentes IA", "Complex — multiple systems and AI agents"), min: L(4000, 5000), max: L(9000, 11000) },
                ],
              },
              {
                id: "integrations",
                q: L("¿Qué necesitas conectar?", "What needs to connect?"),
                hint: L("Selecciona todas las que apliquen", "Select all that apply"),
                multi: true,
                opts: [
                  { id: "crm", label: L("CRM (HubSpot, Salesforce…)", "CRM (HubSpot, Salesforce…)"), min: 500, max: 1200 },
                  { id: "email", label: L("Correo y calendario", "Email and calendar"), min: 300, max: 800 },
                  { id: "billing", label: L("Pagos y facturación", "Payments and billing"), min: 600, max: 1500 },
                  { id: "chat", label: L("WhatsApp / chat", "WhatsApp / chat"), min: 500, max: 1200 },
                  { id: "api", label: L("APIs a la medida", "Custom APIs"), min: 800, max: 2500 },
                ],
              },
              {
                id: "support",
                q: L("¿Soporte mensual después del lanzamiento?", "Monthly support after launch?"),
                opts: [
                  { id: "none", label: L("No, solo la implementación", "No, just the implementation"), min: 0, max: 0 },
                  { id: "yes", label: L("Sí, soporte y mejoras continuas", "Yes, ongoing support and improvements"), min: L(400, 500), max: L(800, 1000), monthly: true },
                ],
              },
            ],
          },
          {
            id: "support",
            label: L("Soporte y Optimización Continua", "Ongoing Support & Optimization"),
            desc: L(
              "Monitoreo, ajustes y mejoras mes a mes. Sin contratos largos.",
              "Monitoring, tuning, and improvements month to month. No long contracts."
            ),
            baseMin: L(400, 500),
            baseMax: L(400, 500),
            baseMonthly: true,
            steps: [
              {
                id: "level",
                q: L("Nivel de soporte", "Support level"),
                opts: [
                  { id: "basic", label: L("Básico — monitoreo y correcciones", "Basic — monitoring and fixes"), min: 0, max: 0, monthly: true },
                  { id: "standard", label: L("Estándar — + horas de mejoras", "Standard — + improvement hours"), min: L(200, 250), max: L(400, 500), monthly: true },
                  { id: "priority", label: L("Prioritario — respuesta prioritaria y más horas", "Priority — priority response and more hours"), min: L(500, 600), max: L(1000, 1200), monthly: true },
                ],
              },
            ],
          },
        ],
      },

      /* ---------------- Desarrollo Web y Mobile ---------------- */
      {
        id: "web",
        icon: "code",
        label: L("Desarrollo Web y Mobile", "Web & Mobile Development"),
        tagline: L(
          "Sitios y aplicaciones a la medida, no plantillas.",
          "Custom sites and applications, not templates."
        ),
        products: [
          {
            id: "landing",
            label: L("Landing Page Profesional", "Professional Landing Page"),
            desc: L(
              "Tu negocio en línea, optimizado para convertir visitantes en clientes.",
              "Your business online, built to convert visitors into customers."
            ),
            baseMin: L(1500, 2000),
            baseMax: L(1500, 2000),
            steps: [
              {
                id: "sections",
                q: L("¿Cuántas secciones?", "How many sections?"),
                opts: [
                  { id: "upto6", label: L("Hasta 6 (incluidas)", "Up to 6 (included)"), min: 0, max: 0 },
                  { id: "s7_10", label: L("7 a 10 secciones", "7 to 10 sections"), min: 600, max: 1200 },
                  { id: "s10plus", label: L("Más de 10 secciones", "More than 10 sections"), min: 1500, max: 3000 },
                ],
              },
              {
                id: "extras",
                q: L("Extras", "Extras"),
                hint: L("Selecciona todas las que apliquen", "Select all that apply"),
                multi: true,
                opts: [
                  { id: "bilingual", label: L("Bilingüe (ES/EN)", "Bilingual (ES/EN)"), min: 600, max: 900 },
                  { id: "cms", label: L("Blog / CMS editable", "Blog / editable CMS"), min: 800, max: 1500 },
                  { id: "booking", label: L("Reservaciones o citas", "Bookings or appointments"), min: 700, max: 1500 },
                  { id: "payments", label: L("Integración de pagos", "Payments integration"), min: 800, max: 1800 },
                  { id: "animations", label: L("Animaciones avanzadas", "Advanced animations"), min: 400, max: 1000 },
                ],
              },
            ],
          },
          {
            id: "webapp",
            label: L("Aplicación Web a la Medida", "Custom Web Application"),
            desc: L(
              "Sistemas completos: portales, plataformas de gestión, herramientas internas.",
              "Complete systems: portals, management platforms, internal tools."
            ),
            baseMin: L(6000, 8000),
            baseMax: L(6000, 8000),
            steps: [
              {
                id: "scope",
                q: L("Tamaño del proyecto", "Project size"),
                opts: [
                  { id: "mvp", label: L("MVP — versión inicial funcional", "MVP — working first version"), min: 0, max: L(2000, 2500) },
                  { id: "platform", label: L("Plataforma — varios módulos", "Platform — several modules"), min: L(3000, 4000), max: L(8000, 9000) },
                  { id: "enterprise", label: L("Sistema empresarial", "Enterprise system"), min: L(10000, 12000), max: L(25000, 28000) },
                ],
              },
              {
                id: "modules",
                q: L("Módulos que necesitas", "Modules you need"),
                hint: L("Selecciona todas las que apliquen", "Select all that apply"),
                multi: true,
                opts: [
                  { id: "auth", label: L("Autenticación y roles", "Authentication and roles"), min: 800, max: 2000 },
                  { id: "admin", label: L("Panel de administración", "Admin dashboard"), min: 1200, max: 3000 },
                  { id: "payments", label: L("Pagos y suscripciones", "Payments and subscriptions"), min: 1500, max: 4000 },
                  { id: "integrations", label: L("Integraciones externas", "External integrations"), min: 1000, max: 3000 },
                  { id: "mobile", label: L("App móvil (iOS/Android)", "Mobile app (iOS/Android)"), min: 4000, max: 10000 },
                  { id: "reports", label: L("Reportes y analítica", "Reports and analytics"), min: 1000, max: 2500 },
                ],
              },
            ],
          },
        ],
      },

      /* ---------------- Consultoría IT ---------------- */
      {
        id: "consulting",
        icon: "chat",
        label: L("Consultoría IT", "IT Consulting"),
        tagline: L(
          "25+ años de experiencia a tu disposición.",
          "25+ years of experience at your service."
        ),
        products: [
          {
            id: "consulting",
            label: L("Consultoría por hora", "Hourly Consulting"),
            desc: L(
              "Diagnóstico de infraestructura, redes y sistemas, o asesoría estratégica.",
              "Infrastructure, network, and systems diagnosis, or strategic guidance."
            ),
            baseMin: 0,
            baseMax: 0,
            steps: [
              {
                id: "hours",
                q: L("¿Cuánto tiempo estimas?", "How much time do you estimate?"),
                hint: L("Tarifa desde", "Rate from") + L(" $85/hr", " $110/hr"),
                opts: [
                  { id: "one", label: L("Una sesión (1–2 horas)", "One session (1–2 hours)"), min: L(85, 110), max: L(170, 220) },
                  { id: "half", label: L("Media jornada (~4 horas)", "Half day (~4 hours)"), min: L(340, 440), max: L(340, 440) },
                  { id: "short", label: L("Proyecto corto (~10 horas)", "Short project (~10 hours)"), min: L(850, 1100), max: L(850, 1100) },
                  { id: "unsure", label: L("No estoy seguro", "Not sure yet"), min: L(85, 110), max: L(1000, 1300) },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

/** Suma base + opciones seleccionadas. `answers` mapea stepId -> optId[]. */
export function computeEstimate(
  product: QuoteProduct,
  answers: Record<string, string[]>
): Estimate {
  let oneTimeMin = product.baseMonthly ? 0 : product.baseMin;
  let oneTimeMax = product.baseMonthly ? 0 : product.baseMax;
  let monthlyMin = product.baseMonthly ? product.baseMin : 0;
  let monthlyMax = product.baseMonthly ? product.baseMax : 0;

  for (const step of product.steps) {
    const chosen = answers[step.id] ?? [];
    for (const opt of step.opts) {
      if (!chosen.includes(opt.id)) continue;
      if (opt.monthly) {
        monthlyMin += opt.min;
        monthlyMax += opt.max;
      } else {
        oneTimeMin += opt.min;
        oneTimeMax += opt.max;
      }
    }
  }

  return { oneTimeMin, oneTimeMax, monthlyMin, monthlyMax };
}

/** Redondea al múltiplo de 50 más cercano para presentación. */
export function roundNice(n: number): number {
  return Math.round(n / 50) * 50;
}

export function formatUSD(n: number): string {
  return "$" + roundNice(n).toLocaleString("en-US");
}
