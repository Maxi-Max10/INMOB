import type { Metadata } from "next";
import "./globals.css";

const assetBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://nexo-inmobiliario-mendoza.maxmax011.chatgpt.site");
const siteOrigin = new URL(siteUrl).origin;

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "POLO Inmobiliario",
    template: "%s · POLO Inmobiliario",
  },
  description: "Gestión de propiedades, contratos, pagos y clientes para inmobiliarias de Mendoza.",
  icons: {
    icon: `${assetBasePath}/favicon.svg`,
    shortcut: `${assetBasePath}/favicon.svg`,
  },
  openGraph: {
    title: "POLO Inmobiliario",
    description: "Toda tu inmobiliaria, en un solo lugar.",
    locale: "es_AR",
    type: "website",
    images: [{ url: `${assetBasePath}/og.png`, width: 1672, height: 941, alt: "POLO Inmobiliario - toda tu inmobiliaria, en un solo lugar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "POLO Inmobiliario",
    description: "Toda tu inmobiliaria, en un solo lugar.",
    images: [`${assetBasePath}/og.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
