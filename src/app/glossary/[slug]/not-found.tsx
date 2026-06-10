import Link from "next/link";

export default function TermNotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Term not found
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That slug doesn&apos;t match any glossary entry.
      </p>
      <Link
        href="/glossary"
        className="mt-6 inline-block rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Back to glossary
      </Link>
    </main>
  );
}
