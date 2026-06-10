"use client";

import { useEffect } from "react";

import { ErrorView } from "@/components/error-view";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in the browser console / monitoring — server already logs it.
    console.error(error);
  }, [error]);

  return <ErrorView error={error} reset={reset} />;
}
