import Link from "next/link";

import { getLang } from "@/lib/lang";

const STRINGS = {
  en: {
    title: "Page not found",
    body: "The page you're looking for doesn't exist or has been moved.",
    home: "Go to homepage",
  },
  tr: {
    title: "Sayfa bulunamadı",
    body: "Aradığın sayfa mevcut değil ya da taşınmış.",
    home: "Ana sayfaya dön",
  },
} as const;

export default async function NotFound() {
  const lang = await getLang();
  const t = STRINGS[lang] ?? STRINGS.en;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        {t.home}
      </Link>
    </main>
  );
}
