/**
 * Nombres de los campos anti-spam, compartidos entre el cliente (FormShield,
 * que los emite) y el servidor (antispam, que los lee).
 *
 * Viven en su propio módulo porque `lib/antispam.ts` importa `next/headers`,
 * que no puede entrar al bundle del navegador.
 */

/** Campo trampa: invisible para humanos, irresistible para bots. */
export const HONEYPOT_FIELD = "company_website";

/** Campo con el timestamp de montado del formulario. */
export const TIMESTAMP_FIELD = "form_loaded_at";

/** Nombre del campo del token de Turnstile (lo define Cloudflare). */
export const TURNSTILE_FIELD = "cf-turnstile-response";
