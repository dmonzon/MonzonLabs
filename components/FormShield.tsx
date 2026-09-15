"use client";

import { useEffect, useRef, useState } from "react";
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/form-fields";

/**
 * Bloque anti-spam compartido por los formularios del sitio. Se monta dentro
 * del `<form>` y aporta tres campos:
 *
 *   - honeypot: invisible para humanos, los bots lo llenan.
 *   - timestamp: sólo lo escribe JavaScript en el navegador, y permite medir
 *     cuánto tardó el llenado.
 *   - `cf-turnstile-response`: el token del captcha, que Turnstile inyecta
 *     solo dentro del contenedor cuando el widget se renderiza.
 *
 * Si no hay `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, el captcha simplemente no se
 * renderiza y las otras capas siguen funcionando.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      language?: string;
      size?: "normal" | "flexible" | "compact";
      action?: string;
    }
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Carga el script de Cloudflare una sola vez por sesión de navegador. */
let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null; // permite reintentar en el próximo montaje
      reject(new Error("No se pudo cargar Turnstile"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

interface FormShieldProps {
  /** Idioma del widget; "auto" deja que Cloudflare lo detecte. */
  lang?: string;
  /** Identifica el formulario en las analíticas de Cloudflare. */
  action?: string;
}

export default function FormShield({ lang = "auto", action }: FormShieldProps) {
  const [loadedAt, setLoadedAt] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);

  // El timestamp se escribe en el cliente: un POST directo al server action
  // sin pasar por el navegador no lo tendrá.
  useEffect(() => {
    setLoadedAt(String(Date.now()));
  }, []);

  useEffect(() => {
    if (!SITE_KEY) return;

    let widgetId: string | undefined;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !widgetRef.current || !window.turnstile) return;
        widgetId = window.turnstile.render(widgetRef.current, {
          sitekey: SITE_KEY,
          theme: "light",
          language: lang,
          size: "flexible",
          action,
        });
      })
      .catch((err) => console.error("[FormShield]", err));

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // El widget ya pudo haber sido removido junto con su nodo del DOM.
        }
      }
    };
  }, [lang, action]);

  return (
    <>
      {/* Honeypot: fuera de la vista y del orden de tabulación, pero presente
          en el DOM para que los bots que llenan todo caigan en él. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label htmlFor={HONEYPOT_FIELD}>Deja este campo vacío</label>
        <input
          id={HONEYPOT_FIELD}
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <input type="hidden" name={TIMESTAMP_FIELD} value={loadedAt} readOnly />

      {SITE_KEY && <div ref={widgetRef} className="min-h-[65px]" />}
    </>
  );
}
