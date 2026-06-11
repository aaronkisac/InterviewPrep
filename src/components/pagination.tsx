import Link from "next/link";

type PaginationLabels = {
  prev: string;
  next: string;
  pageOf: string;
};

/**
 * Server-rendered pagination — plain links that preserve the active filters.
 * No client JS needed; the page is force-dynamic so each navigation re-renders.
 */
export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
  labels,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
  labels: PaginationLabels;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") sp.set(key, value);
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  const linkClass =
    "rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent";
  const disabledClass =
    "rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground/50 cursor-not-allowed";

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex items-center justify-between"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={linkClass}>
          {labels.prev}
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          {labels.prev}
        </span>
      )}

      <span aria-current="page" className="text-xs text-muted-foreground">
        {labels.pageOf}
      </span>

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={linkClass}>
          {labels.next}
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          {labels.next}
        </span>
      )}
    </nav>
  );
}
