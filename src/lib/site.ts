export const SITE_NAME = "Interview Prep";

export const SITE_DESCRIPTION =
  "Frontend interview preparation — 600+ questions across React, TypeScript, Next.js and 12 more topics, with a glossary, mock sessions and spaced-repetition review. English and Turkish.";

/**
 * Canonical site origin, no trailing slash.
 * Set NEXT_PUBLIC_SITE_URL in production (falls back to NEXTAUTH_URL, then localhost).
 * Tolerates scheme-less values like "example.vercel.app" — prepends https://.
 */
export function getSiteUrl(): string {
  const raw = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    ""
  )
    .trim()
    .replace(/\/+$/, "");

  if (!raw) return "http://localhost:3000";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}
