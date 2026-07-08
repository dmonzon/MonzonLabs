import React, { useState, useRef, useEffect } from "react";

/* ============================================================
   MONZON LABS — Landing bilingüe (ES/EN) · v2 con animaciones
   ------------------------------------------------------------
   Nuevo en v2:
   · Hero: red de nodos INTERACTIVA — los nodos se apartan del
     cursor y se dibujan conexiones dinámicas hacia él
   · Tarjetas de servicio: elevación + borde dorado al hover
   · Proceso: los nodos crecen y se encienden al hover
   · Logo: el nodo dorado pulsa al hover
   · Secciones: aparición suave al hacer scroll
   · Respeta prefers-reduced-motion
   ============================================================ */

const NAVY = "#0D1B33";
const NAVY2 = "#13233F";
const GOLD = "#D4A853";
const PAPER = "#FAFAF8";
const INKSOFT = "#5C6674";
const GOLDTINT = "#F6EDDA";

/* ---------------- Mark: M de nodos ---------------- */
const Mark = ({ size = 40, fg = NAVY, accent = GOLD }) => {
  const r = size * 0.36, cx = size / 2, cy = size * 0.52;
  const pts = [[-1,0.75],[-0.5,-0.75],[0,0.35],[0.5,-0.75],[1,0.75]]
    .map(([x, y]) => [cx + x * r, cy + y * r]);
  return (
    <svg className="ml-logo" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Monzon Labs">
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={fg}
        strokeWidth={size * 0.055} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} className={i === 2 ? "ml-goldnode" : ""} cx={p[0]} cy={p[1]}
          r={i === 0 || i === 4 ? size * 0.075 : size * 0.062} fill={i === 2 ? accent : fg} />
      ))}
    </svg>
  );
};

/* ---------------- Hero: red de nodos interactiva ---------------- */
const BASE_NODES = [
  [60, 470], [210, 180], [360, 380], [510, 120],
  [660, 420], [830, 240], [1000, 460], [1140, 200],
];
const EDGES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]];

const NodeField = () => {
  const ref = useRef(null);
  const raf = useRef(null);
  const [mouse, setMouse] = useState(null); // [x,y] en coords del viewBox, o null

  const toViewBox = (e) => {
    const el = ref.current;
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return [((e.clientX - b.left) / b.width) * 1200, ((e.clientY - b.top) / b.height) * 600];
  };

  const onMove = (e) => {
    if (raf.current) return;
    const pt = toViewBox(e);
    raf.current = requestAnimationFrame(() => {
      setMouse(pt);
      raf.current = null;
    });
  };

  useEffect(() => () => raf.current && cancelAnimationFrame(raf.current), []);

  // Nodos desplazados: se apartan suavemente del cursor
  const nodes = BASE_NODES.map(([x, y]) => {
    if (!mouse) return [x, y];
    const dx = x - mouse[0], dy = y - mouse[1];
    const dist = Math.max(Math.hypot(dx, dy), 1);
    const push = Math.max(0, 1 - dist / 320) * 46; // radio de influencia 320, empuje máx 46
    return [x + (dx / dist) * push, y + (dy / dist) * push];
  });

  // Conexiones dinámicas: cursor → 3 nodos más cercanos
  let links = [];
  if (mouse) {
    links = nodes
      .map((p, i) => ({ p, i, d: Math.hypot(p[0] - mouse[0], p[1] - mouse[1]) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .filter((n) => n.d < 420);
  }

  return (
    <svg
      ref={ref}
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      onMouseMove={onMove}
      onMouseLeave={() => setMouse(null)}
      aria-hidden="true"
    >
      {/* aristas base */}
      <g stroke={PAPER} strokeWidth="1.4" fill="none" opacity="0.14">
        {EDGES.map(([a, b], i) => (
          <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
            style={{ transition: "all 120ms linear" }} />
        ))}
      </g>

      {/* conexiones hacia el cursor */}
      {mouse && (
        <g stroke={GOLD} strokeWidth="1.6" fill="none">
          {links.map((n, i) => (
            <line key={i} x1={mouse[0]} y1={mouse[1]} x2={n.p[0]} y2={n.p[1]}
              opacity={Math.max(0.08, 0.5 - n.d / 900)} />
          ))}
        </g>
      )}

      {/* nodos */}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 4 ? 9 : 6.5}
          fill={i === 4 ? GOLD : PAPER}
          opacity={i === 4 ? 0.85 : 0.35}
          style={{ transition: "cx 120ms linear, cy 120ms linear" }} />
      ))}

      {/* nodo del cursor */}
      {mouse && (
        <g>
          <circle cx={mouse[0]} cy={mouse[1]} r="22" fill={GOLD} opacity="0.10" />
          <circle cx={mouse[0]} cy={mouse[1]} r="7" fill={GOLD} opacity="0.9" />
        </g>
      )}
    </svg>
  );
};

