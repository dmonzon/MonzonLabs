import type { Metadata } from "next";
import PrivacyClient from "@/components/PrivacyClient";

export const metadata: Metadata = {
  title: "Política de Privacidad — Monzon Labs",
  description: "Política de privacidad de Monzon Labs. Cómo recopilamos, usamos y protegemos tu información.",
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
