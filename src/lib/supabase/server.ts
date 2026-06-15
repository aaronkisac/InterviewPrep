import { createHmac } from "node:crypto";

import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import { auth } from "@/lib/auth";
import { requireEnv } from "@/lib/env";

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/**
 * Mint a short-lived, Supabase-compatible JWT (HS256, signed with the project
 * JWT secret) for the authenticated NextAuth user. PostgREST verifies it and
 * resolves `auth.uid()` / `auth.role()`, so the owner RLS policies on
 * user-owned tables enforce ownership at the database layer.
 *
 * Auth here is NextAuth (not Supabase Auth), so there is no Supabase session
 * cookie to bind to — we bridge the identity by signing this token ourselves.
 */
function mintSupabaseToken(userId: string): string {
  const secret = requireEnv("SUPABASE_JWT_SECRET");
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      sub: userId,
      role: "authenticated",
      aud: "authenticated",
      iat: now,
      // Short-lived: the token only needs to outlive a single request.
      exp: now + 60 * 60,
    }),
  );
  const data = `${header}.${payload}`;
  const signature = base64url(createHmac("sha256", secret).update(data).digest());
  return `${data}.${signature}`;
}

/**
 * Server-side Supabase client bound to the user's session via a minted
 * Supabase JWT. Use this in Server Components, Route Handlers, and Server
 * Actions for any user-owned table so RLS enforces ownership. For guests
 * (no session) it falls back to the anonymous client.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const userId = (await auth().catch(() => null))?.user?.id;
  const accessToken = userId ? mintSupabaseToken(userId) : undefined;

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
      // Authenticated requests carry a Bearer token so PostgREST resolves
      // auth.uid(); guests get the default anon key only.
      ...(accessToken
        ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
        : {}),
    },
  );
}