/* ---------------- Reveal al hacer scroll ---------------- */
const Reveal = ({ children, className = "", id }) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setVis(true), io.disconnect()),
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} id={id} className={`ml-reveal ${vis ? "ml-visible" : ""} ${className}`}>
      {children}
    </div>
  );
};

/* ---------------- Traducciones ---------------- */
const T = {
  es: {
    nav: { services: "Servicios", process: "Proceso", about: "Nosotros", contact: "Contacto", cta: "Llamada gratis" },
    hero: {
      kicker: "Automatización · Desarrollo · Consultoría IT",
      h1a: "Tecnología que trabaja",
      h1b: "por tu negocio.",
      sub: "Automatización con inteligencia artificial, desarrollo web y consultoría IT — con más de 25 años de experiencia haciendo que la tecnología resuelva, no complique.",
      cta1: "Agenda una llamada gratis",
      cta2: "Ver servicios",
      trust: ["25+ años de experiencia en IT", "Puerto Rico · servicio a EE.UU.", "Respuesta en menos de 24 horas"],
    },
    services: {
      title: "Servicios",
      sub: "Soluciones que trabajan mientras tú te enfocas en tu negocio.",
      more: "Ver qué incluye",
      less: "Ocultar detalles",
      lines: [
        {
          name: "Automatización e IA",
          desc: "Convierte tareas repetitivas en procesos que corren solos. Agentes de IA y flujos de automatización que ahorran horas cada semana.",
          cta: "Solicita tu auditoría",
          items: [
            { t: "Auditoría de Automatización", p: "desde $750",
              d: "Analizamos tus procesos y te entregamos un plan claro: qué automatizar, con qué herramientas y cuánto ahorrarías.",
              inc: ["Sesión de descubrimiento (1-2 horas)","Análisis de tareas repetitivas y cuellos de botella","Reporte de oportunidades priorizadas por impacto","Recomendación de herramientas para tu caso","Estimado de ahorro en horas y costos","Cotización de implementación — se acredita a tu proyecto"],
              note: "Entrega: 1-2 semanas · El reporte es tuyo, lo implementes con nosotros o no." },
            { t: "Implementación de Agentes y Automatización", p: "desde $3,000",
              d: "Flujos automatizados de punta a punta: integraciones, agentes inteligentes y notificaciones en tiempo real.",
              inc: ["Diseño e implementación del flujo completo","Integración con tus sistemas (CRM, correo, APIs)","Agentes de IA y notificaciones en tiempo real","Pruebas completas antes de la puesta en marcha","Documentación en lenguaje claro y entrenamiento","30 días de soporte post-lanzamiento"],
              note: "No incluye suscripciones de terceros (típicamente $20-100/mes), contratadas a tu nombre." },
            { t: "Soporte y Optimización Continua", p: "desde $400/mes",
              d: "Monitoreo, ajustes y mejoras constantes para que todo siga funcionando mientras creces.",
              inc: ["Monitoreo proactivo de flujos y agentes","Corrección de errores y ajustes ante cambios","Horas mensuales de mejoras","Reporte mensual de desempeño","Canal directo con respuesta prioritaria"],
              note: "Sin contratos largos: mes a mes, cancela cuando quieras." },
          ],
        },
        {
          name: "Desarrollo Web y Mobile",
          desc: "Aplicaciones y sitios modernos, rápidos y hechos a la medida — no plantillas genéricas.",
          cta: "Cuéntanos tu proyecto",
          items: [
            { t: "Landing Page Profesional", p: "desde $1,500",
              d: "Tu negocio en línea en 2-3 semanas, optimizado para convertir visitantes en clientes.",
              inc: ["Diseño personalizado — no plantillas","Hasta 6 secciones + formulario de contacto","100% adaptada a móviles","SEO básico e indexación en Google","Configuración completa de dominio y hosting","2 rondas de revisiones + guía de actualización"],
              note: "Dominio (~$10-15/año) y hosting se registran a tu nombre — tú eres siempre el dueño de tu sitio." },
            { t: "Aplicación Web a la Medida", p: "desde $6,000",
              d: "Sistemas completos: portales de clientes, plataformas de gestión, herramientas internas.",
              inc: ["Descubrimiento, diseño UX y desarrollo completo","Frontend, backend y base de datos","Autenticación de usuarios y roles","Panel de administración","Despliegue, documentación y entrenamiento","60 días de garantía post-lanzamiento"],
              note: "Alcance y precio final por escrito antes de comenzar. Infraestructura contratada a tu nombre." },
          ],
        },
        {
          name: "Consultoría IT",
          desc: "Más de 25 años de experiencia: infraestructura, redes, resolución de problemas y asesoría estratégica.",
          cta: "Agenda una llamada",
          items: [
            { t: "Consultoría por hora", p: "desde $85/hr",
              d: "Para cuando necesitas respuestas de alguien que ya lo ha visto todo.",
              inc: ["Sesiones remotas o presenciales (área metro)","Diagnóstico de infraestructura, redes y sistemas","Asesoría en tecnología, proveedores y arquitectura","Resumen escrito tras cada sesión","Mínimo 1 hora — sin retainers obligatorios"],
              note: "" },
          ],
        },
      ],
    },
    process: {
      title: "Simple, claro y sin sorpresas",
      steps: [
        { t: "Conversamos", d: "Una llamada gratuita de 20 minutos para entender tu situación. Sin compromiso y sin jerga técnica." },
        { t: "Te proponemos", d: "Propuesta por escrito con alcance, precio y fechas definidas. Lo que se cotiza es lo que se paga." },
        { t: "Construimos", d: "Avances visibles y comunicación constante. Nada de desaparecer por semanas." },
        { t: "Te acompañamos", d: "Entrega con entrenamiento y soporte. Y si quieres, seguimos optimizando mes a mes." },
      ],
    },
    about: {
      title: "La experiencia de siempre, las herramientas de ahora",
      p1: "Monzon Labs nace de más de 25 años de carrera en tecnología: desde reparar computadoras y montar redes, hasta desarrollar aplicaciones y sistemas completos. Esa trayectoria tiene una ventaja que pocos ofrecen — entendemos la tecnología desde el cable hasta la nube.",
      p2: "Hoy aplicamos esa experiencia a lo que viene: agentes de inteligencia artificial y automatización que le ahorran a los negocios horas de trabajo manual cada semana.",
      p3: "Trabajamos desde Puerto Rico para clientes locales y de Estados Unidos, en español o inglés, con una filosofía simple:",
      motto: "la tecnología debe resolver problemas, no crearlos.",
      sig: "Danny Monzón · Fundador",
    },
    finalCta: {
      title: "¿Hablamos?",
      text: "20 minutos, gratis, sin compromiso. Sales de la llamada sabiendo exactamente qué necesita tu negocio — trabajemos juntos o no.",
      btn: "Agendar mi llamada",
    },
    contact: {
      title: "Contacto",
      name: "Nombre", email: "Correo electrónico", phone: "Teléfono (opcional)",
      need: "¿Qué necesitas?",
      needOpts: ["Automatización e IA", "Página web", "Aplicación a la medida", "Consultoría IT", "No estoy seguro"],
      msg: "Cuéntanos brevemente tu situación",
      send: "Enviar mensaje",
      ok: "¡Recibido! Te respondemos en menos de 24 horas laborables.",
      direct: "San Juan, Puerto Rico · Servicio remoto a todo EE.UU.",
    },
    footer: { rights: "Todos los derechos reservados", tags: "Automatización · Desarrollo Web · Consultoría IT" },
  },

  en: {
    nav: { services: "Services", process: "Process", about: "About", contact: "Contact", cta: "Free call" },
    hero: {
      kicker: "Automation · Development · IT Consulting",
      h1a: "Technology that works",
      h1b: "for your business.",
      sub: "AI-powered automation, web development, and IT consulting — backed by 25+ years of experience making technology solve problems, not create them.",
      cta1: "Book a free call",
      cta2: "View services",
      trust: ["25+ years of IT experience", "Puerto Rico · serving the U.S.", "Replies within 24 hours"],
    },
    services: {
      title: "Services",
      sub: "Solutions that work while you focus on your business.",
      more: "See what's included",
      less: "Hide details",
      lines: [
        {
          name: "AI & Automation",
          desc: "Turn repetitive tasks into processes that run themselves. AI agents and automation workflows that save hours every week.",
          cta: "Request your audit",
          items: [
            { t: "Automation Audit", p: "from $950",
              d: "We analyze your processes and deliver a clear plan: what to automate, which tools, and how much you'd save.",
              inc: ["Discovery session (1-2 hours)","Analysis of repetitive tasks and bottlenecks","Report with opportunities prioritized by impact","Specific tool recommendations","Estimated savings in hours and costs","Implementation quote — credited toward your project"],
              note: "Delivery: 1-2 weeks · The report is yours to keep, whether you implement with us or not." },
            { t: "Agent & Automation Implementation", p: "from $4,000",
              d: "End-to-end automated workflows: integrations, intelligent agents, and real-time notifications.",
              inc: ["Design and implementation of the complete workflow","Integration with your systems (CRM, email, APIs)","AI agents and real-time notifications","Full testing before go-live","Plain-language documentation and training","30 days of post-launch support"],
              note: "Third-party subscriptions not included (typically $20-100/mo), contracted under your name." },
            { t: "Ongoing Support & Optimization", p: "from $500/mo",
              d: "Monitoring, tuning, and continuous improvements so everything keeps running as you grow.",
              inc: ["Proactive monitoring of workflows and agents","Bug fixes and adjustments when systems change","Monthly improvement hours","Monthly performance report","Direct channel with priority response"],
              note: "No long contracts: month to month, cancel anytime." },
          ],
        },
        {
          name: "Web & Mobile Development",
          desc: "Modern, fast applications and websites built for your business — not generic templates.",
          cta: "Tell us about your project",
          items: [
            { t: "Professional Landing Page", p: "from $2,000",
              d: "Your business online in 2-3 weeks, built to convert visitors into customers.",
              inc: ["Custom design — no templates","Up to 6 sections + contact form","Fully responsive on mobile","Basic SEO and Google indexing","Complete domain and hosting setup","2 revision rounds + update guide"],
              note: "Domain (~$10-15/yr) and hosting registered under your name — you always own your site." },
            { t: "Custom Web Application", p: "from $8,000",
              d: "Complete systems: client portals, management platforms, internal tools.",
              inc: ["Discovery, UX design, and full development","Frontend, backend, and database","User authentication and roles","Admin dashboard","Deployment, documentation, and training","60-day post-launch warranty"],
              note: "Exact scope and final price in writing before we start. Infrastructure contracted under your name." },
          ],
        },
        {
          name: "IT Consulting",
          desc: "25+ years of experience: infrastructure, networking, troubleshooting, and strategic guidance.",
          cta: "Book a call",
          items: [
            { t: "Hourly Consulting", p: "from $110/hr",
              d: "For when you need answers from someone who's seen it all.",
              inc: ["Remote sessions (on-site available in Puerto Rico)","Infrastructure, network, and systems diagnosis","Guidance on technology, vendors, and architecture","Written summary after each session","1-hour minimum — no mandatory retainers"],
              note: "" },
          ],
        },
      ],
    },
    process: {
      title: "Simple, clear, no surprises",
      steps: [
        { t: "We talk", d: "A free 20-minute call to understand your situation. No commitment, no tech jargon." },
        { t: "You get a proposal", d: "Written proposal with defined scope, price, and timeline. What's quoted is what you pay." },
        { t: "We build", d: "Visible progress and constant communication. No disappearing for weeks." },
        { t: "We stay with you", d: "Delivery includes training and support. And if you want, we keep optimizing month after month." },
      ],
    },
    about: {
      title: "Decades of experience, today's tools",
      p1: "Monzon Labs is built on 25+ years in technology — from repairing computers and building networks to developing complete applications and systems. That journey brings an advantage few can offer: we understand technology from the cable to the cloud.",
      p2: "Today, we apply that experience to what's next: AI agents and automation that save businesses hours of manual work every week.",
      p3: "We work from Puerto Rico with clients locally and across the U.S., in English or Spanish, with one simple philosophy:",
      motto: "technology should solve problems, not create them.",
      sig: "Danny Monzón · Founder",
    },
    finalCta: {
      title: "Let's talk",
      text: "20 minutes, free, no strings attached. You'll leave the call knowing exactly what your business needs — whether we work together or not.",
      btn: "Book my call",
    },
    contact: {
      title: "Contact",
      name: "Name", email: "Email", phone: "Phone (optional)",
      need: "What do you need?",
      needOpts: ["AI & Automation", "Website", "Custom application", "IT Consulting", "Not sure yet"],
      msg: "Tell us briefly about your situation",
      send: "Send message",
      ok: "Got it! We'll get back to you within 24 business hours.",
      direct: "San Juan, Puerto Rico · Remote service across the U.S.",
    },
    footer: { rights: "All rights reserved", tags: "Automation · Web Development · IT Consulting" },
  },
};

