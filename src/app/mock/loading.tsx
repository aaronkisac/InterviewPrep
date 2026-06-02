export default function MockLoading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="mt-8 h-10 w-32 animate-pulse rounded-md bg-muted" />
    </main>
  );
}
