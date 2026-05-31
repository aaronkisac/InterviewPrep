"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSystemTopic } from "@/lib/actions/admin-topics";
import { i18nAdmin } from "@/lib/i18n";
import type { Language } from "@/lib/supabase/types";

export function NewTopicForm({ lang = "en" }: { lang?: Language }) {
  const i18n = i18nAdmin[lang];
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) {
      setSlug(value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createSystemTopic(name, slug);
      if (!result.ok) { setError(result.error); return; }
      setName(""); setSlug(""); setSlugEdited(false);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-card p-4 space-y-3">
      <p className="text-sm font-medium">{i18n.addNewTopic}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{i18n.displayName}</label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={i18n.namePlaceholder}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{i18n.slugLabel}</label>
          <input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
            placeholder={i18n.slugPlaceholder}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 font-mono text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={isPending || !name.trim() || !slug.trim()}
        className="rounded-md bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-80 disabled:opacity-40 transition-opacity"
      >
{isPending ? i18n.creating : i18n.createTopic}
      </button>
    </form>
  );
}