/* ---------------- Nodo dorado (bullet de marca) ---------------- */
const NodeDot = () => (
  <span className="inline-block rounded-full mr-3 flex-shrink-0"
    style={{ width: 8, height: 8, backgroundColor: GOLD, marginTop: 7 }} />
);

/* ---------------- Acordeón de servicio ---------------- */
const ServiceCard = ({ item, more, less }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="ml-card rounded-2xl p-6 md:p-8 flex flex-col" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h4 className="text-lg font-bold" style={{ color: NAVY }}>{item.t}</h4>
        <span className="ml-price text-sm font-bold tracking-wide" style={{ color: GOLD }}>{item.p}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: INKSOFT }}>{item.d}</p>

      <button onClick={() => setOpen(!open)} aria-expanded={open}
        className="mt-4 text-sm font-semibold self-start rounded-full px-4 py-1.5 transition-colors"
        style={{ color: open ? PAPER : NAVY, backgroundColor: open ? NAVY : GOLDTINT }}>
        {open ? less : more} {open ? "▴" : "▾"}
      </button>

      <div className="ml-acc" style={{ maxHeight: open ? 600 : 0 }}>
        <ul className="space-y-2 pt-4">
          {item.inc.map((li, i) => (
            <li key={i} className="flex text-sm leading-relaxed" style={{ color: "#3A4453" }}>
              <NodeDot /><span>{li}</span>
            </li>
          ))}
        </ul>
        {item.note && (
          <p className="mt-4 text-xs italic leading-relaxed" style={{ color: INKSOFT }}>{item.note}</p>
        )}
      </div>
    </div>
  );
};

