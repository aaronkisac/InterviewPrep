export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="rounded-lg border border-border divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-muted mx-4 my-2 rounded" />
          ))}
        </div>
      </div>
    </main>
  );
}
