"use client";

import { createContext, useContext } from "react";
import type { GlossaryTerm } from "@/lib/glossary-match";

const TermsContext = createContext<GlossaryTerm[]>([]);

export function TermsProvider({
  terms,
  children,
}: {
  terms: GlossaryTerm[];
  children: React.ReactNode;
}) {
  return <TermsContext.Provider value={terms}>{children}</TermsContext.Provider>;
}

export function useTerms(): GlossaryTerm[] {
  return useContext(TermsContext);
}
