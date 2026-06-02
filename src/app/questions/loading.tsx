export default function QuestionsLoading() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="mb-4 h-10 w-full animate-pulse rounded-md bg-muted" />
      <div className="rounded-lg border border-border">
        <div className="flex gap-2 border-b border-border px-4 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-20 animate-pulse rounded bg-muted" />
          ))}
        </div>
        <div className="space-y-1.5 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}
