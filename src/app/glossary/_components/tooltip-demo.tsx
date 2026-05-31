import { TermTooltip } from "@/components/term-tooltip";
import { getRelatedTerms } from "@/lib/terms";
import { i18nGlossary } from "@/lib/i18n";
import type { Language } from "@/lib/supabase/types";

/**
 * Live demo strip at the top of /glossary. Pre-fetches a few terms server-side
 * so the TermTooltip popovers don't make a network call on hover.
 */
export async function TooltipDemo({ lang }: { lang: Language }) {
  const i18n = i18nGlossary[lang];
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
        {i18n.tooltipDemoLabel}
      </p>
      {lang === "tr" ? (
        <p>
          React performans sorunlarının çoğu,{" "}
          <TermTooltip slug={recon.slug} tooltip={recon.tooltip}>
            reconciliation
          </TermTooltip>
          {"'"}un neyi mount, update veya unmount edeceğini nasıl belirlediğiyle ilgilidir. App
          Router{"'"}da, yaprakları mümkün olduğunca{" "}
          <TermTooltip slug={server.slug} tooltip={server.tooltip}>
            Server Component
          </TermTooltip>{" "}
          olarak tutarak istemci JS{"'"}ini azaltırsın. Tip tarafında ise{" "}
          <TermTooltip slug={union.slug} tooltip={union.tooltip}>
            discriminated union
          </TermTooltip>
          , derleyicinin zorlayabileceği kapsamlı kontroller sağlar.
        </p>
      ) : (
        <p>
          Most React performance bugs come back to how{" "}
          <TermTooltip slug={recon.slug} tooltip={recon.tooltip}>
            reconciliation
          </TermTooltip>{" "}
          decides what to mount, update, or unmount. In App Router, you cut client JS by keeping
          leaves as a{" "}
          <TermTooltip slug={server.slug} tooltip={server.tooltip}>
            Server Component
          </TermTooltip>{" "}
          whenever possible. And on the type side, a{" "}
          <TermTooltip slug={union.slug} tooltip={union.tooltip}>
            discriminated union
          </TermTooltip>{" "}
          gives you exhaustive checks the compiler can enforce.
        </p>
      )}
    </div>
  );
}
