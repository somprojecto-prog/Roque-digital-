import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import { buildOrganizationJsonLd } from "@/lib/json-ld";
import { getCategories, getSiteSettings } from "@/lib/queries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientProviders from "@/components/ClientProviders";
import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Tecnologia, moda e beleza`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Tecnologia, moda e beleza`,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Tecnologia, moda e beleza`,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

// Header e Footer vivem aqui (não em cada página) porque aparecem em
// toda a Loja — categorias e definições do site só são pedidas ao
// Supabase uma vez por pedido, graças ao cache() em lib/queries.ts.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = buildOrganizationJsonLd();
  const [categories, siteSettings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <html lang="pt" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="min-h-screen bg-cacau-darker font-body text-creme antialiased">
        <ClientProviders>
          <Header categories={categories} />
          {children}
          <Footer siteSettings={siteSettings} />
        </ClientProviders>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </body>
    </html>
  );
}
