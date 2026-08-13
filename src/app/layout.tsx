import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { site } from "@/lib/site";
import { themeBootstrapScript } from "@/lib/theme";
import { InlineScript } from "@/components/theme/InlineScript";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingDock } from "@/components/layout/FloatingDock";
import { BackgroundProvider } from "@/components/webgl/BackgroundProvider";
import { ShaderBackground } from "@/components/webgl/ShaderBackground";
import { SceneSwitcher } from "@/components/webgl/SceneSwitcher";

/* Three voices, one per job — the mix the references all share:
   an editorial serif at LIGHT weight for display (Arva), a neutral sans for
   everything functional, and a mono reserved strictly for machine-readable
   data: design numbers, dimensions, counts (Ameba). */
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Wall King — House of Wallpaper | India's Largest Wallpaper Importer",
    template: "%s · Wall King",
  },
  description: site.description,
  keywords: [
    "wallpaper Hyderabad",
    "imported wallpaper India",
    "wallpaper dealer",
    "wall murals",
    "designer wallpaper",
    "commercial wallcoverings",
    "Wall King",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site.url,
    siteName: site.name,
    title: "Wall King — House of Wallpaper",
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2e8" },
    { media: "(prefers-color-scheme: dark)", color: "#16181d" },
  ],
};

const organisationJsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: site.name,
  description: site.description,
  url: site.url,
  email: site.email,
  foundingDate: "1984",
  areaServed: "IN",
  address: {
    "@type": "PostalAddress",
    streetAddress: "9 & 10 Unity House, Jagdish Market, Abids",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    postalCode: "500002",
    addressCountry: "IN",
  },
};

import { RefreshRedirect } from "@/components/layout/RefreshRedirect";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${sourceSerif.variable} ${manrope.variable} ${plexMono.variable} h-full`}
    >
      <head>
        {/* Resolves the theme and arms scroll reveals before first paint. */}
        <InlineScript html={themeBootstrapScript} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organisationJsonLd),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <RefreshRedirect />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <BackgroundProvider>
          {/* Ambient base layer — sits under every section on every page. */}
          <ShaderBackground />
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <FloatingDock />
          <SceneSwitcher />
        </BackgroundProvider>
      </body>
    </html>
  );
}
