import Link from "next/link";

import { auth, signOut } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth().catch(() => null);
  const user = session?.user;

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 pt-6">
        <Link href="/" className="text-sm font-medium">
          Interview Prep
        </Link>
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Dashboard
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/signin"
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            Sign in
          </Link>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <section className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Interview Prep
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            React · TypeScript · Next.js
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Structured Q&amp;A, term glossary, and mock interview sessions.
            Sign in to add your own questions and suggest community ones.
          </p>
        </section>

        <nav aria-label="Primary" className="flex flex-wrap gap-3">
          <Link
            href="/questions"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Browse questions
          </Link>
          <Link
            href="/mock"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Start mock interview
          </Link>
          <Link
            href="/glossary"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Glossary
          </Link>
        </nav>

        <footer className="pt-8 text-xs text-muted-foreground">
          Question bank, glossary, and React mock interviews are live.
        </footer>
      </main>
    </div>
  );
}
