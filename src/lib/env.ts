/**
 * Tiny runtime env reader — fails loudly instead of returning undefined.
 * Centralised here so missing config surfaces at the call site, not deep
 * inside the Supabase or NextAuth client.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in .env.local (see .env.example).`,
    );
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}
