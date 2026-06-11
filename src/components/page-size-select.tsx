"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

// Keep in sync with PAGE_SIZES / DEFAULT_PAGE_SIZE in @/lib/questions —
// that module is server-only (pulls in the admin Supabase client), so a
// client component cannot import from it.
const SIZES = [10, 25, 50] as const;
const DEFAULT_SIZE = 25;

export function PageSizeSelect({
  value,
  label,
  basePath,
}: {
  value: number;
  label: string;
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(raw: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // size change re-windows the list — back to page 1
    if (Number(raw) === DEFAULT_SIZE) {
      params.delete("per"); // keep URLs clean at the default
    } else {
      params.set("per", raw);
    }
    startTransition(() => {
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <label
      className={
        "flex items-center gap-1.5 text-xs text-muted-foreground" +
        (isPending ? " opacity-70" : "")
      }
    >
      {label}
      <select
        value={value}
        onChange={(e) => update(e.currentTarget.value)}
        className="h-7 rounded-md border border-input bg-background px-1.5 text-xs outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
      >
        {SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}
