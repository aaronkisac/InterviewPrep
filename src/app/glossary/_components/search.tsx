"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function GlossarySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") ?? "";

  function updateQuery(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`/glossary?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <input
      type="search"
      placeholder="Search terms…"
      defaultValue={currentQuery}
      onChange={(e) => updateQuery(e.currentTarget.value)}
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
    />
  );
}
