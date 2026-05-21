import { TermTooltip } from "@/components/term-tooltip";
import { getRelatedTerms } from "@/lib/terms";

/**
 * Live demo strip at the top of /glossary. Pre-fetches a few terms server-side
 * so the TermTooltip popovers don't make a network call on hover.
 */
export async function TooltipDemo() {
  const terms = await getRelatedTerms([
    "reconciliation",
    "server-component",
    "discriminated-union",
  ]);
  const bySlug = Object.fromEntries(terms.map((t) => [t.slug, t]));

  const recon = bySlug["reconciliation"];
  const server = bySlug["server-component"];
  const union = bySlug["discriminated-union"];

  if (!recon || !server || !union) return null;

  return (
    <div className="mb-8 rounded-lg border border-dashed border-border bg-card p-4 text-sm leading-relaxed">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Tooltip demo · hover or focus the underlined words
      </p>
      <p>
        Most React performance bugs come back to how{" "}
        <TermTooltip slug={recon.slug} tooltip={recon.tooltip}>
          reconciliation
        </TermTooltip>{" "}
        decides what to mount, update, or unmount. In App Router, you cut client
        JS by keeping leaves as a{" "}
        <TermTooltip slug={server.slug} tooltip={server.tooltip}>
          Server Component
        </TermTooltip>{" "}
        whenever possible. And on the type side, a{" "}
        <TermTooltip slug={union.slug} tooltip={union.tooltip}>
          discriminated union
        </TermTooltip>{" "}
        gives you exhaustive checks the compiler can enforce.
      </p>
    </div>
  );
}
