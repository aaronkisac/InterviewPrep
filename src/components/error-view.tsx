"use client";

import Link from "next/link";

import { useLang } from "@/contexts/lang-context";

const STRINGS = {
  en: {
    label: "Something went wrong",
    body: "An unexpected error occurred. You can try again, or head back to the homepage.",
    retry: "Try again",
    home: "Go to homepage",
    code: "Error code",
  },
  tr: {
    label: "Bir şeyler ters gitti",
    body: "Beklenmeyen bir hata oluştu. Tekrar deneyebilir veya ana sayfaya dönebilirsin.",
    retry: "Tekrar dene",
    home: "Ana sayfaya dön",
    code: "Hata kodu",
  },
} as const;

export function ErrorView({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useLang();
  const t = STRINGS[lang] ?? STRINGS.en;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
      <p className="text-sm font-medium text-muted-foreground">500</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t.label}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {t.code}: <code>{error.digest}</code>
        </p>
      ) : null}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {t.retry}
        </button>
        <Link
          href="/"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          {t.home}
        </Link>
      </div>
    </main>
  );
}
