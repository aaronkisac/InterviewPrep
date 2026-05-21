import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireEnv } from "@/lib/env";

/**
 * Service-role Supabase client. Bypasses RLS — use only on the server for
 * trusted operations (seed scripts, admin actions, NextAuth adapter writes).
 *
 * Never import this from client components.
 */
export function createAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
