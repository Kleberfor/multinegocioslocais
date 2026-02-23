import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MultiNegócios Locais | Análise de Presença Digital",
  description:
    "Descubra como está a presença digital do seu negócio. Análise gratuita do Google Business Profile com score de 0 a 100 e recomendações personalizadas.",
  keywords: [
    "presença digital",
    "google meu negócio",
    "google business profile",
    "marketing digital",
    "negócios locais",
    "SEO local",
  ],
  authors: [{ name: "MultiNegócios Locais" }],
  openGraph: {
    title: "MultiNegócios Locais | Análise de Presença Digital",
    description:
      "Análise gratuita do seu Google Business Profile. Descubra seu score e oportunidades de melhoria.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
