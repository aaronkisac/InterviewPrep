import { getMockReadyMeta } from "@/lib/mock";

import { MockConfig } from "./_components/mock-config";

export const dynamic = "force-dynamic";

export default async function MockPage() {
  const meta = await getMockReadyMeta();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <header className="mb-4">
        <p className="text-sm font-medium text-muted-foreground">
          Mock interview
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Configure your session
        </h1>
      </header>

      <p className="mb-6 text-sm text-muted-foreground">
        Pick your topics and difficulty, choose a length, and answer one
        multiple-choice question at a time. You get a score at the end.
      </p>

      {meta.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No mock questions are available yet. Run <code>pnpm seed</code> to
          load the option data.
        </p>
      ) : (
        <MockConfig meta={meta} />
      )}
    </main>
  );
}
