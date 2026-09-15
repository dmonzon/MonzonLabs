/**
 * Defensa anti-spam para los formularios del sitio.
 *
 * Cuatro capas independientes:
 *   1. Trampas de bot  — honeypot + tiempo mínimo de llenado (gratis, atrapa bots tontos).
 *   2. Captcha         — Cloudflare Turnstile (si hay llaves configuradas).
 *   3. Rate limit      — tope de envíos por IP.
 *   4. Heurística      — puntaje por patrones sospechosos en el contenido.
 *
 * Cuando algo se marca como spam NO devolvemos error: respondemos "ok" para que
 * el bot crea que funcionó y no reintente ni mute su payload. El correo
 * simplemente nunca se envía. La única excepción es el captcha fallido, donde
 * sí conviene avisarle a la persona que reintente.
 */

import { headers } from "next/headers";
import {
  HONEYPOT_FIELD,
  TIMESTAMP_FIELD,
  TURNSTILE_FIELD,
} from "./form-fields";
import { analyze, SPAM_THRESHOLD, type Submission } from "./spam-heuristics";

/** Un humano no llena y envía un formulario en menos de esto. */
const MIN_FILL_MS = 3_000;

/** Formulario abierto por más de 6 horas: pestaña vieja o replay. */
const MAX_FILL_MS = 6 * 60 * 60 * 1000;

/* ------------------------------ Rate limiting ------------------------------ */

type Hit = { count: number; firstAt: number };
const hits = new Map<string, Hit>();

const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const RATE_MAX = 3; // envíos por IP en esa ventana

/**
 * Límite por IP en memoria. En serverless el proceso se recicla, así que no es
 * una garantía — es un freno barato contra ráfagas desde la misma fuente.
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Limpieza oportunista para que el Map no crezca sin control.
  if (hits.size > 500) {
    for (const [key, hit] of hits) {
      if (now - hit.firstAt > RATE_WINDOW_MS) hits.delete(key);
    }
  }

  const hit = hits.get(ip);
  if (!hit || now - hit.firstAt > RATE_WINDOW_MS) {
    hits.set(ip, { count: 1, firstAt: now });
    return false;
  }

  hit.count += 1;
  return hit.count > RATE_MAX;
}

/* --------------------------------- Turnstile -------------------------------- */

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifica el token de Turnstile contra Cloudflare.
 * Si no hay `TURNSTILE_SECRET_KEY` configurada, el captcha queda desactivado y
 * las demás capas siguen protegiendo el formulario.
 */
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  if (!token) return false;

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) {
      console.warn("[antispam] Turnstile rechazó el token:", data["error-codes"]);
    }
    return data.success === true;
  } catch (err) {
    // Si Cloudflare no responde, no bloqueamos clientes legítimos: dejamos que
    // las capas heurísticas decidan.
    console.error("[antispam] Error verificando Turnstile:", err);
    return true;
  }
}

/* ------------------------------- Punto de entrada --------------------------- */

export type GuardResult =
  | { action: "allow" }
  /** Descartar en silencio: respondemos ok pero no enviamos correo. */
  | { action: "drop"; reason: string }
  /** Mostrar error al usuario (captcha no resuelto). */
  | { action: "reject"; reason: "captcha" };

/**
 * Corre todas las capas sobre un envío de formulario.
 * `allowedSelectValues` permite validar campos de selección contra sus opciones
 * reales — los bots suelen mandar valores que no existen en el HTML.
 */
export async function guardSubmission(
  formData: FormData,
  submission: Submission,
  allowedSelectValues?: Record<string, readonly string[]>
): Promise<GuardResult> {
  /* Capa 1 — trampas de bot. */
  const honeypot = (formData.get(HONEYPOT_FIELD) as string | null)?.trim();
  if (honeypot) return { action: "drop", reason: "honeypot" };

  const loadedAt = Number(formData.get(TIMESTAMP_FIELD));
  if (Number.isFinite(loadedAt) && loadedAt > 0) {
    const elapsed = Date.now() - loadedAt;
    if (elapsed < MIN_FILL_MS) {
      return { action: "drop", reason: `enviado en ${elapsed}ms` };
    }
    if (elapsed > MAX_FILL_MS) {
      return { action: "drop", reason: "formulario expirado" };
    }
  } else {
    // El campo lo pone JavaScript en el cliente; sin él, no hubo navegador real.
    return { action: "drop", reason: "sin timestamp" };
  }

  /* Valores de selección fuera del catálogo. */
  if (allowedSelectValues) {
    for (const [field, allowed] of Object.entries(allowedSelectValues)) {
      const value = (formData.get(field) as string | null)?.trim();
      if (value && !allowed.includes(value)) {
        return { action: "drop", reason: `valor inválido en "${field}"` };
      }
    }
  }

  const ip = await clientIp();

  /* Capa 2 — captcha (antes de la heurística: es la señal más fuerte). */
  const token = (formData.get(TURNSTILE_FIELD) as string | null) ?? "";
  const captchaOk = await verifyTurnstile(token, ip);
  if (!captchaOk) return { action: "reject", reason: "captcha" };

  /* Capa 3 — límite por IP. */
  if (isRateLimited(ip)) {
    return { action: "drop", reason: `rate limit (${ip})` };
  }

  /* Capa 4 — heurística de contenido. */
  const { score, reasons } = analyze(submission);
  if (score >= SPAM_THRESHOLD) {
    return { action: "drop", reason: `puntaje ${score}: ${reasons.join("; ")}` };
  }

  return { action: "allow" };
}

/** IP del cliente según los headers del proxy (Vercel/Cloudflare). */
async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
