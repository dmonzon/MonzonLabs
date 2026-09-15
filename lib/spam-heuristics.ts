/**
 * Heurística de contenido: puntúa qué tan sospechoso luce un envío.
 *
 * Es código puro — sin `next/headers`, sin red, sin estado — para poder
 * ejecutarlo y ajustarlo de forma aislada. `lib/antispam.ts` lo compone con
 * las demás capas (honeypot, timing, captcha, rate limit).
 */

/* --------------------------------- Patrones -------------------------------- */

const URL_SOURCE = /(https?:\/\/|www\.)[^\s<>"']+/.source;
const BBCODE_RE = /\[(url|link|img)[=\]]/i;
const HTML_LINK_RE = /<\s*a\s[^>]*href/i;
/** Alfabetos que no usamos (el sitio es ES/EN). */
const FOREIGN_SCRIPT_RE = /[Ѐ-ӿ؀-ۿ一-鿿぀-ヿ가-힯]/;
/** 6+ consonantes seguidas = tecleo aleatorio. */
const GIBBERISH_RE = /[bcdfghjklmnpqrstvwxyz]{6,}/i;
/** El mismo carácter 5+ veces seguidas. */
const CHAR_RUN_RE = /(.)\1{4,}/;

/** Términos típicos del spam de formularios de contacto. */
const SPAM_TERMS = [
  // SEO / marketing basura
  "seo", "backlink", "link building", "guest post", "domain authority",
  "rank #1", "first page of google", "increase traffic", "web traffic",
  "digital marketing agency", "web design services", "affordable website",
  "mass email", "bulk email", "email list", "b2b leads",
  "xrumer", "gsa search", "seo audit", "off-page", "dofollow",
  // finanzas / cripto
  "crypto", "bitcoin", "ethereum", "forex", "binary option", "trading bot",
  "airdrop", "nft", "web3 growth", "investment opportunity", "loan offer",
  "quick cash", "make money online", "passive income", "earn $",
  // adulto / farma
  "viagra", "cialis", "porn", "escort", "sex dating", "adult content",
  "casino", "betting", "gambling", "slot machine",
  // frases de plantilla
  "dear sir or madam", "dear sir/madam", "unsubscribe", "this is not spam",
  "act now", "limited time offer", "100% free", "no obligation trial",
  "congratulations you have won",
];

/** Dominios desechables o de un solo uso. */
const DISPOSABLE_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "temp-mail.org", "throwawaymail.com", "yopmail.com", "trashmail.com",
  "fakeinbox.com", "sharklasers.com", "getnada.com", "maildrop.cc",
  "dispostable.com", "mytemp.email", "moakt.com", "emailondeck.com",
  "spam4.me", "tempr.email", "grr.la", "mailnesia.com",
];

/** A partir de este puntaje el mensaje se descarta. */
export const SPAM_THRESHOLD = 5;

export interface Submission {
  name: string;
  email: string;
  phone?: string;
  /** Todo el texto libre del formulario, concatenado. */
  body: string;
}

export interface Analysis {
  score: number;
  reasons: string[];
}

export function analyze({ name, email, phone = "", body }: Submission): Analysis {
  const reasons: string[] = [];
  let score = 0;

  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(`${reason} (+${points})`);
  };

  const haystack = `${name} ${email} ${phone} ${body}`;
  const lower = haystack.toLowerCase();

  /* Enlaces: la firma número uno del spam de formularios.
     Un solo enlace puntúa bajo — un cliente legítimo bien puede enlazar su
     propio sitio; dos o más ya es promoción. */
  const urls = body.match(new RegExp(URL_SOURCE, "gi")) ?? [];
  if (urls.length === 1) add(2, "1 enlace en el mensaje");
  else if (urls.length >= 2) add(6, `${urls.length} enlaces en el mensaje`);
  if (BBCODE_RE.test(body) || HTML_LINK_RE.test(body)) {
    add(6, "marcado de enlace (BBCode/HTML)");
  }

  /* Enlaces fuera del cuerpo: nadie pone una URL en su nombre o teléfono. */
  if (hasUrl(name) || hasUrl(phone)) add(6, "enlace en nombre o teléfono");

  /* Alfabeto que no corresponde a un sitio ES/EN. Puntuamos por proporción:
     un carácter suelto puede ser un nombre o un emoji raro, pero un mensaje
     escrito entero en otro alfabeto no va dirigido a nosotros. */
  const foreign = haystack.match(new RegExp(FOREIGN_SCRIPT_RE.source, "g"))?.length ?? 0;
  if (foreign > 0) {
    const wordChars = haystack.replace(/[\s\d\p{P}\p{S}]/gu, "").length || 1;
    const ratio = foreign / wordChars;
    if (ratio > 0.3) add(6, `texto en alfabeto no latino (${Math.round(ratio * 100)}%)`);
    else add(2, "caracteres en alfabeto no latino");
  }

  /* Términos de spam conocidos. */
  const found = SPAM_TERMS.filter((term) => lower.includes(term));
  if (found.length) {
    add(Math.min(found.length * 3, 7), `términos de spam: ${found.slice(0, 4).join(", ")}`);
  }

  /* Correo desechable o malformado. */
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (DISPOSABLE_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) {
    add(5, "correo desechable");
  }
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) add(5, "correo con formato inválido");

  /* Nombre sospechoso. */
  if (/\d{3,}/.test(name)) add(3, "nombre con muchos dígitos");
  if (GIBBERISH_RE.test(name)) add(3, "nombre ilegible");
  if (name.length > 70) add(3, "nombre desproporcionado");

  /* Forma del mensaje. */
  const letters = body.replace(/[^a-záéíóúñü]/gi, "");
  if (letters.length > 20) {
    const upper = body.replace(/[^A-ZÁÉÍÓÚÑÜ]/g, "").length;
    if (upper / letters.length > 0.6) add(2, "mensaje en mayúsculas");
  }
  if (CHAR_RUN_RE.test(body)) add(2, "caracteres repetidos");
  if (body.length > 4000) add(3, "mensaje desproporcionado");

  /* Campos duplicados: relleno automático. */
  if (name && (name === email || name.trim() === body.trim())) add(3, "campos duplicados");

  /* Teléfono con texto — ignorando las marcas de extensión, que son legítimas. */
  const phoneCore = phone.replace(/\b(ext|extension|ext\.|x|tel|cel|movil|móvil|whatsapp|opt)\b/gi, "");
  if (phoneCore && /[a-z]{3,}/i.test(phoneCore)) add(3, "teléfono con texto");

  return { score, reasons };
}

function hasUrl(value: string): boolean {
  return new RegExp(URL_SOURCE, "i").test(value);
}