/* ---------------- Página ---------------- */
export default function MonzonLabsLanding() {
  const [lang, setLang] = useState("es");
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", need: "", msg: "" });
  const t = T[lang];

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const canSend = form.name.trim() && form.email.trim() && form.msg.trim();
  const inputStyle = { backgroundColor: "#FFFFFF", border: "1px solid #DDD9CF", color: NAVY };

  return (
    <div style={{ backgroundColor: PAPER, fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
        html { scroll-behavior: smooth; }

        /* ---- CTA buttons ---- */
        .ml-cta { transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease; }
        .ml-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(13,27,51,0.18); }
        .ml-cta:active { transform: translateY(0); }

        /* ---- Service cards ---- */
        .ml-card {
          border: 1px solid #E7E4DC;
          box-shadow: 0 1px 2px rgba(13,27,51,0.04);
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
        }
        .ml-card:hover {
          transform: translateY(-5px);
          border-color: ${GOLD};
          box-shadow: 0 14px 30px rgba(13,27,51,0.10);
        }
        .ml-card .ml-price { transition: transform .22s ease; display: inline-block; }
        .ml-card:hover .ml-price { transform: scale(1.08); }

        /* ---- Accordion slide ---- */
        .ml-acc { overflow: hidden; transition: max-height .35s ease; }

        /* ---- Nav links: underline animada ---- */
        .ml-nav { position: relative; padding-bottom: 2px; }
        .ml-nav::after {
          content: ""; position: absolute; left: 0; bottom: 0; height: 2px; width: 100%;
          background: ${GOLD}; transform: scaleX(0); transform-origin: left;
          transition: transform .22s ease;
        }
        .ml-nav:hover::after { transform: scaleX(1); }

        /* ---- Logo: pulso del nodo dorado ---- */
        @keyframes ml-pulse {
          0%,100% { r: inherit; opacity: 1; }
          50% { opacity: .55; }
        }
        .ml-logowrap:hover .ml-goldnode { animation: ml-pulse 0.9s ease-in-out infinite; }

        /* ---- Proceso: nodos que se encienden ---- */
        .ml-node { transition: transform .22s ease, background-color .22s ease, box-shadow .22s ease; }
        .ml-step:hover .ml-node {
          transform: scale(1.35);
          background-color: ${GOLD} !important;
          box-shadow: 0 0 0 6px rgba(212,168,83,0.25) !important;
        }
        .ml-step:hover h3 { color: ${GOLD} !important; }
        .ml-step h3 { transition: color .22s ease; }

        /* ---- Reveal on scroll ---- */
        .ml-reveal { opacity: 0; transform: translateY(22px); transition: opacity .6s ease, transform .6s ease; }
        .ml-reveal.ml-visible { opacity: 1; transform: none; }

        /* ---- Focus visible ---- */
        button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
          outline: 2px solid ${GOLD}; outline-offset: 2px;
        }

        /* ---- Reduced motion ---- */
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .ml-reveal { opacity: 1; transform: none; transition: none; }
          .ml-cta, .ml-card, .ml-node, .ml-nav::after, .ml-acc, .ml-price { transition: none !important; }
          .ml-logowrap:hover .ml-goldnode { animation: none; }
        }
      `}</style>

      {/* ---------- NAV ---------- */}
      <header className="sticky top-0 z-50"
        style={{ backgroundColor: "rgba(250,250,248,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid #ECE9E1" }}>
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="ml-logowrap flex items-center gap-2.5 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Mark size={34} />
            <span className="font-extrabold tracking-tight text-lg" style={{ color: NAVY }}>
              MONZON<span className="font-light" style={{ color: GOLD }}> LABS</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold" style={{ color: NAVY }}>
            {[["services", t.nav.services],["process", t.nav.process],["about", t.nav.about],["contact", t.nav.contact]].map(([id, label]) => (
              <button key={id} onClick={() => go(id)} className="ml-nav">{label}</button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="ml-cta text-xs font-bold rounded-full px-3 py-1.5"
              style={{ border: `1.5px solid ${NAVY}`, color: NAVY }}
              aria-label="Cambiar idioma / Switch language">
              {lang === "es" ? "EN" : "ES"}
            </button>
            <button onClick={() => go("contact")}
              className="ml-cta hidden sm:block text-sm font-bold rounded-full px-5 py-2"
              style={{ backgroundColor: NAVY, color: PAPER }}>
              {t.nav.cta}
            </button>
          </div>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden" style={{ backgroundColor: NAVY }}>
        <NodeField />
        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-16 md:pt-28 md:pb-24 pointer-events-none">
          <p className="text-xs md:text-sm font-bold tracking-[0.25em] uppercase mb-5" style={{ color: GOLD }}>
            {t.hero.kicker}
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight" style={{ color: PAPER }}>
            {t.hero.h1a}<br /><span style={{ color: GOLD }}>{t.hero.h1b}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed font-light" style={{ color: "#C9CFD9" }}>
            {t.hero.sub}
          </p>
          <div className="mt-9 flex flex-wrap gap-4 pointer-events-auto">
            <button onClick={() => go("contact")}
              className="ml-cta font-bold rounded-full px-7 py-3.5 text-sm md:text-base"
              style={{ backgroundColor: GOLD, color: NAVY }}>
              {t.hero.cta1}
            </button>
            <button onClick={() => go("services")}
              className="ml-cta font-semibold rounded-full px-7 py-3.5 text-sm md:text-base"
              style={{ border: `1.5px solid ${PAPER}`, color: PAPER }}>
              {t.hero.cta2} ↓
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: NAVY2, borderTop: "1px solid rgba(250,250,248,0.08)", position: "relative" }}>
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-wrap gap-x-10 gap-y-2 text-xs md:text-sm font-medium" style={{ color: "#AEB6C4" }}>
            {t.hero.trust.map((s, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="rounded-full" style={{ width: 6, height: 6, backgroundColor: GOLD }} />
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- SERVICIOS ---------- */}
      <Reveal id="services" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: NAVY }}>
          {t.services.title}
        </h2>
        <p className="mt-3 text-base md:text-lg font-light" style={{ color: INKSOFT }}>{t.services.sub}</p>

        <div className="mt-14 space-y-20">
          {t.services.lines.map((line, li) => (
            <Reveal key={li + lang}>
              <div className="ml-logowrap flex items-center gap-3 mb-2">
                <Mark size={26} />
                <h3 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>{line.name}</h3>
              </div>
              <p className="max-w-2xl text-sm md:text-base leading-relaxed mb-7" style={{ color: INKSOFT }}>
                {line.desc}
              </p>
              <div className={`grid gap-5 ${line.items.length === 3 ? "md:grid-cols-3" : line.items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1 md:max-w-xl"}`}>
                {line.items.map((item, ii) => (
                  <ServiceCard key={ii + lang} item={item} more={t.services.more} less={t.services.less} />
                ))}
              </div>
              <button onClick={() => go("contact")} className="ml-cta mt-6 text-sm font-bold" style={{ color: GOLD }}>
                {line.cta} →
              </button>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* ---------- PROCESO ---------- */}
      <section id="process" style={{ backgroundColor: NAVY }}>
        <Reveal className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-14" style={{ color: PAPER }}>
            {t.process.title}
          </h2>
          <div className="grid md:grid-cols-4 gap-10 relative">
            <div className="hidden md:block absolute left-0 right-0" style={{ top: 13, height: 2, backgroundColor: "rgba(250,250,248,0.15)" }} />
            {t.process.steps.map((s, i) => (
              <div key={i} className="ml-step relative cursor-default">
                <div className="ml-node rounded-full relative z-10"
                  style={{
                    width: 28, height: 28,
                    backgroundColor: i === 3 ? GOLD : PAPER,
                    border: `6px solid ${NAVY}`,
                    boxShadow: `0 0 0 2px ${i === 3 ? GOLD : "rgba(250,250,248,0.4)"}`,
                  }} />
                <h3 className="mt-5 font-bold text-lg" style={{ color: PAPER }}>{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed font-light" style={{ color: "#B7BEC9" }}>{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- SOBRE ---------- */}
      <Reveal id="about" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-3">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: NAVY }}>
              {t.about.title}
            </h2>
            <p className="mt-6 leading-relaxed" style={{ color: "#3A4453" }}>{t.about.p1}</p>
            <p className="mt-4 leading-relaxed" style={{ color: "#3A4453" }}>{t.about.p2}</p>
            <p className="mt-4 leading-relaxed" style={{ color: "#3A4453" }}>
              {t.about.p3} <strong style={{ color: NAVY }}>{t.about.motto}</strong>
            </p>
            <p className="mt-8 font-bold" style={{ color: GOLD }}>— {t.about.sig}</p>
          </div>
          <div className="md:col-span-2 flex justify-center">
            <div className="ml-logowrap rounded-2xl w-full max-w-xs aspect-[4/5] flex items-center justify-center"
              style={{ backgroundColor: GOLDTINT, border: "1px solid #E7E0CE" }}>
              <Mark size={110} />
            </div>
          </div>
        </div>
      </Reveal>

      {/* ---------- CTA FINAL ---------- */}
      <section style={{ backgroundColor: GOLDTINT, borderTop: "1px solid #EDE6D3", borderBottom: "1px solid #EDE6D3" }}>
        <Reveal className="max-w-3xl mx-auto px-5 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: NAVY }}>
            {t.finalCta.title}
          </h2>
          <p className="mt-4 leading-relaxed" style={{ color: "#3A4453" }}>{t.finalCta.text}</p>
          <button onClick={() => go("contact")} className="ml-cta mt-8 font-bold rounded-full px-8 py-3.5"
            style={{ backgroundColor: NAVY, color: PAPER }}>
            {t.finalCta.btn}
          </button>
        </Reveal>
      </section>

      {/* ---------- CONTACTO ---------- */}
      <Reveal id="contact" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: NAVY }}>
              {t.contact.title}
            </h2>
            <p className="mt-5 text-sm leading-relaxed" style={{ color: INKSOFT }}>
              📧 danny@monzonlabs.com<br />📍 {t.contact.direct}
            </p>
            <div className="mt-8 hidden md:block ml-logowrap"><Mark size={64} /></div>
          </div>

          <div className="space-y-4">
            {sent ? (
              <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: GOLDTINT, border: "1px solid #E7E0CE" }}>
                <p className="font-bold text-lg" style={{ color: NAVY }}>✓ {t.contact.ok}</p>
              </div>
            ) : (
              <>
                <input className="w-full rounded-xl px-4 py-3 text-sm" style={inputStyle}
                  placeholder={t.contact.name + " *"} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="w-full rounded-xl px-4 py-3 text-sm" style={inputStyle} type="email"
                  placeholder={t.contact.email + " *"} value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="w-full rounded-xl px-4 py-3 text-sm" style={inputStyle}
                  placeholder={t.contact.phone} value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <select className="w-full rounded-xl px-4 py-3 text-sm"
                  style={{ ...inputStyle, color: form.need ? NAVY : INKSOFT }} value={form.need}
                  onChange={(e) => setForm({ ...form, need: e.target.value })}>
                  <option value="">{t.contact.need}</option>
                  {t.contact.needOpts.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
                <textarea className="w-full rounded-xl px-4 py-3 text-sm min-h-[120px]" style={inputStyle}
                  placeholder={t.contact.msg + " *"} value={form.msg}
                  onChange={(e) => setForm({ ...form, msg: e.target.value })} />
                <button onClick={() => canSend && setSent(true)} disabled={!canSend}
                  className="ml-cta w-full font-bold rounded-full px-6 py-3.5"
                  style={{ backgroundColor: canSend ? NAVY : "#C6CBD4", color: PAPER, cursor: canSend ? "pointer" : "not-allowed" }}>
                  {t.contact.send}
                </button>
              </>
            )}
          </div>
        </div>
      </Reveal>

      {/* ---------- FOOTER ---------- */}
      <footer style={{ backgroundColor: NAVY }}>
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="ml-logowrap flex items-center gap-2.5">
            <Mark size={28} fg={PAPER} />
            <span className="font-extrabold tracking-tight" style={{ color: PAPER }}>
              MONZON<span className="font-light" style={{ color: GOLD }}> LABS</span>
            </span>
          </div>
          <p className="text-xs" style={{ color: "#8C95A5" }}>{t.footer.tags}</p>
          <p className="text-xs" style={{ color: "#8C95A5" }}>© 2026 Monzon Labs · {t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}
