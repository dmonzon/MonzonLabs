"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormState {
  ok?: boolean;
  error?: string;
}

export async function sendContactMessage(
  _prevState: ContactFormState | undefined,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || "";
  const need = (formData.get("need") as string)?.trim() || "";
  const msg = (formData.get("msg") as string)?.trim();

  if (!name || !email || !msg) {
    return { error: "Falta información requerida" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "Monzon Labs <onboarding@resend.dev>";
  const toEmail = process.env.CONTACT_TO_EMAIL || "dmonzon@gmail.com";
  //"danny@monzonlabs.com";

  const html = `
    <h2>Nuevo mensaje de contacto</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
    <p><strong>Correo:</strong> ${escapeHtml(email)}</p>
    ${phone ? `<p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>` : ""}
    ${need ? `<p><strong>Necesidad:</strong> ${escapeHtml(need)}</p>` : ""}
    <p><strong>Mensaje:</strong></p>
    <pre>${escapeHtml(msg)}</pre>
  `;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `Nuevo contacto: ${name}`,
      html,
    });

    if (result.error) {
      return { error: "No se pudo enviar el mensaje. Intenta de nuevo." };
    }

    return { ok: true };
  } catch (err) {
    console.error("Error enviando correo:", err);
    return { error: "Error al enviar el mensaje." };
  }
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}
