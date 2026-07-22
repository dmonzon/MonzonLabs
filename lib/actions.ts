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

  const fromEmail = process.env.RESEND_FROM_EMAIL || "Monzon Labs <danny@monzonlabs.com>";
//  const fromEmail = process.env.RESEND_FROM_EMAIL || "Monzon Labs <onboarding@resend.dev>";
  const toEmail = process.env.CONTACT_TO_EMAIL || 
  "dmonzon@gmail.com";
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

export async function sendQuoteRequest(
  _prevState: ContactFormState | undefined,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || "";
  const notes = (formData.get("notes") as string)?.trim() || "";
  const lang = (formData.get("lang") as string)?.trim() || "es";
  const category = (formData.get("category") as string)?.trim() || "";
  const product = (formData.get("product") as string)?.trim() || "";
  const estimate = (formData.get("estimate") as string)?.trim() || "";
  const summary = (formData.get("summary") as string)?.trim() || "";

  if (!name || !email) {
    return { error: "Falta información requerida" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "Monzon Labs <danny@monzonlabs.com>";
  const toEmail = process.env.CONTACT_TO_EMAIL || "dmonzon@gmail.com";

  const prompt = buildProposalPrompt(lang, {
    name,
    email,
    phone,
    category,
    product,
    estimate,
    summary,
    notes,
  });

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0D1B33;max-width:640px">
      <h2 style="margin:0 0 4px">Nueva cotización desde el sitio</h2>
      <p style="margin:0 0 16px;color:#5C6674;font-size:14px">Idioma del cliente: <strong>${escapeHtml(lang.toUpperCase())}</strong></p>

      <table style="font-size:14px;line-height:1.6;border-collapse:collapse">
        <tr><td style="padding-right:12px;color:#5C6674">Nombre</td><td><strong>${escapeHtml(name)}</strong></td></tr>
        <tr><td style="padding-right:12px;color:#5C6674">Correo</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        ${phone ? `<tr><td style="padding-right:12px;color:#5C6674">Teléfono</td><td>${escapeHtml(phone)}</td></tr>` : ""}
        <tr><td style="padding-right:12px;color:#5C6674">Servicio</td><td>${escapeHtml(category)} › <strong>${escapeHtml(product)}</strong></td></tr>
        <tr><td style="padding-right:12px;color:#5C6674">Estimado</td><td><strong>${escapeHtml(estimate)}</strong></td></tr>
      </table>

      ${summary ? `<p style="margin:16px 0 4px;color:#5C6674;font-size:14px"><strong>Detalle seleccionado</strong></p><pre style="margin:0;font-family:ui-monospace,monospace;font-size:13px;white-space:pre-wrap;color:#0D1B33">${escapeHtml(summary)}</pre>` : ""}
      ${notes ? `<p style="margin:16px 0 4px;color:#5C6674;font-size:14px"><strong>Comentarios del cliente</strong></p><pre style="margin:0;font-family:ui-monospace,monospace;font-size:13px;white-space:pre-wrap;color:#0D1B33">${escapeHtml(notes)}</pre>` : ""}

      <hr style="margin:24px 0;border:none;border-top:1px solid #E7E4DC" />

      <div style="background:#F6EDDA;border:1px solid #E7E0CE;border-radius:12px;padding:16px">
        <p style="margin:0 0 8px;font-weight:700;color:#0D1B33">📋 Genera la propuesta</p>
        <p style="margin:0 0 12px;color:#5C6674;font-size:13px;line-height:1.5">Copia todo el bloque de abajo y pégalo en Claude para generar la propuesta completa, lista para enviar al cliente.</p>
        <pre style="margin:0;padding:14px;background:#0D1B33;color:#FAFAF8;border-radius:8px;font-family:ui-monospace,monospace;font-size:12.5px;line-height:1.55;white-space:pre-wrap;overflow-x:auto">${escapeHtml(prompt)}</pre>
      </div>
    </div>
  `;

  const text = `Nueva cotización — ${name} (${email})\nServicio: ${category} › ${product}\nEstimado: ${estimate}\n\n===== COPIA ESTE BLOQUE EN CLAUDE PARA GENERAR LA PROPUESTA =====\n\n${prompt}\n`;

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `Nueva cotización: ${name} — ${product || category}`,
      html,
      text,
    });

    if (result.error) {
      return { error: "No se pudo enviar la cotización. Intenta de nuevo." };
    }

    return { ok: true };
  } catch (err) {
    console.error("Error enviando cotización:", err);
    return { error: "Error al enviar la cotización." };
  }
}

interface ProposalData {
  name: string;
  email: string;
  phone: string;
  category: string;
  product: string;
  estimate: string;
  summary: string;
  notes: string;
}

/**
 * Arma un prompt autónomo que, pegado en Claude, genera una propuesta
 * comercial completa y lista para enviar al cliente. Se escribe en el
 * idioma del cliente para que la propuesta salga coherente.
 */
function buildProposalPrompt(lang: string, d: ProposalData): string {
  const detail = d.summary
    ? d.summary.split("\n").map((l) => `- ${l}`).join("\n")
    : "- (sin detalle adicional)";

  if (lang === "en") {
    return [
      "You are the commercial writer for Monzon Labs — a technology studio (AI automation, web/mobile development, and IT consulting) with 25+ years of experience, based in San Juan, Puerto Rico, serving clients remotely across the U.S. Voice: professional, warm, plain-spoken, zero jargon. Guiding philosophy: \"technology should solve problems, not create them.\" Contact: danny@monzonlabs.com.",
      "",
      "Write a complete, client-ready proposal in English based on the quote below.",
      "",
      "CLIENT",
      `- Name: ${d.name}`,
      `- Email: ${d.email}`,
      d.phone ? `- Phone: ${d.phone}` : "- Phone: (not provided)",
      "",
      "REQUESTED SERVICE",
      `- Category: ${d.category}`,
      `- Option: ${d.product}`,
      `- Estimate from the site calculator: ${d.estimate}`,
      "",
      "WHAT THE CLIENT SELECTED",
      detail,
      "",
      "CLIENT NOTES",
      d.notes ? d.notes : "(none)",
      "",
      "WRITE THE PROPOSAL WITH THESE SECTIONS:",
      "1. Personalized greeting addressed to the client by name.",
      "2. Our understanding of their need (reflect back what they selected).",
      "3. Scope & deliverables — a concrete bulleted list of what's included.",
      "4. Investment — present the estimate as a range; explain what could move it up or down; note that the final price is confirmed in writing before starting (\"what's quoted is what you pay\"). Clarify that third-party subscriptions/domain/hosting are contracted under the client's name where relevant.",
      "5. Timeline — a realistic estimated timeframe based on the scope.",
      "6. How we work — the 4 steps: we talk → you get a written proposal → we build with visible progress → we stay with you (training + optional monthly support).",
      "7. Next step — invite them to book a free 20-minute call, no commitment.",
      "Close with the Monzon Labs philosophy. Keep it tight and skimmable with clear headings. Do not invent capabilities beyond what was selected.",
    ].join("\n");
  }

  return [
    "Eres el redactor comercial de Monzon Labs — un estudio de tecnología (automatización con IA, desarrollo web/móvil y consultoría IT) con más de 25 años de experiencia, en San Juan, Puerto Rico, con servicio remoto a todo EE.UU. Tono: profesional, cercano, claro y sin jerga técnica. Filosofía: \"la tecnología debe resolver problemas, no crearlos\". Contacto: danny@monzonlabs.com.",
    "",
    "Redacta una propuesta comercial completa, en español, lista para enviar al cliente, a partir de la cotización de abajo.",
    "",
    "CLIENTE",
    `- Nombre: ${d.name}`,
    `- Correo: ${d.email}`,
    d.phone ? `- Teléfono: ${d.phone}` : "- Teléfono: (no provisto)",
    "",
    "SERVICIO SOLICITADO",
    `- Categoría: ${d.category}`,
    `- Opción: ${d.product}`,
    `- Estimado del cotizador del sitio: ${d.estimate}`,
    "",
    "LO QUE SELECCIONÓ EL CLIENTE",
    detail,
    "",
    "COMENTARIOS DEL CLIENTE",
    d.notes ? d.notes : "(ninguno)",
    "",
    "ESCRIBE LA PROPUESTA CON ESTAS SECCIONES:",
    "1. Saludo personalizado dirigido al cliente por su nombre.",
    "2. Entendimiento de su necesidad (refleja lo que seleccionó).",
    "3. Alcance y entregables — una lista concreta de lo que incluye.",
    "4. Inversión — presenta el estimado como rango; explica qué lo puede subir o bajar; aclara que el precio final se confirma por escrito antes de comenzar (\"lo que se cotiza es lo que se paga\"). Indica que las suscripciones de terceros / dominio / hosting se contratan a nombre del cliente cuando aplique.",
    "5. Tiempo estimado — un plazo realista según el alcance.",
    "6. Cómo trabajamos — los 4 pasos: conversamos → propuesta por escrito → construimos con avances visibles → te acompañamos (entrenamiento + soporte mensual opcional).",
    "7. Próximo paso — invítalo a agendar una llamada gratis de 20 minutos, sin compromiso.",
    "Cierra con la filosofía de Monzon Labs. Mantenla concisa y fácil de escanear, con encabezados claros. No inventes capacidades más allá de lo seleccionado.",
  ].join("\n");
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
