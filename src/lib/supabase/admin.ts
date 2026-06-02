import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { requireEnv } from "@/lib/env";

/**
 * Service-role Supabase client. Bypasses RLS — use only on the server for
 * trusted operations (seed scripts, admin actions, NextAuth adapter writes).
 *
 * Module-level singleton: the client is stateless (no session, no cookies),
 * so it is safe to reuse across requests. This avoids re-constructing the
 * client on every server action call.
 *
 * Never import this from client components.
 */
let _adminClient: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (_adminClient) return _adminClient;

  _adminClient = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  return _adminClient;
}
