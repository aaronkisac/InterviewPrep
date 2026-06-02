import type { Metadata } from "next";
import { Libre_Baskerville, Inter } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { COLOR_THEME_STORAGE_KEY, DEFAULT_COLOR_THEME } from "@/lib/themes";
import { LangProvider } from "@/contexts/lang-context";
import { getLang } from "@/lib/lang";

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
  title: "Interview Prep",
  description:
    "Personal interview prep across React, TypeScript, and Next.js — Q&A, glossary, mock sessions.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html
      lang="en"
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
        <ThemeProvider>
          <LangProvider initial={lang}>
            <Navbar />
            <div className="pt-[37px] flex flex-col flex-1">
              {children}
            </div>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
