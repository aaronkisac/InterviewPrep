import type { Metadata } from "next";
import { Libre_Baskerville, Inter } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { COLOR_THEME_STORAGE_KEY, DEFAULT_COLOR_THEME } from "@/lib/themes";
import { LangProvider } from "@/contexts/lang-context";
import { getLang } from "@/lib/lang";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "frontend interview questions",
    "react interview questions",
    "typescript interview questions",
    "next.js interview questions",
    "javascript interview prep",
    "mock interview",
    "mülakat soruları",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_GB",
    alternateLocale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html
      lang={lang === "tr" ? "tr" : "en"}
      className={`h-full antialiased ${libreBaskerville.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply saved color theme before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem(${JSON.stringify(COLOR_THEME_STORAGE_KEY)});document.documentElement.setAttribute('data-theme',t||${JSON.stringify(DEFAULT_COLOR_THEME)})})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              description: SITE_DESCRIPTION,
              url: getSiteUrl(),
              inLanguage: ["en", "tr"],
            }),
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          {lang === "tr" ? "İçeriğe atla" : "Skip to content"}
        </a>
        <ThemeProvider>
          <LangProvider initial={lang}>
            <Navbar />
            <div id="main-content" className="pt-[37px] flex flex-col flex-1">
              {children}
            </div>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
