import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Monzon Labs",
  description: "Automatización con IA, desarrollo web y consultoría IT. 25+ años de experiencia en tecnología.",
  metadataBase: new URL("https://www.monzonlabs.com"),
  openGraph: {
    title: "Monzon Labs",
    description: "Tecnología que trabaja por tu negocio.",
    images: ["/og-image-es.png"],
    locale: "es_PR",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon-180.png",
    x: { card: "summary_large_image", images: ["/og-image-es.png"] },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
