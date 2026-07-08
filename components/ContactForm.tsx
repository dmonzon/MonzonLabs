"use client";

import { useActionState, useRef } from "react";
import { sendContactMessage } from "@/lib/actions";
import { NAVY, GOLD, GOLDTINT, PAPER, INKSOFT } from "@/lib/theme";
import { Translation } from "@/lib/i18n";

interface ContactFormProps {
  t: Translation;
}

export default function ContactForm({ t }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(sendContactMessage, {});
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    formAction(formData);
    if (state.ok) {
      formRef.current?.reset();
    }
  };

  const inputStyle = { backgroundColor: "#FFFFFF", border: "1px solid #DDD9CF", color: NAVY };

  return (
    <div className="space-y-4">
      {state.ok ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: GOLDTINT, border: "1px solid #E7E0CE" }}
        >
          <p className="font-bold text-lg" style={{ color: NAVY }}>
            ✓ {t.contact.ok}
          </p>
        </div>
      ) : state.error ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            backgroundColor: "#FFE8E8",
            border: "1px solid #FFD4D4",
          }}
        >
          <p className="font-bold text-lg" style={{ color: "#C41E1E" }}>
            ✗ {state.error}
          </p>
        </div>
      ) : null}

      {!state.ok && (
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={inputStyle}
            type="text"
            name="name"
            placeholder={t.contact.name + " *"}
            required
          />
          <input
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={inputStyle}
            type="email"
            name="email"
            placeholder={t.contact.email + " *"}
            required
          />
          <input
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={inputStyle}
            type="tel"
            name="phone"
            placeholder={t.contact.phone}
          />
          <select
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{ ...inputStyle, color: "inherit" }}
            name="need"
          >
            <option value="">{t.contact.need}</option>
            {t.contact.needOpts.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <textarea
            className="w-full rounded-xl px-4 py-3 text-sm min-h-[120px]"
            style={inputStyle}
            name="msg"
            placeholder={t.contact.msg + " *"}
            required
          />
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
            {isPending ? "Enviando..." : t.contact.send}
          </button>
        </form>
      )}
    </div>
  );
}
