import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/navbar";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Interview Prep",
    template: "%s · Interview Prep",
  },
  description:
    "Personal interview prep across React, TypeScript, and Next.js — Q&A, glossary, mock sessions.",
  openGraph: {
    siteName: "Interview Prep",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full antialiased ${libreBaskerville.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
