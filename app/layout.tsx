import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nexo Inmobiliario",
    template: "%s · Nexo Inmobiliario",
  },
  description: "Gestión de propiedades, contratos, pagos y clientes para inmobiliarias de Mendoza.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Nexo Inmobiliario",
    description: "Toda tu inmobiliaria, en un solo lugar.",
    locale: "es_AR",
    type: "website",
    images: [{ url: "/og.png", width: 1792, height: 1024, alt: "Nexo Inmobiliario - toda tu inmobiliaria, en un solo lugar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexo Inmobiliario",
    description: "Toda tu inmobiliaria, en un solo lugar.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
