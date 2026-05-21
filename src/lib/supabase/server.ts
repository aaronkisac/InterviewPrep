import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import { requireEnv } from "@/lib/env";

/**
 * Server-side Supabase client bound to the user's session via Next cookies.
 * Use this in Server Components, Route Handlers, and Server Actions.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — Next disallows writes.
            // The middleware refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  );
}
